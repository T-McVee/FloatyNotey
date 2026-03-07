# Infrastructure Setup Progress

## Hetzner VPS

- **Provider:** Hetzner Cloud
- **IP:** 89.167.17.215
- **OS:** Ubuntu 24.04 LTS (x64)
- **Security:**
  - SSH key auth (password login disabled)
  - Firewall: ports 22 (SSH), 80, 443 (HTTP/HTTPS) only
  - `unattended-upgrades` enabled for automatic security updates

## DNS (Netlify)

- `notes.tmcvee.com` → A record → 89.167.17.215 (PWA)
- `api.tmcvee.com` → A record → 89.167.17.215 (PocketBase)

## Installed & Running

### Caddy (reverse proxy + auto SSL)
- Installed via apt, running as systemd service
- Caddyfile at `/etc/caddy/Caddyfile`
- Routes `api.tmcvee.com` → `localhost:8090` (PocketBase)
- Routes `notes.tmcvee.com` → placeholder (PWA not yet deployed)
- SSL certificates auto-managed via Let's Encrypt

### PocketBase v0.36.4
- Installed at `/opt/pocketbase/` (linux amd64)
- Running as systemd service (`pocketbase.service`)
- Accessible at `https://api.tmcvee.com`
- Dashboard at `https://api.tmcvee.com/_/`
- Superuser account created

### Notes Collection
- Collection name: `Notes`
- Fields: `Content` (JSON), `IsPinned` (Boolean), `DeviceOrigin` (Plain text)
- Auto fields: `id`, `created`, `updated`

## Remaining Steps

1. **Deploy PWA** — build Next.js app and serve via Caddy at `notes.tmcvee.com`
2. **Build sync layer** — Dexie ↔ PocketBase background sync in the PWA
3. **Backups** — cron job to back up PocketBase SQLite file (e.g., to Hetzner Storage Box or local rsync)
