const NOTE_HASH_PREFIX = "#note/";

export function buildNoteLink(noteId: number): string {
  return `${window.location.origin}/${NOTE_HASH_PREFIX}${noteId}`;
}

export function parseNoteHash(hash: string): number | null {
  if (!hash.startsWith(NOTE_HASH_PREFIX)) return null;
  const id = parseInt(hash.slice(NOTE_HASH_PREFIX.length), 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export function isInternalNoteUrl(url: string): number | null {
  try {
    const parsed = new URL(url);
    if (parsed.origin !== window.location.origin) return null;
    return parseNoteHash(parsed.hash);
  } catch {
    if (url.startsWith(NOTE_HASH_PREFIX)) return parseNoteHash(url);
    return null;
  }
}
