<script lang="ts">
  import SetupViewModel from './setup-view-model.svelte'

  const viewModel = new SetupViewModel()

  let callsignInput: HTMLInputElement

  $effect(() => callsignInput.focus())

  function onSubmit(event: SubmitEvent) {
    event.preventDefault()
    viewModel.submit()
  }
</script>

<main class="flex min-h-screen flex-col items-center justify-center gap-10 p-6">
  <header>
    <h1 class="font-brand text-3xl tracking-widest text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">
      Hubshack
    </h1>
  </header>

  <p class="max-w-md text-center font-sans text-xl text-neutral-200">We need a bit of info to get started.</p>

  <form class="flex w-full max-w-md flex-col gap-6" onsubmit={onSubmit}>
    <label class="flex flex-col gap-1.5">
      <span class="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-500/70">Callsign</span>
      <input
        bind:value={viewModel.callsign}
        bind:this={callsignInput}
        placeholder="N0CALL"
        class="rounded-xs border border-white/10 bg-black/40 px-3 py-2 font-mono uppercase tracking-wider text-amber-200 ring-1 ring-inset ring-black/40 outline-none placeholder:text-amber-200/10 focus:border-amber-500/50 focus:ring-amber-500/30"
      />
    </label>

    <label class="flex flex-col gap-1.5">
      <span class="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-500/70">Operator</span>
      <input
        bind:value={viewModel.operator}
        placeholder="Guglielmo Marconi"
        class="rounded-xs border border-white/10 bg-black/40 px-3 py-2 font-mono text-amber-200 ring-1 ring-inset ring-black/40 outline-none placeholder:text-amber-200/10 focus:border-amber-500/50 focus:ring-amber-500/30"
      />
    </label>

    <label class="flex flex-col gap-1.5">
      <span class="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-500/70">Station</span>
      <input
        bind:value={viewModel.station}
        placeholder="Home, Field, Clubhouse, etc."
        class="rounded-xs border border-white/10 bg-black/40 px-3 py-2 font-mono text-amber-200 ring-1 ring-inset ring-black/40 outline-none placeholder:text-amber-200/10 focus:border-amber-500/50 focus:ring-amber-500/30"
      />
    </label>

    <button
      type="submit"
      disabled={!viewModel.canSubmit}
      class="mt-2 cursor-pointer rounded-xs border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 font-mono text-sm uppercase tracking-[0.3em] text-amber-300 hover:bg-amber-500/20 hover:text-amber-200 disabled:cursor-not-allowed disabled:border-neutral-700 disabled:bg-transparent disabled:text-neutral-500"
    >
      {viewModel.submitting ? 'Saving…' : 'Set up your shack'}
    </button>
  </form>
</main>
