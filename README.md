# dsh-wsl-port
> **Install set:** part of [dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit). Prefer `KIT_SET=daily` | `llm` | `github` | `full` (see kit README). Fault tree: [TROUBLESHOOTING.md](https://github.com/173787247/dsh-wsl-kit/blob/master/docs/TROUBLESHOOTING.md).


DeepSeek Harness tool: **`port_doctor`** — report WSL IPs and whether a TCP port is listening; advise on Windows **localhost forwarding**.

Part of **[dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit)**.

[中文说明 → README.zh.md](./README.zh.md)

---

## Why

A server bound in WSL may be reachable as `http://127.0.0.1:<port>` from Windows—or may need the WSL eth IP / a firewall fix / `wsl --shutdown`. This tool checks `hostname -I` and `ss` listen state.

Default port: **3080** (common `dsh web` port). Override with the `port` argument.

## Install

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-port
```

## Config

```yaml
- id: dsh-wsl-port
  name: dsh-wsl-port
  config:
    timeoutMs: 15000
    defaultPort: 3080
```

## Test

```sh
npm test
```

## License

MIT
