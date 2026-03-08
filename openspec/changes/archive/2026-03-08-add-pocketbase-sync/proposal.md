# Change: Add Dexie ↔ PocketBase sync layer

## Why
iOS Safari evicts IndexedDB after 7 days of inactivity, which will destroy all notes for iPhone users. A server-side sync layer is essential to protect against data loss and enable cross-device access (personal Mac, work Mac, iPhone).

## What Changes
- Add `pocketbase` JS SDK dependency
- Extend the Dexie `Note` schema with sync metadata fields (`remoteId`, `syncedAt`, `deleted`)
- Create a new `sync.ts` module that handles:
  - Authentication with PocketBase
  - Pushing local changes to PocketBase after each CRUD operation (debounced)
  - Pulling remote changes via SSE real-time subscription
  - Last-write-wins conflict resolution on `modified` timestamp
  - Full sync recovery when IndexedDB is evicted
  - Offline queue that flushes on reconnect
- Convert hard deletes to soft deletes so deletions propagate across devices
- Wire sync initialization into the app boot sequence

## Prerequisites
- **Auth gating** (separate proposal: `add-auth-gating`): PocketBase login flow in the PWA (login form, auth gate on editor) and Swift shell production URL. Must be in place so sync can authenticate with PocketBase.

## Impact
- Affected specs: none existing (new `pocketbase-sync` capability)
- Affected code: `pwa/src/lib/db.ts`, `pwa/src/lib/notes.ts`, `pwa/src/lib/migrate.ts`, `pwa/src/components/editor.tsx`
- New file: `pwa/src/lib/sync.ts`
- New dependency: `pocketbase` npm package
- Requires PocketBase `Notes` collection configured on `api.tmcvee.com`
