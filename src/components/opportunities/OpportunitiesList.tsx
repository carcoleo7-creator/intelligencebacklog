"use client";

import { useState } from "react";
import useSWR from "swr";
import { OpportunityCard } from "./OpportunityCard";
import { TrendChart } from "./TrendChart";
import { MergeModal } from "./MergeModal";
import { TrendingUp } from "lucide-react";
import type { FeedbackItem } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function OpportunitiesList() {
  const { data, isLoading, mutate } = useSWR<{
    items: FeedbackItem[];
    total: number;
  }>("/api/opportunities", fetcher, { refreshInterval: 60_000 });

  const [mergeSource, setMergeSource] = useState<FeedbackItem | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-48 rounded-lg bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <TrendingUp className="h-12 w-12 text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">No opportunities yet</p>
        <p className="text-gray-400 text-sm mt-1">
          Items classified as Product Opportunity with a score ≥ 60 will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <TrendChart items={data.items} />

      <div className="space-y-3">
        {data.items.map((item) => (
          <OpportunityCard
            key={item.id}
            item={item}
            onMerge={setMergeSource}
            onUpdate={() => mutate()}
          />
        ))}
      </div>

      <MergeModal
        open={mergeSource !== null}
        sourceItem={mergeSource}
        candidates={data.items}
        onClose={() => setMergeSource(null)}
        onMerged={() => mutate()}
      />
    </>
  );
}
