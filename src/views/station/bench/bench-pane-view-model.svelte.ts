import type { Component } from 'svelte'

export type BenchInstance = {
  id: string
  panelId: string
  name: string
  component: Component
}

export default class BenchPaneViewModel {
  instances = $state<BenchInstance[]>([])
}
