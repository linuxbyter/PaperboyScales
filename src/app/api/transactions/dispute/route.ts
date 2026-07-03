import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateTransactionDispute } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id, dispute_reason } = body;
  if (!id || !dispute_reason) return NextResponse.json({ error: "id and dispute_reason required" }, { status: 400 });

  const tx = await updateTransactionDispute(id, dispute_reason, "");
  if (!tx) return NextResponse.json({ error: "Failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}