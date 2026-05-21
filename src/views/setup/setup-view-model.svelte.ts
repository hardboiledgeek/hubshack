import { appRouter } from '@app/app-router.svelte'
import { appState } from '@app/app-state.svelte'
import User from '@domain/user'
import Station from '@domain/station'
import Bench from '@domain/bench'

export default class SetupViewModel {
  callsign = $state('')
  operator = $state('')
  station = $state('')
  #submitting = $state(false)

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
      appState.currentUser = user

      const station = await Station.create(user, this.station.trim())
      const bench = await Bench.create(station, 'Main')
      station.activeBenchId = bench.id
      await station.save()
      appState.currentStation = station

      appRouter.routeToStation()
    } finally {
      this.#submitting = false
    }
  }
}
