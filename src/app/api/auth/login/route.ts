import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getProfileById, sql } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const rows = await sql()`SELECT * FROM profiles WHERE email = ${email}`;
  const profile = (rows as Record<string, unknown>[])[0];

  if (!profile || !profile.password_hash) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, profile.password_hash as string);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  await createSession(profile.id as string);
  return NextResponse.json({ ok: true });
}
