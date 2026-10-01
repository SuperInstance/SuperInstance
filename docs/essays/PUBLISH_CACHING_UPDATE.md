# Publishing the Agent Caching System Update

## Quick Release Checklist

### 1. Final Testing
```bash
# Run all tests
python3 -m pytest tests/test_agent_cache.py -v

# Run full test suite
python3 -m pytest tests/
```

### 2. Update Version (Already completed)
- ✅ Version updated in `pyproject.toml` to `0.1.1`

### 3. Update Changelog (Already completed)
- ✅ Added caching system release notes to `CHANGELOG.md`

### 4. Build the Package
```bash
# Clean previous builds
rm -rf dist/ build/ superinstance.egg-info/

# Build new packages
python3 -m pip install --upgrade build
python3 -m build
```

### 5. Publish to PyPI
```bash
# Install twine if needed
pip install twine

# Upload to PyPI
twine upload dist/*
```

### 6. Push to GitHub
```bash
# Create a git tag
git tag -a v0.1.1 -m "Release v0.1.1: Add agent caching system"

# Push changes and tags
git push origin main
git push origin v0.1.1
```

### 7. Create GitHub Release
1. Go to https://github.com/SuperInstance/superinstance/releases/new
2. Select tag `v0.1.1`
3. Add release notes:
   ```
   # SuperInstance SDK v0.1.1
   
   ## Agent Session Caching System
   Reduce model spin-up costs by 30-50% with reusable agent sessions.
   
   ### New Features:
   - Thread-safe LRU cache with TTL expiration
   - `AgentCache` class for custom caching pools
   - `get_agent()` helper function for seamless cached agent retrieval
   - Comprehensive documentation and examples
   - Complete unit test suite
   
   For full usage instructions, see `docs/AGENT_CACHING.md`.
   ```
4. Attach the built packages from the `dist/` directory
5. Publish the release

### 8. Post-Release Verification
```bash
# Install from PyPI
pip install superinstance==0.1.1

# Test the import
python3 -c "from superinstance import get_agent; print('Import successful!'); agent = get_agent('test'); print('Cached agent created:', agent)"
```

## What's Included

This release adds:
- `superinstance/agent_cache.py` - Core caching implementation
- Updated `superinstance/__init__.py` - Exported new public API
- Comprehensive documentation in `docs/AGENT_CACHING.md`
- Example scripts in `examples/agent-caching/`
- Complete unit tests in `tests/test_agent_cache.py`