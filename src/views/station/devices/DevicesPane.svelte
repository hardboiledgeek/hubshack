<script lang="ts">
  import DevicesPaneViewModel from './devices-pane-view-model.svelte'
  import PlusIcon from '@components/PlusIcon.svelte'

  const viewModel = new DevicesPaneViewModel()
</script>

<section class="flex flex-col gap-2 border border-white/10 p-4">
  <h2 class="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-500/70">Devices</h2>

  {#if viewModel.devices.length === 0}
    <p class="font-sans text-sm text-neutral-400">No devices yet.</p>
  {:else}
    <ul class="flex flex-col gap-1">
      {#each viewModel.devices as device (device.id)}
        <li class="flex flex-col rounded-xs px-2 py-1.5 hover:bg-white/5">
          <span class="font-sans text-sm text-neutral-200">{device.name}</span>
          <span class="font-mono text-[10px] uppercase tracking-wider text-amber-500/50">{device.model}</span>
        </li>
      {/each}
    </ul>
  {/if}

  <button
    type="button"
    onclick={() => viewModel.addDevice()}
    class="mt-2 flex cursor-pointer items-center gap-2 self-start rounded-xs border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300 hover:bg-amber-500/20 hover:text-amber-200"
  >
    <PlusIcon class="h-3 w-3" />
    Add device
  </button>
</section>
