export interface MockDevice {
  id: string
  name: string
  model: string
}

const MOCK_DEVICES: MockDevice[] = [
  { id: 'd1', name: 'Shack Rig', model: 'Icom IC-7300' },
  { id: 'd2', name: 'Portable', model: 'Icom IC-705' },
  { id: 'd3', name: 'Rotator', model: 'Yaesu G-5500' }
]

export default class DevicesPaneViewModel {
  #devices = $state<MockDevice[]>(MOCK_DEVICES)

  get devices(): MockDevice[] {
    return this.#devices
  }

  addDevice(): void {}
}
