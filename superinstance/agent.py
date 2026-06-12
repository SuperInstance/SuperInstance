"""Agent with persistent memory and fleet capabilities."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any

from .memory import AgentMemory
from .exceptions import AgentNotFoundError


@dataclass
class AgentConfig:
    """Configuration for an agent."""
    name: str
    model: str = "default"
    temperature: float = 0.7
    max_tokens: int = 4096
    tools: list[str] = field(default_factory=list)
    tags: list[str] = field(default_factory=list)


class Agent:
    """An agent with persistent memory.
    
    Memory is stored as markdown files in ~/.superinstance/agents/{name}/
    
    Example:
        >>> agent = Agent("researcher")
        >>> agent.remember("User prefers Python examples")
        >>> agent.recall("Python")
        'User prefers Python examples'
    """

    def __init__(
        self,
        name: str | AgentConfig | None = None,
        memory_dir: str | Path | None = None,
        config: AgentConfig | None = None,
    ):
        # Accept Agent(config) style: if name is an AgentConfig, treat as config
        if isinstance(name, AgentConfig):
            config = name
            name = config.name
        config = config or AgentConfig(name=name) if name else AgentConfig()
        self.config = config
        self.name = config.name
        self.memory = AgentMemory(self.name, base_dir=memory_dir)
        self._spawned: list[Agent] = []
        self._created_at = datetime.now().isoformat()

    def send(self, message: str) -> str:
        """Send a message to the agent (memory-based response)."""
        self.remember(f"Received message: {message}", "inbox")
        return f"Agent {self.name} processed: {message}"

    def remember(self, fact: str, category: str = "general") -> None:
        """Store a fact in long-term memory."""
        self.memory.remember(fact, category)

    def recall(self, query: str | None = None) -> str:
        """Retrieve memories matching a query."""
        return self.memory.recall(query)

    def ask(self, question: str) -> str:
        """Answer based on memory + optional LLM.
        
        Uses keyword search over stored facts. If DEEPINFRA_API_KEY
        is set in the environment, routes through an LLM for real
        reasoning. Otherwise falls back to memory-only.
        """
        memories = self.memory.recall()
        
        # Try LLM if available
        api_key = os.environ.get("DEEPINFRA_API_KEY") or os.environ.get("DEEPINFRA_KEY")
        if api_key and memories and memories != "No memories yet.":
            try:
                return self._ask_llm(question, memories, api_key)
            except Exception:
                pass  # Fall through to keyword search
        
        # Fallback: keyword search
        stop_words = {"what", "does", "the", "user", "is", "are", "how", 
                      "why", "when", "where", "who", "a", "an", "do", 
                      "you", "have", "about", "that", "yet"}
        words = [w.lower() for w in question.replace("?", "").replace(".", "").split() 
                 if w.lower() not in stop_words and len(w) > 2]
        
        for word in words:
            match = self.memory.recall(word)
            if match and match != "No memories match.":
                return f"Based on my memory: {match.strip()}"
        return "I don't have any memories about that yet."

    def _ask_llm(self, question: str, memories: str, api_key: str) -> str:
        """Route question through DeepInfra LLM with memory context."""
        import httpx
        
        # Build prompt with memory context
        prompt = f"""You are {self.name}, an AI agent with persistent memory.

Your memories:
{memories.strip()}

Human: {question}

Answer concisely based on your memories. If you don't have relevant memories,
say so."""
        
        resp = httpx.post(
            "https://api.deepinfra.com/v1/openai/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "deepseek-ai/DeepSeek-V4-Flash",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 512,
                "temperature": 0.3,
            },
            timeout=15.0,
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"].strip()

    def spawn(self, task: str, name: str | None = None) -> Agent:
        """Spawn a subagent for a specific task."""
        sub_name = name or f"{self.name}_sub_{len(self._spawned)}"
        subagent = Agent(sub_name, memory_dir=self.memory.base_dir)
        subagent.memory._files["SOUL.md"] = self.memory._files["SOUL.md"]
        subagent.remember(f"Spawned from {self.name} for task: {task}", "system")
        self._spawned.append(subagent)
        return subagent

    def status(self) -> dict[str, Any]:
        """Return agent status."""
        return {
            "name": self.name,
            "created_at": self._created_at,
            "memory": self.memory.stats(),
            "spawned_count": len(self._spawned),
            "spawned": [s.name for s in self._spawned],
            "config": {
                "model": self.config.model,
                "temperature": self.config.temperature,
                "tools": self.config.tools,
                "tags": self.config.tags,
            },
        }

    def __repr__(self) -> str:
        return f"Agent(name={self.name!r}, memories={self.memory.stats()['entries']})"
