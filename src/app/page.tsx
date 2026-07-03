import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getProfileById } from "@/lib/db";

export default async function RootPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  const profile = await getProfileById(userId);

  if (!profile) {
    redirect("/login");
  }

  if (profile.role === "admin" && profile.status === "approved") {
    redirect("/admin/dashboard");
  }

  if (profile.status !== "approved") {
    redirect("/agent/onboarding");
  }

  redirect("/agent/dashboard");
}
