import { hubshackDB } from '@domain/database'
import Entity from '@domain/entity'
import Station from '@domain/station'
import type { Unsubscribe } from '@domain/types'
import type { SubscriptionCallback } from '@domain/entity-observer'

export type UserCallback = SubscriptionCallback<User | null>
export type UsersCallback = SubscriptionCallback<User[]>

export default class User extends Entity {
  #callsign: string
  #userName: string

  private constructor(id: string, callsign: string, userName: string) {
    super(id)
    this.#callsign = callsign
    this.#userName = userName
  }

  get callsign(): string {
    return this.#callsign
  }

  set callsign(value: string) {
    this.#callsign = value
  }

  get userName(): string {
    return this.#userName
  }

  set userName(value: string) {
    this.#userName = value
  }

  async stations(): Promise<Station[]> {
    return Station.fetchForUser(this)
  }

  static async create(callsign: string, userName: string): Promise<User> {
    const user = new User(Entity.generateId(), callsign, userName)
    await user.save()
    return user
  }

  static async fetch(id: string): Promise<User | null> {
    const row = await hubshackDB.users.get(id)
    return row ? new User(row.id, row.callsign, row.userName) : null
  }

  static async fetchByCallsign(callsign: string): Promise<User | null> {
    const row = await hubshackDB.users.where('callsign').equals(callsign).first()
    return row ? new User(row.id, row.callsign, row.userName) : null
  }

  static async fetchAll(): Promise<User[]> {
    const rows = await hubshackDB.users.toArray()
    return rows.map(row => new User(row.id, row.callsign, row.userName))
  }

  static watch(id: string, callback: UserCallback): Unsubscribe {
    return this.observe<User | null>(`single:${id}`, () => User.fetch(id)).subscribe(callback)
  }

  static watchAll(callback: UsersCallback): Unsubscribe {
    return this.observe<User[]>('all', () => User.fetchAll()).subscribe(callback)
  }

  async save(): Promise<void> {
    await hubshackDB.users.put({
      id: this.id,
      callsign: this.callsign,
      userName: this.userName
    })
  }
}
