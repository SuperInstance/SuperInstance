"""Reusable agent caching system to reduce model spin-up costs."""

from __future__ import annotations

import time
import threading
from dataclasses import dataclass, field
from typing import Any, Dict, Optional, Callable
from collections import OrderedDict

from .agent import Agent, AgentConfig


@dataclass
class CacheEntry:
    """Cache entry for stored agents."""
    agent: Agent
    last_used: float = field(default_factory=time.time)
    ttl: float = 3600.0  # Default TTL: 1 hour


class AgentCache:
    """Thread-safe LRU cache for agent instances with TTL eviction."""
    
    def __init__(self, max_size: int = 100, default_ttl: float = 3600.0):
        """Initialize the agent cache.
        
        Args:
            max_size: Maximum number of agents to keep in cache
            default_ttl: Default TTL in seconds for cached agents
        """
        self._max_size = max_size
        self._default_ttl = default_ttl
        self._cache: OrderedDict[str, CacheEntry] = OrderedDict()
        self._lock = threading.RLock()
    
    def get(self, agent_name: str) -> Optional[Agent]:
        """Get an agent from the cache, refreshing its last used time.
        
        Args:
            agent_name: Name of the agent to retrieve
            
        Returns:
            The cached agent or None if not found/expired
        """
        with self._lock:
            entry = self._cache.get(agent_name)
            if not entry:
                return None
                
            # Check if entry has expired
            if time.time() - entry.last_used > entry.ttl:
                del self._cache[agent_name]
                return None
                
            # Move to end to mark as recently used
            self._cache.move_to_end(agent_name)
            entry.last_used = time.time()
            return entry.agent
    
    def put(self, agent: Agent, ttl: Optional[float] = None) -> None:
        """Store an agent in the cache.
        
        Args:
            agent: The agent instance to cache
            ttl: Optional TTL in seconds (uses default if not provided)
        """
        with self._lock:
            # Evict least recently used if cache is full
            if len(self._cache) >= self._max_size:
                self._cache.popitem(last=False)
                
            self._cache[agent.name] = CacheEntry(
                agent=agent,
                ttl=ttl or self._default_ttl
            )
    
    def delete(self, agent_name: str) -> None:
        """Remove an agent from the cache."""
        with self._lock:
            if agent_name in self._cache:
                del self._cache[agent_name]
    
    def clear(self) -> None:
        """Clear the entire cache."""
        with self._lock:
            self._cache.clear()
    
    def stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        with self._lock:
            return {
                "size": len(self._cache),
                "max_size": self._max_size,
                "entries": list(self._cache.keys())
            }


# Global cache instance for easy use
_default_cache: Optional[AgentCache] = None

def get_default_cache() -> AgentCache:
    """Get the default global agent cache instance."""
    global _default_cache
    if _default_cache is None:
        _default_cache = AgentCache()
    return _default_cache


def get_agent(
    name: str | AgentConfig,
    *,
    cache: Optional[AgentCache] = None,
    ttl: Optional[float] = None,
    **kwargs
) -> Agent:
    """Get or create an agent, using the cache to reuse existing instances.
    
    Reduces model spin-up costs by reusing already-initialized agent sessions.
    
    Args:
        name: Agent name or AgentConfig instance
        cache: Cache instance to use (uses default global cache if not provided)
        ttl: TTL in seconds for the cached agent
        **kwargs: Additional kwargs passed to Agent constructor
        
    Returns:
        Existing or newly created agent instance
    """
    cache = cache or get_default_cache()
    
    # Extract agent name from config if needed
    if isinstance(name, AgentConfig):
        agent_name = name.name
    else:
        agent_name = name
        
    # Try to get from cache first
    agent = cache.get(agent_name)
    
    if agent is not None:
        return agent
        
    # Create new agent if not found
    agent = Agent(name, **kwargs)
    cache.put(agent, ttl=ttl)
    return agent


# Convenience aliases
get_cached_agent = get_agent