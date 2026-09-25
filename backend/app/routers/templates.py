from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from .. import config
from ..services.rules_engine import load_document_types

router = APIRouter(prefix="/templates", tags=["templates"])


@router.get("/{document_type}")
def download_template(document_type: str):
    doc_types = {d["id"]: d for d in load_document_types()}
    doc_type = doc_types.get(document_type)
    if not doc_type:
        raise HTTPException(404, "Unknown document type")
    path = config.TEMPLATES_DIR / doc_type["template_file"]
    if not path.exists():
        raise HTTPException(404, "Template file missing")
    return FileResponse(path, filename=doc_type["template_file"], media_type="text/markdown")
