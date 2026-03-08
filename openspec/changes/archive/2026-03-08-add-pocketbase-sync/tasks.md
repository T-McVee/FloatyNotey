## 1. Setup
- [x] 1.1 Install `pocketbase` JS SDK
- [x] 1.2 Add environment variables (`NEXT_PUBLIC_PB_URL`, auth credentials)
- [x] 1.3 Configure PocketBase `Notes` collection (manual — Content: JSON, IsPinned: Boolean, DeviceOrigin: Plain text, LocalId: Plain text, Modified: Date/time)

## 2. Schema Migration
- [x] 2.1 Add sync fields to `Note` interface (`remoteId`, `syncedAt`, `deleted`)
- [x] 2.2 Add Dexie version 2 migration with index updates and backfill
- [x] 2.3 Update `createNote` to include sync field defaults
- [x] 2.4 Update `migrate.ts` to include sync fields in legacy migration

## 3. Soft Delete
- [x] 3.1 Convert `deleteNote` from hard delete to soft delete (`deleted: true`)
- [x] 3.2 Filter soft-deleted notes from `listNotes` and `searchNotes`

## 4. Sync Service
- [x] 4.1 Create `sync.ts` — PocketBase client setup and auth
- [x] 4.2 Implement `pushNote` — upsert local note to PocketBase (create/update/delete)
- [x] 4.3 Implement `pullFromRemote` — full and incremental pull with LWW merge
- [x] 4.4 Implement SSE subscription for real-time remote changes
- [x] 4.5 Implement offline queue and reconnect flush
- [x] 4.6 Add 2s debounce on `pushNote` to batch rapid edits
- [x] 4.7 Export `initSync` entry point

## 5. Integration
- [x] 5.1 Instrument `createNote`, `updateNote`, `deleteNote` to call `pushNote`
- [x] 5.2 Wire `initSync()` into editor.tsx initialization useEffect

## 6. Testing
- [x] 6.1 Unit tests for push, pull, LWW conflict resolution, offline queue
- [x] 6.2 Verify soft-delete filtering in listNotes/searchNotes
- [x] 6.3 End-to-end manual test: create/edit/delete note, verify PocketBase sync
