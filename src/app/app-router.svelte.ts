export enum Route {
  Splash = 'splash',
  Setup = 'setup',
  Station = 'station'
}

export default class AppRouter {
  static #instance: AppRouter
  #currentRoute = $state<Route>(Route.Splash)

  private constructor() {}

  static get instance() {
    return this.#instance ?? (this.#instance = new AppRouter())
  }

  get currentRoute() {
    return this.#currentRoute
  }

  routeToSplash() {
    this.#currentRoute = Route.Splash
  }

  routeToSetup() {
    this.#currentRoute = Route.Setup
  }

  routeToStation() {
    this.#currentRoute = Route.Station
  }
}

export const appRouter = AppRouter.instance
