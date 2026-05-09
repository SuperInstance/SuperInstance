#!/usr/bin/env bash
# cross-ref-badge.sh — Generate a cross-reference badge for a repo
# Usage: bash scripts/cross-ref-badge.sh <repo-name>
# Output: markdown block to paste into the repo's README

REPO="${1:?Usage: cross-ref-badge.sh <repo-name>}"

# Fetch repo description
DESC=$(gh api "repos/SuperInstance/$REPO" --jq '.description' 2>/dev/null || echo "")
DEPENDS=$(gh api "repos/SuperInstance/$REPO/contents/Cargo.toml" --jq '.content' 2>/dev/null | base64 -d 2>/dev/null | grep -E '^[a-zA-Z0-9_-]+\s*=' | head -3 | tr '\n' ' ' || echo "")

echo "[![SuperInstance](https://img.shields.io/badge/SuperInstance-$REPO-48dbfb)](https://github.com/SuperInstance/$REPO)"
echo ""
echo "## Meta"
echo ""
echo "**Domain:** (categorize me)"
echo "**Depends on:** (list dependencies)"
echo "**Depended by:** (list dependents)"
echo "**Implements:** (list concepts)"
