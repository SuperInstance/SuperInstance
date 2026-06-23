"""Tests for the conservation law: γ + η = C."""

import math

import pytest

from superinstance import Budget, ConservationLedger
from superinstance.conservation import AuditReport


class TestBudget:
    def test_total_is_gamma_plus_eta(self):
        b = Budget(gamma=300, eta=700)
        assert b.total == 1000  # C = γ + η

    def test_ratio(self):
        assert Budget(gamma=600, eta=300).ratio == 2.0

    def test_ratio_zero_eta_is_infinite(self):
        assert Budget(gamma=5, eta=0).ratio == float("inf")

    def test_efficiency(self):
        assert Budget(gamma=400, eta=600).efficiency == 0.6

    def test_efficiency_empty_budget(self):
        assert Budget().efficiency == 0.0

    def test_add(self):
        combined = Budget(100, 200) + Budget(50, 50)
        assert combined.gamma == 150
        assert combined.eta == 250


class TestConservationLedger:
    def test_record_and_budget(self):
        ledger = ConservationLedger()
        ledger.record("scout", gamma=1200, eta=900, label="search")
        ledger.record("scout", gamma=800, eta=1100, label="extract")
        b = ledger.budget("scout")
        assert b.gamma == 2000
        assert b.eta == 2000
        assert b.total == 4000
        assert math.isclose(b.efficiency, 0.5)

    def test_negative_values_rejected(self):
        ledger = ConservationLedger()
        with pytest.raises(ValueError):
            ledger.record("scout", gamma=-1, eta=0)

    def test_unknown_agent_has_empty_budget(self):
        ledger = ConservationLedger()
        assert ledger.budget("ghost").total == 0.0

    def test_fleet_budget_aggregates(self):
        ledger = ConservationLedger()
        ledger.record("a", gamma=100, eta=100)
        ledger.record("b", gamma=200, eta=300)
        fleet = ledger.fleet_budget()
        assert fleet.gamma == 300
        assert fleet.eta == 400
        assert fleet.total == 700

    def test_history_preserves_order(self):
        ledger = ConservationLedger()
        ledger.record("a", 1, 1, label="first")
        ledger.record("a", 2, 2, label="second")
        labels = [e.label for e in ledger.history("a")]
        assert labels == ["first", "second"]

    def test_is_burning_detects_churn(self):
        # γ climbs every step while η falls — classic burn.
        ledger = ConservationLedger(burn_window=3)
        ledger.record("burner", gamma=100, eta=100)
        ledger.record("burner", gamma=200, eta=80)
        ledger.record("burner", gamma=300, eta=50)
        assert ledger.is_burning("burner") is True

    def test_is_not_burning_when_value_keeps_pace(self):
        ledger = ConservationLedger(burn_window=3)
        ledger.record("healthy", gamma=100, eta=100)
        ledger.record("healthy", gamma=120, eta=200)
        ledger.record("healthy", gamma=140, eta=300)
        assert ledger.is_burning("healthy") is False

    def test_is_not_burning_with_too_few_entries(self):
        ledger = ConservationLedger(burn_window=3)
        ledger.record("a", gamma=100, eta=10)
        ledger.record("a", gamma=200, eta=10)
        assert ledger.is_burning("a") is False

    def test_audit_report(self):
        ledger = ConservationLedger(burn_window=3)
        ledger.record("efficient", gamma=100, eta=900)
        ledger.record("burner", gamma=100, eta=100)
        ledger.record("burner", gamma=200, eta=80)
        ledger.record("burner", gamma=300, eta=50)
        report = ledger.audit()
        assert isinstance(report, AuditReport)
        assert "burner" in report.burning
        assert report.healthiest == "efficient"
        assert report.fleet.total > 0
