## ADDED Requirements

### Requirement: Floating Panel with WKWebView
The macOS app SHALL display the PWA inside a `WKWebView` embedded in a floating `NSPanel` that stays on top of other windows.

#### Scenario: App launches with floating panel
- **WHEN** the user launches the Swift app
- **THEN** a floating panel appears above other windows containing the PWA editor

### Requirement: Global Hotkey Toggle
The macOS app SHALL register a global hotkey (`⌥ N`) that toggles the floating panel's visibility.

#### Scenario: Toggle panel with hotkey
- **WHEN** the user presses `⌥ N` while the panel is hidden
- **THEN** the panel appears and is focused
- **WHEN** the user presses `⌥ N` while the panel is visible
- **THEN** the panel is hidden

### Requirement: Editor Compatibility
The Tiptap editor SHALL function correctly inside `WKWebView` — keyboard input, formatting shortcuts, and scrolling must work without issues.

#### Scenario: Edit note inside WKWebView
- **WHEN** the user types and formats text in the editor inside the Swift shell
- **THEN** all Tiptap formatting features work identically to the browser version
