<script lang="ts">
  import type { Snippet } from 'svelte'

  const SHAPE = 'rounded-xs border border-transparent px-4 py-2.5'
  const TYPOGRAPHY = 'font-mono text-sm uppercase tracking-[0.3em]'
  const RESTING = 'cursor-pointer bg-amber-500 text-black'
  const HOVER = 'hover:shadow-[0_0_12px_rgba(245,158,11,0.5)]'
  const DISABLED =
    'disabled:cursor-not-allowed disabled:border-stone-700 disabled:bg-transparent disabled:text-stone-500 disabled:shadow-none'

  type Props = {
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    onclick?: (event: MouseEvent) => void
    class?: string
    children: Snippet
  }

  let { type = 'button', disabled = false, onclick, class: className = '', children }: Props = $props()
</script>

<button {type} {disabled} {onclick} class="{SHAPE} {TYPOGRAPHY} {RESTING} {HOVER} {DISABLED} {className}">
  {@render children()}
</button>
