<script lang="ts">
  import { fetchViewModel, type LibraryPanel } from './library-pane-view-model.svelte'
  import PlusIcon from '@components/icons/PlusIcon.svelte'
  import IconButton from '@components/IconButton.svelte'

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

<li class="flex items-center gap-2 rounded-xs py-1 pl-2 pr-6 hover:bg-white/5">
  <PanelIcon class="h-5 w-5 shrink-0 text-amber-300 drop-shadow-[0_0_3px_rgba(245,158,11,0.5)]" />
  <span class="flex-1 font-sans text-base text-stone-200">{panel.name}</span>
  <IconButton
    icon={PlusIcon}
    label="Add {panel.name} to bench"
    onclick={onAddClick}
    disabled={!viewModel.canAddToBench}
    class="shrink-0"
  />
</li>
