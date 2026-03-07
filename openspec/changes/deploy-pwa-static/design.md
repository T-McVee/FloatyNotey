## Context
FloatyNotey's PWA is a fully client-side app (Tiptap editor, Dexie/IndexedDB storage, no API routes or SSR). The Hetzner VPS (89.167.17.215) already runs Caddy with auto-SSL and has `notes.tmcvee.com` DNS pointed at it. PocketBase is already running at `api.tmcvee.com`.

## Goals / Non-Goals
- **Goals**: Automated deployment of the PWA on push to `prod`; zero-downtime static file serving; HTTPS via Caddy auto-SSL
- **Non-Goals**: Docker/containerization; Node.js runtime on server; CDN/edge caching; preview deploys for branches

## Decisions

### Static export over Node process
- **Decision**: Use `output: 'export'` in Next.js config
- **Rationale**: The app has no server-side features. Static files are simpler to serve, need no process management, and Caddy handles them natively
- **Alternatives considered**: Running `next start` behind Caddy reverse proxy — rejected as unnecessary complexity for a client-only app

### rsync over SSH for deployment
- **Decision**: GitHub Actions builds the app, then rsyncs the `out/` directory to the VPS
- **Rationale**: Simple, fast (only transfers changed files), no additional infrastructure needed. SSH key stored as GitHub secret
- **Alternatives considered**: scp (no incremental sync), Docker (overkill), Tailscale (extra infra setup)

### Caddy file_server for static hosting
- **Decision**: Caddy serves the static `out/` directory with `try_files` for SPA fallback
- **Rationale**: Caddy already runs on the VPS, handles SSL automatically, and natively serves static files with excellent performance
- **Deploy path**: `/var/www/floatynotey/` on the VPS

## Risks / Trade-offs
- **SSH key security**: Deploy key has write access to the deploy directory only. Mitigated by using a dedicated deploy user or restricting the key's authorized_keys to specific commands
- **No rollback mechanism**: If a bad build deploys, fix-forward by pushing a new commit to `prod`. Acceptable for a single-user personal tool
- **Branch strategy**: `main` is the development branch; `prod` is the deployment branch. Merging `main` → `prod` triggers a deploy
- **Service worker cache**: Old service worker may serve stale assets. Mitigated by cache-busting in Next.js static export (hashed filenames) and the existing `sw.js` network-first strategy

## Open Questions
- None — all decisions confirmed with user
