// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { db } from "../db";
import { migrateIfNeeded } from "../migrate";
import { deriveTitle } from "../notes";

beforeEach(async () => {
  await db.notes.clear();
  localStorage.clear();
});

describe("migrateIfNeeded", () => {
  it("migrates localStorage HTML to IndexedDB note", async () => {
    localStorage.setItem(
      "floatynotey:content",
      "<p>My old note</p>"
    );

    await migrateIfNeeded();

    const notes = await db.notes.toArray();
    expect(notes.length).toBe(1);
    expect(deriveTitle(notes[0].content)).toBe("My old note");
    expect(notes[0].pinned).toBe(false);
    expect(localStorage.getItem("floatynotey:migrated")).toBe("1");
  });

  it("skips migration if already migrated", async () => {
    localStorage.setItem("floatynotey:migrated", "1");
    localStorage.setItem("floatynotey:content", "<p>Should not migrate</p>");

    await migrateIfNeeded();

    const notes = await db.notes.toArray();
    expect(notes.length).toBe(0);
  });

  it("skips migration if no localStorage content", async () => {
    await migrateIfNeeded();

    const notes = await db.notes.toArray();
    expect(notes.length).toBe(0);
    expect(localStorage.getItem("floatynotey:migrated")).toBe("1");
  });

  it("skips migration if DB already has notes", async () => {
    localStorage.setItem("floatynotey:content", "<p>Old content</p>");

    // Pre-populate DB
    await db.notes.add({
      content: { type: "doc", content: [] },
      created: new Date(),
      modified: new Date(),
      pinned: false,
    });

    await migrateIfNeeded();

    const notes = await db.notes.toArray();
    expect(notes.length).toBe(1);
    // Should be the pre-existing note, not the migrated one
    expect((notes[0].content as any).content).toEqual([]);
  });

  it("is idempotent — running twice does not duplicate", async () => {
    localStorage.setItem("floatynotey:content", "<p>Once only</p>");

    await migrateIfNeeded();
    await migrateIfNeeded();

    const notes = await db.notes.toArray();
    expect(notes.length).toBe(1);
  });
});
