import { hubshackDB } from '@domain/database'
import Entity from '@domain/entity'
import User from '@domain/user'
import Bench from '@domain/bench'
import type { Unsubscribe } from '@domain/types'
import type { SubscriptionCallback } from '@domain/entity-observer'

export type StationCallback = SubscriptionCallback<Station | null>
export type StationsCallback = SubscriptionCallback<Station[]>

export default class Station extends Entity {
  #userId: string
  #stationName: string
  #activeBenchId: string | null

  private constructor(id: string, userId: string, stationName: string, activeBenchId: string | null) {
    super(id)
    this.#userId = userId
    this.#stationName = stationName
    this.#activeBenchId = activeBenchId
  }

  get stationName(): string {
    return this.#stationName
  }

  set stationName(value: string) {
    this.#stationName = value
  }

  get activeBenchId(): string | null {
    return this.#activeBenchId
  }

  set activeBenchId(value: string | null) {
    this.#activeBenchId = value
  }

  async activeBench(): Promise<Bench | null> {
    if (this.#activeBenchId === null) return null
    return Bench.fetch(this.#activeBenchId)
  }

  setActiveBench(bench: Bench | null): void {
    this.#activeBenchId = bench === null ? null : bench.id
  }

  async user(): Promise<User> {
    const user = await User.fetch(this.#userId)
    if (!user) throw new Error(`Station ${this.id} references missing user ${this.#userId}`)
    return user
  }

  static async create(user: User, stationName: string): Promise<Station> {
    const station = new Station(Entity.generateId(), user.id, stationName, null)
    await station.save()
    return station
  }

  static async fetch(id: string): Promise<Station | null> {
    const row = await hubshackDB.stations.get(id)
    return row ? new Station(row.id, row.userId, row.stationName, row.activeBenchId) : null
  }

  static async fetchForUser(user: User): Promise<Station[]> {
    const rows = await hubshackDB.stations.where('userId').equals(user.id).toArray()
    return rows.map(row => new Station(row.id, row.userId, row.stationName, row.activeBenchId))
  }

  static watch(id: string, callback: StationCallback): Unsubscribe {
    return this.observe<Station | null>(`single:${id}`, () => Station.fetch(id)).subscribe(callback)
  }

  static watchForUser(user: User, callback: StationsCallback): Unsubscribe {
    return this.observe<Station[]>(`by-user:${user.id}`, () => Station.fetchForUser(user)).subscribe(callback)
  }

  async save(): Promise<void> {
    await hubshackDB.stations.put({
      id: this.id,
      userId: this.#userId,
      stationName: this.stationName,
      activeBenchId: this.#activeBenchId
    })
  }
}
