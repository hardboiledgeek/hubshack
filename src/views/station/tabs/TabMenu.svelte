<script lang="ts">
  interface MenuItem {
    label: string
    onSelect: () => void
  }

  let {
    items,
    onClose,
    class: className = ''
  }: {
    items: MenuItem[]
    onClose: () => void
    class?: string
  } = $props()

  function onOutsideClick(node: HTMLElement) {
    function handle(event: MouseEvent) {
      if (!node.contains(event.target as Node)) onClose()
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    setTimeout(() => document.addEventListener('mousedown', handle), 0)
    document.addEventListener('keydown', onKey)
    return {
      destroy() {
        document.removeEventListener('mousedown', handle)
        document.removeEventListener('keydown', onKey)
      }
    }
  }
</script>

<div
  use:onOutsideClick
  class="absolute z-10 min-w-32 rounded-xs border border-white/10 bg-black/95 py-1 shadow-lg shadow-black/60 {className}"
>
  {#each items as item (item.label)}
    <button
      type="button"
      onclick={() => {
        item.onSelect()
        onClose()
      }}
      class="block w-full cursor-pointer px-3 py-1.5 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-amber-200/80 hover:bg-amber-500/10 hover:text-amber-100"
    >
      {item.label}
    </button>
  {/each}
</div>
