import User from '@domain/user'
import Station from '@domain/station'
import type { Unsubscribe } from '@domain/types'

const CURRENT_USER_KEY = 'hubshack:current-user-id'
const CURRENT_STATION_KEY = 'hubshack:current-station-id'

class AppState {
  #currentUserId = $state<string | null>(localStorage.getItem(CURRENT_USER_KEY))
  #currentUser = $state<User | null>(null)
  #userLoaded = $state(false)

  #currentStationId = $state<string | null>(localStorage.getItem(CURRENT_STATION_KEY))
  #currentStation = $state<Station | null>(null)
  #stationLoaded = $state(false)

  #stopWatchingUser: Unsubscribe | null = null
  #stopWatchingStation: Unsubscribe | null = null

  constructor() {
    this.#watchUser(this.#currentUserId)
    this.#watchStation(this.#currentStationId)
  }

  get currentUser(): User | null {
    return this.#currentUser
  }

  set currentUser(user: User) {
    this.#currentUserId = user.id
    localStorage.setItem(CURRENT_USER_KEY, user.id)
    this.#watchUser(user.id)
  }

  get currentStation(): Station | null {
    return this.#currentStation
  }

  set currentStation(station: Station) {
    this.#currentStationId = station.id
    localStorage.setItem(CURRENT_STATION_KEY, station.id)
    this.#watchStation(station.id)
  }

  get loading(): boolean {
    return !this.#userLoaded || !this.#stationLoaded
  }

  get isSetup(): boolean {
    return !!this.#currentUser && !!this.#currentStation
  }

  #watchUser(id: string | null): void {
    this.#stopWatchingUser?.()

    if (id) {
      this.#userLoaded = false
      this.#stopWatchingUser = User.watch(id, user => {
        this.#currentUser = user
        this.#userLoaded = true
      })
    } else {
      this.#currentUser = null
      this.#userLoaded = true
    }
  }

  #watchStation(id: string | null): void {
    this.#stopWatchingStation?.()

    if (id) {
      this.#stationLoaded = false
      this.#stopWatchingStation = Station.watch(id, station => {
        this.#currentStation = station
        this.#stationLoaded = true
      })
    } else {
      this.#currentStation = null
      this.#stationLoaded = true
    }
  }
}

export const appState = new AppState()
