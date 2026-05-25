import type Panel from '@panels/panel'
import ClockIcon from '@components/icons/ClockIcon.svelte'
import ClockPanel from './ClockPanel.svelte'

const panel: Panel = {
  id: 'clock',
  name: 'UTC Clock',
  categories: ['Station', 'Conditions'],
  requiredCapabilities: [],
  component: ClockPanel,
  icon: ClockIcon
}

export default panel
