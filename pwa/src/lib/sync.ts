import pb from "./pb";
import { db, type Note } from "./db";

// --- Types ---

interface PBNote {
  id: string;
  Content: object;
  IsPinned: boolean;
  DeviceOrigin: string;
  LocalId: string;
  Deleted: boolean;
  updated: string; // PocketBase built-in field
}

// --- Debounce map (per-note push timers) ---

const pushTimers = new Map<number, ReturnType<typeof setTimeout>>();
const PUSH_DEBOUNCE_MS = 2000;

// --- Offline queue ---

const offlineQueue = new Set<number>();

function isOnline(): boolean {
  return typeof navigator === "undefined" || navigator.onLine;
}

// --- Push ---

async function doPush(note: Note): Promise<void> {
  const data = {
    Content: note.content,
    IsPinned: note.pinned,
    DeviceOrigin: typeof location !== "undefined" ? location.hostname : "unknown",
    LocalId: String(note.id),
    Deleted: note.deleted,
  };

  try {
    if (note.remoteId) {
      await pb.collection("Notes").update(note.remoteId, data);
    } else {
      const record = await pb.collection("Notes").create(data);
      await db.notes.update(note.id, { remoteId: record.id });
    }
    await db.notes.update(note.id, { syncedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[sync] push failed for note", note.id, err);
  }
}

/** Push a note to PocketBase with 2s debounce. */
export function pushNote(noteId: number): void {
  // Clear existing timer for this note
  const existing = pushTimers.get(noteId);
  if (existing) clearTimeout(existing);

  if (!isOnline()) {
    offlineQueue.add(noteId);
    return;
  }

  pushTimers.set(
    noteId,
    setTimeout(async () => {
      pushTimers.delete(noteId);
      const note = await db.notes.get(noteId);
      if (note) await doPush(note);
    }, PUSH_DEBOUNCE_MS)
  );
}

/** Flush all pending offline pushes. */
async function flushOfflineQueue(): Promise<void> {
  const ids = [...offlineQueue];
  offlineQueue.clear();
  for (const id of ids) {
    const note = await db.notes.get(id);
    if (note) await doPush(note);
  }
}

// --- Pull ---

/** Apply a remote PB record to local Dexie using LWW on updated timestamp. */
async function applyRemote(remote: PBNote): Promise<void> {
  // PocketBase returns dates as "YYYY-MM-DD HH:mm:ss.SSSZ" — normalize to ISO 8601
  const remoteModified = new Date(remote.updated.replace(" ", "T"));

  // Find local note by remoteId, or by LocalId for unsynced local notes only
  let local = await db.notes.where("remoteId").equals(remote.id).first();
  if (!local && remote.LocalId) {
    const candidate = await db.notes.get(Number(remote.LocalId));
    // Only match if this local note hasn't been linked to a different remote record
    if (candidate && !candidate.remoteId) {
      local = candidate;
    }
  }

  if (local) {
    // LWW: only apply if remote is newer
    if (remoteModified > local.modified) {
      await db.notes.update(local.id, {
        content: remote.Content,
        pinned: remote.IsPinned,
        modified: remoteModified,
        deleted: remote.Deleted,
        remoteId: remote.id,
        syncedAt: new Date().toISOString(),
      });
    }
  } else {
    // New note from remote
    await db.notes.add({
      content: remote.Content,
      created: remoteModified,
      modified: remoteModified,
      pinned: remote.IsPinned,
      remoteId: remote.id,
      syncedAt: new Date().toISOString(),
      deleted: remote.Deleted,
    } as Note);
  }
}

/** Full pull from PocketBase — fetches all records and merges. */
async function pullFromRemote(): Promise<void> {
  try {
    const records = await pb.collection("Notes").getFullList<PBNote>();
    for (const record of records) {
      await applyRemote(record);
    }

    // Push any local-only notes (no remoteId) to PocketBase
    const unsynced = await db.notes.filter((n) => !n.remoteId).toArray();
    for (const note of unsynced) {
      await doPush(note);
    }
  } catch (err) {
    console.error("[sync] pull failed", err);
  }
}

// --- SSE real-time subscription ---

let unsubscribeSSE: (() => void) | null = null;

async function startSSE(): Promise<void> {
  unsubscribeSSE?.();
  unsubscribeSSE = await pb.collection("Notes").subscribe("*", (e) => {
    if (e.action === "create" || e.action === "update") {
      applyRemote(e.record as unknown as PBNote);
    }
    // For remote deletes, the record comes with Deleted=true,
    // which applyRemote handles via LWW merge
  });
}

// --- Init ---

/**
 * Initialize sync: pull all remote notes, start SSE, wire offline handlers.
 * Returns a cleanup function.
 */
export async function initSync(): Promise<() => void> {
  // Initial full pull
  await pullFromRemote();

  // Start real-time subscription
  await startSSE();

  // Offline/online handlers
  const onOnline = () => {
    flushOfflineQueue();
    startSSE();
  };
  const onOffline = () => {
    unsubscribeSSE?.();
  };

  window.addEventListener("online", onOnline);
  window.addEventListener("offline", onOffline);

  return () => {
    window.removeEventListener("online", onOnline);
    window.removeEventListener("offline", onOffline);
    unsubscribeSSE?.();
    // Clear all pending push timers
    for (const timer of pushTimers.values()) clearTimeout(timer);
    pushTimers.clear();
  };
}
