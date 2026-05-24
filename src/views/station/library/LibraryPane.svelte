<script lang="ts">
  import LibraryPaneViewModel from './library-pane-view-model.svelte'
  import ChevronIcon from '@components/ChevronIcon.svelte'

  let { class: className = '' }: { class?: string } = $props()

  const viewModel = new LibraryPaneViewModel()
</script>

<section class="flex flex-col overflow-hidden border border-white/10 {className}">
  <button
    type="button"
    onclick={() => viewModel.toggle()}
    class="flex cursor-pointer items-center justify-between p-4 text-left hover:bg-white/5"
  >
    <h2 class="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-500/70">Panel Library</h2>
    <ChevronIcon class="h-4 w-4 text-amber-500/70" direction={viewModel.collapsed ? 'right' : 'down'} />
  </button>

  {#if !viewModel.collapsed}
    <div class="flex flex-col gap-3 overflow-y-auto px-4 pb-4">
      {#each viewModel.categories as group (group.category)}
        <div class="flex flex-col gap-1">
          <h3 class="font-mono text-[9px] uppercase tracking-[0.3em] text-amber-500/50">{group.category}</h3>
          <ul class="flex flex-col">
            {#each group.types as type (type.id)}
              <li class="cursor-grab rounded-xs px-2 py-1 font-sans text-sm text-neutral-200 hover:bg-white/5">
                {type.name}
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
  {/if}
</section>
