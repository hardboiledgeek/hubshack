<script lang="ts">
  import OnAirPanelViewModel from './on-air-panel-view-model.svelte'

  const viewModel = new OnAirPanelViewModel()

  function onToggle() {
    viewModel.toggle()
  }
</script>

<div
  class="flex h-full w-full items-center justify-center rounded-xs border-2 border-t-black border-l-black border-b-white/15 border-r-white/15 bg-black/60 p-3"
>
  <button
    type="button"
    onclick={onToggle}
    aria-pressed={viewModel.onAir}
    class="flex h-full w-full cursor-pointer items-center justify-center rounded-xs font-mono text-4xl font-bold tracking-[0.3em] text-white {viewModel.onAir
      ? 'bg-red-700 shadow-[0_0_16px_rgba(185,28,28,0.55)]'
      : 'bg-green-700 shadow-[0_0_20px_rgba(21,128,61,0.6)]'}"
  >
    ON AIR
  </button>
</div>
