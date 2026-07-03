import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProfileById } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AgentPendingPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const profile = await getProfileById(session.userId);
  if (!profile) redirect("/login");
  if (profile.type === "admin") redirect("/admin/dashboard");
  if (profile.type === "trader") redirect("/trader/dashboard");
  if (profile.status === "approved") redirect("/agent/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card p-12 text-center max-w-md">
        <div className="text-5xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold text-ink mb-2" style={{ fontFamily: "var(--font-display)" }}>Account Under Review</h1>
        <p className="text-muted mb-6">Your agent application is being reviewed. You&apos;ll receive access once approved.</p>
        <p className="text-sm text-muted">Status: <span className="text-warn font-medium">Pending</span></p>
      </div>
    </div>
  );
}
