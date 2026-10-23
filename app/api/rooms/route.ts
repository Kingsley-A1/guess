import { NextRequest } from "next/server";
import { newRoom } from "@/lib/rooms";
import { createRoom, limit } from "@/lib/room-store";
import { address, body, failure, response } from "@/lib/api";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  try {
    await limit("create:" + address(request), 10);
    const data = await body(request);
    for (let attempt = 0; attempt < 3; attempt++) {
      const { room, token } = newRoom(data.name);
      if (await createRoom(room))
        return response({ code: room.code, token }, 201);
    }
    return response({ error: "Could not create a room. Try again." }, 503);
  } catch (error) {
    return failure(error);
  }
}
