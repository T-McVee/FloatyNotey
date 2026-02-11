import { db, type Note } from "./db";

/** Extract title from first text node of Tiptap JSON content. */
export function deriveTitle(content: object): string {
  const doc = content as { content?: Array<{ content?: Array<{ text?: string }> }> };
  const firstBlock = doc.content?.[0];
  const text = firstBlock?.content?.map((n) => n.text ?? "").join("") ?? "";
  return text.trim() || "Untitled";
}

export async function createNote(
  content?: object
): Promise<number> {
  const now = new Date();
  return db.notes.add({
    content: content ?? { type: "doc", content: [{ type: "paragraph" }] },
    created: now,
    modified: now,
    pinned: false,
  } as Note);
}

export async function getNote(id: number): Promise<Note | undefined> {
  return db.notes.get(id);
}

export async function updateNote(
  id: number,
  changes: Partial<Pick<Note, "content" | "pinned">>
): Promise<void> {
  await db.notes.update(id, { ...changes, modified: new Date() });
}

export async function deleteNote(id: number): Promise<void> {
  await db.notes.delete(id);
}

/** List all notes sorted by pinned (desc) then modified (desc). */
export async function listNotes(): Promise<Note[]> {
  const all = await db.notes.orderBy("modified").reverse().toArray();
  // Stable sort: pinned first
  return all.sort((a, b) => Number(b.pinned) - Number(a.pinned));
}

/** Search notes whose derived title includes the query (case-insensitive). */
export async function searchNotes(query: string): Promise<Note[]> {
  const q = query.toLowerCase();
  const all = await listNotes();
  return all.filter((n) => deriveTitle(n.content).toLowerCase().includes(q));
}
