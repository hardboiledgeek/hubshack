import type Panel from '@panels/panel'
import CallsignPanel from './CallsignPanel.svelte'

const panel: Panel = {
  id: 'callsign',
  name: 'Callsign',
  categories: ['Station'],
  requiredCapabilities: [],
  component: CallsignPanel
}

export default panel
