import { NextRequest } from "next/server";
import {
  authenticate,
  GameError,
  hashToken,
  joinRoom,
  newToken,
  playTurn,
  rematch,
  roomView,
} from "@/lib/rooms";
import { loadRoom, saveRoom, limit } from "@/lib/room-store";
import { address, bearer, body, failure, response } from "@/lib/api";
export const runtime = "nodejs";
type Context = { params: Promise<{ code: string }> };
async function codeOf(context: Context) {
  const { code } = await context.params;
  if (!/^[A-Z2-9]{6}$/.test(code))
    throw new GameError("Enter a valid six-character room code.");
  return code;
}
export async function GET(request: NextRequest, context: Context) {
  try {
    const code = await codeOf(context),
      token = bearer(request);
    await limit("read:" + hashToken(token), 90);
    const room = await loadRoom(code);
    return response(roomView(room, authenticate(room, token)));
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request: NextRequest, context: Context) {
  try {
    const code = await codeOf(context),
      data = await body(request);
    await limit("write:" + address(request), 40);
    let room = await loadRoom(code);
    if (data.action === "join") {
      await limit("join:" + address(request), 15);
      const token = newToken(),
        updated = joinRoom(room, data.name, token);
      await saveRoom(updated, room.version);
      return response({ code, token }, 201);
    }
    const token = bearer(request),
      player = authenticate(room, token);
    if (data.action === "rematch") {
      for (let attempt = 0; attempt < 3; attempt++) {
        const updated = rematch(room, authenticate(room, token));
        try {
          await saveRoom(updated, room.version);
          return response(roomView(updated, player));
        } catch (error) {
          if (
            !(error instanceof GameError) ||
            error.status !== 409 ||
            attempt === 2
          )
            throw error;
          room = await loadRoom(code);
        }
      }
    }
    if (data.version !== room.version)
      throw new GameError("Your room changed. Try your move again.", 409);
    const updated =
      data.action === "guess"
        ? playTurn(room, player, data.value)
        : data.action === "rematch"
          ? rematch(room, player)
          : null;
    if (!updated) throw new GameError("Unknown room action.");
    await saveRoom(updated, room.version);
    return response(roomView(updated, player));
  } catch (error) {
    return failure(error);
  }
}
