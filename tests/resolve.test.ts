import { test, expect } from 'bun:test';
import { resolveIcon } from '../src/core/resolve.js';
import { renderIconMarkup } from '../src/render.js';

test('resolves a basic icon with viewBox and a <path> body', () => {
  const r = resolveIcon('mdi:home');
  expect(r.attributes.viewBox).toBeTruthy();
  expect(r.body).toMatch(/<path/);
});

test('preserves multiple elements in body instead of collapsing to one <path d="...">', () => {
  // mdi:fill is known to have two separate <path> elements.
  const r = resolveIcon('mdi:fill');
  const pathCount = (r.body.match(/<path/g) ?? []).length;
  expect(pathCount).toBe(2);
});

test('resolves aliased icon names to the same body as their parent', () => {
  // mdi:123 is a documented alias of mdi:numeric.
  const alias = resolveIcon('mdi:123');
  const parent = resolveIcon('mdi:numeric');
  expect(alias.body).toBe(parent.body);
});

test('keeps explicit hardcoded colors for palette (multi-color) icon sets', () => {
  const r = resolveIcon('flat-color-icons:about');
  expect(r.body).toMatch(/#2196F3/);
  expect(r.body).toMatch(/<g/);
  expect(r.body).not.toMatch(/currentColor/);
});

test('defaults to height=1em with an auto-computed width', () => {
  const r = resolveIcon('mdi:home');
  expect(r.attributes.height).toBe('1em');
  expect(r.attributes.width).toBeTruthy();
});

test('respects explicit width/height overrides', () => {
  const r = resolveIcon('mdi:home', { width: 32, height: 32 });
  expect(String(r.attributes.width)).toBe('32');
  expect(String(r.attributes.height)).toBe('32');
});

test('throws on a malformed icon name (missing "prefix:" separator)', () => {
  expect(() => resolveIcon('nocolonhere')).toThrow();
});

test('throws on an unknown icon set prefix', () => {
  expect(() => resolveIcon('totally-fake-prefix-xyz:home')).toThrow();
});

test('throws on an unknown icon within a valid prefix', () => {
  expect(() => resolveIcon('mdi:this-icon-does-not-exist-xyz-123')).toThrow();
});

test('renderIconMarkup() produces a full <svg> string, decorative by default', () => {
  const html = renderIconMarkup('mdi:home', { class: 'w-6 h-6' });
  expect(html).toMatch(/^<svg/);
  expect(html).toMatch(/aria-hidden="true"/);
  expect(html).toMatch(/class="w-6 h-6"/);
});

test('renderIconMarkup() sets role=img and aria-label when title is given', () => {
  const html = renderIconMarkup('mdi:home', { title: 'Strona główna' });
  expect(html).toMatch(/role="img"/);
  expect(html).toMatch(/aria-label="Strona główna"/);
});
