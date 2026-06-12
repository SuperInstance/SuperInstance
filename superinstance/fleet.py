"""Fleet orchestration for coordinating multiple agents."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .agent import Agent, AgentConfig
from .exceptions import AgentNotFoundError


@dataclass
class FleetStatus:
    """Status of the fleet."""
    total_agents: int = 0
    active_agents: int = 0
    total_memories: int = 0
    agents: list[dict[str, Any]] = field(default_factory=list)


@dataclass
class SpectralBalance:
    """Result of a spectral balance check."""
    gap: float = 0.0
    dominant_agent: str = ""
    eigenvalues: list[float] = field(default_factory=list)


class Fleet:
    """Orchestrates multiple agents with shared memory.
    
    Example:
        >>> fleet = Fleet("my_team")
        >>> scout = fleet.create_agent("scout", tags=["research"])
        >>> writer = fleet.create_agent("writer", tags=["content"])
        >>> fleet.broadcast("New project started")
    """

    def __init__(self, name: str, memory_dir: str | None = None):
        self.name = name
        self.memory_dir = memory_dir
        self._agents: dict[str, Agent] = {}
        self._tags: dict[str, list[str]] = {}

    def create_agent(
        self,
        name: str,
        model: str = "default",
        tags: list[str] | None = None,
        tools: list[str] | None = None,
    ) -> Agent:
        """Create a new agent in the fleet."""
        if name in self._agents:
            raise ValueError(f"Agent '{name}' already exists")
        
        config = AgentConfig(name=name, model=model, tags=tags or [], tools=tools or [])
        agent = Agent(name, memory_dir=self.memory_dir, config=config)
        self._agents[name] = agent
        self._tags[name] = tags or []
        return agent

    def get_agent(self, name: str) -> Agent:
        """Retrieve an agent by name."""
        if name not in self._agents:
            raise AgentNotFoundError(f"Agent '{name}' not found in fleet '{self.name}'")
        return self._agents[name]

    def list_agents(self, tag: str | None = None) -> list[Agent]:
        """List agents, optionally filtered by tag."""
        if tag is None:
            return list(self._agents.values())
        return [self._agents[n] for n, t in self._tags.items() if tag in t]

    def broadcast(self, message: str, tag: str | None = None) -> dict[str, str]:
        """Broadcast a message to agents."""
        agents = self.list_agents(tag)
        responses = {}
        for agent in agents:
            agent.remember(f"Broadcast received: {message}", "system")
            responses[agent.name] = f"Acknowledged: {message}"
        return responses

    def status(self) -> FleetStatus:
        """Get fleet status."""
        total_memories = sum(a.memory.stats()["entries"] for a in self._agents.values())
        return FleetStatus(
            total_agents=len(self._agents),
            active_agents=len(self._agents),
            total_memories=total_memories,
            agents=[a.status() for a in self._agents.values()],
        )

    def add_agent(self, agent: Agent) -> None:
        """Add an existing agent to the fleet."""
        if agent.name in self._agents:
            raise ValueError(f"Agent '{agent.name}' already exists")
        self._agents[agent.name] = agent
        self._tags[agent.name] = agent.config.tags if agent.config else []

    def dispatch(self, task: str) -> str:
        """Dispatch a task to the best-suited agent (first available).
        
        In production, this routes based on capability spectral profiles.
        """
        if not self._agents:
            return "No agents available to dispatch task."
        agent = next(iter(self._agents.values()))
        agent.remember(f"Dispatched task: {task}", "tasks")
        return f"Dispatched '{task}' to {agent.name}"

    def spectral_balance(self) -> SpectralBalance:
        """Compute the spectral balance of the fleet.
        
        Returns a SpectralBalance with placeholder values.
        In production, this uses eigenvalue decomposition of the
        agent-resource matrix.
        """
        if not self._agents:
            return SpectralBalance()
        names = list(self._agents.keys())
        return SpectralBalance(
            gap=0.42,
            dominant_agent=names[0],
            eigenvalues=[len(self._agents)],
        )

    def remove_agent(self, name: str) -> None:
        """Remove an agent from the fleet."""
        if name not in self._agents:
            raise AgentNotFoundError(f"Agent '{name}' not found")
        del self._agents[name]
        del self._tags[name]

    def __len__(self) -> int:
        return len(self._agents)

    def __contains__(self, name: str) -> bool:
        return name in self._agents

    def __repr__(self) -> str:
        return f"Fleet({self.name!r}, agents={len(self._agents)})"
