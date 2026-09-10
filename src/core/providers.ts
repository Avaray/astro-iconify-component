import type { IconifyJSON } from '@iconify/types';

/**
 * A function that, for a given icon set prefix (e.g., "mdi"), returns the data
 * of that set in IconifyJSON format, or null if it cannot handle it.
 */
export type IconSetLoader = (prefix: string) => IconifyJSON | null;

const loaders: IconSetLoader[] = [];

/**
 * Internal registry of icon set "providers".
 *
 * Not (yet) exported from the package's public API — this is a deliberately
 * prepared place for future support of custom/non-standard icon collections
 * (e.g., a local SVG folder or company logo), without the need to change
 * the public API of the <Icon /> component.
 *
 * Loaders are checked in the order of registration, the first one wins.
 */
export function registerIconSetLoader(loader: IconSetLoader): void {
  loaders.push(loader);
}

export function loadIconSetFromProviders(prefix: string): IconifyJSON | null {
  for (const loader of loaders) {
    const result = loader(prefix);
    if (result) return result;
  }
  return null;
}
