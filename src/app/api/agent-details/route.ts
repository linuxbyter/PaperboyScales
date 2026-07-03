import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { upsertAgentDetails } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  try {
    const details = await upsertAgentDetails({
      ...body,
      agent_id: userId,
    });
    return NextResponse.json(details);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save details" },
      { status: 500 }
    );
  }
}
