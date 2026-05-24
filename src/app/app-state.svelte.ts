import { getContext, setContext } from 'svelte'
import User from '@domain/user'
import Station from '@domain/station'

const CURRENT_USER_KEY = 'hubshack:current-user-id'
const CURRENT_STATION_KEY = 'hubshack:current-station-id'

const AppStateSymbol = Symbol()

export function registerAppState(appState: AppState): void {
  setContext(AppStateSymbol, appState)
}

export function fetchAppState(): AppState {
  const appState = getContext<AppState | undefined>(AppStateSymbol)
  if (!appState) throw new Error('AppState context not set')
  return appState
}

export default class AppState {
  #currentUserId = $state<string | null>(localStorage.getItem(CURRENT_USER_KEY))
  #currentUser = $state<User | null>(null)
  #userLoaded = $state(false)

  #currentStationId = $state<string | null>(localStorage.getItem(CURRENT_STATION_KEY))
  #currentStation = $state<Station | null>(null)
  #stationLoaded = $state(false)

  constructor() {
    $effect(() => {
      const id = this.#currentUserId
      if (!id) {
        this.#currentUser = null
        this.#userLoaded = true
        return
      }
      this.#userLoaded = false
      return User.watch(id, user => {
        this.#currentUser = user
        this.#userLoaded = true
      })
    })

    $effect(() => {
      const id = this.#currentStationId
      if (!id) {
        this.#currentStation = null
        this.#stationLoaded = true
        return
      }
      this.#stationLoaded = false
      return Station.watch(id, station => {
        this.#currentStation = station
        this.#stationLoaded = true
      })
    })
  }

  get currentUser(): User | null {
    return this.#currentUser
  }

  set currentUser(user: User) {
    localStorage.setItem(CURRENT_USER_KEY, user.id)
    this.#currentUserId = user.id
  }

  get currentStation(): Station | null {
    return this.#currentStation
  }

  set currentStation(station: Station) {
    localStorage.setItem(CURRENT_STATION_KEY, station.id)
    this.#currentStationId = station.id
  }

  get userLoaded(): boolean {
    return this.#userLoaded
  }

  get stationLoaded(): boolean {
    return this.#stationLoaded
  }
}
