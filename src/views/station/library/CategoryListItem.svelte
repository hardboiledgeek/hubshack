<script lang="ts">
  import { fetchViewModel, type LibraryPanel } from './library-pane-view-model.svelte'
  import PlusIcon from '@components/icons/PlusIcon.svelte'

  type Props = {
    panel: LibraryPanel
  }

  let { panel }: Props = $props()

  const viewModel = fetchViewModel()
  const PanelIcon = $derived(panel.icon)

  function onAddClick() {
    viewModel.addToBench(panel.id)
  }
</script>

<li class="flex items-center gap-2 rounded-xs px-2 py-1 hover:bg-white/5">
  <PanelIcon class="h-5 w-5 shrink-0 text-amber-500/70" />
  <span class="flex-1 font-sans text-base text-neutral-200">{panel.name}</span>
  <button
    type="button"
    aria-label="Add {panel.name} to bench"
    onclick={onAddClick}
    disabled={!viewModel.canAddToBench}
    class="flex shrink-0 cursor-pointer items-center justify-center rounded-xs p-1 text-amber-500/70 hover:bg-amber-500/10 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-amber-500/70"
  >
    <PlusIcon class="h-4 w-4" />
  </button>
</li>
