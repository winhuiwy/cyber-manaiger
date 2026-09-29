import io
import uuid
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pypdf import PdfReader

from .. import storage
from ..models import Submission
from ..services import review_service
from ..services.rules_engine import load_document_types, load_rules

router = APIRouter(prefix="/submissions", tags=["submissions"])


def _extract_text(filename: str, raw: bytes) -> str:
    if filename.lower().endswith(".pdf"):
        reader = PdfReader(io.BytesIO(raw))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    return raw.decode("utf-8", errors="ignore")


@router.post("", response_model=Submission)
async def upload_submission(
    project_id: str = Form(...),
    document_type: str = Form(...),
    file: UploadFile = File(...),
):
    project = storage.get_project(project_id)
    if not project:
        raise HTTPException(404, "Project not found")

    doc_types = {d["id"]: d for d in load_document_types()}
    doc_type = doc_types.get(document_type)
    if not doc_type:
        raise HTTPException(404, "Unknown document type")

    raw = await file.read()
    text = _extract_text(file.filename or "", raw)

    type_mismatch = review_service.check_type_mismatch(
        document_type_id=document_type,
        all_doc_types=list(doc_types.values()),
        document_text=text,
    )

    if type_mismatch:
        # Reviewing completeness/quality against the wrong document's expected
        # sections would just produce noise — the mismatch is the only finding
        # that matters until the correct file is uploaded.
        completeness, quality = [], []
    else:
        completeness, quality = review_service.review_document(
            document_type_name=doc_type["name"],
            expected_sections=doc_type["expected_sections"],
            document_text=text,
        )

    cross_check = []
    missing_prerequisites = []
    if document_type == "overall_security_report":
        base_type_ids = [
            r["document_type"]
            for r in load_rules()["requirements"]
            if r["condition"] is None and r["document_type"] != "overall_security_report"
        ]
        underlying = []
        for type_id in base_type_ids:
            sub = storage.latest_submission(project_id, type_id)
            # A submission flagged as the wrong document type doesn't actually
            # satisfy the prerequisite — don't feed mislabeled content into the
            # cross-check.
            if sub and not sub.type_mismatch:
                underlying.append({"document_type_name": doc_types[type_id]["name"], "text": sub.content_text})
            else:
                missing_prerequisites.append(doc_types[type_id]["name"])
        if underlying and not type_mismatch:
            cross_check = review_service.cross_check_overall_report(underlying, text)

    submission = Submission(
        id=str(uuid.uuid4()),
        project_id=project_id,
        document_type=document_type,
        filename=file.filename or "upload",
        content_text=text,
        status="reviewed",
        completeness_findings=completeness,
        quality_findings=quality,
        cross_check_findings=cross_check,
        missing_prerequisite_reports=missing_prerequisites,
        type_mismatch=type_mismatch,
        uploaded_at=datetime.now(timezone.utc),
    )
    storage.save_submission(submission)
    return submission


@router.get("/{project_id}", response_model=List[Submission])
def list_submissions(project_id: str):
    return storage.list_submissions(project_id)


@router.delete("/{project_id}", status_code=204)
def clear_submissions(project_id: str):
    project = storage.get_project(project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    storage.delete_submissions(project_id)


@router.delete("/{project_id}/{document_type}", status_code=204)
def clear_submission(project_id: str, document_type: str):
    project = storage.get_project(project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    storage.delete_submissions(project_id, document_type)
