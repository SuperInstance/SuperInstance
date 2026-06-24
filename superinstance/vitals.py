"""Fleet Vital Signs — the diagnostic surface for γ + η = C.

Every AI fleet has a problem you cannot see: agents that churn cost (γ)
without producing value (η). This module makes the invisible visible and
*actionable*. It reads a :class:`~superinstance.conservation.ConservationLedger`
and renders, for every agent, a conservation gauge and a verdict:

    FEED   — healthy (η ≥ γ): give it more work.
    WATCH  — slipping (value lags cost): keep an eye on it.
    KILL   — burning (cost dwarfs value, or γ rising while η flat): intervene.

This is a diagnostic tool, not a vanity metric. Run it on a live fleet:

    >>> from superinstance import Fleet
    >>> fleet = Fleet("pod")
    >>> _ = fleet.create_agent("scout")
    >>> _ = fleet.ledger.record("scout", gamma=1000, eta=1500)
    >>> print(fleet.vitals().diagnose().headline)
    1 healthy · 0 watch · 0 burning
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum

from .conservation import Budget, ConservationLedger

# ANSI colors — only emitted when rendering in color mode.
_GREEN = "\033[92m"
_YELLOW = "\033[93m"
_RED = "\033[91m"
_BOLD = "\033[1m"
_DIM = "\033[2m"
_RESET = "\033[0m"


class Status(Enum):
    """An agent's conservation health."""
    HEALTHY = "healthy"
    WATCH = "watch"
    BURNING = "burning"


class Action(Enum):
    """The recommended operator action for an agent."""
    FEED = "FEED"    # productive — give it more work
    WATCH = "WATCH"  # slipping — observe
    KILL = "KILL"    # burning — intervene now


# Status → (symbol, action, color) for rendering.
_STYLE = {
    Status.HEALTHY: ("✅", Action.FEED, _GREEN),
    Status.WATCH: ("⚠️ ", Action.WATCH, _YELLOW),
    Status.BURNING: ("🔥", Action.KILL, _RED),
}


@dataclass
class AgentVital:
    """One agent's vital sign: budget, status, and recommended action."""
    name: str
    budget: Budget
    status: Status
    burning_trend: bool  # γ rising while η flat — the acute warning

    @property
    def action(self) -> Action:
        return _STYLE[self.status][1]

    @property
    def efficiency(self) -> float:
        """η / C — the fraction of budget that became value (0.0–1.0)."""
        return self.budget.efficiency

    def gauge(self, width: int = 24) -> str:
        """A bar split into value (η) and cost (γ) — green vs red at render."""
        if self.budget.total <= 0:
            return "·" * width
        eta_blocks = round(width * self.efficiency)
        eta_blocks = max(0, min(width, eta_blocks))
        return "█" * eta_blocks + "░" * (width - eta_blocks)


@dataclass
class Diagnosis:
    """The fleet-wide verdict: who to feed, watch, and kill."""
    fleet: Budget
    feed: list[str] = field(default_factory=list)
    watch: list[str] = field(default_factory=list)
    kill: list[str] = field(default_factory=list)

    @property
    def headline(self) -> str:
        return (
            f"{len(self.feed)} healthy · "
            f"{len(self.watch)} watch · "
            f"{len(self.kill)} burning"
        )

    @property
    def fleet_efficiency(self) -> float:
        return self.fleet.efficiency

    @property
    def healthy(self) -> bool:
        """The fleet is healthy when nothing is burning and η ≥ γ overall."""
        return not self.kill and self.fleet.efficiency >= 0.5


class FleetVitals:
    """Computes and renders Fleet Vital Signs from a conservation ledger.

    Thresholds are on efficiency = η / C:
      - ``healthy_threshold`` (default 0.5): η ≥ γ → HEALTHY.
      - ``watch_threshold`` (default 0.3): below this → BURNING.
      - in between → WATCH.
    An acute burn trend (γ rising while η flat) forces BURNING regardless.
    """

    def __init__(
        self,
        ledger: ConservationLedger,
        healthy_threshold: float = 0.5,
        watch_threshold: float = 0.3,
    ):
        self.ledger = ledger
        self.healthy_threshold = healthy_threshold
        self.watch_threshold = watch_threshold

    @classmethod
    def from_fleet(cls, fleet, **kwargs) -> FleetVitals:
        """Build vitals from a :class:`~superinstance.fleet.Fleet`."""
        return cls(fleet.ledger, **kwargs)

    def _agent_ids(self) -> list[str]:
        return list(self.ledger._entries.keys())

    def vital(self, agent_id: str) -> AgentVital:
        """The vital sign for a single agent."""
        budget = self.ledger.budget(agent_id)
        burning_trend = self.ledger.is_burning(agent_id)
        eff = budget.efficiency

        if burning_trend or (budget.total > 0 and eff < self.watch_threshold):
            status = Status.BURNING
        elif budget.total == 0 or eff < self.healthy_threshold:
            status = Status.WATCH
        else:
            status = Status.HEALTHY

        return AgentVital(
            name=agent_id,
            budget=budget,
            status=status,
            burning_trend=burning_trend,
        )

    def vitals(self) -> list[AgentVital]:
        """All vitals, worst-first (burning agents surface to the top)."""
        order = {Status.BURNING: 0, Status.WATCH: 1, Status.HEALTHY: 2}
        vits = [self.vital(a) for a in self._agent_ids()]
        return sorted(vits, key=lambda v: (order[v.status], v.efficiency))

    def diagnose(self) -> Diagnosis:
        """The actionable fleet verdict."""
        d = Diagnosis(fleet=self.ledger.fleet_budget())
        for v in self.vitals():
            if v.status is Status.BURNING:
                d.kill.append(v.name)
            elif v.status is Status.WATCH:
                d.watch.append(v.name)
            else:
                d.feed.append(v.name)
        return d

    def render(self, color: bool = True, width: int = 24) -> str:
        """Render the vital-signs dashboard as text (optionally ANSI-colored)."""
        def paint(s: str, code: str) -> str:
            return f"{code}{s}{_RESET}" if color else s

        vits = self.vitals()
        name_w = max((len(v.name) for v in vits), default=5)
        name_w = max(name_w, 5)

        lines = [paint(f"{_BOLD}Fleet Vital Signs — γ + η = C", _BOLD) if color
                 else "Fleet Vital Signs — γ + η = C"]
        lines.append("")

        for v in vits:
            symbol, action, ccode = _STYLE[v.status]
            bar = paint(v.gauge(width), ccode)
            trend = paint(" ⤴ burning", _RED) if v.burning_trend else ""
            stats = (
                f"η={v.budget.eta:>7.0f} γ={v.budget.gamma:>7.0f} "
                f"eff={v.efficiency:>4.2f}"
            )
            verdict = paint(f"{symbol} {action.value:<5}", ccode)
            stats_out = paint(stats, _DIM) if color else stats
            lines.append(
                f"  {v.name:<{name_w}}  {bar}  {stats_out}  {verdict}{trend}"
            )

        d = self.diagnose()
        lines.append("")
        fleet_code = _GREEN if d.healthy else _RED
        lines.append(
            f"  {paint('FLEET', _BOLD) if color else 'FLEET'}      "
            f"efficiency={d.fleet_efficiency:.2f}   "
            f"{paint(d.headline, fleet_code)}"
        )
        if d.kill:
            lines.append(
                "  " + paint(f"→ intervene on: {', '.join(d.kill)}", _RED)
            )
        return "\n".join(lines)


def _demo_ledger() -> ConservationLedger:
    """A seeded fleet that shows one healthy, one slipping, one burning agent."""
    ledger = ConservationLedger()
    # Scout: efficient — produces more value than it spends.
    ledger.record("scout", gamma=1000, eta=1600, label="found 4 sources")
    ledger.record("scout", gamma=900, eta=1500, label="ranked them")
    # Drafter: slipping — value lags cost but not yet burning.
    ledger.record("drafter", gamma=1500, eta=900, label="outline")
    ledger.record("drafter", gamma=1600, eta=850, label="draft")
    # Rewriter: burning — γ climbs every pass while η falls.
    ledger.record("rewriter", gamma=1200, eta=600, label="rewrite 1")
    ledger.record("rewriter", gamma=2000, eta=400, label="rewrite 2")
    ledger.record("rewriter", gamma=2800, eta=250, label="rewrite 3")
    return ledger


def main() -> None:
    """Console entry point (``si-vitals``): render a seeded vital-signs demo."""
    print(FleetVitals(_demo_ledger()).render(color=True))


if __name__ == "__main__":
    main()
