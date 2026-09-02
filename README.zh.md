# dsh-wsl-port
> **套件安装：** 见 [dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit)。推荐 `KIT_SET=daily` | `llm` | `github` | `full`。故障树：[TROUBLESHOOTING.zh.md](https://github.com/173787247/dsh-wsl-kit/blob/master/docs/TROUBLESHOOTING.zh.md)。


DeepSeek Harness 工具：**`port_doctor`** — 报告 WSL IP、TCP 端口是否在听，并就 Windows **localhost 转发**给出建议。

属于 **[dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit)**。

[English → README.md](./README.md)

---

## 为什么需要

WSL 里绑定的服务，Windows 有时能用 `http://127.0.0.1:<port>` 打开，有时则需要 WSL 网卡 IP / 防火墙调整 / `wsl --shutdown`。本工具检查 `hostname -I` 与 `ss` 监听状态。

默认端口：**3080**（常见 `dsh web` 端口）。可用参数 `port` 覆盖。

## 安装

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-port
```

## 配置

```yaml
- id: dsh-wsl-port
  name: dsh-wsl-port
  config:
    timeoutMs: 15000
    defaultPort: 3080
```

## 测试

```sh
npm test
```

## 许可

MIT
