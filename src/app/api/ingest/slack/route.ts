import { NextRequest, NextResponse } from "next/server";
import { ingestItem } from "@/lib/ingest";

export const dynamic = "force-dynamic";

interface SlackMessage {
  ts: string;
  text: string;
  user?: string;
  type: string;
  subtype?: string;
}

interface SlackHistoryResponse {
  ok: boolean;
  messages?: SlackMessage[];
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "SLACK_BOT_TOKEN is not configured" },
      { status: 503 }
    );
  }

  const body = (await request.json()) as {
    channelId: string;
    channelName?: string;
    limit?: number;
  };

  const { channelId, channelName, limit = 100 } = body;

  if (!channelId?.trim()) {
    return NextResponse.json({ error: "channelId is required" }, { status: 400 });
  }

  const url = new URL("https://slack.com/api/conversations.history");
  url.searchParams.set("channel", channelId.trim());
  url.searchParams.set("limit", String(Math.min(Math.max(1, limit), 200)));

  const slackRes = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = (await slackRes.json()) as SlackHistoryResponse;

  if (!data.ok) {
    return NextResponse.json(
      { error: data.error ?? "Slack API error" },
      { status: 502 }
    );
  }

  const messages = (data.messages ?? []).filter(
    (m) => m.type === "message" && !m.subtype && (m.text?.trim().length ?? 0) >= 10
  );

  const source = channelName?.trim()
    ? `slack-${channelName.trim()}`
    : `slack-${channelId.trim()}`;

  let imported = 0;
  let duplicates = 0;
  let skipped = 0;

  for (const msg of messages) {
    const result = await ingestItem({
      rawText: msg.text,
      source,
      sourceId: `slack-${channelId}-${msg.ts}`,
      submittedBy: msg.user ?? null,
      submittedAt: new Date(parseFloat(msg.ts) * 1000),
    });

    if (result.status === "processed" || result.status === "pending") imported++;
    else if (result.status === "duplicate") duplicates++;
    else skipped++;
  }

  return NextResponse.json({ imported, duplicates, skipped, total: messages.length });
}
