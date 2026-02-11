# Change: Add multi-note editor with command palette

## Why

The current PoC stores a single note in localStorage. To be useful as a daily note-taking tool, FloatyNotey needs multi-note management with fast switching — matching the Raycast Floating Notes experience of an always-ready, lightweight editor with multiple notes at your fingertips.

## What Changes

- Replace single-note localStorage persistence with IndexedDB (via Dexie.js) supporting multiple notes
- Each note stores Tiptap JSON as source of truth, plus metadata (id, created, modified, pinned). Title is derived from the first line of note content — no separate title field.
- Add a Raycast-style command palette (⌘K) for searching notes by title, creating new notes, and switching between them
- Pinned notes float to the top of the note list
- History navigation (⌘[ back, ⌘] forward) for quickly moving between recently opened notes
- Migrate existing localStorage content to the first IndexedDB note on upgrade
- Note deletion with confirmation

## Impact

- Affected specs: NEW `multi-note-editor` capability
- Affected code: `pwa/src/components/editor.tsx` (major rewrite), new components for command palette and note list
- Dependencies: adds `dexie` and `dexie-react-hooks` packages
- No breaking changes to the Swift shell — it still loads the same URL
