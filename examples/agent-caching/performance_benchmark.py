#!/usr/bin/env python3
"""Performance benchmark for agent caching system."""

import time
from superinstance import get_agent, get_default_cache

def benchmark_cold_starts(agent_count: int = 50):
    """Benchmark cold start time without caching."""
    print(f"Benchmarking {agent_count} cold agent starts...")
    
    # Clear cache first
    get_default_cache().clear()
    
    start_time = time.time()
    for i in range(agent_count):
        agent = get_agent(f"cold-agent-{i}")
    elapsed = time.time() - start_time
    
    print(f"✓ {agent_count} cold starts completed in {elapsed:.2f}s")
    print(f"  Average time per agent: {elapsed/agent_count:.4f}s\n")
    return elapsed

def benchmark_cached_requests(request_count: int = 1000):
    """Benchmark cached agent reuse."""
    print(f"Benchmarking {request_count} cached agent requests...")
    
    # Pre-populate cache
    for i in range(100):
        get_agent(f"cached-agent-{i}")
    
    # Now measure cached accesses
    start_time = time.time()
    hits = 0
    for i in range(request_count):
        # Rotate through the cached agents
        agent = get_agent(f"cached-agent-{i % 100}")
        hits += 1
    elapsed = time.time() - start_time
    
    print(f"✓ {request_count} cached requests completed in {elapsed:.2f}s")
    print(f"  Average time per request: {elapsed/request_count:.6f}s")
    print(f"  Total throughput: {request_count/elapsed:.1f} requests/sec\n")
    return elapsed

def main():
    print("=== SuperInstance Agent Caching Performance Benchmark ===\n")
    
    # Run benchmarks
    cold_time = benchmark_cold_starts(50)
    cached_time = benchmark_cached_requests(1000)
    
    # Calculate savings
    print("=== Performance Results ===")
    print(f"Cold start average: {cold_time/50:.4f}s per agent")
    print(f"Cached access average: {cached_time/1000:.6f}s per request")
    print(f"\n🚀 Cached access is { (cold_time/50) / (cached_time/1000):.1f}x faster!")
    print("\nThis demonstrates the significant cost savings from reusing agent sessions!")
    
    # Show cache stats
    stats = get_default_cache().stats()
    print(f"\nFinal cache stats: {stats['size']} agents cached")

if __name__ == "__main__":
    main()
