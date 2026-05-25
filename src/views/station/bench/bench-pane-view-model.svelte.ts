import type { Component } from 'svelte'
import { ulid } from 'ulid'
import PanelRegistry from '@panels/panel-registry'

const SHADOW_KEY = 'isDndShadowItem'

export type BenchInstance = {
  id: string
  panelId: string
  name: string
  component: Component
}

type DroppedItem = BenchInstance | (Partial<BenchInstance> & { id: string; panelId: string })

function isShadow(item: DroppedItem): boolean {
  return (item as Record<string, unknown>)[SHADOW_KEY] === true
}

function resolvePanel(panelId: string): { name: string; component: Component } {
  const panel = PanelRegistry.available().find(p => p.id === panelId)
  if (!panel) throw new Error(`Unknown panel: ${panelId}`)
  return { name: panel.name, component: panel.component }
}

export default class BenchPaneViewModel {
  instances = $state<BenchInstance[]>([])

  consider(items: DroppedItem[]): void {
    this.instances = items as BenchInstance[]
  }

  finalize(items: DroppedItem[]): void {
    this.instances = items.filter(item => !isShadow(item)).map(item => {
      if ('component' in item && item.component) return item as BenchInstance
      const { name, component } = resolvePanel(item.panelId)
      return { id: ulid(), panelId: item.panelId, name, component }
    })
  }
}
