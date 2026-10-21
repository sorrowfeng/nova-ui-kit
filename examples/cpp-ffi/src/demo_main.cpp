// Nova C++ FFI demo harness — calls nova_backend_process over the extern "C" ABI.
#include "nova_backend.h"

#include <cstdio>
#include <cstring>
#include <string>

static int failures = 0;

static void expect_contains(const char* label, const char* actual, const char* needle) {
    if (actual && std::strstr(actual, needle)) {
        std::printf("  ok   %s\n", label);
    } else {
        std::printf("  FAIL %s\n    actual: %s\n    need:   %s\n", label, actual ? actual : "(null)", needle);
        failures += 1;
    }
}

int main(int argc, char** argv) {
    const char* version = nova_backend_version();
    std::printf("nova_backend version: %s\n", version ? version : "(null)");

    struct Case {
        const char* label;
        const char* request;
        const char* expect;
    };

    const Case cases[] = {
        {"health", "{\"method\":\"health\",\"id\":\"h1\"}", "\"success\":true"},
        {"add", "{\"method\":\"add\",\"params\":{\"a\":2,\"b\":40},\"id\":\"m1\"}", "\"sum\":42"},
        {"echo", "{\"method\":\"echo\",\"params\":{\"value\":\"Nova\"},\"id\":\"m2\"}", "\"echo\":\"Nova\""},
        {"unknown", "{\"method\":\"nope\",\"id\":\"m3\"}", "\"success\":false"},
    };

    std::printf("Running ABI cases:\n");
    for (const auto& testCase : cases) {
        const char* response = nova_backend_process(testCase.request);
        expect_contains(testCase.label, response, testCase.expect);
        std::printf("       %s\n", response ? response : "(null)");
    }

    if (argc > 1) {
        // Pass a raw JSON request as argv[1] for ad-hoc calls.
        std::printf("Custom: %s\n", nova_backend_process(argv[1]));
    }

    if (failures == 0) {
        std::printf("C++ FFI demo PASSED\n");
        return 0;
    }
    std::printf("C++ FFI demo FAILED (%d)\n", failures);
    return 1;
}
