import type { Component } from 'svelte'
import { fetchAppState } from '@app/app-state.svelte'
import Bench from '@domain/bench'
import BenchPanel from '@domain/bench-panel'
import PanelRegistry from '@panels/panel-registry'

export type BenchInstance = {
  id: string
  panelId: string
  name: string
  component: Component
}

export default class BenchPaneViewModel {
  #appState = fetchAppState()
  #activeBench = $state<Bench | null>(null)
  #benchPanels = $state<BenchPanel[]>([])

  instances = $derived<BenchInstance[]>(
    this.#benchPanels.flatMap(benchPanel => {
      const panel = PanelRegistry.fetch(benchPanel.panelId)
      if (!panel) return []
      return [{
        id: benchPanel.id,
        panelId: benchPanel.panelId,
        name: panel.name,
        component: panel.component
      }]
    })
  )

  constructor() {
    $effect(() => {
      const station = this.#appState.currentStation
      if (!station) {
        this.#activeBench = null
        return
      }
      return Bench.watchActiveForStation(station, bench => (this.#activeBench = bench))
    })

    $effect(() => {
      const bench = this.#activeBench
      if (!bench) {
        this.#benchPanels = []
        return
      }
      return BenchPanel.watchForBench(bench, panels => (this.#benchPanels = panels))
    })
  }
}
