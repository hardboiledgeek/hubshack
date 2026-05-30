export interface LinkManager {
  start(): Promise<void>
  stop(): Promise<void>
}

export enum LinkManagerErrorReason {
  AlreadyStarted = 'already-started',
  NotStarted = 'not-started',
}

export class LinkManagerError extends Error {
  readonly reason: LinkManagerErrorReason

  constructor(reason: LinkManagerErrorReason, message: string) {
    super(message)
    this.reason = reason
    this.name = 'LinkManagerError'
  }
}
