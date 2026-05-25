import { hubshackDB } from '@domain/database'
import Entity from '@domain/entity'
import Bench from '@domain/bench'
import type { Unsubscribe } from '@domain/types'
import type { SubscriptionCallback } from '@domain/entity-observer'

export type BenchPanelCallback = SubscriptionCallback<BenchPanel | null>
export type BenchPanelsCallback = SubscriptionCallback<BenchPanel[]>

export default class BenchPanel extends Entity {
  #benchId: string
  #panelId: string

  private constructor(id: string, benchId: string, panelId: string) {
    super(id)
    this.#benchId = benchId
    this.#panelId = panelId
  }

  get panelId(): string {
    return this.#panelId
  }

  async bench(): Promise<Bench> {
    const bench = await Bench.fetch(this.#benchId)
    if (!bench) throw new Error(`BenchPanel ${this.id} references missing bench ${this.#benchId}`)
    return bench
  }

  static async create(bench: Bench, panelId: string): Promise<BenchPanel> {
    const benchPanel = new BenchPanel(Entity.generateId(), bench.id, panelId)
    await benchPanel.save()
    return benchPanel
  }

  static async fetch(id: string): Promise<BenchPanel | null> {
    const row = await hubshackDB.benchPanels.get(id)
    return row ? new BenchPanel(row.id, row.benchId, row.panelId) : null
  }

  static async fetchForBench(bench: Bench): Promise<BenchPanel[]> {
    const rows = await hubshackDB.benchPanels.where('benchId').equals(bench.id).sortBy('id')
    return rows.map(row => new BenchPanel(row.id, row.benchId, row.panelId))
  }

  static watch(id: string, callback: BenchPanelCallback): Unsubscribe {
    return this.observe<BenchPanel | null>(`single:${id}`, () => BenchPanel.fetch(id)).subscribe(callback)
  }

  static watchForBench(bench: Bench, callback: BenchPanelsCallback): Unsubscribe {
    return this.observe<BenchPanel[]>(`by-bench:${bench.id}`, () => BenchPanel.fetchForBench(bench)).subscribe(callback)
  }

  async save(): Promise<void> {
    await hubshackDB.benchPanels.put({
      id: this.id,
      benchId: this.#benchId,
      panelId: this.#panelId
    })
  }
}
