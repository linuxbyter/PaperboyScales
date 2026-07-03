import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProfileById, getAgentBanks, getAgentTransactions, getAgentStats } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";
import QuickActionTable from "@/components/QuickActionTable";
import AddBankForm from "./AddBankForm";

export const dynamic = "force-dynamic";

export default async function AgentDashboard() {
  const session = await getSession();
  if (!session) redirect("/login");
  const profile = await getProfileById(session.userId);
  if (!profile) redirect("/login");
  if (profile.type === "admin") redirect("/admin/dashboard");
  if (profile.type === "trader") redirect("/trader/dashboard");
  if (profile.status !== "approved") redirect("/agent/pending");

  const banks = await getAgentBanks(session.userId);
  const transactions = await getAgentTransactions(session.userId);
  const stats = await getAgentStats(session.userId);

  return (
    <div className="min-h-screen">
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-ink" style={{ fontFamily: "var(--font-display)" }}>Paperboy Network</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted">{profile.full_name}</span>
          <LogoutButton />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <h2 className="text-2xl font-bold text-ink" style={{ fontFamily: "var(--font-display)" }}>
          Agent Dashboard
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-6">
            <p className="text-sm text-muted uppercase tracking-wider">Commission Earned</p>
            <p className="text-3xl font-bold mt-2 text-good" style={{ fontFamily: "var(--font-mono)" }}>
              ${Number(stats.commission_earned).toFixed(2)}
            </p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-muted uppercase tracking-wider">In Progress</p>
            <p className="text-3xl font-bold mt-2 text-warn" style={{ fontFamily: "var(--font-mono)" }}>
              {stats.in_progress}
            </p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-muted uppercase tracking-wider">Total Trades</p>
            <p className="text-3xl font-bold mt-2 text-ink" style={{ fontFamily: "var(--font-mono)" }}>
              {stats.total}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-ink" style={{ fontFamily: "var(--font-display)" }}>My Banks</h3>
          {banks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {banks.map((b) => (
                <div key={b.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-ink">{b.bank_name} <span className="text-muted text-xs">({b.country})</span></p>
                    <p className="text-sm text-muted" style={{ fontFamily: "var(--font-mono)" }}>{b.account_number}</p>
                    <p className="text-xs text-muted">{b.account_name}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-good/15 text-good border border-good/30">Active</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-6 text-center text-muted text-sm">No banks added yet. Add a bank below to start receiving trades.</div>
          )}
          <AddBankForm agentId={session.userId} />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-ink" style={{ fontFamily: "var(--font-display)" }}>Incoming Trades</h3>
          <QuickActionTable rows={transactions} role="agent" showTraderColumn />
        </div>
      </main>
    </div>
  );
}
