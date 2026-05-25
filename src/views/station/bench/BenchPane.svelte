<script lang="ts">
  import BenchPaneViewModel from './bench-pane-view-model.svelte'

  type Props = {
    class?: string
  }

  let { class: className = '' }: Props = $props()

  const viewModel = new BenchPaneViewModel()
</script>

<section class="flex flex-wrap content-start gap-4 overflow-auto border border-white/10 p-6 {className}">
  {#each viewModel.instances as instance (instance.id)}
    {@const PanelComponent = instance.component}
    <article
      class="flex h-40 min-w-[14rem] flex-[1_1_14rem] flex-col rounded-xs border-2 border-t-white/15 border-l-white/15 border-b-black border-r-black bg-gradient-to-br from-white/5 to-black/40 p-4 shadow-md shadow-black/40"
    >
      <div class="flex flex-1 items-center justify-center">
        {#if PanelComponent}
          <PanelComponent />
        {/if}
      </div>
    </article>
  {/each}
</section>
