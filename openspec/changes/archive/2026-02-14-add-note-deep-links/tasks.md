## 1. Foundation
- [x] 1.1 Create `pwa/src/lib/deep-link.ts` utility module (buildNoteLink, parseNoteHash, isInternalNoteUrl)
- [x] 1.2 Install `@tiptap/extension-link` and configure in editor (openOnClick: false, autolink: true, linkOnPaste: true)

## 2. Core Features
- [x] 2.1 Add link click handler in editor (internal links navigate, external links open new tab)
- [x] 2.2 Add hash-based deep link navigation on page load and hashchange listener
- [x] 2.3 Add "Copy Link" action to command palette
- [x] 2.4 Add Link button to toolbar (set/unset link with URL prompt)

## 3. Verification
- [x] 3.1 Manual end-to-end test: copy link, paste into another note, click to navigate
- [x] 3.2 Verify external URL links open in new tab
- [x] 3.3 Verify hash-based URL navigation on page load
