import { detectWsl } from "./lib/wsl-host.js";
import {
  buildPortAdvice,
  buildUiPlaybook,
  checkLocalPort,
  formatPortReport,
  hostnameIps,
} from "./lib/port.js";

export const name = "dsh-wsl-port";
export const inject = ["tools", "systemPrompt"];

export function apply(ctx, config = {}) {
  const timeoutMs = positive(config.timeoutMs, 15_000);
  const defaultPort = positive(config.defaultPort, 3080);
  const wsl = detectWsl();

  ctx.systemPrompt.section({
    name: "tool:port_doctor",
    order: 121,
    text: "Use port_doctor when Windows cannot reach a WSL port. For dsh UI check 3080/3081 and prefer restart-dsh-web.sh relay — never dsh --host 0.0.0.0.",
  });

  ctx.tools.register({
    name: "port_doctor",
    description: "Report WSL IPs and whether a TCP port is listening; advise on Windows localhost forwarding.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        port: {
          type: "integer",
          description: `TCP port to check (default ${defaultPort}).`,
        },
      },
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          wsl: { type: "boolean" },
          port: { type: "integer" },
          ips: { type: "array", items: { type: "string" } },
          listen: { type: "object", additionalProperties: true },
          advice: { type: "array", items: { type: "string" } },
          uiPlaybook: { type: "array", items: { type: "string" } },
          error: { type: "string" },
        },
      },
      render: (_args, value) => [{ type: "text", text: formatPortReport(value) }],
    },
    timeoutMs,
    isConcurrencySafe: () => true,
    async execute(args) {
      if (!wsl) {
        return {
          wsl: false,
          port: defaultPort,
          error: "not running in WSL",
          advice: [],
          uiPlaybook: [],
          ips: [],
          listen: { ok: false, error: "not_wsl", listening: false, port: defaultPort },
        };
      }
      const port = Number.isInteger(args?.port) ? args.port : defaultPort;
      const ips = await hostnameIps();
      const listen = await checkLocalPort(port);
      const uiPlaybook = buildUiPlaybook(port);
      const report = { wsl: true, port, ips, listen, uiPlaybook, error: "" };
      report.advice = buildPortAdvice(report);
      return report;
    },
    presentCall: () => ({ card: "generic", title: "Port doctor" }),
    presentResult: (_args, result) => (
      result.isError
        ? { card: "generic", title: "Port doctor failed", content: result.content }
        : { card: "generic", title: "Port doctor", content: result.content }
    ),
  });
}

function positive(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
