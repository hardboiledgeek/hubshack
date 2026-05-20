export interface MockPanel {
  id: string
  typeId: string
  name: string
  span: 1 | 2
}

const MOCK_PANELS: MockPanel[] = [
  { id: 'p1', typeId: 'vfo', name: 'VFO A', span: 2 },
  { id: 'p2', typeId: 'smeter', name: 'S-Meter', span: 1 },
  { id: 'p3', typeId: 'swr', name: 'SWR', span: 1 },
  { id: 'p4', typeId: 'memory', name: 'Memories', span: 1 },
  { id: 'p5', typeId: 'rotator', name: 'Rotator', span: 1 }
]

export default class BenchPaneViewModel {
  #panels = $state<MockPanel[]>([])

  start(): void {
    this.#panels = MOCK_PANELS
  }

  stop(): void {
    this.#panels = []
  }

  get panels(): MockPanel[] {
    return this.#panels
  }
}
