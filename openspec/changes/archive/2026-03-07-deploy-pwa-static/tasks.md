## 1. Next.js Static Export Configuration
- [x] 1.1 Add `output: 'export'` to `pwa/next.config.ts`
- [x] 1.2 Verify build succeeds with `npm run build` and produces `pwa/out/` directory
- [x] 1.3 Test static output locally (e.g., `npx serve pwa/out`) to confirm the app works

## 2. VPS Static File Hosting
- [x] 2.1 Create deploy directory `/var/www/floatynotey/` on the VPS
- [x] 2.2 Update Caddyfile to serve `notes.tmcvee.com` from `/var/www/floatynotey/` with `try_files` SPA fallback
- [x] 2.3 Reload Caddy and verify `https://notes.tmcvee.com` responds (even if placeholder)

## 3. SSH Deploy Key Setup
- [x] 3.1 Generate a dedicated SSH deploy key pair
- [x] 3.2 Add public key to VPS `~/.ssh/authorized_keys` (for deploy user)
- [x] 3.3 Add private key as GitHub repository secret (`DEPLOY_SSH_KEY`)
- [x] 3.4 Add VPS host key as GitHub secret (`DEPLOY_HOST_KEY`) to prevent MITM
- [x] 3.5 Add VPS IP and deploy user as GitHub secrets (`DEPLOY_HOST`, `DEPLOY_USER`)

## 4. GitHub Actions Workflow
- [x] 4.1 Create `.github/workflows/deploy.yml` with trigger on push to `prod`
- [x] 4.2 Workflow steps: checkout → setup Node → install deps → build → rsync to VPS
- [x] 4.3 Scope build to `pwa/` directory (working-directory or path filter)
- [x] 4.4 Create `prod` branch from `main`
- [x] 4.5 Test workflow end-to-end by pushing to `prod`

## 5. Verification
- [x] 5.1 Confirm `https://notes.tmcvee.com` loads the PWA
- [x] 5.2 Confirm service worker registers and caches assets
- [x] 5.3 Confirm PWA installable on iOS (Add to Home Screen)
- [x] 5.4 Confirm deep links work (`https://notes.tmcvee.com/#note/{id}`)
