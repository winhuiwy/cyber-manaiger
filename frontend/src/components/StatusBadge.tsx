import type { ChecklistItem } from "@/lib/types";

type Variant = "missing" | "uploaded" | "clean" | "quality" | "completeness" | "crossCheck";

const STYLES: Record<Variant, string> = {
  missing: "bg-red-100 text-red-700",
  uploaded: "bg-slate-100 text-slate-600",
  clean: "bg-emerald-100 text-emerald-700",
  quality: "bg-amber-100 text-amber-700",
  completeness: "bg-orange-100 text-orange-700",
  crossCheck: "bg-violet-100 text-violet-700",
};

interface Badge {
  variant: Variant;
  label: string;
}

function badgesFor(item: ChecklistItem): Badge[] {
  if (item.status === "missing") return [{ variant: "missing", label: "Missing" }];
  if (item.status === "uploaded") return [{ variant: "uploaded", label: "Uploaded" }];

  const submission = item.submission;
  const completenessGaps =
    submission?.completeness_findings.filter((f) => f.status === "missing").length ?? 0;
  const crossCheckCount = submission?.cross_check_findings.length ?? 0;
  const qualityCount = submission?.quality_findings.length ?? 0;

  // One badge per issue category present — a document can carry more than one at once.
  const badges: Badge[] = [];
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
