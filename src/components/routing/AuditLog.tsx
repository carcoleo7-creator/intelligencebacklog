"use client";

import useSWR from "swr";
import { formatDistanceToNow } from "date-fns";
import { Clock, GitBranch, Cpu, GitMerge, Download } from "lucide-react";
import type { AuditLogEntry } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const ACTION_ICONS: Record<string, React.ElementType> = {
  ingested: Download,
  processed: Cpu,
  routed: GitBranch,
  merged: GitMerge,
};

const ACTION_COLORS: Record<string, string> = {
  ingested: "text-blue-500 bg-blue-50",
  processed: "text-purple-500 bg-purple-50",
  routed: "text-green-500 bg-green-50",
  merged: "text-orange-500 bg-orange-50",
};

export function AuditLog() {
  const { data, isLoading } = useSWR<AuditLogEntry[]>(
    "/api/audit?limit=50",
    fetcher,
    { refreshInterval: 20_000 }
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 rounded bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Clock className="h-10 w-10 text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">No audit log entries</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto pr-1">
      {data.map((entry) => {
        const Icon = ACTION_ICONS[entry.action] ?? Clock;
        const colorClass = ACTION_COLORS[entry.action] ?? "text-gray-500 bg-gray-100";
        return (
          <div
            key={entry.id}
            className="flex items-start gap-3 bg-white rounded-lg border border-gray-100 p-3"
          >
            <div className={`p-1.5 rounded-md shrink-0 ${colorClass}`}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-gray-700 capitalize">
                  {entry.action}
                </span>
                <span className="text-[10px] text-gray-400 shrink-0">
                  {formatDistanceToNow(new Date(entry.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              {entry.note && (
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                  {entry.note}
                </p>
              )}
              {entry.actor && (
                <p className="text-[10px] text-gray-400 mt-0.5">by {entry.actor}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
