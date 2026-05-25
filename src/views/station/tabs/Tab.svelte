<script lang="ts">
  import { fetchViewModel, type BenchTab } from './tabs-pane-view-model.svelte'
  import TabMenu from './TabMenu.svelte'
  import ChevronIcon from '@components/icons/ChevronIcon.svelte'
  import InlineEdit from '@components/InlineEdit.svelte'

  let { tab }: { tab: BenchTab } = $props()

  const viewModel = fetchViewModel()

  function onActivate() {
    viewModel.setActiveBench(tab.id)
  }

  function onCommitRename(name: string) {
    viewModel.commitRename(tab.id, name)
  }

  function onCancelRename() {
    viewModel.cancelRename()
  }

  function onToggleMenu(event: MouseEvent) {
    event.stopPropagation()
    viewModel.toggleMenu(tab.id)
  }

  function onCloseMenu() {
    viewModel.closeMenu()
  }

  const tabGlow = $derived(
    tab.active ? 'bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.2),_transparent_60%)]' : ''
  )
  const labelColor = $derived(
    tab.active ? 'text-amber-200 [text-shadow:0_0_6px_rgba(245,158,11,0.6)]' : 'text-amber-500/70 hover:text-amber-300'
  )
</script>

<div role="tab" aria-selected={tab.active} class="relative flex items-center">
  {#if tab.editing}
    <InlineEdit
      value={tab.name}
      onCommit={onCommitRename}
      onCancel={onCancelRename}
      class="border-none bg-transparent pl-4 pr-2 py-2.5 font-mono text-xs uppercase tracking-[0.3em] text-amber-200 outline-none {tabGlow}"
    />
  {:else}
    <button
      type="button"
      onclick={onActivate}
      class="cursor-pointer pl-4 pr-2 py-2.5 font-mono text-xs uppercase tracking-[0.3em] {tabGlow} {labelColor}"
    >
      {tab.name}
    </button>
  {/if}

  <!-- onmousedown, not onclick: TabMenu's dismisser listens on mousedown, so a
       click outside dismisses on press. If this opener used onclick, the click
       would bubble to document before onclick fires, the dismisser would see
       "outside the not-yet-mounted popover," and the menu would close on open. -->
  <button
    type="button"
    aria-label="Bench menu"
    onmousedown={onToggleMenu}
    class="mr-1 flex cursor-pointer items-center justify-center rounded-xs py-1 pr-1 text-amber-500/70 hover:text-amber-300"
  >
    <ChevronIcon class="h-3 w-3" direction="down" />
  </button>

  {#if tab.menuOpen}
    <TabMenu tabId={tab.id} onClose={onCloseMenu} class="left-0 top-full mt-1" />
  {/if}
</div>
