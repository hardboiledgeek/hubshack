import type { Component } from 'svelte'
import { ulid } from 'ulid'
import PanelRegistry from '@panels/panel-registry'
import DefaultIcon from '@components/icons/DefaultIcon.svelte'

export type LibraryPanel = {
  id: string
  panelId: string
  name: string
  category: string
  icon: Component
}

export type PanelCategory = {
  category: string
  panels: LibraryPanel[]
}

function makeRows(): LibraryPanel[] {
  const rows: LibraryPanel[] = []
  for (const panel of PanelRegistry.available()) {
    for (const category of panel.categories) {
      rows.push({
        id: ulid(),
        panelId: panel.id,
        name: panel.name,
        category,
        icon: panel.icon ?? DefaultIcon
      })
    }
  }
  return rows
}

export default class LibraryPaneViewModel {
  #collapsed = $state(false)
  rows = $state<LibraryPanel[]>(makeRows())

  get collapsed(): boolean {
    return this.#collapsed
  }

  toggle(): void {
    this.#collapsed = !this.#collapsed
  }

  setRows(items: LibraryPanel[]): void {
    this.rows = items
  }

  restore(): void {
    this.rows = makeRows()
  }

  categories = $derived<PanelCategory[]>(this.#groupByCategory())

  #groupByCategory(): PanelCategory[] {
    const groups = new Map<string, LibraryPanel[]>()
    for (const row of this.rows) {
      const list = groups.get(row.category) ?? []
      list.push(row)
      groups.set(row.category, list)
    }
    return [...groups.entries()].map(([category, panels]) => ({ category, panels }))
  }
}
