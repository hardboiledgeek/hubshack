import { ulid } from 'ulid'
import EntityObserver, { type Query } from '@domain/entity-observer'

type Bucket = Map<string, EntityObserver<unknown>>

export default abstract class Entity {
  readonly #id: string

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
