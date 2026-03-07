# Change: Add Note Deep Links

## Why
Users want to connect notes by linking to them from other notes, similar to Raycast's deep linking. Currently the editor has no link support at all — no internal note links and no external URL links.

## What Changes
- Add Tiptap Link extension for hyperlink support in the editor
- Add a "Copy Link" action to the command palette that copies a deep link (`#note/{id}`) to the current note
- Users paste the copied link as a hyperlink in another note via a new toolbar link button
- Clicking an internal note link navigates to that note; clicking an external URL opens a new tab
- Support hash-based deep links in the URL bar for direct navigation on page load

## Impact
- Affected specs: `multi-note-editor` (new linking capability added)
- New spec: `note-linking` (deep link construction, navigation, link UI)
- Affected code: `editor.tsx`, `command-palette.tsx`, `toolbar.tsx`, new `deep-link.ts` utility
