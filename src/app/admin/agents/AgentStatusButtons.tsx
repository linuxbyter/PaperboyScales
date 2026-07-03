"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Status = "pending" | "approved" | "rejected" | "suspended";

const ACTIONS: Record<Status, { label: string; status: Status; color: string }[]> = {
  pending: [
    { label: "Approve", status: "approved", color: "bg-good text-white hover:opacity-90" },
    { label: "Reject", status: "rejected", color: "bg-bad text-white hover:opacity-90" },
  ],
  approved: [
    { label: "Suspend", status: "suspended", color: "bg-warn/20 text-warn border border-warn/30 hover:bg-warn/30" },
  ],
  rejected: [
    { label: "Approve", status: "approved", color: "bg-good text-white hover:opacity-90" },
  ],
  suspended: [
    { label: "Reactivate", status: "approved", color: "bg-good text-white hover:opacity-90" },
    { label: "Reject", status: "rejected", color: "bg-bad text-white hover:opacity-90" },
  ],
};

export default function AgentStatusButtons({ agentId, currentStatus }: { agentId: string; currentStatus: Status }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleStatus(status: Status) {
    setLoading(true);
    await fetch("/api/admin/agents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: agentId, status }),
    });
    setLoading(false);
    router.refresh();
  }

  const actions = ACTIONS[currentStatus] ?? [];

  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className={`text-xs px-2 py-1 rounded-full border ${
        currentStatus === "approved" ? "bg-good/15 text-good border-good/30" :
        currentStatus === "pending" ? "bg-warn/15 text-warn border-warn/30" :
        currentStatus === "rejected" ? "bg-bad/15 text-bad border-bad/30" :
        "bg-muted/15 text-muted border-muted/30"
      }`}>
        {currentStatus}
      </span>
      {actions.map((a) => (
        <button key={a.status} onClick={() => handleStatus(a.status)} disabled={loading}
          className={`px-3 py-1 text-xs font-medium rounded transition-colors disabled:opacity-50 ${a.color}`}>
          {loading ? "..." : a.label}
        </button>
      ))}
    </div>
  );
}
