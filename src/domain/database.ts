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
  activeBenchId: string | null
}

export interface BenchRow {
  id: string
  stationId: string
  name: string
}

export class HubshackDatabase extends Dexie {
  users!: EntityTable<UserRow, 'id'>
  stations!: EntityTable<StationRow, 'id'>
  benches!: EntityTable<BenchRow, 'id'>

  constructor() {
    super('hubshack')
    this.version(1).stores({
      users: 'id, &callsign',
      stations: 'id, userId',
      benches: 'id, stationId'
    })
  }
}

export const hubshackDB = new HubshackDatabase()
