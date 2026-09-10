import { createElement } from 'react';
import { resolveIcon } from './core/resolve.js';
import type { ResolveIconOptions } from './core/resolve.js';

export interface IconProps extends ResolveIconOptions {
  /**
   * Icon name in the format `"prefix:name"`.
   * @see https://icon-sets.iconify.design
   * @example "mdi:home"
   */
  name?: string;

  /**
   * Alias for `name`. Accepted for compatibility with other icon packages
   * that use `icon` as the prop name. If both are provided, `name` takes priority.
   */
  icon?: string;

  /** CSS classes passed 1:1 to `<svg>`. */
  class?: string;
  className?: string;

  /** Shortcut setting both `width` and `height`. @default "1em" */
  size?: string | number;

  /**
   * If provided: `role="img"` and `aria-label={title}`.
   * If not: `aria-hidden="true"` (decorative).
   */
  title?: string;

  [key: string]: unknown;
}

/**
 * React-compatible offline `<Icon />` component for use inside MDX inline JSX,
 * React islands, and any JSX context within an Astro project.
 *
 * Import from `astro-iconify-component/react` instead of the default export.
 *
 * @example
 * ```tsx
 * import Icon from 'astro-iconify-component/react';
 *
 * export const MyBlock = ({ icon }) => (
 *   <div>
 *     <Icon name={icon} class="w-8 h-8 text-blue-500" />
 *   </div>
 * );
 * ```
 */
export default function Icon({
  name,
  class: className,
  className: classNameAlt,
  size,
  width,
  height,
  title,
  ...rest
}: IconProps) {
  const resolved = resolveIcon(name, {
    width: width ?? size,
    height: height ?? size,
  });

  const a11yAttrs = title
    ? { role: 'img', 'aria-label': title }
    : { 'aria-hidden': 'true' };

  // Use React.createElement directly to avoid requiring a JSX transform
  // in the consuming project's bundler when processing this compiled file.
  return createElement('svg', {
    ...resolved.attributes,
    className: className ?? classNameAlt,
    ...a11yAttrs,
    ...rest,
    dangerouslySetInnerHTML: { __html: resolved.body },
  });
}
