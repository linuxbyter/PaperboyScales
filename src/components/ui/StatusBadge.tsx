const STATUS_STYLES: Record<string, string> = {
  pending: "bg-warn/15 text-warn border-warn/30",
  pending_receipt: "bg-warn/15 text-warn border-warn/30",
  approved: "bg-good/15 text-good border-good/30",
  received: "bg-good/15 text-good border-good/30",
  forwarded: "bg-brass/15 text-brass border-brass/30",
  completed: "bg-good/15 text-good border-good/30",
  rejected: "bg-bad/15 text-bad border-bad/30",
  cancelled: "bg-bad/15 text-bad border-bad/30",
  suspended: "bg-bad/15 text-bad border-bad/30",
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
