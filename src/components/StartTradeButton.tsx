"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ALL_BANKS, type AgentBank } from "@/lib/types";

interface Props {
  agentId: string;
  agentName: string;
  banks: AgentBank[];
  traderId: string;
}

export default function StartTradeButton({ agentId, agentName, banks, traderId }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [ref, setRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const bank = banks.find((b) => b.id === selectedBank);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bank) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_id: agentId,
          trader_id: traderId,
          bank_id: bank.id,
          amount: parseFloat(amount),
          client_reference: ref,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to start trade");
      }
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
    setLoading(false);
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="px-4 py-2 bg-brass text-bg font-medium rounded-lg hover:bg-brass-light transition-colors text-sm">
        Trade with {agentName.split(" ")[0]}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={() => setOpen(false)}>
          <div className="card p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-ink" style={{ fontFamily: "var(--font-display)" }}>
              Start Trade with {agentName}
            </h3>

            {error && <div className="p-3 bg-bad/10 border border-bad/30 rounded-lg text-bad text-sm">{error}</div>}

            {!bank ? (
              <div className="space-y-3">
                <p className="text-sm text-muted">Select a bank to deposit into:</p>
                {banks.map((b) => (
                  <button key={b.id} onClick={() => setSelectedBank(b.id)}
                    className="w-full p-3 bg-surface2 border border-border rounded-lg text-left hover:border-brass transition-colors">
                    <span className="font-medium text-ink">{b.bank_name}</span>
                    <span className="text-xs text-muted ml-2">({b.country})</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-surface2 border border-border rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted">Bank</span>
                    <span className="text-sm font-medium text-ink">{bank.bank_name} ({bank.country})</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted">Account Name</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ink" style={{ fontFamily: "var(--font-mono)" }}>{bank.account_name}</span>
                      <button onClick={() => copyToClipboard(bank.account_name)} className="text-xs text-brass hover:text-brass-light">copy</button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted">Account Number</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ink" style={{ fontFamily: "var(--font-mono)" }}>{bank.account_number}</span>
                      <button onClick={() => copyToClipboard(bank.account_number)} className="text-xs text-brass hover:text-brass-light">copy</button>
                    </div>
                  </div>
                  {bank.swift_bic && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted">SWIFT/BIC</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-ink" style={{ fontFamily: "var(--font-mono)" }}>{bank.swift_bic}</span>
                        <button onClick={() => copyToClipboard(bank.swift_bic!)} className="text-xs text-brass hover:text-brass-light">copy</button>
                      </div>
                    </div>
                  )}
                </div>
                {copied && <p className="text-xs text-good text-center">Copied to clipboard!</p>}

                <div>
                  <label className="block text-sm font-medium text-muted mb-1.5">Amount (USD)</label>
                  <input type="number" step="0.01" min="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2.5 bg-surface2 border border-border rounded-lg text-ink placeholder-muted/50 focus:border-brass focus:outline-none" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-1.5">Client Reference</label>
                  <input type="text" required value={ref} onChange={(e) => setRef(e.target.value)}
                    className="w-full px-3 py-2.5 bg-surface2 border border-border rounded-lg text-ink placeholder-muted/50 focus:border-brass focus:outline-none" placeholder="Your reference" />
                </div>

                <div className="flex gap-3">
                  <button onClick={handleSubmit} disabled={loading}
                    className="flex-1 py-2.5 bg-brass text-bg font-medium rounded-lg hover:bg-brass-light transition-colors disabled:opacity-50">
                    {loading ? "Starting..." : "I've Sent the Payment"}
                  </button>
                  <button onClick={() => setSelectedBank("")} className="px-4 py-2.5 border border-border text-ink rounded-lg hover:border-brass transition-colors text-sm">
                    Back
                  </button>
                </div>
              </div>
            )}

            <button onClick={() => setOpen(false)} className="w-full text-center text-sm text-muted hover:text-ink transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
