import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProfileById, getAllActiveAgentBanks, getTraderTransactions } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";
import StartTradeButton from "@/components/StartTradeButton";
import QuickActionTable from "@/components/QuickActionTable";

export const dynamic = "force-dynamic";

export default async function TraderDashboard() {
  const session = await getSession();
  if (!session) redirect("/login");
  const profile = await getProfileById(session.userId);
  if (!profile) redirect("/login");
  if (profile.type === "admin") redirect("/admin/dashboard");
  if (profile.type === "agent") redirect("/agent/dashboard");

  const agentBanks = await getAllActiveAgentBanks();
  const transactions = await getTraderTransactions(session.userId);

  const agentsMap = new Map<string, { name: string; banks: typeof agentBanks }>();
  for (const ab of agentBanks) {
    const existing = agentsMap.get(ab.agent_id);
    if (existing) {
      existing.banks.push(ab);
    } else {
      agentsMap.set(ab.agent_id, { name: ab.agent_name, banks: [ab] });
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-xl bg-bg/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brass rounded-sm flex items-center justify-center">
              <span className="text-bg font-bold text-sm">PB</span>
            </div>
            <span className="font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>Paperboy</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted">{profile.full_name}</span>
            <div className="w-8 h-8 bg-surface2 rounded-full flex items-center justify-center border border-border">
              <span className="text-sm font-medium text-ink">{profile.full_name.charAt(0)}</span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 pt-24 pb-8 space-y-8">
        {/* Welcome Section */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-muted mb-1">Welcome back,</p>
            <h1 className="text-3xl font-bold text-ink" style={{ fontFamily: "var(--font-display)" }}>
              {profile.full_name}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-good rounded-full animate-pulse" />
            <span className="text-sm text-muted">Trader Account</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brass/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <p className="text-sm text-muted mb-2">Total Trades</p>
            <p className="text-3xl font-bold text-ink" style={{ fontFamily: "var(--font-mono)" }}>
              {transactions.length}
            </p>
          </div>
          <div className="card p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-good/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <p className="text-sm text-muted mb-2">Completed</p>
            <p className="text-3xl font-bold text-good" style={{ fontFamily: "var(--font-mono)" }}>
              {transactions.filter(t => t.quick_status === "complete").length}
            </p>
          </div>
          <div className="card p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-warn/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <p className="text-sm text-muted mb-2">In Progress</p>
            <p className="text-3xl font-bold text-warn" style={{ fontFamily: "var(--font-mono)" }}>
              {transactions.filter(t => ["pending", "active", "sending", "sent", "paid"].includes(t.quick_status)).length}
            </p>
          </div>
        </div>

        {/* Active Agents */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-ink" style={{ fontFamily: "var(--font-display)" }}>
              Active Agents
            </h2>
            <span className="text-sm text-muted">{agentsMap.size} available</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from(agentsMap.entries()).map(([agentId, { name, banks }]) => (
              <div key={agentId} className="card p-5 space-y-3 hover:border-brass/50 transition-all">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-ink">{name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-good/15 text-good border border-good/30">Active</span>
                </div>
                <div className="space-y-2">
                  {banks.map((b) => (
                    <div key={b.id} className="text-xs text-muted p-2 bg-surface2 rounded border border-border">
                      <span className="font-medium text-ink">{b.bank_name}</span>
                      <span className="ml-1">({b.country})</span>
                    </div>
                  ))}
                </div>
                <StartTradeButton agentId={agentId} agentName={name} banks={banks} traderId={session.userId} />
              </div>
            ))}
            {agentsMap.size === 0 && (
              <div className="col-span-full card p-12 text-center text-muted">No active agents available right now.</div>
            )}
          </div>
        </div>

        {/* My Trades */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-ink" style={{ fontFamily: "var(--font-display)" }}>
            My Trades
          </h2>
          <QuickActionTable rows={transactions} role="trader" />
        </div>
      </main>
    </div>
  );
}