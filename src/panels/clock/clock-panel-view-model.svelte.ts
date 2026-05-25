export default class ClockPanelViewModel {
  #now = $state(new Date())

  utcTime = $derived(this.#now.toISOString().slice(11, 19))
  localTime = $derived(this.#now.toTimeString().slice(0, 8))
  localZone = $derived(this.#now.toLocaleTimeString(undefined, { timeZoneName: 'short' }).split(' ').pop() ?? '')

  constructor() {
    $effect(() => {
      const interval = setInterval(() => (this.#now = new Date()), 1000)
      return () => clearInterval(interval)
    })
  }
}
