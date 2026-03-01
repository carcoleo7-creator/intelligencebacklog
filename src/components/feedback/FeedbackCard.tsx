"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { RefreshCw, Hash, User, Lightbulb } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClassificationBadge } from "./ClassificationBadge";
import { ScoreMeter } from "./ScoreMeter";
import type { FeedbackItem } from "@/types";

interface FeedbackCardProps {
  item: FeedbackItem;
  onUpdate: () => void;
}

export function FeedbackCard({ item, onUpdate }: FeedbackCardProps) {
  const [processing, setProcessing] = useState(false);

  async function handleProcess() {
    setProcessing(true);
    try {
      await fetch(`/api/feedback/${item.id}/process`, { method: "POST" });
      onUpdate();
    } finally {
      setProcessing(false);
    }
  }

  const displayText = item.problemStatement ?? item.rawText;
  const isProcessed = item.status !== "PENDING";
  const isRouted = item.status === "ROUTED" || item.status === "CLOSED";

  return (
    <Card className={`transition-shadow hover:shadow-md ${isRouted ? "opacity-60" : ""}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
              {displayText}
            </p>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Hash className="h-3 w-3" />
                {item.source}
              </span>
              {item.submittedBy && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <User className="h-3 w-3" />
                  {item.submittedBy}
                </span>
              )}
              <span className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </span>
              {item.theme && (
                <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                  {item.theme}
                </span>
              )}
              {item.partner && (
                <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                  {item.partner}
                </span>
              )}
            </div>
          </div>
          {item.productPotential !== null && isProcessed && (
            <ScoreMeter score={Math.round(item.productPotential)} />
          )}
        </div>
      </CardHeader>

      {isProcessed && (
        <CardContent className="pt-0">
          <div className="space-y-1.5">
            {item.userIntent && (
              <p className="text-xs text-gray-600">
                <span className="font-medium text-gray-700">Intent:</span>{" "}
                {item.userIntent}
              </p>
            )}
            {item.suggestedImprovement && (
              <p className="text-xs text-gray-600 flex gap-1">
                <Lightbulb className="h-3 w-3 text-yellow-500 mt-0.5 shrink-0" />
                {item.suggestedImprovement}
              </p>
            )}
          </div>
        </CardContent>
      )}

      <CardFooter className="pt-2 gap-2 flex-wrap">
        {item.classification && (
          <ClassificationBadge classification={item.classification} />
        )}
        {item.status === "PENDING" && (
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            Pending
          </span>
        )}
        {isRouted && (
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {item.routedTo?.replace(/_/g, " ")}
          </span>
        )}
        <div className="ml-auto flex gap-1.5">
          {!isProcessed && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleProcess}
              disabled={processing}
              className="text-xs h-7"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${processing ? "animate-spin" : ""}`} />
              {processing ? "Processing..." : "Process"}
            </Button>
          )}
          {isProcessed && !isRouted && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleProcess}
              disabled={processing}
              className="text-xs h-7 text-gray-500"
            >
              <RefreshCw className={`h-3 w-3 ${processing ? "animate-spin" : ""}`} />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
