<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    children,
    class: className = ''
  }: {
    children: Snippet
    class?: string
  } = $props()
</script>

<section class="flex flex-col gap-3 border border-white/10 p-4 {className}">
  {@render children()}
</section>
