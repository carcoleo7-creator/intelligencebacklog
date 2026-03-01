import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { OPPORTUNITY_THRESHOLD } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const db = getDB();

  const items = await db.feedbackItem.findMany({
    where: {
      classification: "PRODUCT_OPPORTUNITY",
      productPotential: { gte: OPPORTUNITY_THRESHOLD },
      mergedIntoId: null,
      status: { not: "CLOSED" },
    },
    orderBy: { productPotential: "desc" },
    include: {
      auditLogs: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return NextResponse.json({ items, total: items.length });
}
