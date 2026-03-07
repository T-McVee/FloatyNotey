// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
import { db, type Note } from "../db";

// --- Mock PocketBase ---

const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockGetFullList = vi.fn();
const mockSubscribe = vi.fn();

vi.mock("../pb", () => {
  return {
    default: {
      collection: () => ({
        create: mockCreate,
        update: mockUpdate,
        getFullList: mockGetFullList,
        subscribe: mockSubscribe,
      }),
    },
  };
});

// Import after mock is set up
const { pushNote, initSync } = await import("../sync");

function makeNote(overrides: Partial<Note> = {}): Omit<Note, "id"> {
  return {
    content: { type: "doc", content: [{ type: "paragraph" }] },
    created: new Date("2026-01-01"),
    modified: new Date("2026-01-01"),
    pinned: false,
    remoteId: null,
    syncedAt: null,
    deleted: false,
    ...overrides,
  };
}

beforeEach(async () => {
  await db.notes.clear();
  vi.clearAllMocks();
  mockSubscribe.mockResolvedValue(() => {});
  mockGetFullList.mockResolvedValue([]);
});

describe("pushNote", () => {
  it("creates a remote record for a note without remoteId", async () => {
    const id = await db.notes.add(makeNote() as Note);
    mockCreate.mockResolvedValue({ id: "pb_abc123" });

    pushNote(id);

    // Wait for debounce (2s) + a bit of margin
    await vi.waitFor(
      async () => {
        expect(mockCreate).toHaveBeenCalledTimes(1);
      },
      { timeout: 3000 }
    );

    const call = mockCreate.mock.calls[0][0];
    expect(call.LocalId).toBe(String(id));
    expect(call.Deleted).toBe(false);

    // Should have saved remoteId back to Dexie
    const updated = await db.notes.get(id);
    expect(updated!.remoteId).toBe("pb_abc123");
    expect(updated!.syncedAt).not.toBeNull();
  });

  it("updates an existing remote record when remoteId is set", async () => {
    const id = await db.notes.add(
      makeNote({ remoteId: "pb_existing" }) as Note
    );
    mockUpdate.mockResolvedValue({});

    pushNote(id);

    await vi.waitFor(
      async () => {
        expect(mockUpdate).toHaveBeenCalledTimes(1);
      },
      { timeout: 3000 }
    );

    expect(mockUpdate).toHaveBeenCalledWith("pb_existing", expect.any(Object));
  });

  it("debounces rapid pushes for the same note", async () => {
    const id = await db.notes.add(makeNote() as Note);
    mockCreate.mockResolvedValue({ id: "pb_new" });

    pushNote(id);
    pushNote(id);
    pushNote(id);

    await vi.waitFor(
      async () => {
        expect(mockCreate).toHaveBeenCalledTimes(1);
      },
      { timeout: 3000 }
    );

    // Should only have been called once despite 3 pushNote calls
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });
});

describe("initSync / pullFromRemote", () => {
  it("pulls remote notes and inserts them locally", async () => {
    mockGetFullList.mockResolvedValue([
      {
        id: "pb_remote1",
        Content: { type: "doc", content: [{ type: "paragraph" }] },
        IsPinned: true,
        DeviceOrigin: "other",
        LocalId: "",
        updated: "2026-02-01T00:00:00.000Z",
        Deleted: false,
      },
    ]);

    const cleanup = await initSync();

    const notes = await db.notes.toArray();
    expect(notes.length).toBe(1);
    expect(notes[0].remoteId).toBe("pb_remote1");
    expect(notes[0].pinned).toBe(true);

    cleanup();
  });

  it("LWW: remote newer overwrites local", async () => {
    const id = await db.notes.add(
      makeNote({
        modified: new Date("2026-01-01"),
        remoteId: "pb_conflict",
      }) as Note
    );

    mockGetFullList.mockResolvedValue([
      {
        id: "pb_conflict",
        Content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Remote wins" }],
            },
          ],
        },
        IsPinned: false,
        DeviceOrigin: "other",
        LocalId: String(id),
        updated: "2026-06-01T00:00:00.000Z", // newer
        Deleted: false,
      },
    ]);

    const cleanup = await initSync();

    const note = await db.notes.get(id);
    const text = (note!.content as any).content[0].content[0].text;
    expect(text).toBe("Remote wins");

    cleanup();
  });

  it("LWW: local newer is preserved (not overwritten)", async () => {
    const id = await db.notes.add(
      makeNote({
        modified: new Date("2026-06-01"),
        remoteId: "pb_conflict2",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Local wins" }],
            },
          ],
        },
      }) as Note
    );

    mockGetFullList.mockResolvedValue([
      {
        id: "pb_conflict2",
        Content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Remote loses" }],
            },
          ],
        },
        IsPinned: false,
        DeviceOrigin: "other",
        LocalId: String(id),
        updated: "2026-01-01T00:00:00.000Z", // older
        Deleted: false,
      },
    ]);

    const cleanup = await initSync();

    const note = await db.notes.get(id);
    const text = (note!.content as any).content[0].content[0].text;
    expect(text).toBe("Local wins");

    cleanup();
  });

  it("pushes local-only notes to PocketBase during pull", async () => {
    await db.notes.add(makeNote() as Note);
    mockGetFullList.mockResolvedValue([]);
    mockCreate.mockResolvedValue({ id: "pb_pushed" });

    const cleanup = await initSync();

    expect(mockCreate).toHaveBeenCalledTimes(1);

    cleanup();
  });
});
