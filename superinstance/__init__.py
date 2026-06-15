"""SuperInstance Python SDK.

Client library for persistent, multi-agent systems.
"""

from __future__ import annotations

from .agent import Agent
from .fleet import Fleet
from .memory import AgentMemory
from .exceptions import SuperInstanceError, AgentNotFoundError, FleetConnectionError
from .agent_cache import AgentCache, get_default_cache, get_agent, get_cached_agent

__version__ = "0.1.0"
__all__ = [
    "Agent",
    "Fleet",
    "AgentMemory",
    "SuperInstanceError",
    "AgentNotFoundError",
    "FleetConnectionError",
    "AgentCache",
    "get_default_cache",
    "get_agent",
    "get_cached_agent",
]
