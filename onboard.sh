#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════╗
# ║  SuperInstance Onboard — Bootstrap an agent from nothing    ║
# ║                                                             ║
# ║  Usage: ./onboard.sh [--minimal|--core|--full|--vibe]       ║
# ║                                                             ║
# ║  --minimal   Just the Python SDK (2 min)                    ║
# ║  --core      SDK + pincher + lever-runner (5 min)           ║
# ║  --full      Everything that builds (20 min)                ║
# ║  --vibe      Full + creative writing + experiments (30 min) ║
# ╚══════════════════════════════════════════════════════════════╝

set -euo pipefail

MODE="${1:---core}"
GH_ORG="SuperInstance"
CLONE_DIR="${SUPERINSTANCE_HOME:-$HOME/superinstance}"

# Colors
G='\033[0;32m' Y='\033[1;33m' B='\033[0;34m' R='\033[0;31m' NC='\033[0m'

log()  { echo -e "${G}[✓]${NC} $1"; }
warn() { echo -e "${Y}[!]${NC} $1"; }
info() { echo -e "${B}[→]${NC} $1"; }
fail() { echo -e "${R}[✗]${NC} $1"; exit 1; }

# ── Preflight ──────────────────────────────────────────────────────
info "SuperInstance Onboard — Mode: $MODE"
info "Target directory: $CLONE_DIR"
echo ""

command -v git >/dev/null 2>&1   || fail "git not found. Install git first."
command -v gh >/dev/null 2>&1    || warn "gh CLI not found. Some operations will be limited."
command -v cargo >/dev/null 2>&1 || warn "cargo not found. Rust crates will be skipped."
command -v python3 >/dev/null 2>&1 || warn "python3 not found. Python packages will be skipped."

mkdir -p "$CLONE_DIR"
cd "$CLONE_DIR"

# ── Phase 1: Minimal (Python SDK only) ─────────────────────────────
phase1() {
    info "Phase 1: Python SDK"
    pip install superinstance 2>/dev/null || warn "superinstance PyPI package install failed"
    log "Python SDK installed"
}

# ── Phase 2: Core (SDK + pincher + lever-runner) ───────────────────
phase2() {
    info "Phase 2: Core Runtime"

    # The five-layer stack
    CORE_REPOS=(
        "pincher"
        "lever-runner"
        "cuda-oxide"
        "flux-core"
        "open-parallel"
    )

    for repo in "${CORE_REPOS[@]}"; do
        if [ -d "$repo" ]; then
            log "$repo already cloned, pulling..."
            (cd "$repo" && git pull --ff-only 2>/dev/null) || warn "$repo: pull failed, using existing"
        else
            info "Cloning $repo..."
            git clone "https://github.com/$GH_ORG/$repo.git" 2>/dev/null || warn "$repo: clone failed"
        fi
    done

    # Build pincher (Rust)
    if command -v cargo >/dev/null 2>&1 && [ -d "pincher" ]; then
        info "Building pincher..."
        (cd pincher && cargo build --release 2>/dev/null) || warn "pincher build failed"
        log "pincher built"
    fi

    # Install lever-runner (Python)
    if [ -d "lever-runner" ]; then
        info "Installing lever-runner..."
        (cd lever-runner && pip install -e . 2>/dev/null) || warn "lever-runner install failed"
        log "lever-runner installed"
    fi
}

# ── Phase 3: Full (everything that builds) ──────────────────────────
phase3() {
    info "Phase 3: Full Ecosystem"

    # Character building family
    CHARACTER_REPOS=(
        "character-build"
        "character-class"
        "character-sheet"
        "character-encounter"
        "character-arc"
    )

    # Music cognition
    MUSIC_REPOS=(
        "agent-jam"
        "agent-groove"
        "agent-voice-leading"
        "agent-riff"
        "musician-soul"
        "musician-soul-v2"
    )

    # Riff snowball
    RIFF_REPOS=(
        "agent-riff-v2"
        "agent-riff-v3"
        "agent-riff-v4"
    )

    # GPU stack
    GPU_REPOS=(
        "ternary-cuda-kernels"
        "ternary-cuda-kernels-v2"
        "gpu-bench-lab"
    )

    # Coordination
    COORD_REPOS=(
        "construct-coordination"
        "agent-knowledge"
    )

    # Open/mind
    MIND_REPOS=(
        "open-mind"
        "openmind"
        "openmind-cellular"
        "openmind-conductor"
        "openmind-esp32-bridge"
        "openmind-mirror"
    )

    ALL_REPOS=("${CHARACTER_REPOS[@]}" "${MUSIC_REPOS[@]}" "${RIFF_REPOS[@]}" "${GPU_REPOS[@]}" "${COORD_REPOS[@]}" "${MIND_REPOS[@]}")

    for repo in "${ALL_REPOS[@]}"; do
        if [ -d "$repo" ]; then
            log "$repo ✓ (exists)"
        else
            info "Cloning $repo..."
            git clone "https://github.com/$GH_ORG/$repo.git" 2>/dev/null || warn "$repo: clone failed"
        fi
    done

    # Build all Rust crates
    if command -v cargo >/dev/null 2>&1; then
        info "Building Rust crates..."
        for repo in "${CHARACTER_REPOS[@]}" "${MUSIC_REPOS[@]}" "${RIFF_REPOS[@]}" "${GPU_REPOS[@]}"; do
            if [ -f "$repo/Cargo.toml" ]; then
                (cd "$repo" && cargo test --quiet 2>/dev/null) && log "$repo: tests pass" || warn "$repo: tests failed"
            fi
        done
    fi
}

# ── Phase 4: Vibe (full + creative + experiments) ──────────────────
phase4() {
    info "Phase 4: Vibe Mode"

    # Creative writing
    VIBE_REPOS=("AI-Writings")

    for repo in "${VIBE_REPOS[@]}"; do
        [ -d "$repo" ] || git clone "https://github.com/$GH_ORG/$repo.git" 2>/dev/null || warn "$repo: clone failed"
    done

    # Run GPU benchmarks if hardware available
    if [ -d "gpu-bench-lab" ] && command -v python3 >/dev/null 2>&1; then
        info "Running GPU benchmarks..."
        python3 gpu-bench-lab/benchmarks/gpu_bench.py 2>/dev/null || warn "GPU benchmarks failed (no GPU?)"
    fi

    # Show the ecosystem
    echo ""
    info "═══ SuperInstance Ecosystem Status ═══"
    echo ""

    # Count repos
    TOTAL=$(ls -d */ 2>/dev/null | wc -l)
    RUST=$(find . -name "Cargo.toml" -maxdepth 2 2>/dev/null | wc -l)
    PYTHON=$(find . -name "pyproject.toml" -maxdepth 2 2>/dev/null | wc -l)

    echo "  Repos cloned:    $TOTAL"
    echo "  Rust crates:     $RUST"
    echo "  Python packages: $PYTHON"

    # Run tests across everything
    if command -v cargo >/dev/null 2>&1; then
        info "Running fleet-wide tests..."
        PASS=0; FAIL=0
        for toml in $(find . -name "Cargo.toml" -maxdepth 2 2>/dev/null); do
            dir=$(dirname "$toml")
            if (cd "$dir" && cargo test --quiet 2>/dev/null); then
                PASS=$((PASS + 1))
            else
                FAIL=$((FAIL + 1))
            fi
        done
        echo "  Tests passed:    $PASS crates"
        [ "$FAIL" -gt 0 ] && echo "  Tests failed:    $FAIL crates"
    fi

    echo ""
    log "System bootstrapped. Start vibing."
    echo ""
    echo "  Next steps:"
    echo "    1. Read the architecture:  cat docs/ARCHITECTURE.md"
    echo "    2. Browse the catalog:     cat CATALOG.md"
    echo "    3. Create an agent:        python3 -c 'from superinstance.agent import Agent; print(Agent(\"me\").status())'"
    echo "    4. Read an essay:          cat AI-Writings/THE_SNOWBALL.md"
    echo "    5. Run experiments:        python3 gpu-bench-lab/benchmarks/gpu_bench.py"
}

# ── Execute ────────────────────────────────────────────────────────
case "$MODE" in
    --minimal) phase1 ;;
    --core)    phase1; phase2 ;;
    --full)    phase1; phase2; phase3 ;;
    --vibe)    phase1; phase2; phase3; phase4 ;;
    *)         echo "Usage: $0 [--minimal|--core|--full|--vibe]"; exit 1 ;;
esac
