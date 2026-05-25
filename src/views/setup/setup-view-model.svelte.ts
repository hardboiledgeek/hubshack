import { appRouter } from '@app/app-router.svelte'
import { fetchAppState } from '@app/app-state.svelte'
import User from '@domain/user'
import Station from '@domain/station'
import Bench from '@domain/bench'

export default class SetupViewModel {
  callsign = $state('')
  operator = $state('')
  station = $state('')
  #submitting = $state(false)
  #appState = fetchAppState()

  get submitting(): boolean {
    return this.#submitting
  }

  get canSubmit(): boolean {
    return !this.#submitting && this.callsign.trim() !== '' && this.operator.trim() !== '' && this.station.trim() !== ''
  }

  async submit(): Promise<void> {
    if (!this.canSubmit) return
    this.#submitting = true
    try {
      const user = await User.create(this.callsign.trim(), this.operator.trim())
      this.#appState.currentUser = user

      const station = await Station.create(user, this.station.trim())
      const bench = await Bench.create(station, 'Main')
      await bench.activate()
      this.#appState.currentStation = station

      appRouter.routeToStation()
    } finally {
      this.#submitting = false
    }
  }
}
