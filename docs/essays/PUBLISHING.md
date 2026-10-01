# Publishing & Registry Secrets

Each package auto-publishes when a `v*` tag is pushed. Before the workflows will work,
the following secrets must be added to each repo's **Settings → Secrets and variables → Actions**:

## PyPI Packages

| Repo | PyPI Package | Secret Required |
|------|-------------|-----------------|
| `flux-runtime` | `flux-vm` | `PYPI_API_TOKEN` |
| `plato-core` | `plato-core` | `PYPI_API_TOKEN` |
| `exocortex` | `si-exocortex` | `PYPI_API_TOKEN` |

Create the token at <https://pypi.org/manage/account/token/> (scope: "Entire account" or per-project).

## crates.io Packages

| Repo | crates.io Crate | Secret Required |
|------|----------------|-----------------|
| `flux-core` | `fluxvm` | `CARGO_REGISTRY_TOKEN` |
| `ternary-science` | `ternary-science` | `CARGO_REGISTRY_TOKEN` |
| `categorical-agents` | `categorical-agents` | `CARGO_REGISTRY_TOKEN` |

Create the token at <https://crates.io/settings/tokens> (scope: "publish-new" or "publish-update").

## Releasing

```bash
git tag v0.1.0
git push origin v0.1.0
```

The `publish.yml` workflow fires automatically and pushes the build artifacts to the registry.
