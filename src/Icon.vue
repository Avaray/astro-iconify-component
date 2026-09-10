<template>
  <svg
    v-if="iconName"
    v-bind="resolved.attributes"
    :role="title ? 'img' : undefined"
    :aria-label="title"
    :aria-hidden="title ? undefined : 'true'"
    v-html="resolved.body"
  ></svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { resolveIcon } from '../dist/core/resolve.mjs';

const props = defineProps<{
  /**
   * Icon name in the format `"prefix:name"`.
   * @example "mdi:home"
   */
  name?: string;

  /**
   * Alias for `name`. Accepted for compatibility with other icon packages.
   */
  icon?: string;

  /** Shortcut setting both `width` and `height`. @default "1em" */
  size?: string | number;

  /** Overrides `size` for width only. */
  width?: string | number;

  /** Overrides `size` for height only. */
  height?: string | number;

  /**
   * If provided: `role="img"` and `aria-label={title}`.
   * If not: `aria-hidden="true"` (decorative).
   */
  title?: string;
}>();

const iconName = computed(() => props.name ?? props.icon);

const resolved = computed(() => {
  if (!iconName.value) return { attributes: {}, body: '' };
  return resolveIcon(iconName.value, {
    width: props.width ?? props.size,
    height: props.height ?? props.size,
  });
});
</script>
