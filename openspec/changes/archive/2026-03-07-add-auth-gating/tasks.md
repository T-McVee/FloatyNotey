## 1. Login Component
- [x] 1.1 Create login form component (email + password fields, submit, error state)
- [x] 1.2 Authenticate with PocketBase SDK (`pb.collection("users").authWithPassword()`)
- [x] 1.3 Store auth token via PB SDK's built-in `authStore` (persists to localStorage)

## 2. Auth Gate
- [x] 2.1 Check PB SDK `authStore.isValid` on app boot
- [x] 2.2 Show login form if no valid token; show editor if authenticated
- [x] 2.3 Handle token expiry — redirect to login form when auth becomes invalid

## 3. Swift Shell Production URL
- [x] 3.1 Update the URL from `http://localhost:3000` to `https://notes.tmcvee.com`

## 4. Verification
- [x] 4.1 Verify browser: login form appears on first visit, editor loads after login, refresh preserves session
- [x] 4.2 Verify iPhone: login with Keychain/Face ID auto-fill, installed PWA preserves session
- [x] 4.3 Verify Swift shell: loads production URL, login form works in WKWebView
- [x] 4.4 Verify token expiry: login form reappears after token invalidation
