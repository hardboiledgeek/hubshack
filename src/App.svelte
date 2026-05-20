<script lang="ts">
  import { appRouter, Route } from '@app/app-router.svelte'
  import Splash from '@views/splash/Splash.svelte'
  import Setup from '@views/setup/Setup.svelte'
  import Station from '@views/station/Station.svelte'
</script>

{#if appRouter.currentRoute === Route.Splash}
  <Splash />
{:else if appRouter.currentRoute === Route.Setup}
  <Setup />
{:else if appRouter.currentRoute === Route.Station}
  <Station />
{/if}
