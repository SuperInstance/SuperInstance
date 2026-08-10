"""Tests for ZenMindAgent.run_kimi_query and synthesize_context — the uncovered paths."""

import pytest
import json
from pathlib import Path
from unittest.mock import patch, MagicMock, call
import importlib.util
import sys

_spec = importlib.util.spec_from_file_location(
    "zen_agent",
    Path(__file__).parent.parent / "superinstance" / "zen-agent.py"
)
_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_mod)
ZenMindAgent = _mod.ZenMindAgent


@pytest.fixture
def agent(tmp_path):
    return ZenMindAgent(workdir=tmp_path / "zen-test")


class TestRunKimiQuery:
    """Test the Kimi CLI subprocess wrapper."""

    def test_successful_query_returns_stdout(self, agent):
        mock_result = MagicMock(returncode=0, stdout="  Kimi output here  ", stderr="")
        with patch("subprocess.run", return_value=mock_result) as mock_run:
            result = agent.run_kimi_query("test prompt")
            assert result == "Kimi output here"
            mock_run.assert_called_once()
            # Verify it calls kimi with -y flag
            args = mock_run.call_args
            assert "kimi" in str(args)
            assert "-y" in str(args)

    def test_failed_query_returns_none(self, agent):
        mock_result = MagicMock(returncode=1, stdout="", stderr="kimi error")
        with patch("subprocess.run", return_value=mock_result):
            result = agent.run_kimi_query("test")
            assert result is None

    def test_exception_returns_none(self, agent):
        with patch("subprocess.run", side_effect=FileNotFoundError("kimi not found")):
            result = agent.run_kimi_query("test")
            assert result is None

    def test_uses_workdir_as_cwd(self, agent, tmp_path):
        mock_result = MagicMock(returncode=0, stdout="ok", stderr="")
        with patch("subprocess.run", return_value=mock_result) as mock_run:
            agent.run_kimi_query("test")
            assert mock_run.call_args.kwargs["cwd"] == agent.workdir


class TestSynthesizeContext:
    """Test context synthesis with mocked Kimi."""

    def test_valid_json_response(self, agent):
        json_response = json.dumps({
            "key_points": ["point one", "point two"],
            "action_items": ["do thing"],
            "priority": "high",
            "summary": "A test summary."
        })
        with patch.object(agent, "run_kimi_query", return_value=json_response):
            result = agent.synthesize_context("test input")
            assert result is not None
            assert result["priority"] == "high"
            assert len(result["key_points"]) == 2
            assert result["summary"] == "A test summary."

    def test_markdown_code_block_json(self, agent):
        """Kimi often wraps JSON in markdown code blocks."""
        response = "```json\n" + json.dumps({
            "key_points": ["a"],
            "action_items": ["b"],
            "priority": "medium",
            "summary": "test"
        }) + "\n```"
        with patch.object(agent, "run_kimi_query", return_value=response):
            result = agent.synthesize_context("test")
            assert result is not None
            assert result["priority"] == "medium"

    def test_invalid_json_fallback(self, agent):
        """When Kimi returns non-JSON, falls back to simple parsing."""
        with patch.object(agent, "run_kimi_query", return_value="this is not json at all"):
            result = agent.synthesize_context("some longer input text here")
            assert result is not None
            assert "key_points" in result
            assert "action_items" in result
            assert result["priority"] == "medium"

    def test_none_output_returns_none(self, agent):
        """When Kimi returns None, synthesize returns None."""
        with patch.object(agent, "run_kimi_query", return_value=None):
            result = agent.synthesize_context("test")
            assert result is None

    def test_prompt_contains_input(self, agent):
        """Verify the synthesis prompt includes the user's input."""
        with patch.object(agent, "run_kimi_query", return_value=None) as mock:
            agent.synthesize_context("MY SPECIAL INPUT")
            call_args = mock.call_args[0][0]
            assert "MY SPECIAL INPUT" in call_args


class TestAddToRecent:
    """Test the recent queries tracking."""

    def test_adds_entry_to_front(self, agent):
        agent.add_to_recent("query1", {"result": "ok"})
        assert agent.context["recent_queries"][0]["query"] == "query1"

    def test_prepends_new_entries(self, agent):
        agent.add_to_recent("first", "r1")
        agent.add_to_recent("second", "r2")
        assert agent.context["recent_queries"][0]["query"] == "second"
        assert agent.context["recent_queries"][1]["query"] == "first"

    def test_limits_to_ten(self, agent):
        for i in range(15):
            agent.add_to_recent(f"q{i}", f"r{i}")
        assert len(agent.context["recent_queries"]) == 10
        assert agent.context["recent_queries"][0]["query"] == "q14"

    def test_saves_after_add(self, agent):
        agent.add_to_recent("test", "result")
        assert agent.context_file.exists()
        loaded = json.loads(agent.context_file.read_text())
        assert len(loaded["recent_queries"]) == 1


class TestCorruptContextRecovery:
    """Test recovery from corrupt context files."""

    def test_corrupt_json_resets_to_default(self, tmp_path):
        """Corrupt context file should reset to defaults, not crash."""
        workdir = tmp_path / "corrupt-test"
        workdir.mkdir()
        ctx_file = workdir / "context.json"
        ctx_file.write_text("{ this is not valid json {{{")

        agent = ZenMindAgent(workdir=workdir)
        # Should have fallen back to default context
        assert "sessions" in agent.context
        assert "recent_queries" in agent.context
        assert agent.context["sessions"] == []
