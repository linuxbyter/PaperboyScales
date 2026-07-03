"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { Profile, AgentDetails } from "@/lib/types";

export default function OnboardingForm({
  profile,
  details,
}: {
  profile: Profile;
  details: AgentDetails | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/agent-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_id: profile.id,
          bank_name: form.get("bank_name"),
          account_name: form.get("account_name"),
          account_number: form.get("account_number"),
          swift_bic: form.get("swift_bic"),
          id_type: form.get("id_type"),
          id_number: form.get("id_number"),
          address: form.get("address"),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save details");
      }

      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      {error && (
        <div className="p-3 bg-bad/10 border border-bad/30 rounded-lg text-bad text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-good/10 border border-good/30 rounded-lg text-good text-sm">
          Details saved successfully.
        </div>
      )}

      <h3
        className="text-lg font-semibold text-ink"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Banking Details
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Bank Name"
          name="bank_name"
          defaultValue={details?.bank_name ?? ""}
          placeholder="e.g. First Bank of Nigeria"
        />
        <Input
          label="Account Holder Name"
          name="account_name"
          defaultValue={details?.account_name ?? ""}
          placeholder="Full name on account"
        />
        <Input
          label="Account Number"
          name="account_number"
          defaultValue={details?.account_number ?? ""}
          placeholder="Account number"
        />
        <Input
          label="SWIFT/BIC (optional)"
          name="swift_bic"
          defaultValue={details?.swift_bic ?? ""}
          placeholder="SWIFT code"
        />
      </div>

      <h3
        className="text-lg font-semibold text-ink pt-4"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Identity Verification
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="ID Type"
          name="id_type"
          defaultValue={details?.id_type ?? ""}
          placeholder="e.g. Passport, National ID"
        />
        <Input
          label="ID Number"
          name="id_number"
          defaultValue={details?.id_number ?? ""}
          placeholder="ID number"
        />
      </div>

      <Input
        label="Address"
        name="address"
        defaultValue={details?.address ?? ""}
        placeholder="Full address"
      />

      <div className="pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Details"}
        </Button>
      </div>
    </form>
  );
}
