"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Login failed");
      }
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
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
          <h1 className="text-3xl font-bold text-ink" style={{ fontFamily: "var(--font-display)" }}>
            Paperboy Network
          </h1>
          <p className="text-muted">Sign in to your account</p>
        </div>
        <div className="card p-8">
          {error && (
            <div className="mb-4 p-3 bg-bad/10 border border-bad/30 rounded-lg text-bad text-sm">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface2 border border-border rounded-lg text-ink placeholder-muted/50 focus:border-brass focus:outline-none" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface2 border border-border rounded-lg text-ink placeholder-muted/50 focus:border-brass focus:outline-none" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-brass text-bg font-medium rounded-lg hover:bg-brass-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-muted">
          New trader? <Link href="/signup" className="text-brass hover:text-brass-light">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
