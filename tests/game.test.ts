import { test } from "node:test";
import assert from "node:assert/strict";
import { LEVELS, guess, hint, makeRound, stars } from "../lib/game";
import {
  authenticate,
  joinRoom,
  newRoom,
  newToken,
  playTurn,
  rematch,
  roomView,
} from "../lib/rooms";
import { createRoom, loadRoom, saveRoom } from "../lib/room-store";
test("all ten levels are solvable within their budget by narrowing the range", () => {
  for (const level of LEVELS)
    for (let secret = 1; secret <= level.max; secret++) {
      let round = makeRound(level.max, level.budget, secret);
      while (round.status === "playing")
        round = guess(round, Math.floor((round.low + round.high) / 2));
      assert.equal(round.status, "won", `${level.name}: ${secret}`);
    }
});
test("invalid guesses preserve state; terminal rounds cannot change", () => {
  const round = makeRound(10, 2, 7);
  for (const value of [0, 11, 1.2, NaN, Infinity])
    assert.throws(() => guess(round, value));
  assert.equal(round.spent, 0);
  const narrowed = guess(round, 5);
  assert.equal(narrowed.low, 6);
  assert.throws(() => guess(narrowed, 5));
  const lost = guess(narrowed, 6);
  assert.equal(lost.status, "lost");
  assert.throws(() => guess(lost, 7));
});
test("hints cost a guess, include the secret, and can exhaust the budget", () => {
  let round = makeRound(100, 2, 76);
  round = hint(round);
  assert.equal(round.low, 51);
  assert.equal(round.spent, 1);
  round = hint(round);
  assert.equal(round.low, 76);
  assert.equal(round.status, "lost");
});
test("stars reward efficient wins and never reward losses", () => {
  assert.equal(stars(guess(makeRound(10, 4, 5), 5)), 3);
  assert.equal(stars(guess(makeRound(10, 1, 5), 1)), 0);
});
test("duels hide the secret, authenticate players and enforce turns", () => {
  const { room, token } = newRoom("Ada");
  const guestToken = newToken();
  const joined = joinRoom(room, "Grace", guestToken);
  assert.equal(authenticate(joined, token), 0);
  assert.equal(authenticate(joined, guestToken), 1);
  assert.throws(() => authenticate(joined, "wrong"));
  assert.throws(() => joinRoom(joined, "Third", newToken()));
  assert.throws(() => playTurn(joined, 1, 50));
  const view = roomView(joined, 0);
  assert.equal("secret" in view.round, false);
  assert.deepEqual(view.players, ["Ada", "Grace"]);
  assert.equal(JSON.stringify(view).includes("tokenHash"), false);
  const secret = joined.round.secret;
  const moved = playTurn(joined, 0, secret === 50 ? 49 : 50);
  assert.equal(moved.turn, 1);
  assert.equal(moved.round.guesses[0].player, 0);
  assert.throws(() => playTurn(moved, 0, secret));
  const won = playTurn(moved, 1, secret);
  assert.equal(won.winner, 1);
  assert.equal(roomView(won, 0).round.secret, secret);
  const ready = rematch(won, 0);
  assert.equal(ready.match, 1);
  const next = rematch(ready, 1);
  assert.equal(next.match, 2);
  assert.equal(next.round.status, "playing");
  assert.equal(next.turn, 1);
});
test("room storage rejects concurrent stale writes", async () => {
  const { room } = newRoom("Host");
  assert.equal(await createRoom(room), true);
  const copy = await loadRoom(room.code);
  const joined = joinRoom(copy, "Guest", newToken());
  await saveRoom(joined, 0);
  await assert.rejects(saveRoom({ ...copy, version: 1 }, 0), /changed/);
  assert.equal((await loadRoom(room.code)).players.length, 2);
});
