const NOTE_HASH_PREFIX = "#note/";
const REMOTE_ID_PREFIX = "r:";

export type NoteRef =
  | { kind: "local"; localId: number }
  | { kind: "remote"; remoteId: string };

export function buildNoteLink(
  localId: number,
  remoteId?: string,
): string {
  const idPart = remoteId
    ? `${REMOTE_ID_PREFIX}${remoteId}`
    : String(localId);
  return `${window.location.origin}/${NOTE_HASH_PREFIX}${idPart}`;
}

export function parseNoteHash(hash: string): NoteRef | null {
  if (!hash.startsWith(NOTE_HASH_PREFIX)) return null;
  const rest = hash.slice(NOTE_HASH_PREFIX.length);

  if (rest.startsWith(REMOTE_ID_PREFIX)) {
    const remoteId = rest.slice(REMOTE_ID_PREFIX.length);
    return remoteId ? { kind: "remote", remoteId } : null;
  }

  const id = parseInt(rest, 10);
  return Number.isFinite(id) && id > 0 ? { kind: "local", localId: id } : null;
}

export function isInternalNoteUrl(url: string): NoteRef | null {
  try {
    const parsed = new URL(url);
    return parseNoteHash(parsed.hash);
  } catch {
    if (url.startsWith(NOTE_HASH_PREFIX)) return parseNoteHash(url);
    return null;
  }
}
