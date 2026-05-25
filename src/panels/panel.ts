import type { Component } from 'svelte'

type Panel = {
  id: string
  name: string
  categories: string[]
  requiredCapabilities: string[]
  component: Component
  icon?: Component
}

export default Panel
