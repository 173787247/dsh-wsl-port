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
    const listening = String(stdout || "").includes(`:${p} `) || String(stdout || "").includes(`:${p}\n`);
    return { ok: true, listening, port: p };
  } catch (err) {
    return {
      ok: false,
      port: p,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export function buildPortAdvice({ ips, listen, port }) {
  const tips = [];
  tips.push("WSL2 localhost forwarding: Windows localhost:<port> usually reaches Linux listeners bound to 0.0.0.0 or 127.0.0.1.");
  tips.push("If Windows cannot connect, try the WSL eth IP below, check Windows firewall, or restart: wsl --shutdown.");
  if (ips.length) tips.push(`Current WSL IPs: ${ips.join(", ")}`);
  if (listen?.ok && listen.listening) {
    tips.push(`Port ${port} appears listening inside WSL (ss).`);
    tips.push(`From Windows browser try http://127.0.0.1:${port}/ and http://${ips[0] || "<wsl-ip>"}:${port}/`);
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
  for (const tip of report.advice || []) lines.push(`- ${tip}`);
  return lines.join("\n");
}
