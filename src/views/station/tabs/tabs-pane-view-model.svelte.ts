import { appState } from '@app/app-state.svelte'
import Bench from '@domain/bench'

export default class TabsPaneViewModel {
  #benches = $state<Bench[]>([])
  #editingBenchId = $state<string | null>(null)
  #menuOpenBenchId = $state<string | null>(null)

  constructor() {
    $effect(() => {
      const station = appState.currentStation
      if (!station) return
      return Bench.watchForStation(station, benches => {
        this.#benches = benches
      })
    })
  }

  get benches(): Bench[] {
    return this.#benches
  }

  get activeBenchId(): string | null {
    return appState.currentStation?.activeBenchId ?? null
  }

  async setActiveBench(id: string): Promise<void> {
    const station = appState.currentStation
    if (!station || station.activeBenchId === id) return
    station.activeBenchId = id
    await station.save()
  }

  get editingBenchId(): string | null {
    return this.#editingBenchId
  }

  get menuOpenBenchId(): string | null {
    return this.#menuOpenBenchId
  }

  openMenu(id: string): void {
    this.#menuOpenBenchId = id
  }

  closeMenu(): void {
    this.#menuOpenBenchId = null
  }

  beginRename(id: string): void {
    this.#menuOpenBenchId = null
    this.#editingBenchId = id
  }

  async commitRename(id: string, name: string): Promise<void> {
    const bench = this.#benches.find(b => b.id === id)
    if (bench && name.length > 0 && name !== bench.name) {
      bench.name = name
      await bench.save()
    }
    this.#editingBenchId = null
  }

  cancelRename(): void {
    this.#editingBenchId = null
  }

  async addBench(): Promise<void> {
    const station = appState.currentStation
    if (!station) return
    const name = `Bench ${this.#benches.length + 1}`
    const bench = await Bench.create(station, name)
    station.activeBenchId = bench.id
    await station.save()
    this.#editingBenchId = bench.id
  }
}
