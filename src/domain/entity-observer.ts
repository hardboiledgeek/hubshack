import { liveQuery, type Subscription } from 'dexie'
import type { Unsubscribe } from '@domain/types'

export type Query<T> = () => T | Promise<T>
export type SubscriptionCallback<T> = (value: T) => void
export type OnEmptyCallback = () => void

// Queries must never resolve to `undefined` — `undefined` is the "no value yet" sentinel
// for replay-on-subscribe. Use `null` to mean "entity missing/deleted."
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
