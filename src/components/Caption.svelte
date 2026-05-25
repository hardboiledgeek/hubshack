<script lang="ts">
  import type { Snippet } from 'svelte'

  type Tone = 'stone' | 'amber' | 'bright'
  type Size = 'sm' | 'md'

  type Props = {
    tone?: Tone
    size?: Size
    class?: string
    children: Snippet
  }

  let { tone = 'stone', size = 'sm', class: className = '', children }: Props = $props()

  const TONE_CLASSES: Record<Tone, string> = {
    stone: 'text-stone-300',
    amber: 'text-amber-500/70',
    bright: 'text-amber-300'
  }

  const SIZE_CLASSES: Record<Size, string> = {
    sm: 'text-xs',
    md: 'text-sm'
  }

  const TYPOGRAPHY = 'font-mono uppercase tracking-[0.3em]'
  const toneClass = $derived(TONE_CLASSES[tone])
  const sizeClass = $derived(SIZE_CLASSES[size])
</script>

<span class="{TYPOGRAPHY} {sizeClass} {toneClass} {className}">{@render children()}</span>
