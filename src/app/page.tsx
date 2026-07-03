import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProfileById } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const profile = await getProfileById(session.userId);
  if (!profile) redirect("/login");

  if (profile.type === "admin" && profile.status === "approved") {
    redirect("/admin/dashboard");
  }

  if (profile.type === "agent") {
    if (profile.status !== "approved") redirect("/agent/pending");
    redirect("/agent/dashboard");
  }

  redirect("/trader/dashboard");
}
