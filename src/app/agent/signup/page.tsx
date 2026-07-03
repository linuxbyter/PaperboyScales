"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AgentSignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, phone, country, userType: "agent" }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Signup failed");
      }
      router.push("/agent/pending");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="relay">
            <span className="relay-node" />
            <span className="relay-line" />
            <span className="relay-node" />
          </div>
          <h1 className="text-3xl font-bold text-ink" style={{ fontFamily: "var(--font-display)" }}>Agent Registration</h1>
          <p className="text-muted">Create your agent account</p>
        </div>
        <div className="card p-8">
          {error && <div className="mb-4 p-3 bg-bad/10 border border-bad/30 rounded-lg text-bad text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Full Name</label>
              <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface2 border border-border rounded-lg text-ink placeholder-muted/50 focus:border-brass focus:outline-none" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface2 border border-border rounded-lg text-ink placeholder-muted/50 focus:border-brass focus:outline-none" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Password (min 8 chars)</label>
              <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface2 border border-border rounded-lg text-ink placeholder-muted/50 focus:border-brass focus:outline-none" placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Phone</label>
              <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface2 border border-border rounded-lg text-ink placeholder-muted/50 focus:border-brass focus:outline-none" placeholder="+1 234 567 890" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Country</label>
              <input type="text" required value={country} onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface2 border border-border rounded-lg text-ink placeholder-muted/50 focus:border-brass focus:outline-none" placeholder="Nigeria" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-brass text-bg font-medium rounded-lg hover:bg-brass-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Creating account..." : "Register as Agent"}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-muted">
          Already have an account? <Link href="/login" className="text-brass hover:text-brass-light">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
