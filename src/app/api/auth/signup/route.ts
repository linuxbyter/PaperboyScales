import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { getProfileByEmail, createProfile } from "@/lib/db";
import { createSession } from "@/lib/auth";
import type { UserType } from "@/lib/types";

export async function POST(req: NextRequest) {
  let fullName, email, password, phone, country, userType;
  try {
    ({ fullName, email, password, phone, country, userType } = await req.json());
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

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
  const profileType: UserType = userType === "agent" ? "agent" : "trader";

  let profile;
  try {
    profile = await createProfile({
      id: randomUUID(),
      type: profileType,
      full_name: fullName,
      email,
      password_hash: passwordHash,
      phone: phone || undefined,
      country,
    });
  } catch (e: any) {
    console.error('Signup error creating profile:', e);
    return NextResponse.json({ error: `Failed to create account: ${e.message}` }, { status: 500 });
  }

  try {
    await createSession(profile.id);
  } catch (e: any) {
    console.error('Signup error creating session:', e);
    return NextResponse.json({ error: `Failed to create session: ${e.message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}