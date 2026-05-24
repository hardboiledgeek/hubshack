export interface MockPanelType {
  id: string
  name: string
  category: string
}

export interface PanelCategory {
  category: string
  types: MockPanelType[]
}

const MOCK_PANEL_TYPES: MockPanelType[] = [
  { id: 'vfo', name: 'VFO', category: 'Tuning' },
  { id: 'memory', name: 'Memory', category: 'Tuning' },
  { id: 'bandscope', name: 'Bandscope', category: 'Tuning' },
  { id: 'smeter', name: 'S-Meter', category: 'Metering' },
  { id: 'swr', name: 'SWR', category: 'Metering' },
  { id: 'power', name: 'Power', category: 'Metering' },
  { id: 'qso-entry', name: 'QSO Entry', category: 'Logging' },
  { id: 'log', name: 'Log', category: 'Logging' },
  { id: 'rotator', name: 'Rotator', category: 'Antenna' }
]

export default class LibraryPaneViewModel {
  #collapsed = $state(false)
  #types = $state<MockPanelType[]>(MOCK_PANEL_TYPES)

  get collapsed(): boolean {
    return this.#collapsed
  }

  toggle(): void {
    this.#collapsed = !this.#collapsed
  }

  get categories(): PanelCategory[] {
    const groups = new Map<string, MockPanelType[]>()
    for (const type of this.#types) {
      const list = groups.get(type.category) ?? []
      list.push(type)
      groups.set(type.category, list)
    }
    return [...groups.entries()].map(([category, types]) => ({ category, types }))
  }
}
