## ADDED Requirements

### Requirement: Note Storage
The system SHALL store notes in IndexedDB via Dexie.js. Each note SHALL have the following fields: `id` (UUID v4), `content` (Tiptap JSON object), `created` (ISO 8601 timestamp), `modified` (ISO 8601 timestamp), `pinned` (boolean, default false). The note's title SHALL be derived from the first line of the document content (plaintext extraction). If the first line is empty or the document is empty, the title SHALL default to "Untitled".

#### Scenario: Create a new note
- **WHEN** the user creates a new note
- **THEN** a note is stored in IndexedDB with a generated UUID, empty Tiptap document as content, current timestamp for created and modified, and pinned set to false

#### Scenario: Update a note
- **WHEN** the user edits note content or metadata
- **THEN** the note is updated in IndexedDB and the `modified` timestamp is set to the current time

#### Scenario: Delete a note
- **WHEN** the user deletes a note and confirms the action
- **THEN** the note is permanently removed from IndexedDB

### Requirement: localStorage Migration
The system SHALL migrate existing localStorage content to IndexedDB on first load. If a value exists at the `floatynotey:content` localStorage key, the system SHALL create a note with that content converted to Tiptap JSON, then remove the localStorage key. The note's title will be derived from the first line of the migrated content. This migration SHALL be idempotent.

#### Scenario: Migrate existing single note
- **WHEN** the app loads and `floatynotey:content` exists in localStorage
- **THEN** a new note is created in IndexedDB with the migrated content (title derived from first line), and the localStorage key is deleted

#### Scenario: No migration needed
- **WHEN** the app loads and `floatynotey:content` does not exist in localStorage
- **THEN** no migration occurs

### Requirement: Command Palette
The system SHALL provide a command palette overlay triggered by ⌘K (or Ctrl+K on non-Mac). The palette SHALL display a searchable list of notes filtered by title. The user SHALL navigate the list with arrow keys and select a note with Enter. Pressing Escape SHALL close the palette. The palette SHALL include a persistent "New Note" action that creates and opens a blank note.

#### Scenario: Open and search notes
- **WHEN** the user presses ⌘K and types a query
- **THEN** the palette displays notes whose titles contain the query string (case-insensitive), sorted by pinned status (pinned first) then by modified date (newest first)

#### Scenario: Switch to a note
- **WHEN** the user selects a note from the palette
- **THEN** the current note is saved, the selected note's content is loaded into the editor, and the palette closes

#### Scenario: Create a new note from palette
- **WHEN** the user selects the "New Note" action in the palette
- **THEN** a new blank note is created and loaded into the editor

#### Scenario: Delete a note from palette
- **WHEN** the user triggers the delete action on a note in the palette
- **THEN** a confirmation is shown, and upon confirmation the note is deleted. If the deleted note was active, the most recently modified remaining note is loaded.

### Requirement: Note Title Derivation
The system SHALL derive each note's display title from the plaintext content of the first line of the Tiptap document. Leading heading markers or formatting SHALL be stripped. If the first line is empty or the document is empty, the title SHALL display as "Untitled".

#### Scenario: Title derived from first line
- **WHEN** a note's first line contains "Shopping List"
- **THEN** the note's title is displayed as "Shopping List" in the command palette

#### Scenario: Empty note title
- **WHEN** a note's content is empty or the first line is blank
- **THEN** the note's title is displayed as "Untitled"

### Requirement: Note History Navigation
The system SHALL maintain a navigation history stack of recently opened notes within the current session. The user SHALL navigate backward through history with ⌘[ (Ctrl+[ on non-Mac) and forward with ⌘] (Ctrl+] on non-Mac). Switching notes via the command palette SHALL push the new note onto the history stack.

#### Scenario: Navigate back
- **WHEN** the user presses ⌘[ and there is a previous note in the history
- **THEN** the current note is saved and the previous note in the history is loaded into the editor

#### Scenario: Navigate forward
- **WHEN** the user presses ⌘] and there is a forward note in the history
- **THEN** the current note is saved and the next note in the history is loaded into the editor

#### Scenario: No history available
- **WHEN** the user presses ⌘[ with no previous history (or ⌘] with no forward history)
- **THEN** nothing happens

### Requirement: Note Pinning
The system SHALL allow users to pin and unpin notes. Pinned notes SHALL appear at the top of the note list in the command palette, above unpinned notes. Within each group (pinned/unpinned), notes SHALL be sorted by `modified` date descending.

#### Scenario: Pin a note
- **WHEN** the user pins a note
- **THEN** the note's `pinned` field is set to true and it appears at the top of the command palette list

#### Scenario: Unpin a note
- **WHEN** the user unpins a pinned note
- **THEN** the note's `pinned` field is set to false and it returns to its position in the unpinned group sorted by modified date
