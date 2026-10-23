# King Guesser

A small number adventure with a warm, quiet interface. Built with Next.js App Router, React, TypeScript and Tailwind CSS 4.

- Ten progressively harder solo levels, range clues, hints, stars and saved browser progress.
- A daily puzzle shared by all players, rotating at midnight UTC.
- Private two-player duels: shared clues, alternating turns, invitation codes, reconnect and mutual rematches.
- Keyboard controls, reduced-motion support, optional synthesized sound and responsive layouts.

The original vanilla HTML/JS/CSS application is preserved on the [`prototype` branch](https://github.com/Kingsley-A1/guess/tree/prototype), at commit `59fc5a021490eba813fac1b8a718fb2eb983fdf9`.

## Develop

Use Node.js 22.9+ (Node 24 is verified) and npm. Use the existing checkout; cloud tasks are isolated and do not need a worktree.

```sh
npm ci
npm run dev
```

Open the development server in your browser. No accounts, environment variables or external services are required for solo play. Local multiplayer uses process memory when Redis is not configured; rooms disappear on server restart and are shared only within that process.

```sh
npm test
npm run typecheck
npx playwright install chromium
npm run test:e2e
npm run build
npm start
```

## Vercel: existing project

Target: **king-tech-foundation / guess**. The repository's `vercel.json` specifies the Next.js framework, `npm ci`, `npm run build`, and `.next` output, replacing the prototype's static-site configuration. Keep the project root at the repository root. The connected `main` branch should trigger deployment on push.

Production multiplayer requires a durable store. In the Vercel project's Storage/Marketplace section, connect **Upstash Redis** and make these variables available to the deployment:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Keep both server-side; do not prefix them with `NEXT_PUBLIC_`, commit their values, or paste them in chat. If the integration uses another prefix, map its values to the names above in Vercel settings. Redeploy after adding them. Without them, the solo app still works, and room endpoints return a clear unavailable response rather than silently using ephemeral memory in production. The managed Redis service may have usage charges; check its plan before provisioning.

After deployment, verify solo play, then create a room and join from a separate browser/device. Confirm alternating turns, a winner and a mutual rematch. Production Redis connectivity and multi-instance behavior require this real deployment check; local memory tests do not establish them.

For CLI management, authenticate with `vercel login`, link the existing project explicitly, and inspect its identity before making changes:

```sh
npx vercel link --scope king-tech-foundation --project guess
npx vercel project inspect --non-interactive
```

Do not create a second project or use a temporary deployment as a substitute. This repository does not contain deployment credentials.

## Architecture and direction

See [the design and architecture notes](docs/direction.md). The new application deliberately starts with a small coherent loop. Public rankings, large lobbies, live chat and paid mechanics are outside this first release.

Offline PWA support is not carried over from the prototype. A one-time worker at the original `/sw.js` URL clears the prototype’s caches, unregisters and refreshes open windows. The new client also unregisters old workers so stale entries cannot keep serving the legacy application.
