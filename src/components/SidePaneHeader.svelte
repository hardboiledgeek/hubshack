<script lang="ts">
  import type { Snippet } from 'svelte'
  import Caption from './Caption.svelte'

  type Props = {
    children: Snippet
    actions?: Snippet
  }

  let { children, actions }: Props = $props()
</script>

<div class="flex items-center justify-between">
  <Caption tone="amber">{@render children()}</Caption>
  {#if actions}
    <div class="flex items-center">{@render actions()}</div>
  {/if}
</div>
