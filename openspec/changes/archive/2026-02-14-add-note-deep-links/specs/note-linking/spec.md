## ADDED Requirements

### Requirement: Deep Link Construction
The system SHALL generate deep links to notes using the hash-based format `{origin}/#note/{id}`.

#### Scenario: Copy deep link from command palette
- **WHEN** the user opens the command palette and selects "Copy Link"
- **THEN** the system copies the current note's deep link URL to the clipboard
- **AND** the command palette closes

### Requirement: Internal Link Navigation
The system SHALL navigate to the target note when the user clicks an internal deep link in the editor.

#### Scenario: Click internal note link
- **WHEN** the user clicks a link with href matching `{origin}/#note/{id}`
- **THEN** the system navigates to that note
- **AND** the previous note is pushed to the history stack

#### Scenario: Click link to deleted note
- **WHEN** the user clicks an internal link to a note that no longer exists
- **THEN** the system remains on the current note (no-op)

### Requirement: External Link Support
The system SHALL open external URLs in a new browser tab when clicked in the editor.

#### Scenario: Click external URL
- **WHEN** the user clicks a link with an external URL (e.g., `https://example.com`)
- **THEN** the system opens the URL in a new tab

### Requirement: Link Creation UI
The system SHALL provide multiple ways to create hyperlinks: pasting a URL over selected text, a toolbar button, and automatic URL detection.

#### Scenario: Paste URL over selected text
- **WHEN** the user selects text and pastes a URL from the clipboard
- **THEN** the selected text becomes a hyperlink with the pasted URL as its href

#### Scenario: Add a link via toolbar button
- **WHEN** the user selects text and clicks the Link toolbar button
- **THEN** the system prompts for a URL
- **AND** wraps the selected text in a hyperlink with the provided URL

#### Scenario: Autolink typed or pasted URLs
- **WHEN** the user types or pastes a bare URL (e.g., `https://example.com`) into the editor
- **THEN** the system automatically converts it to a clickable hyperlink

#### Scenario: Remove an existing link
- **WHEN** the cursor is on linked text and the user clicks the Link toolbar button
- **THEN** the system removes the hyperlink, keeping the text

### Requirement: Hash-Based URL Navigation
The system SHALL navigate to the specified note when the app loads with a `#note/{id}` hash in the URL.

#### Scenario: Open app with deep link URL
- **WHEN** the user navigates to `{origin}/#note/42`
- **THEN** the system loads note 42 in the editor
- **AND** the hash is cleared from the URL bar

#### Scenario: Deep link to non-existent note
- **WHEN** the user navigates to a deep link URL for a note that does not exist
- **THEN** the system falls back to normal initialization (last viewed note or first note)
