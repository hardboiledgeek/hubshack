<script lang="ts">
  import { dndzone } from 'svelte-dnd-action'
  import BenchPaneViewModel, { type BenchInstance } from './bench-pane-view-model.svelte'

  type Props = {
    class?: string
  }

  let { class: className = '' }: Props = $props()

  const viewModel = new BenchPaneViewModel()

  function onConsider(e: CustomEvent<{ items: BenchInstance[] }>) {
    viewModel.consider(e.detail.items)
  }

  function onFinalize(e: CustomEvent<{ items: BenchInstance[] }>) {
    viewModel.finalize(e.detail.items)
  }
</script>

<section
  class="flex flex-wrap content-start gap-4 overflow-auto border border-white/10 p-6 {className}"
  use:dndzone={{ items: viewModel.instances, type: 'panel', flipDurationMs: 150, dropTargetStyle: {} }}
  onconsider={onConsider}
  onfinalize={onFinalize}
>
  {#each viewModel.instances as instance (instance.id)}
    {@const PanelComponent = instance.component}
    <article
      class="flex h-40 min-w-[14rem] flex-[1_1_14rem] flex-col rounded-xs border border-white/10 bg-black/30 p-4 shadow-md shadow-black/40 ring-1 ring-inset ring-black/40"
    >
      <header class="flex items-baseline justify-between">
        <h3 class="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-500/70">{instance.name}</h3>
      </header>
      <div class="flex flex-1 items-center justify-center">
        {#if PanelComponent}
          <PanelComponent />
        {/if}
      </div>
    </article>
  {/each}
</section>
