import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { createTransaction, updateTransactionStatus } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const tx = await createTransaction({
    agent_id: session.userId,
    client_reference: body.client_reference,
    amount: body.amount,
    currency: body.currency,
    notes: body.notes,
  });
  return NextResponse.json(tx);
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status } = await req.json();
  const tx = await updateTransactionStatus(id, status);
  return NextResponse.json(tx);
}
