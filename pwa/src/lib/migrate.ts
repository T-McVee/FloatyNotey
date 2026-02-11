import { db } from "./db";
import { generateJSON } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CodeBlock from "@tiptap/extension-code-block";

const LEGACY_KEY = "floatynotey:content";
const MIGRATED_KEY = "floatynotey:migrated";

const extensions = [
  StarterKit.configure({ codeBlock: false }),
  CodeBlock,
  TaskList,
  TaskItem.configure({ nested: true }),
];

/** Migrate legacy localStorage HTML content to IndexedDB (runs once). */
export async function migrateIfNeeded(): Promise<void> {
  if (typeof localStorage === "undefined") return;
  if (localStorage.getItem(MIGRATED_KEY)) return;

  const html = localStorage.getItem(LEGACY_KEY);
  if (!html) {
    localStorage.setItem(MIGRATED_KEY, "1");
    return;
  }

  const count = await db.notes.count();
  if (count > 0) {
    // DB already has notes — skip migration
    localStorage.setItem(MIGRATED_KEY, "1");
    return;
  }

  const json = generateJSON(html, extensions);
  const now = new Date();
  await db.notes.add({
    content: json,
    created: now,
    modified: now,
    pinned: false,
  });

  localStorage.setItem(MIGRATED_KEY, "1");
}
