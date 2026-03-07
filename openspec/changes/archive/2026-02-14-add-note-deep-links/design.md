## Context
FloatyNotey is a single-page PWA with no server-side routing. Notes are stored in IndexedDB with auto-increment numeric IDs. The editor uses Tiptap with no existing link extension.

## Goals / Non-Goals
- Goals: Enable note-to-note linking via deep links; support external URL links; provide simple link creation UX
- Non-Goals: Wiki-style `[[]]` syntax; backlink tracking; link graph visualization

## Decisions

### Deep link scheme: hash-based `#note/{id}`
Hash fragments don't trigger server requests, work with any static host or service worker, and require no Next.js routing changes. The full URL format is `{window.location.origin}/#note/{id}`.

Alternatives considered:
- Custom protocol (`floatynotey://note/{id}`) — requires OS-level registration, doesn't work cross-browser
- Path-based (`/note/{id}`) — requires Next.js dynamic routes, breaks single-page architecture

### Link creation flow: paste-over-selection, toolbar button, or autolink
Three ways to create links:
1. **Paste URL over selected text** (primary, Notion/Raycast-style) — select text, paste a URL from clipboard, and the selection becomes a hyperlink. Powered by Tiptap Link's `linkOnPaste: true`.
2. **Toolbar button** — select text, click Link button, enter URL via prompt.
3. **Autolink** — typing or pasting a bare URL auto-converts it to a clickable link via Tiptap Link's `autolink: true`.

### Link click handling: intercept in editorProps
Set `openOnClick: false` on the Tiptap Link extension. Use `editorProps.handleClick` to distinguish internal links (navigate to note) from external links (open in new tab). Use a ref for the navigation callback to avoid stale closures.

### URL input: `window.prompt`
Matches the app's minimal, keyboard-first style. A custom popover can be added later if needed.

## Risks / Trade-offs
- **Stale links**: A deep link to a deleted note will silently do nothing (existing `getNote` returns undefined). Acceptable for v1.
- **Closure staleness**: `editorProps.handleClick` is set at editor creation. Using a ref for the navigation callback mitigates this.
- **No ⌘K shortcut for links**: The common "add link" shortcut conflicts with the command palette. Toolbar button is the primary entry point.
