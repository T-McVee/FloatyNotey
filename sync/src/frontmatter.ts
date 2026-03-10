export interface NoteMetadata {
  id: string;
  title: string;
  created: string; // ISO 8601
  modified: string; // ISO 8601
  pinned: boolean;
}

export function generateFrontmatter(
  meta: NoteMetadata,
  linksTo: string[],
): string {
  const lines = [
    "---",
    `id: ${meta.id}`,
    `title: ${yamlString(meta.title)}`,
    `created: ${meta.created}`,
    `modified: ${meta.modified}`,
    `pinned: ${meta.pinned}`,
  ];

  if (linksTo.length > 0) {
    lines.push("links_to:");
    for (const id of linksTo) {
      lines.push(`  - ${id}`);
    }
  }

  lines.push("---");
  return lines.join("\n");
}

/** Wrap in quotes if the string contains YAML-special characters. */
function yamlString(s: string): string {
  if (/[:#\[\]{}&*!|>'"%@`,?]/.test(s) || s.trim() !== s || s === "") {
    return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return s;
}
