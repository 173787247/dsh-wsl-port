# Changelog

## 0.2.2

- uiPlaybook: dsh ≥0.1.2 needs `?token=` from `restart-dsh-web.sh`; bare `:3081` is 401.

## 0.2.1

- `uiPlaybook` for ports 3080/3081: `check-dsh-health` → `:3081` → `restart-dsh-web` → `wsl_expose` only for LAN (no local portproxy).

## 0.2.0

- Special-case dsh ports 3080/3081 (relay, never `--host 0.0.0.0`).

## 0.1.0

- Initial ss / hostname -I advice.
