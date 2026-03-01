"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { RoutingDest } from "@/types";

const ACTIONS: { dest: RoutingDest; label: string; variant: "default" | "destructive" | "secondary" | "outline" }[] = [
  { dest: "PRODUCT_BACKLOG", label: "Product Backlog", variant: "default" },
  { dest: "ENGINEERING_BUG_QUEUE", label: "Bug Queue", variant: "destructive" },
  { dest: "OPS_PLAYBOOK", label: "Ops Playbook", variant: "secondary" },
  { dest: "NOISE", label: "Close as Noise", variant: "outline" },
];

interface RouteActionButtonsProps {
  feedbackId: string;
  onRouted: () => void;
}

export function RouteActionButtons({ feedbackId, onRouted }: RouteActionButtonsProps) {
  const [pendingDest, setPendingDest] = useState<RoutingDest | null>(null);
  const [note, setNote] = useState("");
  const [routing, setRouting] = useState(false);

  async function handleConfirm() {
    if (!pendingDest) return;
    setRouting(true);
    try {
      await fetch(`/api/feedback/${feedbackId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routedTo: pendingDest,
          routingNote: note.trim() || undefined,
        }),
      });
      onRouted();
    } finally {
      setRouting(false);
      setPendingDest(null);
      setNote("");
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        {ACTIONS.map(({ dest, label, variant }) => (
          <Button
            key={dest}
            variant={variant}
            size="sm"
            className="text-xs h-7"
            onClick={() => setPendingDest(dest)}
          >
            {label}
          </Button>
        ))}
      </div>

      <Dialog open={pendingDest !== null} onOpenChange={(o) => !o && setPendingDest(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Routing</DialogTitle>
            <DialogDescription>
              Route to{" "}
              <strong>
                {ACTIONS.find((a) => a.dest === pendingDest)?.label}
              </strong>
              . Add an optional note for the audit log.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Optional reason or note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-2"
            rows={3}
          />
          <div className="flex justify-end gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPendingDest(null)}
            >
              Cancel
            </Button>
            <Button size="sm" disabled={routing} onClick={handleConfirm}>
              {routing ? "Routing..." : "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
