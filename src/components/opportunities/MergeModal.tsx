"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { FeedbackItem } from "@/types";

interface MergeModalProps {
  open: boolean;
  sourceItem: FeedbackItem | null;
  candidates: FeedbackItem[];
  onClose: () => void;
  onMerged: () => void;
}

export function MergeModal({
  open,
  sourceItem,
  candidates,
  onClose,
  onMerged,
}: MergeModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [merging, setMerging] = useState(false);

  const others = candidates.filter((c) => c.id !== sourceItem?.id);

  async function handleMerge() {
    if (!sourceItem || !selectedId) return;
    setMerging(true);
    try {
      // Merge sourceItem into selectedId (selectedId is canonical)
      await fetch(`/api/feedback/${sourceItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mergedIntoId: selectedId }),
      });
      onMerged();
      onClose();
    } finally {
      setMerging(false);
      setSelectedId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Merge Duplicate</DialogTitle>
          <DialogDescription>
            Select the canonical item to keep. The current item will be merged into it.
          </DialogDescription>
        </DialogHeader>

        {sourceItem && (
          <div className="mb-3 p-3 bg-blue-50 rounded-md border border-blue-200">
            <p className="text-xs font-medium text-blue-700 mb-1">Merging:</p>
            <p className="text-sm text-gray-800 line-clamp-2">
              {sourceItem.problemStatement ?? sourceItem.rawText}
            </p>
          </div>
        )}

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {others.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No other opportunities to merge with.
            </p>
          ) : (
            others.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`w-full text-left p-3 rounded-md border text-sm transition-colors ${
                  selectedId === item.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <p className="font-medium text-gray-800 line-clamp-1">
                  {item.problemStatement ?? item.rawText}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Score: {Math.round(item.productPotential ?? 0)} · #{item.source}
                </p>
              </button>
            ))
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!selectedId || merging}
            onClick={handleMerge}
          >
            {merging ? "Merging..." : "Merge"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
