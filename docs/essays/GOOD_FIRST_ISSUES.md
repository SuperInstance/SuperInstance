# Good First Issues 🎯

> Welcoming, concrete tasks for new contributors. Each can be done in under 2 hours.

Before starting, read [`CONTRIBUTING.md`](./CONTRIBUTING.md) and [`QUICKSTART.md`](./QUICKSTART.md) for setup.

---

## 1. Add missing tests for `Agent.ask()` keyword fallback path

**Difficulty:** Easy

The `Agent.ask()` method has two code paths — one that calls an LLM via DeepInfra, and a keyword-search fallback. The current test suite only exercises the fallback path *with* memories stored. Add tests for edge cases:

- Asking when no memories exist (already partly covered, but add a test that verifies the exact stop-word stripping logic)
- Asking with multi-word queries that contain only stop words (`"what is the"`)
- Asking when `DEEPINFRA_API_KEY` is set but the API call fails (mock `httpx.post` to raise, verify graceful fallback)

**Files to touch:**
- `tests/test_sdk.py` — add a `TestAgentAskFallback` class

**Skills needed:** Python, pytest, basic mocking with `unittest.mock.patch`

**Hint:**
```python
class TestAgentAskFallback:
    def test_all_stop_words(self, tmp_path):
        agent = Agent("r", memory_dir=tmp_path)
        agent.remember("Something important", "general")
        result = agent.ask("what is the")
        # Should not crash; should return the fallback message

    def test_llm_failure_graceful_fallback(self, tmp_path, monkeypatch):
        monkeypatch.setenv("DEEPINFRA_API_KEY", "fake-key")
        agent = Agent("r", memory_dir=tmp_path)
        agent.remember("Python is fun", "preference")
        with patch("httpx.post", side_effect=Exception("network error")):
            result = agent.ask("What language?")
            assert "Python" in result
```

---

## 2. Add `__eq__`, `__hash__`, and `__lt__` dunder methods to `Agent`

**Difficulty:** Easy

Agents are currently compared by identity only. Add `__eq__` (compare by name), `__hash__` (hash by name so agents can be dict keys / set members), and `__lt__` (sort by name).

**Files to touch:**
- `superinstance/agent.py` — add 3 methods to `Agent`
- `tests/test_sdk.py` — add `TestAgentDunders` class

**Skills needed:** Python, data model basics

**Hint:**
```python
def __eq__(self, other: object) -> bool:
    if not isinstance(other, Agent):
        return NotImplemented
    return self.name == other.name

def __hash__(self) -> int:
    return hash(self.name)

def __lt__(self, other: Agent) -> bool:
    return self.name < other.name
```

---

## 3. Write a `.editorconfig` for the monorepo

**Difficulty:** Easy

The repo mixes Python, TypeScript, Rust, Markdown, and YAML but has no `.editorconfig`. Create one that sets sensible defaults: indent style, trailing newlines, charset.

**Files to touch:**
- `.editorconfig` (new file at repo root)

**Skills needed:** None — just read [editorconfig.org](https://editorconfig.org)

**Hint:**
```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.{py,rs,toml}]
indent_style = space
indent_size = 4

[*.{ts,js,json,yml,yaml,md}]
indent_style = space
indent_size = 2

[Makefile]
indent_style = tab
```

---

## 4. Add a `forget()` method to `AgentMemory`

**Difficulty:** Easy

There's `remember()` and `recall()` but no way to remove a specific memory. Add `forget(query: str) -> int` that removes all lines matching the query (case-insensitive) from `MEMORY.md` and returns the count removed.

**Files to touch:**
- `superinstance/memory.py` — add `forget()` method
- `tests/test_sdk.py` — add tests for exact match, partial match, no match, and diary cleanup

**Skills needed:** Python, basic file I/O

**Hint:**
```python
def forget(self, query: str) -> int:
    """Remove memories matching query. Returns count removed."""
    text = self._files["MEMORY.md"].read_text()
    lines = text.split("\n")
    kept, removed = [], 0
    for line in lines:
        if line.strip().startswith("- [") and query.lower() in line.lower():
            removed += 1
        else:
            kept.append(line)
    self._files["MEMORY.md"].write_text("\n".join(kept))
    return removed
```

---

## 5. Add request validation with Pydantic to `Agent.send()` and `Fleet.dispatch()`

**Difficulty:** Medium

The SDK already depends on `pydantic>=2.0` but never uses it for input validation. Create Pydantic models for `Agent.send()` (validate message is non-empty string, max length) and `Fleet.dispatch()` (validate task is non-empty, max length, optionally validate priority tag).

**Files to touch:**
- `superinstance/schemas.py` (new file) — Pydantic models
- `superinstance/agent.py` — use validation in `send()`
- `superinstance/fleet.py` — use validation in `dispatch()`
- `superinstance/__init__.py` — export new models
- `tests/test_sdk.py` — add `TestValidation` class

**Skills needed:** Python, Pydantic v2

**Hint:**
```python
# superinstance/schemas.py
from pydantic import BaseModel, Field

class MessageInput(BaseModel):
    content: str = Field(..., min_length=1, max_length=50_000)

class TaskInput(BaseModel):
    description: str = Field(..., min_length=1, max_length=10_000)
    priority: str = Field(default="normal", pattern="^(low|normal|high|critical)$")
```

---

## 6. Improve the Docker Compose setup with Redis and health checks

**Difficulty:** Medium

The current `docker/docker-compose.yml` only runs the Python SDK demo. Flesh it out into a proper local dev stack: add a Redis service (for future session caching), add health checks to the app container, and add a `docker/docker-compose.dev.yml` override for live-reloading with volume mounts.

**Files to touch:**
- `docker/docker-compose.yml` — add Redis, health checks
- `docker/docker-compose.dev.yml` (new) — dev overrides with source mount

**Skills needed:** Docker, Docker Compose basics

**Hint:**
```yaml
# docker-compose.yml additions
services:
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      retries: 3

  superinstance:
    depends_on:
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "python", "-c", "from superinstance import Agent; print('ok')"]
      interval: 10s
```

---

## 7. Add a CLI entry point for the Python SDK

**Difficulty:** Medium

The Python SDK has no CLI. Add a `superinstance` console script (configured in `pyproject.toml`) that lets users interact with agents from the terminal. Start with three subcommands: `agent create <name>`, `agent remember <name> <fact>`, `agent ask <name> <question>`.

**Files to touch:**
- `superinstance/cli.py` (new file)
- `pyproject.toml` — add `[project.scripts]`
- `tests/test_cli.py` (new file)

**Skills needed:** Python, argparse or click, entry points

**Hint:**
```python
# superinstance/cli.py
import argparse
from .agent import Agent
from .fleet import Fleet

def main():
    parser = argparse.ArgumentParser(prog="superinstance")
    sub = parser.add_subparsers(dest="command")

    # agent create
    p = sub.add_parser("agent-create", help="Create a new agent")
    p.add_argument("name")

    # agent remember
    p = sub.add_parser("agent-remember", help="Store a fact")
    p.add_argument("name")
    p.add_argument("fact")

    # agent ask
    p = sub.add_parser("agent-ask", help="Ask an agent a question")
    p.add_argument("name")
    p.add_argument("question", nargs="+")

    args = parser.parse_args()
    # ... dispatch to handlers

if __name__ == "__main__":
    main()
```

In `pyproject.toml`:
```toml
[project.scripts]
superinstance = "superinstance.cli:main"
```

---

## 8. Add JSON Schema validation tests for the TypeScript fleet schemas

**Difficulty:** Easy

The `schemas/` directory has TypeScript interfaces for fleet types (fleet-health, constraint-model, plato-tile, etc.) and a compiled `schemas.json`. Write a small Node.js test script that validates sample JSON payloads against those schemas using `ajv` or a simple type assertion.

**Files to touch:**
- `schemas/test-schemas.mjs` (new file) — validation tests
- `package.json` — add a `"test:schemas"` script

**Skills needed:** JavaScript/TypeScript, JSON Schema basics

**Hint:**
```javascript
// schemas/test-schemas.mjs
import { readFileSync } from "fs";

const schemas = JSON.parse(readFileSync("schemas/schemas.json", "utf-8"));

// Validate a sample HealthReport
const sample = {
  timestamp: Date.now(),
  services: {},
  agents: {},
  plato: { tile_flow_rate: 0, chain_length: 0, room_count: 0 },
  zeroclaw: { running: false, last_log_activity: 0 },
  actions_taken: [],
};

// Use ajv or manual property checks
console.log("✅ HealthReport structure valid");
```

---

## 9. Write a GitHub Actions CI workflow for the Python SDK

**Difficulty:** Medium

The monorepo has CI for other projects but no dedicated workflow for the Python SDK. Create `.github/workflows/python-sdk.yml` that runs on push/PR: sets up Python 3.10–3.12, installs the SDK with dev deps, runs `ruff check`, `mypy`, and `pytest --cov`.

**Files to touch:**
- `.github/workflows/python-sdk.yml` (new file)

**Skills needed:** GitHub Actions, Python tooling

**Hint:**
```yaml
name: Python SDK
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.10", "3.11", "3.12"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}
      - run: pip install -e ".[dev]"
      - run: ruff check superinstance/ tests/
      - run: mypy superinstance/
      - run: pytest --cov=superinstance --cov-report=term-missing
```

---

## 10. Add a `Fleet.export()` and `Fleet.import_from()` method for fleet snapshots

**Difficulty:** Medium

There's no way to save and restore fleet state. Add `fleet.export() -> dict` that serializes all agents (names, configs, memories, tags) to a JSON-compatible dict, and a class method `Fleet.import_from(data: dict) -> Fleet` that reconstructs a fleet from that snapshot. This enables fleet migration and testing fixtures.

**Files to touch:**
- `superinstance/fleet.py` — add `export()` and `import_from()`
- `tests/test_sdk.py` — add `TestFleetSnapshot` class

**Skills needed:** Python, serialization, dataclasses

**Hint:**
```python
import json

def export(self) -> dict:
    """Serialize fleet state to a portable dict."""
    return {
        "name": self.name,
        "agents": [
            {
                "name": a.name,
                "config": {
                    "model": a.config.model,
                    "temperature": a.config.temperature,
                    "max_tokens": a.config.max_tokens,
                    "tools": a.config.tools,
                    "tags": a.config.tags,
                },
                "memory_text": a.memory._files["MEMORY.md"].read_text(),
            }
            for a in self._agents.values()
        ],
        "tags": dict(self._tags),
    }

def to_json(self, path: str | Path) -> None:
    """Write fleet snapshot to a JSON file."""
    Path(path).write_text(json.dumps(self.export(), indent=2))

@classmethod
def import_from(cls, data: dict, memory_dir: str | None = None) -> Fleet:
    """Reconstruct a fleet from an exported snapshot."""
    fleet = cls(data["name"], memory_dir=memory_dir)
    for agent_data in data["agents"]:
        agent = fleet.create_agent(
            agent_data["name"],
            model=agent_data["config"]["model"],
            tags=agent_data["config"]["tags"],
            tools=agent_data["config"]["tools"],
        )
        # Restore memory
        agent.memory._files["MEMORY.md"].write_text(agent_data["memory_text"])
    return fleet
```

Test:
```python
class TestFleetSnapshot:
    def test_roundtrip(self, tmp_path):
        fleet = Fleet("team", memory_dir=tmp_path)
        fleet.create_agent("scout", tags=["research"])
        fleet.get_agent("scout").remember("found something", "finding")

        exported = fleet.export()
        restored = Fleet.import_from(exported, memory_dir=tmp_path / "restored")

        assert len(restored) == 1
        assert "found something" in restored.get_agent("scout").recall()
```

---

## Finding More

- Browse [`CATALOG.md`](./CATALOG.md) for repos that interest you
- Look for `TODO` and `FIXME` comments in the codebase
- Check existing issues tagged `good first issue` on GitHub
- Ask a repo ensign: `npx @superinstance/tminus-dispatcher --ensign <repo> --ask "What needs help?"`

*Last updated: June 2026*
