<script lang="ts">
  import BenchPaneViewModel from './bench-pane-view-model.svelte'

  type Props = {
    class?: string
  }

  let { class: className = '' }: Props = $props()

  const viewModel = new BenchPaneViewModel()
</script>

<section class="flex flex-wrap content-start gap-4 overflow-auto border border-white/10 p-6 {className}">
  {#each viewModel.panels as panel (panel.id)}
    {@const PanelComponent = panel.component}
    <article
      class="flex h-40 min-w-[14rem] flex-[1_1_14rem] flex-col rounded-xs border border-white/10 bg-black/30 p-4 shadow-md shadow-black/40 ring-1 ring-inset ring-black/40"
    >
      <header class="flex items-baseline justify-between">
        <h3 class="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-500/70">{panel.name}</h3>
      </header>
      <div class="flex flex-1 items-center justify-center">
        <PanelComponent />
      </div>
    </article>
  {/each}
</section>
