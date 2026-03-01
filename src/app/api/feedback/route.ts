import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);

  const channel = searchParams.get("channel") || undefined;
  const category = searchParams.get("category") || undefined;
  const classification = searchParams.get("classification") || undefined;
  const minScore = searchParams.get("minScore")
    ? Number(searchParams.get("minScore"))
    : undefined;
  const partner = searchParams.get("partner") || undefined;
  const theme = searchParams.get("theme") || undefined;
  const status = searchParams.get("status") || undefined;
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "25");

  const db = getDB();

  const where = {
    ...(channel && { source: channel }),
    ...(category && { category: category as never }),
    ...(classification && { classification: classification as never }),
    ...(minScore !== undefined && {
      productPotential: { gte: minScore },
    }),
    ...(partner && { partner: { contains: partner, mode: "insensitive" as const } }),
    ...(theme && { theme: { contains: theme, mode: "insensitive" as const } }),
    ...(status && { status: status as never }),
    mergedIntoId: null,
  };

  const [items, total] = await Promise.all([
    db.feedbackItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        auditLogs: { orderBy: { createdAt: "desc" }, take: 3 },
      },
    }),
    db.feedbackItem.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, pageSize });
}
