import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

from . import config
from .models import Project, Submission

PROJECTS_FILE = config.STORAGE_DIR / "projects.json"
SUBMISSIONS_FILE = config.STORAGE_DIR / "submissions.json"


def _load(path: Path) -> list:
    if not path.exists():
        return []
    return json.loads(path.read_text())


def _save(path: Path, data: list) -> None:
    path.write_text(json.dumps(data, indent=2, default=str))


def list_projects() -> List[Project]:
    return [Project(**p) for p in _load(PROJECTS_FILE)]


def get_project(project_id: str) -> Optional[Project]:
    for project in list_projects():
        if project.id == project_id:
            return project
    return None


def create_project(name: str) -> Project:
    projects = _load(PROJECTS_FILE)
    project = Project(id=str(uuid.uuid4()), name=name, created_at=datetime.now(timezone.utc))
    projects.append(json.loads(project.model_dump_json()))
    _save(PROJECTS_FILE, projects)
    return project


def list_submissions(project_id: str) -> List[Submission]:
    return [Submission(**s) for s in _load(SUBMISSIONS_FILE) if s["project_id"] == project_id]


def latest_submission(project_id: str, document_type: str) -> Optional[Submission]:
    matches = [s for s in list_submissions(project_id) if s.document_type == document_type]
    if not matches:
        return None
    return max(matches, key=lambda s: s.uploaded_at)


def save_submission(submission: Submission) -> Submission:
    submissions = _load(SUBMISSIONS_FILE)
    submissions.append(json.loads(submission.model_dump_json()))
    _save(SUBMISSIONS_FILE, submissions)
    return submission
