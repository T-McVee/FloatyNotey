## ADDED Requirements

### Requirement: PocketBase Login Flow
The system SHALL present a login form when no valid PocketBase auth token exists. The user MUST authenticate with email and password. The PB SDK SHALL persist the auth token in localStorage. Subsequent app launches MUST auto-authenticate using the cached token without prompting.

#### Scenario: First launch with no token
- **WHEN** the app loads with no cached PocketBase auth token
- **THEN** a login form is displayed with email and password fields
- **AND** the editor is not accessible

#### Scenario: Successful login
- **WHEN** the user submits valid PocketBase credentials
- **THEN** the PB SDK authenticates and caches the token in localStorage
- **AND** the login form is replaced by the editor

#### Scenario: Invalid credentials
- **WHEN** the user submits invalid credentials
- **THEN** an error message is displayed
- **AND** the login form remains visible

#### Scenario: Subsequent launch with valid token
- **WHEN** the app loads with a valid cached auth token
- **THEN** the editor loads immediately without showing the login form

#### Scenario: Token expiry
- **WHEN** the cached auth token has expired
- **THEN** the login form is displayed
- **AND** after re-authentication, the editor loads and sync resumes

### Requirement: Swift Shell Production URL
The Swift shell SHALL load `https://notes.tmcvee.com` instead of `http://localhost:3000`, so the macOS app uses the deployed PWA.

#### Scenario: Swift shell launches
- **WHEN** the FloatyNotey macOS app launches
- **THEN** the WKWebView loads `https://notes.tmcvee.com`
