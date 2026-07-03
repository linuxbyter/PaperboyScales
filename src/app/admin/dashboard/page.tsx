import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getProfileById, getAllTransactions, getAdminStats } from "@/lib/db";
import TransactionTable from "@/components/TransactionTable";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const profile = await getProfileById(userId);
  if (!profile) redirect("/login");
  if (profile.role !== "admin" || profile.status !== "approved") {
    redirect("/agent/dashboard");
  }

  const transactions = await getAllTransactions();
  const stats = await getAdminStats();

  return (
    <div className="min-h-screen">
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <h1
          className="text-lg font-bold text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Paperboy Network
        </h1>
        <div className="flex items-center gap-4">
          <a
            href="/admin/agents"
            className="text-sm text-muted hover:text-ink transition-colors"
          >
            Agents
          </a>
          <span className="text-sm text-muted">{profile.full_name}</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <h2
          className="text-2xl font-bold text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Admin Dashboard
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-6">
            <p className="text-sm text-muted uppercase tracking-wider">
              Commission Owed
            </p>
            <p
              className="text-3xl font-bold mt-2 text-brass tabular-nums"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ${Number(stats.commission_owed).toFixed(2)}
            </p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-muted uppercase tracking-wider">
              In Flight
            </p>
            <p
              className="text-3xl font-bold mt-2 text-warn tabular-nums"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {Number(stats.in_flight)}
            </p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-muted uppercase tracking-wider">
              Total Volume
            </p>
            <p
              className="text-3xl font-bold mt-2 text-ink tabular-nums"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ${Number(stats.total_volume).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3
            className="text-lg font-semibold text-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            All Transactions
          </h3>
          <TransactionTable rows={transactions} role="admin" showAgentColumn />
        </div>
      </main>
    </div>
  );
}
