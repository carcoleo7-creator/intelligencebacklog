"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { GitMerge, Hash } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClassificationBadge } from "@/components/feedback/ClassificationBadge";
import type { FeedbackItem } from "@/types";

interface ScoreBarProps {
  label: string;
  value: number | null;
  color: string;
  inverted?: boolean;
}

function ScoreBar({ label, value, color, inverted = false }: ScoreBarProps) {
  const display = value ?? 0;
  const pct = inverted
    ? ((6 - display) / 5) * 100
    : ((display - 1) / 4) * 100;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-24 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.max(pct, 4)}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 w-4 text-right">{display}</span>
    </div>
  );
}

interface OpportunityCardProps {
  item: FeedbackItem;
  onMerge: (item: FeedbackItem) => void;
  onUpdate: () => void;
}

export function OpportunityCard({ item, onMerge, onUpdate }: OpportunityCardProps) {
  const [routing, setRouting] = useState(false);

  async function handleRoute(dest: string) {
    setRouting(true);
    try {
      await fetch(`/api/feedback/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routedTo: dest }),
      });
      onUpdate();
    } finally {
      setRouting(false);
    }
  }

  const score = Math.round(item.productPotential ?? 0);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 line-clamp-2">
              {item.problemStatement ?? item.rawText}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Hash className="h-3 w-3" />
                {item.source}
              </span>
              <span className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </span>
              {item.partner && (
                <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                  {item.partner}
                </span>
              )}
              {item.theme && (
                <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                  {item.theme}
                </span>
              )}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div
              className={`text-2xl font-bold tabular-nums ${
                score >= 80
                  ? "text-green-600"
                  : score >= 60
                  ? "text-yellow-600"
                  : "text-orange-500"
              }`}
            >
              {score}
            </div>
            <div className="text-[10px] text-gray-400">/ 100</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {item.suggestedImprovement && (
          <p className="text-xs text-gray-600 mb-3 italic">
            &ldquo;{item.suggestedImprovement}&rdquo;
          </p>
        )}

        <div className="space-y-1">
          <ScoreBar label="Impact (40%)" value={item.impactScore} color="bg-blue-500" />
          <ScoreBar label="Severity (20%)" value={item.severityScore} color="bg-red-400" />
          <ScoreBar label="Frequency (15%)" value={item.frequencyScore} color="bg-purple-400" />
          <ScoreBar label="Strategic (20%)" value={item.strategicScore} color="bg-green-500" />
          <ScoreBar label="Effort (5%)" value={item.effortScore} color="bg-orange-400" inverted />
        </div>
      </CardContent>

      <CardFooter className="gap-2 flex-wrap">
        {item.classification && (
          <ClassificationBadge classification={item.classification} />
        )}
        <div className="ml-auto flex gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7 gap-1 text-gray-500"
            onClick={() => onMerge(item)}
          >
            <GitMerge className="h-3 w-3" />
            Merge
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-7"
            disabled={routing}
            onClick={() => handleRoute("PRODUCT_BACKLOG")}
          >
            Add to Backlog
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
