## 1. Data Layer
- [x] 1.1 Add Dexie.js and define IndexedDB schema (notes table with id, content, created, modified, pinned)
- [x] 1.2 Create note service module (CRUD operations: create, read, update, delete, list, search-by-title) with title derived from first line of content
- [x] 1.3 Migrate existing localStorage content to first IndexedDB note on initial load

## 2. Command Palette
- [x] 2.1 Build command palette overlay component (⌘K to open, Escape to close)
- [x] 2.2 Implement note search by title with keyboard navigation (arrow keys, Enter to select)
- [x] 2.3 Add persistent "New Note" action in palette that creates and opens a blank note
- [x] 2.4 Add note deletion from palette (with confirmation)

## 3. Editor Integration
- [x] 3.1 Refactor editor component to load/save per-note Tiptap JSON from IndexedDB
- [x] 3.2 Wire command palette to editor — switching notes saves current, loads selected
- [x] 3.3 Auto-update `modified` timestamp on content changes

## 4. Navigation & Pinning
- [x] 4.1 Show note list in command palette sorted by modified (newest first), pinned notes at top
- [x] 4.2 Add pin/unpin toggle for notes from palette
- [x] 4.3 Implement note history navigation (⌘[ back, ⌘] forward) with session-scoped history stack

## 5. Testing & Polish
- [x] 5.1 Add Vitest unit tests for note service CRUD and migration logic
- [x] 5.2 Verify PWA offline support still works with IndexedDB storage
- [x] 5.3 Verify editor works correctly in macOS Swift shell after changes
