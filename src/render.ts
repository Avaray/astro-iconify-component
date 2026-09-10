import { iconToHTML } from '@iconify/utils';
import { resolveIcon } from './core/resolve.js';

export interface RenderIconMarkupOptions {
  /**
   * Sets both `width` and `height` simultaneously (overridable by `width`/
   * `height` below).
   *
   * @default "1em"
   */
  size?: string | number;

  /** Overrides `size` for width only. */
  width?: string | number;

  /** Overrides `size` for height only. */
  height?: string | number;

  /** CSS classes (e.g., Tailwind) to add to `<svg>`. */
  class?: string;

  /**
   * If provided: `role="img" aria-label={title}`.
   * If not provided: `aria-hidden="true"` (decorative by default).
   */
  title?: string;
}

/**
 * Renders an icon to a ready `<svg>...</svg>` string.
 *
 * Intended for use in `.astro` files when you want to pass an already
 * rendered (static, fully server-side) icon to a component from
 * another framework (React/Vue/Svelte) used as an "island" — e.g., to
 * pre-render two icon variants (play/pause), between which the
 * client component switches without any additional code for
 * resolving icons in the browser.
 *
 * For normal use in `.astro` files, use the `<Icon />` component — this
 * function is a helper for cases where you need a ready
 * string, not a component.
 *
 * @param name Icon name in the format `"prefix:name"`, e.g., `"mdi:play"`.
 * @param options Optional size/classes/title — see {@link RenderIconMarkupOptions}.
 * @returns A complete, ready-to-insert `<svg ...>...</svg>` string.
 * @throws If the name is malformed or the icon/set does not exist.
 *
 * @example
 * ```astro
 * ---
 * import { renderIconMarkup } from 'astro-iconify-component/render';
 * const playIcon = renderIconMarkup('mdi:play', { class: 'w-5 h-5' });
 * ---
 * ```
 */
export function renderIconMarkup(name: string, options: RenderIconMarkupOptions = {}): string {
  const resolved = resolveIcon(name, {
    width: options.width ?? options.size,
    height: options.height ?? options.size,
  });

  const attributes: Record<string, string> = { ...resolved.attributes };

  if (options.class) {
    attributes.class = options.class;
  }

  if (options.title) {
    attributes.role = 'img';
    attributes['aria-label'] = options.title;
  } else {
    attributes['aria-hidden'] = 'true';
  }

  return iconToHTML(resolved.body, attributes);
}
