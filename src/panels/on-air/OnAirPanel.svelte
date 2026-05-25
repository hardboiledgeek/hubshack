<script lang="ts">
  import OnAirPanelViewModel from './on-air-panel-view-model.svelte'

  const viewModel = new OnAirPanelViewModel()

  function onToggle() {
    viewModel.toggle()
  }
</script>

<button
  type="button"
  onclick={onToggle}
  aria-pressed={viewModel.onAir}
  class="cursor-pointer rounded-xs px-4 py-2 font-mono text-lg font-bold tracking-[0.3em] {viewModel.onAir
    ? 'bg-red-600 text-white'
    : 'bg-neutral-800 text-neutral-500'}"
>
  ON AIR
</button>
