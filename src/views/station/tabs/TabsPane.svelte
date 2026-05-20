<script lang="ts">
  import TabsPaneViewModel from './tabs-pane-view-model.svelte'
  import PlusIcon from '@components/PlusIcon.svelte'

  let { class: className = '' }: { class?: string } = $props()

  const viewModel = new TabsPaneViewModel()

  $effect(() => {
    viewModel.start()
    return () => viewModel.stop()
  })
</script>

<nav class="flex items-center gap-1 border border-white/10 px-4 {className}">
  {#each viewModel.benches as bench (bench.id)}
    {@const active = bench.id === viewModel.activeBenchId}
    <button
      type="button"
      onclick={() => (viewModel.activeBenchId = bench.id)}
      class="cursor-pointer border-b-2 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.2em] {active
        ? 'border-amber-400 text-amber-200'
        : 'border-transparent text-amber-500/60 hover:text-amber-300'}"
    >
      {bench.name}
    </button>
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
