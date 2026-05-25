<script lang="ts">
  import HeaderPaneViewModel from './header-pane-view-model.svelte'
  import GearIcon from '@components/icons/GearIcon.svelte'

  let { class: className = '' }: { class?: string } = $props()

  const viewModel = new HeaderPaneViewModel()
</script>

<header class="flex items-center justify-between border border-white/10 px-6 py-3 {className}">
  <div class="flex items-baseline gap-6">
    <h1 class="font-brand text-xl tracking-widest text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.35)]">
      Hubshack
    </h1>
    <span class="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-500/70">
      Station <span class="ml-2 text-amber-200">{viewModel.stationName}</span>
    </span>
    <span class="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-500/70">
      Op <span class="ml-2 text-amber-200">{viewModel.callsign}</span>
    </span>
  </div>

  <button
    type="button"
    aria-label="Settings"
    class="cursor-pointer rounded-xs p-1.5 text-amber-500/70 hover:bg-amber-500/10 hover:text-amber-200"
  >
    <GearIcon class="h-5 w-5" />
  </button>
</header>
