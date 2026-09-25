# Software Security Governance Policy

**Document ID:** SEC-POL-01
**Effective Date:** 2026-01-01
**Owner:** Information Security Office
**Applies to:** All software projects prior to production release

## 1. Purpose and Scope

This policy defines the mandatory security assessments and documentation that every
software project must complete before it may be released to production. It applies to
all internally developed and vendor-customized software handling company data.

## 2. Definitions

- **Finding**: A discrete security weakness identified by a scan, test, or reviewer,
  with an assigned severity (Critical, High, Medium, Low, Informational).
- **Disposition**: The project team's documented response to a finding — Remediated,
  Accepted Risk, False Positive, or In Progress — with supporting justification.
- **Stage Gate**: A checkpoint in the project lifecycle at which required
  documentation must be complete before the project may proceed.

## 3. Pre-Release Security Testing

### 3.1 Static Application Security Testing (SAST)

Every project must run static analysis against its full codebase prior to release.
A **SAST Report** must be produced documenting the tooling used, scope of code
scanned, the full findings table (severity, CWE classification, file/line location),
and the current remediation status of each finding. SAST must be re-run after any
material code change following the initial scan.

### 3.2 Dynamic Application Security Testing (DAST)

Every externally-reachable application must undergo dynamic testing against a
running instance of the application in a non-production environment. A **DAST
Report** must document the tooling used, scope (URLs/endpoints tested), the full
findings table, and remediation status. DAST findings often surface issues SAST
cannot detect, such as authentication and session-handling flaws, and so DAST is
required in addition to, not instead of, SAST.

### 3.3 Dependency and Software Composition Analysis

Every project must scan all third-party libraries and dependencies for known
vulnerabilities (CVEs) prior to release. A **Dependency Check Report** must
document the scanning tool, the full dependency findings table (package, version,
CVE identifier, severity), and remediation status (upgrade, patch, or accepted
risk) for each flagged dependency.

## 4. Penetration Testing

### 4.1 Automated Penetration Testing

Every project must undergo automated penetration testing using recognized tooling
against a staging or pre-production environment. An **Automated Pentest Report**
must document scope, methodology/tooling, the full findings table, and
remediation status.

### 4.2 Manual Penetration Testing

Every project must additionally undergo manual penetration testing performed by a
qualified tester, regardless of the results of automated testing. Automated tools
are effective at detecting known vulnerability classes and misconfigurations, but
cannot reliably identify business-logic flaws, privilege-escalation chains, or
context-specific abuse cases — these require human judgement. A **Manual Pentest
Report** must document scope, methodology, the full findings table, an explicit
risk-rating rationale for each finding, and remediation status.

## 5. Consolidated Reporting

Before a project may pass its final security stage gate, the project team must
produce an **Overall Security Report** that consolidates every finding raised
across the SAST, DAST, Dependency Check, Automated Pentest, and Manual Pentest
reports into a single findings table, cross-referencing each finding's source
report. For every consolidated finding, the project team must record a
**disposition and written justification** (Remediated, Accepted Risk, False
Positive, or In Progress). Findings left without a disposition and justification
are treated as open blockers to release. The Overall Security Report requires
sign-off from the project's designated security lead.

## 6. Non-Compliance

A project that reaches its release stage gate without all six required documents
(SAST, DAST, Dependency Check, Automated Pentest, Manual Pentest, and Overall
Security Report, each complete per the sections above) is considered non-compliant
and must not be released until remediated.
