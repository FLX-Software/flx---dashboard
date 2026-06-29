import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  open: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
  in_progress:
    "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  done: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  resolved:
    "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  closed: "bg-muted text-muted-foreground border-border",
  low: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/20",
  medium:
    "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  high: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20",
  urgent: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
};

const labels: Record<string, string> = {
  open: "Offen",
  in_progress: "In Bearbeitung",
  done: "Erledigt",
  resolved: "Gelöst",
  closed: "Geschlossen",
  low: "Niedrig",
  medium: "Mittel",
  high: "Hoch",
  urgent: "Dringend",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-medium",
        variants[status] || variants.open,
        className
      )}
    >
      {labels[status] || status}
    </span>
  );
}
