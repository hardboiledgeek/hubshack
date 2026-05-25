export default class ClockPanelViewModel {
  #now = $state(new Date())

  time = $derived(this.#now.toISOString().slice(11, 19) + 'Z')

  constructor() {
    $effect(() => {
      const interval = setInterval(() => (this.#now = new Date()), 1000)
      return () => clearInterval(interval)
    })
  }
}
