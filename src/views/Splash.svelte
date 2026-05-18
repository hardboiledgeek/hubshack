<script lang="ts">
  import { appRouter } from '@app/app-router.svelte'
  import { appState } from '@app/app-state.svelte'

  $effect(() => {
    if (appState.loading) return
    if (appState.isSetup) {
      appRouter.routeToStation()
    } else {
      appRouter.routeToSetup()
    }
  })
</script>

<h1>Hubshack</h1>
<p>Loading…</p>
