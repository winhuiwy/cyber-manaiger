# CyberManAIger

A proof-of-concept for a cybersecurity compliance assistant, scoped to
software project cyber-security requirements. The goal is to compress a review that
would otherwise take a human verifier weeks or months into minutes — helping teams
move fast, not gatekeeping them. Every project must produce a SAST, DAST, Dependency
Check, Automated Pentest, and Manual Pentest report, plus an Overall Security Report
consolidating findings and dispositions.

## Stack

- `backend/` — FastAPI. Rules engine (pre-authored `rules.json`), OpenAI-powered
  policy Q&A (context-stuffed RAG over `app/data/policies/`), and OpenAI-powered
  document review (completeness + quality + cross-document consistency checks).
  Data is stored as flat JSON files under `backend/app/storage_files/` — no DB
  needed for the POC.
- `frontend/` — Next.js (App Router, TypeScript, Tailwind). Project checklist,
  template downloads, document upload/review, and a policy Q&A chat panel.

## Running it

### Backend

```bash
cd backend
python3 -m venv .venv          # already created if you just scaffolded this
.venv/bin/pip install -r requirements.txt
cp .env.example .env           # then fill in OPENAI_API_KEY
.venv/bin/uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
cp .env.local.example .env.local   # defaults to http://localhost:8000
npm run dev
```

Open http://localhost:3000 — it auto-creates a default "Software Project" on first
load and takes you straight to the checklist, no setup step needed.

## What's stubbed for the POC

- Single project type ("Software Project"), single implicit user, no auth.
- Rules are pre-authored in `backend/app/data/rules.json` — no rule-extraction
  UI (see the full plan for that as a later phase).
- Policy Q&A stuffs the (short) policy doc directly into the prompt instead of
  using a vector store — fine at this corpus size, swap for real retrieval if
  the policy corpus grows.
- No manager/officer dashboard, no external integrations (SSO, Slack, Jira),
  no audit log — these were explicitly cut from POC scope.

## Demo script

All six checklist items are open from the start — there's no upload order or
locking, so you can work on any of them at any time. `sample-uploads/` has one
pre-filled sample per document type, each written to land on a specific badge:

- `sast_report_payments-revamp.md` — clean, no issues (green "No issues" badge).
- `dast_report_payments-revamp.md` — a finding-count mismatch and a severity
  called out inconsistently in the text vs. the table (amber "suggestions" badge).
- `dependency_check_report_payments-revamp.md` — the Remediation Status section
  is left as `[TBD]` (orange "section missing" badge).
- `automated_pentest_report_payments-revamp.md` — clean and well-documented, even
  though every finding is a confirmed false positive (green "No issues" badge —
  the badge is about documentation quality, not the findings themselves).
- `manual_pentest_report_payments-revamp.md` — thin, one-line risk-rating
  justifications (amber "suggestions" badge); it also reports one finding
  (an IDOR on the invoice-download endpoint) that automated pentest never caught.
- `overall_security_report_payments-revamp.md` — consolidates all five reports
  correctly except two deliberate gaps: it claims the SAST MD5 finding was
  "Remediated" when SAST actually says "Accepted Risk," and it omits the manual
  pentest's invoice-IDOR finding entirely (violet "mismatches" badge).

1. Open the checklist — all six items show "Missing" (red).
2. Ask "Why do I need a manual pentest if I already ran an automated one?" in
   the Q&A panel — answer cites §4.2 of the policy.
3. Download a template, or skip straight to uploading the matching file from
   `sample-uploads/` for each of the five base reports — watch each one land on
   the badge described above and expand "View details" to see why.
4. Upload the Overall Security Report — see the violet "mismatches" badge, and
   expand it to see both the SAST contradiction and the omitted finding flagged
   by name, each citing which source report it came from.

## Future enhancements
- CVE checker - checks CVEs listed in the reports and cross-checks them against what's online
- EOS/EOL checker - checks libraries using internet and notifies if any of them is reaching EOS/EOL - this would require patching or waivers according to policy
- After first 5 documents are uploaded, click a button to auto-generate the overall report - eliminates manual copying, prevents mismatches
- AI to edit the documents directly instead of stating suggestions (how to have guardrails for this?)
- For the 5 excluding overall report, we only have one report each for now. But in practice there should be one scanner-generated report AND one organisation-specific report in which the project manager should input their response to each finding (false positive/remediated/mitigated/justified). There can be a feature to auto-generate the org-specific report from the scanner report, and project manager would only need to fill in their response.
