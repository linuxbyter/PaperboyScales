import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { upsertAgentDetails } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const details = await upsertAgentDetails({ ...body, agent_id: session.userId });
  return NextResponse.json(details);
}
