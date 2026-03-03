"use client";

import { useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  AlertCircle,
  Check,
  FileText,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Tab = "slack" | "csv";
type Status = "idle" | "loading" | "done" | "error";

interface ImportResult {
  imported: number;
  duplicates: number;
  skipped: number;
  total: number;
}

// Minimal RFC-4180-compatible CSV parser
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function parseCSV(text: string): Array<Record<string, string>> {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());
  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
}

const TEXT_COLUMN_CANDIDATES = ["text", "feedback", "message", "content", "comment", "body"];
const CHANNEL_COLUMN_CANDIDATES = ["channel", "source", "slack_channel", "team"];

export function IngestDialog() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("slack");

  // Slack
  const [channelId, setChannelId] = useState("");
  const [channelName, setChannelName] = useState("");
  const [limit, setLimit] = useState("100");

  // CSV
  const [csvRows, setCsvRows] = useState<Array<Record<string, string>>>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [textColumn, setTextColumn] = useState("");
  const [channelColumn, setChannelColumn] = useState("");
  const [defaultChannel, setDefaultChannel] = useState("csv-upload");

  // Shared result state
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  function resetState() {
    setStatus("idle");
    setResult(null);
    setError("");
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      setCsvRows(rows);
      const cols = Object.keys(rows[0] ?? {});
      setTextColumn(cols.find((c) => TEXT_COLUMN_CANDIDATES.includes(c)) ?? cols[0] ?? "");
      setChannelColumn(cols.find((c) => CHANNEL_COLUMN_CANDIDATES.includes(c)) ?? "");
    };
    reader.readAsText(file);
  }

  async function importSlack() {
    if (!channelId.trim()) {
      setError("Channel ID is required");
      return;
    }
    setStatus("loading");
    setResult(null);
    setError("");
    try {
      const res = await fetch("/api/ingest/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId: channelId.trim(),
          channelName: channelName.trim() || undefined,
          limit: Number(limit),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Import failed");
        setStatus("error");
        return;
      }
      setResult(data);
      setStatus("done");
    } catch {
      setError("Network error");
      setStatus("error");
    }
  }

  async function importCSV() {
    if (!csvRows.length) {
      setError("No file loaded");
      return;
    }
    if (!textColumn) {
      setError("Select the text column");
      return;
    }
    const rows = csvRows
      .map((row) => ({
        text: row[textColumn] ?? "",
        channel: channelColumn ? row[channelColumn] : undefined,
      }))
      .filter((r) => r.text.trim().length >= 10);

    setStatus("loading");
    setResult(null);
    setError("");
    try {
      const res = await fetch("/api/ingest/csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows, defaultChannel }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Import failed");
        setStatus("error");
        return;
      }
      setResult(data);
      setStatus("done");
    } catch {
      setError("Network error");
      setStatus("error");
    }
  }

  const csvColumns = csvRows.length > 0 ? Object.keys(csvRows[0]) : [];

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetState();
      }}
    >
      <Dialog.Trigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="h-4 w-4" />
          Import
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-white rounded-xl shadow-xl p-6 focus:outline-none">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-base font-semibold text-gray-900">
              Import Feedback
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-5">
            <button
              onClick={() => {
                setTab("slack");
                resetState();
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === "slack"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {/* Slack logo mark */}
              <svg className="h-4 w-4" viewBox="0 0 54 54" fill="currentColor">
                <path
                  d="M19.7 33.7a4.4 4.4 0 1 1-4.4-4.4h4.4v4.4zm2.2 0a4.4 4.4 0 0 1 8.8 0v11a4.4 4.4 0 1 1-8.8 0v-11zm4.4-14a4.4 4.4 0 1 1 4.4-4.4v4.4h-4.4zm0 2.2a4.4 4.4 0 0 1 0 8.8H15.3a4.4 4.4 0 1 1 0-8.8H26.3zm14 4.4a4.4 4.4 0 1 1 4.4 4.4h-4.4v-4.4zm-2.2 0a4.4 4.4 0 0 1-8.8 0V15.3a4.4 4.4 0 1 1 8.8 0v11zm-4.4 14a4.4 4.4 0 1 1-4.4 4.4v-4.4h4.4zm0-2.2a4.4 4.4 0 0 1 0-8.8H44.7a4.4 4.4 0 1 1 0 8.8H33.7z"
                  fill="currentColor"
                />
              </svg>
              Slack
            </button>
            <button
              onClick={() => {
                setTab("csv");
                resetState();
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === "csv"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FileText className="h-4 w-4" />
              CSV / Google Sheets
            </button>
          </div>

          {/* Slack tab */}
          {tab === "slack" && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">
                Requires a{" "}
                <code className="bg-gray-100 px-1 rounded font-mono">SLACK_BOT_TOKEN</code>{" "}
                env var with <code className="bg-gray-100 px-1 rounded font-mono">channels:history</code> scope.
                Invite your bot to the channel first.
              </p>
              <div>
                <label className="text-xs font-medium text-gray-700">
                  Channel ID <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="C0123456789"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  className="mt-1 h-8 text-sm font-mono"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Right-click the channel in Slack → Copy link → ID is at the end of the URL
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">
                  Channel name (optional)
                </label>
                <Input
                  placeholder="customer-feedback"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  className="mt-1 h-8 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">
                  Messages to fetch (max 200)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={200}
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="mt-1 h-8 text-sm w-24"
                />
              </div>
            </div>
          )}

          {/* CSV tab */}
          {tab === "csv" && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">
                From Google Sheets: <strong>File → Download → Comma-separated values</strong>.
                Must have a header row.
              </p>

              {/* Drop zone */}
              <div
                className="border-2 border-dashed border-gray-200 rounded-lg p-5 text-center cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="h-6 w-6 text-gray-400 mx-auto mb-1.5" />
                <p className="text-sm text-gray-600">
                  {csvFileName ? csvFileName : "Click to upload a CSV file"}
                </p>
                {csvRows.length > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {csvRows.length} rows detected
                  </p>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleFile}
                />
              </div>

              {csvColumns.length > 0 && (
                <>
                  <div>
                    <label className="text-xs font-medium text-gray-700">
                      Feedback text column <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={textColumn}
                      onChange={(e) => setTextColumn(e.target.value)}
                      className="mt-1 w-full h-8 text-sm border border-gray-200 rounded-md px-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {csvColumns.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700">
                      Source / channel column (optional)
                    </label>
                    <select
                      value={channelColumn}
                      onChange={(e) => setChannelColumn(e.target.value)}
                      className="mt-1 w-full h-8 text-sm border border-gray-200 rounded-md px-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">— none —</option>
                      {csvColumns.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {!channelColumn && (
                    <div>
                      <label className="text-xs font-medium text-gray-700">
                        Default source label
                      </label>
                      <Input
                        value={defaultChannel}
                        onChange={(e) => setDefaultChannel(e.target.value)}
                        placeholder="csv-upload"
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                  )}

                  {/* Preview */}
                  {csvRows.length > 0 && textColumn && (
                    <div className="rounded-md border border-gray-100 overflow-hidden">
                      <p className="text-xs font-medium text-gray-500 px-3 py-1.5 bg-gray-50 border-b border-gray-100">
                        Preview (first 3 rows)
                      </p>
                      <ul className="divide-y divide-gray-50">
                        {csvRows.slice(0, 3).map((row, i) => (
                          <li key={i} className="px-3 py-1.5 text-xs text-gray-600 truncate">
                            {row[textColumn] || <span className="text-gray-300 italic">empty</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Result banner */}
          {status === "done" && result && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm text-green-800 flex items-start gap-2">
              <Check className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">{result.imported} item{result.imported !== 1 ? "s" : ""} imported</p>
                <p className="text-xs text-green-700 mt-0.5">
                  {result.duplicates} already existed · {result.skipped} skipped (too short)
                </p>
              </div>
            </div>
          )}

          {status === "error" && error && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg text-sm text-red-800 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 mt-5">
            <Dialog.Close asChild>
              <Button variant="ghost" size="sm">
                Cancel
              </Button>
            </Dialog.Close>
            {status === "done" ? (
              <Button
                size="sm"
                onClick={() => {
                  setOpen(false);
                  resetState();
                }}
              >
                Done
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={tab === "slack" ? importSlack : importCSV}
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                    Importing…
                  </>
                ) : (
                  "Import"
                )}
              </Button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
