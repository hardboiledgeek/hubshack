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
  #active: boolean

  private constructor(id: string, stationId: string, name: string, active: boolean) {
    super(id)
    this.#stationId = stationId
    this.#name = name
    this.#active = active
  }

  get name(): string {
    return this.#name
  }

  set name(value: string) {
    this.#name = value
  }

  get active(): boolean {
    return this.#active
  }

  async station(): Promise<Station> {
    const station = await Station.fetch(this.#stationId)
    if (!station) throw new Error(`Bench ${this.id} references missing station ${this.#stationId}`)
    return station
  }

  async panels(): Promise<BenchPanel[]> {
    return BenchPanel.fetchForBench(this)
  }

  // Active-selection pattern: flag on the child, not FK on the parent.
  // An earlier `Station.activeBenchId` design forced async resolution that
  // couldn't be read from a `$derived`, pushing `$effect` plumbing into every
  // consuming VM. `Bench.active` is sync and reactive; the invariant
  // ("exactly one active per station") lives here. The brute-force write —
  // clear all siblings, then set this one — is intentional and self-heals
  // if the DB ever ends up with zero or multiple active rows.
  async activate(): Promise<void> {
    await hubshackDB.transaction('rw', hubshackDB.benches, async () => {
      await hubshackDB.benches.where('stationId').equals(this.#stationId).modify({ active: false })
      await hubshackDB.benches.update(this.id, { active: true })
    })
    this.#active = true
  }

  static async create(station: Station, name: string): Promise<Bench> {
    const bench = new Bench(Entity.generateId(), station.id, name, false)
    await bench.save()
    return bench
  }

  static async fetch(id: string): Promise<Bench | null> {
    const row = await hubshackDB.benches.get(id)
    return row ? new Bench(row.id, row.stationId, row.name, row.active) : null
  }

  static async fetchForStation(station: Station): Promise<Bench[]> {
    const rows = await hubshackDB.benches.where('stationId').equals(station.id).sortBy('id')
    return rows.map(row => new Bench(row.id, row.stationId, row.name, row.active))
  }

  static async fetchActiveForStation(station: Station): Promise<Bench | null> {
    const rows = await hubshackDB.benches.where('stationId').equals(station.id).toArray()
    const active = rows.find(row => row.active)
    return active ? new Bench(active.id, active.stationId, active.name, active.active) : null
  }

  static watch(id: string, callback: BenchCallback): Unsubscribe {
    return this.observe<Bench | null>(`single:${id}`, () => Bench.fetch(id)).subscribe(callback)
  }

  static watchForStation(station: Station, callback: BenchesCallback): Unsubscribe {
    return this.observe<Bench[]>(`by-station:${station.id}`, () => Bench.fetchForStation(station)).subscribe(callback)
  }

  static watchActiveForStation(station: Station, callback: BenchCallback): Unsubscribe {
    return this.observe<Bench | null>(`active-by-station:${station.id}`, () => Bench.fetchActiveForStation(station)).subscribe(callback)
  }

  async save(): Promise<void> {
    await hubshackDB.benches.put({
      id: this.id,
      stationId: this.#stationId,
      name: this.#name,
      active: this.#active
    })
  }
}
