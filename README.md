# PyPI Copy Plus

## Preview

<video width="960" height="540" controls>
  <source src="./preview/preview.mp4?raw=true" type="video/mp4">
  Your browser does not support HTML5 video.
</video>

[Direct link: `preview/preview.mp4`](./preview/preview.mp4)

[简体中文](README.zh-CN.md)

A browser extension that replaces the default `pip install <package>` command on `https://pypi.org/project/*` with your preferred Python package manager.

## Features

- 8 package managers: `pip`, `uv`, `Poetry`, `Pipenv`, `Conda`, `PDM`, `Rye`, `Hatch`
- Optional version pinning: a version dropdown next to the install command (default: no version)
- Popup UI + in-page panel: theme (light/dark/system), language (Auto/EN/简体/繁體), and manager selection with icons
- In-page floating settings button (draggable) for quick access on PyPI pages
- Instant updates: changing settings updates all open PyPI tabs (no refresh required)

## Usage

### Chrome / Edge

1. Download `pypi-copy-plus-<version>-chrome.zip` from GitHub Releases and unzip it.
2. Open `chrome://extensions/` (Edge: `edge://extensions/`) and enable Developer mode.
3. Click “Load unpacked” and select the unzipped folder.

### Firefox

1. Download `pypi-copy-plus-<version>-firefox.zip` from GitHub Releases.
2. Open `about:addons` → gear icon → “Install Add-on From File…”, then select the zip.
   - If Firefox blocks unsigned add-ons, use Firefox Developer/Nightly or load it temporarily via `about:debugging#/runtime/this-firefox`.

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
- You can override language in the popup or in-page panel; the choice is persisted via `browser.storage.local`.

## CI & Release

GitHub Actions workflow: `.github/workflows/ci.yml`

- Tag `v*` (e.g. `v1.1.0`): builds zips via `wxt zip` and publishes a GitHub Release with attached `.zip` files (excludes `*-sources.zip`).
- Release safeguard: `package.json` version must match the tag (without the leading `v`).

## License

MIT
