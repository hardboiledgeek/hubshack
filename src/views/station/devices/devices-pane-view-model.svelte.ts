import type { Component } from 'svelte'
import DefaultIcon from '@components/icons/DefaultIcon.svelte'
import RadioIcon from '@components/icons/RadioIcon.svelte'
import RotatorIcon from '@components/icons/RotatorIcon.svelte'

export type MockDevice = {
  id: string
  name: string
  icon: Component
}

const MOCK_DEVICES: MockDevice[] = [
  { id: 'd1', name: 'Icom IC-7300', icon: RadioIcon },
  { id: 'd2', name: 'Icom IC-705', icon: RadioIcon },
  { id: 'd3', name: 'Yaesu G-5500', icon: RotatorIcon }
]

export default class DevicesPaneViewModel {
  #devices = $state<MockDevice[]>(MOCK_DEVICES)

  get devices(): MockDevice[] {
    return this.#devices
  }

  addDevice(): void {}
}
