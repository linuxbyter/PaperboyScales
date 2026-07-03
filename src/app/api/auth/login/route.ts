import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getProfileByEmail } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const profile = await getProfileByEmail(email);

  if (!profile || !profile.password_hash) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, profile.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  await createSession(profile.id);
  return NextResponse.json({ ok: true });
}
