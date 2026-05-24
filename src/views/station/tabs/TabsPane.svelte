<script lang="ts">
  import TabsPaneViewModel from './tabs-pane-view-model.svelte'
  import TabMenu from './TabMenu.svelte'
  import PlusIcon from '@components/PlusIcon.svelte'
  import ChevronIcon from '@components/ChevronIcon.svelte'
  import InlineEdit from '@components/InlineEdit.svelte'

  let { class: className = '' }: { class?: string } = $props()

  const viewModel = new TabsPaneViewModel()
</script>

<nav class="flex items-center gap-1 border border-white/10 px-4 {className}">
  {#each viewModel.benches as bench (bench.id)}
    {@const active = bench.id === viewModel.activeBenchId}
    {@const editing = bench.id === viewModel.editingBenchId}
    {@const menuOpen = bench.id === viewModel.menuOpenBenchId}
    <div class="relative flex items-center border-b-2 {active ? 'border-amber-400' : 'border-transparent'}">
      {#if editing}
        <InlineEdit
          value={bench.name}
          onCommit={name => viewModel.commitRename(bench.id, name)}
          onCancel={() => viewModel.cancelRename()}
          class="border-none bg-transparent px-4 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-amber-200 outline-none"
        />
      {:else}
        <button
          type="button"
          onclick={() => viewModel.setActiveBench(bench.id)}
          class="cursor-pointer px-4 py-2.5 font-mono text-xs uppercase tracking-[0.2em] {active
            ? 'text-amber-200'
            : 'text-amber-500/60 hover:text-amber-300'}"
        >
          {bench.name}
        </button>
        {#if active}
          <button
            type="button"
            aria-label="Bench menu"
            onclick={() => viewModel.openMenu(bench.id)}
            class="mr-1 flex cursor-pointer items-center justify-center rounded-xs p-1 text-amber-500/70 hover:bg-amber-500/10 hover:text-amber-200"
          >
            <ChevronIcon class="h-3 w-3" direction="down" />
          </button>
          {#if menuOpen}
            <TabMenu
              onClose={() => viewModel.closeMenu()}
              items={[{ label: 'Rename', onSelect: () => viewModel.beginRename(bench.id) }]}
              class="left-0 top-full mt-1"
            />
          {/if}
        {/if}
      {/if}
    </div>
  {/each}
  <button
    type="button"
    aria-label="New bench"
    onclick={() => viewModel.addBench()}
    class="ml-1 flex cursor-pointer items-center justify-center rounded-xs p-1.5 text-amber-500/70 hover:bg-amber-500/10 hover:text-amber-200"
  >
    <PlusIcon class="h-4 w-4" />
  </button>
</nav>
