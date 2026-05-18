import { ulid } from 'ulid'

export default abstract class Entity {
  readonly #id: string

  protected constructor(id: string) {
    this.#id = id
  }

  get id(): string {
    return this.#id
  }

  static generateId(): string {
    return ulid()
  }
}
