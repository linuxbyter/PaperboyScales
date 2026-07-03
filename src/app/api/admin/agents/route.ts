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

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { targetUserId, status } = body;
  if (targetUserId === undefined || status === undefined) {
    return NextResponse.json({ error: "Missing targetUserId or status" }, { status: 400 });
  }

  const profile = await updateProfileStatus(targetUserId, status);
  if (!profile) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json(profile);
}