# Publishing the SuperInstance SDK

This guide walks you through publishing updated versions of the `superinstance` Python package to GitHub and PyPI.

## Prerequisites

1. **GitHub Access**: You have push permissions to the SuperInstance GitHub repo
2. **PyPI Access**: You have maintainer permissions for the `superinstance` package on PyPI
3. **Local Setup**: Install required dev dependencies:
   ```bash
   pip install -e .[dev]
   ```

## Step 1: Update Version Number

Update the version number in `pyproject.toml`:

```toml
[project]
version = "0.1.1"  # Increment this for new releases
```

## Step 2: Run Tests

Ensure all tests pass before publishing:

```bash
# Run all tests
python3 -m pytest tests/

# Run with coverage
python3 -m pytest tests/ --cov=superinstance --cov-report=term-missing
```

## Step 3: Update Changelog

Update the `CHANGELOG.md` file with your changes:

```markdown
## v0.1.1 (2026-06-14)
- Added agent caching system to reduce model spin-up costs
- Added `AgentCache` class with LRU eviction and TTL support
- Added `get_agent()` and `get_default_cache()` helper functions
- Added comprehensive documentation and examples
- Added unit tests for caching functionality
```

## Step 4: Build the Package

Clean and build the distribution packages:

```bash
# Clean previous builds
rm -rf dist/ build/ superinstance.egg-info/

# Build new packages
python3 -m pip install --upgrade build
python3 -m build
```

This will create two files in the `dist/` directory:
- `superinstance-<version>-py3-none-any.whl`
- `superinstance-<version>.tar.gz`

## Step 5: Publish to PyPI

Use twine to upload the packages to PyPI:

```bash
# Install twine if needed
pip install twine

# Upload to PyPI
twine upload dist/*
```

You will be prompted for your PyPI username and password (or API token).

## Step 6: Push to GitHub

Tag the release and push to GitHub:

```bash
# Create a git tag
git tag -a v0.1.1 -m "Release v0.1.1: Add agent caching system"

# Push changes and tags
git push origin main
git push origin v0.1.1
```

## Step 7: Update GitHub Releases

Create a formal GitHub release:
1. Go to https://github.com/SuperInstance/superinstance/releases/new
2. Select your tag (v0.1.1)
3. Add release notes summarizing your changes
4. Attach the built packages from the `dist/` directory
5. Publish the release

## Post-Release Verification

Verify the package is available:

```bash
# Install from PyPI
pip install superinstance==0.1.1

# Test the import
python3 -c "from superinstance import get_agent; print('Import successful!')"
```

## Publishing the Caching System Update

For this specific caching system release:
1. Follow all steps above
2. Make sure to highlight the new caching functionality in your release notes
3. Update the README and documentation to reflect the new features

## Troubleshooting

### PyPI Publish Errors
- **403 Forbidden**: Check your PyPI credentials and permissions
- **File already exists**: You already uploaded this version; increment the version number
- **Missing dependencies**: Run `pip install --upgrade build twine`

### Test Failures
- Fix any failing tests before publishing
- Run tests with coverage to identify untested code

### Import Errors
- Make sure you've installed the package correctly
- Check that your Python environment is not corrupted

## Automated CI/CD (Coming Soon)

We will soon add GitHub Actions workflows to automate:
- Automatic testing on every push
- Automated building and publishing to PyPI on tag creation
- Automated GitHub release creation