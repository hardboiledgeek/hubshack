export interface Link extends EventTarget {
  readonly readable: ReadableStream<Uint8Array>
  readonly writable: WritableStream<Uint8Array>
}

export enum LinkErrorReason {
  NotOpenable = 'not-openable',
  NotClosable = 'not-closable',
  Closed = 'closed',
  NotReadable = 'not-readable',
  NotWritable = 'not-writable',
}

export class LinkError extends Error {
  readonly reason: LinkErrorReason

  constructor(reason: LinkErrorReason, message: string) {
    super(message)
    this.reason = reason
    this.name = 'LinkError'
  }
}
