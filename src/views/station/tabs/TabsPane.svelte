<script lang="ts">
  import TabsPaneViewModel, { registerViewModel } from './tabs-pane-view-model.svelte'
  import Tab from './Tab.svelte'
  import PlusIcon from '@components/icons/PlusIcon.svelte'
  import IconButton from '@components/IconButton.svelte'

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
  <IconButton icon={PlusIcon} label="New bench" onclick={onAddBench} class="ml-1" />
</div>
