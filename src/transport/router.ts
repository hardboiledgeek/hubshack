import type { Link } from './link'

export interface Router extends EventTarget {
  start(): void
  stop(): Promise<void>
}

export type RouterConstructor = new (link: Link) => Router

export enum RouterErrorReason {
  AlreadyStarted = 'already-started',
  NotStarted = 'not-started',
}

export class RouterError extends Error {
  readonly reason: RouterErrorReason

  constructor(reason: RouterErrorReason, message: string) {
    super(message)
    this.reason = reason
    this.name = 'RouterError'
  }
}
