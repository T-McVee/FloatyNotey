## Context
FloatyNotey stores notes in IndexedDB via Dexie.js. iOS Safari evicts IndexedDB after 7 days of inactivity, requiring a server-side backup. PocketBase is self-hosted on a Hetzner VPS at `api.tmcvee.com` and provides REST API + real-time SSE subscriptions.

This is a single-user app — no multi-tenant concerns, no CRDT complexity.

## Goals / Non-Goals
- **Goals**: Reliable background sync, offline resilience, cross-device consistency, IndexedDB eviction recovery
- **Non-Goals**: Multi-user support, real-time collaboration, end-to-end encryption, conflict UI

## Decisions

### Conflict Resolution: Last-Write-Wins
- Compare `modified` timestamps; newer wins
- Single user across ~3 devices makes conflicts rare
- No CRDT overhead

### Change Detection: Instrument CRUD functions
- `createNote`, `updateNote`, `deleteNote` in `notes.ts` call `pushNote` after local write
- Avoids Dexie hooks (fire inside transactions, awkward for async) and polling (wasteful)
- `sync.ts` imports from `db.ts` only; `notes.ts` imports from `sync.ts` — no circular dependency

### Push Debounce: 2 seconds
- Editor autosave fires every 300ms pause — too frequent for network calls
- `pushNote` uses a per-note debounce timer (2s) so rapid edits batch into one push
- Local saves are still instant; sync trails slightly

### Soft Deletes
- `deleteNote` sets `deleted: true` + bumps `modified` instead of removing the row
- `pushNote` sees `deleted === true`, sends DELETE to PocketBase, then hard-deletes locally
- `listNotes`/`searchNotes` filter out `deleted: true` so UI is unaffected
- Prevents deleted notes from being resurrected by a pull

### Auth: PocketBase login flow (no credentials in bundle)
- User authenticates via a login form in the PWA (email + password)
- PB SDK caches the auth token in localStorage; auto-authenticates on subsequent launches
- Token lifetime: 14 days by default (configurable in PB admin); SDK auto-refreshes on API calls
- iOS Keychain + Face ID auto-fills credentials on re-login after token expiry
- No credentials in the JS bundle — only `NEXT_PUBLIC_PB_URL` is needed as an env var
- PocketBase collection rules locked to the single user account
- Sync service checks `pb.authStore.isValid` before syncing; skips sync if not authenticated

### Sync State Storage
- `localStorage["floatynotey:last_sync"]` — ISO timestamp; absence triggers full sync (intentionally outside IndexedDB so eviction resets it)
- `localStorage["floatynotey:device_origin"]` — stable device identifier
- In-memory `Set<number>` for offline push queue (rebuilt from Dexie on init)
- Dexie `Note` fields (`remoteId`, `syncedAt`, `deleted`) for per-note sync state

### Schema Migration
- Dexie version 2 adds indexes on `remoteId` and `deleted`
- Upgrade function backfills existing notes with `remoteId: null`, `syncedAt: null`, `deleted: false`
- Version 1 block remains untouched (required by Dexie)

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| iOS Safari evicts IndexedDB + localStorage together | Full sync triggered by missing `last_sync` key; PocketBase is the durable store |
| PocketBase SSE drops silently | `online`/`offline` events re-subscribe; PocketBase SDK handles SSE reconnection internally |
| 300ms editor debounce → many pushNote calls | 2s per-note debounce in sync layer batches these |
| Circular import `notes.ts` ↔ `sync.ts` | `sync.ts` only imports from `db.ts`; dependency is one-directional |
| Token + IndexedDB both evicted on iOS | Login form reappears, user re-authenticates, full sync restores notes |

## Prerequisites
- **PocketBase login flow** (`add-auth-gating` proposal) — login form component, auth gate on the editor, Swift shell production URL. Must be in place before sync can authenticate with PocketBase.
