<script lang="ts">
  import type { LibraryPanel } from './library-pane-view-model.svelte'
  import CategoryListItem from './CategoryListItem.svelte'

  type Props = {
    panels: LibraryPanel[]
  }

  let { panels }: Props = $props()
</script>

<ul class="flex flex-col">
  {#each panels as panel (panel.id)}
    <CategoryListItem {panel} />
  {/each}
</ul>
