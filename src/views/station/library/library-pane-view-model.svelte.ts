import type { Component } from 'svelte'
import PanelRegistry from '@panels/panel-registry'
import DefaultIcon from '@components/icons/DefaultIcon.svelte'

export type LibraryPanel = {
  id: string
  name: string
  icon: Component
}

export type PanelCategory = {
  category: string
  panels: LibraryPanel[]
}

export default class LibraryPaneViewModel {
  #collapsed = $state(false)

  get collapsed(): boolean {
    return this.#collapsed
  }

  toggle(): void {
    this.#collapsed = !this.#collapsed
  }

  categories = $derived<PanelCategory[]>(this.#groupByCategory())

  #groupByCategory(): PanelCategory[] {
    const groups = new Map<string, LibraryPanel[]>()
    for (const panel of PanelRegistry.available()) {
      const row: LibraryPanel = {
        id: panel.id,
        name: panel.name,
        icon: panel.icon ?? DefaultIcon
      }
      for (const category of panel.categories) {
        const list = groups.get(category) ?? []
        list.push(row)
        groups.set(category, list)
      }
    }
    return [...groups.entries()].map(([category, panels]) => ({ category, panels }))
  }
}
