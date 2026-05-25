<script lang="ts">
  import ClockPanelViewModel from './clock-panel-view-model.svelte'

  const viewModel = new ClockPanelViewModel()
</script>

<div class="font-mono text-2xl tracking-wider">{viewModel.time}</div>
