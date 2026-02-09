## ADDED Requirements

### Requirement: PWA Note Editor
The app SHALL provide a single-page rich text editor powered by Tiptap with support for bold, italic, headings, checklists, and code blocks.

#### Scenario: User types and formats a note
- **WHEN** the user opens the PWA
- **THEN** a Tiptap editor is displayed and ready for input
- **AND** the user can apply inline formatting (bold, italic) and block formatting (headings, checklists, code blocks)

### Requirement: Local Persistence
The app SHALL persist the current note content to localStorage so it survives page reloads.

#### Scenario: Note survives reload
- **WHEN** the user types content and reloads the page
- **THEN** the previously entered content is restored in the editor

### Requirement: PWA Installability
The app SHALL include a valid web app manifest and service worker so it can be installed as a standalone app.

#### Scenario: Install on desktop
- **WHEN** the user visits the app in Chrome on desktop
- **THEN** the browser offers a "Install" option and the app runs in its own window after installation

#### Scenario: Install on iOS
- **WHEN** the user visits the app in Safari on iPhone
- **THEN** the user can use "Add to Home Screen" and the app launches in standalone mode without browser chrome
