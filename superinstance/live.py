"""Live fleet readout from the `fleet-metrics` HTTP service.

`si-vitals` renders a seeded demo by default. Point it at a running
`fleet-metrics` reporter (`cargo run -p fleet-metrics`, default
``http://127.0.0.1:8902``) and it renders the **live** fleet instead.

The Rust service reports an energy-conservation model: a fleet-wide health
score γ, per-agent deviation η (absolute z-scores from the fleet mean), and
the agents flagged anomalous (|z| over the configured threshold). This module
fetches `GET /metrics`, parses it faithfully, and renders that live state —
the same γ + η = C law, viewed as energy balance + anomaly detection.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from .exceptions import FleetConnectionError

# ANSI colors (shared palette with vitals.py).
_GREEN = "\033[92m"
_YELLOW = "\033[93m"
_RED = "\033[91m"
_BOLD = "\033[1m"
_DIM = "\033[2m"
_RESET = "\033[0m"

DEFAULT_URL = "http://127.0.0.1:8902"


@dataclass
class LiveSnapshot:
    """A parsed `GET /metrics` reading from the fleet-metrics service."""
    gamma: float                       # fleet conservation health, 0.0–1.0
    eta: list[float]                   # per-agent deviation (abs z-scores)
    target_c: float                    # target conservation constant C
    total_energy: float                # current total fleet energy
    mean_energy: float
    std_dev: float
    anomalous_agents: list[int] = field(default_factory=list)
    law_holds: bool = False
    timestamp: str = ""

    @property
    def agent_count(self) -> int:
        return len(self.eta)

    @property
    def energy_delta(self) -> float:
        """How far the current total has drifted from the target C."""
        return self.total_energy - self.target_c

    @classmethod
    def from_response(cls, payload: dict) -> LiveSnapshot:
        """Parse the `{status, data, timestamp}` envelope the service returns."""
        data = payload.get("data", payload)
        return cls(
            gamma=float(data.get("gamma", 0.0)),
            eta=[float(x) for x in data.get("eta", [])],
            target_c=float(data.get("target_c", 0.0)),
            total_energy=float(data.get("total_energy", 0.0)),
            mean_energy=float(data.get("mean_energy", 0.0)),
            std_dev=float(data.get("std_dev", 0.0)),
            anomalous_agents=[int(i) for i in data.get("anomalous_agents", [])],
            law_holds=bool(data.get("law_holds", False)),
            timestamp=str(payload.get("timestamp", data.get("timestamp", ""))),
        )


def fetch_snapshot(url: str = DEFAULT_URL, timeout: float = 5.0) -> LiveSnapshot:
    """Fetch and parse a live snapshot from a fleet-metrics service.

    Raises :class:`~superinstance.exceptions.FleetConnectionError` if the
    service is unreachable or returns something unparseable.
    """
    import httpx

    endpoint = url.rstrip("/") + "/metrics"
    try:
        resp = httpx.get(endpoint, timeout=timeout)
        resp.raise_for_status()
        payload = resp.json()
    except httpx.HTTPError as e:
        raise FleetConnectionError(
            f"Could not reach fleet-metrics at {endpoint}: {e}. "
            f"Is the reporter running?  (cargo run -p fleet-metrics)"
        ) from e
    except ValueError as e:  # JSON decode
        raise FleetConnectionError(f"Bad response from {endpoint}: {e}") from e

    return LiveSnapshot.from_response(payload)


def render_live(snap: LiveSnapshot, url: str = DEFAULT_URL, color: bool = True) -> str:
    """Render a live fleet snapshot as a vital-signs dashboard."""
    def paint(s: str, code: str) -> str:
        return f"{code}{s}{_RESET}" if color else s

    def bar(frac: float, width: int = 20) -> str:
        frac = max(0.0, min(1.0, frac))
        filled = round(width * frac)
        return "█" * filled + "░" * (width - filled)

    anomalous = set(snap.anomalous_agents)
    health_code = _GREEN if snap.gamma >= 0.66 else _YELLOW if snap.gamma >= 0.33 else _RED

    lines = []
    title = "Fleet Vital Signs — LIVE"
    lines.append(paint(f"{_BOLD}{title}", _BOLD) if color else title)
    lines.append(paint(f"{url}  ·  γ + η = C", _DIM) if color else f"{url}  ·  γ + η = C")
    lines.append("")

    lines.append(
        f"  Fleet γ (health)   {snap.gamma:>5.2f}  {paint(bar(snap.gamma), health_code)}"
    )
    delta = snap.energy_delta
    delta_code = _GREEN if abs(delta) < 1e-6 else _RED
    lines.append(
        f"  Energy             {snap.total_energy:>8.1f} / {snap.target_c:.1f}  "
        f"(Δ {paint(f'{delta:+.1f}', delta_code)})"
    )
    lines.append(f"  Spread (σ)         {snap.std_dev:>8.2f}")
    law = paint("✅ holds", _GREEN) if snap.law_holds else paint("❌ violated", _RED)
    lines.append(f"  Law γ + η ≈ C      {law}")
    lines.append("")

    # Per-agent deviation, scaled against the largest deviation present.
    peak = max(snap.eta, default=0.0) or 1.0
    idx_w = max(len(str(snap.agent_count - 1)), 1)
    for i, dev in enumerate(snap.eta):
        is_anom = i in anomalous
        code = _RED if is_anom else _GREEN
        flag = paint("  🔥 ANOMALY", _RED) if is_anom else ""
        lines.append(
            f"  agent {i:>{idx_w}}   {paint(bar(dev / peak, 16), code)}  "
            f"η={dev:>5.2f}{flag}"
        )

    lines.append("")
    n_anom = len(anomalous)
    if n_anom:
        targets = ", ".join(str(i) for i in sorted(anomalous))
        lines.append(
            f"  {paint(f'{n_anom} of {snap.agent_count} agents anomalous', _RED)}"
            f"  →  intervene on: {paint(targets, _RED)}"
        )
    else:
        lines.append(
            f"  {paint(f'all {snap.agent_count} agents within tolerance', _GREEN)}"
        )
    return "\n".join(lines)
