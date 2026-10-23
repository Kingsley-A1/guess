import { Redis } from "@upstash/redis";
import type { Room } from "./rooms";
import { GameError } from "./rooms";
const ttl = 3600;
const globalStore = globalThis as typeof globalThis & {
  kingRooms?: Map<string, Room>;
  kingRate?: Map<string, { count: number; expires: number }>;
};
const rooms = (globalStore.kingRooms ??= new Map());
const rates = (globalStore.kingRate ??= new Map());
function redis() {
  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  )
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  if (process.env.NODE_ENV === "production")
    throw new GameError(
      "Online rooms are not connected yet. Solo adventure is ready to play.",
      503,
    );
  return null;
}
const key = (code: string) => `king:room:${code}`;
export async function loadRoom(code: string): Promise<Room> {
  const r = redis();
  const room = r ? await r.get<Room>(key(code)) : rooms.get(code);
  if (!room || room.expires < Date.now()) {
    rooms.delete(code);
    throw new GameError("Room not found or expired. Create a new one.", 404);
  }
  return structuredClone(room);
}
export async function createRoom(room: Room) {
  const r = redis();
  if (r)
    return (await r.set(key(room.code), room, { ex: ttl, nx: true })) === "OK";
  for (const [code, existing] of rooms)
    if (existing.expires < Date.now()) rooms.delete(code);
  if (rooms.has(room.code)) return false;
  rooms.set(room.code, structuredClone(room));
  return true;
}
export async function saveRoom(room: Room, previous: number) {
  const r = redis();
  if (r) {
    const result = await r.eval<unknown[], number>(
      `local raw = redis.call('GET', KEYS[1]); if not raw then return 0 end; local room = cjson.decode(raw); if room.version ~= tonumber(ARGV[1]) then return 0 end; redis.call('SET', KEYS[1], ARGV[2], 'KEEPTTL'); return 1`,
      [key(room.code)],
      [previous, JSON.stringify(room)],
    );
    if (result !== 1)
      throw new GameError("The room changed. Try your move again.", 409);
  } else {
    if (rooms.get(room.code)?.version !== previous)
      throw new GameError("The room changed. Try again.", 409);
    rooms.set(room.code, structuredClone(room));
  }
}
export async function limit(keyName: string, maximum = 30) {
  const r = redis();
  const safeKey = "king:rate:" + keyName;
  if (r) {
    const count = await r.eval<unknown[], number>(
      `local n = redis.call('INCR', KEYS[1]); if n == 1 then redis.call('EXPIRE', KEYS[1], 60) end; return n`,
      [safeKey],
      [],
    );
    if (count > maximum)
      throw new GameError("A little too fast. Try again in a minute.", 429);
  } else {
    for (const [k, v] of rates) if (v.expires < Date.now()) rates.delete(k);
    const entry = rates.get(safeKey) ?? {
      count: 0,
      expires: Date.now() + 60000,
    };
    entry.count++;
    rates.set(safeKey, entry);
    if (entry.count > maximum)
      throw new GameError("A little too fast. Try again in a minute.", 429);
  }
}
