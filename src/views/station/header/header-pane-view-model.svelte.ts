import { fetchAppState } from '@app/app-state.svelte'

const PLACEHOLDER = '—'

export default class HeaderPaneViewModel {
  #appState = fetchAppState()

  callsign = $derived(this.#appState.currentUser?.callsign ?? PLACEHOLDER)
  stationName = $derived(this.#appState.currentStation?.stationName ?? PLACEHOLDER)
}
