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
          Active Agents
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from(agentsMap.entries()).map(([agentId, { name, banks }]) => (
            <div key={agentId} className="card p-5 space-y-3">
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

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-ink" style={{ fontFamily: "var(--font-display)" }}>
            My Trades
          </h2>
          <QuickActionTable rows={transactions} role="trader" />
        </div>
      </main>
    </div>
  );
}
