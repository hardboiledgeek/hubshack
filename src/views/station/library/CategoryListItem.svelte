<script lang="ts">
  import type { LibraryPanel } from './library-pane-view-model.svelte'

  type Props = {
    panel: LibraryPanel
  }

  let { panel }: Props = $props()

  const PanelIcon = $derived(panel.icon)
</script>

<li class="flex items-center gap-2 rounded-xs px-2 py-1 hover:bg-white/5">
  <PanelIcon class="h-5 w-5 shrink-0 text-amber-500/70" />
  <span class="font-sans text-base text-neutral-200">{panel.name}</span>
</li>
