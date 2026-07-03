import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProfileById, getAllAgents, getAgentStats } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";
import AgentStatusButtons from "./AgentStatusButtons";

export const dynamic = "force-dynamic";

export default async function AdminAgents() {
  const session = await getSession();
  if (!session) redirect("/login");
  const profile = await getProfileById(session.userId);
  if (!profile) redirect("/login");
  if (profile.type !== "admin") redirect("/login");

  const agents = await getAllAgents();

  return (
    <div className="min-h-screen">
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-ink" style={{ fontFamily: "var(--font-display)" }}>Paperboy Network</h1>
        <div className="flex items-center gap-4">
          <a href="/admin/dashboard" className="text-sm text-muted hover:text-ink transition-colors">Dashboard</a>
          <a href="/admin/settings" className="text-sm text-muted hover:text-ink transition-colors">Settings</a>
          <span className="text-sm text-muted">{profile.full_name}</span>
          <LogoutButton />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-ink" style={{ fontFamily: "var(--font-display)" }}>Agents</h2>
        </div>

        {agents.length === 0 && (
          <div className="card p-12 text-center text-muted">No agents found.</div>
        )}

        {agents.map((a) => (
          <div key={a.id} className="card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-ink text-lg">{a.full_name}</h3>
                <p className="text-sm text-muted">{a.email}</p>
                <p className="text-xs text-muted mt-1">Applied {new Date(a.created_at).toLocaleDateString()}</p>
              </div>
              <AgentStatusButtons agentId={a.id} currentStatus={a.status} />
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
