# pocketbase-sync Specification

## Purpose
TBD - created by archiving change add-pocketbase-sync. Update Purpose after archive.
## Requirements
### Requirement: Sync Service Initialization
The system SHALL initialize a background sync service on app boot that authenticates with PocketBase, performs an initial pull, flushes any pending local changes, and subscribes to real-time remote events. Sync MUST NOT block the editor from loading — it runs in the background.

#### Scenario: First boot with no local data
- **WHEN** the app starts with an empty IndexedDB and no `last_sync` timestamp
- **THEN** the sync service authenticates with PocketBase
- **AND** performs a full pull of all remote notes into Dexie
- **AND** sets the `last_sync` timestamp

#### Scenario: Normal boot with existing data
- **WHEN** the app starts with existing local notes and a `last_sync` timestamp
- **THEN** the sync service performs an incremental pull (only records modified since `last_sync`)
- **AND** pushes any local notes where `syncedAt` is null or older than `modified`

#### Scenario: Boot after IndexedDB eviction
- **WHEN** the app starts with an evicted IndexedDB (empty) and no `last_sync` timestamp
- **THEN** the sync service performs a full pull from PocketBase, restoring all notes

### Requirement: Push Local Changes
The system SHALL push local note changes to PocketBase after each create, update, or delete operation. Pushes MUST be debounced (2 seconds per note) to batch rapid edits. When offline, changes MUST be queued and flushed on reconnect.

#### Scenario: Create a new note while online
- **WHEN** a new note is created locally
- **THEN** the note is pushed to PocketBase as a new record after the debounce period
- **AND** the PocketBase record ID is stored as `remoteId` on the local note

#### Scenario: Update a note while online
- **WHEN** a note is updated locally
- **THEN** the updated content is pushed to the existing PocketBase record after the debounce period
- **AND** `syncedAt` is updated locally

#### Scenario: Delete a note while online
- **WHEN** a note is deleted locally
- **THEN** the note is soft-deleted locally (`deleted: true`)
- **AND** a DELETE request is sent to PocketBase
- **AND** the local record is hard-deleted after remote confirmation

#### Scenario: Edit while offline
- **WHEN** a note is updated while the device is offline
- **THEN** the change is queued locally
- **AND** pushed to PocketBase when connectivity is restored

### Requirement: Pull Remote Changes
The system SHALL subscribe to PocketBase real-time events (SSE) and apply remote changes to the local Dexie database using last-write-wins conflict resolution based on the `modified` timestamp.

#### Scenario: Remote create event
- **WHEN** a new note is created on another device
- **THEN** the SSE event triggers a local insert in Dexie

#### Scenario: Remote update event with newer timestamp
- **WHEN** a remote update event arrives with a `modified` timestamp newer than the local copy
- **THEN** the local note is updated with the remote content

#### Scenario: Remote update event with older timestamp
- **WHEN** a remote update event arrives with a `modified` timestamp older than the local copy
- **THEN** the local note is NOT overwritten (local version wins)

#### Scenario: Remote delete event
- **WHEN** a remote delete event arrives for a note that exists locally
- **THEN** the local note is hard-deleted from Dexie

### Requirement: Soft Delete for Sync
The system SHALL use soft deletes (setting `deleted: true` on the local record) instead of hard deletes, so that deletions can propagate to PocketBase. Soft-deleted notes MUST NOT appear in `listNotes` or `searchNotes` results.

#### Scenario: Note deleted while online
- **WHEN** a user deletes a note
- **THEN** the note is marked `deleted: true` locally
- **AND** the deletion propagates to PocketBase
- **AND** the note is hard-deleted locally after remote confirmation

#### Scenario: Note deleted while offline
- **WHEN** a user deletes a note while offline
- **THEN** the note is marked `deleted: true` locally
- **AND** filtered from all list/search results
- **AND** the deletion is queued for PocketBase sync on reconnect

### Requirement: Offline Resilience
The system SHALL continue to function fully offline. All note operations (create, read, update, delete) MUST work without network connectivity. The sync service MUST gracefully degrade when offline and automatically resume when connectivity returns.

#### Scenario: App used entirely offline
- **WHEN** the device has no network connectivity
- **THEN** all note CRUD operations work against local Dexie storage
- **AND** changes accumulate in the offline queue

#### Scenario: Connectivity restored
- **WHEN** the device regains network connectivity
- **THEN** the sync service re-authenticates if needed
- **AND** pulls any remote changes since last sync
- **AND** flushes the offline queue
- **AND** re-subscribes to SSE events

### Requirement: Dexie Schema Migration
The system SHALL migrate the Dexie database from version 1 to version 2, adding sync metadata fields (`remoteId`, `syncedAt`, `deleted`) to the `Note` interface and backfilling existing records with default values.

#### Scenario: Existing user upgrades
- **WHEN** a user with existing notes loads the updated app
- **THEN** Dexie automatically runs the version 2 migration
- **AND** all existing notes receive `remoteId: null`, `syncedAt: null`, `deleted: false`
- **AND** existing notes are preserved without data loss

