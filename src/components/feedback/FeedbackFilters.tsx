"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const CLASSIFICATIONS = [
  { value: "all", label: "All Classifications" },
  { value: "PRODUCT_OPPORTUNITY", label: "Product Opportunity" },
  { value: "BUG_DEFECT", label: "Bug / Defect" },
  { value: "OPERATIONAL_ISSUE", label: "Operational Issue" },
  { value: "NOISE", label: "Not Actionable" },
];

const STATUSES = [
  { value: "all", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSED", label: "Processed" },
  { value: "ROUTED", label: "Routed" },
];

export function FeedbackFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`?${params.toString()}`);
  }

  function clearAll() {
    router.push("?");
  }

  const hasFilters = searchParams.toString().length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      <Select
        value={searchParams.get("classification") ?? "all"}
        onValueChange={(v) => updateParam("classification", v)}
      >
        <SelectTrigger className="w-48 h-8 text-xs">
          <SelectValue placeholder="All Classifications" />
        </SelectTrigger>
        <SelectContent>
          {CLASSIFICATIONS.map(({ value, label }) => (
            <SelectItem key={value} value={value} className="text-xs">
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("status") ?? "all"}
        onValueChange={(v) => updateParam("status", v)}
      >
        <SelectTrigger className="w-36 h-8 text-xs">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map(({ value, label }) => (
            <SelectItem key={value} value={value} className="text-xs">
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        placeholder="Channel..."
        defaultValue={searchParams.get("channel") ?? ""}
        onBlur={(e) => updateParam("channel", e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") updateParam("channel", e.currentTarget.value);
        }}
        className="w-36 h-8 text-xs"
      />

      <Input
        placeholder="Partner..."
        defaultValue={searchParams.get("partner") ?? ""}
        onBlur={(e) => updateParam("partner", e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") updateParam("partner", e.currentTarget.value);
        }}
        className="w-32 h-8 text-xs"
      />

      <Input
        placeholder="Theme..."
        defaultValue={searchParams.get("theme") ?? ""}
        onBlur={(e) => updateParam("theme", e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") updateParam("theme", e.currentTarget.value);
        }}
        className="w-32 h-8 text-xs"
      />

      <Input
        type="number"
        placeholder="Min score"
        defaultValue={searchParams.get("minScore") ?? ""}
        min={0}
        max={100}
        onBlur={(e) => updateParam("minScore", e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") updateParam("minScore", e.currentTarget.value);
        }}
        className="w-24 h-8 text-xs"
      />

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="h-8 text-xs gap-1 text-gray-500"
        >
          <X className="h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
