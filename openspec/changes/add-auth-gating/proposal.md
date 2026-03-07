# Change: Add PocketBase login flow and Swift shell production URL

## Why
The sync layer requires PocketBase authentication to protect sensitive note data. Rather than baking credentials into the JS bundle (exposing them publicly), the PWA presents a login form. The user authenticates once, the PB SDK caches the auth token in localStorage, and subsequent sessions auto-authenticate until the token expires (~14 days). iOS Keychain + Face ID auto-fills credentials on re-login.

## What Changes
- Add a login screen component to the PWA that authenticates with PocketBase
- Gate the editor behind auth state — show login form if no valid token
- No credentials in the JS bundle, no Caddy basic auth, no infrastructure changes
- Update the Swift shell's URL from `localhost:3000` to `notes.tmcvee.com`

## Impact
- Affected specs: none existing (new `auth-gating` capability)
- Affected code: `pwa/src/components/editor.tsx` (auth gate), `macos/Sources/main.swift` (production URL)
- New files: login component
- Blocks: `add-pocketbase-sync` (auth must be in place before sync can authenticate with PocketBase)
