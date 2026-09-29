import type { ChecklistItem } from "@/lib/types";

type Variant =
  | "missing"
  | "uploaded"
  | "clean"
  | "quality"
  | "completeness"
  | "crossCheck"
  | "incomplete"
  | "wrongType";

const STYLES: Record<Variant, string> = {
  missing: "bg-red-100 text-red-700",
  uploaded: "bg-slate-100 text-slate-600",
  clean: "bg-emerald-100 text-emerald-700",
  quality: "bg-amber-100 text-amber-700",
  completeness: "bg-orange-100 text-orange-700",
  crossCheck: "bg-violet-100 text-violet-700",
  incomplete: "bg-rose-100 text-rose-700",
  wrongType: "bg-red-200 text-red-800",
};

interface Badge {
  variant: Variant;
  label: string;
}

function badgesFor(item: ChecklistItem): Badge[] {
  if (item.status === "missing") return [{ variant: "missing", label: "Missing" }];
  if (item.status === "uploaded") return [{ variant: "uploaded", label: "Uploaded" }];

  const submission = item.submission;

  // A wrong-type upload makes every other finding moot (there's nothing to check
  // completeness/quality against) — surface just this until it's fixed.
  if (submission?.type_mismatch) {
    const { detected_type } = submission.type_mismatch;
    const label = detected_type
      ? `Possibly wrong file (looks like ${detected_type})`
      : "Doesn't look like a security report";
    return [{ variant: "wrongType", label }];
  }

  const completenessGaps =
    submission?.completeness_findings.filter((f) => f.status === "missing").length ?? 0;
  const crossCheckCount = submission?.cross_check_findings.length ?? 0;
  const qualityCount = submission?.quality_findings.length ?? 0;
  const missingPrereqCount = submission?.missing_prerequisite_reports.length ?? 0;

  // One badge per issue category present — a document can carry more than one at once.
  const badges: Badge[] = [];
  if (missingPrereqCount > 0) {
    badges.push({
      variant: "incomplete",
      label: `${missingPrereqCount} underlying report${missingPrereqCount === 1 ? "" : "s"} missing`,
    });
  }
  if (completenessGaps > 0) {
    badges.push({
      variant: "completeness",
      label: `${completenessGaps} section${completenessGaps === 1 ? "" : "s"} missing`,
    });
  }
  if (crossCheckCount > 0) {
    badges.push({
      variant: "crossCheck",
      label: `${crossCheckCount} mismatch${crossCheckCount === 1 ? "" : "es"}`,
    });
  }
  if (qualityCount > 0) {
    badges.push({
      variant: "quality",
      label: `${qualityCount} suggestion${qualityCount === 1 ? "" : "s"}`,
    });
  }

  if (badges.length === 0) {
    badges.push({ variant: "clean", label: "No issues" });
  }

  return badges;
}

export default function StatusBadge({ item }: { item: ChecklistItem }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {badgesFor(item).map((badge, i) => (
        <span
          key={i}
          className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[badge.variant]}`}
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}
