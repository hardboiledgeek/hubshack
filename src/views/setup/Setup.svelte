<script lang="ts">
  import SetupViewModel from './setup-view-model.svelte'
  import Wordmark from '@components/Wordmark.svelte'
  import PrimaryButton from '@components/PrimaryButton.svelte'
  import TextInput from '@components/TextInput.svelte'
  import Caption from '@components/Caption.svelte'

  const viewModel = new SetupViewModel()

  function onSubmit(event: SubmitEvent) {
    event.preventDefault()
    viewModel.submit()
  }
</script>

<main class="flex min-h-screen flex-col items-center justify-center gap-10 p-6">
  <header>
    <Wordmark size="md" />
  </header>

  <p class="max-w-md text-center font-sans text-xl text-neutral-200">Enter your details to get started.</p>

  <form class="flex w-full max-w-md flex-col gap-6" onsubmit={onSubmit}>
    <label class="flex flex-col gap-1.5">
      <Caption>Your Callsign</Caption>
      <TextInput bind:value={viewModel.callsign} placeholder="N0CALL" autofocus class="uppercase tracking-wider" />
    </label>

    <label class="flex flex-col gap-1.5">
      <Caption>Operator Name</Caption>
      <TextInput bind:value={viewModel.operator} placeholder="Guglielmo Marconi" />
    </label>

    <label class="flex flex-col gap-1.5">
      <Caption>Station Name</Caption>
      <TextInput bind:value={viewModel.station} placeholder="Home, Field, Clubhouse, etc." />
    </label>

    <PrimaryButton type="submit" disabled={!viewModel.canSubmit} class="mt-2">
      {viewModel.submitting ? 'Saving…' : 'Get Started'}
    </PrimaryButton>
  </form>
</main>
