import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createTransaction, updateTransactionStatus } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  try {
    const tx = await createTransaction({
      agent_id: userId,
      client_reference: body.client_reference,
      amount: body.amount,
      currency: body.currency,
      notes: body.notes,
    });
    return NextResponse.json(tx);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create transaction" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status } = await req.json();

  try {
    const tx = await updateTransactionStatus(id, status);
    return NextResponse.json(tx);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update transaction" },
      { status: 500 }
    );
  }
}
