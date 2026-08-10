"""Tests for ZenMindAgent — minimal workflow agent with Kimi-cli integration."""

import pytest
import json
from pathlib import Path
from unittest.mock import patch, MagicMock

import importlib.util
import sys

# zen-agent.py has a hyphen in filename, can't use normal import
_spec = importlib.util.spec_from_file_location(
    "zen_agent",
    Path(__file__).parent.parent / "superinstance" / "zen-agent.py"
)
_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_mod)
ZenMindAgent = _mod.ZenMindAgent


@pytest.fixture
def agent(tmp_path):
    """Fresh ZenMindAgent in a temp directory."""
    return ZenMindAgent(workdir=tmp_path / "zen-test")


class TestInit:
    def test_creates_workdir(self, tmp_path):
        workdir = tmp_path / "zen-test"
        agent = ZenMindAgent(workdir=workdir)
        assert workdir.exists()

    def test_loads_context(self, agent):
        assert hasattr(agent, "context")
        assert "sessions" in agent.context
        assert "recent_queries" in agent.context

    def test_creates_context_file_on_save(self, agent):
        agent.save_context()
        assert agent.context_file.exists()
        loaded = json.loads(agent.context_file.read_text())
        assert "sessions" in loaded


class TestContextPersistence:
    def test_save_and_reload(self, tmp_path):
        workdir = tmp_path / "zen-persist"
        agent1 = ZenMindAgent(workdir=workdir)
        agent1.context["recent_queries"] = [{"query": "test", "result": "ok"}]
        agent1.save_context()

        agent2 = ZenMindAgent(workdir=workdir)
        assert len(agent2.context["recent_queries"]) == 1
        assert agent2.context["recent_queries"][0]["query"] == "test"

    def test_corrupt_context_falls_back(self, tmp_path):
        workdir = tmp_path / "zen-corrupt"
        workdir.mkdir()
        ctx_file = workdir / "context.json"
        ctx_file.write_text("{ invalid json")
        # After fix: should handle gracefully, reset to defaults
        agent = ZenMindAgent(workdir=workdir)
        assert "sessions" in agent.context
        assert agent.context["sessions"] == []


class TestAddToRecent:
    def test_adds_entry(self, agent):
        agent.add_to_recent("what is the hull?", {"summary": "it is strong"})
        assert len(agent.context["recent_queries"]) == 1
        assert agent.context["recent_queries"][0]["query"] == "what is the hull?"

    def test_prepends_new_entries(self, agent):
        agent.add_to_recent("first", {})
        agent.add_to_recent("second", {})
        assert agent.context["recent_queries"][0]["query"] == "second"
        assert agent.context["recent_queries"][1]["query"] == "first"

    def test_limits_to_ten(self, agent):
        for i in range(15):
            agent.add_to_recent(f"query-{i}", {})
        assert len(agent.context["recent_queries"]) == 10
        assert agent.context["recent_queries"][0]["query"] == "query-14"

    def test_saves_after_add(self, agent):
        agent.add_to_recent("test", {})
        assert agent.context_file.exists()
        loaded = json.loads(agent.context_file.read_text())
        assert len(loaded["recent_queries"]) == 1


class TestSynthesizeContext:
    @patch.object(ZenMindAgent, 'run_kimi_query')
    def test_synthesize_valid_json(self, mock_kimi, agent):
        mock_kimi.return_value = json.dumps({
            "key_points": ["point 1", "point 2"],
            "action_items": ["do thing"],
            "priority": "high",
            "summary": "A summary"
        })
        result = agent.synthesize_context("test input")
        assert result is not None
        assert result["priority"] == "high"
        assert len(result["key_points"]) == 2

    @patch.object(ZenMindAgent, 'run_kimi_query')
    def test_synthesize_with_markdown_code_block(self, mock_kimi, agent):
        mock_kimi.return_value = '```json\n{"key_points": ["a"], "action_items": ["b"], "priority": "low", "summary": "test"}\n```'
        result = agent.synthesize_context("test")
        assert result is not None
        assert result["priority"] == "low"

    @patch.object(ZenMindAgent, 'run_kimi_query')
    def test_synthesize_invalid_json_fallback(self, mock_kimi, agent):
        mock_kimi.return_value = "not json at all"
        result = agent.synthesize_context("some input")
        # Fallback should return a dict with truncated input
        assert result is not None
        assert "key_points" in result
        assert "action_items" in result

    @patch.object(ZenMindAgent, 'run_kimi_query')
    def test_synthesize_none_output(self, mock_kimi, agent):
        mock_kimi.return_value = None
        result = agent.synthesize_context("test")
        assert result is None


class TestRunKimiQuery:
    @patch.object(_mod, 'subprocess')
    def test_successful_query(self, mock_subprocess, agent):
        mock_run = mock_subprocess.run
        mock_run.return_value = MagicMock(returncode=0, stdout="result text", stderr="")
        result = agent.run_kimi_query("test prompt")
        assert result == "result text"

    @patch.object(_mod, 'subprocess')
    def test_failed_query(self, mock_subprocess, agent):
        mock_run = mock_subprocess.run
        mock_run.return_value = MagicMock(returncode=1, stdout="", stderr="error")
        result = agent.run_kimi_query("test prompt")
        assert result is None

    @patch.object(_mod, 'subprocess')
    def test_exception_during_query(self, mock_subprocess, agent):
        mock_run = mock_subprocess.run
        mock_run.side_effect = FileNotFoundError("kimi not found")
        result = agent.run_kimi_query("test prompt")
        assert result is None


class TestLoadContext:
    def test_default_context_structure(self, agent):
        ctx = agent.context
        assert "sessions" in ctx
        assert "recent_queries" in ctx
        assert "last_updated" in ctx
        assert isinstance(ctx["sessions"], list)
        assert isinstance(ctx["recent_queries"], list)
