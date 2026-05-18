import Dexie, { EntityTable } from 'dexie'

export interface UserRow {
  id: string
  callsign: string
  userName: string
}

export interface StationRow {
  id: string
  userId: string
  stationName: string
}

export class HubshackDatabase extends Dexie {
  users!: EntityTable<UserRow, 'id'>
  stations!: EntityTable<StationRow, 'id'>

  constructor() {
    super('hubshack')
    this.version(1).stores({
      users: 'id, &callsign',
      stations: 'id, userId'
    })
  }
}

export const hubshackDB = new HubshackDatabase()
