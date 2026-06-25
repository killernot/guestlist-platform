import React, { useEffect, useState, useCallback } from "react";
import SheetLink from "./SheetLink";

interface Sheet {
  id: string;
  eventId: string;
  sheetUrl: string;
  sheetName: string | null;
  syncStatus: string;
  lastSyncedAt: string | null;
  createdAt: string;
}

interface SheetsManagerProps {
  eventId: string;
}

function SyncStatusBadge({ status }: { status: string }) {
  const normalized = status?.toLowerCase() || "unknown";

  const colorMap: Record<string, string> = {
    synced: "bg-green-900/50 text-green-400",
    syncing: "bg-blue-900/50 text-blue-400",
    pending: "bg-yellow-900/50 text-yellow-400",
    failed: "bg-red-900/50 text-red-400",
    error: "bg-red-900/50 text-red-400",
  };

  const colorClass = colorMap[normalized] || "bg-gray-700 text-gray-300";

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${colorClass}`}>
      {status || "Unknown"}
    </span>
  );
}

export default function SheetsManager({ eventId }: SheetsManagerProps) {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSheets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sheets/events/${eventId}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch sheets: ${res.statusText}`);
      }
      const data = await res.json();
      setSheets(Array.isArray(data) ? data : data.sheets || []);
    } catch (err: any) {
      setError(err.message || "Failed to load sheets");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchSheets();
  }, [fetchSheets]);

  const handleSyncAll = async () => {
    setSyncing(true);
    setError(null);
    try {
      const res = await fetch("/api/sheets/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      if (!res.ok) {
        throw new Error(`Sync failed: ${res.statusText}`);
      }
      // Refresh the list after sync
      await fetchSheets();
    } catch (err: any) {
      setError(err.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Linked Sheets</h2>
        <button
          onClick={handleSyncAll}
          disabled={syncing}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          {syncing ? "Syncing..." : "Sync All"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-400 text-sm">Loading sheets...</p>
      ) : sheets.length === 0 ? (
        <p className="text-gray-500 text-sm">No sheets linked to this event yet.</p>
      ) : (
        <ul className="space-y-3">
          {sheets.map((sheet) => (
            <li
              key={sheet.id}
              className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-md p-4"
            >
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-white font-medium truncate">
                  {sheet.sheetName || "Untitled Sheet"}
                </span>
                <span className="text-xs text-gray-400 truncate">
                  {sheet.sheetUrl}
                </span>
                {sheet.lastSyncedAt && (
                  <span className="text-xs text-gray-500">
                    Last synced: {new Date(sheet.lastSyncedAt).toLocaleString()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 ml-4 shrink-0">
                <SyncStatusBadge status={sheet.syncStatus} />
                {sheet.sheetUrl && (
                  <SheetLink sheetUrl={sheet.sheetUrl} />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
