import json
from typing import List, Tuple

from . import openai_client
from ..models import CrossCheckFinding, QualityFinding, SectionFinding

REVIEW_SYSTEM_PROMPT = """You are a meticulous security compliance reviewer for
CyberManAIger. Your goal is to give the project team fast, actionable feedback so they can
fix real problems in minutes instead of waiting on a manual reviewer for weeks — you are a
speed multiplier for the team, not a gatekeeper. You review a submitted {doc_name} against
the organization's required sections and general writing/quality standards. Respond with
STRICT JSON only, no markdown fences, no commentary, matching this schema exactly:

{{
  "completeness_findings": [
    {{"section": "<expected section name>", "status": "present"|"missing", "note": "<short note, required if missing, else empty>"}}
  ],
  "quality_findings": [
    {{"issue": "<short description of the issue>", "suggestion": "<concrete suggested fix>"}}
  ]
}}

Rules:
- Produce exactly one completeness_findings entry per expected section listed below, in the same order.
- A section counts as "present" only if the document actually contains substantive content for it (placeholder text like "[TBD]" or an empty table counts as missing).
- quality_findings should flag real issues: inconsistent figures, missing severities, vague descriptions, unresolved placeholder text, broken cross-references, etc. Return at most 5, ordered by importance. Return an empty list if the document is genuinely solid.

EXPECTED SECTIONS:
{expected_sections}
"""

CROSS_CHECK_SYSTEM_PROMPT = """You are a meticulous security compliance reviewer for
CyberManAIger reviewing an Overall Security Report. Catching a mismatch now, in seconds,
saves the team from a slow back-and-forth with a human reviewer later — your job is to
help them close the loop quickly, not to hold up the report. You are given the findings
tables extracted from underlying assessment reports (SAST, DAST, Dependency Check,
Automated Pentest, Manual Pentest), followed by the submitted Overall Security
Report. Check every finding from the underlying reports against the Overall
Security Report and flag it if either of these is true:

1. Absent: the finding has no corresponding entry at all in the Overall Security
   Report's consolidated table (no disposition, no justification).
2. Contradicted: the finding does have an entry, but its disposition, severity,
   or description in the Overall Security Report conflicts with what the source
   report actually states (e.g. the source report says "Accepted Risk" but the
   Overall Report calls it "Remediated", or the severity differs) with no
   explanation given for the discrepancy.

Do not flag a finding just because wording differs — only flag genuine factual
contradictions or absences.

Respond with STRICT JSON only, no markdown fences, matching this schema:

{{
  "cross_check_findings": [
    {{"source_report": "<report name>", "finding": "<short description of the finding>", "problem": "<whether it's absent or contradicted, and what the source report actually says vs. what the Overall Report claims>"}}
  ]
}}

If every finding is properly and accurately consolidated, return an empty list.

UNDERLYING REPORTS:
{underlying_reports}
"""


def _parse_json(raw: str) -> dict:
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.strip("`")
        if raw.startswith("json"):
            raw = raw[4:]
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        start = raw.find("{")
        end = raw.rfind("}")
        if start != -1 and end != -1:
            return json.loads(raw[start : end + 1])
        raise


def review_document(
    document_type_name: str, expected_sections: List[str], document_text: str
) -> Tuple[List[SectionFinding], List[QualityFinding]]:
    system = REVIEW_SYSTEM_PROMPT.format(
        doc_name=document_type_name,
        expected_sections="\n".join(f"- {s}" for s in expected_sections),
    )
    raw = openai_client.complete(
        system=system, user=document_text or "(empty document)", max_tokens=1500, json_mode=True
    )
    data = _parse_json(raw)
    completeness = [SectionFinding(**f) for f in data.get("completeness_findings", [])]
    quality = [QualityFinding(**f) for f in data.get("quality_findings", [])]
    return completeness, quality


def cross_check_overall_report(
    underlying_reports: List[dict], overall_text: str
) -> List[CrossCheckFinding]:
    underlying_text = "\n\n".join(
        f"=== {r['document_type_name']} ===\n{r['text']}" for r in underlying_reports
    )
    system = CROSS_CHECK_SYSTEM_PROMPT.format(underlying_reports=underlying_text)
    raw = openai_client.complete(
        system=system, user=overall_text or "(empty document)", max_tokens=1500, json_mode=True
    )
    data = _parse_json(raw)
    return [CrossCheckFinding(**f) for f in data.get("cross_check_findings", [])]
