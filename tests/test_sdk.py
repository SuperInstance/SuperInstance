"""Tests for the SuperInstance SDK."""


import pytest

from superinstance import Agent, AgentMemory, Fleet
from superinstance.exceptions import AgentNotFoundError


class TestAgentMemory:
    def test_create_memory(self, tmp_path):
        mem = AgentMemory("test_agent", base_dir=tmp_path)
        assert mem.agent_name == "test_agent"
        assert mem.agent_dir.exists()

    def test_remember_and_recall(self, tmp_path):
        mem = AgentMemory("test_agent", base_dir=tmp_path)
        mem.remember("Python is great", "preference")
        result = mem.recall("Python")
        assert "Python is great" in result

    def test_recall_no_match(self, tmp_path):
        mem = AgentMemory("test_agent", base_dir=tmp_path)
        mem.remember("Python is great", "preference")
        result = mem.recall("Rust")
        assert result == "No memories match."

    def test_recall_all(self, tmp_path):
        mem = AgentMemory("test_agent", base_dir=tmp_path)
        mem.remember("Fact 1", "general")
        mem.remember("Fact 2", "general")
        result = mem.recall()
        assert "Fact 1" in result
        assert "Fact 2" in result

    def test_stats(self, tmp_path):
        mem = AgentMemory("test_agent", base_dir=tmp_path)
        mem.remember("Fact 1", "general")
        stats = mem.stats()
        assert stats["entries"] == 1
        assert "SOUL.md" in stats["files"]

    def test_clear(self, tmp_path):
        mem = AgentMemory("test_agent", base_dir=tmp_path)
        mem.remember("Fact 1", "general")
        mem.clear()
        assert mem.recall() == "No memories yet."

    def test_default_files(self, tmp_path):
        mem = AgentMemory("test_agent", base_dir=tmp_path)
        assert mem._files["SOUL.md"].exists()
        assert mem._files["USER.md"].exists()
        assert mem._files["MEMORY.md"].exists()

    def test_store_and_retrieve(self, tmp_path):
        mem = AgentMemory("test_agent", base_dir=tmp_path)
        mem.store("favorite_lang", "Rust")
        assert mem.retrieve("favorite_lang") == "Rust"

    def test_retrieve_missing_key(self, tmp_path):
        mem = AgentMemory("test_agent", base_dir=tmp_path)
        assert mem.retrieve("nope") is None

    def test_search_substring_fallback(self, tmp_path):
        # No API key set → search falls back to substring matching.
        mem = AgentMemory("test_agent", base_dir=tmp_path)
        mem.remember("The fleet runs on ternary math", "notes")
        mem.remember("Binary is the old way", "notes")
        results = mem.search("ternary", semantic=False)
        assert len(results) == 1
        assert "ternary" in results[0]

    def test_search_empty(self, tmp_path):
        mem = AgentMemory("test_agent", base_dir=tmp_path)
        assert mem.search("anything") == []

    def test_read_soul_and_user(self, tmp_path):
        mem = AgentMemory("test_agent", base_dir=tmp_path)
        assert "test_agent" in mem.read_soul()
        assert "User Profile" in mem.read_user()

    def test_repr(self, tmp_path):
        mem = AgentMemory("test_agent", base_dir=tmp_path)
        mem.remember("fact")
        assert "test_agent" in repr(mem)
        assert "entries=1" in repr(mem)


class TestAgent:
    def test_create_agent(self, tmp_path):
        agent = Agent("researcher", memory_dir=tmp_path)
        assert agent.name == "researcher"
        assert agent.memory.stats()["entries"] == 0

    def test_remember(self, tmp_path):
        agent = Agent("researcher", memory_dir=tmp_path)
        agent.remember("User likes Python", "preference")
        assert agent.memory.stats()["entries"] == 1

    def test_ask_with_memory(self, tmp_path):
        agent = Agent("researcher", memory_dir=tmp_path)
        agent.remember("User likes Python", "preference")
        response = agent.ask("What does the user like?")
        assert "Python" in response

    def test_ask_without_memory(self, tmp_path):
        agent = Agent("researcher", memory_dir=tmp_path)
        response = agent.ask("What does the user like?")
        assert "don't have any memories" in response

    def test_spawn_subagent(self, tmp_path):
        agent = Agent("researcher", memory_dir=tmp_path)
        sub = agent.spawn("Find interesting papers")
        assert sub.name == "researcher_sub_0"
        assert "Spawned from researcher" in sub.memory.recall()

    def test_status(self, tmp_path):
        agent = Agent("researcher", memory_dir=tmp_path)
        agent.remember("Fact", "general")
        status = agent.status()
        assert status["name"] == "researcher"
        assert status["memory"]["entries"] == 1

    def test_repr(self, tmp_path):
        agent = Agent("researcher", memory_dir=tmp_path)
        assert "Agent(name='researcher'" in repr(agent)


class TestFleet:
    def test_create_fleet(self, tmp_path):
        fleet = Fleet("test_fleet", memory_dir=tmp_path)
        assert fleet.name == "test_fleet"
        assert len(fleet) == 0

    def test_create_agent(self, tmp_path):
        fleet = Fleet("test_fleet", memory_dir=tmp_path)
        agent = fleet.create_agent("scout")
        assert agent.name == "scout"
        assert len(fleet) == 1
        assert "scout" in fleet

    def test_duplicate_agent(self, tmp_path):
        fleet = Fleet("test_fleet", memory_dir=tmp_path)
        fleet.create_agent("scout")
        with pytest.raises(ValueError, match="already exists"):
            fleet.create_agent("scout")

    def test_get_agent(self, tmp_path):
        fleet = Fleet("test_fleet", memory_dir=tmp_path)
        fleet.create_agent("scout")
        agent = fleet.get_agent("scout")
        assert agent.name == "scout"

    def test_get_missing(self, tmp_path):
        fleet = Fleet("test_fleet", memory_dir=tmp_path)
        with pytest.raises(AgentNotFoundError):
            fleet.get_agent("missing")

    def test_list_agents(self, tmp_path):
        fleet = Fleet("test_fleet", memory_dir=tmp_path)
        fleet.create_agent("scout", tags=["research"])
        fleet.create_agent("writer", tags=["writing"])
        assert len(fleet.list_agents()) == 2
        assert len(fleet.list_agents("research")) == 1

    def test_broadcast(self, tmp_path):
        fleet = Fleet("test_fleet", memory_dir=tmp_path)
        fleet.create_agent("scout")
        fleet.create_agent("writer")
        responses = fleet.broadcast("Hello")
        assert len(responses) == 2

    def test_broadcast_filtered(self, tmp_path):
        fleet = Fleet("test_fleet", memory_dir=tmp_path)
        fleet.create_agent("scout", tags=["research"])
        fleet.create_agent("writer", tags=["writing"])
        responses = fleet.broadcast("Hello", tag="research")
        assert len(responses) == 1

    def test_status(self, tmp_path):
        fleet = Fleet("test_fleet", memory_dir=tmp_path)
        agent = fleet.create_agent("scout")
        agent.remember("Fact 1", "general")
        status = fleet.status()
        assert status.total_agents == 1
        assert status.total_memories == 1

    def test_remove(self, tmp_path):
        fleet = Fleet("test_fleet", memory_dir=tmp_path)
        fleet.create_agent("scout")
        fleet.remove_agent("scout")
        assert len(fleet) == 0

    def test_remove_missing(self, tmp_path):
        fleet = Fleet("test_fleet", memory_dir=tmp_path)
        with pytest.raises(AgentNotFoundError):
            fleet.remove_agent("missing")

    def test_repr(self, tmp_path):
        fleet = Fleet("test_fleet", memory_dir=tmp_path)
        assert repr(fleet) == "Fleet('test_fleet', agents=0)"

    def test_dispatch_empty_fleet(self, tmp_path):
        fleet = Fleet("test_fleet", memory_dir=tmp_path)
        assert "No agents" in fleet.dispatch("task")

    def test_dispatch_records_cost(self, tmp_path):
        fleet = Fleet("test_fleet", memory_dir=tmp_path)
        fleet.create_agent("scout")
        result = fleet.dispatch("scan the harbor")
        assert "scout" in result
        # Dispatch billed γ on the conservation ledger.
        assert fleet.ledger.budget("scout").gamma > 0

    def test_dispatch_balances_load(self, tmp_path):
        fleet = Fleet("test_fleet", memory_dir=tmp_path)
        fleet.create_agent("a")
        fleet.create_agent("b")
        # First dispatch loads one agent; the second should pick the other.
        first = fleet.dispatch("task 1")
        second = fleet.dispatch("task 2")
        assert {first.split("to ")[1], second.split("to ")[1]} == {"a", "b"}

    def test_dispatch_respects_tag(self, tmp_path):
        fleet = Fleet("test_fleet", memory_dir=tmp_path)
        fleet.create_agent("scout", tags=["research"])
        fleet.create_agent("writer", tags=["content"])
        result = fleet.dispatch("find sources", tag="research")
        assert "scout" in result

    def test_spectral_balance_empty(self, tmp_path):
        fleet = Fleet("test_fleet", memory_dir=tmp_path)
        sb = fleet.spectral_balance()
        assert sb.gap == 0.0
        assert sb.dominant_agent == ""

    def test_spectral_balance_dominant_is_heaviest(self, tmp_path):
        fleet = Fleet("test_fleet", memory_dir=tmp_path)
        light = fleet.create_agent("light")
        heavy = fleet.create_agent("heavy")
        for i in range(10):
            heavy.remember(f"fact {i}", "general")
        sb = fleet.spectral_balance()
        # The agent with more memory mass dominates the leading eigenvector.
        assert sb.dominant_agent == "heavy"
        assert len(sb.eigenvalues) == 2

    def test_spectral_balance_eigenvalues_ordered(self, tmp_path):
        fleet = Fleet("test_fleet", memory_dir=tmp_path)
        for name in ("a", "b", "c"):
            agent = fleet.create_agent(name, tags=["shared"])
            agent.remember("x", "general")
        sb = fleet.spectral_balance()
        # λ₁ is the dominant eigenvalue; gap is non-negative.
        assert abs(sb.eigenvalues[0]) >= abs(sb.eigenvalues[1])
        assert sb.gap >= 0

    def test_audit_flags_burning_agent(self, tmp_path):
        fleet = Fleet("test_fleet", memory_dir=tmp_path)
        fleet.create_agent("burner")
        fleet.ledger.record("burner", gamma=100, eta=100)
        fleet.ledger.record("burner", gamma=200, eta=80)
        fleet.ledger.record("burner", gamma=300, eta=50)
        report = fleet.audit()
        assert "burner" in report.burning
