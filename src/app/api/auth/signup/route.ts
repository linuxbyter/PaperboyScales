import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { fullName, email, password, phone, country } = await req.json();

  if (!fullName || !email || !password || !country) {
    return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const existing = await sql()`SELECT id FROM profiles WHERE email = ${email}`;
  if (existing.length > 0) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const rows = await sql()`
    INSERT INTO profiles (id, role, full_name, email, phone, country, status, commission_rate, password_hash)
    VALUES (${crypto.randomUUID()}, 'agent', ${fullName}, ${email}, ${phone || null}, ${country}, 'pending', 10.00, ${passwordHash})
    RETURNING id
  `;

  await createSession((rows[0] as { id: string }).id);
  return NextResponse.json({ ok: true });
}
