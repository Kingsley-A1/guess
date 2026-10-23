import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { body } from "../lib/api";
test("same-host browser POST works even when the internal Next URL uses a different hostname", async () => {
  const request = new NextRequest("http://0.0.0.0:3000/api/rooms", {
    method: "POST",
    headers: { origin: "http://localhost:3000", host: "localhost:3000" },
    body: '{"name":"Ada"}',
  });
  assert.deepEqual(await body(request), { name: "Ada" });
});
test("cross-origin writes and non-object payloads are rejected", async () => {
  const badOrigin = new NextRequest("http://localhost:3000/api/rooms", {
    method: "POST",
    headers: { origin: "https://other.example", host: "localhost:3000" },
    body: "{}",
  });
  await assert.rejects(body(badOrigin), /origin does not match/);
  for (const payload of ["null", "[]", "42", "not json"]) {
    await assert.rejects(
      body(
        new NextRequest("http://localhost/api/rooms", {
          method: "POST",
          body: payload,
        }),
      ),
      /Invalid request/,
    );
  }
});
