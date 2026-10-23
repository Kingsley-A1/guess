# Production domain, PWA and multiplayer

## Domain: guess.bespoketech.com.ng

1. Open the existing **king-tech-foundation / guess** project in Vercel, then **Settings → Domains**. Add `guess.bespoketech.com.ng` to Production.
2. In Cloudflare DNS, create a **CNAME** named `guess`, using the **exact target Vercel displays for this domain**. Remove a conflicting A/AAAA/CNAME for that same name if present; leave unrelated records alone.
3. Start with **DNS only** (grey cloud). Wait for Vercel to show a valid configuration and issue its HTTPS certificate. Do not enable a redirect to the custom domain before it works.
4. Visit `https://guess.bespoketech.com.ng` and check the game, `/manifest.webmanifest` and `/sw.js`. Keep Cloudflare caching rules from overriding `no-store` on `/api/*` and `/sw.js`; do not use “Cache Everything” for the app document. If later enabling Cloudflare proxying, use **Full (strict)** TLS and check Vercel's current domain guidance.

Browser progress, interface choice and installed apps belong to an origin. Progress from `guess-ashy-six.vercel.app` does not automatically move to the custom domain. Install from the final custom domain to avoid two separate installations.

## Install and offline behavior

Open the game online once and allow its offline setup to finish. Settings reports when it is ready. Chrome/Edge offer an install button when supported; otherwise use the browser's Install app menu. On iPhone/iPad, open in Safari, then Share → Add to Home Screen. Installation availability depends on browser support; normal browser play remains available.

Adventure, daily puzzles, all six interfaces and local progress work offline. Daily puzzles use the device's UTC date. Friend duels require Internet and a configured production database. Offline reload starts a fresh round; earned stars and interface choice persist. Clearing site data removes both saved progress and offline files.

The worker is registered only in production, on HTTPS or localhost. `npm run build` generates `public/sw.js` from `pwa/service-worker.js`, with a content version and the exact build's JS/CSS, small theme art, font, manifest and icons. Installation caches the complete shell atomically; API calls, bearer tokens, third-party requests, design galleries and mutations are never cached. Navigation uses that version's shell to avoid mixing incompatible Next.js builds. A new version waits for tabs to close, or the player can choose **Update game** in Settings. It does not force a reload during a turn. One previous cache is retained for older open tabs.

## Connect multiplayer: Upstash Redis

The current server adapter uses **Upstash Redis over HTTPS**, not SQL. There are no tables or migrations. CockroachDB is possible with a new transactional adapter, but its connection URL cannot be used in this release's Redis variables.

1. Open Vercel's existing **guess** project → **Storage / Marketplace** → **Upstash Redis**. Create a Redis database or connect an existing one. Choose a region near the project's Vercel Functions region. Upstash offers a free plan for small usage; check the current limits and pricing shown before selecting a plan. Do not enable a paid plan unless intended.
2. Connect it to this project and include the **Production** environment. Prefer a separate database for Preview/Development so test rooms and rate limits do not share production data.
3. Under **Settings → Environment Variables**, ensure these exact names exist for Production:

   | Variable                   | Value from the Upstash database's REST API section          |
   | -------------------------- | ----------------------------------------------------------- |
   | `UPSTASH_REDIS_REST_URL`   | HTTPS REST endpoint                                         |
   | `UPSTASH_REDIS_REST_TOKEN` | Standard read/write REST token, **not** the read-only token |

   If the integration adds a prefix, map its values to the exact names above. The adapter uses writes and Lua scripts for atomic room updates and rate limits. Both values must remain server-side: no `NEXT_PUBLIC_` prefix, source commits, screenshots or chat messages containing secrets. A SQL URL, Redis TCP URL or `REDIS_URL` alone will not configure this adapter.

4. **Redeploy Production** after connecting the database/adding variables. Environment changes do not repair an already-built deployment. No database secret is needed in the browser or Cloudflare DNS.
5. On the production custom domain, choose **Play with friends**, enter a name, and create a private room. Open its invitation on a second device or an independent browser/private window, enter another name and join. Confirm that only the active player can guess, both see clues, reconnect preserves the room, both see the result, and both requesting a rematch starts another round with the other player first.

Rooms expire after one hour; they are temporary sessions, not permanent accounts or leaderboards. The service polls every two seconds per visible player, so monitor Upstash command usage, Vercel Function invocations and plan limits. Even on a free plan, active duels consume requests. Closing/backgrounding the game reduces polling.

### Troubleshooting

- **“Online rooms are not connected yet” / HTTP 503:** one or both exact production environment variables are missing. Check environment scope, then redeploy.
- **Connection/authentication errors in Vercel Function logs:** confirm the REST endpoint and standard token belong to the same active database; check quota/availability and integration restrictions. Do not log token values.
- **Room expired / HTTP 404:** create another room; the one-hour lifetime does not extend on rematch.
- **Move conflict / HTTP 409:** another action changed the version; refresh the room view and retry your turn.
- **HTTP 429:** pause briefly; the API has short-window rate limits.

Production multiplayer is only verified after the two-device test with the real database. Local development falls back to process memory; that fallback is intentionally forbidden in production.

## Verify changes locally

```sh
npm test
npm run build
npm run typecheck
npm run test:e2e
npm run test:pwa
```

The PWA browser test uses a production server on port 3500, disables network access, reloads the app, checks all interfaces and plays solo/daily. It checks that room requests cannot be served from cache. The regular browser suite tests two-player flow using the local development memory adapter. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` if using a system Chromium installation.
