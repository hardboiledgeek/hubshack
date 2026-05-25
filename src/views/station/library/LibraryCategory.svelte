<script lang="ts">
  import type { PanelCategory } from './library-pane-view-model.svelte'
  import CategoryHeader from './CategoryHeader.svelte'
  import CategoryList from './CategoryList.svelte'

  type Props = {
    category: PanelCategory
    expanded: boolean
    onToggle: () => void
  }

  let { category, expanded, onToggle }: Props = $props()
</script>

<div class="flex flex-col">
  <CategoryHeader {expanded} {onToggle}>{category.name}</CategoryHeader>
  {#if expanded}
    <CategoryList panels={category.panels} />
  {/if}
</div>
