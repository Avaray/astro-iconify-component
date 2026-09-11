# 🚀 astro-iconify-component

A simple component for [Astro](https://astro.build), giving you access to all [Iconify](https://icon-sets.iconify.design) icons.

## ⚖️ Why this package? (Trade-offs)

This package was built with a single goal: **to provide the absolute easiest, zero-configuration way** to use the entire Iconify catalog in Astro. It is designed to be purely plug-and-play, working by directly inlining raw `<svg>` code into your HTML.

While this approach is incredibly developer-friendly and perfect for blogs, docs, or everyday websites, you should be aware of the architectural trade-off: **it does not use SVG sprites**. If you are building a page that renders the *exact same icon* hundreds of times (e.g., a massive data table with an edit icon in every row), inlining SVG will bloat your HTML size. For those specific extreme cases, the official [`astro-icon`](https://github.com/natemoo-re/astro-icon) plugin might be a better choice as it optimizes repeated icons using sprites.

## ⚙️ How it works

- `<Icon />` renders **exclusively on the server side** - during `astro build` (SSG) or on every request (SSR in Node.js environments). It never goes to the browser as code.
- Icon data (`@iconify/json`) is used only in Node during rendering - zero impact on the client bundle, regardless of how many icons and sets you use.
- Each icon set is loaded from the disk and lazily parsed, only when you use an icon from that set for the first time. To optimize memory usage in Serverless environments, only the requested icons are kept in memory, while the massive JSON icon sets are cleared.
- Icon aliases and transformations (rotation/flip) are resolved by the official `@iconify/utils`, so they work correctly even for sets that heavily use aliases (e.g., `mdi`).

> This component relies on `node:fs` to read icon files directly from your `node_modules` without any build steps or pre-bundling. Because of this, it **only works in Node.js environments** (Static Site Generation or Node-based Server-Side Rendering like Vercel Serverless or Netlify Functions) and is **not compatible with Edge environments** (like Cloudflare Workers).

## 📦 Installation

```bash
# using NPM
npm install astro-iconify-component

# using PNPM
pnpm add astro-iconify-component

# using Bun
bun add astro-iconify-component
```

## ⚡ Usage in `.astro` files

```astro
---
import Icon from 'astro-iconify-component';
---

<Icon name="mdi:home" />
<Icon name="mdi:home" class="w-6 h-6 text-blue-500 dark:text-blue-300" />
<Icon name="mdi:alert" title="Warning" />
```

The icon name is always `prefix:name` - you can find the prefix and available names on [Official Iconify Website](https://icon-sets.iconify.design) or  An invalid name (typo, unknown prefix, non-existent icon) throws an error **at build time** - this lets you catch a typo before deploying the site, rather than only by eye on the rendered page.

### 🎛️ Props

| Prop     | Type                | Description                                                                 |
| -------- | ------------------- | --------------------------------------------------------------------- |
| `name`   | `string` (required) | Icon name, e.g., `"mdi:home"`.                                        |
| `class`  | `string`            | CSS classes - passed 1:1 to `<svg>`.                                |
| `size`   | `string \| number`  | Shortcut setting both `width` and `height` simultaneously.                    |
| `width`  | `string \| number`  | Overrides `size` for width.                                      |
| `height` | `string \| number`  | Overrides `size` for height.                                       |
| `title`  | `string`            | If provided: `role="img" aria-label={title}`. If not: `aria-hidden="true"` (decorative icon). |
| ...rest  | -                   | Any other attributes (`id`, `data-*`...) are passed directly to `<svg>`. |

The default size is `1em` (scales with `font-size`, just like in the official `iconify-icon`) - it's easy to override via `size`/`width`/`height` or via classes like `w-6 h-6`/`size-5`.

## 🧠 TypeScript / IDE intellisense

`Props` inherits from `HTMLAttributes<'svg'>` from `astro/types`, so you get two things at once:

- **Real typo protection** - `<Icon nam="mdi:home" />` (typo in `name`) is a type error, not a silent missing icon. Unknown attributes other than `data-*` are also caught.
- **Full, described props** - `name`, `size`, `width`, `height`, `title` have JSDoc with explanations and examples, so hovering in VS Code (with the Astro extension) shows the description directly while writing `<Icon ... />`.

Project requirement: `tsconfig.json` with `"moduleResolution": "bundler"` (or `"node16"`/`"nodenext"`) - this is set by default by each of the official Astro presets (`astro/tsconfigs/base` / `strict` / `strictest`), which is exactly what every project created by `npm create astro@latest` has. Without this, TypeScript cannot resolve the package's `exports` map.

## 🎨 Tailwind CSS

The component adds **no** own classes - the entire `class` you provide is passed directly to `<svg>`. Thanks to this:

- You don't have to add anything to `content` (Tailwind 3) or `@source` (Tailwind 4) - the package code lies in `node_modules` and never defines its own classes, so there is nothing to scan.
- The size (`w-*`, `h-*`, `size-*`) always overrides the default `1em`, because the default size is set as an attribute, not as a `style` (CSS always wins against presentational attributes, but loses to inline `style` - so the package intentionally avoids using `style`).
- Color works via `text-*` (e.g., `text-blue-500`, `dark:text-white`, `group-hover:text-red-500`) - **not** via `fill-*`/`stroke-*`. Single-color sets (`mdi`, `lucide`, `tabler`...) already have `currentColor` written in the icon data (this is how Iconify itself builds them), so they automatically inherit the text color. Sets with a fixed palette (flags, emojis, `logos`...) retain their own colors and should not be overridden.

```astro
<Icon name="mdi:star" class="size-5 text-yellow-500" />
```

## 🏝️ Usage in UI Frameworks (React, Vue, Svelte) and MDX

In addition to `.astro` components, this package provides native components for React, Vue, and Svelte. Since all framework components rely on `node:fs` to read icon data, there is one important rule to keep in mind: **they only run on the server (Node.js)**. How you use them depends on whether your component is a static island or an interactive one.

### Static components (no `client:*` directive)

If a framework component does **not** use a `client:*` hydration directive, Astro renders it entirely on the server, just like `.astro` files. In this case you can import and use the icon directly inside your component — no extra setup needed.

#### ⚛️ React & MDX
```tsx
import Icon from 'astro-iconify-component/react';

export default function MyCard() {
  return (
    <div>
      <Icon name="mdi:home" className="w-6 h-6" />
      Hello!
    </div>
  );
}
```

#### 💚 Vue
```vue
<script setup>
import Icon from 'astro-iconify-component/vue';
</script>

<template>
  <div>
    <Icon name="mdi:home" class="w-6 h-6" />
    Hello!
  </div>
</template>
```

#### 🧡 Svelte
```svelte
<script>
  import Icon from 'astro-iconify-component/svelte';
</script>

<div>
  <Icon name="mdi:home" class="w-6 h-6" />
  Hello!
</div>
```

> **Note:** The `icon` prop is also supported as an alias for `name` across all framework components for backward compatibility with other packages (e.g. `<Icon icon="mdi:home" />`).

### ⚠️ Interactive islands (`client:load`, `client:visible`, etc.)

When you add a `client:*` directive to a framework component, Astro ships its JavaScript bundle to the browser for hydration. At that point, **any `node:fs` import inside that bundle will fail** — browsers have no access to the file system.

This means you **cannot** import `astro-iconify-component/react` (or `/vue`, `/svelte`) inside a component used as an interactive island. Doing so will cause Vite to throw a bundling error, and the component will not render.

Instead, use one of these two patterns:

**Option 1: Pass the icon as a child from the `.astro` parent (recommended)**

Render the icon in Astro (on the server), and pass the resulting HTML to the island as a child node. The island receives it as already-rendered, static HTML — no `node:fs` ever reaches the browser.

```astro
---
import Icon from 'astro-iconify-component';
import Card from '../islands/Card.tsx';
---

<Card client:visible>
  <Icon name="mdi:star" />
</Card>
```

```tsx
// Card.tsx — receives the pre-rendered SVG via children
export default function Card({ children }) {
  return (
    <div class="card">
      {children}
    </div>
  );
}
```

**Option 2: Pass pre-rendered HTML strings (for icons that toggle state)**

If an icon needs to **change on the client** (e.g. play/pause), render both variants upfront on the server using the `render` export and pass them as plain string props:

```astro
---
import { renderIconMarkup } from 'astro-iconify-component/render';
import PlayButton from '../islands/PlayButton.tsx';

const playIcon = renderIconMarkup('mdi:play');
const pauseIcon = renderIconMarkup('mdi:pause');
---

<PlayButton client:load playIconHtml={playIcon} pauseIconHtml={pauseIcon} />
```

## 📜 Icon Licenses

This package depends on [`@iconify/json`](https://github.com/iconify/icon-sets), which aggregates over 200 icon sets - **each under its own license** (mostly MIT/Apache/CC, but not all). The code of this component is under the MIT license, but this does not cover the icons themselves. Before using a specific set in a commercial project, check its license on [icon-sets.iconify.design](https://icon-sets.iconify.design) (the license of each set is provided on its page).

## 📁 Custom Icon Collections

This is not yet in the public API (v0.1), but the internal architecture (`src/core/providers.ts`) is prepared for adding custom/non-standard icon sets without changing the `<Icon />` API. 

## 📄 License

This package is licensed under the MIT License. See [LICENSE](./LICENSE) for details.
