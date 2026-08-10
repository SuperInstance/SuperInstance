"""Tests for Agent methods — send(), ask() fallback paths, spawn, status."""

import pytest
from unittest.mock import patch, MagicMock
from superinstance import Agent


class TestAgentSend:
    def test_send_returns_response(self, tmp_path):
        agent = Agent("test-agent", memory_dir=tmp_path)
        result = agent.send("Hello there")
        assert "test-agent" in result
        assert "Hello there" in result

    def test_send_stores_in_memory(self, tmp_path):
        agent = Agent("test-agent", memory_dir=tmp_path)
        agent.send("Important message")
        recall = agent.recall("Important message")
        assert "Important message" in recall

    def test_send_multiple_messages(self, tmp_path):
        agent = Agent("test-agent", memory_dir=tmp_path)
        agent.send("Message one")
        agent.send("Message two")
        stats = agent.memory.stats()
        assert stats["entries"] == 2


class TestAgentAskFallback:
    def test_ask_no_api_key_uses_keyword(self, tmp_path, monkeypatch):
        """When no DEEPINFRA_API_KEY, falls back to keyword search."""
        monkeypatch.delenv("DEEPINFRA_API_KEY", raising=False)
        monkeypatch.delenv("DEEPINFRA_KEY", raising=False)
        agent = Agent("test-agent", memory_dir=tmp_path)
        agent.remember("The hull is made of steel")
        response = agent.ask("What is the hull made of?")
        assert "steel" in response.lower()

    def test_ask_no_api_key_no_memories(self, tmp_path, monkeypatch):
        monkeypatch.delenv("DEEPINFRA_API_KEY", raising=False)
        monkeypatch.delenv("DEEPINFRA_KEY", raising=False)
        agent = Agent("test-agent", memory_dir=tmp_path)
        response = agent.ask("anything")
        assert "don't have any memories" in response

    def test_ask_with_api_key_calls_llm(self, tmp_path, monkeypatch):
        """When DEEPINFRA_API_KEY is set, routes through LLM."""
        monkeypatch.setenv("DEEPINFRA_API_KEY", "fake-key-1234")
        
        agent = Agent("test-agent", memory_dir=tmp_path)
        agent.remember("The hull is made of steel")
        
        # Mock _ask_llm directly
        with patch.object(agent, '_ask_llm', return_value="The hull is very strong indeed."):
            response = agent.ask("Tell me about the hull")
        assert "strong" in response.lower()

    def test_ask_api_key_falls_back_on_error(self, tmp_path, monkeypatch):
        """When LLM call fails, falls back to keyword search."""
        monkeypatch.setenv("DEEPINFRA_API_KEY", "fake-key-1234")
        
        agent = Agent("test-agent", memory_dir=tmp_path)
        agent.remember("The hull is made of steel")
        
        # Mock _ask_llm to raise
        with patch.object(agent, '_ask_llm', side_effect=Exception("Network error")):
            response = agent.ask("Tell me about the hull")
        # Should fall back to keyword search
        assert "steel" in response.lower()

    def test_ask_api_key_no_memories_uses_keyword(self, tmp_path, monkeypatch):
        """When API key is set but no memories, skips LLM."""
        monkeypatch.setenv("DEEPINFRA_API_KEY", "fake-key-1234")
        agent = Agent("test-agent", memory_dir=tmp_path)
        response = agent.ask("anything")
        assert "don't have any memories" in response


class TestAgentSpawn:
    def test_spawn_creates_subagent(self, tmp_path):
        agent = Agent("parent", memory_dir=tmp_path)
        sub = agent.spawn("do something")
        assert "parent" in sub.name

    def test_spawn_tracks_children(self, tmp_path):
        agent = Agent("parent", memory_dir=tmp_path)
        sub1 = agent.spawn("task 1")
        sub2 = agent.spawn("task 2")
        assert len(agent._spawned) == 2

    def test_spawn_remembers_task(self, tmp_path):
        agent = Agent("parent", memory_dir=tmp_path)
        sub = agent.spawn("find the fish")
        recall = sub.recall("find the fish")
        assert "find the fish" in recall


class TestAgentStatus:
    def test_status_has_required_fields(self, tmp_path):
        agent = Agent("test-agent", memory_dir=tmp_path)
        status = agent.status()
        assert "name" in status
        assert "memory" in status

    def test_status_shows_spawned_count(self, tmp_path):
        agent = Agent("parent", memory_dir=tmp_path)
        agent.spawn("task 1")
        agent.spawn("task 2")
        status = agent.status()
        assert len(status["spawned"]) == 2
