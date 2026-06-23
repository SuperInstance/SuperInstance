#!/usr/bin/env python3
"""
Zen Mind Agent - Minimal Claude-style workflow with Kimi-cli integration
Based on z.ai principles, rapid context synthesis, and seed-minimal patterns
"""

import subprocess
import json
import sys
import os
from pathlib import Path

class ZenMindAgent:
    def __init__(self, workdir=Path.home() / ".openclaw" / "zen-mind-agent"):
        self.workdir = workdir
        self.workdir.mkdir(exist_ok=True)
        self.context_file = workdir / "context.json"
        self.load_context()
    
    def load_context(self):
        """Load persistent context from disk"""
        if self.context_file.exists():
            with open(self.context_file, "r") as f:
                self.context = json.load(f)
        else:
            self.context = {
                "sessions": [],
                "recent_queries": [],
                "last_updated": str(Path(__file__).stat().st_mtime)
            }
    
    def save_context(self):
        """Save context to disk"""
        with open(self.context_file, "w") as f:
            json.dump(self.context, f, indent=2)
    
    def run_kimi_query(self, prompt):
        """Run Kimi-cli query and return parsed results"""
        try:
            result = subprocess.run(
                ["kimi", "-y", prompt],
                capture_output=True,
                text=True,
                cwd=self.workdir
            )
            if result.returncode == 0:
                return result.stdout.strip()
            else:
                print(f"Kimi error: {result.stderr}", file=sys.stderr)
                return None
        except Exception as e:
            print(f"Kimi execution failed: {e}", file=sys.stderr)
            return None
    
    def synthesize_context(self, input_text):
        """Synthesize context using Claude-style patterns"""
        # Use Kimi to parse and synthesize
        prompt = f"""
        Synthesize this input into structured zen mind context:
        INPUT: {input_text}
        
        Output ONLY valid JSON with:
        - key_points: list of 3-5 core ideas
        - action_items: list of 1-3 immediate tasks
        - priority: low/medium/high
        - summary: 1-sentence overview
        """
        raw_output = self.run_kimi_query(prompt)
        if not raw_output:
            return None
        
        try:
            # Clean up and parse JSON
            cleaned = raw_output.replace("```json", "").replace("```", "")
            return json.loads(cleaned)
        except json.JSONDecodeError:
            # Fallback to simple parsing
            return {
                "key_points": [input_text[:100] + "..."],
                "action_items": ["Analyze input further"],
                "priority": "medium",
                "summary": input_text[:200] + "..."
            }
    
    def add_to_recent(self, query, result):
        """Add query and result to recent context"""
        self.context["recent_queries"].insert(0, {
            "query": query,
            "result": result,
            "timestamp": str(Path(__file__).stat().st_mtime)
        })
        # Keep only last 10 entries
        self.context["recent_queries"] = self.context["recent_queries"][:10]
        self.save_context()
    
    def run(self):
        """Main agent loop"""
        print("🤖 Zen Mind Agent Ready (Ctrl+C to exit)")
        print("→ Type queries or 'exit' to quit")
        
        while True:
            try:
                user_input = input("\nzen> ").strip()
                if not user_input:
                    continue
                if user_input.lower() in ["exit", "quit", "q"]:
                    break
                
                # Synthesize context
                print("🔍 Synthesizing...")
                synthesis = self.synthesize_context(user_input)
                if not synthesis:
                    print("❌ Failed to synthesize context")
                    continue
                
                # Print results
                print("\n📊 Synthesis Results:")
                print(f"✅ Summary: {synthesis['summary']}")
                print(f"🎯 Priority: {synthesis['priority'].upper()}")
                print("\n📍 Key Points:")
                for i, point in enumerate(synthesis['key_points'], 1):
                    print(f"  {i}. {point}")
                print("\n📋 Action Items:")
                for i, item in enumerate(synthesis['action_items'], 1):
                    print(f"  {i}. {item}")
                
                # Save to context
                self.add_to_recent(user_input, synthesis)
                
            except KeyboardInterrupt:
                print("\n\n👋 Exiting...")
                break
            except Exception as e:
                print(f"\n❌ Error: {e}", file=sys.stderr)

if __name__ == "__main__":
    agent = ZenMindAgent()
    agent.run()