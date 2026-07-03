import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { createTransaction, updateQuickStatus } from "@/lib/db";
import type { QuickStatus } from "@/lib/types";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { agent_id, trader_id, bank_id, amount, currency, client_reference } = body;
  if (agent_id === undefined || trader_id === undefined || bank_id === undefined || amount === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const tx = await createTransaction({
    agent_id,
    trader_id: session.userId, // override trader_id from session for security? Actually we should use session.userId as trader.
    bank_id,
    amount,
    currency: currency ?? 'USD',
    client_reference: client_reference ?? '',
  });
  return NextResponse.json(tx);
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id, quick_status } = body;
  if (id === undefined || quick_status === undefined) {
    return NextResponse.json({ error: "Missing id or quick_status" }, { status: 400 });
  }

  const tx = await updateQuickStatus(id, quick_status as QuickStatus);
  if (!tx) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  return NextResponse.json(tx);
}