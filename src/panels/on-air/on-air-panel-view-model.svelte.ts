export default class OnAirPanelViewModel {
  #onAir = $state(false)

  get onAir(): boolean {
    return this.#onAir
  }

  toggle(): void {
    this.#onAir = !this.#onAir
  }
}
