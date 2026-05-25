import { getContext, setContext, type Component } from 'svelte'
import { SvelteSet } from 'svelte/reactivity'
import { fetchAppState } from '@app/app-state.svelte'
import Bench from '@domain/bench'
import BenchPanel from '@domain/bench-panel'
import PanelRegistry from '@panels/panel-registry'
import DefaultIcon from '@components/icons/DefaultIcon.svelte'

const ViewModelSymbol = Symbol('LibraryPaneViewModel')

export function registerViewModel(viewModel: LibraryPaneViewModel): void {
  setContext(ViewModelSymbol, viewModel)
}

export function fetchViewModel(): LibraryPaneViewModel {
  const viewModel = getContext<LibraryPaneViewModel | undefined>(ViewModelSymbol)
  if (!viewModel) throw new Error('LibraryPaneViewModel context not set')
  return viewModel
}

export type LibraryPanel = {
  id: string
  name: string
  category: string
  icon: Component
}

export type PanelCategory = {
  name: string
  panels: LibraryPanel[]
}

export default class LibraryPaneViewModel {
  #appState = fetchAppState()
  #expanded = new SvelteSet<string>()
  #activeBench = $state<Bench | null>(null)
  categories = $derived(this.#buildCategories())
  canAddToBench = $derived(this.#activeBench !== null)

  constructor() {
    $effect(() => {
      const station = this.#appState.currentStation
      if (!station) {
        this.#activeBench = null
        return
      }
      return Bench.watchActiveForStation(station, bench => (this.#activeBench = bench))
    })
  }

  isCategoryExpanded(name: string): boolean {
    return this.#expanded.has(name)
  }

  toggleCategory(name: string): void {
    if (this.#expanded.has(name)) this.#expanded.delete(name)
    else this.#expanded.add(name)
  }

  async addToBench(panelId: string): Promise<void> {
    const bench = this.#activeBench
    if (!bench) return
    await BenchPanel.create(bench, panelId)
  }

  #buildCategories(): PanelCategory[] {
    return PanelRegistry.categories().map(name => ({
      name,
      panels: PanelRegistry.forCategory(name).map(panel => ({
        id: panel.id,
        name: panel.name,
        category: name,
        icon: panel.icon ?? DefaultIcon
      }))
    }))
  }
}
