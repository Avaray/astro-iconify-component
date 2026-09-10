import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { getIconData, iconToSVG, replaceIDs } from '@iconify/utils';
import type { IconifyJSON, ExtendedIconifyIcon } from '@iconify/types';
import { loadIconSetFromProviders, registerIconSetLoader } from './providers.js';

const PACKAGE_TAG = '[astro-iconify-component]';

/**
 * Cache in the process memory (SSG build / SSR process).
 * Each icon set (prefix) is loaded and parsed from the disk only
 * once — regardless of how many times and on how many pages you use icons
 * from this set.
 */
const iconDataCache = new Map<string, Record<string, ExtendedIconifyIcon | null>>();

function loadFromIconifyJson(prefix: string): IconifyJSON | null {
  const target = `@iconify/json/json/${prefix}.json`;
  let filePath = '';

  // 1. Try standard module resolution from current file (works in dev mode)
  try {
    const req1 = createRequire(import.meta.url);
    filePath = req1.resolve(target);
  } catch {}

  // 2. Try standard module resolution from project root (works if hoisted)
  if (!filePath) {
    try {
      const req2 = createRequire(process.cwd() + '/package.json');
      filePath = req2.resolve(target);
    } catch {}
  }

  // 3. Fallback for Astro build mode (SSG/SSR bundling).
  // Astro moves this code to dist/.prerender/chunks/ which breaks standard require.resolve.
  // We manually check where Bun/npm might have installed it.
  if (!filePath) {
    const cwd = process.cwd();
    const pathsToTry = [
      join(cwd, 'node_modules', '@iconify', 'json', 'json', `${prefix}.json`),
      join(cwd, 'node_modules', 'astro-iconify-component', 'node_modules', '@iconify', 'json', 'json', `${prefix}.json`)
    ];

    for (const p of pathsToTry) {
      if (existsSync(p)) {
        filePath = p;
        break;
      }
    }
  }

  if (!filePath) return null;

  try {
    const raw = readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as IconifyJSON;
  } catch {
    return null;
  }
}

registerIconSetLoader(loadFromIconifyJson);

function getIconDataFromCacheOrLoad(prefix: string, id: string): ExtendedIconifyIcon | null {
  let setCache = iconDataCache.get(prefix);
  
  if (!setCache) {
    // 1. The set hasn't been parsed yet at all, load it.
    const iconSet = loadIconSetFromProviders(prefix);
    if (!iconSet) {
      throw new Error(
        `${PACKAGE_TAG} Unknown icon set "${prefix}" (from name "${prefix}:${id}"). Check the prefix at https://icon-sets.iconify.design — maybe a typo.`
      );
    }
    setCache = {};
    
    // 2. Look for the requested icon.
    const iconData = getIconData(iconSet, id);
    setCache[id] = iconData;
    
    // 3. Save only our "bag" of extracted icons from this set to the cache.
    // The entire iconSet object (often a multi-megabyte JSON) will be left for garbage
    // collection immediately after exiting this function, saving RAM in SSR.
    iconDataCache.set(prefix, setCache);
    return iconData;
  }

  // The set was already loaded. Check if this specific icon has already been extracted to the cache.
  if (id in setCache) {
    return setCache[id];
  }

  // The set was loaded, but for a different icon. Load it from the disk AGAIN,
  // extract this new icon, and add it to the cache. The set itself goes to GC again.
  // This is a trade-off: fast reading of small data vs RAM usage (in SSR/Serverless, RAM is crucial).
  const iconSet = loadIconSetFromProviders(prefix);
  if (!iconSet) return null; // Should not happen since we already entered setCache
  
  const iconData = getIconData(iconSet, id);
  setCache[id] = iconData;
  return iconData;
}

export interface ResolveIconOptions {
  /** Forces width (overrides default aspect ratio calculation). */
  width?: string | number | null;
  /** Forces height. If neither `width` nor `height` are provided, defaults to `"1em"`. */
  height?: string | number | null;
}

export interface ResolvedIcon {
  /** Attributes to spread on the `<svg>` element (`viewBox`, `width`, `height`...). */
  attributes: Record<string, string>;
  /**
   * Content inside `<svg>` — may contain multiple elements
   * (`<path>`, `<g>`, `<circle>`...), not just a single `<path>`. IDs
   * inside are already passed through `replaceIDs`, so they are safe
   * for multiple uses on a single page.
   */
  body: string;
}

/**
 * Resolves an icon name in the format `"prefix:name"` (e.g., `"mdi:home"`) to
 * ready-to-use SVG data. Correctly handles icon aliases and transformations
 * (rotation/flip) thanks to the use of `@iconify/utils`, instead of naive
 * reading of `icons[name]`.
 *
 * @param name Icon name in the format `"prefix:name"`.
 * @param options Optional enforcement of `width`/`height`.
 * @returns Attributes and body ready to assemble into `<svg {...attributes}>{body}</svg>`.
 * @throws If the name is malformed, the icon set does not exist,
 * or the icon does not exist in the given set — intentionally, to catch a typo
 * in the icon name at build time, rather than only by eye on the rendered page.
 */
export function resolveIcon(name: string, options: ResolveIconOptions = {}): ResolvedIcon {
  if (!name || typeof name !== 'string') {
    throw new Error(
      `${PACKAGE_TAG} The "name" prop is required but received ${JSON.stringify(name)}. Did you pass an undefined variable? Expected format: "prefix:icon-name", e.g., "mdi:home".`
    );
  }

  const separatorIndex = name.indexOf(':');
  if (separatorIndex <= 0 || separatorIndex === name.length - 1) {
    throw new Error(
      `${PACKAGE_TAG} Invalid icon name "${name}". Expected format is "prefix:icon-name", e.g., "mdi:home". For a full list of sets and icons, see https://icon-sets.iconify.design.`
    );
  }

  const prefix = name.slice(0, separatorIndex);
  const id = name.slice(separatorIndex + 1);

  const iconData = getIconDataFromCacheOrLoad(prefix, id);
  if (!iconData) {
    throw new Error(
      `${PACKAGE_TAG} Icon "${id}" does not exist in the "${prefix}" set. Check available names at https://icon-sets.iconify.design/${prefix}/.`
    );
  }

  const customisations: Record<string, unknown> = {};
  if (options.width != null) customisations.width = options.width;
  if (options.height != null) customisations.height = options.height;
  if (customisations.width == null && customisations.height == null) {
    // Default size according to Iconify convention: scales with font-size,
    // and Tailwind (w-*, h-*, size-*) easily overrides it via CSS anyway.
    customisations.height = '1em';
  }

  const rendered = iconToSVG(iconData, customisations);

  return {
    attributes: rendered.attributes as Record<string, string>,
    // replaceIDs prevents id collisions (e.g., <mask>, <clipPath>) when the
    // same icon (or two different ones that happen to use the same id)
    // appears multiple times on one page.
    body: replaceIDs(rendered.body),
  };
}
