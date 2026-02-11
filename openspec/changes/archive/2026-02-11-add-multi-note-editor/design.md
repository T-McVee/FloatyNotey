## Context

FloatyNotey's PoC validates the editor and native shell. This change introduces multi-note management as the foundation for a real note-taking workflow. PocketBase sync will come in a follow-up proposal — this change is local-only.

## Goals / Non-Goals

- Goals: Multi-note CRUD, fast note switching via command palette, IndexedDB persistence, localStorage migration, history navigation (⌘[/⌘])
- Non-Goals: Server sync, full-text content search, Markdown export, collaborative editing

## Decisions

### Storage: Dexie.js over raw IndexedDB
- Dexie provides a clean Promise-based API, reactive hooks for React, and easy schema migrations
- Alternatives: raw IndexedDB (verbose, error-prone), localForage (less capable querying), sqlite-wasm (overkill for this stage)

### Data format: Tiptap JSON as source of truth
- Store `editor.getJSON()` output directly in IndexedDB
- No Markdown conversion on save — Markdown export is a future concern
- Avoids lossy MD↔JSON round-trips

### Command palette over sidebar
- Matches Raycast Notes UX — compact, keyboard-driven
- Keeps the floating window narrow (400px) without cramming in a sidebar
- ⌘K is the standard shortcut (matches Raycast, VS Code, Linear, etc.)

### Note identity: UUID v4
- Generated client-side via `crypto.randomUUID()`
- Ready for future sync — no server round-trip needed to create a note

### Migration strategy
- On first load, check for existing `floatynotey:content` in localStorage
- If found, create a note titled "Untitled" with that content, then delete the localStorage key
- One-time, idempotent operation

## Risks / Trade-offs

- **IndexedDB storage limits on iOS Safari**: Safari grants ~1GB but can evict after 7 days without user interaction. Acceptable for now — PocketBase sync (next proposal) is the real fix.
- **Dexie adds ~30KB gzipped**: Acceptable for the functionality it provides.

### Title derived from content, not stored separately
- No separate `title` field in the schema — title is extracted from the first line of Tiptap JSON content at read time
- Keeps the data model simple and avoids title/content going out of sync
- Trade-off: slightly more work to extract title for list display, but trivial with a helper function

### History navigation: session-scoped stack
- Maintain an in-memory array of note IDs visited during the session, with a cursor index
- ⌘[ decrements cursor (back), ⌘] increments (forward)
- Switching via command palette pushes onto the stack and truncates any forward history (same as browser behavior)
- Stack is not persisted — resets each session. Keeps it simple and avoids stale references.

## Open Questions

- None — deferred sync and full-text search to future proposals.
