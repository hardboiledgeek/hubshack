import { liveQuery, type Subscription } from 'dexie'
import type { Unsubscribe } from '@domain/types'

export type Query<T> = () => T | Promise<T>
export type SubscriptionCallback<T> = (value: T) => void
export type OnEmptyCallback = () => void

// `#lastValue: T | undefined` is the one place `undefined` is load-bearing in the
// domain layer. It's the "no emission yet" sentinel that gates replay-on-subscribe
// (see `subscribe` below). Queries must therefore never resolve to `undefined` —
// singleton `fetch*` methods normalize Dexie's row-not-found to `null`. If a
// `watch*` ever passes `undefined` through to `liveQuery`, replay silently breaks.
export default class EntityObserver<T> {
  #onEmpty: OnEmptyCallback
  #subscribers = new Set<SubscriptionCallback<T>>()
  #subscription: Subscription
  #lastValue: T | undefined

  constructor(query: Query<T>, onEmpty: OnEmptyCallback) {
    this.#onEmpty = onEmpty
    this.#subscription = liveQuery(query).subscribe(value => {
      this.#lastValue = value
      for (const callback of this.#subscribers) callback(value)
    })
  }

  subscribe(callback: SubscriptionCallback<T>): Unsubscribe {
    this.#subscribers.add(callback)
    if (this.#lastValue !== undefined) callback(this.#lastValue)
    return () => {
      this.#subscribers.delete(callback)
      if (this.#subscribers.size === 0) {
        this.#subscription.unsubscribe()
        this.#onEmpty()
      }
    }
  }
}
