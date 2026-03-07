# Project Context

## Purpose

FloatyNotey is a lightweight, always-available note-taking app inspired by Raycast's Floating Notes, with two capabilities Raycast doesn't offer: **open, portable note storage** and **AI-powered knowledge management**.

The core notes experience is a **Progressive Web App** that runs on any device — personal Mac, work Mac, and iPhone — with real-time sync and full offline support. On macOS, a minimal native Swift shell wraps the PWA in a floating `NSPanel` with a global hotkey (`⌥ N`), preserving the instant, always-on-top experience. On iPhone, the PWA is installed directly to the home screen with no App Store involvement.

On the backend, a **NanoClaw AI agent** runs in a Docker container on a Hetzner VPS, with read-only access to the user's notes via PocketBase. It delivers scheduled daily digests, weekly reviews, and stale todo reminders via WhatsApp or Telegram, and responds to ad-hoc conversational queries about the user's notes — functioning as a true second brain.

## Tech Stack

### Frontend (PWA)
- **Next.js** — React framework, SSR/SSG, routing, API routes
- **React** — UI library
- **Tiptap** — rich text / Markdown editor (inline formatting, checklists, code blocks, keyboard shortcuts)
- **Tailwind CSS** — utility-first styling
- **TypeScript** — primary language

### macOS Native Shell
- **Swift** — ~50 lines wrapping the PWA in a floating `WKWebView` + `NSPanel`
- Global hotkey: `⌥ N`
- No Apple Developer Program required (unsigned/local)

### Backend & Sync
- **PocketBase** — self-hosted on Hetzner VPS; SQLite-backed with built-in auth, REST API, and real-time subscriptions (SSE)
- PocketBase hooks or a small API layer to bridge note changes to NanoClaw
- **Fallback**: Supabase (Postgres, mature JS SDK, Edge Functions) if PocketBase's real-time sync or offline-first JS SDK proves insufficient on iOS Safari

### AI Agent
- **NanoClaw** — container-sandboxed AI agent on Hetzner VPS (~$5.50/month)
- Read-only access to notes via exported Markdown files
- Scheduled tasks: daily digest (8pm AEST), weekly review (Monday 9am), stale todo check (Friday 5pm)
- Ad-hoc queries via WhatsApp/Telegram

### Data Format
- **Tiptap JSON** is the source of truth for note content, stored in IndexedDB (via Dexie.js) and synced to PocketBase
- Note titles are derived from the first line of content (no separate title field)
- **Markdown export** is a derived format for portability and AI agent consumption (export mechanism TBD)
- Note metadata: `id`, `created`, `modified`, `pinned`, `device_origin`

### Development Tooling
- **OpenSpec** — spec-driven planning and documentation (proposals, specs, change tracking)
- **Beads** — task tracking and project management

## Project Conventions

### Code Style
- **ESLint + Prettier** for linting and formatting
- Follow Next.js App Router conventions for file and folder naming (`page.tsx`, `layout.tsx`, `route.ts`, etc.)
- TypeScript strict mode
- Prefer `const` over `let`; avoid `var`
- Use descriptive, camelCase variable/function names; PascalCase for components and types
- kebab-case for file names (except Next.js route files)

### Architecture Patterns
- **PWA as the core app** — one codebase serves all devices
- **PocketBase as the sync layer** — self-hosted SQLite with real-time subscriptions; protects against iOS Safari's aggressive 7-day IndexedDB eviction (Supabase as fallback if sync quality is insufficient)
- **Tiny native macOS shell** — Swift app loads PWA in floating `WKWebView` + `NSPanel`
- **NanoClaw on Hetzner VPS** — ephemeral, sandboxed containers with read-only note access
- **PocketBase hooks as the bridge** — NanoClaw can read the SQLite DB directly or consume exported `.md` files
- **Offline-first** — local storage (IndexedDB via Dexie.js) with sync to PocketBase when online

### Testing Strategy
- **Vitest** for unit and integration tests
- Test critical paths: note CRUD, sync logic, editor transformations
- Tests live alongside source files or in a `__tests__` directory

### Git Workflow
- **Feature branches + pull requests** to `main`
- Branch naming: `feat/`, `fix/`, `refactor/`, `chore/` prefixes (kebab-case)
- Conventional commit messages (e.g., `feat: add offline sync`, `fix: resolve editor cursor jump`)
- All PRs require review before merge

## Domain Context

- **Notes** are the core entity — each note is a Tiptap JSON document with associated metadata, exportable to Markdown
- **Sync** must be seamless across personal Mac, work Mac, and iPhone (last-write-wins for single-user simplicity)
- **Floating window** behavior on macOS is a key UX differentiator — always-on-top, instantly toggled with `⌥ N`
- **AI digests** summarize and surface relevant notes proactively; the agent has read-only access and cannot modify notes
- **PWA installation** on iPhone bypasses the App Store entirely — no developer fee, no review process

## Important Constraints

- **No Apple Developer Program** — macOS helper is unsigned/local, iPhone uses PWA
- **No App Store** — distribution is direct (PWA install, local macOS app)
- **Self-hosted PocketBase** — runs on the same Hetzner VPS as NanoClaw; no external service dependency (Supabase is a strong fallback)
- **Hetzner VPS budget** — ~$5.50/month for AI agent hosting
- **Privacy** — notes are personal; AI agent has read-only access in sandboxed containers
- **iOS Safari limitations** — 7-day IndexedDB eviction means server-side sync (PocketBase) is essential, not optional
- **Single user** — this is a personal tool, not a multi-tenant SaaS

## Status

### Built
- **Tiptap editor** — rich text with bold, italic, strikethrough, code, headings, lists, task lists, blockquotes, code blocks, and link support (autolink, paste-to-link, inline link dialog)
- **Note storage** — IndexedDB via Dexie.js; full CRUD (`createNote`, `getNote`, `updateNote`, `deleteNote`, `listNotes`, `searchNotes`); titles derived from first line of content
- **Command palette** — Raycast-style `⌘K` overlay with search, note switching, create, delete (two-step confirmation), pin/unpin, and copy deep link
- **History navigation** — session-scoped back/forward stacks (`⌘[` / `⌘]`)
- **Deep links** — hash-based `#note/{id}`; internal links navigate in-app, external links open in browser
- **macOS Swift shell** — floating `NSPanel` with `WKWebView`, global hotkey `⌥N`, Edit menu for clipboard support, `window.open()` delegation
- **PWA setup** — Next.js + TypeScript, service worker, manifest, Apple Web App metadata for iOS home screen install

### Roadmap
- **PocketBase sync** — background sync layer between Dexie and self-hosted PocketBase; keeps notes consistent across devices; protects against iOS Safari 7-day IndexedDB eviction
- **Markdown export** — derive Markdown from Tiptap JSON for portability and AI agent consumption
- **NanoClaw AI agent** — scheduled digests (daily, weekly, stale todos) and ad-hoc queries via WhatsApp/Telegram; read-only access to notes via PocketBase
- **PWA deployment** — host the PWA for cross-device access (currently dev-only on localhost)

## External Dependencies

- **PocketBase** — self-hosted backend: auth, database (SQLite), real-time sync (pocketbase.io)
- **Supabase** (fallback) — managed Postgres, auth, real-time subscriptions, edge functions (supabase.com)
- **NanoClaw** — AI agent framework for scheduled and ad-hoc note analysis
- **Hetzner VPS** — Docker host for NanoClaw containers
- **WhatsApp / Telegram** — delivery channels for AI digests and query responses
- **Tiptap** — rich text editor framework (tiptap.dev)
