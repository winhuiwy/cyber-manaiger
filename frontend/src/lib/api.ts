import type { ChecklistItem, Project, Submission } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function listProjects(): Promise<Project[]> {
  return handle(await fetch(`${API_BASE}/projects`, { cache: "no-store" }));
}

export async function createProject(name: string): Promise<Project> {
  return handle(
    await fetch(`${API_BASE}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
  );
}

export async function getChecklist(id: string): Promise<ChecklistItem[]> {
  return handle(await fetch(`${API_BASE}/projects/${id}/checklist`, { cache: "no-store" }));
}

export function templateDownloadUrl(documentType: string): string {
  return `${API_BASE}/templates/${documentType}`;
}

export async function uploadSubmission(
  projectId: string,
  documentType: string,
  file: File
): Promise<Submission> {
  const form = new FormData();
  form.append("project_id", projectId);
  form.append("document_type", documentType);
  form.append("file", file);
  return handle(
    await fetch(`${API_BASE}/submissions`, {
      method: "POST",
      body: form,
    })
  );
}

export async function askQuestion(question: string, projectId?: string): Promise<string> {
  const data = await handle<{ answer: string }>(
    await fetch(`${API_BASE}/qa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, project_id: projectId }),
    })
  );
  return data.answer;
}
