# Developer tests and lockout harness

This file documents the small test scripts included in the repo for local development.

Scripts available

- `scripts/test-lockout.js` — Non-destructive integration test that requires a running dev server (`npm run dev`). It registers a user and simulates failed logins, then attempts a successful login and queries the local DB to inspect values. Does not mutate the DB.

- `scripts/test-lockout-dev.js` — Dev-only deterministic test. This script will mutate the local DB to clear `locked_until` after the failed attempts so a successful login can proceed deterministically. Only run this locally; do not use in CI.

- `scripts/integration-lockout-harness.js` — A standalone integration harness that creates a temporary SQLite DB, seeds a user, simulates failed logins, and runs the atomic reset+session transaction directly without requiring the server. Useful for CI or local verification.

NPM scripts

- `npm run test:lockout` — runs `scripts/test-lockout.js` (requires server running)
- `npm run test:lockout:dev` — runs `scripts/test-lockout-dev.js` (dev-only)
- `npm run test:integration` — runs the integration harness (no server required)

How to run

1. Start the dev server in one terminal (if using `test:lockout` or `test:lockout:dev`):

```bash
npm run dev
```

2. In another terminal, run the appropriate test script:

```bash
npm run test:lockout
# or
npm run test:lockout:dev
# or
npm run test:integration
```

Notes

- `test-lockout-dev.js` mutates the DB for convenience; it is intended only for local development.
- The integration harness is self-contained and suitable for CI.
