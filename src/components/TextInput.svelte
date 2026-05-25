<script lang="ts">
  type Props = {
    value: string
    placeholder?: string
    autofocus?: boolean
    class?: string
  }

  let { value = $bindable(), placeholder = '', autofocus = false, class: className = '' }: Props = $props()

  const SHAPE = 'rounded-xs border border-white/10 px-3 py-2'
  const SURFACE = 'bg-black/40 ring-1 ring-inset ring-black/40'
  const TYPOGRAPHY = 'font-mono text-amber-200'
  const PLACEHOLDER = 'placeholder:text-stone-600'
  const FOCUS = 'outline-none focus:border-amber-500/50 focus:ring-amber-500/30'

  function focusOnMount(node: HTMLInputElement, enabled: boolean) {
    if (enabled) node.focus()
  }
</script>

<input
  bind:value
  {placeholder}
  use:focusOnMount={autofocus}
  class="{SHAPE} {SURFACE} {TYPOGRAPHY} {PLACEHOLDER} {FOCUS} {className}"
/>
