"use client";

import { useCallback, useEffect, useState } from "react";
import { createProject, getChecklist, listProjects } from "@/lib/api";
import type { ChecklistItem } from "@/lib/types";
import ChecklistItemRow from "@/components/ChecklistItemRow";
import QAPanel from "@/components/QAPanel";

const DEFAULT_PROJECT_NAME = "Software Project";

export default function HomePage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshChecklist = useCallback(async (id: string) => {
    try {
      setChecklist(await getChecklist(id));
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const projects = await listProjects();
        const project = projects[0] ?? (await createProject(DEFAULT_PROJECT_NAME));
        setProjectId(project.id);
        await refreshChecklist(project.id);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshChecklist]);

  const missingCount = checklist.filter((c) => c.status === "missing").length;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">CyberManAIger</h1>
          <p className="text-sm text-slate-500">Software Project — Cybersecurity Compliance Checklist</p>
        </div>
        {missingCount > 0 && (
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
            {missingCount} document{missingCount === 1 ? "" : "s"} outstanding
          </span>
        )}
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Loading…</p>
      ) : error ? (
        <p className="mt-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : (
        projectId && (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-3">
              {checklist.map((item) => (
                <ChecklistItemRow
                  key={item.document_type}
                  item={item}
                  projectId={projectId}
                  onUploaded={() => refreshChecklist(projectId)}
                />
              ))}
            </div>

            <div className="lg:sticky lg:top-10 lg:self-start">
              <QAPanel projectId={projectId} />
            </div>
          </div>
        )
      )}
    </main>
  );
}
