import { useEffect, useState } from "react";
import type { SyncApi, SyncStatus } from "../hooks/useSync";

const STATUS_META: Record<
  SyncStatus,
  { dot: string; label: string; text: string }
> = {
  off: { dot: "bg-slate-300", label: "Local only", text: "text-slate-500" },
  syncing: { dot: "bg-amber-400", label: "Syncing…", text: "text-amber-600" },
  synced: { dot: "bg-emerald-500", label: "Synced", text: "text-emerald-600" },
  error: { dot: "bg-red-500", label: "Sync error", text: "text-red-600" },
};

export default function SyncControl({ sync }: { sync: SyncApi }) {
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [localErr, setLocalErr] = useState<string | null>(null);
  const meta = STATUS_META[sync.status];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function connect() {
    if (!pw.trim()) return;
    setBusy(true);
    setLocalErr(null);
    const res = await sync.connect(pw.trim());
    setBusy(false);
    if (res.ok) {
      setPw("");
      setOpen(false);
    } else {
      setLocalErr(res.error ?? "Couldn't connect.");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50"
        title="Cloud sync"
      >
        <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
        <span className={meta.text}>{meta.label}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/50 p-4 sm:p-10"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">Cloud sync</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-1 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {sync.configured ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
                  <span className={`font-medium ${meta.text}`}>
                    {meta.label}
                  </span>
                  <span className="text-slate-400">
                    · this device is connected
                  </span>
                </div>
                {sync.error && (
                  <p className="text-xs text-red-500">{sync.error}</p>
                )}
                <p className="text-xs leading-relaxed text-slate-500">
                  Your work saves to the cloud automatically and loads on any
                  device that connects with the same password.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => sync.syncNow()}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                  >
                    Sync now
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sync.disconnect();
                      setOpen(false);
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Disconnect this device
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs leading-relaxed text-slate-500">
                  Enter the sync password you set in Vercel (the{" "}
                  <code className="rounded bg-slate-100 px-1">SYNC_PASSWORD</code>{" "}
                  env var) to sync this device's data with the cloud and pull
                  your latest from anywhere.
                </p>
                <input
                  type="password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && connect()}
                  placeholder="Sync password"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
                {localErr && <p className="text-xs text-red-500">{localErr}</p>}
                <button
                  type="button"
                  onClick={connect}
                  disabled={busy || !pw.trim()}
                  className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {busy ? "Connecting…" : "Connect"}
                </button>
                <p className="text-xs text-slate-400">
                  Until you connect, everything is saved locally in this browser
                  only.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
