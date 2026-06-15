#!/usr/bin/env python3
"""Example usage of the SuperInstance agent caching system.

This example demonstrates how to reuse agent sessions to reduce model spin-up costs
and improve performance.
"""

import os
import time
from superinstance import get_agent, get_default_cache

# Set your DeepInfra API key (optional, for LLM capabilities)
# os.environ["DEEPINFRA_API_KEY"] = "your-api-key-here"

def example_basic_caching():
    """Basic example of caching and reusing agents."""
    print("=== Basic Agent Caching Example ===\n")
    
    # First agent creation (will spin up new agent)
    start = time.time()
    agent1 = get_agent("researcher")
    print(f"First agent creation: {time.time() - start:.2f}s")
    print(f"Agent name: {agent1.name}\n")
    
    # Second request for the same agent (will reuse from cache)
    start = time.time()
    agent2 = get_agent("researcher")
    print(f"Subsequent agent request: {time.time() - start:.2f}s")
    print(f"Same object? {agent1 is agent2}\n")
    
    # Use the agent
    agent1.remember("User prefers detailed technical reports")
    response = agent1.ask("What does the user prefer?")
    print(f"Agent response: {response}\n")

def example_multiple_agents():
    """Work with multiple cached agents."""
    print("=== Multiple Cached Agents Example ===\n")
    
    agent_names = ["writer", "coder", "translator", "researcher"]
    
    # Create multiple agents
    for name in agent_names:
        start = time.time()
        agent = get_agent(name)
        print(f"Created {name} in {time.time() - start:.2f}s")
    
    # Get cache stats
    cache = get_default_cache()
    stats = cache.stats()
    print(f"\nCache size: {stats['size']} (max: {stats['max_size']})")
    print(f"Cached agents: {', '.join(stats['entries'])}\n")
    
    # Reuse one of the agents
    start = time.time()
    coder = get_agent("coder")
    print(f"Reused coder agent in {time.time() - start:.2f}s\n")

def example_custom_ttl_size():
    """Example with custom cache size and TTL."""
    print("=== Custom Cache Configuration Example ===\n")
    
    from superinstance.agent_cache import AgentCache
    
    # Create a small cache with 5 minute TTL
    small_cache = AgentCache(max_size=10, default_ttl=300)
    
    # Create agents with this cache
    for i in range(15):
        agent = get_agent(f"worker-{i}", cache=small_cache)
        print(f"Created worker-{i}")
    
    stats = small_cache.stats()
    print(f"\nAfter creating 15 agents, cache size: {stats['size']} (evicted least recently used)\n")

def example_with_llm():
    """Example using caching with LLM-powered agents."""
    print("=== LLM Agent Caching Example ===\n")
    
    if not os.environ.get("DEEPINFRA_API_KEY"):
        print("Skipping LLM example: DEEPINFRA_API_KEY not set")
        print("Set the environment variable to try this example\n")
        return
    
    # Create a research agent that uses LLM
    agent = get_agent("science-researcher")
    
    # First ask (cold start, will spin up agent and run LLM)
    print("First question to agent...")
    start = time.time()
    response1 = agent.ask("Explain quantum computing in simple terms")
    print(f"First response time: {time.time() - start:.2f}s")
    print(f"Response: {response1[:200]}...\n")
    
    # Same question again (warm cache, reuse agent, no LLM spin-up)
    print("Second identical question...")
    start = time.time()
    response2 = agent.ask("Explain quantum computing in simple terms")
    print(f"Second response time: {time.time() - start:.2f}s\n")
    
    # Clear the cache
    # get_default_cache().clear()

def main():
    print("SuperInstance Agent Caching System Examples\n")
    print("=" * 50 + "\n")
    
    example_basic_caching()
    print("-" * 50 + "\n")
    
    example_multiple_agents()
    print("-" * 50 + "\n")
    
    example_custom_ttl_size()
    print("-" * 50 + "\n")
    
    example_with_llm()
    
    print("\n=" * 50)
    print("All examples completed!")
    print("Key benefits:")
    print("- Reuse agent sessions to avoid model spin-up overhead")
    print("- Reduce API calls to LLM providers")
    print("- Improve response times for repeated requests")
    print("- Thread-safe LRU cache with TTL eviction")

if __name__ == "__main__":
    main()
