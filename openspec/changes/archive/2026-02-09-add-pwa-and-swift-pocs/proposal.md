# Change: Add PWA and Swift Shell Proof-of-Concepts

## Why
Before investing in full features (sync, AI, etc.), we need to validate two foundational assumptions:
1. A Next.js PWA with Tiptap can deliver a fast, installable note-editing experience with offline support.
2. A minimal Swift app can load that PWA in a floating `NSPanel` with a global hotkey, matching the Raycast Floating Notes UX.

These PoCs de-risk the architecture early and give us concrete artifacts to build on.

## What Changes
- **PoC 1 — PWA**: A minimal Next.js app with a single Tiptap editor, local persistence (localStorage or IndexedDB), PWA manifest + service worker, and installability on desktop and iOS Safari.
- **PoC 2 — Swift Shell**: A ~50-line Swift/AppKit app that loads the PWA URL in a `WKWebView` inside a floating `NSPanel`, toggled with `⌥ N`. No signing required.

Both PoCs are intentionally minimal — no backend, no sync, no auth, no AI. The goal is to prove the core UX loop works on each platform.

## Impact
- Affected specs: `pwa-poc` (new), `swift-shell-poc` (new)
- Affected code: New `pwa/` directory for the Next.js app, new `macos/` directory for the Swift project
- No existing code is modified
