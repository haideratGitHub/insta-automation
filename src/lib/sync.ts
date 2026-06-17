import type { AppState } from "../types";

const PW_KEY = "carouselforge:syncpw";
const TS_KEY = "carouselforge:editedAt";

export interface Envelope {
  updatedAt: number;
  state: AppState;
}

// --- password (stored locally, sent with every request) --------------------
export function getPassword(): string | null {
  try {
    return localStorage.getItem(PW_KEY);
  } catch {
    return null;
  }
}
export function setPassword(pw: string): void {
  try {
    localStorage.setItem(PW_KEY, pw);
  } catch {
    /* ignore */
  }
}
export function clearPassword(): void {
  try {
    localStorage.removeItem(PW_KEY);
  } catch {
    /* ignore */
  }
}
export function isConfigured(): boolean {
  return !!getPassword();
}

// --- last-edited timestamp (to resolve which side is newer) ----------------
export function getLocalEditedAt(): number {
  return Number(localStorage.getItem(TS_KEY) || 0);
}
export function setLocalEditedAt(ts: number): void {
  try {
    localStorage.setItem(TS_KEY, String(ts));
  } catch {
    /* ignore */
  }
}

// --- API -------------------------------------------------------------------
async function call(method: string, body?: unknown): Promise<Response> {
  const pw = getPassword() ?? "";
  const res = await fetch("/api/state", {
    method,
    headers: { "content-type": "application/json", "x-sync-key": pw },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) throw new SyncError("unauthorized", "Wrong password.");
  if (!res.ok) {
    throw new SyncError(
      "server",
      "Couldn't reach the sync server — is it deployed with KV configured?",
    );
  }
  return res;
}

export class SyncError extends Error {
  kind: "unauthorized" | "server" | "parse";
  constructor(kind: "unauthorized" | "server" | "parse", message: string) {
    super(message);
    this.kind = kind;
  }
}

/** Read the remote envelope, or null if nothing is stored yet. */
export async function pull(): Promise<Envelope | null> {
  const res = await call("GET");
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new SyncError("parse", "Sync server returned an unexpected response.");
  }
  if (!data || typeof data !== "object" || !("state" in data)) return null;
  return data as Envelope;
}

/** Write the state remotely, stamped with the current time. */
export async function push(state: AppState): Promise<number> {
  const updatedAt = Date.now();
  await call("PUT", { updatedAt, state });
  setLocalEditedAt(updatedAt);
  return updatedAt;
}
