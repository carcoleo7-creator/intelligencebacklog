"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopBar() {
  const [ingesting, setIngesting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleIngest() {
    setIngesting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/webhook/manual", { method: "POST" });
      if (res.ok) {
        setMessage("Ingestion complete");
      } else {
        setMessage("Ingestion failed");
      }
    } catch {
      setMessage("Network error");
    } finally {
      setIngesting(false);
      setTimeout(() => setMessage(null), 3000);
    }
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <div>
        {message && (
          <span className="text-sm text-gray-500">{message}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleIngest}
          disabled={ingesting}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${ingesting ? "animate-spin" : ""}`} />
          {ingesting ? "Processing..." : "Refresh"}
        </Button>
      </div>
    </header>
  );
}
