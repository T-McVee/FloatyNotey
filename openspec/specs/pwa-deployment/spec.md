# pwa-deployment Specification

## Purpose
TBD - created by archiving change deploy-pwa-static. Update Purpose after archive.
## Requirements
### Requirement: Static Export Build
The PWA MUST be configured for Next.js static export, producing a self-contained directory of HTML, CSS, and JavaScript files with no server-side runtime dependency.

#### Scenario: Successful static build
- **WHEN** `npm run build` is executed in the `pwa/` directory
- **THEN** a static export is produced in `pwa/out/` containing all assets needed to serve the app

#### Scenario: No server-side features
- **WHEN** the static export is served by any HTTP file server
- **THEN** all app features (editor, command palette, note storage, deep links) function without a Node.js runtime

### Requirement: Automated Deployment Pipeline
The project MUST have a GitHub Actions workflow that automatically builds and deploys the PWA to the production server on every push to the `prod` branch.

#### Scenario: Deploy on push to prod
- **WHEN** a commit is pushed to the `prod` branch
- **THEN** GitHub Actions builds the static export and deploys it to the VPS via rsync over SSH

#### Scenario: Build failure prevents deployment
- **WHEN** the Next.js build fails (e.g., TypeScript errors, missing dependencies)
- **THEN** the deployment step is skipped and the existing production files remain unchanged

#### Scenario: Development branch does not trigger deploy
- **WHEN** a commit is pushed to the `main` branch
- **THEN** no deployment is triggered

### Requirement: Static File Hosting
The VPS MUST serve the PWA's static files at `https://notes.tmcvee.com` with automatic HTTPS via Caddy.

#### Scenario: HTTPS access
- **WHEN** a user navigates to `https://notes.tmcvee.com`
- **THEN** the PWA loads with a valid SSL certificate

#### Scenario: SPA client-side routing
- **WHEN** a user navigates directly to a deep link (e.g., `https://notes.tmcvee.com/#note/123`)
- **THEN** the server returns the index page and client-side routing handles the hash fragment

#### Scenario: PWA installability
- **WHEN** a user visits `https://notes.tmcvee.com` on iOS Safari
- **THEN** the site is installable via "Add to Home Screen" with the correct manifest metadata

