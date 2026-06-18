import { test } from "node:test";
import assert from "node:assert";
import { parseBonsaiCommand, resolveSessionMode } from "../index.js";

test("parseBonsaiCommand: empty arg falls back to default (full)", () => {
  assert.deepEqual(parseBonsaiCommand("", "full"), { type: "set-mode", mode: "full" });
});

test("parseBonsaiCommand: empty arg with default off becomes full", () => {
  assert.deepEqual(parseBonsaiCommand("", "off"), { type: "set-mode", mode: "full" });
});

test("parseBonsaiCommand: levels and off", () => {
  assert.deepEqual(parseBonsaiCommand("ultra"), { type: "set-mode", mode: "ultra" });
  assert.deepEqual(parseBonsaiCommand("off"), { type: "set-mode", mode: "off" });
  assert.deepEqual(parseBonsaiCommand("status"), { type: "status" });
});

test("parseBonsaiCommand: junk is invalid", () => {
  assert.equal(parseBonsaiCommand("banana").type, "invalid");
});

test("resolveSessionMode: returns the last bonsai-mode entry", () => {
  const entries = [
    { type: "custom", customType: "bonsai-mode", data: { mode: "lite" } },
    { type: "custom", customType: "bonsai-mode", data: { mode: "ultra" } },
  ];
  assert.equal(resolveSessionMode(entries, "full"), "ultra");
});

test("resolveSessionMode: no entries falls back", () => {
  assert.equal(resolveSessionMode([], "full"), "full");
});
