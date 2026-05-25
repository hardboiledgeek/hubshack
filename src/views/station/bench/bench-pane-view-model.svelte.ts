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
      const activeBenchId = this.#appState.currentStation?.activeBenchId ?? null
      if (activeBenchId === null) {
        this.#benchPanels = []
        return
      }
      let unsubscribe: (() => void) | null = null
      let cancelled = false
      Bench.fetch(activeBenchId).then(bench => {
        if (cancelled || !bench) return
        unsubscribe = BenchPanel.watchForBench(bench, panels => (this.#benchPanels = panels))
      })
      return () => {
        cancelled = true
        unsubscribe?.()
      }
    })
  }
}
