# PyPI Copy Plus

[简体中文](README.zh-CN.md)

A browser extension that replaces the default `pip install <package>` command on `https://pypi.org/project/*` with your preferred Python package manager.

## Features

- 8 package managers: `pip`, `uv`, `Poetry`, `Pipenv`, `Conda`, `PDM`, `Rye`, `Hatch`
- Popup UI: theme (light/dark/system), language (Auto/EN/简体/繁體), and manager selection with icons
- Instant updates: changing settings updates all open PyPI tabs (no refresh required)

## Development

Prerequisites: Bun.

```bash
bun install
bun run dev           # Chrome/Edge
bun run dev:firefox   # Firefox
```

Type-check / build / package:

```bash
bun run compile
bun run build
bun run zip           # uses `wxt zip`
```

## i18n

- Default language is `Auto` (derived from `browser.i18n.getUILanguage()`; falls back to English).
- You can override language in the popup; the choice is persisted via `browser.storage.sync`.

## CI & Release

GitHub Actions workflow: `.github/workflows/ci.yml`

- PR / push to `main`: type-checks and builds release zips via `wxt zip`, then uploads them as workflow artifacts.
- Tag `v*` (e.g. `v1.1.0`): builds zips via `wxt zip` and publishes a GitHub Release with attached `.zip` files.
- Release safeguard: `package.json` version must match the tag (without the leading `v`).

## License

MIT
