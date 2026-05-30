import type { Link } from './link'

export enum DispatcherErrorReason {
  AlreadyStarted = 'already-started',
  NotStarted = 'not-started',
}

export class DispatcherError extends Error {
  readonly reason: DispatcherErrorReason

  constructor(reason: DispatcherErrorReason, message: string) {
    super(message)
    this.reason = reason
    this.name = 'DispatcherError'
  }
}

export class Dispatcher extends EventTarget {
  #link: Link
  #writer: WritableStreamDefaultWriter<Uint8Array> | null = null
  #queue: Promise<void> = Promise.resolve()
  #closedWatch: Promise<void> | null = null

  constructor(link: Link) {
    super()
    this.#link = link
  }

  start(): void {
    if (this.#writer) throw new DispatcherError(DispatcherErrorReason.AlreadyStarted, 'Dispatcher is already started')

    const writer = this.#link.writable.getWriter()
    this.#writer = writer

    this.#closedWatch = writer.closed.catch(cause => {
      if (this.#writer !== writer) return
      this.dispatchEvent(new CustomEvent('error', { detail: cause }))
    })
  }

  async stop(): Promise<void> {
    if (!this.#writer) throw new DispatcherError(DispatcherErrorReason.NotStarted, 'Dispatcher is not started')

    const writer = this.#writer
    this.#writer = null

    await this.#queue.catch(() => {})
    await this.#closedWatch
    this.#closedWatch = null

    writer.releaseLock()
  }

  send(frame: Uint8Array): Promise<void> {
    if (!this.#writer) throw new DispatcherError(DispatcherErrorReason.NotStarted, 'Dispatcher is not started')

    const writer = this.#writer
    const next = this.#queue.then(() => writer.write(frame))
    this.#queue = next.catch(() => {})
    return next
  }
}
