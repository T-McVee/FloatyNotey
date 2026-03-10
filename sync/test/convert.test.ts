import { describe, it, expect } from "vitest";
import { tiptapJsonToMarkdown } from "../src/convert.js";
import { generateFrontmatter } from "../src/frontmatter.js";

describe("tiptapJsonToMarkdown", () => {
  it("converts an empty doc", () => {
    const result = tiptapJsonToMarkdown({ type: "doc", content: [] });
    expect(result.markdown).toBe("\n");
    expect(result.linksTo).toEqual([]);
  });

  it("converts a paragraph with plain text", () => {
    const result = tiptapJsonToMarkdown({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Hello world" }],
        },
      ],
    });
    expect(result.markdown).toBe("Hello world\n");
  });

  it("converts headings", () => {
    const result = tiptapJsonToMarkdown({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Title" }],
        },
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Subtitle" }],
        },
      ],
    });
    expect(result.markdown).toBe("# Title\n\n### Subtitle\n");
  });

  it("converts bold, italic, strike, and code marks", () => {
    const result = tiptapJsonToMarkdown({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "bold", marks: [{ type: "bold" }] },
            { type: "text", text: " " },
            { type: "text", text: "italic", marks: [{ type: "italic" }] },
            { type: "text", text: " " },
            { type: "text", text: "strike", marks: [{ type: "strike" }] },
            { type: "text", text: " " },
            { type: "text", text: "code", marks: [{ type: "code" }] },
          ],
        },
      ],
    });
    expect(result.markdown).toBe("**bold** *italic* ~~strike~~ `code`\n");
  });

  it("converts bullet list", () => {
    const result = tiptapJsonToMarkdown({
      type: "doc",
      content: [
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "First" }],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Second" }],
                },
              ],
            },
          ],
        },
      ],
    });
    expect(result.markdown).toBe("- First\n- Second\n");
  });

  it("converts ordered list", () => {
    const result = tiptapJsonToMarkdown({
      type: "doc",
      content: [
        {
          type: "orderedList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "First" }],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Second" }],
                },
              ],
            },
          ],
        },
      ],
    });
    expect(result.markdown).toBe("1. First\n2. Second\n");
  });

  it("converts task list", () => {
    const result = tiptapJsonToMarkdown({
      type: "doc",
      content: [
        {
          type: "taskList",
          content: [
            {
              type: "taskItem",
              attrs: { checked: true },
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Done" }],
                },
              ],
            },
            {
              type: "taskItem",
              attrs: { checked: false },
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Todo" }],
                },
              ],
            },
          ],
        },
      ],
    });
    expect(result.markdown).toBe("- [x] Done\n- [ ] Todo\n");
  });

  it("converts code block", () => {
    const result = tiptapJsonToMarkdown({
      type: "doc",
      content: [
        {
          type: "codeBlock",
          attrs: { language: "ts" },
          content: [{ type: "text", text: "const x = 1;" }],
        },
      ],
    });
    expect(result.markdown).toBe("```ts\nconst x = 1;\n```\n");
  });

  it("converts blockquote", () => {
    const result = tiptapJsonToMarkdown({
      type: "doc",
      content: [
        {
          type: "blockquote",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "A quote" }],
            },
          ],
        },
      ],
    });
    expect(result.markdown).toBe("> A quote\n");
  });

  it("converts hard break", () => {
    const result = tiptapJsonToMarkdown({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Line 1" },
            { type: "hardBreak" },
            { type: "text", text: "Line 2" },
          ],
        },
      ],
    });
    expect(result.markdown).toBe("Line 1  \nLine 2\n");
  });

  it("converts external link", () => {
    const result = tiptapJsonToMarkdown({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Google",
              marks: [
                { type: "link", attrs: { href: "https://google.com" } },
              ],
            },
          ],
        },
      ],
    });
    expect(result.markdown).toBe("[Google](https://google.com)\n");
    expect(result.linksTo).toEqual([]);
  });

  it("converts internal note link with remote ID and collects linksTo", () => {
    const result = tiptapJsonToMarkdown({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "My Note",
              marks: [
                {
                  type: "link",
                  attrs: {
                    href: "http://localhost:3000/#note/r:abc123def456",
                  },
                },
              ],
            },
          ],
        },
      ],
    });
    expect(result.markdown).toBe("[My Note](./abc123def456.md)\n");
    expect(result.linksTo).toEqual(["abc123def456"]);
  });

  it("resolves internal links from any origin", () => {
    const result = tiptapJsonToMarkdown({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Link",
              marks: [
                {
                  type: "link",
                  attrs: {
                    href: "https://notes.tmcvee.com/#note/r:xyz789",
                  },
                },
              ],
            },
          ],
        },
      ],
    });
    expect(result.markdown).toBe("[Link](./xyz789.md)\n");
    expect(result.linksTo).toEqual(["xyz789"]);
  });

  it("deduplicates linksTo", () => {
    const result = tiptapJsonToMarkdown({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "First",
              marks: [
                {
                  type: "link",
                  attrs: { href: "http://x/#note/r:abc123" },
                },
              ],
            },
            { type: "text", text: " " },
            {
              type: "text",
              text: "Second",
              marks: [
                {
                  type: "link",
                  attrs: { href: "http://x/#note/r:abc123" },
                },
              ],
            },
          ],
        },
      ],
    });
    expect(result.linksTo).toEqual(["abc123"]);
  });

  it("handles local ID links as regular links (not internal)", () => {
    const result = tiptapJsonToMarkdown({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Old Link",
              marks: [
                {
                  type: "link",
                  attrs: { href: "http://localhost:3000/#note/42" },
                },
              ],
            },
          ],
        },
      ],
    });
    // Local ID links can't be resolved server-side, kept as-is
    expect(result.markdown).toBe(
      "[Old Link](http://localhost:3000/#note/42)\n",
    );
    expect(result.linksTo).toEqual([]);
  });

  it("handles nested marks (bold inside link)", () => {
    const result = tiptapJsonToMarkdown({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Bold Link",
              marks: [
                { type: "bold" },
                {
                  type: "link",
                  attrs: { href: "https://example.com" },
                },
              ],
            },
          ],
        },
      ],
    });
    expect(result.markdown).toBe("[**Bold Link**](https://example.com)\n");
  });
});

describe("generateFrontmatter", () => {
  it("generates frontmatter with links", () => {
    const result = generateFrontmatter(
      {
        id: "abc123",
        title: "My Note",
        created: "2026-03-08T10:30:00Z",
        modified: "2026-03-08T14:15:00Z",
        pinned: true,
      },
      ["xyz789", "def456"],
    );
    expect(result).toBe(
      `---\nid: abc123\ntitle: My Note\ncreated: 2026-03-08T10:30:00Z\nmodified: 2026-03-08T14:15:00Z\npinned: true\nlinks_to:\n  - xyz789\n  - def456\n---`,
    );
  });

  it("generates frontmatter without links", () => {
    const result = generateFrontmatter(
      {
        id: "abc123",
        title: "Simple Note",
        created: "2026-03-08T10:30:00Z",
        modified: "2026-03-08T14:15:00Z",
        pinned: false,
      },
      [],
    );
    expect(result).not.toContain("links_to");
  });

  it("escapes YAML-special characters in title", () => {
    const result = generateFrontmatter(
      {
        id: "abc123",
        title: "Note: with special #chars",
        created: "2026-03-08T10:30:00Z",
        modified: "2026-03-08T14:15:00Z",
        pinned: false,
      },
      [],
    );
    expect(result).toContain('title: "Note: with special #chars"');
  });
});
