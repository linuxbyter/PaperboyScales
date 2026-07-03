"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface WhatsAppNumber {
  id: string;
  number: string;
  label: string;
  created_at: string;
}

export default function WhatsAppManager({ numbers }: { numbers: WhatsAppNumber[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget as HTMLFormElement);
    try {
      const res = await fetch("/api/admin/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: form.get("number"),
          label: form.get("label"),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add");
      }
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    setLoading(true);
    await fetch("/api/admin/whatsapp", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-bad/10 border border-bad/30 rounded-lg text-bad text-sm">{error}</div>}

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase">Label</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase">Number</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase">Added</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-muted uppercase"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {numbers.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted text-sm">No WhatsApp numbers configured.</td></tr>
            )}
            {numbers.map((n) => (
              <tr key={n.id} className="hover:bg-surface2 transition-colors">
                <td className="px-4 py-3 text-sm text-ink">{n.label}</td>
                <td className="px-4 py-3 text-sm" style={{ fontFamily: "var(--font-mono)" }}>{n.number}</td>
                <td className="px-4 py-3 text-sm text-muted">{new Date(n.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleDelete(n.id)} disabled={loading}
                    className="px-3 py-1 text-xs font-medium rounded border border-bad/30 text-bad hover:bg-bad/10 transition-colors disabled:opacity-50">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={handleAdd} className="card p-5 flex flex-col sm:flex-row gap-3">
        <input type="text" name="label" required placeholder="Label (e.g. Revolut UK)"
          className="flex-1 px-3 py-2 bg-surface2 border border-border rounded-lg text-ink placeholder-muted/50 focus:border-brass focus:outline-none text-sm" />
        <input type="text" name="number" required placeholder="+447700123456"
          className="flex-1 px-3 py-2 bg-surface2 border border-border rounded-lg text-ink placeholder-muted/50 focus:border-brass focus:outline-none text-sm" />
        <button type="submit" disabled={loading}
          className="px-4 py-2 bg-brass text-bg font-medium rounded-lg hover:bg-brass-light transition-colors disabled:opacity-50 text-sm">
          {loading ? "..." : "Add"}
        </button>
      </form>
    </div>
  );
}
