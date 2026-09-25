# DAST Report

**Project:** Payments Revamp
**Date:** 2026-09-12
**Author:** Priya Nair

## Scope and Tooling

- Tool(s) used: OWASP ZAP 2.15 (authenticated active scan)
- Environment tested: `https://staging.payments-revamp.internal`
- Endpoints / URLs in scope: `/api/v1/*`, `/checkout/*`, `/account/*` (42 endpoints total)

## Findings Table

Scan surfaced 3 findings requiring attention across the checkout and account flows. The most
serious is the critical session-fixation issue on the org-switch endpoint, detailed below.

| # | Severity | Category (e.g. Auth, Session, Injection) | Endpoint | Description |
|---|----------|--------------------------------------------|----------|--------------|
| 1 | High | Session | `/api/v1/account/switch-org` | Session token not rotated after organization switch, allowing reuse of pre-switch token |
| 2 | Medium | Auth | `/api/v1/checkout/apply-coupon` | Endpoint accessible without re-authentication after 30-minute idle timeout elapses on adjacent tabs |
| 3 | Medium | Injection | `/api/v1/account/search` | Reflected input in search query parameter not fully sanitized in error response |
| 4 | Low | Information Disclosure | `/api/v1/health` | Verbose server/version banner exposed in response headers |

## Remediation Status

| Finding # | Status (Open / Fixed / Accepted Risk) | Notes |
|-----------|----------------------------------------|-------|
| 1         | Open | Fix planned for next sprint, tracked as PAY-4041 |
| 2         | Open | Under investigation with session team |
| 3         | Fixed | Output encoding added to search error path |
| 4         | Accepted Risk | Low sensitivity; banner suppression scheduled as a hardening task, not release-blocking |
