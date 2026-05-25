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

export interface BenchPanelRow {
  id: string
  benchId: string
  panelId: string
}

export class HubshackDatabase extends Dexie {
  users!: EntityTable<UserRow, 'id'>
  stations!: EntityTable<StationRow, 'id'>
  benches!: EntityTable<BenchRow, 'id'>
  benchPanels!: EntityTable<BenchPanelRow, 'id'>

  constructor() {
    super('hubshack')
    this.version(1).stores({
      users: 'id, &callsign',
      stations: 'id, userId',
      benches: 'id, stationId',
      benchPanels: 'id, benchId'
    })
  }
}

export const hubshackDB = new HubshackDatabase()
