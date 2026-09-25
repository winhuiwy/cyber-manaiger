from fastapi import APIRouter

from .. import storage
from ..models import QARequest, QAResponse
from ..services import qa_service
from ..services.rules_engine import build_checklist

router = APIRouter(prefix="/qa", tags=["qa"])


@router.post("", response_model=QAResponse)
def ask(payload: QARequest):
    context = None
    if payload.project_id:
        project = storage.get_project(payload.project_id)
        if project:
            checklist = build_checklist(payload.project_id)
            statuses = ", ".join(f"{item.name}: {item.status}" for item in checklist)
            context = f"Project '{project.name}' checklist status — {statuses}"
    answer = qa_service.answer_question(payload.question, context)
    return QAResponse(answer=answer)
