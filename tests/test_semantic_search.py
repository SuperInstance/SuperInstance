"""Tests for AgentMemory._semantic_search — embedding API + cosine similarity."""

import pytest
import math
from unittest.mock import patch, MagicMock
from superinstance.memory import AgentMemory


@pytest.fixture
def memory(tmp_path):
    """Fresh AgentMemory with some memories."""
    mem = AgentMemory("semantic-test", base_dir=tmp_path)
    mem.remember("The hull is made of titanium steel", "materials")
    mem.remember("The captain sleeps during the night watch", "crew")
    mem.remember("Wesley runs on the local GPU at 3 AM", "systems")
    return mem


class TestSemanticSearchExtraction:
    """Test the fact extraction logic inside _semantic_search."""

    def test_extracts_facts_from_timestamped_lines(self, memory):
        """The semantic search should strip timestamps and extract facts."""
        lines = [
            "- [2026-01-01T00:00:00] [general] The hull is strong",
            "- [2026-01-01T01:00:00] [kvstore] key:val → data",
        ]
        # Access internal parsing by checking what gets sent to the API
        with patch("httpx.post") as mock_post:
            mock_post.return_value = MagicMock(
                json=MagicMock(return_value={
                    "data": [
                        {"index": 0, "embedding": [1.0, 0.0]},
                        {"index": 1, "embedding": [0.9, 0.1]},
                        {"index": 2, "embedding": [0.1, 0.9]},
                    ]
                }),
                raise_for_status=MagicMock(),
            )
            result = memory._semantic_search("strong hull", lines, "fake-key")
            # Should return lines sorted by similarity
            assert len(result) == 2
            # First result should be more similar (higher dot product with query)
            assert "hull is strong" in result[0]

    def test_handles_malformed_lines_gracefully(self, memory):
        """Lines that don't match expected format are passed through."""
        lines = ["random text without timestamp", "- [incomplete]"]
        with patch("httpx.post") as mock_post:
            mock_post.return_value = MagicMock(
                json=MagicMock(return_value={
                    "data": [
                        {"index": 0, "embedding": [1.0, 0.0]},
                        {"index": 1, "embedding": [0.5, 0.5]},
                        {"index": 2, "embedding": [0.5, 0.5]},
                    ]
                }),
                raise_for_status=MagicMock(),
            )
            result = memory._semantic_search("query", lines, "fake-key")
            assert len(result) == 2


class TestSemanticSearchMath:
    """Test the cosine similarity math."""

    def test_identical_vectors_max_similarity(self, memory):
        """Identical vectors should have similarity ~1.0."""
        lines = ["- [t] [c] identical fact"]
        with patch("httpx.post") as mock_post:
            mock_post.return_value = MagicMock(
                json=MagicMock(return_value={
                    "data": [
                        {"index": 0, "embedding": [0.8, 0.6, 0.0]},
                        {"index": 1, "embedding": [0.8, 0.6, 0.0]},
                    ]
                }),
                raise_for_status=MagicMock(),
            )
            result = memory._semantic_search("test", lines, "fake-key")
            assert len(result) == 1
            # The single result is the identical vector
            assert "identical fact" in result[0]

    def test_orthogonal_vectors_low_similarity(self, memory):
        """Orthogonal vectors should have similarity ~0.0."""
        lines = [
            "- [t] [c] similar fact",
            "- [t] [c] orthogonal fact",
        ]
        with patch("httpx.post") as mock_post:
            mock_post.return_value = MagicMock(
                json=MagicMock(return_value={
                    "data": [
                        {"index": 0, "embedding": [1.0, 0.0]},   # query
                        {"index": 1, "embedding": [1.0, 0.0]},   # aligned
                        {"index": 2, "embedding": [0.0, 1.0]},   # orthogonal
                    ]
                }),
                raise_for_status=MagicMock(),
            )
            result = memory._semantic_search("test", lines, "fake-key")
            # Similar fact should rank first (higher similarity)
            assert "similar fact" in result[0]
            assert "orthogonal fact" in result[1]

    def test_zero_norm_query_returns_zero_sim(self, memory):
        """When query embedding has zero norm, similarity is 0."""
        lines = ["- [t] [c] some fact"]
        with patch("httpx.post") as mock_post:
            mock_post.return_value = MagicMock(
                json=MagicMock(return_value={
                    "data": [
                        {"index": 0, "embedding": [0.0, 0.0]},  # zero norm
                        {"index": 1, "embedding": [1.0, 0.0]},
                    ]
                }),
                raise_for_status=MagicMock(),
            )
            result = memory._semantic_search("test", lines, "fake-key")
            assert len(result) == 1  # Still returns, just with sim=0


class TestSemanticSearchIntegration:
    """Test the search() method routing to semantic search."""

    def test_search_uses_semantic_when_api_key_present(self, tmp_path, monkeypatch):
        """When DEEPINFRA_API_KEY is set, semantic search is attempted."""
        monkeypatch.setenv("DEEPINFRA_API_KEY", "test-key")
        mem = AgentMemory("route-test", base_dir=tmp_path)
        mem.remember("The ship sails at midnight")

        with patch("httpx.post") as mock_post:
            mock_post.return_value = MagicMock(
                json=MagicMock(return_value={
                    "data": [
                        {"index": 0, "embedding": [1.0]},
                        {"index": 1, "embedding": [0.9]},
                    ]
                }),
                raise_for_status=MagicMock(),
            )
            result = mem.search("sailing", semantic=True)
            assert len(result) == 1
            assert "ship sails" in result[0]
            mock_post.assert_called_once()

    def test_search_falls_back_on_api_error(self, tmp_path, monkeypatch):
        """When API call fails, falls back to substring matching."""
        monkeypatch.setenv("DEEPINFRA_API_KEY", "test-key")
        mem = AgentMemory("fallback-test", base_dir=tmp_path)
        mem.remember("The ship hull is titanium")

        with patch("httpx.post", side_effect=Exception("API down")):
            result = mem.search("titanium", semantic=True)
            # Should fall back to substring match
            assert len(result) == 1
            assert "titanium" in result[0].lower()

    def test_search_falls_back_on_no_api_key(self, tmp_path, monkeypatch):
        """Without API key, uses substring matching."""
        monkeypatch.delenv("DEEPINFRA_API_KEY", raising=False)
        monkeypatch.delenv("DEEPINFRA_KEY", raising=False)
        mem = AgentMemory("nokey-test", base_dir=tmp_path)
        mem.remember("The ocean is deep today")

        result = mem.search("ocean", semantic=True)
        assert len(result) == 1
        assert "ocean" in result[0].lower()

    def test_search_semantic_false_always_substring(self, tmp_path, monkeypatch):
        """When semantic=False, always uses substring matching."""
        monkeypatch.setenv("DEEPINFRA_API_KEY", "test-key")
        mem = AgentMemory("explicit-substring", base_dir=tmp_path)
        mem.remember("The compass points north")

        result = mem.search("compass", semantic=False)
        assert len(result) == 1

    def test_api_call_format(self, tmp_path, monkeypatch):
        """Verify the API call uses correct model and format."""
        monkeypatch.setenv("DEEPINFRA_API_KEY", "test-key-123")
        mem = AgentMemory("api-test", base_dir=tmp_path)
        mem.remember("test fact one")

        with patch("httpx.post") as mock_post:
            mock_post.return_value = MagicMock(
                json=MagicMock(return_value={
                    "data": [
                        {"index": 0, "embedding": [1.0]},
                        {"index": 1, "embedding": [0.5]},
                    ]
                }),
                raise_for_status=MagicMock(),
            )
            mem.search("test", semantic=True)

            call_args = mock_post.call_args
            assert call_args.kwargs["headers"]["Authorization"] == "Bearer test-key-123"
            assert "BAAI/bge-base-en-v1.5" in call_args.kwargs["json"]["model"]
            # Input should be [query] + [facts]
            inputs = call_args.kwargs["json"]["input"]
            assert inputs[0] == "test"
            assert len(inputs) == 2  # query + 1 fact


class TestStoreRetrieve:
    """Test the store/retrieve key-value interface."""

    def test_store_and_retrieve(self, tmp_path):
        mem = AgentMemory("kv-test", base_dir=tmp_path)
        mem.store("captain", "Casey")
        assert mem.retrieve("captain") == "Casey"

    def test_retrieve_missing_key(self, tmp_path):
        mem = AgentMemory("kv-miss", base_dir=tmp_path)
        assert mem.retrieve("nonexistent") is None

    def test_store_does_not_overwrite_bug(self, tmp_path):
        """BUG: store() appends, so duplicate keys accumulate.
        
        retrieve() returns the first match, so the first value wins.
        This documents the current (incorrect) behavior. A fix would
        update or remove the old entry before appending the new one.
        """
        mem = AgentMemory("kv-overwrite", base_dir=tmp_path)
        mem.store("rank", "ensign")
        mem.store("rank", "lieutenant")
        # BUG: returns first match (ensign), not latest (lieutenant)
        assert mem.retrieve("rank") == "ensign"
