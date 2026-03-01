import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  const db = getDB();
  const item = await db.feedbackItem.findUnique({
    where: { id },
    include: { auditLogs: { orderBy: { createdAt: "desc" } } },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  const db = getDB();

  const body = await request.json() as {
    routedTo?: string;
    routedBy?: string;
    routingNote?: string;
    mergedIntoId?: string;
  };

  if (body.mergedIntoId) {
    const updated = await db.feedbackItem.update({
      where: { id },
      data: {
        mergedIntoId: body.mergedIntoId,
        status: "CLOSED",
        auditLogs: {
          create: {
            action: "merged",
            actor: body.routedBy ?? null,
            note: `Merged into ${body.mergedIntoId}`,
          },
        },
      },
    });
    return NextResponse.json(updated);
  }

  if (!body.routedTo) {
    return NextResponse.json({ error: "routedTo is required" }, { status: 400 });
  }

  const newStatus = body.routedTo === "NOISE" ? "CLOSED" : "ROUTED";

  const updated = await db.feedbackItem.update({
    where: { id },
    data: {
      routedTo: body.routedTo as never,
      routedAt: new Date(),
      routedBy: body.routedBy ?? null,
      routingNote: body.routingNote ?? null,
      status: newStatus,
      auditLogs: {
        create: {
          action: "routed",
          actor: body.routedBy ?? null,
          note: body.routingNote ?? `Routed to ${body.routedTo}`,
        },
      },
    },
  });

  return NextResponse.json(updated);
}
