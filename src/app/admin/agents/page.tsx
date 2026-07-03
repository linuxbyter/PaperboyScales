import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getProfileById, getAllAgents } from "@/lib/db";
import AgentsList from "./AgentsList";

export const dynamic = "force-dynamic";

export default async function AdminAgentsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const profile = await getProfileById(userId);
  if (!profile) redirect("/login");
  if (profile.role !== "admin" || profile.status !== "approved") {
    redirect("/agent/dashboard");
  }

  const agents = await getAllAgents();

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
            href="/admin/dashboard"
            className="text-sm text-muted hover:text-ink transition-colors"
          >
            Dashboard
          </a>
          <span className="text-sm text-muted">{profile.full_name}</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <h2
          className="text-2xl font-bold text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Agent Management
        </h2>

        <AgentsList agents={agents} />
      </main>
    </div>
  );
}
