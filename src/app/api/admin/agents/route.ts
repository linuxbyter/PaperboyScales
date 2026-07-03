import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { getProfileById, updateProfileStatus } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await getProfileById(session.userId);
  if (!admin || admin.type !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { targetUserId, status } = await req.json();
  const profile = await updateProfileStatus(targetUserId, status);
  return NextResponse.json(profile);
}
