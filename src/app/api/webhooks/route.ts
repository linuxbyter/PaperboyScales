import { NextRequest, NextResponse } from "next/server";
import { createProfile } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.type === "user.created") {
    const { id, email_addresses, first_name, last_name, phone_numbers } = body.data;

    const email = email_addresses?.[0]?.email_address ?? "";
    const fullName = [first_name, last_name].filter(Boolean).join(" ") || "Unknown Agent";
    const phone = phone_numbers?.[0]?.phone_number ?? null;

    try {
      await createProfile({
        id,
        role: "agent",
        full_name: fullName,
        email,
        phone,
        country: "Unknown",
        status: "pending",
        commission_rate: 10.00,
      });
      return NextResponse.json({ ok: true });
    } catch (err) {
      console.error("Failed to create profile:", err);
      return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
