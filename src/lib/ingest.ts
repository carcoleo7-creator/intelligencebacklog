import { getDB } from "./db";
import { classifyFeedback } from "./claude";

export interface IngestInput {
  rawText: string;
  source: string;
  sourceId?: string | null;
  submittedBy?: string | null;
  submittedAt?: Date | null;
}

export type IngestStatus = "processed" | "pending" | "duplicate" | "skipped";

export interface IngestResult {
  id?: string;
  status: IngestStatus;
}

export async function ingestItem(input: IngestInput): Promise<IngestResult> {
  if (input.rawText.trim().length < 10) {
    return { status: "skipped" };
  }

  const db = getDB();

  if (input.sourceId) {
    const existing = await db.feedbackItem.findUnique({ where: { sourceId: input.sourceId } });
    if (existing) return { id: existing.id, status: "duplicate" };
  }

  const item = await db.feedbackItem.create({
    data: {
      rawText: input.rawText.trim(),
      source: input.source,
      sourceId: input.sourceId ?? null,
      submittedBy: input.submittedBy ?? null,
      submittedAt: input.submittedAt ?? new Date(),
      status: "PENDING",
      auditLogs: {
        create: { action: "ingested", note: `Received from ${input.source}` },
      },
    },
  });

  try {
    const result = await classifyFeedback(item.rawText, item.source);
    await db.feedbackItem.update({
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
    return { id: item.id, status: "processed" };
  } catch {
    return { id: item.id, status: "pending" };
  }
}
