import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../db";
import {
  createNote,
  getNote,
  updateNote,
  deleteNote,
  listNotes,
  searchNotes,
  deriveTitle,
} from "../notes";

function makeDoc(text: string) {
  return {
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  };
}

beforeEach(async () => {
  await db.notes.clear();
});

describe("deriveTitle", () => {
  it("extracts text from first paragraph", () => {
    expect(deriveTitle(makeDoc("Hello world"))).toBe("Hello world");
  });

  it("returns Untitled for empty doc", () => {
    expect(deriveTitle({ type: "doc", content: [{ type: "paragraph" }] })).toBe(
      "Untitled"
    );
  });

  it("returns Untitled for completely empty content", () => {
    expect(deriveTitle({ type: "doc", content: [] })).toBe("Untitled");
  });
});

describe("CRUD operations", () => {
  it("creates a note and retrieves it", async () => {
    const id = await createNote(makeDoc("Test note"));
    const note = await getNote(id);
    expect(note).toBeDefined();
    expect(deriveTitle(note!.content)).toBe("Test note");
    expect(note!.pinned).toBe(false);
    expect(note!.created).toBeInstanceOf(Date);
    expect(note!.modified).toBeInstanceOf(Date);
  });

  it("creates a note with default empty content", async () => {
    const id = await createNote();
    const note = await getNote(id);
    expect(note).toBeDefined();
    expect(deriveTitle(note!.content)).toBe("Untitled");
  });

  it("updates note content and bumps modified", async () => {
    const id = await createNote(makeDoc("Original"));
    const before = await getNote(id);

    // Small delay to ensure timestamp differs
    await new Promise((r) => setTimeout(r, 10));
    await updateNote(id, { content: makeDoc("Updated") });

    const after = await getNote(id);
    expect(deriveTitle(after!.content)).toBe("Updated");
    expect(after!.modified.getTime()).toBeGreaterThan(
      before!.modified.getTime()
    );
  });

  it("updates pinned status", async () => {
    const id = await createNote(makeDoc("Pin me"));
    await updateNote(id, { pinned: true });
    const note = await getNote(id);
    expect(note!.pinned).toBe(true);
  });

  it("deletes a note", async () => {
    const id = await createNote(makeDoc("Delete me"));
    await deleteNote(id);
    const note = await getNote(id);
    expect(note).toBeUndefined();
  });
});

describe("listNotes", () => {
  it("returns notes sorted by pinned first, then modified desc", async () => {
    const id1 = await createNote(makeDoc("First"));
    await new Promise((r) => setTimeout(r, 10));
    const id2 = await createNote(makeDoc("Second"));
    await new Promise((r) => setTimeout(r, 10));
    const id3 = await createNote(makeDoc("Third"));

    // Pin the first note
    await updateNote(id1, { pinned: true });

    const notes = await listNotes();
    expect(notes.length).toBe(3);
    // Pinned note first
    expect(notes[0].id).toBe(id1);
    // Then by modified desc (id3 most recent, id2 next)
    expect(notes[1].id).toBe(id3);
    expect(notes[2].id).toBe(id2);
  });
});

describe("searchNotes", () => {
  it("filters notes by title case-insensitively", async () => {
    await createNote(makeDoc("Shopping list"));
    await createNote(makeDoc("Meeting notes"));
    await createNote(makeDoc("Shopping ideas"));

    const results = await searchNotes("shopping");
    expect(results.length).toBe(2);
    expect(results.every((n) => deriveTitle(n.content).toLowerCase().includes("shopping"))).toBe(true);
  });

  it("returns empty array for no matches", async () => {
    await createNote(makeDoc("Hello"));
    const results = await searchNotes("xyz");
    expect(results.length).toBe(0);
  });
});
