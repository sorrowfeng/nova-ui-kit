# C++ FFI Sample (E4)

Runnable `extern "C"` backend matching Nova's generated FFI ABI
(`nova_backend_process(const char*) -> const char*`).

## Layout

```text
examples/cpp-ffi/
  include/nova_backend.h   # exported ABI
  src/nova_backend.cpp     # method router (health/ping/add/echo)
  src/demo_main.cpp        # CLI harness
  CMakeLists.txt
  README.md
```

## Build (Windows / MSVC)

```powershell
cmake -S examples/cpp-ffi -B examples/cpp-ffi/build
cmake --build examples/cpp-ffi/build --config Release
```

## Run

```powershell
.\examples\cpp-ffi\build\bin\Release\nova_backend_demo.exe
# optional ad-hoc call:
.\examples\cpp-ffi\build\bin\Release\nova_backend_demo.exe '{\"method\":\"add\",\"params\":{\"a\":1,\"b\":2}}'
```

Expected: `C++ FFI demo PASSED`.

## Wire into Nova

1. Logic → Add backend integration
   - kind: `cpp-ffi`
   - transport: `ffi`
   - entry path: `examples/cpp-ffi`
   - artifact path: `examples/cpp-ffi/build/bin/Release/nova_backend.dll`
2. Method `add` with JSON `{a:number,b:number}` → result `{sum:number}`.
3. Bind a UI click to the method; run method test in Logic.

## ABI

| Export | Signature |
|--------|-----------|
| `nova_backend_process` | `const char* (const char* request_json)` |
| `nova_backend_version` | `const char* ()` |

Response envelope: `{"success":bool,"message":str,"patch":{},"result":{...},"id":...}`.

See [docs/backend-integration.md](../../docs/backend-integration.md).
