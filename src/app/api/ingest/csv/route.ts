import { NextRequest, NextResponse } from "next/server";
import { storeManyItems } from "@/lib/ingest";

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
  // Per-batch cap — client sends multiple batches for large files
  if (rows.length > 250) {
    return NextResponse.json({ error: "Maximum 250 rows per batch" }, { status: 400 });
  }

  const result = await storeManyItems(
    rows.map((row) => ({
      rawText: row.text ?? "",
      source: row.channel || defaultChannel,
      sourceId: row.source_id ?? null,
      submittedBy: row.submittedBy ?? null,
      submittedAt: row.timestamp ? new Date(row.timestamp) : null,
    }))
  );

  return NextResponse.json(result);
}
