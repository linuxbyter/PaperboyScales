"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "./ui/Button";
import Input from "./ui/Input";

export default function TransactionForm({ agentId }: { agentId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_id: agentId,
          client_reference: form.get("client_reference"),
          amount: parseFloat(form.get("amount") as string),
          currency: form.get("currency"),
          notes: form.get("notes") || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create transaction");
      }

      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
    setLoading(false);
  }

  if (!open) {
    return (
      <Button variant="primary" onClick={() => setOpen(true)}>
        Log a new deposit
      </Button>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-ink mb-4" style={{ fontFamily: "var(--font-display)" }}>
        Log New Deposit
      </h3>
      {error && (
        <div className="mb-4 p-3 bg-bad/10 border border-bad/30 rounded-lg text-bad text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Client Reference"
            name="client_reference"
            required
            placeholder="e.g. REF-2024-001"
          />
          <Input
            label="Amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="0.00"
          />
          <Input
            label="Currency"
            name="currency"
            required
            placeholder="USD"
            defaultValue="USD"
          />
          <Input
            label="Notes (optional)"
            name="notes"
            placeholder="Any additional details..."
          />
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Deposit"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
