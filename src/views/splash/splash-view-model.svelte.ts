import { appRouter } from '@app/app-router.svelte'
import { appState } from '@app/app-state.svelte'
import { TAGLINES } from './taglines'

const MINIMUM_DISPLAY_MS = 3000

export default class SplashViewModel {
  #timeRemaining = $state(true)

  constructor() {
    setTimeout(() => (this.#timeRemaining = false), MINIMUM_DISPLAY_MS)
  }

  get tagline(): string {
    return this.#pickTagline()
  }

  get loading(): boolean {
    return appState.loading || this.#timeRemaining
  }

  routeToNext(): void {
    if (appState.isSetup) {
      appRouter.routeToStation()
    } else {
      appRouter.routeToSetup()
    }
  }

  #pickTagline(): string {
    return TAGLINES[Math.floor(Math.random() * TAGLINES.length)]
  }
}
