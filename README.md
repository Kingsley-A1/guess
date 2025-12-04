# King Guesser

King Guesser is a progressive difficulty guessing game. This version is designed to be responsive and playable on mobile devices and laptops.

## Features
- 20 levels of increasing difficulty
- Choose your start level
- Enter a player name (saved with leaderboard entries)
- Live stats: total guesses, levels completed, average guesses/level, start-level
- Hint button that costs one guess and narrows the search range
- Scores recorded in `localStorage` and displayed in a leaderboard modal
- Responsive design optimized for mobile and desktop with CSS breakpoints

## How to play
1. Open `index.html` in a web browser (desktop or mobile). You do not need a web server; opening directly in the browser is fine.
2. Enter your name (optional) and pick a starting level using the dropdown.
3. Click `Start Game` and guess numbers until you finish the level.
4. Use the `Hint` button to narrow down the possible range (it costs one guess).
5. Scores for completed levels are saved in `localStorage` and shown in the 'Leaderboard' modal.
	- The leaderboard now shows a sortable table with pagination, highlighting the current player's rows and showing a per-player 'Best per level' summary.
	 - Celebration visuals: the game shows confetti animation on level completion and a larger burst on finishing all levels; disable-able via the 'Confetti' toggle in the header.
	 - Celebration audio: the game plays a short synthesized applause/chord when you win a level, and a larger celebration when you beat all 20 levels. You can disable sounds via the 'Sound' toggle in the header, provide a custom sound URL, or adjust volume using the slider.
		- Note: Some browsers disallow audio playback until a user gesture has occurred (e.g., clicking Start Game). If you don't hear audio at first, try clicking within the game once (Start Game) to enable playback.

## Files
The project includes the following files:
- `index.html` — Main game UI and client JavaScript
- `style.css` — All styles for responsive layout and leaderboard
- `guessing game.js` — Node-based terminal version (kept for compatibility)
- `cloudflare-worker.js` — Optional Cloudflare Worker for a server-backed global leaderboard (R2)
- `wrangler.toml` — Wrangler configuration example for Cloudflare
- `README.md` — This file

## Cloudflare R2-backed Leaderboard (Optional)
The repo includes a Cloudflare Worker for storing global leaderboard scores in R2. To set it up:

1. Create a Cloudflare account (https://dash.cloudflare.com).
2. Create an R2 bucket and note its name.
3. Install Wrangler (https://developers.cloudflare.com/workers/cli-wrangler/install).
4. Set your `wrangler.toml` with the `r2_buckets` section and the bucket name.
5. Deploy the Worker:

```bash
cd "C:\Users\KING MADU\Desktop\New folder"
wrangler publish
```

6. Once deployed, in the client, open the page and paste your Worker URL into the "Server API" field in the header, then click Save. This stores the Worker URL in browser localStorage for convenience.

Note: The Worker uses an R2 bucket binding named `LEADERBOARD_BUCKET` in `wrangler.toml`. For a production system, add CORS and proper authentication to prevent abuse. Consider rate limiting and server-side validation.

Client configuration:
- In the game header, enter your deployed worker URL into the "Server API" field and click Save. E.g., `https://king-guesser.example.workers.dev`.
- When the API URL is set, completed scores are automatically POSTed to the worker; global leaderboard is available through the Leaderboard modal.

Developer notes:
- The Worker is intentionally minimal for demonstration. For production, use signed requests or API keys for authentication, and sanitize inputs server-side before storing.
- R2 lets you store object data; this simple Worker stores a `scores.json` file which contains an array of score entries.
## Reset / Reset scores

## Notes
- Scores are saved locally in your browser's `localStorage`. If you use a different browser or clear your local data, scores will disappear.
- The hint feature consumes a guess. If you have no guesses left it will end the level and restart it.

Enjoy King Guesser!
