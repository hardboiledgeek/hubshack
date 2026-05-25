import type { Component } from 'svelte'
import { SvelteSet } from 'svelte/reactivity'
import PanelRegistry from '@panels/panel-registry'
import type Panel from '@panels/panel'
import DefaultIcon from '@components/icons/DefaultIcon.svelte'

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
  #expanded = new SvelteSet<string>()
  categories = $derived(this.#buildCategories())

  isCategoryExpanded(name: string): boolean {
    return this.#expanded.has(name)
  }

  toggleCategory(name: string): void {
    if (this.#expanded.has(name)) this.#expanded.delete(name)
    else this.#expanded.add(name)
  }

  #buildCategories(): PanelCategory[] {
    const categories = new Map<string, LibraryPanel[]>()

    for (const panel of PanelRegistry.available()) {
      for (const category of panel.categories) {
        const libraryPanel = makeLibraryPanel(panel, category)
        addLibraryPanel(libraryPanel)
      }
    }

    return toPanelCategories()

    function makeLibraryPanel(panel: Panel, category: string): LibraryPanel {
      return {
        id: panel.id,
        name: panel.name,
        category,
        icon: panel.icon ?? DefaultIcon
      }
    }

    function addLibraryPanel(libraryPanel: LibraryPanel): void {
      const list = categories.get(libraryPanel.category) ?? []
      list.push(libraryPanel)
      categories.set(libraryPanel.category, list)
    }

    function toPanelCategories(): PanelCategory[] {
      return [...categories.entries()].map(([name, panels]) => ({ name, panels }))
    }
  }
}
