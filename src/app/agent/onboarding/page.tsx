import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getProfileById, getAgentDetails } from "@/lib/db";
import StatusBadge from "@/components/ui/StatusBadge";
import OnboardingForm from "./OnboardingForm";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const profile = await getProfileById(userId);
  if (!profile) redirect("/login");
  if (profile.role === "admin") redirect("/admin/dashboard");

  const details = await getAgentDetails(userId);

  const statusExplanation: Record<string, string> = {
    pending: "Your application is under review. You'll be able to log deposits once approved.",
    approved: "Your account is active. You can edit your details at any time.",
    rejected: "Your application was not approved. Please contact support.",
    suspended: "Your account is suspended. Please contact support.",
  };

  return (
    <div className="min-h-screen">
      <nav className="border-b border-border px-6 py-4">
        <h1
          className="text-lg font-bold text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Paperboy Network
        </h1>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2
              className="text-2xl font-bold text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Complete Your Profile
            </h2>
            <StatusBadge status={profile.status} />
          </div>
          <p className="text-muted text-sm">
            {statusExplanation[profile.status] ?? ""}
          </p>
        </div>

        <OnboardingForm profile={profile} details={details} />
      </main>
    </div>
  );
}
