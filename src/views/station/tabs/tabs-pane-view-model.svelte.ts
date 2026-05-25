import { getContext, setContext } from 'svelte'
import { fetchAppState } from '@app/app-state.svelte'
import Bench from '@domain/bench'

export type BenchTab = {
  id: string
  name: string
  active: boolean
  editing: boolean
}

const ViewModelSymbol = Symbol('TabsPaneViewModel')

export function registerViewModel(viewModel: TabsPaneViewModel): void {
  setContext(ViewModelSymbol, viewModel)
}

export function fetchViewModel(): TabsPaneViewModel {
  const viewModel = getContext<TabsPaneViewModel | undefined>(ViewModelSymbol)
  if (!viewModel) throw new Error('TabsPaneViewModel context not set')
  return viewModel
}

export default class TabsPaneViewModel {
  #appState = fetchAppState()
  #benches = $state<Bench[]>([])
  #editingBenchId = $state<string | null>(null)

  tabs = $derived<BenchTab[]>(
    this.#benches.map(bench => ({
      id: bench.id,
      name: bench.name,
      active: bench.active,
      editing: bench.id === this.#editingBenchId
    }))
  )

  constructor() {
    $effect(() => {
      const station = this.#appState.currentStation
      if (station) return Bench.watchForStation(station, benches => (this.#benches = benches))
    })
  }

  async setActiveBench(id: string): Promise<void> {
    const bench = this.#benches.find(b => b.id === id)
    if (!bench || bench.active) return
    await bench.activate()
  }

  beginRename(id: string): void {
    this.#editingBenchId = id
  }

  async commitRename(id: string, name: string): Promise<void> {
    this.#editingBenchId = null
    if (name.length === 0) return
    const bench = await Bench.fetch(id)
    if (!bench || bench.name === name) return
    bench.name = name
    await bench.save()
  }

  cancelRename(): void {
    this.#editingBenchId = null
  }

  async addBench(): Promise<void> {
    const station = this.#appState.currentStation
    if (!station) return
    const name = `Bench ${this.#benches.length + 1}`
    const bench = await Bench.create(station, name)
    await bench.activate()
    this.#editingBenchId = bench.id
  }
}
