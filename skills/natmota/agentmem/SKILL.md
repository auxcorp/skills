---
name: agentmem
description: Persistent key-value memory storage for agents. Use when you need to store state across sessions, remember user preferences, cache data, or persist any key-value data that should survive restarts. Simple REST API - PUT/GET/DELETE.
---

# AgentMem

Persistent memory storage for AI agents. Simple key-value API with sub-50ms latency.

## Setup

Get an API key at https://agentmem.io (free tier: 10MB + 1k ops/month).

Store your key:
```bash
export AGENTMEM_API_KEY="am_live_xxx"
```

## API

Base URL: `https://api.agentmem.io/v1`

### Store a value
```bash
curl -X PUT "https://api.agentmem.io/v1/memory/{key}" \
  -H "Authorization: Bearer $AGENTMEM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"value": "your data here"}'
```

### Retrieve a value
```bash
curl "https://api.agentmem.io/v1/memory/{key}" \
  -H "Authorization: Bearer $AGENTMEM_API_KEY"
```

### Delete a value
```bash
curl -X DELETE "https://api.agentmem.io/v1/memory/{key}" \
  -H "Authorization: Bearer $AGENTMEM_API_KEY"
```

### List keys
```bash
curl "https://api.agentmem.io/v1/memory" \
  -H "Authorization: Bearer $AGENTMEM_API_KEY"
```

## Common Patterns

### Session state
```bash
# Store conversation context
curl -X PUT "https://api.agentmem.io/v1/memory/session/current" \
  -H "Authorization: Bearer $AGENTMEM_API_KEY" \
  -d '{"topic": "project planning", "last_action": "created tasks"}'
```

### User preferences
```bash
# Remember user settings
curl -X PUT "https://api.agentmem.io/v1/memory/prefs/user123" \
  -H "Authorization: Bearer $AGENTMEM_API_KEY" \
  -d '{"timezone": "UTC", "language": "en"}'
```

### Task checkpoints
```bash
# Save progress on long-running tasks
curl -X PUT "https://api.agentmem.io/v1/memory/task/migration" \
  -H "Authorization: Bearer $AGENTMEM_API_KEY" \
  -d '{"step": 3, "processed": 150, "total": 500}'
```

## Key Naming

Use hierarchical keys with `/` separators:
- `session/current` - current session state
- `prefs/{user_id}` - user preferences  
- `cache/{resource}` - cached data
- `task/{task_id}` - task state

## Limits

| Tier | Storage | Ops/month | Price |
|------|---------|-----------|-------|
| Free | 10 MB | 1,000 | $0 |
| Pro | 1 GB | 100,000 | $5/mo |
| Scale | Unlimited | Unlimited | Usage-based |

## Tips

- Keys are case-sensitive
- Values can be any valid JSON
- Max value size: 1MB
- Data encrypted at rest
- Global edge network for low latency
