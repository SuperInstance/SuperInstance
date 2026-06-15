#!/usr/bin/env python3
"""Basic example showing how to use the agent caching system."""

import time
from superinstance import get_agent, AgentConfig

def main():
    print("=== SuperInstance Agent Caching Basic Example ===\n")
    
    # Example 1: Basic caching
    print("1. Basic caching demonstration")
    print("Getting agent 'researcher' for the first time (cold start)...")
    start = time.time()
    agent1 = get_agent("researcher", model="deepseek-ai/DeepSeek-V4-Flash")
    print(f"✓ Agent created in {time.time() - start:.2f}s")
    
    print("\nGetting agent 'researcher' again (should reuse cached instance)...")
    start = time.time()
    agent2 = get_agent("researcher")
    print(f"✓ Agent retrieved in {time.time() - start:.4f}s")
    
    print(f"\n✅ Both agents are the same instance: {agent1 is agent2}")
    
    # Example 2: Config object usage
    print("\n\n2. Using AgentConfig with caching")
    config = AgentConfig(
        name="data-analyst",
        model="gpt-4o",
        temperature=0.1,
        tools=["search", "calculate"]
    )
    
    print("Creating cached agent from config...")
    analyst1 = get_agent(config)
    print(f"✓ Agent '{analyst1.name}' created with model '{analyst1.config.model}'")
    
    print("\nRetrieving the same agent via config...")
    analyst2 = get_agent(config)
    print(f"✅ Agents are the same instance: {analyst1 is analyst2}")
    
    # Example 3: Custom TTL
    print("\n\n3. Custom TTL configuration")
    print("Creating agent with 30-second TTL...")
    short_lived = get_agent("short-lived", ttl=30)
    print(f"✓ Agent 'short-lived' created with 30s TTL")
    
    # Example 4: Multiple cache instances
    print("\n\n4. Multiple isolated cache instances")
    from superinstance import AgentCache
    
    # Separate caches for different models
    gpt_cache = AgentCache(default_ttl=3600)
    claude_cache = AgentCache(default_ttl=7200)
    
    print("Creating agents in separate caches...")
    gpt_agent = get_agent("api-agent", cache=gpt_cache, model="gpt-4o")
    claude_agent = get_agent("api-agent", cache=claude_cache, model="claude-3-sonnet")
    
    print(f"✅ GPT cache has: {gpt_cache.stats()['entries']}")
    print(f"✅ Claude cache has: {claude_cache.stats()['entries']}")
    
    # Example 5: Cache stats
    print("\n\n5. Cache statistics")
    stats = get_default_cache().stats()
    print(f"Default cache stats:")
    print(f"  Current size: {stats['size']}")
    print(f"  Max size: {stats['max_size']}")
    
    print("\n✅ All examples completed successfully!")
    print("\nNotice the dramatic performance improvement when reusing cached agents!")

if __name__ == "__main__":
    main()
