import Anthropic from "@anthropic-ai/sdk";
import { buildClassificationPrompt, CLASSIFICATION_SYSTEM_PROMPT } from "./prompts";
import { calculateProductPotential } from "./scoring";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  }
  return client;
}

export interface ClassificationResult {
  problemStatement: string;
  userIntent: string;
  painDescription: string;
  impactEstimate: string;
  category: "PRODUCT_GAP" | "BUG" | "OPERATIONAL" | "MISUNDERSTANDING";
  classification: "PRODUCT_OPPORTUNITY" | "BUG_DEFECT" | "OPERATIONAL_ISSUE" | "NOISE";
  suggestedImprovement: string;
  confidenceScore: number;
  partner: string | null;
  theme: string;
  impactScore: number;
  severityScore: number;
  frequencyScore: number;
  strategicScore: number;
  effortScore: number;
  productPotential: number;
}

export async function classifyFeedback(
  rawText: string,
  channel: string
): Promise<ClassificationResult> {
  const anthropic = getClient();

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: CLASSIFICATION_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildClassificationPrompt(rawText, channel),
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text.trim() : "";

  // Strip any markdown code fences if present
  const jsonText = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");

  const parsed = JSON.parse(jsonText);

  const productPotential = calculateProductPotential({
    impact: parsed.impactScore ?? 3,
    severity: parsed.severityScore ?? 3,
    frequency: parsed.frequencyScore ?? 3,
    strategic: parsed.strategicScore ?? 3,
    effort: parsed.effortScore ?? 3,
  });

  return { ...parsed, productPotential };
}
