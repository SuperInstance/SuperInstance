"""Tests for the live fleet-metrics readout (si-vitals --url)."""

import pytest

from superinstance import LiveSnapshot, render_live
from superinstance.exceptions import FleetConnectionError
from superinstance.live import DEFAULT_URL, fetch_snapshot
from superinstance.vitals import main

# A sample of the real `GET /metrics` envelope from the Rust service.
SAMPLE = {
    "status": "success",
    "data": {
        "gamma": 0.97,
        "eta": [0.58, 0.58, 0.58, 1.73],
        "target_c": 800.0,
        "total_energy": 800.0,
        "mean_energy": 200.0,
        "std_dev": 173.2,
        "anomalous_agents": [3],
        "law_holds": True,
    },
    "timestamp": "2026-06-24T05:00:00Z",
}


class TestParsing:
    def test_from_response_unwraps_envelope(self):
        snap = LiveSnapshot.from_response(SAMPLE)
        assert snap.gamma == 0.97
        assert snap.eta == [0.58, 0.58, 0.58, 1.73]
        assert snap.target_c == 800.0
        assert snap.anomalous_agents == [3]
        assert snap.law_holds is True
        assert snap.timestamp == "2026-06-24T05:00:00Z"

    def test_agent_count_and_delta(self):
        snap = LiveSnapshot.from_response(SAMPLE)
        assert snap.agent_count == 4
        assert snap.energy_delta == 0.0

    def test_energy_delta_drift(self):
        payload = {"data": {**SAMPLE["data"], "total_energy": 850.0}}
        snap = LiveSnapshot.from_response(payload)
        assert snap.energy_delta == 50.0

    def test_missing_fields_default_safely(self):
        snap = LiveSnapshot.from_response({"data": {}})
        assert snap.eta == []
        assert snap.agent_count == 0
        assert snap.law_holds is False


class TestRender:
    def test_plain_render(self):
        out = render_live(LiveSnapshot.from_response(SAMPLE), color=False)
        assert "\033[" not in out
        assert "Fleet Vital Signs — LIVE" in out
        assert "ANOMALY" in out
        assert "intervene on: 3" in out
        assert "holds" in out

    def test_color_render_has_ansi(self):
        out = render_live(LiveSnapshot.from_response(SAMPLE), color=True)
        assert "\033[" in out

    def test_no_anomalies_message(self):
        payload = {"data": {**SAMPLE["data"], "anomalous_agents": []}}
        out = render_live(LiveSnapshot.from_response(payload), color=False)
        assert "within tolerance" in out
        assert "ANOMALY" not in out

    def test_violated_law_shown(self):
        payload = {"data": {**SAMPLE["data"], "law_holds": False}}
        out = render_live(LiveSnapshot.from_response(payload), color=False)
        assert "violated" in out


class _FakeResponse:
    def __init__(self, payload):
        self._payload = payload

    def raise_for_status(self):
        pass

    def json(self):
        return self._payload


class TestFetch:
    def test_fetch_parses_service_response(self, monkeypatch):
        import httpx

        captured = {}

        def fake_get(url, timeout=None):
            captured["url"] = url
            return _FakeResponse(SAMPLE)

        monkeypatch.setattr(httpx, "get", fake_get)
        snap = fetch_snapshot("http://localhost:9999/")
        # Trailing slash is normalized and /metrics appended.
        assert captured["url"] == "http://localhost:9999/metrics"
        assert snap.anomalous_agents == [3]

    def test_fetch_connection_error_is_wrapped(self, monkeypatch):
        import httpx

        def boom(url, timeout=None):
            raise httpx.ConnectError("refused")

        monkeypatch.setattr(httpx, "get", boom)
        with pytest.raises(FleetConnectionError, match="Could not reach"):
            fetch_snapshot("http://localhost:9999")


class TestCli:
    def test_demo_mode_returns_zero(self, capsys):
        assert main([]) == 0
        assert "Fleet Vital Signs" in capsys.readouterr().out

    def test_live_mode_renders(self, monkeypatch, capsys):
        import superinstance.live as live

        monkeypatch.setattr(
            live, "fetch_snapshot", lambda url, **kw: LiveSnapshot.from_response(SAMPLE)
        )
        rc = main(["--url", "http://x:1/", "--no-color"])
        assert rc == 0
        assert "LIVE" in capsys.readouterr().out

    def test_live_mode_connection_failure_returns_one(self, monkeypatch, capsys):
        import superinstance.live as live

        def boom(url, **kw):
            raise FleetConnectionError("nope")

        monkeypatch.setattr(live, "fetch_snapshot", boom)
        rc = main(["--url"])
        assert rc == 1
        assert "⚠️" in capsys.readouterr().out

    def test_default_url_constant(self):
        assert DEFAULT_URL == "http://127.0.0.1:8902"
