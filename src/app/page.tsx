import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProfileById } from "@/lib/db";
import LandingPage from "./LandingPage";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getSession();
  
  if (session) {
    const profile = await getProfileById(session.userId);
    if (profile) {
      if (profile.type === "admin") redirect("/admin/dashboard");
      if (profile.type === "agent") {
        if (profile.status !== "approved") redirect("/agent/pending");
        redirect("/agent/dashboard");
      }
      redirect("/trader/dashboard");
    }
  }

  return <LandingPage />;
}