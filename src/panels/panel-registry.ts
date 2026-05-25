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

function all(): Panel[] {
  return [...panels.values()]
}

function byId(id: string): Panel | null {
  return panels.get(id) ?? null
}

function categories(): string[] {
  const names = new Set<string>()
  for (const panel of panels.values()) {
    for (const category of panel.categories) names.add(category)
  }
  return [...names]
}

function forCategory(name: string): Panel[] {
  return [...panels.values()].filter(panel => panel.categories.includes(name))
}

const PanelRegistry = {
  load,
  all,
  byId,
  categories,
  forCategory
}

export default PanelRegistry
