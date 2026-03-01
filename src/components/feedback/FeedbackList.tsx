"use client";

import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { FeedbackCard } from "./FeedbackCard";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FeedbackListResponse } from "@/types";
import { useRouter } from "next/navigation";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function FeedbackList() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const params = new URLSearchParams(searchParams.toString());
  const page = Number(params.get("page") ?? "1");

  const queryString = params.toString();
  const { data, isLoading, mutate } = useSWR<FeedbackListResponse>(
    `/api/feedback${queryString ? `?${queryString}` : ""}`,
    fetcher,
    { refreshInterval: 30_000 }
  );

  function setPage(newPage: number) {
    const p = new URLSearchParams(searchParams.toString());
    p.set("page", String(newPage));
    router.push(`?${p.toString()}`);
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Inbox className="h-12 w-12 text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">No feedback yet</p>
        <p className="text-gray-400 text-sm mt-1">
          Connect Zapier or Slack Workflow to start ingesting feedback automatically.
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(data.total / (data.pageSize ?? 25));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">
          {data.total} item{data.total !== 1 ? "s" : ""}
          {data.total > (data.pageSize ?? 25) &&
            ` — page ${page} of ${totalPages}`}
        </p>
      </div>

      {data.items.map((item) => (
        <FeedbackCard key={item.id} item={item} onUpdate={() => mutate()} />
      ))}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
