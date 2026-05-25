<script lang="ts">
  import { fetchViewModel } from './tabs-pane-view-model.svelte'

  type Props = {
    tabId: string
    onClose: () => void
    class?: string
  }

  let { tabId, onClose, class: className = '' }: Props = $props()

  const viewModel = fetchViewModel()

  // Canonical dismiss-on-outside-click action. Copy this shape for new popovers.
  // Listens on `mousedown` (not `click`) so dismissal fires on press; any opener
  // button that toggles a popover using this action must use `onmousedown` with
  // `stopPropagation()` — see Tab.svelte for the gotcha.
  function dismissOnInteraction(node: HTMLElement) {
    const onMousedown = (event: MouseEvent) => {
      if (!node.contains(event.target as Node)) onClose()
    }

    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', onMousedown)
    document.addEventListener('keydown', onKeydown)

    return {
      destroy: () => {
        document.removeEventListener('mousedown', onMousedown)
        document.removeEventListener('keydown', onKeydown)
      }
    }
  }

  function onRename() {
    viewModel.beginRename(tabId)
    onClose()
  }
</script>

<div
  role="menu"
  use:dismissOnInteraction
  class="absolute z-10 min-w-32 rounded-xs border border-white/10 bg-black/95 py-1 shadow-lg shadow-black/60 {className}"
>
  <button
    role="menuitem"
    type="button"
    onclick={onRename}
    class="block w-full cursor-pointer px-3 py-1.5 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-amber-300/80 hover:bg-amber-500/10 hover:text-amber-200"
  >
    Rename
  </button>
</div>
