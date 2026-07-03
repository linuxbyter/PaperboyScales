"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import StatusBadge from "./ui/StatusBadge";
import type { TransactionWithNames, QuickStatus } from "@/lib/types";

const AGENT_ACTIONS: Partial<Record<QuickStatus, QuickStatus[]>> = {
  pending: ["active", "dispute"],
  sent: ["paid"],
  dispute: ["confirmed"],
};

const TRADER_ACTIONS: Partial<Record<QuickStatus, QuickStatus[]>> = {
  active: ["sending"],
  sending: ["sent"],
};

const ACTION_LABELS: Record<string, string> = {
  active: "Confirm Active",
  sending: "Sending Now",
  sent: "Sent",
  paid: "Confirm Paid",
  complete: "Mark Complete",
  dispute: "Dispute Trade",
  confirmed: "Confirmed",
};

interface Props {
  rows: TransactionWithNames[];
  role: "agent" | "trader" | "admin";
  showTraderColumn?: boolean;
}

export default function QuickActionTable({ rows, role, showTraderColumn = false }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  const [disputeModal, setDisputeModal] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState("");

  async function handleStatus(txId: string, status: QuickStatus) {
    setLoading(txId);
    await fetch("/api/transactions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: txId, quick_status: status }),
    });
    setLoading(null);
    router.refresh();
  }

  async function handleDispute(txId: string) {
    setLoading(txId);
    await fetch("/api/transactions/dispute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: txId, dispute_reason: disputeReason }),
    });
    setDisputeModal(null);
    setDisputeReason("");
    setLoading(null);
    router.refresh();
  }

  function getActions(tx: TransactionWithNames): QuickStatus[] {
    if (role === "agent") return AGENT_ACTIONS[tx.quick_status] ?? [];
    if (role === "trader") return TRADER_ACTIONS[tx.quick_status] ?? [];
    return [];
  }

  if (rows.length === 0) {
    return <div className="card p-12 text-center text-muted">No trades yet.</div>;
  }

  return (
    <>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {showTraderColumn && <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase">Trader</th>}
                <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase">Agent</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase">Bank</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted uppercase">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase">Ref</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-muted uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase">Date</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((tx) => {
                const actions = getActions(tx);
                return (
                  <tr key={tx.id} className="hover:bg-surface2 transition-colors">
                    {showTraderColumn && <td className="px-4 py-3 text-sm">{tx.trader_name}</td>}
                    <td className="px-4 py-3 text-sm">{tx.agent_name}</td>
                    <td className="px-4 py-3 text-sm">{tx.bank_name} <span className="text-muted text-xs">({tx.bank_country})</span></td>
                    <td className="px-4 py-3 text-sm text-right" style={{ fontFamily: "var(--font-mono)" }}>
                      {tx.currency} {Number(tx.amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted">{tx.client_reference || "—"}</td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={tx.quick_status} /></td>
                    <td className="px-4 py-3 text-sm text-muted">{new Date(tx.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end flex-wrap">
                        {actions.includes("dispute") && role === "agent" && (
                          <button onClick={() => setDisputeModal(tx.id)} disabled={loading === tx.id}
                            className="px-3 py-1 text-xs font-medium rounded border border-bad/30 text-bad hover:bg-bad/10 transition-colors disabled:opacity-50">
                            Dispute
                          </button>
                        )}
                        {actions.filter((a) => a !== "dispute").map((action) => (
                          <button key={action} onClick={() => handleStatus(tx.id, action)} disabled={loading === tx.id}
                            className="px-3 py-1 text-xs font-medium rounded bg-brass text-bg hover:bg-brass-light transition-colors disabled:opacity-50">
                            {loading === tx.id ? "..." : ACTION_LABELS[action] || action}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {disputeModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={() => setDisputeModal(null)}>
          <div className="card p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-ink" style={{ fontFamily: "var(--font-display)" }}>Dispute Trade</h3>
            <p className="text-sm text-muted">Provide reason and evidence for this dispute.</p>
            <textarea value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)}
              className="w-full px-3 py-2.5 bg-surface2 border border-border rounded-lg text-ink placeholder-muted/50 focus:border-brass focus:outline-none h-24 resize-none"
              placeholder="Reason for dispute..." />
            <div className="flex gap-3">
              <button onClick={() => handleDispute(disputeModal)} disabled={loading === disputeModal || !disputeReason}
                className="flex-1 py-2.5 bg-bad text-white font-medium rounded-lg hover:opacity-90 transition-colors disabled:opacity-50">
                {loading === disputeModal ? "Submitting..." : "Submit Dispute"}
              </button>
              <button onClick={() => setDisputeModal(null)}
                className="px-4 py-2.5 border border-border text-ink rounded-lg hover:border-brass transition-colors text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
