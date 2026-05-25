<script lang="ts">
  import type { Snippet } from 'svelte'

  let { children }: { children: Snippet } = $props()
</script>

<h2 class="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-500/70">{@render children()}</h2>
