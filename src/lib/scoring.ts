export const OPPORTUNITY_THRESHOLD = 60;

export function calculateProductPotential(scores: {
  impact: number;
  severity: number;
  frequency: number;
  strategic: number;
  effort: number;
}): number {
  const raw =
    scores.impact    * 0.40 +
    scores.severity  * 0.20 +
    scores.frequency * 0.15 +
    scores.strategic * 0.20 +
    (6 - scores.effort) * 0.05;
  // Normalize from 1–5 range to 0–100
  return Math.round(((raw - 1) / 4) * 100);
}
