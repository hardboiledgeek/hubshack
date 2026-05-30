import type { SerialLink } from './serial/serial-link'

export class Signaler {
  #link: SerialLink

  constructor(link: SerialLink) {
    this.#link = link
  }

  get rts(): boolean {
    return this.#link.rts
  }

  get dtr(): boolean {
    return this.#link.dtr
  }

  setRTS(value: boolean): Promise<void> {
    return this.#link.setRTS(value)
  }

  setDTR(value: boolean): Promise<void> {
    return this.#link.setDTR(value)
  }

  setSignals(rts: boolean, dtr: boolean): Promise<void> {
    return this.#link.setSignals(rts, dtr)
  }
}
