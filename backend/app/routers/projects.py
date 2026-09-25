from typing import List

from fastapi import APIRouter, HTTPException

from .. import storage
from ..models import ChecklistItem, Project, ProjectCreate
from ..services import rules_engine

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=List[Project])
def list_projects():
    return storage.list_projects()


@router.post("", response_model=Project)
def create_project(payload: ProjectCreate):
    return storage.create_project(payload.name)


@router.get("/{project_id}", response_model=Project)
def get_project(project_id: str):
    project = storage.get_project(project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    return project


@router.get("/{project_id}/checklist", response_model=List[ChecklistItem])
def get_checklist(project_id: str):
    project = storage.get_project(project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    return rules_engine.build_checklist(project_id)
