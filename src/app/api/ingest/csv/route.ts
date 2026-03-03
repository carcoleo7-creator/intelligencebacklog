import { NextRequest, NextResponse } from "next/server";
import { ingestItem } from "@/lib/ingest";

export const dynamic = "force-dynamic";

interface CsvRow {
  text: string;
  channel?: string;
  submittedBy?: string;
  timestamp?: string;
  source_id?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as {
    rows: CsvRow[];
    defaultChannel?: string;
  };

  const { rows, defaultChannel = "csv-upload" } = body;

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "No rows provided" }, { status: 400 });
  }
  if (rows.length > 500) {
    return NextResponse.json({ error: "Maximum 500 rows per upload" }, { status: 400 });
  }

  let imported = 0;
  let duplicates = 0;
  let skipped = 0;

  for (const row of rows) {
    const result = await ingestItem({
      rawText: row.text ?? "",
      source: row.channel || defaultChannel,
      sourceId: row.source_id ?? null,
      submittedBy: row.submittedBy ?? null,
      submittedAt: row.timestamp ? new Date(row.timestamp) : null,
    });

    if (result.status === "processed" || result.status === "pending") imported++;
    else if (result.status === "duplicate") duplicates++;
    else skipped++;
  }

  return NextResponse.json({ imported, duplicates, skipped, total: rows.length });
}
