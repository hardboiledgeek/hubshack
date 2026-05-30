import type { Link } from '@transport/link'
import { RouterError, RouterErrorReason, type Router } from '@transport/router'

const SEMICOLON = 0x3b

export class CatRouter extends EventTarget implements Router {
  #link: Link
  #pipe: Promise<void> | null = null
  #abort: AbortController | null = null

  constructor(link: Link) {
    super()
    this.#link = link
  }

  start(): void {
    if (this.#pipe) throw new RouterError(RouterErrorReason.AlreadyStarted, 'CatRouter is already started')

    this.#abort = new AbortController()
    const sink = new WritableStream<Uint8Array>({
      write: frame => {
        this.dispatchEvent(new CustomEvent('frame', { detail: frame }))
      }
    })

    this.#pipe = this.#link.readable
      .pipeThrough(new SemicolonFramer(), { signal: this.#abort.signal })
      .pipeTo(sink, { signal: this.#abort.signal })
      .catch(cause => {
        if (this.#abort?.signal.aborted) return
        this.dispatchEvent(new CustomEvent('error', { detail: cause }))
      })
  }

  async stop(): Promise<void> {
    if (!this.#pipe) throw new RouterError(RouterErrorReason.NotStarted, 'CatRouter is not started')
    this.#abort?.abort()
    await this.#pipe
    this.#pipe = null
    this.#abort = null
  }
}

class SemicolonFramer extends TransformStream<Uint8Array, Uint8Array> {
  constructor() {
    let buffer = new Uint8Array(0)
    super({
      transform(chunk, controller) {
        const merged = new Uint8Array(buffer.length + chunk.length)
        merged.set(buffer, 0)
        merged.set(chunk, buffer.length)

        let start = 0
        for (let i = 0; i < merged.length; i++) {
          if (merged[i] === SEMICOLON) {
            controller.enqueue(merged.slice(start, i))
            start = i + 1
          }
        }
        buffer = merged.slice(start)
      }
    })
  }
}
