# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0-beta.4] - 2026-09-10

### Added
- Native support for Vue components via `astro-iconify-component/vue`
- Native support for Svelte components via `astro-iconify-component/svelte`
- `vue` and `svelte` optional peer dependencies added

## [0.1.0-beta.3] - 2026-09-10

### Added
- New `astro-iconify-component/react` export — a React-compatible `<Icon />` component built with `React.createElement` (no JSX transform required). Designed for use inside MDX inline JSX components, React islands, and any JSX context within an Astro project
- `icon` prop accepted as an alias for `name` in both `Icon.astro` and the React component. Allows drop-in replacement for packages that use `icon=` as the primary prop name (e.g. `@xtreat/astro-iconify`)
- `react` added as an optional peer dependency (required only when using the `./react` export)

### Fixed
- Using `<Icon icon="..." />` (instead of `name="..."`) no longer silently fails — the `icon` prop is now a recognized alias

## [0.1.0-beta.2] - 2026-09-10

### Fixed
- `resolveIcon()` now throws a descriptive error when the `name` prop is `undefined` or `null` instead of crashing with a cryptic `Cannot read properties of undefined (reading 'indexOf')` message

## [0.1.0-beta.1] - 2026-09-10

### Added
- `<Icon />` component for Astro with full offline Iconify icon support (`src/Icon.astro`)
- `resolveIcon()` function for programmatic SVG resolution (`src/core/resolve.ts`)
- `renderIconMarkup()` function for rendering icon to an HTML string (`src/render.ts`)
- Custom icon set provider API via `registerIconSetLoader()` (`src/core/providers.ts`)
- `astro-iconify-component/render` named export for use inside React/Vue/Svelte islands
- Props: `name`, `class`, `size`, `width`, `height`, `title` with full JSDoc documentation
- Built-in accessibility — `aria-hidden="true"` by default, `role="img"` + `aria-label` when `title` is provided
- Full TypeScript support — `Props` extends `HTMLAttributes<'svg'>` from `astro/types`
- Memory-optimized icon caching — only extracted `IconData` objects are kept in memory, full JSON sets are released to GC immediately
- Robust `@iconify/json` path resolution with three-stage fallback strategy (works in dev, SSG build, and SSR after Astro/Vite bundling moves chunks)
- Guard against `undefined` / `null` `name` prop with a descriptive error message
- Build pipeline using `tsdown` (powered by Rolldown) outputting ESM `.mjs` and `.d.mts` files to `dist/`
- Test suite using `bun:test` covering resolution, aliases, palette icons, size overrides, error cases, and markup rendering
- GitHub Actions workflow for automated NPM publishing with Provenance attestation (`.github/workflows/publish.yml`)
- Dependabot configuration for automated dependency monitoring (`.github/dependabot.yml`)
- `prepack` script ensuring `dist/` is always rebuilt before `npm publish`

### Notes
- Requires Astro `^5.0.0 || ^6.0.0 || ^7.0.0` as a peer dependency
- Only works in Node.js environments (SSG and Node-based SSR). Not compatible with Edge runtimes (Cloudflare Workers, etc.)

[Unreleased]: https://github.com/your-username/astro-iconify-component/compare/v0.1.0-beta.2...HEAD
[0.1.0-beta.2]: https://github.com/your-username/astro-iconify-component/compare/v0.1.0-beta.1...v0.1.0-beta.2
[0.1.0-beta.1]: https://github.com/your-username/astro-iconify-component/releases/tag/v0.1.0-beta.1
