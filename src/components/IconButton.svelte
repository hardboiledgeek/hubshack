<script lang="ts">
  import type { Component } from 'svelte'

  type Size = 'sm' | 'lg'
  type Tone = 'default' | 'bright'

  type Props = {
    icon: Component<{ class?: string }>
    label: string
    onclick?: (event: MouseEvent) => void
    disabled?: boolean
    size?: Size
    tone?: Tone
    class?: string
  }

  let {
    icon: Icon,
    label,
    onclick,
    disabled = false,
    size = 'sm',
    tone = 'default',
    class: className = ''
  }: Props = $props()

  const PADDING: Record<Size, string> = { sm: 'px-1.5', lg: 'px-2 py-1' }
  const ICON_SIZE: Record<Size, string> = { sm: 'h-4 w-4', lg: 'h-5 w-5' }
  const TONE_RESTING: Record<Tone, string> = { default: 'text-amber-500/70', bright: 'text-amber-300' }
  const TONE_DISABLED_HOVER: Record<Tone, string> = {
    default: 'disabled:hover:text-amber-500/70',
    bright: 'disabled:hover:text-amber-300'
  }

  const HOVER = 'hover:text-amber-200'
  const DISABLED_BASE = 'disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent'

  const shape = $derived(`rounded-xs ${PADDING[size]}`)
  const iconClass = $derived(ICON_SIZE[size])
  const resting = $derived(`cursor-pointer ${TONE_RESTING[tone]}`)
  const disabledClasses = $derived(`${DISABLED_BASE} ${TONE_DISABLED_HOVER[tone]}`)
</script>

<button
  type="button"
  aria-label={label}
  title={label}
  {onclick}
  {disabled}
  class="flex items-center justify-center {shape} {resting} {HOVER} {disabledClasses} {className}"
>
  <Icon class={iconClass} />
</button>
