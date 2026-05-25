<script lang="ts">
  import { dndzone } from 'svelte-dnd-action'
  import LibraryPaneViewModel, { type LibraryPanel } from './library-pane-view-model.svelte'
  import ChevronIcon from '@components/icons/ChevronIcon.svelte'

  let { class: className = '' }: { class?: string } = $props()

  const viewModel = new LibraryPaneViewModel()

  function onToggle() {
    viewModel.toggle()
  }

  function onConsider(e: CustomEvent<{ items: LibraryPanel[] }>) {
    viewModel.setRows(e.detail.items)
  }

  function onFinalize() {
    viewModel.restore()
  }

  function transformDraggedElement(el?: HTMLElement) {
    if (!el) return
    const span = el.querySelector('span')
    if (span) span.style.display = 'none'
    const svg = el.querySelector('svg')
    if (svg) {
      svg.classList.remove('h-5', 'w-5')
      svg.classList.add('h-10', 'w-10')
    }
    el.style.background = 'transparent'
    el.style.border = 'none'
    el.style.padding = '0'
  }
</script>

<section class="flex flex-col overflow-hidden border border-white/10 {className}">
  <button
    type="button"
    onclick={onToggle}
    aria-expanded={!viewModel.collapsed}
    aria-controls="panel-library-content"
    class="flex cursor-pointer items-center justify-between p-4 text-left hover:bg-white/5"
  >
    <h2 class="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-500/70">Panel Library</h2>
    <ChevronIcon class="h-4 w-4 text-amber-500/70" direction={viewModel.collapsed ? 'right' : 'down'} />
  </button>

  {#if !viewModel.collapsed}
    <ul
      id="panel-library-content"
      class="flex flex-col overflow-y-auto px-4 pb-4"
      use:dndzone={{ items: viewModel.rows, type: 'panel', dropFromOthersDisabled: true, flipDurationMs: 150, dropTargetStyle: {}, transformDraggedElement }}
      onconsider={onConsider}
      onfinalize={onFinalize}
    >
      {#each viewModel.rows as panel (panel.id)}
        {@const PanelIcon = panel.icon}
        <li class="flex cursor-grab items-center gap-2 rounded-xs px-2 py-1 hover:bg-white/5">
          <PanelIcon class="h-5 w-5 shrink-0 text-amber-500/70" />
          <span class="font-sans text-base text-neutral-200">{panel.name}</span>
        </li>
      {/each}
    </ul>
  {/if}
</section>
