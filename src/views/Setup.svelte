<script lang="ts">
  import { appRouter } from '@app/app-router.svelte'
  import { appState } from '@app/app-state.svelte'
  import User from '@domain/user'
  import Station from '@domain/station'

  let callsign = $state('N0CALL')
  let userName = $state('New Operator')
  let stationName = $state('Home Station')
  let submitting = $state(false)

  const canSubmit = $derived(
    !submitting &&
      callsign.trim() !== '' &&
      userName.trim() !== '' &&
      stationName.trim() !== ''
  )

  async function submit() {
    if (!canSubmit) return
    submitting = true
    try {
      const user = await User.create(callsign.trim(), userName.trim())
      const station = await Station.create(user, stationName.trim())
      appState.currentUser = user
      appState.currentStation = station
      appRouter.routeToStation()
    } finally {
      submitting = false
    }
  }
</script>

<h1>Welcome to Hubshack</h1>
<p>Let's get your shack set up.</p>

<label>
  Callsign
  <input bind:value={callsign} />
</label>

<label>
  Your name
  <input bind:value={userName} />
</label>

<label>
  Station name
  <input bind:value={stationName} />
</label>

<button disabled={!canSubmit} onclick={submit}>
  {submitting ? 'Saving…' : 'Get on the air'}
</button>
