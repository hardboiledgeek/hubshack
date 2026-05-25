<script lang="ts">
  import CallsignPanelViewModel from './callsign-panel-view-model.svelte'

  const viewModel = new CallsignPanelViewModel()
</script>

<div class="font-digits text-5xl tracking-[0.2em] text-amber-300">{viewModel.callsign}</div>
