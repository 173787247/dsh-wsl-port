import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPortAdvice, formatPortReport } from "../lib/port.js";

describe("port_doctor", () => {
  it("special-cases dsh 3080/3081", () => {
    const tips = buildPortAdvice({
      ips: ["172.20.1.2"],
      listen: { ok: true, listening: true },
      port: 3080,
    });
    assert.ok(tips.some((t) => /3081/i.test(t)));
    assert.ok(tips.some((t) => /never|no --host 0\.0\.0\.0|binds 127/i.test(t)));
  });

  it("formats", () => {
    assert.match(
      formatPortReport({ port: 3081, ips: ["1.2.3.4"], listen: { ok: true, listening: false }, advice: ["tip"] }),
      /listening: false/,
    );
  });
});
