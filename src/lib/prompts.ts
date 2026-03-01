export const CLASSIFICATION_SYSTEM_PROMPT = `You are a product intelligence analyst. Respond with valid JSON only — no prose, no markdown, no explanation.`;

export function buildClassificationPrompt(rawText: string, channel: string): string {
  return `Analyze this customer feedback from Slack channel #${channel}:
"""
${rawText}
"""

Return this exact JSON object (all fields required):
{
  "problemStatement": "rewritten in third person, clear and concise",
  "userIntent": "what the user was trying to accomplish",
  "painDescription": "what specifically went wrong or was frustrating",
  "impactEstimate": "who and how many users are affected",
  "category": "PRODUCT_GAP or BUG or OPERATIONAL or MISUNDERSTANDING",
  "classification": "PRODUCT_OPPORTUNITY or BUG_DEFECT or OPERATIONAL_ISSUE or NOISE",
  "suggestedImprovement": "one concrete, actionable recommendation",
  "confidenceScore": 0.85,
  "partner": "company name if mentioned, otherwise null",
  "theme": "product area e.g. API, Billing, Auth, Reporting, Onboarding",
  "impactScore": 3,
  "severityScore": 3,
  "frequencyScore": 3,
  "strategicScore": 3,
  "effortScore": 3
}

Classification rubric:
- PRODUCT_OPPORTUNITY: missing feature or UX gap with clear user value
- BUG_DEFECT: system behaves incorrectly compared to expected behavior
- OPERATIONAL_ISSUE: process, support, or configuration problem (not a code bug)
- NOISE: unclear, spam, off-topic, or not actionable

Scoring rubric (1=low, 5=high):
- impactScore: how many users/partners affected (1=one user, 5=all users)
- severityScore: how painful is this (1=minor annoyance, 5=blocks core workflow)
- frequencyScore: how often does it happen (1=rare, 5=multiple times daily)
- strategicScore: alignment with product roadmap themes (1=tangential, 5=core)
- effortScore: implementation complexity (1=quick fix, 5=multi-quarter project)`;
}
