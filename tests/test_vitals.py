"""Tests for Fleet Vital Signs — the killer-app diagnostic surface."""

from superinstance import ConservationLedger, Fleet, FleetVitals
from superinstance.vitals import Action, Status, _demo_ledger


def _ledger(**agents):
    """Build a ledger from {agent: [(gamma, eta), ...]}."""
    led = ConservationLedger()
    for name, entries in agents.items():
        for gamma, eta in entries:
            led.record(name, gamma=gamma, eta=eta)
    return led


class TestStatusClassification:
    def test_healthy_when_value_exceeds_cost(self):
        v = FleetVitals(_ledger(scout=[(1000, 1600)])).vital("scout")
        assert v.status is Status.HEALTHY
        assert v.action is Action.FEED

    def test_watch_when_value_lags_cost(self):
        # efficiency 0.4 — below healthy (0.5), above watch (0.3)
        v = FleetVitals(_ledger(drafter=[(1500, 1000)])).vital("drafter")
        assert v.status is Status.WATCH
        assert v.action is Action.WATCH

    def test_burning_when_cost_dwarfs_value(self):
        # efficiency 0.2 — below watch threshold
        v = FleetVitals(_ledger(waster=[(800, 200)])).vital("waster")
        assert v.status is Status.BURNING
        assert v.action is Action.KILL

    def test_burning_trend_forces_kill_even_if_efficiency_ok(self):
        # γ rises every step while η falls — acute burn, flagged regardless.
        led = _ledger(rewriter=[(1000, 1100), (2000, 1000), (3000, 900)])
        v = FleetVitals(led).vital("rewriter")
        assert v.burning_trend is True
        assert v.status is Status.BURNING

    def test_thresholds_are_configurable(self):
        led = _ledger(a=[(1000, 1000)])  # efficiency exactly 0.5
        strict = FleetVitals(led, healthy_threshold=0.6).vital("a")
        assert strict.status is Status.WATCH
        lenient = FleetVitals(led, healthy_threshold=0.5).vital("a")
        assert lenient.status is Status.HEALTHY


class TestDiagnosis:
    def test_partitions_agents_into_actions(self):
        led = _ledger(
            scout=[(1000, 1600)],      # healthy
            drafter=[(1500, 1000)],    # watch
            waster=[(800, 200)],       # burning
        )
        d = FleetVitals(led).diagnose()
        assert d.feed == ["scout"]
        assert d.watch == ["drafter"]
        assert d.kill == ["waster"]

    def test_headline_counts(self):
        d = FleetVitals(_demo_ledger()).diagnose()
        assert d.headline == "1 healthy · 1 watch · 1 burning"

    def test_fleet_unhealthy_when_anything_burns(self):
        d = FleetVitals(_ledger(waster=[(900, 100)])).diagnose()
        assert d.healthy is False
        assert "waster" in d.kill

    def test_fleet_healthy_when_all_efficient(self):
        d = FleetVitals(_ledger(a=[(100, 200)], b=[(100, 300)])).diagnose()
        assert d.healthy is True
        assert d.kill == []


class TestVitalsOrdering:
    def test_worst_first(self):
        led = _ledger(
            good=[(1000, 2000)],
            bad=[(900, 100)],
            mid=[(1500, 1000)],
        )
        names = [v.name for v in FleetVitals(led).vitals()]
        assert names[0] == "bad"        # burning surfaces to the top
        assert names[-1] == "good"      # healthy sinks to the bottom


class TestGauge:
    def test_gauge_width_and_fill(self):
        v = FleetVitals(_ledger(a=[(0, 100)])).vital("a")  # efficiency 1.0
        bar = v.gauge(width=10)
        assert len(bar) == 10
        assert bar == "█" * 10

    def test_gauge_empty_budget(self):
        led = ConservationLedger()
        led.record("a", gamma=0, eta=0)
        bar = FleetVitals(led).vital("a").gauge(width=8)
        assert len(bar) == 8


class TestRender:
    def test_plain_render_has_no_ansi(self):
        out = FleetVitals(_demo_ledger()).render(color=False)
        assert "\033[" not in out
        assert "Fleet Vital Signs" in out
        assert "KILL" in out
        assert "FEED" in out
        assert "intervene on: rewriter" in out

    def test_color_render_has_ansi(self):
        out = FleetVitals(_demo_ledger()).render(color=True)
        assert "\033[" in out


class TestFleetIntegration:
    def test_fleet_vitals_round_trip(self, tmp_path):
        fleet = Fleet("pod", memory_dir=tmp_path)
        fleet.create_agent("scout")
        fleet.ledger.record("scout", gamma=1000, eta=1500)
        vitals = fleet.vitals()
        assert isinstance(vitals, FleetVitals)
        assert vitals.diagnose().feed == ["scout"]
