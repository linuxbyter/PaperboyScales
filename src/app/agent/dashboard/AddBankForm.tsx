"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UK_BANKS, AU_BANKS } from "@/lib/types";

export default function AddBankForm({ agentId }: { agentId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [country, setCountry] = useState<"UK" | "AU">("UK");
  const router = useRouter();

  const banks = country === "UK" ? UK_BANKS : AU_BANKS;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget as HTMLFormElement);
    try {
      const res = await fetch("/api/agent-banks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_id: agentId,
          bank_name: form.get("bank_name"),
          country: form.get("country"),
          account_name: form.get("account_name"),
          account_number: form.get("account_number"),
          swift_bic: form.get("swift_bic") || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add bank");
      }
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
    setLoading(false);
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="px-4 py-2 border border-border text-ink font-medium rounded-lg hover:border-brass hover:text-brass transition-colors text-sm">
        + Add Bank Account
      </button>
    );
  }

  return (
    <div className="card p-6 space-y-4">
      <h4 className="font-semibold text-ink" style={{ fontFamily: "var(--font-display)" }}>Add Bank Account</h4>
      {error && <div className="p-3 bg-bad/10 border border-bad/30 rounded-lg text-bad text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5">Country</label>
            <select name="country" value={country} onChange={(e) => setCountry(e.target.value as "UK" | "AU")}
              className="w-full px-3 py-2.5 bg-surface2 border border-border rounded-lg text-ink focus:border-brass focus:outline-none">
              <option value="UK">UK</option>
              <option value="AU">Australia</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5">Bank Name</label>
            <select name="bank_name" required
              className="w-full px-3 py-2.5 bg-surface2 border border-border rounded-lg text-ink focus:border-brass focus:outline-none">
              {banks.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5">Account Holder Name</label>
            <input type="text" name="account_name" required
              className="w-full px-3 py-2.5 bg-surface2 border border-border rounded-lg text-ink placeholder-muted/50 focus:border-brass focus:outline-none" placeholder="As it appears on bank" />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5">Account Number</label>
            <input type="text" name="account_number" required
              className="w-full px-3 py-2.5 bg-surface2 border border-border rounded-lg text-ink placeholder-muted/50 focus:border-brass focus:outline-none" placeholder="Account number" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted mb-1.5">SWIFT/BIC (optional)</label>
          <input type="text" name="swift_bic"
            className="w-full px-3 py-2.5 bg-surface2 border border-border rounded-lg text-ink placeholder-muted/50 focus:border-brass focus:outline-none" placeholder="SWIFT code" />
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="px-4 py-2 bg-brass text-bg font-medium rounded-lg hover:bg-brass-light transition-colors disabled:opacity-50 text-sm">
            {loading ? "Adding..." : "Add Bank"}
          </button>
          <button type="button" onClick={() => setOpen(false)}
            className="px-4 py-2 border border-border text-ink rounded-lg hover:border-brass transition-colors text-sm">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
