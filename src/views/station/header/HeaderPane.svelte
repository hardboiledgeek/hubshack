<script lang="ts">
  import HeaderPaneViewModel from './header-pane-view-model.svelte'
  import GearIcon from '@components/icons/GearIcon.svelte'
  import Wordmark from '@components/Wordmark.svelte'
  import Caption from '@components/Caption.svelte'
  import IconButton from '@components/IconButton.svelte'

  let { class: className = '' }: { class?: string } = $props()

  const viewModel = new HeaderPaneViewModel()
</script>

<header class="grid grid-cols-3 items-center border border-white/10 px-6 py-3 {className}">
  <Wordmark size="sm" />

  <div class="flex items-center justify-center gap-6">
    <Caption tone="bright" size="md">
      Station <span class="ml-2 text-stone-200">{viewModel.stationName}</span>
    </Caption>
    <Caption tone="bright" size="md">
      Operator <span class="ml-2 text-stone-200">{viewModel.callsign}</span>
    </Caption>
  </div>

  <IconButton icon={GearIcon} label="Settings" size="lg" tone="bright" class="justify-self-end" />
</header>
