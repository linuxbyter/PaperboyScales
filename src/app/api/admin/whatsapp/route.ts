import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getProfileById, getWhatsAppNumbers, addWhatsappNumber, deleteWhatsappNumber } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await getProfileById(session.userId);
  if (!profile || profile.type !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const numbers = await getWhatsAppNumbers();
  return NextResponse.json(numbers);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await getProfileById(session.userId);
  if (!profile || profile.type !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { number, label } = body;
  if (!number || !label) return NextResponse.json({ error: "number and label required" }, { status: 400 });

  const row = await addWhatsappNumber(number, label);
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await getProfileById(session.userId);
  if (!profile || profile.type !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id } = body;
  if (id === undefined) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await deleteWhatsappNumber(id);
  return NextResponse.json({ ok: true });
}