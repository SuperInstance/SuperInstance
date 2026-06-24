"""SuperInstance Python SDK.

Client library for persistent, multi-agent systems.
"""

from __future__ import annotations

from .agent import Agent
from .agent_cache import AgentCache, get_agent, get_cached_agent, get_default_cache
from .conservation import AuditReport, Budget, ConservationLedger, Entry
from .exceptions import AgentNotFoundError, FleetConnectionError, SuperInstanceError
from .fleet import Fleet
from .live import LiveSnapshot, fetch_snapshot, render_live
from .memory import AgentMemory
from .vitals import Action, AgentVital, Diagnosis, FleetVitals, Status

__version__ = "0.1.1"
__all__ = [
    "Agent",
    "Fleet",
    "AgentMemory",
    "Budget",
    "ConservationLedger",
    "AuditReport",
    "Entry",
    "FleetVitals",
    "AgentVital",
    "Diagnosis",
    "Status",
    "Action",
    "LiveSnapshot",
    "fetch_snapshot",
    "render_live",
    "SuperInstanceError",
    "AgentNotFoundError",
    "FleetConnectionError",
    "AgentCache",
    "get_default_cache",
    "get_agent",
    "get_cached_agent",
]
