<script lang="ts">
  import SplashViewModel from './splash-view-model.svelte'

  const viewModel = new SplashViewModel()

  $effect(() => {
    if (viewModel.loading) return
    viewModel.routeToNext()
  })
</script>

<main class="flex min-h-screen flex-col items-center justify-center text-amber-400">
  <div class="flex flex-col items-center gap-6">
    <h1 class="font-brand text-6xl tracking-widest text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.45)]">
      Hubshack
    </h1>
    <p class="font-mono text-xs uppercase tracking-[0.4em] text-amber-500/70">{viewModel.tagline}</p>
    <div class="mt-4 flex gap-2" aria-hidden="true">
      <span class="h-2 w-2 animate-pulse rounded-full bg-amber-400 [animation-delay:0ms]"></span>
      <span class="h-2 w-2 animate-pulse rounded-full bg-amber-400 [animation-delay:200ms]"></span>
      <span class="h-2 w-2 animate-pulse rounded-full bg-amber-400 [animation-delay:400ms]"></span>
    </div>
  </div>
</main>
