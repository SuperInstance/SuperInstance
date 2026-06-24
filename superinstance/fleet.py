"""Fleet orchestration for coordinating multiple agents."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .agent import Agent, AgentConfig
from .conservation import ConservationLedger
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
    """Result of a spectral balance check.

    The fleet is modelled as a weighted coupling graph: each agent's
    self-weight is its memory mass, and two agents are coupled by the
    number of tags they share. ``gap`` is the spectral gap (λ₁ − λ₂) of
    that graph — large gap means one cohort dominates coordination; small
    gap means influence is evenly spread.
    """
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
        self.ledger = ConservationLedger()

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

    def dispatch(self, task: str, tag: str | None = None) -> str:
        """Route a task to the best-suited agent and bill it on the ledger.

        Selection is by load: among candidates (optionally filtered by
        ``tag``), the agent with the lightest current γ + η budget wins, so
        work spreads instead of piling onto one agent. The dispatch itself
        is recorded as generation cost (γ) on the fleet's conservation
        ledger — value (η) is credited later as the task produces results.
        """
        candidates = self.list_agents(tag)
        if not candidates:
            return "No agents available to dispatch task."

        # Pick the least-loaded agent by current budget total (C = γ + η).
        agent = min(candidates, key=lambda a: self.ledger.budget(a.name).total)
        agent.remember(f"Dispatched task: {task}", "tasks")
        # A dispatch costs γ up front; η accrues when the task pays off.
        self.ledger.record(agent.name, gamma=1.0, eta=0.0, label=f"dispatch: {task}")
        return f"Dispatched '{task}' to {agent.name}"

    def spectral_balance(self) -> SpectralBalance:
        """Compute the spectral gap of the fleet's coupling graph.

        Builds a symmetric coupling matrix M where the diagonal is each
        agent's memory mass (entries + 1) and off-diagonal M[i][j] is the
        number of tags agents i and j share. The two largest eigenvalues
        are found by power iteration with deflation; ``gap`` is λ₁ − λ₂ and
        ``dominant_agent`` is the agent with the largest weight in the
        leading eigenvector.
        """
        names = list(self._agents.keys())
        n = len(names)
        if n == 0:
            return SpectralBalance()
        if n == 1:
            mass = float(self._agents[names[0]].memory.stats()["entries"] + 1)
            return SpectralBalance(gap=mass, dominant_agent=names[0], eigenvalues=[mass])

        # Build the coupling matrix.
        tags = [set(self._tags.get(name, [])) for name in names]
        matrix = [[0.0] * n for _ in range(n)]
        for i, name in enumerate(names):
            matrix[i][i] = float(self._agents[name].memory.stats()["entries"] + 1)
            for j in range(i + 1, n):
                shared = float(len(tags[i] & tags[j]))
                matrix[i][j] = shared
                matrix[j][i] = shared

        lambda1, vec1 = _power_iteration(matrix)
        deflated = _deflate(matrix, lambda1, vec1)
        lambda2, _ = _power_iteration(deflated)

        dominant_idx = max(range(n), key=lambda k: abs(vec1[k]))
        return SpectralBalance(
            gap=abs(lambda1) - abs(lambda2),
            dominant_agent=names[dominant_idx],
            eigenvalues=[lambda1, lambda2],
        )

    def audit(self):
        """Run the conservation auditor over the fleet (γ + η = C).

        Returns an :class:`~superinstance.conservation.AuditReport` with
        per-agent budgets, overall efficiency, and any agents that are
        burning γ without producing η. Record work via ``fleet.ledger``.
        """
        return self.ledger.audit()

    def vitals(self):
        """Fleet Vital Signs — the diagnostic surface over the ledger.

        Returns a :class:`~superinstance.vitals.FleetVitals` you can
        ``.diagnose()`` (who to feed/watch/kill) or ``.render()`` as a
        conservation-gauge dashboard.
        """
        from .vitals import FleetVitals
        return FleetVitals.from_fleet(self)

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


def _power_iteration(
    matrix: list[list[float]],
    iterations: int = 100,
    tol: float = 1e-9,
) -> tuple[float, list[float]]:
    """Dominant eigenvalue (Rayleigh quotient) and unit eigenvector.

    Pure-Python power iteration — no numpy dependency. Returns ``(0.0, e0)``
    for a zero matrix.
    """
    n = len(matrix)
    vec = [1.0 / (n ** 0.5)] * n  # normalized start
    eigenvalue = 0.0
    for _ in range(iterations):
        nxt = [sum(matrix[i][j] * vec[j] for j in range(n)) for i in range(n)]
        norm = sum(x * x for x in nxt) ** 0.5
        if norm < tol:
            return 0.0, [1.0] + [0.0] * (n - 1)
        nxt = [x / norm for x in nxt]
        # Rayleigh quotient vᵀMv for the current estimate.
        mv = [sum(matrix[i][j] * nxt[j] for j in range(n)) for i in range(n)]
        new_eigenvalue = sum(nxt[i] * mv[i] for i in range(n))
        if abs(new_eigenvalue - eigenvalue) < tol:
            return new_eigenvalue, nxt
        eigenvalue, vec = new_eigenvalue, nxt
    return eigenvalue, vec


def _deflate(
    matrix: list[list[float]],
    eigenvalue: float,
    eigenvector: list[float],
) -> list[list[float]]:
    """Hotelling deflation: subtract λ·vvᵀ so the next power iteration
    converges to the second-largest eigenvalue."""
    n = len(matrix)
    return [
        [matrix[i][j] - eigenvalue * eigenvector[i] * eigenvector[j] for j in range(n)]
        for i in range(n)
    ]
