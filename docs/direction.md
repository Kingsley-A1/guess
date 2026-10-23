# A little guess, a proper game

## What the prototype taught us

Keep the fast number-guessing loop, progressive difficulty, hot/cold feedback, hints, local progress and celebratory moments. The interaction is easy to explain and can be played in seconds.

The old `app.js` joined configuration, mutable state, direct DOM updates, storage, sound, animations and network calls in a single 1,874-line file. It defined 50 levels while score validation accepted only levels 1–20 and the README described 20. That made later progress unreliable. `handleWin` did not mark the round inactive, permitting further submissions before continuing. The leaderboard accepted client-reported results and rewrote one R2 object per score; competing writes could lose scores. Missing `icons/` assets broke service-worker precaching, and the viewport disabled user zoom.

This migration replaces that structure. The prototype branch preserves the original behavior for comparison and rollback.

## First release

**Adventure:** ten levels, from 1–10 to 1–1,000. Each has enough guesses for a systematic range-halving strategy. Feedback always includes direction, never color alone. Hints narrow the range and cost a guess. Wins award stars and unlock the next level; attempts never erase a previous best.

**Daily:** a deterministic puzzle derived from the UTC date. Everyone sees the same secret; it is recreational and client-side, with no claims of a cheat-resistant ranking. Replaying is allowed.

**Friendly duel:** two guests join a private room. The server owns a secret in 1–100. Players alternate, share clues and get twelve collective guesses. Whoever finds the number wins; exhausting the budget ends the round without a winner. Both players must request a rematch, and the starting player alternates. Rooms expire after one hour. This is a slower strategic duel, not simultaneous speed guessing; turn-based play avoids rewarding low latency.

**Interface:** Cobalt Play is the default, with a real numeric keypad and clear clues. A quiet native dropdown offers Friendly Focus second, followed by Studio Blue, Golden Companion, Midnight Focus and Evergreen Studio. Each shares the same game state and controls; switching never resets a turn or progress. Light variants use small static character illustrations, and dark variants use optimized raster backgrounds. Modes and level selection are tucked behind compact controls. Encouragement stays beside the clue. No sign-up gate, pop-up onboarding, forced sound or automatic loss restart.

## Boundaries

| Layer                                         | Responsibility                                                                     |
| --------------------------------------------- | ---------------------------------------------------------------------------------- |
| `app/page.tsx`, `app/layout.tsx`              | Server-rendered document, metadata and entry point                                 |
| `components/game-app.tsx`                     | Client session, mode orchestration and solo interaction                            |
| `components/game-board.tsx`                   | Guess input, clues, results and room presentation                                  |
| `components/adventure-map.tsx`                | Level selection, completion and unlock presentation                                |
| `components/game-dialogs.tsx`                 | Native accessible help and settings dialogs                                        |
| `lib/interfaces.ts`, `hooks/use-interface.ts` | Validated interface registry, browser persistence and early theme restoration      |
| `lib/game.ts`                                 | Pure immutable rules: guessing, range narrowing, hints, status and stars           |
| `lib/rooms.ts`                                | Server room transitions, player authentication, sanitized room views and rematches |
| `lib/room-store.ts`                           | Redis durability and optimistic concurrency; memory adapter for local development  |
| `lib/api.ts`, `app/api/rooms/**`              | HTTP validation, rate limits, authentication and no-store responses                |
| `app/globals.css`                             | Tailwind entry, theme tokens, visual components and responsive behavior            |

Room state has a monotonic version. A Redis Lua compare-and-set updates a room only if its previous version still matches; simultaneous joins or stale guesses cannot overwrite each other. Room secrets are never sent to the browser before the round ends. Player capabilities use random 192-bit tokens; only their hashes are stored with the room, and tokens travel in authorization headers. The invite URL contains the room code, not the player token. Rooms are discoverable only through their random code, limited to two players, and API traffic has short-window rate limits. Do not treat this as a fully hardened ranked competition service.

The UI polls active rooms every two seconds and pauses polling in background tabs. That is appropriate for turn-based duels and simple Vercel hosting, but not a real-time action-game transport. A later realtime layer can replace polling without changing the pure rules.

Solo progress uses a new versioned storage key, preserving legacy browser data. It is device-local, not account-synced. Old score data is not imported because the level ranges and scoring differ.

Character illustrations are 35–38 KB WebP files and backgrounds are 10–32 KB. The active interface loads its own art, and the Latin variable font is self-hosted at 31 KB. Interface choice is stored separately under `king:v2:interface`; the pre-paint bootstrap validates it against the registry. No theme can change a room token, guess budget or game rule.

## What would make the next version exceptional

1. **Playtest the loop.** Watch new players reach level three without help. Check whether clues teach the strategy and whether a loss feels fair. Choose changes from observed friction.
2. **Give chapters distinct identities.** Introduce one mechanic at a time: parity clues, limited-information rounds, collaborative puzzles. Each must change the decision, rather than just increase the number range.
3. **Add a shareable daily result.** A spoiler-free trail and streak calendar create a reason to return. Preserve calm play; do not punish missed days.
4. **Make duels feel social.** Add lightweight reactions, a best-of-three scoreline and an optional turn deadline. Start with friends before public matchmaking.
5. **Earn the right to rank.** Server-issued solo challenges, verified results, transactional score storage, abuse controls and observability must precede public rankings. The current daily secret is intentionally readable client-side.
6. **Grow the content system.** Define levels as validated data, add an internal puzzle editor and separate rule variants behind the engine contract.

Before a broader release, verify durable rooms on Vercel across independent devices, review service costs under polling load, add automated browser checks in CI, test with screen-reader users, and check PWA installation on physical Android and iOS devices. Offline shell caching is versioned with the production build; see [deployment notes](deployment.md).
