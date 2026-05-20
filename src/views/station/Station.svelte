<script lang="ts">
  import HeaderPane from './header/HeaderPane.svelte'
  import DevicesPane from './devices/DevicesPane.svelte'
  import LibraryPane from './library/LibraryPane.svelte'
  import TabsPane from './tabs/TabsPane.svelte'
  import BenchPane from './bench/BenchPane.svelte'
</script>

<main class="grid h-screen grid-cols-[16rem_1fr] grid-rows-[auto_auto_1fr]">
  <HeaderPane class="col-span-2" />

  <aside class="row-span-2 flex flex-col overflow-hidden">
    <DevicesPane />
    <LibraryPane class="flex-1" />
  </aside>

  <TabsPane />
  <BenchPane class="overflow-auto" />
</main>
