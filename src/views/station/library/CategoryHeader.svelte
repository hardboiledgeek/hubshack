<script lang="ts">
  import type { Snippet } from 'svelte'
  import ChevronIcon from '@components/icons/ChevronIcon.svelte'
  import Caption from '@components/Caption.svelte'

  type Props = {
    children: Snippet
    expanded: boolean
    onToggle: () => void
  }

  let { children, expanded, onToggle }: Props = $props()
</script>

<button
  type="button"
  onclick={onToggle}
  aria-expanded={expanded}
  class="flex cursor-pointer items-center justify-between rounded-xs px-2 py-1 text-left hover:bg-white/5"
>
  <Caption tone="amber">{@render children()}</Caption>
  <ChevronIcon class="h-3 w-3 text-amber-500/70" direction={expanded ? 'down' : 'right'} />
</button>
