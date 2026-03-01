import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { classifyFeedback } from "@/lib/claude";

export const dynamic = "force-dynamic";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  const db = getDB();

  const item = await db.feedbackItem.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const result = await classifyFeedback(item.rawText, item.source);

  const updated = await db.feedbackItem.update({
    where: { id },
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
          note: `Re-processed. Classified as ${result.classification}`,
        },
      },
    },
  });

  return NextResponse.json(updated);
}
