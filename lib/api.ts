import { NextRequest, NextResponse } from "next/server";
import { GameError, hashToken } from "./rooms";
export function response(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
export function failure(error: unknown) {
  if (error instanceof GameError)
    return response({ error: error.message }, error.status);
  console.error(
    "Room request failed:",
    error instanceof Error ? error.name : "Unknown error",
  );
  return response(
    { error: "The room service is unavailable. Please try again shortly." },
    503,
  );
}
export async function body(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin) {
    let originHost: string;
    try {
      originHost = new URL(origin).host;
    } catch {
      throw new GameError("Invalid request origin.", 403);
    }
    if (originHost !== request.headers.get("host"))
      throw new GameError("Request origin does not match.", 403);
  }
  const text = await request.text();
  if (text.length > 2048) throw new GameError("Request is too large.", 413);
  try {
    const data = JSON.parse(text);
    if (!data || typeof data !== "object" || Array.isArray(data))
      throw new Error();
    return data;
  } catch {
    throw new GameError("Invalid request.");
  }
}
export function bearer(request: NextRequest) {
  const value = request.headers.get("authorization");
  if (!value?.startsWith("Bearer ") || value.length > 200)
    throw new GameError("Player session required.", 401);
  return value.slice(7);
}
export function address(request: NextRequest) {
  return hashToken(
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local",
  );
}
