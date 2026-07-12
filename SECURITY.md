# Security Policy

## Reporting a Vulnerability

We take security seriously. If you discover a vulnerability in any SuperInstance project, please report it responsibly.

### How to Report

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please either:

1. **Use GitHub's private vulnerability reporting:**
   - Navigate to the affected repo
   - Click **Security** → **Report a vulnerability**
   - Fill out the advisory form

2. **Email:** Send details to `security@superinstance.dev` (if available) or open a private advisory.

### What to Include

Please provide as much of the following as possible:

- Description of the vulnerability
- Steps to reproduce (proof of concept)
- Affected versions
- Potential impact
- Suggested fix (if any)

### Response Timeline

| Step | Expected Time |
|------|--------------|
| Acknowledgment | Within 48 hours |
| Initial assessment | Within 5 business days |
| Fix or mitigation | Within 30 days (severity-dependent) |
| Public disclosure | After fix is released, coordinated with reporter |

### Disclosure Policy

- We follow **coordinated disclosure**.
- We will credit reporters in advisory publications (unless you prefer to remain anonymous).
- We will not take legal action against reporters acting in good faith.

---

## Supported Versions

Each project maintains its own support policy. Generally:

- The latest minor release receives security fixes
- Critical fixes may be backported to the previous minor
- End-of-life versions will not receive patches

Check individual repo READMEs for specific version support.

---

## Security Best Practices for Contributors

- Never commit secrets, API keys, or credentials
- Use environment variables or secret managers
- Review dependencies for known vulnerabilities (`pip-audit`, `cargo audit`, `npm audit`)
- Follow the principle of least privilege in all code

---

<sub>This policy is a living document. Improvements welcome via PR.</sub>
