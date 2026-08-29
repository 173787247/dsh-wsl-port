import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPortAdvice, formatPortReport } from "../lib/port.js";

describe("port_doctor", () => {
  it("mentions localhost forwarding", () => {
    const advice = buildPortAdvice({ ips: ["172.20.0.2"], listen: { ok: true, listening: true }, port: 3080 });
    assert.ok(advice.some((t) => /localhost/i.test(t)));
    assert.ok(advice.some((t) => /3080/.test(t)));
  });

  it("formats", () => {
    assert.match(formatPortReport({ port: 1, ips: ["1.2.3.4"], listen: { ok: true, listening: false }, advice: ["x"] }), /listening: false/);
  });
});
