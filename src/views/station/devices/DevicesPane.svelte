<script lang="ts">
  import DevicesPaneViewModel from './devices-pane-view-model.svelte'
  import SidePane from '@components/SidePane.svelte'
  import SidePaneHeader from '@components/SidePaneHeader.svelte'
  import IconButton from '@components/IconButton.svelte'
  import PlusIcon from '@components/icons/PlusIcon.svelte'

  const viewModel = new DevicesPaneViewModel()

  function onAddDevice() {
    viewModel.addDevice()
  }
</script>

<SidePane>
  <SidePaneHeader>
    Devices
    {#snippet actions()}
      <IconButton icon={PlusIcon} label="Add device" onclick={onAddDevice} />
    {/snippet}
  </SidePaneHeader>

  {#if viewModel.devices.length === 0}
    <p class="font-sans text-sm text-stone-400">No devices yet.</p>
  {:else}
    <ul class="flex flex-col">
      {#each viewModel.devices as device (device.id)}
        {@const DeviceIcon = device.icon}
        <li class="flex items-center gap-2 rounded-xs px-2 py-1 hover:bg-white/5">
          <DeviceIcon class="h-5 w-5 shrink-0 text-amber-300 drop-shadow-[0_0_3px_rgba(245,158,11,0.5)]" />
          <span class="font-sans text-base text-stone-200">{device.name}</span>
        </li>
      {/each}
    </ul>
  {/if}
</SidePane>
