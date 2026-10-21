#!/usr/bin/env python3
"""Nova UI Editor — Python local-service sidecar sample (workflow E4).

Protocol (stdio JSON lines, one request per invocation):
  request:  {"method": "...", "params": {...}, "id": "..."}
  response: {"success": bool, "message": str, "patch": {...}, "result": ..., "id": ...}

Health check:
  python service.py --health

Methods:
  health  / ping
  echo
  add
  upper
"""

from __future__ import annotations

import json
import sys
from typing import Any


def write_json(value: dict[str, Any]) -> None:
    sys.stdout.write(json.dumps(value, separators=(",", ":")) + "\n")
    sys.stdout.flush()


def method_health(_params: dict[str, Any]) -> dict[str, Any]:
    return {"ok": True, "service": "nova-python-local-service", "version": "0.1.0"}


def method_ping(_params: dict[str, Any]) -> dict[str, Any]:
    return {"pong": True}


def method_echo(params: dict[str, Any]) -> dict[str, Any]:
    return {"echo": params.get("value", params)}


def method_add(params: dict[str, Any]) -> dict[str, Any]:
    try:
        a = float(params.get("a", 0))
        b = float(params.get("b", 0))
    except (TypeError, ValueError) as error:
        raise ValueError(f"add expects numeric a/b: {error}") from error
    return {"sum": a + b}


def method_upper(params: dict[str, Any]) -> dict[str, Any]:
    text = str(params.get("text", ""))
    return {"text": text.upper()}


METHODS = {
    "health": method_health,
    "ping": method_ping,
    "echo": method_echo,
    "add": method_add,
    "upper": method_upper,
}


def handle(request: dict[str, Any]) -> dict[str, Any]:
    request_id = request.get("id")
    name = str(request.get("method", "health"))
    params = request.get("params") or {}
    if not isinstance(params, dict):
        params = {"value": params}

    handler = METHODS.get(name)
    if handler is None:
        return {
            "success": False,
            "message": f"Unknown method: {name}. Available: {', '.join(sorted(METHODS))}",
            "patch": {},
            "id": request_id,
        }

    try:
        result = handler(params)
        return {
            "success": True,
            "message": f"{name} ok",
            "patch": {},
            "result": result,
            "id": request_id,
        }
    except Exception as error:  # noqa: BLE001 — surface as protocol error
        return {
            "success": False,
            "message": str(error),
            "patch": {},
            "id": request_id,
        }


def main(argv: list[str]) -> int:
    if "--health" in argv or "--methods" in argv:
        if "--methods" in argv:
            write_json({"success": True, "methods": sorted(METHODS), "patch": {}})
        else:
            write_json({"success": True, "message": "Python sidecar is healthy.", "patch": {}})
        return 0

    raw = sys.stdin.read().strip()
    try:
        request = json.loads(raw) if raw else {"method": "health"}
        if not isinstance(request, dict):
            raise ValueError("request must be a JSON object")
    except Exception as error:  # noqa: BLE001
        write_json({"success": False, "message": f"Invalid request JSON: {error}", "patch": {}})
        return 1

    response = handle(request)
    write_json(response)
    return 0 if response.get("success") else 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
