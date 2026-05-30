import { LinkError, LinkErrorReason, type Link } from '@transport/link'

export class SerialLink extends EventTarget implements Link {
  #port: SerialPort
  #options: SerialOptions

  #rts = false
  #dtr = false

  #onPortDisconnect = () => this.dispatchEvent(new Event('disconnected'))

  constructor(port: SerialPort, options: SerialOptions) {
    super()
    this.#port = port
    this.#options = options
  }

  async open(): Promise<void> {
    if (!this.#isOpenable) throw new LinkError(LinkErrorReason.NotOpenable, 'SerialLink is not openable')

    this.#clearSignalsCache()

    await this.#port.open(this.#options)
    this.#port.addEventListener('disconnect', this.#onPortDisconnect)

    this.dispatchEvent(new Event('connected'))
  }

  async close(): Promise<void> {
    if (!this.#isClosable) throw new LinkError(LinkErrorReason.NotClosable, 'SerialLink is not closable')

    this.#port.removeEventListener('disconnect', this.#onPortDisconnect)
    await this.#port.close()

    this.#clearSignalsCache()

    this.dispatchEvent(new Event('disconnected'))
  }

  get readable(): ReadableStream<Uint8Array> {
    if (this.#port.readable) return this.#port.readable
    throw new LinkError(LinkErrorReason.NotReadable, 'SerialLink is not readable')
  }

  get writable(): WritableStream<Uint8Array> {
    if (this.#port.writable) return this.#port.writable
    throw new LinkError(LinkErrorReason.NotWritable, 'SerialLink is not writable')
  }

  get rts(): boolean {
    return this.#rts
  }

  get dtr(): boolean {
    return this.#dtr
  }

  async setSignals(rts: boolean, dtr: boolean): Promise<void> {
    if (this.#isClosed()) throw new LinkError(LinkErrorReason.Closed, 'SerialLink is closed')

    await this.#port.setSignals({ requestToSend: rts, dataTerminalReady: dtr })
    this.#cacheSignals(rts, dtr)
  }

  setRTS(value: boolean): Promise<void> {
    return this.setSignals(value, this.#dtr)
  }

  setDTR(value: boolean): Promise<void> {
    return this.setSignals(this.#rts, value)
  }

  #cacheSignals(rts: boolean, dtr: boolean): void {
    this.#rts = rts
    this.#dtr = dtr
  }

  #clearSignalsCache() {
    this.#rts = false
    this.#dtr = false
  }

  #isClosed(): boolean {
    return this.#port.readable === null && this.#port.writable === null
  }

  get #isOpenable(): boolean {
    return this.#port.readable === null && this.#port.writable === null
  }

  get #isClosable(): boolean {
    return this.#port.readable !== null || this.#port.writable !== null
  }
}
