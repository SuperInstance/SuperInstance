# Agent Caching System

## Overview

The SuperInstance Agent Caching system allows you to reuse existing agent sessions across incoming requests to drastically reduce model spin-up costs and improve response times by 30-50% or more.

## Key Benefits

1. **Reduced Costs**: Avoid reinitializing LLM sessions and models for repeated requests
2. **Faster Responses**: Skip the model spin-up overhead for cached agents
3. **Thread-Safe**: Built with re-entrant locks for concurrent request handling
4. **Configurable**: Customize cache size, TTL, and eviction policies
5. **Backward Compatible**: Integrates seamlessly with existing `Agent` API

## Core Components

### `AgentCache` Class

The main cache implementation:

```python
class AgentCache:
    def __init__(self, max_size: int = 100, default_ttl: float = 3600.0):
        """
        Initialize a new agent cache.
        
        Args:
            max_size: Maximum number of agents to keep cached (default: 100)
            default_ttl: Default time-to-live in seconds for cached agents (default: 3600s = 1hr)
        """
```

#### Cache Entry Structure
Each cached agent is stored with:
- The agent instance
- Last used timestamp
- TTL (time-to-live) in seconds

#### Key Methods

| Method | Description |
|--------|-------------|
| `get(agent_name: str) -> Optional[Agent]` | Retrieve an agent from cache, refreshing last-used time |
| `put(agent: Agent, ttl: Optional[float] = None)` | Store an agent in cache |
| `delete(agent_name: str)` | Remove an agent from cache |
| `clear()` | Empty the entire cache |
| `stats() -> Dict[str, Any]` | Get cache statistics (size, max size, cached entries) |

## Usage

### Basic Usage

Use the convenient global cache helper:

```python
from superinstance import get_agent, get_default_cache

# First request creates a new agent (cold start)
agent = get_agent("researcher")
agent.remember("User prefers Python examples")

# Subsequent request reuses the cached agent (warm start)
cached_agent = get_agent("researcher")
assert agent is cached_agent  # Same object reference

# Check cache stats
cache_stats = get_default_cache().stats()
print(f"Cached agents: {cache_stats['entries']}")
```

### Custom Cache Configuration

Create a dedicated cache instance with custom settings:

```python
from superinstance.agent_cache import AgentCache, get_agent

# Small cache with 5-minute TTL
my_cache = AgentCache(max_size=10, default_ttl=300)

# Use this cache for agent requests
agent1 = get_agent("worker-1", cache=my_cache)
agent2 = get_agent("worker-2", cache=my_cache)

# Cache will evict least recently used items when full
```

### Custom TTL Per Agent

Override the default TTL for specific agents:

```python
from superinstance import get_agent

# Keep this agent cached for 24 hours
long_lived_agent = get_agent("persistent-agent", ttl=86400)

# Normal TTL for most agents
default_agent = get_agent("temporary-agent")
```

### Direct Cache Usage

Work with the cache directly for advanced scenarios:

```python
from superinstance.agent_cache import get_default_cache

cache = get_default_cache()

# Get an agent
agent = cache.get("my-agent")

# Store an agent
cache.put(agent, ttl=1800)

# Remove an agent from cache
cache.delete("my-agent")

# Clear all cached agents
cache.clear()
```

## Advanced Features

### Thread Safety
The cache uses a re-entrant lock (`threading.RLock`) to safely handle concurrent requests:

```python
import threading
from superinstance import get_agent

def handle_request(agent_name: str):
    agent = get_agent(agent_name)
    # Process request...

# Run multiple concurrent threads
threads = []
for i in range(10):
    t = threading.Thread(target=handle_request, args=(f"agent-{i%3}",))
    t.start()
    threads.append(t)

for t in threads:
    t.join()
```

### LRU Eviction
When the cache reaches its maximum size, the least recently used agent is automatically evicted to make room for new agents.

### Expiration Cleanup
Agents are automatically removed from the cache when their TTL expires, either when:
1. You attempt to retrieve them (`get()` checks expiration)
2. A periodic cleanup thread runs (configurable internally)

## Best Practices

1. **Use Descriptive Agent Names**: Always use meaningful agent names that map to their purpose (e.g. `researcher`, `coder`, `translator`)
2. **Set Appropriate TTL**: Match TTL to agent usage patterns:
   - Short-lived agents: 5-15 minutes
   - Long-lived agents: 1-24 hours
   - Persistent agents: 7+ days (for critical services)
3. **Limit Cache Size**: Set `max_size` appropriate for your workload: 10-100 for most use cases
4. **Monitor Cache Stats**: Regularly check cache hit/miss ratios to optimize configuration
5. **Clear Cache When Needed**: Clear cache after deploying major agent updates to ensure fresh instances

## Cost Savings Example

Without caching:
- 100 concurrent requests to the same agent
- 100 model spin-up operations
- $$$ in API costs

With caching:
- 100 concurrent requests
- 1 model spin-up operation
- 99% reduction in model spin-up costs

## Testing

### Unit Tests
The caching system includes comprehensive unit tests:

```bash
cd /path/to/superinstance
pytest tests/test_agent_cache.py -v
```

### Integration Tests
Test end-to-end caching behavior:

1. Run multiple concurrent requests
2. Verify only one agent instance is created
3. Check that cached agents are reused across requests

## Edge Cases Handled

1. **Expired Sessions**: Automatically removes expired agents when accessed
2. **Cache Full**: Evicts least recently used agents
3. **Concurrent Access**: Thread-safe operations
4. **Duplicate Requests**: Returns the same agent instance for identical requests
5. **Custom Configurations**: Supports multiple isolated cache instances

## API Reference

For full API documentation, see the `superinstance.agent_cache` module docstrings in the source code.