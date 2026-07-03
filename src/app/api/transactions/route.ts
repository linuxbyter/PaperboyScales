import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { createTransaction, updateQuickStatus } from "@/lib/db";
import type { QuickStatus } from "@/lib/types";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const tx = await createTransaction({
    agent_id: body.agent_id,
    trader_id: session.userId,
    bank_id: body.bank_id,
    amount: body.amount,
    currency: body.currency,
    client_reference: body.client_reference,
  });
  return NextResponse.json(tx);
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, quick_status } = await req.json();
  const tx = await updateQuickStatus(id, quick_status as QuickStatus);
  return NextResponse.json(tx);
}
