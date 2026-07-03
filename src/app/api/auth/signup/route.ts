import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getProfileByEmail, createProfile } from "@/lib/db";
import { createSession } from "@/lib/auth";
import type { UserType } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { fullName, email, password, phone, country, type } = await req.json();

  if (!fullName || !email || !password || !country) {
    return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const existing = await getProfileByEmail(email);
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const profileType: UserType = type === "agent" ? "agent" : "trader";

  const profile = await createProfile({
    id: crypto.randomUUID(),
    type: profileType,
    full_name: fullName,
    email,
    password_hash: passwordHash,
    phone: phone || undefined,
    country,
  });

  await createSession(profile.id);
  return NextResponse.json({ ok: true });
}
