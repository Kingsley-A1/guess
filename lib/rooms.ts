import {
  createHash,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from "node:crypto";
import { guess, makeRound, type Round } from "./game";
export type Player = { name: string; tokenHash: string };
export type Room = {
  code: string;
  version: number;
  players: Player[];
  round: Round;
  turn: number;
  winner: number | null;
  ready: number[];
  match: number;
  expires: number;
};
export class GameError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
export function newToken() {
  return randomBytes(24).toString("hex");
}
export function playerName(value: unknown) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > 20)
    throw new GameError("Choose a name between 1 and 20 characters.");
  return value.trim();
}
export function newRoom(name: unknown) {
  const token = newToken();
  const code = Array.from(
    { length: 6 },
    () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[randomInt(32)],
  ).join("");
  const room: Room = {
    code,
    version: 0,
    players: [{ name: playerName(name), tokenHash: hashToken(token) }],
    round: makeRound(100, 12, randomInt(1, 101)),
    turn: 0,
    winner: null,
    ready: [],
    match: 1,
    expires: Date.now() + 3600000,
  };
  return { room, token };
}
export function authenticate(room: Room, token: string) {
  const hashed = Buffer.from(hashToken(token));
  const index = room.players.findIndex((p) =>
    timingSafeEqual(Buffer.from(p.tokenHash), hashed),
  );
  if (index < 0)
    throw new GameError(
      "Your player session is missing. Rejoin with your room code.",
      401,
    );
  return index;
}
export function joinRoom(room: Room, name: unknown, token: string): Room {
  if (room.players.length >= 2)
    throw new GameError("This room already has two players.", 409);
  return {
    ...room,
    version: room.version + 1,
    players: [
      ...room.players,
      { name: playerName(name), tokenHash: hashToken(token) },
    ],
  };
}
export function playTurn(room: Room, player: number, value: number): Room {
  if (room.players.length !== 2)
    throw new GameError("Waiting for your friend to join.", 409);
  if (room.turn !== player)
    throw new GameError("It is your friend’s turn.", 409);
  let round: Round;
  try {
    round = guess(room.round, value);
  } catch (error) {
    throw new GameError((error as Error).message);
  }
  round.guesses[round.guesses.length - 1].player = player;
  return {
    ...room,
    version: room.version + 1,
    round,
    turn: 1 - player,
    winner: round.status === "won" ? player : null,
  };
}
export function rematch(room: Room, player: number): Room {
  if (room.round.status === "playing")
    throw new GameError("Finish this round first.", 409);
  const ready = Array.from(new Set([...room.ready, player]));
  if (ready.length < 2) return { ...room, ready, version: room.version + 1 };
  return {
    ...room,
    ready: [],
    version: room.version + 1,
    match: room.match + 1,
    round: makeRound(100, 12, randomInt(1, 101)),
    turn: room.match % 2,
    winner: null,
  };
}
export function roomView(room: Room, player: number) {
  const { secret, ...round } = room.round;
  return {
    code: room.code,
    version: room.version,
    players: room.players.map((p) => p.name),
    round: { ...round, ...(round.status !== "playing" ? { secret } : {}) },
    turn: room.turn,
    winner: room.winner,
    ready: room.ready,
    match: room.match,
    expires: room.expires,
    you: player,
  };
}
export type RoomView = ReturnType<typeof roomView>;
