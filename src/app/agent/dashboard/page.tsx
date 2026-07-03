import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProfileById, getAgentTransactions, getAgentStats } from "@/lib/db";
import TransactionForm from "@/components/TransactionForm";
import TransactionTable from "@/components/TransactionTable";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function AgentDashboard() {
  const session = await getSession();
  if (!session) redirect("/login");

  const profile = await getProfileById(session.userId);
  if (!profile) redirect("/login");
  if (profile.role === "admin") redirect("/admin/dashboard");
  if (profile.status !== "approved") redirect("/agent/onboarding");

  const transactions = await getAgentTransactions(session.userId);
  const stats = await getAgentStats(session.userId);
  const firstName = profile.full_name.split(" ")[0];

  return (
    <div className="min-h-screen">
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-ink" style={{ fontFamily: "var(--font-display)" }}>
          Paperboy Network
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted">{profile.full_name}</span>
          <LogoutButton />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <h2 className="text-2xl font-bold text-ink" style={{ fontFamily: "var(--font-display)" }}>
          Welcome, {firstName}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-6">
            <p className="text-sm text-muted uppercase tracking-wider">Commission Earned</p>
            <p className="text-3xl font-bold mt-2 text-good tabular-nums" style={{ fontFamily: "var(--font-mono)" }}>
              ${Number(stats.commission_earned).toFixed(2)}
            </p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-muted uppercase tracking-wider">Awaiting Receipt</p>
            <p className="text-3xl font-bold mt-2 text-warn tabular-nums" style={{ fontFamily: "var(--font-mono)" }}>
              {Number(stats.awaiting_receipt)}
            </p>
          </div>
        </div>

        <TransactionForm agentId={session.userId} />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-ink" style={{ fontFamily: "var(--font-display)" }}>
            Transaction History
          </h3>
          <TransactionTable rows={transactions} role="agent" />
        </div>
      </main>
    </div>
  );
}
