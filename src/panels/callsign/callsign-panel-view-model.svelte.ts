import { fetchAppState } from '@app/app-state.svelte'

export default class CallsignPanelViewModel {
  #appState = fetchAppState()

  callsign = $derived(this.#appState.currentUser?.callsign ?? '')
}
