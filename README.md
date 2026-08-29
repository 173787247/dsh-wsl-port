# dsh-wsl-port

DeepSeek Harness tool: **`port_doctor`** — report WSL IPs and whether a TCP port is listening; advise on Windows **localhost forwarding**.

Part of **[dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit)**.

[中文说明 ↓](#中文)

---

## English

### Why

A server bound in WSL may be reachable as `http://127.0.0.1:<port>` from Windows—or may need the WSL eth IP / a firewall fix / `wsl --shutdown`. This tool checks `hostname -I` and `ss` listen state.

Default port: **3080** (common `dsh web` port). Override with the `port` argument.

### Install

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-port
```

### Config

```yaml
- id: dsh-wsl-port
  name: dsh-wsl-port
  config:
    timeoutMs: 15000
    defaultPort: 3080
```

### Test

```sh
npm test
```

### License

MIT

---

## 中文

### 为什么需要

WSL 里起的服务，Windows 浏览器有时打不开 `localhost`。本工具查看本机 IP 与端口是否在听，并提示 localhost 转发 / 防火墙 / `wsl --shutdown`。

默认检查端口 `3080`（常见 `dsh web`），可用参数 `port` 覆盖。

### 安装

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-port
```

### 许可

MIT
