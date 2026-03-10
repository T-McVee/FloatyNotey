import PocketBase from "pocketbase";
import { readdir, writeFile, unlink, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tiptapJsonToMarkdown } from "./convert.js";
import { generateFrontmatter } from "./frontmatter.js";

interface PBNote {
  id: string;
  Content: object;
  Created: string;
  Updated: string;
  Pinned: boolean;
  Deleted: boolean;
  Title: string;
}

export async function syncNotes(
  pbUrl: string,
  pbEmail: string,
  pbPassword: string,
  outputDir: string,
): Promise<void> {
  const pb = new PocketBase(pbUrl);
  await pb.collection("_superusers").authWithPassword(pbEmail, pbPassword);

  // Fetch all non-deleted notes
  const records = await pb
    .collection("Notes")
    .getFullList<PBNote>({ filter: "Deleted = false" });

  // Ensure output directory exists
  await mkdir(outputDir, { recursive: true });

  const expectedFiles = new Set<string>();

  for (const record of records) {
    const { markdown, linksTo } = tiptapJsonToMarkdown(record.Content);
    const title = extractTitle(record.Content) || "Untitled";

    const frontmatter = generateFrontmatter(
      {
        id: record.id,
        title,
        created: record.Created,
        modified: record.Updated,
        pinned: record.Pinned,
      },
      linksTo,
    );

    const filename = `${record.id}.md`;
    expectedFiles.add(filename);
    await writeFile(join(outputDir, filename), `${frontmatter}\n\n${markdown}`);
  }

  // Delete orphaned .md files
  const existing = await readdir(outputDir);
  for (const file of existing) {
    if (file.endsWith(".md") && !expectedFiles.has(file)) {
      await unlink(join(outputDir, file));
    }
  }
}

function extractTitle(content: object): string {
  const doc = content as {
    content?: Array<{ content?: Array<{ text?: string }> }>;
  };
  const firstBlock = doc.content?.[0];
  return (
    firstBlock?.content?.map((n) => n.text ?? "").join("") ?? ""
  ).trim();
}

// CLI entry point
if (process.argv[1]?.endsWith("sync.js") || process.argv[1]?.endsWith("sync.ts")) {
  const pbUrl = process.env.PB_URL;
  const pbEmail = process.env.PB_EMAIL;
  const pbPassword = process.env.PB_PASSWORD;
  const outputDir = process.env.OUTPUT_DIR;

  if (!pbUrl || !pbEmail || !pbPassword || !outputDir) {
    console.error(
      "Required env vars: PB_URL, PB_EMAIL, PB_PASSWORD, OUTPUT_DIR",
    );
    process.exit(1);
  }

  syncNotes(pbUrl, pbEmail, pbPassword, outputDir)
    .then(() => console.log(`Synced to ${outputDir}`))
    .catch((err) => {
      console.error("Sync failed:", err);
      process.exit(1);
    });
}
