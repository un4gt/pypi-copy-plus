# Repository Guidelines

## Project Structure & Module Organization

- `entrypoints/`: Extension entrypoints (WXT). Includes `content.ts` (PyPI DOM updates), `background.ts`, and `popup/` (Solid UI).
- `utils/`: Shared logic (e.g., `storage.ts` for `browser.storage` sync and `package-managers.ts` for command templates).
- Adding a new package manager usually touches `utils/package-managers.ts` and the command-matching regex in `entrypoints/content.ts`.
- `public/_locales/<locale>/messages.json`: Extension i18n files (used by `browser.i18n` and extension metadata).
- `src/_locales/<locale>/messages.json`: Importable i18n files for the popup’s in-app language override (`en/`, `zh/`, `zh_TW/`).
- `assets/`: Source assets (icons).
- Generated (do not commit): `node_modules/`, `.output/`, `.wxt/`.

## Build, Test, and Development Commands

Use Bun (matches CI):

- `bun install`: Install dependencies.
- `bun run dev` / `bun run dev:firefox`: Start dev mode for Chrome/Edge or Firefox (Chromium output: `.output/chrome-mv3-dev/`).
- `bun run build` / `bun run build:firefox`: Build production bundles.
- `bun run zip` / `bun run zip:firefox`: Create distributable `.zip` files under `.output/`.
- `bun run compile`: Type-check (`tsc --noEmit`).

## Coding Style & Naming Conventions

- TypeScript + SolidJS. Prefer the existing `@/…` import alias over deep relative paths.
- Indentation: 2 spaces; keep semicolons and single quotes consistent with current files.
- Naming: `PascalCase` components (`App.tsx`), `camelCase` functions/vars, `kebab-case` CSS classes.
- If you add/expand browser permissions, update `wxt.config.ts` and explain the user impact in the PR.

## Testing Guidelines

- No automated test runner is configured. Minimum checks before PR: `bun run compile`, then a manual smoke test:
  - Visit `https://pypi.org/project/<name>/` and confirm the install command is replaced.
  - Change settings in the popup and confirm open PyPI tabs update without refresh.
- For i18n changes, keep `src/_locales/` and `public/_locales/` keys in sync.

## Commit & Pull Request Guidelines

- Git history isn’t established in this repo yet; use Conventional Commits (e.g., `feat(content): …`, `fix(popup): …`, `chore: …`).
- PRs should include: a short “what/why”, manual test steps, and screenshots for popup/UI changes.

## Release (Tags)

- Pushing a `v*` tag triggers `.github/workflows/ci.yml` to type-check, build, and upload `.output/*.zip` artifacts to a GitHub Release.
- Keep `CHANGELOG.md` updated and use semantic tags like `v1.1.0` (local build: `bun run release`).
