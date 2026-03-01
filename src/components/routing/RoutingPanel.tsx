"use client";

import useSWR from "swr";
import { RouteActionButtons } from "./RouteActionButtons";
import { ClassificationBadge } from "@/components/feedback/ClassificationBadge";
import { ScoreMeter } from "@/components/feedback/ScoreMeter";
import { GitBranch, Hash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { FeedbackListResponse } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function RoutingPanel() {
  const { data, isLoading, mutate } = useSWR<FeedbackListResponse>(
    "/api/feedback?status=PROCESSED&pageSize=50",
    fetcher,
    { refreshInterval: 20_000 }
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 rounded-lg bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <GitBranch className="h-10 w-10 text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">No items to route</p>
        <p className="text-gray-400 text-sm mt-1">
          Processed feedback waiting for routing will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 mb-3">
        {data.total} item{data.total !== 1 ? "s" : ""} awaiting routing
      </p>
      {data.items.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-start gap-3 mb-3">
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
                  {formatDistanceToNow(new Date(item.createdAt), {
                    addSuffix: true,
                  })}
                </span>
                {item.classification && (
                  <ClassificationBadge classification={item.classification} />
                )}
              </div>
            </div>
            {item.productPotential !== null && (
              <ScoreMeter score={Math.round(item.productPotential)} />
            )}
          </div>
          {item.suggestedImprovement && (
            <p className="text-xs text-gray-500 mb-3 border-l-2 border-gray-200 pl-2">
              {item.suggestedImprovement}
            </p>
          )}
          <RouteActionButtons
            feedbackId={item.id}
            onRouted={() => mutate()}
          />
        </div>
      ))}
    </div>
  );
}
