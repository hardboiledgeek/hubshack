<script lang="ts">
  import BenchPaneViewModel from './bench-pane-view-model.svelte'

  let { class: className = '' }: { class?: string } = $props()

  const viewModel = new BenchPaneViewModel()

  $effect(() => {
    viewModel.start()
    return () => viewModel.stop()
  })
</script>

<section class="flex flex-wrap content-start gap-4 overflow-auto border border-white/10 p-6 {className}">
  {#each viewModel.panels as panel (panel.id)}
    <article
      class="flex h-40 flex-col rounded-xs border border-white/10 bg-black/30 p-4 shadow-md shadow-black/40 ring-1 ring-inset ring-black/40 {panel.span ===
      2
        ? 'min-w-[28rem] flex-[2_1_28rem]'
        : 'min-w-[14rem] flex-[1_1_14rem]'}"
    >
      <header class="flex items-baseline justify-between">
        <h3 class="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-500/70">{panel.name}</h3>
      </header>
      <div class="flex flex-1 items-center justify-center font-mono text-xs text-amber-500/30">
        {panel.typeId}
      </div>
    </article>
  {/each}
</section>
