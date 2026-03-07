# Change: Deploy PWA as static export with GitHub Actions CI/CD

## Why
The PWA currently only runs on localhost. To use FloatyNotey across devices (personal Mac, work Mac, iPhone) it needs to be deployed to `notes.tmcvee.com`. The app is fully client-side (no API routes, no SSR) so a static export is the simplest, most reliable deployment strategy.

## What Changes
- Configure Next.js for static export (`output: 'export'`)
- Add a GitHub Actions workflow that builds the PWA and deploys via rsync over SSH on push to `prod`
- Update the Caddyfile on the VPS to serve static files at `notes.tmcvee.com`
- Add required GitHub repository secrets for SSH deployment

## Impact
- New spec: `pwa-deployment` (deployment pipeline and hosting)
- Affected code: `pwa/next.config.ts`, `.github/workflows/deploy.yml`
- Affected infra: Hetzner VPS Caddyfile at `/etc/caddy/Caddyfile`
- No changes to application logic or existing specs
