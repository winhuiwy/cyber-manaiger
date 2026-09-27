"use client";

import { useRef, useState } from "react";
import { clearSubmission, templateDownloadUrl, uploadSubmission } from "@/lib/api";
import type { ChecklistItem } from "@/lib/types";
import StatusBadge from "./StatusBadge";

function hasFindingsFor(item: ChecklistItem): boolean {
  return (
    !!item.submission &&
    (item.submission.completeness_findings.length > 0 ||
      item.submission.quality_findings.length > 0 ||
      item.submission.cross_check_findings.length > 0)
  );
}

export default function ChecklistItemRow({
  item,
  projectId,
  onUploaded,
}: {
  item: ChecklistItem;
  projectId: string;
  onUploaded: () => void | Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);
  const [clearing, setClearing] = useState(false);
  // Open by default whenever there's something to review, so a fresh page
  // load (e.g. after restarting the app) shows the analysis immediately
  // instead of requiring a "View details" click to reveal what's already there.
  const [expanded, setExpanded] = useState(() => hasFindingsFor(item));
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasFindings = hasFindingsFor(item);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await uploadSubmission(projectId, item.document_type, file);
      await onUploaded();
      setExpanded(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleClear() {
    setClearing(true);
    setError(null);
    try {
      await clearSubmission(projectId, item.document_type);
      await onUploaded();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-900">{item.name}</h3>
          <StatusBadge item={item} />
        </div>
        <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>
        <p className="mt-1 text-xs italic text-slate-400">{item.citation}</p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <a
          href={templateDownloadUrl(item.document_type)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Download template
        </a>
        <label className="cursor-pointer rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700">
          {uploading ? "Reviewing…" : item.submission ? "Re-upload" : "Upload"}
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.txt,.pdf"
            className="hidden"
            disabled={uploading}
            onChange={handleFileChange}
          />
        </label>
        {hasFindings && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            {expanded ? "Hide details" : "View details"}
          </button>
        )}
        {item.submission && (
          <button
            type="button"
            onClick={handleClear}
            disabled={clearing}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {clearing ? "Clearing…" : "Clear"}
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {expanded && item.submission && (
        <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">
          {item.submission.completeness_findings.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Completeness check
              </h4>
              <ul className="mt-2 space-y-1.5">
                {item.submission.completeness_findings.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <span
                      className={`mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full ${
                        f.status === "present" ? "bg-emerald-500" : "bg-red-500"
                      }`}
                    />
                    <span>
                      <span className="font-medium text-slate-800">{f.section}</span>
                      {f.status === "missing" && f.note && (
                        <span className="text-slate-500"> — {f.note}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {item.submission.quality_findings.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Quality suggestions
              </h4>
              <ul className="mt-2 space-y-2">
                {item.submission.quality_findings.map((f, i) => (
                  <li key={i} className="text-xs">
                    <p className="font-medium text-slate-800">{f.issue}</p>
                    <p className="text-slate-500">Suggestion: {f.suggestion}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {item.submission.cross_check_findings.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Unjustified findings from underlying reports
              </h4>
              <ul className="mt-2 space-y-2">
                {item.submission.cross_check_findings.map((f, i) => (
                  <li key={i} className="text-xs">
                    <p className="font-medium text-slate-800">
                      {f.finding} <span className="font-normal text-slate-400">({f.source_report})</span>
                    </p>
                    <p className="text-slate-500">{f.problem}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
