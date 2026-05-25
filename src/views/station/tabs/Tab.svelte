<script lang="ts">
  import { fetchViewModel, type BenchTab } from './tabs-pane-view-model.svelte'
  import TabMenu from './TabMenu.svelte'
  import ChevronIcon from '@components/icons/ChevronIcon.svelte'
  import InlineEdit from '@components/InlineEdit.svelte'

  let { tab }: { tab: BenchTab } = $props()

  const viewModel = fetchViewModel()

  let menuOpen = $state(false)

  function onActivate() {
    viewModel.setActiveBench(tab.id)
  }

  function onCommitRename(name: string) {
    viewModel.commitRename(tab.id, name)
  }

  function onCancelRename() {
    viewModel.cancelRename()
  }

  function onOpenMenu(event: MouseEvent) {
    event.stopPropagation()
    menuOpen = true
  }

  function onCloseMenu() {
    menuOpen = false
  }

  const borderColor = $derived(tab.active ? 'border-amber-400' : 'border-transparent')
  const labelColor = $derived(tab.active ? 'text-amber-200' : 'text-amber-500/60 hover:text-amber-300')
</script>

<div role="tab" aria-selected={tab.active} class="relative flex items-center border-b-2 {borderColor}">
  {#if tab.editing}
    <InlineEdit
      value={tab.name}
      onCommit={onCommitRename}
      onCancel={onCancelRename}
      class="border-none bg-transparent px-4 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-amber-200 outline-none"
    />
  {:else}
    <button
      type="button"
      onclick={onActivate}
      class="cursor-pointer px-4 py-2.5 font-mono text-xs uppercase tracking-[0.2em] {labelColor}"
    >
      {tab.name}
    </button>
  {/if}

  <button
    type="button"
    aria-label="Bench menu"
    onmousedown={onOpenMenu}
    class="mr-1 flex cursor-pointer items-center justify-center rounded-xs p-1 text-amber-500/70 hover:bg-amber-500/10 hover:text-amber-200"
  >
    <ChevronIcon class="h-3 w-3" direction="down" />
  </button>

  {#if menuOpen}
    <TabMenu tabId={tab.id} onClose={onCloseMenu} class="left-0 top-full mt-1" />
  {/if}
</div>
