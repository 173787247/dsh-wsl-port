import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPortAdvice, buildUiPlaybook, formatPortReport } from "../lib/port.js";

describe("port_doctor", () => {
  it("special-cases dsh 3080/3081 with uiPlaybook", () => {
    const tips = buildPortAdvice({
      ips: ["172.20.1.2"],
      listen: { ok: true, listening: true },
      port: 3080,
    });
    assert.ok(tips.some((t) => /3081/i.test(t)));
    assert.ok(tips.some((t) => /never|no --host 0\.0\.0\.0|binds 127/i.test(t)));
    assert.ok(tips.some((t) => /check-dsh-health/i.test(t)));
    assert.ok(tips.some((t) => /portproxy/i.test(t) && /must not|Local UI/i.test(t)));
    assert.ok(tips.some((t) => /wsl_expose/i.test(t)));
  });

  it("buildUiPlaybook only for 3080/3081", () => {
    assert.equal(buildUiPlaybook(11434).length, 0);
    const book = buildUiPlaybook(3081);
    assert.ok(book.some((s) => /check-dsh-health/i.test(s)));
    assert.ok(book.some((s) => /127\.0\.0\.1:3081/i.test(s)));
    assert.ok(book.some((s) => /restart-dsh-web/i.test(s)));
    assert.ok(book.some((s) => /portproxy/i.test(s)));
  });

  it("formats uiPlaybook section", () => {
    const text = formatPortReport({
      port: 3081,
      ips: ["1.2.3.4"],
      listen: { ok: true, listening: false },
      uiPlaybook: buildUiPlaybook(3081),
      advice: ["tip"],
    });
    assert.match(text, /uiPlaybook:/);
    assert.match(text, /check-dsh-health/);
    assert.match(text, /listening: false/);
  });
});
