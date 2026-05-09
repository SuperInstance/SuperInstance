# Contributing to SuperInstance

Thank you for your interest in contributing to the SuperInstance fleet.

## Quick Start

```bash
# Clone the fleet
git clone https://github.com/SuperInstance/superinstance.git
cd superinstance

# Set up your environment
# (add your setup steps here)

# Run tests
cargo test --workspace  # Rust crates
npm test                # Node packages
```

## Project Structure

```
superinstance/
├── fleet/                    # Fleet infrastructure services
│   ├── keeper/              # Authentication & routing
│   ├── agent-api/           # Agent coordination API
│   └── plato.py             # PLATO room server
├── repos/                   # All fleet repos live here
│   ├── fleet-coordinate/    # Fleet coordination math
│   ├── fleet-spread/        # Captain deliberation
│   ├── holonomy-consensus/  # Zero-holonomy consensus
│   └── ...                  # 30+ more
└── docs/                    # Fleet documentation
```

## Adding a New Repo

1. Create the repo under `repos/<your-repo>/`
2. Add a `README.md` with: what it does, how to build/test, how it connects to the fleet
3. Add GitHub Actions CI (see `.github/workflows/` in any existing repo)
4. Add it to the fleet overview in `docs/fleet-identity.md`
5. Seed PLATO rooms: `fleet_health`, `<repo>_status`

## Code Standards

- **Rust**: `cargo clippy --fix` clean, 0 warnings before pushing
- **TypeScript**: strict mode, compile clean
- **Python**: type hints, pytest passing
- **Tests**: all new features require tests

## Commit Messages

Format: `type: short description`

Types: `feat`, `fix`, `docs`, `chore`, `test`, `refactor`

Examples:
- `feat: add crystal_sync drift detection`
- `fix: clippy needless_range_loop in consensus.rs`
- `docs: add integration guide for fleet-coordinate`

## PLATO Rooms

The fleet communicates through PLATO rooms. Each repo should:
- Write operational state to `<repo>_status` room
- Write architecture decisions to `oracle1_infrastructure`
- Read from `fleet_health` for fleet-wide state

## Getting Help

- GitHub Issues: https://github.com/SuperInstance/superinstance/issues
- Discussion: https://github.com/SuperInstance/superinstance/discussions
- Internal: PLATO `fleet_communication` room

## The Dojo Model

SuperInstance runs on the dojo model: crew come in behind, learn everything, produce real value, leave equipped. All paths are good paths. When you contribute, you're not just fixing something — you're teaching the fleet how to be better.

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
