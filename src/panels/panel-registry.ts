import type Panel from '@panels/panel'

import callsignPanel from '@panels/callsign/callsign-panel'
import clockPanel from '@panels/clock/clock-panel'
import onAirPanel from '@panels/on-air/on-air-panel'

const panels = new Map<string, Panel>()

function load(): void {
  register(callsignPanel)
  register(clockPanel)
  register(onAirPanel)
}

function register(panel: Panel): void {
  panels.set(panel.id, panel)
}

function available(): Panel[] {
  return [...panels.values()]
}

const PanelRegistry = {
  load,
  available
}

export default PanelRegistry
