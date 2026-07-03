import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { addAgentBank } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { agent_id, bank_name, country, account_name, account_number, swift_bic } = body;
  if (agent_id === undefined || bank_name === undefined || country === undefined || account_name === undefined || account_number === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (session.userId !== agent_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const row = await addAgentBank({ agent_id, bank_name, country, account_name, account_number, swift_bic });
    return NextResponse.json(row);
  } catch (e) {
    return NextResponse.json({ error: "Failed to add bank" }, { status: 500 });
  }
}