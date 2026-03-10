import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { readdir, readFile, writeFile, mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { syncNotes } from "../src/sync.js";

// Mock PocketBase
vi.mock("pocketbase", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      collection: vi.fn().mockReturnValue({
        authWithPassword: vi.fn().mockResolvedValue({}),
        getFullList: vi.fn(),
      }),
    })),
  };
});

function makePBNote(
  id: string,
  text: string,
  opts: { links?: Array<{ text: string; href: string }>; pinned?: boolean } = {},
) {
  const content: any[] = [];
  const textNodes: any[] = [{ type: "text", text }];

  if (opts.links) {
    for (const link of opts.links) {
      textNodes.push({
        type: "text",
        text: link.text,
        marks: [{ type: "link", attrs: { href: link.href } }],
      });
    }
  }

  content.push({ type: "paragraph", content: textNodes });

  return {
    id,
    Content: { type: "doc", content },
    Created: "2026-03-08T10:00:00Z",
    Updated: "2026-03-08T12:00:00Z",
    Pinned: opts.pinned ?? false,
    Deleted: false,
    Title: text,
  };
}

let outputDir: string;

beforeEach(async () => {
  outputDir = await mkdtemp(join(tmpdir(), "sync-test-"));
});

afterEach(async () => {
  await rm(outputDir, { recursive: true, force: true });
});

async function mockPBRecords(records: any[]) {
  const PocketBase = (await import("pocketbase")).default;
  const mockGetFullList = vi.fn().mockResolvedValue(records);
  (PocketBase as any).mockImplementation(() => ({
    collection: vi.fn().mockReturnValue({
      authWithPassword: vi.fn().mockResolvedValue({}),
      getFullList: mockGetFullList,
    }),
  }));
}

describe("syncNotes", () => {
  it("creates .md files for notes", async () => {
    await mockPBRecords([makePBNote("note1", "Hello World")]);

    await syncNotes("http://pb:8090", "a@b.com", "pass", outputDir);

    const files = await readdir(outputDir);
    expect(files).toEqual(["note1.md"]);

    const content = await readFile(join(outputDir, "note1.md"), "utf-8");
    expect(content).toContain("id: note1");
    expect(content).toContain("title: Hello World");
    expect(content).toContain("Hello World");
  });

  it("creates files with internal link resolution and frontmatter links_to", async () => {
    await mockPBRecords([
      makePBNote("note1", "Main note ", {
        links: [
          { text: "see other", href: "http://x/#note/r:note2" },
        ],
      }),
    ]);

    await syncNotes("http://pb:8090", "a@b.com", "pass", outputDir);

    const content = await readFile(join(outputDir, "note1.md"), "utf-8");
    expect(content).toContain("[see other](./note2.md)");
    expect(content).toContain("links_to:");
    expect(content).toContain("  - note2");
  });

  it("deletes orphaned .md files", async () => {
    // Pre-create an orphaned file
    await writeFile(join(outputDir, "orphan.md"), "old content");

    await mockPBRecords([makePBNote("note1", "Current")]);
    await syncNotes("http://pb:8090", "a@b.com", "pass", outputDir);

    const files = await readdir(outputDir);
    expect(files).toEqual(["note1.md"]);
  });

  it("does not delete non-.md files", async () => {
    await writeFile(join(outputDir, "README.txt"), "keep me");

    await mockPBRecords([]);
    await syncNotes("http://pb:8090", "a@b.com", "pass", outputDir);

    const files = await readdir(outputDir);
    expect(files).toEqual(["README.txt"]);
  });

  it("overwrites existing files on update", async () => {
    await writeFile(join(outputDir, "note1.md"), "old version");

    await mockPBRecords([makePBNote("note1", "Updated Content")]);
    await syncNotes("http://pb:8090", "a@b.com", "pass", outputDir);

    const content = await readFile(join(outputDir, "note1.md"), "utf-8");
    expect(content).toContain("Updated Content");
    expect(content).not.toContain("old version");
  });

  it("handles empty note set (cleans all .md files)", async () => {
    await writeFile(join(outputDir, "old1.md"), "x");
    await writeFile(join(outputDir, "old2.md"), "y");

    await mockPBRecords([]);
    await syncNotes("http://pb:8090", "a@b.com", "pass", outputDir);

    const files = await readdir(outputDir);
    expect(files).toEqual([]);
  });
});
