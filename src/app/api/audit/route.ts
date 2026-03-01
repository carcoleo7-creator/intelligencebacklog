import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const feedbackId = searchParams.get("feedbackId") ?? undefined;
  const limit = Number(searchParams.get("limit") ?? "50");

  const db = getDB();

  const entries = await db.auditLog.findMany({
    where: feedbackId ? { feedbackId } : undefined,
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 200),
  });

  return NextResponse.json(entries);
}
