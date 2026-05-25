import type Panel from '@panels/panel'
import OnAirIcon from '@components/icons/OnAirIcon.svelte'
import OnAirPanel from './OnAirPanel.svelte'

const panel: Panel = {
  id: 'on-air',
  name: 'On Air',
  categories: ['Station'],
  requiredCapabilities: [],
  component: OnAirPanel,
  icon: OnAirIcon
}

export default panel
