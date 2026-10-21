# Python Local-Service Sidecar Sample (E4)

Runnable sample for Nova backend integration (`kind: local-service`, `language: python`).

## Layout

```text
examples/python-local-service/
  service.py        # stdio JSON sidecar (no third-party deps)
  sample-requests.jsonl
  README.md
```

## Quick start

```bash
# health
python service.py --health

# list methods
python service.py --methods

# call a method
echo '{"method":"add","params":{"a":2,"b":40},"id":"1"}' | python service.py
# -> {"success":true,"message":"add ok","patch":{},"result":{"sum":42},"id":"1"}
```

PowerShell:

```powershell
python .\service.py --health
'{\"method\":\"upper\",\"params\":{\"text\":\"nova\"}}' | python .\service.py
```

## Wire into Nova

1. Project → Logic → **Add backend integration**
   - kind: `local-service`
   - language: `python`
   - command: `python service.py` (or absolute path)
   - health check: `python service.py --health`
2. Create a method (e.g. `add`) with request schema `{ "a": number, "b": number }`.
3. Run method test in Logic → status `passed/failed/skipped`.
4. Bind a UI event to the backend method.

## Protocol

| Field | Type | Meaning |
|-------|------|---------|
| `method` | string | method name |
| `params` | object | arguments |
| `id` | string? | correlation id |
| `success` | bool | response |
| `message` | string | human summary |
| `patch` | object | optional state patch |
| `result` | object? | method payload |

Generate a starter copy (create-only, will not overwrite your edits) from a Nova project that has a Python sidecar integration.

See also: [docs/backend-integration.md](../../docs/backend-integration.md).
