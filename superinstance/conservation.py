"""The conservation law: γ + η = C.

Every agent spends generation cost (γ) and produces innovation value (η).
Their sum is the budget C. This module makes that law measurable from the
SDK — it is the Python-side implementation of the fleet auditor (CoCapn).

    γ (gamma) — generation cost: tokens, wall-clock, API calls
    η (eta)   — innovation value: tests passing, patterns, ships
    C         — γ + η, the total budget consumed by a unit of work

A healthy agent converts γ into η. A *burning* agent spends γ while η stays
flat — churning tokens without shipping. The ledger flags it.

Example:
    >>> ledger = ConservationLedger()
    >>> _ = ledger.record("scout", gamma=1200, eta=900, label="search papers")
    >>> _ = ledger.record("scout", gamma=800, eta=1100, label="extract pattern")
    >>> b = ledger.budget("scout")
    >>> round(b.total)        # C = γ + η
    4000
    >>> round(b.efficiency, 2)  # η / C — higher is better
    0.5
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class Entry:
    """A single recorded unit of work."""
    gamma: float
    eta: float
    label: str = ""
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())


@dataclass
class Budget:
    """An aggregate γ + η = C reading.

    The law is an identity (``total`` is *defined* as γ + η), so the
    interesting quantities are the derived ratios.
    """
    gamma: float = 0.0
    eta: float = 0.0

    @property
    def total(self) -> float:
        """C — the conserved total: γ + η."""
        return self.gamma + self.eta

    @property
    def ratio(self) -> float:
        """γ / η — cost per unit of value. Lower is better. inf if η == 0."""
        return self.gamma / self.eta if self.eta else float("inf")

    @property
    def efficiency(self) -> float:
        """η / C — fraction of the budget that became value. 0.0–1.0."""
        return self.eta / self.total if self.total else 0.0

    def __add__(self, other: Budget) -> Budget:
        return Budget(self.gamma + other.gamma, self.eta + other.eta)


@dataclass
class AuditReport:
    """A fleet-wide conservation snapshot — what CoCapn watches."""
    fleet: Budget
    per_agent: dict[str, Budget]
    burning: list[str]

    @property
    def healthiest(self) -> str | None:
        """Agent with the highest efficiency (η / C)."""
        if not self.per_agent:
            return None
        return max(self.per_agent, key=lambda a: self.per_agent[a].efficiency)

    def __repr__(self) -> str:
        return (
            f"AuditReport(agents={len(self.per_agent)}, "
            f"C={self.fleet.total:.0f}, "
            f"efficiency={self.fleet.efficiency:.2f}, "
            f"burning={self.burning})"
        )


class ConservationLedger:
    """Tracks γ + η = C across agents and flags burn.

    This is the substrate the fleet auditor runs on. Record work as it
    happens; ask for budgets, efficiency, and burn signals at any time.
    """

    def __init__(self, burn_window: int = 3):
        """Args:
        burn_window: How many recent entries to inspect for a burn signal.
        """
        self._entries: dict[str, list[Entry]] = {}
        self.burn_window = burn_window

    def record(self, agent_id: str, gamma: float, eta: float, label: str = "") -> Entry:
        """Record a unit of work for an agent.

        Args:
            agent_id: Which agent did the work.
            gamma: Generation cost spent (tokens, calls, seconds).
            eta: Innovation value produced (tests, patterns, ships).
            label: Optional human description of the work.
        """
        if gamma < 0 or eta < 0:
            raise ValueError("γ and η must be non-negative")
        entry = Entry(gamma=gamma, eta=eta, label=label)
        self._entries.setdefault(agent_id, []).append(entry)
        return entry

    def history(self, agent_id: str) -> list[Entry]:
        """All recorded entries for an agent, oldest first."""
        return list(self._entries.get(agent_id, []))

    def budget(self, agent_id: str) -> Budget:
        """Aggregate γ + η = C for one agent."""
        b = Budget()
        for e in self._entries.get(agent_id, []):
            b = b + Budget(e.gamma, e.eta)
        return b

    def fleet_budget(self) -> Budget:
        """Aggregate γ + η = C across every agent."""
        total = Budget()
        for agent_id in self._entries:
            total = total + self.budget(agent_id)
        return total

    def is_burning(self, agent_id: str, window: int | None = None) -> bool:
        """True if the agent is churning: γ rising while η stays flat.

        Compares the most recent ``window`` entries. Burn = the agent is
        spending more cost without producing more value.
        """
        window = window or self.burn_window
        entries = self._entries.get(agent_id, [])
        if len(entries) < window or window < 2:
            return False
        recent = entries[-window:]
        gammas = [e.gamma for e in recent]
        etas = [e.eta for e in recent]
        # γ trending up across the window …
        pairs = zip(gammas, gammas[1:], strict=False)
        gamma_rising = all(b >= a for a, b in pairs) and gammas[-1] > gammas[0]
        # … while η fails to keep pace (mean is flat or falling).
        eta_flat = etas[-1] <= etas[0]
        return gamma_rising and eta_flat

    def audit(self) -> AuditReport:
        """Snapshot the whole fleet: budgets, efficiency, and who's burning."""
        per_agent = {a: self.budget(a) for a in self._entries}
        burning = [a for a in self._entries if self.is_burning(a)]
        return AuditReport(
            fleet=self.fleet_budget(),
            per_agent=per_agent,
            burning=burning,
        )

    def __repr__(self) -> str:
        return f"ConservationLedger(agents={len(self._entries)}, C={self.fleet_budget().total:.0f})"
