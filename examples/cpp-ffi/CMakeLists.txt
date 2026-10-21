cmake_minimum_required(VERSION 3.20)
project(nova_cpp_ffi_sample LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_library(nova_backend SHARED src/nova_backend.cpp)
target_include_directories(nova_backend PUBLIC include)
target_compile_definitions(nova_backend PRIVATE NOVA_BACKEND_EXPORTS)
set_target_properties(nova_backend PROPERTIES
  OUTPUT_NAME "nova_backend"
  RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin"
  LIBRARY_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin"
  ARCHIVE_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/lib"
)

# CLI harness that loads the shared library and exercises the ABI.
add_executable(nova_backend_demo src/demo_main.cpp)
target_include_directories(nova_backend_demo PRIVATE include)
target_link_libraries(nova_backend_demo PRIVATE nova_backend)
set_target_properties(nova_backend_demo PROPERTIES
  RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin"
)
