import { hubshackDB } from '@domain/database'
import Entity from '@domain/entity'
import Station from '@domain/station'
import BenchPanel from '@domain/bench-panel'
import type { Unsubscribe } from '@domain/types'
import type { SubscriptionCallback } from '@domain/entity-observer'

export type BenchCallback = SubscriptionCallback<Bench | null>
export type BenchesCallback = SubscriptionCallback<Bench[]>

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

  async panels(): Promise<BenchPanel[]> {
    return BenchPanel.fetchForBench(this)
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

  static watch(id: string, callback: BenchCallback): Unsubscribe {
    return this.observe<Bench | null>(`single:${id}`, () => Bench.fetch(id)).subscribe(callback)
  }

  static watchForStation(station: Station, callback: BenchesCallback): Unsubscribe {
    return this.observe<Bench[]>(`by-station:${station.id}`, () => Bench.fetchForStation(station)).subscribe(callback)
  }

  async save(): Promise<void> {
    await hubshackDB.benches.put({
      id: this.id,
      stationId: this.#stationId,
      name: this.#name
    })
  }
}
