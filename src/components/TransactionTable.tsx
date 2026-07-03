"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import StatusBadge from "./ui/StatusBadge";
import Button from "./ui/Button";
import type { Transaction, TransactionWithAgent } from "@/lib/types";

const STATUS_FLOW: Record<string, string> = {
  pending_receipt: "received",
  received: "forwarded",
  forwarded: "completed",
};

const ADMIN_CANCEL_STATUSES = [
  "pending_receipt",
  "received",
  "forwarded",
];

interface TransactionTableProps {
  rows: Transaction[] | TransactionWithAgent[];
  role: "agent" | "admin";
  showAgentColumn?: boolean;
}

export default function TransactionTable({
  rows,
  role,
  showAgentColumn = false,
}: TransactionTableProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleStatusChange(id: string, status: string) {
    setLoading(id);
    await fetch("/api/transactions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setLoading(null);
    router.refresh();
  }

  if (rows.length === 0) {
    return (
      <div className="card p-12 text-center text-muted">
        No transactions found.
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {showAgentColumn && (
                <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Agent
                </th>
              )}
              <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                Reference
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                Amount
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                Commission
              </th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                Status
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                Date
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((tx) => {
              const nextStatus = STATUS_FLOW[tx.status];
              const canCancel =
                role === "admin" && ADMIN_CANCEL_STATUSES.includes(tx.status);
              const agent = "agent_name" in tx ? tx : null;

              return (
                <tr key={tx.id} className="hover-surface2">
                  {showAgentColumn && (
                    <td className="px-4 py-3 text-sm">
                      {agent?.agent_name ?? "—"}
                      <span className="block text-xs text-muted">
                        {agent?.agent_country ?? ""}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-3 text-sm font-medium text-ink">
                    {tx.client_reference}
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-right tabular-nums"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {tx.currency} {Number(tx.amount).toFixed(2)}
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-right tabular-nums text-good"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {tx.currency} {Number(tx.commission_amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={tx.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-muted text-right">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      {nextStatus && (
                        <Button
                          variant="ghost"
                          onClick={() => handleStatusChange(tx.id, nextStatus)}
                          disabled={loading === tx.id}
                          className="text-xs"
                        >
                          {loading === tx.id ? "..." : `Mark ${nextStatus.replace(/_/g, " ")}`}
                        </Button>
                      )}
                      {canCancel && (
                        <Button
                          variant="ghost"
                          onClick={() => handleStatusChange(tx.id, "cancelled")}
                          disabled={loading === tx.id}
                          className="text-xs text-bad border-bad/30 hover:border-bad"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
