#pragma once

#ifdef _WIN32
  #ifdef NOVA_BACKEND_EXPORTS
    #define NOVA_BACKEND_API __declspec(dllexport)
  #else
    #define NOVA_BACKEND_API __declspec(dllimport)
  #endif
#else
  #define NOVA_BACKEND_API
#endif

// Nova C++ FFI ABI: one entry point, JSON in / JSON out.
// request:  {"method":"...","params":{...},"id":"..."}
// response: {"success":bool,"message":str,"patch":{},"result":{...},"id":...}
extern "C" {
NOVA_BACKEND_API const char* nova_backend_process(const char* request_json);
NOVA_BACKEND_API const char* nova_backend_version();
}
