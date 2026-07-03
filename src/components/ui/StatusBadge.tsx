const STATUS_STYLES: Record<string, string> = {
  pending: "bg-warn/15 text-warn border-warn/30",
  active: "bg-brass/15 text-brass border-brass/30",
  sending: "bg-brass/15 text-brass border-brass/30",
  sent: "bg-blue-500/15 text-blue-400 border-blue-400/30",
  paid: "bg-good/15 text-good border-good/30",
  complete: "bg-good/15 text-good border-good/30",
  confirmed: "bg-good/15 text-good border-good/30",
  dispute: "bg-bad/15 text-bad border-bad/30",
  approved: "bg-good/15 text-good border-good/30",
  rejected: "bg-bad/15 text-bad border-bad/30",
  suspended: "bg-warn/15 text-warn border-warn/30",
};

export default function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-muted/15 text-muted border-muted/30";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${style}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
