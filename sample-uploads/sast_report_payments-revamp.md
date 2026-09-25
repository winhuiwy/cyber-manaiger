# SAST Report

**Project:** Payments Revamp
**Date:** 2026-09-10
**Author:** Priya Nair

## Scope and Tooling

- Tool(s) used: Semgrep 1.78 (`p/owasp-top-ten`, `p/secrets` rulesets), CodeQL for the Java services
- Codebase / repositories scanned: `payments-api` (commit `a3f9c1e`), `payments-worker` (commit `9b2d7f0`)
- Lines of code scanned: ~48,000

## Findings Table (severity, CWE, location)

| # | Severity | CWE | File / Line | Description |
|---|----------|-----|-------------|--------------|
| 1 | High | CWE-798 | `payments-api/src/config/db.py:14` | Database credentials hardcoded as a fallback default in connection string constructor |
| 2 | High | CWE-89 | `payments-api/src/reports/export.py:87` | Raw SQL string concatenation for report filter parameters |
| 3 | Medium | CWE-327 | `payments-worker/src/crypto/hash_util.java:22` | MD5 used for transaction dedup hashing (non-security use, but flagged by rule) |
| 4 | Medium | CWE-209 | `payments-api/src/api/errors.py:41` | Stack trace included in API error response body when `DEBUG=true` |
| 5 | Low | CWE-1004 | `payments-api/src/auth/session.py:63` | Session cookie missing `HttpOnly` flag in local dev config |

## Remediation Status

| Finding # | Status (Open / Fixed / Accepted Risk) | Notes |
|-----------|----------------------------------------|-------|
| 1         | Fixed | Removed hardcoded fallback, credentials now sourced from Vault only |
| 2         | Fixed | Migrated to parameterized query via SQLAlchemy |
| 3         | Accepted Risk | Non-security dedup use case only; ticket PAY-4021 tracks migration to SHA-256 for consistency |
| 4         | Fixed | Error handler rewritten to never include stack traces in API responses in any environment (dev, staging, prod), regardless of `DEBUG` value; returns a generic message with an internal correlation ID instead. Verified via regression test suite. |
| 5         | Open | Dev-only config, scheduled for cleanup in next sprint (PAY-4030) |
