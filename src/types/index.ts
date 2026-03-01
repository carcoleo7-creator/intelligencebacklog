export type Category = "PRODUCT_GAP" | "BUG" | "OPERATIONAL" | "MISUNDERSTANDING";
export type Classification =
  | "PRODUCT_OPPORTUNITY"
  | "BUG_DEFECT"
  | "OPERATIONAL_ISSUE"
  | "NOISE";
export type Status = "PENDING" | "PROCESSED" | "ROUTED" | "CLOSED";
export type RoutingDest =
  | "PRODUCT_BACKLOG"
  | "ENGINEERING_BUG_QUEUE"
  | "OPS_PLAYBOOK"
  | "NOISE";

export interface FeedbackItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  rawText: string;
  source: string;
  sourceId: string | null;
  submittedBy: string | null;
  submittedAt: string | null;
  problemStatement: string | null;
  userIntent: string | null;
  painDescription: string | null;
  impactEstimate: string | null;
  suggestedImprovement: string | null;
  confidenceScore: number | null;
  category: Category | null;
  classification: Classification | null;
  impactScore: number | null;
  severityScore: number | null;
  frequencyScore: number | null;
  strategicScore: number | null;
  effortScore: number | null;
  productPotential: number | null;
  partner: string | null;
  theme: string | null;
  status: Status;
  routedTo: RoutingDest | null;
  routedAt: string | null;
  routedBy: string | null;
  routingNote: string | null;
  mergedIntoId: string | null;
  auditLogs?: AuditLogEntry[];
}

export interface AuditLogEntry {
  id: string;
  createdAt: string;
  feedbackId: string;
  action: string;
  actor: string | null;
  note: string | null;
}

export interface FeedbackListResponse {
  items: FeedbackItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface FeedbackFilters {
  channel?: string;
  category?: string;
  classification?: string;
  minScore?: number;
  partner?: string;
  theme?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}
