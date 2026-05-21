import { liveQuery } from 'dexie'
import { hubshackDB } from '@domain/database'
import Entity from '@domain/entity'
import Station from '@domain/station'
import type { Unsubscribe } from '@domain/types'

export default class Bench extends Entity {
  #stationId: string
  #name: string

  private constructor(id: string, stationId: string, name: string) {
    super(id)
    this.#stationId = stationId
    this.#name = name
  }

  get name(): string {
    return this.#name
  }

  set name(value: string) {
    this.#name = value
  }

  async station(): Promise<Station> {
    const station = await Station.fetch(this.#stationId)
    if (!station) throw new Error(`Bench ${this.id} references missing station ${this.#stationId}`)
    return station
  }

  static async create(station: Station, name: string): Promise<Bench> {
    const bench = new Bench(Entity.generateId(), station.id, name)
    await bench.save()
    return bench
  }

  static async fetch(id: string): Promise<Bench | null> {
    const row = await hubshackDB.benches.get(id)
    return row ? new Bench(row.id, row.stationId, row.name) : null
  }

  static async fetchForStation(station: Station): Promise<Bench[]> {
    const rows = await hubshackDB.benches.where('stationId').equals(station.id).sortBy('id')
    return rows.map(row => new Bench(row.id, row.stationId, row.name))
  }

  static observe(id: string, callback: (bench: Bench | null) => void): Unsubscribe {
    const subscription = liveQuery(() => Bench.fetch(id)).subscribe(callback)
    return () => subscription.unsubscribe()
  }

  static observeForStation(station: Station, callback: (benches: Bench[]) => void): Unsubscribe {
    const subscription = liveQuery(() => Bench.fetchForStation(station)).subscribe(callback)
    return () => subscription.unsubscribe()
  }

  async save(): Promise<void> {
    await hubshackDB.benches.put({
      id: this.id,
      stationId: this.#stationId,
      name: this.#name
    })
  }
}
