# Dependency Check Report

**Project:** Payments Revamp
**Date:** 2026-09-10
**Author:** Marcus Lee

## Scanning Tool

- Tool used: OWASP Dependency-Check 10.0 + `npm audit` for the frontend package
- Manifest files scanned: `payments-api/requirements.txt`, `payments-worker/pom.xml`, `payments-web/package.json`

## Dependency Findings Table (package, version, CVE, severity)

| # | Package | Version | CVE | Severity |
|---|---------|---------|-----|----------|
| 1 | `requests` | 2.28.1 | CVE-2026-31402 | Medium |
| 2 | `jackson-databind` | 2.13.2 | CVE-2026-30559 | High |
| 3 | `axios` | 1.5.0 | CVE-2026-33871 | Medium |
| 4 | `pillow` | 9.2.0 | CVE-2026-34120 | Critical |
| 5 | `lodash` | 4.17.19 | CVE-2026-31998 | High |

## Remediation Status

[TBD]
