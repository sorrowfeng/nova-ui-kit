#include "nova_backend.h"

#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <string>

static thread_local std::string nova_last_response;

static std::string json_escape(const std::string& value) {
    std::string out;
    out.reserve(value.size() + 8);
    for (char ch : value) {
        switch (ch) {
            case '\\': out += "\\\\"; break;
            case '"': out += "\\\""; break;
            case '\n': out += "\\n"; break;
            case '\r': out += "\\r"; break;
            case '\t': out += "\\t"; break;
            default: out += ch; break;
        }
    }
    return out;
}

// Minimal JSON number/string field extraction (demo scope).
static std::string extract_string(const std::string& json, const std::string& key) {
    const std::string needle = "\"" + key + "\"";
    auto pos = json.find(needle);
    if (pos == std::string::npos) return "";
    pos = json.find(':', pos);
    if (pos == std::string::npos) return "";
    pos = json.find('"', pos);
    if (pos == std::string::npos) return "";
    auto end = json.find('"', pos + 1);
    if (end == std::string::npos) return "";
    return json.substr(pos + 1, end - pos - 1);
}

static double extract_number(const std::string& json, const std::string& key, double fallback) {
    const std::string needle = "\"" + key + "\"";
    auto pos = json.find(needle);
    if (pos == std::string::npos) return fallback;
    pos = json.find(':', pos);
    if (pos == std::string::npos) return fallback;
    pos = json.find_first_of("-0123456789", pos);
    if (pos == std::string::npos) return fallback;
    return std::strtod(json.c_str() + pos, nullptr);
}

extern "C" const char* nova_backend_version() {
    nova_last_response = "0.1.0";
    return nova_last_response.c_str();
}

extern "C" const char* nova_backend_process(const char* request_json) {
    const std::string request = request_json ? request_json : "";
    const std::string method = extract_string(request, "method");
    const std::string id = extract_string(request, "id");

    if (method.empty() || method == "health" || method == "ping") {
        nova_last_response =
            "{\"success\":true,\"message\":\"C++ FFI backend is healthy.\",\"patch\":{},"
            "\"result\":{\"ok\":true,\"version\":\"0.1.0\"}";
        if (!id.empty()) nova_last_response += ",\"id\":\"" + json_escape(id) + "\"";
        nova_last_response += "}";
        return nova_last_response.c_str();
    }

    if (method == "add") {
        const double a = extract_number(request, "a", 0.0);
        const double b = extract_number(request, "b", 0.0);
        char sum[64];
        std::snprintf(sum, sizeof(sum), "%.17g", a + b);
        nova_last_response =
            std::string("{\"success\":true,\"message\":\"add ok\",\"patch\":{},\"result\":{\"sum\":") + sum + "}";
        if (!id.empty()) nova_last_response += ",\"id\":\"" + json_escape(id) + "\"";
        nova_last_response += "}";
        return nova_last_response.c_str();
    }

    if (method == "echo") {
        const std::string value = extract_string(request, "value");
        nova_last_response =
            "{\"success\":true,\"message\":\"echo ok\",\"patch\":{},\"result\":{\"echo\":\"" + json_escape(value) + "\"}";
        if (!id.empty()) nova_last_response += ",\"id\":\"" + json_escape(id) + "\"";
        nova_last_response += "}";
        return nova_last_response.c_str();
    }

    nova_last_response =
        "{\"success\":false,\"message\":\"Unknown method: " + json_escape(method) +
        ". Available: health, ping, add, echo\",\"patch\":{}";
    if (!id.empty()) nova_last_response += ",\"id\":\"" + json_escape(id) + "\"";
    nova_last_response += "}";
    return nova_last_response.c_str();
}
