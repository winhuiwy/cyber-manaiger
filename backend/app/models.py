from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel


class Project(BaseModel):
    id: str
    name: str
    project_type: str = "software_project"
    created_at: datetime


class ProjectCreate(BaseModel):
    name: str


class SectionFinding(BaseModel):
    section: str
    status: Literal["present", "missing"]
    note: Optional[str] = None


class QualityFinding(BaseModel):
    issue: str
    suggestion: str


class CrossCheckFinding(BaseModel):
    source_report: str
    finding: str
    problem: str


class Submission(BaseModel):
    id: str
    project_id: str
    document_type: str
    filename: str
    content_text: str
    status: Literal["uploaded", "reviewed"]
    completeness_findings: List[SectionFinding] = []
    quality_findings: List[QualityFinding] = []
    cross_check_findings: List[CrossCheckFinding] = []
    uploaded_at: datetime


class ChecklistItem(BaseModel):
    document_type: str
    name: str
    description: str
    citation: str
    status: Literal["missing", "uploaded", "reviewed"]
    submission: Optional[Submission] = None


class QARequest(BaseModel):
    question: str
    project_id: Optional[str] = None


class QAResponse(BaseModel):
    answer: str
