import json
from typing import List

from .. import config, storage
from ..models import ChecklistItem

_document_types_cache = None
_rules_cache = None


def load_document_types() -> list:
    global _document_types_cache
    if _document_types_cache is None:
        _document_types_cache = json.loads((config.DATA_DIR / "document_types.json").read_text())
    return _document_types_cache


def load_rules() -> dict:
    global _rules_cache
    if _rules_cache is None:
        _rules_cache = json.loads((config.DATA_DIR / "rules.json").read_text())
    return _rules_cache


def build_checklist(project_id: str) -> List[ChecklistItem]:
    doc_types = {d["id"]: d for d in load_document_types()}
    rules = load_rules()["requirements"]

    submissions_by_type = {}
    for submission in storage.list_submissions(project_id):
        existing = submissions_by_type.get(submission.document_type)
        if existing is None or submission.uploaded_at > existing.uploaded_at:
            submissions_by_type[submission.document_type] = submission

    items = []
    for rule in rules:
        doc_type = doc_types[rule["document_type"]]
        submission = submissions_by_type.get(rule["document_type"])
        status = "missing" if submission is None else submission.status

        items.append(
            ChecklistItem(
                document_type=rule["document_type"],
                name=doc_type["name"],
                description=doc_type["description"],
                citation=rule["citation"],
                status=status,
                submission=submission,
            )
        )
    return items
