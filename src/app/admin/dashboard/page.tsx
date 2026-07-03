import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProfileById, getAdminStats, getAllTransactions } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";
import QuickActionTable from "@/components/QuickActionTable";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session) redirect("/login");
  const profile = await getProfileById(session.userId);
  if (!profile) redirect("/login");
  if (profile.type !== "admin") redirect("/login");

  const stats = await getAdminStats();
  const transactions = await getAllTransactions();

  return (
    <div className="min-h-screen">
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-ink" style={{ fontFamily: "var(--font-display)" }}>Paperboy Network</h1>
        <div className="flex items-center gap-4">
          <a href="/admin/agents" className="text-sm text-muted hover:text-ink transition-colors">Agents</a>
          <a href="/admin/settings" className="text-sm text-muted hover:text-ink transition-colors">Settings</a>
          <span className="text-sm text-muted">{profile.full_name}</span>
          <LogoutButton />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <h2 className="text-2xl font-bold text-ink" style={{ fontFamily: "var(--font-display)" }}>Admin Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="card p-5">
            <p className="text-xs text-muted uppercase tracking-wider">Agents</p>
            <p className="text-2xl font-bold mt-1 text-ink" style={{ fontFamily: "var(--font-mono)" }}>{stats.total_agents}</p>
          </div>
          <div className="card p-5">
            <p className="text-xs text-muted uppercase tracking-wider">Traders</p>
            <p className="text-2xl font-bold mt-1 text-ink" style={{ fontFamily: "var(--font-mono)" }}>{stats.total_traders}</p>
          </div>
          <div className="card p-5">
            <p className="text-xs text-muted uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-bold mt-1 text-warn" style={{ fontFamily: "var(--font-mono)" }}>{stats.pending_agents}</p>
          </div>
          <div className="card p-5">
            <p className="text-xs text-muted uppercase tracking-wider">In Flight</p>
            <p className="text-2xl font-bold mt-1 text-brass" style={{ fontFamily: "var(--font-mono)" }}>${Number(stats.in_flight).toFixed(2)}</p>
          </div>
          <div className="card p-5">
            <p className="text-xs text-muted uppercase tracking-wider">Commission</p>
            <p className="text-2xl font-bold mt-1 text-good" style={{ fontFamily: "var(--font-mono)" }}>${Number(stats.total_commission).toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-ink" style={{ fontFamily: "var(--font-display)" }}>All Trades</h3>
          <QuickActionTable rows={transactions} role="admin" showTraderColumn />
        </div>
      </main>
    </div>
  );
}
