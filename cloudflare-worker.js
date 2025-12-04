// Cloudflare Worker for King Guesser - Leaderboard backed by R2
// Requires Wrangler + R2 binding named `LEADERBOARD_BUCKET` in wrangler.toml

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === 'OPTIONS') return new Response('', { status: 204, headers: defaultHeaders() });

  if (path === '/scores' && request.method === 'GET') {
    const scores = await getScoresFromR2();
    // Allow query string for top/limit
    const limit = parseInt(url.searchParams.get('limit')) || 50;
    // Sort by guesses asc, then time asc, then date desc
    scores.sort((a,b) => (a.guesses - b.guesses) || ((a.timeSpentSeconds || 0) - (b.timeSpentSeconds || 0)) || (new Date(b.date) - new Date(a.date)));
    return new Response(JSON.stringify(scores.slice(0, limit)), { status: 200, headers: defaultHeaders() });
  }

  if (path === '/scores' && request.method === 'POST') {
    try {
      const data = await request.json();
      // Minimal validation
      if (!data.name || !data.levelCompleted || !data.guesses) {
        return new Response(JSON.stringify({ error: 'Invalid score data' }), { status: 400, headers: defaultHeaders() });
      }
      // add server timestamp if not provided
      data.date = data.date || new Date().toISOString();
      const scores = await getScoresFromR2();
      scores.push(data);
      // keep only last 1000 scores
      if (scores.length > 1000) scores.splice(0, scores.length - 1000);
      await putScoresToR2(scores);
      return new Response(JSON.stringify({ ok: true }), { status: 201, headers: defaultHeaders() });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: defaultHeaders() });
    }
  }

  // PUT /scores to overwrite all (admin) - optional
  if (path === '/scores' && request.method === 'PUT') {
    // Very simple admin key protection via ?key=... in URL; in production use proper auth
    const key = url.searchParams.get('key');
    if (!key || key !== LEADERBOARD_RESET_KEY) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: defaultHeaders() });
    }
    try {
      const data = await request.json();
      if (!Array.isArray(data)) return new Response(JSON.stringify({ error: 'Invalid format' }), { status: 400, headers: defaultHeaders() });
      await putScoresToR2(data);
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: defaultHeaders() });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: defaultHeaders() });
    }
  }

  return new Response('Not found', { status: 404, headers: defaultHeaders() });
}

function defaultHeaders() {
  return {
    'Content-Type': 'application/json;charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

async function getScoresFromR2() {
  try {
    const obj = await LEADERBOARD_BUCKET.get('scores.json');
    if (!obj) return [];
    const txt = await obj.text();
    return JSON.parse(txt || '[]');
  } catch (err) {
    return [];
  }
}

async function putScoresToR2(scores) {
  const blob = JSON.stringify(scores);
  await LEADERBOARD_BUCKET.put('scores.json', blob, { httpMetadata: { contentType: 'application/json' } });
}
