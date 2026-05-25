<script lang="ts">
  import TabsPaneViewModel, { registerViewModel } from './tabs-pane-view-model.svelte'
  import Tab from './Tab.svelte'
  import PlusIcon from '@components/icons/PlusIcon.svelte'

  let { class: className = '' }: { class?: string } = $props()

  const viewModel = new TabsPaneViewModel()
  registerViewModel(viewModel)

  function onAddBench() {
    viewModel.addBench()
  }
</script>

<div role="tablist" aria-label="Benches" class="flex items-center gap-1 border border-white/10 px-4 {className}">
  {#each viewModel.tabs as tab (tab.id)}
    <Tab {tab} />
  {/each}
  <button
    type="button"
    aria-label="New bench"
    onclick={onAddBench}
    class="ml-1 flex cursor-pointer items-center justify-center rounded-xs p-1.5 text-amber-500/70 hover:bg-amber-500/10 hover:text-amber-200"
  >
    <PlusIcon class="h-4 w-4" />
  </button>
</div>
