# Next Horizons

## A Strategy for What Comes After the Foundation

---

## 1. The Thesis

Here is the claim, stated as sharply as possible:

**AI agents need physics.**

Not metaphors of physics. Not "inspired by thermodynamics." Actual conservation laws with actual enforcement, running on actual bytecode, verified by actual tests.

Every other layer of computing has this. CPUs don't "try" to execute instructions correctly — they are built so that incorrect execution is a hardware fault. Compilers don't "prefer" to produce valid machine code — they are constrained by formal grammars that make invalid output impossible. Networks don't "attempt" to deliver packets — they operate under protocols where delivery semantics are specified, tested, and enforced.

And yet AI agents — systems that make decisions affecting real people, real money, real systems — operate with none of this. An LLM agent today is a prompt, a loop, and a prayer. The prompt asks for good behavior. The loop hopes the model complies. The prayer is that nothing drifts.

SuperInstance replaces the prayer with a physics.

Three principles:

**Agents should be governed by conservation laws.** Just as energy cannot be created or destroyed in a closed system, certain quantities in an agent system should be conserved: attention budget, action potential, information throughput. An agent that violates conservation laws is not "misbehaving" — it is physically impossible, because the runtime prevents it. The constraint-theory framework with its 261 tests is the mathematical foundation. FLUX bytecode is the enforcement mechanism.

**Agents should run on deterministic bytecode.** When you compile a policy to FLUX bytecode, the policy becomes a program, not a suggestion. A `.bin` file does not hallucinate. It does not drift. It does not decide to interpret your instructions differently. It executes, instruction by instruction, on any runtime that implements the VM spec — Python, Rust, JavaScript — and produces identical behavior. This is what "deterministic" means: not that the agent cannot be creative, but that the *boundary conditions* on its creativity are enforced by a layer that cannot be argued with.

**Agents should interact through room-level protocols.** The unit of governance in a building is not the thermostat — it is the room. Thermostats within a room coordinate; rooms within a building coordinate through a higher-level protocol. PLATO rooms are this principle applied to AI: agents enter rooms, follow protocols, do work, and leave. Governance lives at the room level, not the agent level. An agent that steps out of line is not "prompted to behave" — it is removed from the room.

This is not another agent framework. The existing agent frameworks — and there are many — all share the same flaw: they treat agent behavior as a software engineering problem (orchestration, tool use, memory, retrieval). SuperInstance treats it as a physics problem. The question is not "how do we make agents useful?" but "what are the conservation laws under which useful agents can exist?"

The infrastructure is built to prove this. Three FLUX VMs, cross-verified. Five PLATO engines, approaching wire-protocol conformance. A constraint theory with 261 tests. Eight packages published. The foundation is real.

What follows is what to build on top of it.

---

## 2. The Three Bets

The thesis is only a claim until something proves it. These are the three projects that would turn the claim into evidence. Each is scoped to be achievable in months, not years. Each has a clear definition of done. And each, if successful, would demonstrate something that no other AI project has demonstrated.

### Bet A: The Conservation Enforcer in Production

**The question:** Does an agent running under conservation constraints actually behave better than one running without them?

**The build:** A GitHub bot that manages issues on a real repository. The bot runs on FLUX bytecode. Its policy encodes conservation laws: a bounded attention budget per issue, a bounded action rate per time window, a bounded information throughput per interaction. When the bot encounters an issue, it does not have an unconstrained LLM call. It runs its bytecode, which may *invoke* an LLM within tightly defined parameters, and the conservation laws enforce the boundaries.

**The proof:** Deploy two versions of the bot on two identical repos (or the same repo in sequence). Version one: unconstrained LLM agent. Version two: FLUX-enforced conservation agent. Measure: signal-to-noise ratio of issue management (how many actions were useful vs. noise), predictability of behavior (does it do the same thing in the same situation), and robustness under adversarial input (does it break when someone posts a confusing issue).

**Definition of done:** A published report showing measurable improvement in agent behavior under conservation constraints, with the bytecode policy published as a `.bin` file that anyone can download, inspect, and run on their own FLUX VM.

This is the single most important project SuperInstance could build. Everything else — the specs, the VMs, the tests, the conformance suites — is preparation for this moment. If an agent running under conservation laws demonstrably behaves better than one running without them, the thesis graduates from "interesting idea" to "empirical result."

### Bet B: The Room Protocol Ecosystem

**The question:** Is room-level governance more effective than agent-level governance?

**The build:** Three to five PLATO rooms that do real, useful work:

1. **Code Review Room.** An agent enters, reads a diff, and produces a structured review. The room enforces protocol: the review must follow a template, must cite specific lines, must classify findings by severity. If the agent produces unstructured output, the room rejects it. The room is the governance layer; the agent is just an occupant.

2. **Security Audit Room.** An agent enters with a codebase, performs a security scan, and produces findings. The room enforces conservation: the agent has a finite attention budget (cannot read the entire codebase at once), a finite action budget (cannot produce unlimited findings), and a finite time budget (the audit must complete). These constraints are not suggestions — they are bytecode-enforced.

3. **Deployment Approval Room.** Multiple agents enter — a builder, a tester, a reviewer. The room enforces a protocol: the builder proposes, the tester verifies, the reviewer approves. No single agent can deploy alone. The room protocol is the governance; the agents are participants.

4. **Documentation Room.** An agent enters with a codebase and produces documentation. The room enforces conservation: the documentation must fit within an information budget (no 50,000-word READMEs), must cover specified areas, and must be consistent with existing docs.

5. **Conservation Monitor Room.** A meta-room that watches other rooms and reports conservation-law violations. If any agent in any room exceeds its budget, this room logs it, flags it, and optionally intervenes.

**The proof:** These rooms run on real tasks. The code review room reviews real PRs. The security audit room audits real repos. The deployment approval room gates real deployments. And the results are published: what the rooms caught, what they missed, and how room-level governance compared to unstructured agent workflows.

**Definition of done:** Three rooms running in production, each with published metrics, each accepting FLUX policies from external contributors. The rooms are not demos — they are infrastructure.

The reason this matters: every other agent framework puts governance inside the agent (system prompts, tool restrictions, guardrails in the model). PLATO rooms put governance in the environment. This is a fundamentally different architecture, and the only way to prove it works is to run it on real tasks with real agents and show that room-level governance produces better outcomes.

### Bet C: The Cross-Implementation Showcase

**The question:** Is the abstraction correct?

**The build:** Take a real agent policy — the conservation enforcer from Bet A, or a room protocol from Bet B. Compile it to FLUX bytecode. Then run that bytecode, from the same `.bin` file, simultaneously on:

- The Python VM (in a server process)
- The Rust VM (as a CLI tool)
- The JavaScript VM (in a browser, visualized)

Same input. Same bytecode. Same output. Same conservation ledger state. Same protocol behavior.

Present this as a live, interactive demo. The user sees three panes: Python, Rust, JavaScript. They upload a `.bin` file. All three run it. All three produce identical traces. They can step through instruction by instruction and watch the conservation ledger update in real time.

**The proof:** Identical behavior across three independent implementations of the VM, running in three different language runtimes, on three different platforms. Not "compatible" — *identical*. The same way that a MIPS binary runs identically on QEMU and on real silicon.

**Definition of done:** A web page where anyone can upload a `.bin` file and watch it execute identically across three runtimes, with a visible conservation ledger and instruction trace.

This is the "Compiler Explorer for agent bytecode" idea, and it is the strongest unique selling point SuperInstance has. No other AI project can make this claim, because no other AI project has a bytecode format with multiple independent implementations. The moment someone sees a `.bin` file run identically in Python, Rust, and a browser, the abstraction stops being theoretical. It becomes obviously, viscerally real.

---

## 3. The Missing Layers

The foundation is solid. The three bets prove the thesis. But for SuperInstance to become a platform that other people build on, four layers need to exist that don't exist yet.

### Observability

There is currently no way to trace a FLUX bytecode execution in production. If an agent misbehaves, there is no profiler to tell you which instruction it was executing when it went wrong, what the conservation ledger looked like at that moment, or which room interaction triggered the deviation.

**What to build:** A FLUX profiler/debugger that produces three views:

1. **Instruction trace:** every opcode executed, in order, with operands and register state. Like `strace` for bytecode.
2. **Conservation ledger:** the state of all conservation quantities (attention, action potential, throughput) over time, so you can see the moment a budget is exceeded.
3. **Room interaction log:** every PLATO room enter/exit, every protocol message, every governance decision.

This is not a debugging tool for VM developers. It is an observability tool for agent operators — people running FLUX-enforced agents in production who need to answer the question "why did the agent do that?"

### Package Registry

The eight packages on PyPI and crates.io are libraries for *building* agents. What doesn't exist yet is a registry for *agent policies* — pre-compiled FLUX bytecode that does useful things.

**What to build:** A package registry where you can publish and install `.bin` files:

```
flux install deadband-controller     # A conservation-aware issue manager
flux install code-reviewer-v2        # A code review agent policy
flux install security-auditor        # A security audit agent policy
flux search "conservation"           # Find policies that enforce conservation laws
```

Each package includes: the `.bin` file, its source (the FLUX assembly it was compiled from), a manifest declaring which conservation laws it enforces, and conformance test results proving it behaves as claimed.

This is what makes FLUX a platform rather than a library. People should be able to install and run agent policies the way they install and run npm packages — except these packages are deterministic, inspectable, and conservation-enforced.

### Testing Framework for Agent Policies

The conformance suite tests the VMs — does each VM correctly implement the bytecode spec? What's missing is a framework for testing *agent policies* — does a given `.bin` file actually do what it claims?

**What to build:** A test framework that can:

1. **Verify claimed behavior:** Given a policy that claims to be a "code reviewer," run it against a test suite of diffs and verify that its output meets the claim.
2. **Verify conservation bounds:** Given a policy that claims to enforce an attention budget of N, subject it to adversarial input designed to exceed the budget. The budget must hold.
3. **Verify protocol compliance:** Given a policy that claims to participate in a PLATO room, verify that it correctly follows the room protocol under all conditions.

This is the difference between "we have a bytecode format" and "we have a trustworthy ecosystem." If you can't test that an agent policy does what it claims, you can't trust installed policies, and the package registry is useless.

### Visual Programming

Writing FLUX assembly by hand is like writing x86 assembly by hand: possible, educational, and not how anyone wants to work for real tasks.

**What to build:** A node-based visual editor where you compose FLUX programs by connecting blocks:

- A "Conservation Budget" block (sets a bounded quantity)
- A "Decision Point" block (branches based on input)
- A "Room Protocol" block (sends/receives PLATO messages)
- An "LLM Call" block (invokes a model within bounded parameters)

Each block compiles to a sequence of FLUX instructions. The visual program is a sugar over the assembly; the `.bin` output is the same. This means that policies created visually are identical in behavior to policies written by hand — and can be inspected, tested, and distributed through the same channels.

The goal is not to make FLUX "easy." It is to make the *composition of conservation laws* visual and intuitive. When someone can drag a "bounded attention" block into their agent and see the conservation ledger update, the abstraction clicks in a way that reading a spec never achieves.

---

## 4. The Growth Path

SuperInstance currently has incredible depth and near-zero visibility. This is not a problem to solve with marketing. It is a problem to solve with *demonstrations*.

### Phase 1: The Flagship Essay (Now)

The Conservation Law of Intelligence, rewritten for a general technical audience. Not a paper. Not a blog post. An essay — the kind of thing that someone reads at 1 AM and stays up until 3 AM thinking about.

Target: Hacker News front page. One shot. The essay should make a single claim — that AI agents need conservation laws the way physics needs conservation laws — and back it with the infrastructure that already exists: the bytecode, the cross-VM conformance, the room protocols.

The essay is not about SuperInstance. It is about the idea. SuperInstance is the proof that the idea can be built.

### Phase 2: Shareable Playground (1 Month)

The FLUX playground gets a "share your program" feature. Anyone can write a FLUX program in the browser, run it, and share a link. The link loads the program, runs it, and shows the trace.

This is the viral loop. Someone shares a FLUX program that does something interesting. Someone else opens the link, sees it run, modifies it, and shares their version. Each share is an implicit endorsement. Each modification is engagement.

The playground should also show conservation ledger state — so when someone shares a program that enforces an attention budget, the viewer can see the budget being enforced in real time. This is the "see it to believe it" moment.

### Phase 3: First External Contribution (3 Months)

The milestone that matters: someone outside SuperInstance does one of:

- Implements a FLUX VM in a new language (Go, Lua, WASM)
- Writes a PLATO room that does something we never thought of
- Publishes a `.bin` agent policy to the package registry
- Uses FLUX bytecode in a real system and writes about it

This is the moment the project stops being ours and starts being theirs. Everything in Phases 1 and 2 is designed to make this moment possible. The essay spreads the idea. The playground makes it tangible. The first external contribution makes it real.

### Phase 4: Proof in Production (6 Months)

The conservation enforcer (Bet A) is running on a real project. Not a demo — a real GitHub repository with real issues, real contributors, real messiness. The results are published: behavior comparisons, conservation violation logs, signal-to-noise measurements.

This is the thesis, proven. If the data shows that conservation-enforced agents behave better than unconstrained agents, SuperInstance has made its contribution to the field. Not "another agent framework" — a result that changes how people think about the problem.

---

## 5. What NOT to Build

The discipline to refuse good ideas is more important than the vision to pursue them.

**Don't build another LLM wrapper.** The entire point of FLUX is that deterministic decisions should not go through an LLM. An agent policy compiled to bytecode does not need a model call to decide "should I take this action?" — the bytecode decides, and the decision is deterministic. LLM calls are for understanding input and generating output, not for governance. If you find yourself routing conservation decisions through a model call, you have misunderstood the thesis.

**Don't build a SaaS.** The value is in the protocol and the bytecode format, not in hosting. A SaaS creates a dependency: if the service goes down, the agents stop working. A `.bin` file runs forever, anywhere, with no server. SuperInstance should be more like HTTP than like Vercel — a protocol that enables an ecosystem, not a product that owns one.

**Don't chase adoption metrics.** GitHub stars, PyPI download counts, and Discord member numbers are vanity metrics for a project like this. The right metric is: how many people deeply understand conservation laws for AI agents? Ten people who understand the thesis, can write FLUX bytecode, and can articulate why room-level governance matters are worth more than 10,000 stars from people who skimmed the README.

**Don't build more implementations of existing things.** The ecosystem has three FLUX VMs and five PLATO engines. That is sufficient. The next implementation should be motivated by a real need (a new language ecosystem, a new platform), not by the desire to have "N implementations." What connects the implementations matters more than how many there are.

**Don't build features without conservation laws.** Every feature should either enforce a conservation law, demonstrate a conservation law, or make conservation laws easier to use. If a feature does none of these, it belongs in a different project.

---

## The Horizon

SuperInstance has built something genuinely novel: a physics for AI behavior, implemented in real code, verified by real tests, running on real bytecode. The question was never "can this be built?" — it has been built. The question is "does it matter?"

It matters if it changes how people think. Not "do they use FLUX bytecode in production" — though that would be nice. But does the idea of conservation laws for AI agents enter the conversation? Does someone, reading about an LLM agent that went rogue, think "this would not have happened under a conservation constraint"? Does the phrase "room-level governance" become a concept that people use?

That is the horizon. Not adoption. Not revenue. Not even proof in production, though that is the closest proxy. The horizon is: does the idea become unavoidable?

The foundation is built. The next two years are about making the idea impossible to ignore.

---

*Written July 2026. The foundation is real. The bets are open. The horizon is clear.*
