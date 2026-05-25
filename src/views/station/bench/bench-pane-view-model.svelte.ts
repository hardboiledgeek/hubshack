import type { Component } from 'svelte'
import PanelRegistry from '@panels/panel-registry'

export type BenchPanel = {
  id: string
  name: string
  component: Component
}

export default class BenchPaneViewModel {
  panels = $derived<BenchPanel[]>(
    PanelRegistry.available().map(panel => ({
      id: panel.id,
      name: panel.name,
      component: panel.component
    }))
  )
}
