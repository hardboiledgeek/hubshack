<script lang="ts">
  import ClockPanelViewModel from './clock-panel-view-model.svelte'

  const viewModel = new ClockPanelViewModel()
</script>

<div class="flex items-center gap-3">
  <div class="flex flex-col items-end font-mono text-lg uppercase tracking-[0.2em] text-stone-400">
    <span class="flex h-9 items-center">UTC</span>
    <span class="flex h-9 items-center">{viewModel.localZone}</span>
  </div>
  <div
    class="flex flex-col rounded-xs border-2 border-t-black border-l-black border-b-white/15 border-r-white/15 bg-black/60 px-3 py-2 font-digits text-2xl tracking-[0.2em] text-green-500"
  >
    <span class="flex h-9 items-center">{viewModel.utcTime}</span>
    <span class="flex h-9 items-center">{viewModel.localTime}</span>
  </div>
</div>
