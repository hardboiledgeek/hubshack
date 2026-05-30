import { SerialLink } from './serial-link'
import { Dispatcher } from '@transport/dispatcher'
import { Signaler } from '@transport/signaler'
import { LinkManagerError, LinkManagerErrorReason, type LinkManager } from '@transport/link-manager'
import type { Router, RouterConstructor } from '@transport/router'

export class SerialLinkManager implements LinkManager {
  #link: SerialLink
  #router: Router
  #dispatcher: Dispatcher
  #signaler: Signaler
  #started = false

  constructor(port: SerialPort, options: SerialOptions, routerClass: RouterConstructor) {
    this.#link = new SerialLink(port, options)
    this.#router = new routerClass(this.#link)
    this.#dispatcher = new Dispatcher(this.#link)
    this.#signaler = new Signaler(this.#link)
  }

  async start(): Promise<void> {
    if (this.#started)
      throw new LinkManagerError(LinkManagerErrorReason.AlreadyStarted, 'SerialLinkManager is already started')

    await this.#link.open()
    this.#dispatcher.start()
    this.#router.start()
    this.#started = true
  }

  async stop(): Promise<void> {
    if (!this.#started)
      throw new LinkManagerError(LinkManagerErrorReason.NotStarted, 'SerialLinkManager is not started')

    this.#started = false
    await this.#router.stop()
    await this.#dispatcher.stop()
    await this.#link.close()
  }
}
