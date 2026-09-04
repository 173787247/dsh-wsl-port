import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function hostnameIps({ execFileFn = execFileAsync } = {}) {
  try {
    const { stdout } = await execFileFn("hostname", ["-I"], { encoding: "utf8", timeout: 5_000 });
    return String(stdout || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  } catch {
    return [];
  }
}

export async function checkLocalPort(port, { execFileFn = execFileAsync } = {}) {
  const p = Number(port);
  if (!Number.isInteger(p) || p < 1 || p > 65535) {
    return { ok: false, error: "invalid port" };
  }
  try {
    const { stdout } = await execFileFn("ss", ["-ltn"], { encoding: "utf8", timeout: 5_000 });
    const text = String(stdout || "");
    const listening =
      text.includes(`:${p} `) ||
      text.includes(`:${p}\n`) ||
      new RegExp(`:${p}\\b`).test(text);
    return { ok: true, listening, port: p };
  } catch (err) {
    return {
      ok: false,
      port: p,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export function buildUiPlaybook(port) {
  const p = Number(port);
  if (p !== 3080 && p !== 3081) return [];
  return [
    "1) bash …/dsh-wsl-kit/scripts/check-dsh-health.sh (3080/3081 + NODE_USE_ENV_PROXY).",
    "2) In Windows open only http://127.0.0.1:3081/ — not :3000 (GenericAgent) and not bare :3080 unless mirrored is confirmed.",
    "3) If unhealthy: bash …/dsh-wsl-kit/scripts/restart-dsh-web.sh then new browser tab.",
    "4) Local UI must not use netsh portproxy. Use wsl_expose only for LAN / non-dsh services.",
  ];
}

export function buildPortAdvice({ ips, listen, port }) {
  const tips = [];
  const p = Number(port);
  const uiPlaybook = buildUiPlaybook(p);

  if (p === 3080 || p === 3081) {
    tips.push(
      "dsh web binds 127.0.0.1:3080 only (no --host 0.0.0.0). From Windows prefer http://127.0.0.1:3081/ via kit scripts/restart-dsh-web.sh relay.",
    );
    tips.push(...uiPlaybook);
    if (p === 3080) {
      tips.push("If 3080 works in Windows browser, WSL mirrored networking is likely on; 3081 remains the safer default.");
    }
    if (p === 3081) {
      tips.push("3081 is the Python dual-stack relay — if closed, re-run restart-dsh-web.sh (not portproxy for local UI).");
    }
    tips.push("For LAN exposure of non-dsh services use wsl_expose; do not publish dsh without auth.");
  } else {
    tips.push(
      "WSL2 localhost forwarding: Windows localhost:<port> often reaches Linux listeners on 0.0.0.0 or 127.0.0.1 (especially with networkingMode=mirrored).",
    );
    tips.push("If Windows cannot connect: try WSL eth IP, check firewall, wslconfig_hint, or wsl --shutdown.");
  }

  if (ips.length) tips.push(`Current WSL IPs: ${ips.join(", ")}`);
  if (listen?.ok && listen.listening) {
    tips.push(`Port ${port} appears listening inside WSL (ss).`);
    if (p !== 3080 && p !== 3081) {
      tips.push(`From Windows try http://127.0.0.1:${port}/ and http://${ips[0] || "<wsl-ip>"}:${port}/`);
    } else if (p === 3080) {
      tips.push("From Windows: http://127.0.0.1:3080/ (mirrored) or http://127.0.0.1:3081/ (relay).");
    } else {
      tips.push("From Windows: http://127.0.0.1:3081/");
    }
  } else if (listen?.ok) {
    tips.push(`Port ${port} does not appear to be listening inside WSL yet.`);
  }
  return tips;
}

export function formatPortReport(report) {
  const lines = ["port_doctor", `port: ${report.port}`];
  if (report.ips?.length) lines.push(`wsl_ips: ${report.ips.join(", ")}`);
  if (report.listen?.ok) lines.push(`listening: ${report.listen.listening}`);
  else if (report.listen?.error) lines.push(`ss: ${report.listen.error}`);
  if (report.uiPlaybook?.length) {
    lines.push("uiPlaybook:");
    for (const step of report.uiPlaybook) lines.push(`  ${step}`);
  }
  for (const tip of report.advice || []) lines.push(`- ${tip}`);
  return lines.join("\n");
}
