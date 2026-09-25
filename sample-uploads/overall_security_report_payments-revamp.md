# Overall Security Report

**Project:** Payments Revamp
**Date:** 2026-09-19
**Security Lead:** Devon Ashworth

## Consolidated Findings Table (source report, finding, severity)

| # | Source Report | Finding | Severity |
|---|----------------|---------|----------|
| 1 | SAST | Hardcoded database credentials used as connection-string fallback | High |
| 2 | SAST | SQL string concatenation in report export filters | High |
| 3 | SAST | MD5 used for transaction dedup hashing | Medium |
| 4 | SAST | Stack trace included in API error response when `DEBUG=true` | Medium |
| 5 | SAST | Session cookie missing `HttpOnly` flag in local dev config | Low |
| 6 | DAST | Session token not rotated after organization switch | High |
| 7 | DAST | Checkout endpoint accessible without re-auth after idle timeout | Medium |
| 8 | DAST | Reflected input in account search error response | Medium |
| 9 | DAST | Verbose server/version banner exposed | Low |
| 10 | Dependency Check | `requests` 2.28.1 — CVE-2026-31402 | Medium |
| 11 | Dependency Check | `jackson-databind` 2.13.2 — CVE-2026-30559 | High |
| 12 | Dependency Check | `axios` 1.5.0 — CVE-2026-33871 | Medium |
| 13 | Dependency Check | `pillow` 9.2.0 — CVE-2026-34120 | Critical |
| 14 | Dependency Check | `lodash` 4.17.19 — CVE-2026-31998 | High |
| 15 | Automated Pentest | Suspected SQL injection on report export endpoint | Medium |
| 16 | Automated Pentest | Potential XXE on invoice upload endpoint | Medium |
| 17 | Automated Pentest | Suspected directory listing on `/static/reports/` | Low |
| 18 | Automated Pentest | Outdated jQuery (CVE-2020-11022) detected | Low |
| 19 | Manual Pentest | IDOR in refund workflow — cross-tenant refunds possible | Critical |
| 20 | Manual Pentest | Privilege escalation via org-invite race condition | High |
| 21 | Manual Pentest | Coupon reapplication via cached idempotency key | Medium |

## Disposition and Justification per Finding

| Finding # | Disposition (Remediated / Accepted Risk / False Positive / In Progress) | Justification |
|-----------|----------------------------------------------------------------------------|----------------|
| 1 | Remediated | Hardcoded fallback removed; credentials now sourced exclusively from Vault. |
| 2 | Remediated | Query migrated to parameterized form via SQLAlchemy. |
| 3 | Remediated | Migrated to SHA-256 for transaction dedup hashing. |
| 4 | Remediated | Debug mode disabled by default in production; stack traces stripped from API error responses. |
| 5 | In Progress | Dev-only configuration, not present in any deployed environment; cleanup scheduled under PAY-4030. |
| 6 | In Progress | Fix planned for next sprint under PAY-4041; session rotation logic being added to the org-switch endpoint. |
| 7 | In Progress | Under investigation with the session team; root cause suspected to be a client-side idle-timer edge case across tabs. |
| 8 | Remediated | Output encoding added to the search error-response path. |
| 9 | Accepted Risk | Low sensitivity information disclosure; banner suppression scheduled as a general hardening task, not release-blocking. |
| 10 | Remediated | Upgraded to 2.31.0. |
| 11 | Remediated | Upgraded to 2.15.3. |
| 12 | Remediated | Upgraded to 1.7.7. |
| 13 | Remediated | Upgraded to 10.0.1; image-processing regression suite re-run and passing. |
| 14 | Remediated | Upgraded to 4.17.21. |
| 15 | False Positive | Manually re-tested with `sqlmap` and hand-crafted payloads; the query is parameterized and no injection is possible. Scanner false-triggered on a templated error page. |
| 16 | False Positive | Endpoint only accepts `application/json`; XML content-type requests are rejected with `415` before parsing. Scanner matched on an XML sample in the published OpenAPI schema, not actual behavior. |
| 17 | False Positive | Custom internal 403 error template contains the literal text "Index of" but no file enumeration is possible; confirmed by manual testing. |
| 18 | False Positive | Flagged asset belongs to a deprecated marketing microsite excluded from the production build; never served to end users. |
| 19 | In Progress | Root cause confirmed — refund service validates order existence but not order ownership; ownership check in code review, targeted for next release under PAY-4050. Interim compensating control: finance ops is manually reviewing all refund requests over $500 daily until the fix ships. |
| 20 | In Progress | Race condition fix scoped and in code review. Interim compensating control: invite-acceptance endpoint has been rate-limited to reduce the exploit window. |
| 21 | Remediated | Idempotency key is now scoped to coupon-consumption state, preventing replay against an already-applied coupon. |

## Security Lead Sign-off

Name: Devon Ashworth
Date: 2026-09-19
Signature: D. Ashworth

Note: Findings 19 and 20 (Critical / High, Manual Pentest) remain In Progress with compensating
controls in place. Recommend re-review before general availability release.
