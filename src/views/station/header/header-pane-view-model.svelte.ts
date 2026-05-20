import { appState } from '@app/app-state.svelte'
import type User from '@domain/user'
import type Station from '@domain/station'

export default class HeaderPaneViewModel {
  start(): void {}
  stop(): void {}

  get user(): User | null {
    return appState.currentUser
  }

  get station(): Station | null {
    return appState.currentStation
  }
}
