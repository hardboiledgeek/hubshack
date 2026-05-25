import { ulid } from 'ulid'
import EntityObserver, { type Query } from '@domain/entity-observer'

type Bucket = Map<string, EntityObserver<unknown>>

// Reactivity lives ABOVE the domain (in VMs, in AppState), not on it.
// `#`-private fields are invisible to Svelte's `$state` proxies — don't try to
// make a single entity instance reactive in place. `fetch` returns a fresh
// instance each call; consumers subscribe via `watch*`.
export default abstract class Entity {
  readonly #id: string

  // Subclass partitioning trick: in a static method, `this` is the subclass
  // constructor — so `#observers.get(this)` returns the bucket for `Bench`
  // when called from `Bench.watch`, without each subclass declaring storage.
  static #observers = new Map<typeof Entity, Bucket>()

  protected constructor(id: string) {
    this.#id = id
  }

  get id(): string {
    return this.#id
  }

  static generateId(): string {
    return ulid()
  }

  protected static observe<T>(key: string, query: Query<T>): EntityObserver<T> {
    const bucket = Entity.#fetchBucket()

    let observer = bucket.get(key) as EntityObserver<T> | undefined
    if (!observer) {
      observer = new EntityObserver<T>(query, () => bucket.delete(key))
      bucket.set(key, observer as EntityObserver<unknown>)
    }

    return observer
  }

  static #fetchBucket(): Bucket {
    let bucket = Entity.#observers.get(this)

    if (!bucket) {
      bucket = new Map()
      Entity.#observers.set(this, bucket)
    }

    return bucket
  }
}
