<script lang="ts">
  import LibraryPaneViewModel from './library-pane-view-model.svelte'
  import LibraryCategory from './LibraryCategory.svelte'
  import SidePane from '@components/SidePane.svelte'
  import SidePaneHeader from '@components/SidePaneHeader.svelte'

  let { class: className = '' }: { class?: string } = $props()

  const viewModel = new LibraryPaneViewModel()
</script>

<SidePane class="overflow-hidden min-h-0 {className}">
  <SidePaneHeader>Panel Library</SidePaneHeader>
  <div class="flex flex-col gap-3 overflow-y-auto">
    {#each viewModel.categories as category (category.name)}
      <LibraryCategory
        {category}
        expanded={viewModel.isCategoryExpanded(category.name)}
        onToggle={() => viewModel.toggleCategory(category.name)}
      />
    {/each}
  </div>
</SidePane>
