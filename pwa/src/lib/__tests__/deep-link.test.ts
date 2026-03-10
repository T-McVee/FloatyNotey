import { describe, it, expect, beforeAll } from "vitest";
import { parseNoteHash, isInternalNoteUrl, buildNoteLink } from "../deep-link";

// Provide minimal window.location for buildNoteLink
beforeAll(() => {
  if (typeof globalThis.window === "undefined") {
    (globalThis as any).window = {
      location: { origin: "http://localhost:3000" },
    };
  }
});

describe("parseNoteHash", () => {
  it("parses local ID format", () => {
    expect(parseNoteHash("#note/42")).toEqual({ kind: "local", localId: 42 });
  });

  it("parses remote ID format", () => {
    expect(parseNoteHash("#note/r:abc123")).toEqual({
      kind: "remote",
      remoteId: "abc123",
    });
  });

  it("returns null for empty remote ID", () => {
    expect(parseNoteHash("#note/r:")).toBeNull();
  });

  it("returns null for invalid local ID", () => {
    expect(parseNoteHash("#note/abc")).toBeNull();
    expect(parseNoteHash("#note/0")).toBeNull();
    expect(parseNoteHash("#note/-1")).toBeNull();
  });

  it("returns null for non-note hash", () => {
    expect(parseNoteHash("#other/42")).toBeNull();
    expect(parseNoteHash("")).toBeNull();
  });
});

describe("isInternalNoteUrl", () => {
  it("parses full URL with local ID", () => {
    expect(
      isInternalNoteUrl("http://localhost:3000/#note/42"),
    ).toEqual({ kind: "local", localId: 42 });
  });

  it("parses full URL with remote ID", () => {
    expect(
      isInternalNoteUrl("https://notes.example.com/#note/r:xyz789"),
    ).toEqual({ kind: "remote", remoteId: "xyz789" });
  });

  it("parses any origin (not restricted to current origin)", () => {
    expect(
      isInternalNoteUrl("https://other-domain.com/#note/r:abc123"),
    ).toEqual({ kind: "remote", remoteId: "abc123" });
  });

  it("parses hash-only input", () => {
    expect(isInternalNoteUrl("#note/r:abc123")).toEqual({
      kind: "remote",
      remoteId: "abc123",
    });
  });

  it("returns null for non-note URL", () => {
    expect(isInternalNoteUrl("https://google.com")).toBeNull();
  });

  it("returns null for invalid input", () => {
    expect(isInternalNoteUrl("not a url")).toBeNull();
  });
});

describe("buildNoteLink", () => {
  it("builds link with remote ID when provided", () => {
    const link = buildNoteLink(42, "abc123");
    expect(link).toBe("http://localhost:3000/#note/r:abc123");
  });

  it("falls back to local ID when no remote ID", () => {
    const link = buildNoteLink(42);
    expect(link).toBe("http://localhost:3000/#note/42");
  });

  it("falls back to local ID when remote ID is undefined", () => {
    const link = buildNoteLink(42, undefined);
    expect(link).toBe("http://localhost:3000/#note/42");
  });
});
