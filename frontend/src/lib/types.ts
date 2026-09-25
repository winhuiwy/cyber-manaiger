export type ChecklistStatus = "missing" | "uploaded" | "reviewed";

export interface Project {
  id: string;
  name: string;
  project_type: string;
  created_at: string;
}

export interface SectionFinding {
  section: string;
  status: "present" | "missing";
  note?: string | null;
}

export interface QualityFinding {
  issue: string;
  suggestion: string;
}

export interface CrossCheckFinding {
  source_report: string;
  finding: string;
  problem: string;
}

export interface Submission {
  id: string;
  project_id: string;
  document_type: string;
  filename: string;
  content_text: string;
  status: "uploaded" | "reviewed";
  completeness_findings: SectionFinding[];
  quality_findings: QualityFinding[];
  cross_check_findings: CrossCheckFinding[];
  uploaded_at: string;
}

export interface ChecklistItem {
  document_type: string;
  name: string;
  description: string;
  citation: string;
  status: ChecklistStatus;
  submission: Submission | null;
}
