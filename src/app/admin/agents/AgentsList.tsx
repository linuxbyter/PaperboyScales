"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import type { Profile } from "@/lib/types";

export default function AgentsList({ agents }: { agents: Profile[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  async function handleStatusChange(targetUserId: string, status: string) {
    setLoading(targetUserId);
    await fetch("/api/admin/agents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId, status }),
    });
    setLoading(null);
    setExpanded(null);
    router.refresh();
  }

  if (agents.length === 0) {
    return (
      <div className="card p-12 text-center text-muted">
        No agents registered yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {agents.map((agent) => (
        <div key={agent.id} className="card overflow-hidden">
          <div
            className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-surface2 transition-colors"
            onClick={() => setExpanded(expanded === agent.id ? null : agent.id)}
          >
            <div className="flex items-center gap-4">
              <div>
                <p className="font-medium text-ink">{agent.full_name}</p>
                <p className="text-sm text-muted">{agent.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted">{agent.country}</span>
              <StatusBadge status={agent.status} />
            </div>
          </div>

          {expanded === agent.id && (
            <div className="border-t border-border px-6 py-4 space-y-4 bg-surface2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted">Phone</p>
                  <p className="text-ink">{agent.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-muted">Country</p>
                  <p className="text-ink">{agent.country}</p>
                </div>
                <div>
                  <p className="text-muted">Status</p>
                  <p className="text-ink">{agent.status}</p>
                </div>
                <div>
                  <p className="text-muted">Joined</p>
                  <p className="text-ink">
                    {new Date(agent.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <p className="text-xs text-muted">
                Banking and ID details would appear here (requires KYC document signed URL — out of scope for v1).
              </p>

              <div className="flex gap-3">
                {agent.status !== "approved" && (
                  <Button
                    onClick={() => handleStatusChange(agent.id, "approved")}
                    disabled={loading === agent.id}
                  >
                    {loading === agent.id ? "..." : "Approve"}
                  </Button>
                )}
                {agent.status !== "rejected" && (
                  <Button
                    variant="ghost"
                    onClick={() => handleStatusChange(agent.id, "rejected")}
                    disabled={loading === agent.id}
                    className="text-bad border-bad/30 hover:border-bad"
                  >
                    {loading === agent.id ? "..." : "Reject"}
                  </Button>
                )}
                {agent.status !== "suspended" && agent.status === "approved" && (
                  <Button
                    variant="ghost"
                    onClick={() => handleStatusChange(agent.id, "suspended")}
                    disabled={loading === agent.id}
                    className="text-warn border-warn/30 hover:border-warn"
                  >
                    {loading === agent.id ? "..." : "Suspend"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
