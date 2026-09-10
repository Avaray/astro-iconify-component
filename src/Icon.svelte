<script lang="ts">
  import { resolveIcon } from '../dist/core/resolve.mjs';

  export let name: string | undefined = undefined;
  export let icon: string | undefined = undefined;
  
  let className: string | undefined = undefined;
  export { className as class };
  
  export let size: string | number | undefined = undefined;
  export let width: string | number | undefined = undefined;
  export let height: string | number | undefined = undefined;
  export let title: string | undefined = undefined;

  $: iconName = name ?? icon;
  
  $: resolved = iconName ? resolveIcon(iconName, {
    width: width ?? size,
    height: height ?? size,
  }) : { attributes: {}, body: '' };
</script>

{#if iconName}
  <!-- svelte-ignore a11y-missing-attribute -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <svg
    {...resolved.attributes}
    class={className}
    role={title ? 'img' : undefined}
    aria-label={title}
    aria-hidden={title ? undefined : 'true'}
    {...$$restProps}
  >
    {@html resolved.body}
  </svg>
{/if}
