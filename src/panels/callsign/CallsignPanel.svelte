<script lang="ts">
  import CallsignPanelViewModel from './callsign-panel-view-model.svelte'

  const viewModel = new CallsignPanelViewModel()
</script>

<div class="text-2xl font-mono tracking-wider">{viewModel.callsign}</div>
