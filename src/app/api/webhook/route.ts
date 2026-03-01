import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { classifyFeedback } from "@/lib/claude";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Validate webhook secret
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  if (token !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    text?: string;
    channel?: string;
    user?: string;
    timestamp?: string;
    source_id?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rawText = body.text?.trim();
  if (!rawText || rawText.length < 10) {
    return NextResponse.json({ error: "Text too short" }, { status: 400 });
  }

  const sourceId = body.source_id ?? body.timestamp ?? null;
  const source = body.channel ?? "unknown";
  const db = getDB();

  // Deduplicate by sourceId
  if (sourceId) {
    const existing = await db.feedbackItem.findUnique({ where: { sourceId } });
    if (existing) {
      return NextResponse.json(
        { error: "Duplicate", id: existing.id },
        { status: 409 }
      );
    }
  }

  // Create pending record immediately
  const item = await db.feedbackItem.create({
    data: {
      rawText,
      source,
      sourceId,
      submittedBy: body.user ?? null,
      submittedAt: body.timestamp
        ? new Date(parseFloat(body.timestamp) * 1000)
        : new Date(),
      status: "PENDING",
      auditLogs: {
        create: { action: "ingested", note: `Received from #${source}` },
      },
    },
  });

  // Process with Claude
  try {
    const result = await classifyFeedback(rawText, source);

    const updated = await db.feedbackItem.update({
      where: { id: item.id },
      data: {
        problemStatement: result.problemStatement,
        userIntent: result.userIntent,
        painDescription: result.painDescription,
        impactEstimate: result.impactEstimate,
        suggestedImprovement: result.suggestedImprovement,
        confidenceScore: result.confidenceScore,
        category: result.category,
        classification: result.classification,
        impactScore: result.impactScore,
        severityScore: result.severityScore,
        frequencyScore: result.frequencyScore,
        strategicScore: result.strategicScore,
        effortScore: result.effortScore,
        productPotential: result.productPotential,
        partner: result.partner,
        theme: result.theme,
        status: "PROCESSED",
        auditLogs: {
          create: {
            action: "processed",
            note: `Classified as ${result.classification} (confidence: ${result.confidenceScore})`,
          },
        },
      },
    });

    return NextResponse.json(updated, { status: 201 });
  } catch (err) {
    console.error("Claude classification failed:", err);
    // Return the pending item even if classification failed
    return NextResponse.json(item, { status: 201 });
  }
}
