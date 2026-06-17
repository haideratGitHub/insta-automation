import { useCallback, useEffect, useRef, useState } from "react";
import type { AppState } from "../types";
import { saveAppStateDebounced } from "../lib/storage";
import {
  clearPassword,
  getLocalEditedAt,
  isConfigured,
  pull,
  push,
  setLocalEditedAt,
  setPassword,
  SyncError,
} from "../lib/sync";

export type SyncStatus = "off" | "syncing" | "synced" | "error";

export interface SyncApi {
  status: SyncStatus;
  configured: boolean;
  error: string | null;
  connect: (pw: string) => Promise<{ ok: boolean; error?: string }>;
  disconnect: () => void;
  syncNow: () => Promise<void>;
}

/**
 * Owns persistence for the app:
 *  - always autosaves to localStorage (offline cache)
 *  - when a sync password is set, hydrates from the cloud on load and pushes
 *    (debounced) on every change. Last-write-wins by timestamp.
 */
export function useSync(
  state: AppState,
  setState: (s: AppState) => void,
): SyncApi {
  const stateRef = useRef(state);
  stateRef.current = state;

  const hydratedRef = useRef(false);
  const pushTimer = useRef<ReturnType<typeof setTimeout>>();

  const [status, setStatus] = useState<SyncStatus>(() =>
    isConfigured() ? "syncing" : "off",
  );
  const [error, setError] = useState<string | null>(null);

  // Pull remote once on mount (if configured); adopt it if newer than local.
  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      if (!isConfigured()) {
        hydratedRef.current = true;
        return;
      }
      setStatus("syncing");
      try {
        const env = await pull();
        if (cancelled) return;
        if (env && env.updatedAt >= getLocalEditedAt()) {
          setState(env.state);
          setLocalEditedAt(env.updatedAt);
        } else {
          await push(stateRef.current);
        }
        setStatus("synced");
        setError(null);
      } catch (e) {
        if (!cancelled) {
          setStatus("error");
          setError(e instanceof SyncError ? e.message : "Sync failed.");
        }
      } finally {
        hydratedRef.current = true;
      }
    }
    hydrate();
    return () => {
      cancelled = true;
    };
    // run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on every change: localStorage always, remote (debounced) if on.
  useEffect(() => {
    saveAppStateDebounced(state);
    if (!isConfigured() || !hydratedRef.current) return;
    if (pushTimer.current) clearTimeout(pushTimer.current);
    setStatus("syncing");
    pushTimer.current = setTimeout(async () => {
      try {
        await push(stateRef.current);
        setStatus("synced");
        setError(null);
      } catch (e) {
        setStatus("error");
        setError(e instanceof SyncError ? e.message : "Sync failed.");
      }
    }, 900);
  }, [state]);

  const connect = useCallback(
    async (pw: string) => {
      setPassword(pw);
      setStatus("syncing");
      setError(null);
      try {
        const env = await pull();
        if (env && env.updatedAt >= getLocalEditedAt()) {
          setState(env.state);
          setLocalEditedAt(env.updatedAt);
        } else {
          await push(stateRef.current);
        }
        hydratedRef.current = true;
        setStatus("synced");
        return { ok: true };
      } catch (e) {
        clearPassword();
        setStatus("off");
        const msg = e instanceof SyncError ? e.message : "Sync failed.";
        setError(msg);
        return { ok: false, error: msg };
      }
    },
    [setState],
  );

  const disconnect = useCallback(() => {
    clearPassword();
    setStatus("off");
    setError(null);
  }, []);

  const syncNow = useCallback(async () => {
    if (!isConfigured()) return;
    setStatus("syncing");
    try {
      await push(stateRef.current);
      setStatus("synced");
      setError(null);
    } catch (e) {
      setStatus("error");
      setError(e instanceof SyncError ? e.message : "Sync failed.");
    }
  }, []);

  return { status, configured: isConfigured(), error, connect, disconnect, syncNow };
}
