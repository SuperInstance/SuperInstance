# Contributing to SuperInstance

Thanks for your interest in contributing! SuperInstance is a living ecosystem of agent infrastructure — every contribution matters.

---

## How to Contribute

### 1. Fork & Clone

```bash
gh repo fork SuperInstance/SuperInstance --clone
cd SuperInstance
```

### 2. Create a Branch

```bash
git checkout -b feat/my-improvement
```

Use a descriptive branch name:
- `feat/` — new features
- `fix/` — bug fixes
- `docs/` — documentation
- `sketch/` — experimental work

### 3. Make Your Changes

- **Match existing patterns.** Look at surrounding code and follow the same style.
- **Run the formatter.** Each repo has its own — check the repo's README for the command.
- **Write tests.** New behavior needs test coverage.

### 4. Test

All PRs must pass CI. Before pushing:

```bash
# Look for a Makefile, justfile, or package.json scripts
make test        # or: just test, npm test, cargo test
```

### 5. Open a Pull Request

```bash
gh pr create --title "feat: short description" --body "What changed and why"
```

Reference any related issues (`Closes #123`).

---

## Code Style

- **Match the file you're editing.** Consistency beats perfection.
- Use the project's formatter and linter — don't argue with them.
- Comments explain *why*, not *what*.
- Keep functions focused. If it does three things, it's three functions.

---

## Living Repo Doctrine

SuperInstance repos are **living repos**. That means:

- 📝 **Sketches welcome.** Not everything needs to be polished to merge. Rough drafts, exploratory code, and work-in-progress are all valid.
- 🌱 **Growth over gates.** We'd rather merge a rough idea and iterate than reject good thinking.
- 🔄 **Iterate in the open.** PRs are conversations, not exams. Ask questions, show work, learn together.
- ⚡ **Ship and refine.** Breaking changes are fine with a major version bump. Don't let perfectionism block progress.

---

## Adding New Implementations

### FLUX Implementations

FLUX is a wire protocol spec. To add a new language implementation:

1. **Read the spec:** [flux-spec](https://github.com/SuperInstance/flux-runtime/blob/main/SPEC.md)
2. **Follow the bytecode format exactly.** Opcodes, encoding, and semantics are frozen.
3. **Implement the conformance test suite.** Every FLUX implementation must pass the shared test suite.
4. **Name it `flux-<lang>`.** Place it under the SuperInstance org.
5. **Register it** in [PACKAGES.md](./PACKAGES.md).

### PLATO Implementations

PLATO defines a room-level agent runtime. To add a new implementation:

1. **Read the spec:** [plato-spec](https://github.com/SuperInstance/plato-spec)
2. **Implement the room protocol:** lifecycle hooks, message routing, state transitions.
3. **Follow the room contract.** Entry, exit, perception, and action APIs must match.
4. **Name it `plato-<lang>`.** Place it under the SuperInstance org.
5. **Register it** in [PACKAGES.md](./PACKAGES.md).

---

## Communication

- **[GitHub Issues](https://github.com/SuperInstance/SuperInstance/issues)** — Bug reports, feature requests, tracking work
- **[GitHub Discussions](https://github.com/SuperInstance/SuperInstance/discussions)** — Questions, ideas, design conversations

We keep everything on GitHub. No Slack, no Discord, no hidden channels. If it matters, it's in an issue or discussion.

---

## Code of Conduct

Be excellent to each other. Disagreements are fine — disrespect is not.

---

<sub>This is a living document. PRs to improve it are always welcome.</sub>
