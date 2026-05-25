<script lang="ts">
  import DevicesPaneViewModel from './devices-pane-view-model.svelte'
  import PlusIcon from '@components/icons/PlusIcon.svelte'

  const viewModel = new DevicesPaneViewModel()

  function onAddDevice() {
    viewModel.addDevice()
  }
</script>

<section class="flex flex-col gap-2 border border-white/10 p-4">
  <h2 class="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-500/70">Devices</h2>

  {#if viewModel.devices.length === 0}
    <p class="font-sans text-sm text-neutral-400">No devices yet.</p>
  {:else}
    <ul class="flex flex-col">
      {#each viewModel.devices as device (device.id)}
        {@const DeviceIcon = device.icon}
        <li class="flex items-center gap-2 rounded-xs px-2 py-1 hover:bg-white/5">
          <DeviceIcon class="h-5 w-5 shrink-0 text-amber-500/70" />
          <span class="font-sans text-base text-neutral-200">{device.name}</span>
        </li>
      {/each}
    </ul>
  {/if}

  <button
    type="button"
    onclick={onAddDevice}
    class="mt-2 flex cursor-pointer items-center gap-2 self-start rounded-xs border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300 hover:bg-amber-500/20 hover:text-amber-200"
  >
    <PlusIcon class="h-3 w-3" />
    Add device
  </button>
</section>
