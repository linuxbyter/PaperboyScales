import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProfileById, getWhatsAppNumbers } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";
import WhatsAppManager from "./WhatsAppManager";

export const dynamic = "force-dynamic";

export default async function AdminSettings() {
  const session = await getSession();
  if (!session) redirect("/login");
  const profile = await getProfileById(session.userId);
  if (!profile) redirect("/login");
  if (profile.type !== "admin") redirect("/login");

  const whatsappNumbers = await getWhatsAppNumbers();

  return (
    <div className="min-h-screen">
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-ink" style={{ fontFamily: "var(--font-display)" }}>Paperboy Network</h1>
        <div className="flex items-center gap-4">
          <a href="/admin/dashboard" className="text-sm text-muted hover:text-ink transition-colors">Dashboard</a>
          <a href="/admin/agents" className="text-sm text-muted hover:text-ink transition-colors">Agents</a>
          <span className="text-sm text-muted">{profile.full_name}</span>
          <LogoutButton />
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <h2 className="text-2xl font-bold text-ink" style={{ fontFamily: "var(--font-display)" }}>Settings</h2>

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-ink" style={{ fontFamily: "var(--font-display)" }}>WhatsApp Numbers</h3>
          <p className="text-sm text-muted">Numbers agents send funds to after confirming trader deposits.</p>
          <WhatsAppManager numbers={whatsappNumbers} />
        </section>
      </main>
    </div>
  );
}
