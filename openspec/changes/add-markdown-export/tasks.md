## 1. Deep Link Remote ID Migration
- [x] 1.1 Update `deep-link.ts` — modify `buildNoteLink()` to accept and prefer `remoteId`, update `parseNoteHash()` and `isInternalNoteUrl()` to handle both `#note/r:{remoteId}` and `#note/{localId}` formats
- [x] 1.2 Update editor link creation — when inserting an internal note link (command palette "Copy Link", paste-to-link), use `remoteId` from the Dexie record when available
- [x] 1.3 Update internal link navigation — handle both link formats when resolving clicks on internal note links
- [x] 1.4 Write tests for updated deep link functions — cover remote ID format, local ID fallback, backward compatibility with existing links

## 2. Tiptap JSON → Markdown Converter
- [x] 2.1 Implement `tiptapJsonToMarkdown()` returning `{ markdown, linksTo }` — single-pass recursive walker over Tiptap JSON nodes, handling: doc, paragraph, heading (1-6), text (with bold/italic/strike/code marks), bulletList, orderedList, listItem, taskList, taskItem, codeBlock, blockquote, link (with internal link resolution via `#note/r:` hash matching → relative `./remoteId.md` paths, collecting remote IDs into `linksTo`), hardBreak
- [x] 2.2 Implement `generateFrontmatter()` — accepts note metadata (id, title, created, modified, pinned) and `linksTo: string[]` from the converter result, produces YAML frontmatter string
- [x] 2.3 Write unit tests for converter — cover all node types, nested structures, internal link resolution (verify both `markdown` and `linksTo` outputs), and edge cases (empty doc, text-only doc, untitled note, no internal links)

## 3. Sync Script
- [x] 3.1 Implement sync script — full reconciliation each run: fetch all non-deleted notes from PocketBase API, convert to Markdown with resolved links, write to output directory, delete any `.md` files not in the current note set
- [x] 3.2 Write integration tests for sync script — mock PocketBase responses, verify file creation/update/deletion, orphan cleanup, and link resolution behavior

## 4. Deployment
- [x] 4.1 Set up `sync/` project — `package.json`, `tsconfig.json`, build script
- [ ] 4.2 Deploy sync script to Hetzner VPS — install dependencies, configure cron (every 60s), set output directory and PocketBase URL/credentials via environment variables
- [ ] 4.3 Verify end-to-end — create/edit/delete notes with inter-note links in FloatyNotey, confirm `.md` files appear/update/disappear with correct relative links within 60 seconds
