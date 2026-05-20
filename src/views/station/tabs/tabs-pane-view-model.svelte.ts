export interface MockBench {
  id: string
  name: string
}

const MOCK_BENCHES: MockBench[] = [
  { id: 'b1', name: 'Main' },
  { id: 'b2', name: 'FT8' },
  { id: 'b3', name: 'Contest' }
]

export default class TabsPaneViewModel {
  #benches = $state<MockBench[]>([])
  #activeBenchId = $state<string | null>(null)

  start(): void {
    this.#benches = MOCK_BENCHES
    this.#activeBenchId = MOCK_BENCHES[0]?.id ?? null
  }

  stop(): void {
    this.#benches = []
    this.#activeBenchId = null
  }

  get benches(): MockBench[] {
    return this.#benches
  }

  get activeBenchId(): string | null {
    return this.#activeBenchId
  }

  set activeBenchId(id: string) {
    this.#activeBenchId = id
  }

  addBench(): void {}
}
