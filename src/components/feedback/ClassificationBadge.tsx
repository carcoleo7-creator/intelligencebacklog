import { Badge } from "@/components/ui/badge";
import type { Classification } from "@/types";

const CONFIG: Record<
  Classification,
  { label: string; variant: "default" | "destructive" | "secondary" | "outline" | "warning" }
> = {
  PRODUCT_OPPORTUNITY: { label: "Opportunity", variant: "default" },
  BUG_DEFECT: { label: "Bug", variant: "destructive" },
  OPERATIONAL_ISSUE: { label: "Operational", variant: "warning" },
  NOISE: { label: "Noise", variant: "outline" },
};

export function ClassificationBadge({
  classification,
}: {
  classification: Classification;
}) {
  const { label, variant } = CONFIG[classification] ?? {
    label: classification,
    variant: "outline",
  };
  return <Badge variant={variant as never}>{label}</Badge>;
}
