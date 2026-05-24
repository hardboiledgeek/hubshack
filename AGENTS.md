# Hubshack — Agent Guide

Hubshack is integrated ham radio rig control software. The browser is the host; radios and accessories connect over WebSerial and Web Audio. The product is built around the operator's workflow, not the hardware vendor's UI.

## Domain Terminology

These names appear in the UI, in code, and in conversations with users. They are radio-native by design — use them consistently.

| Term        | Meaning                                                                                                                                                  |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Shack**   | The whole application. The operator's digital shack.                                                                                                     |
| **Station** | A physical/logical operating setup: location, rig(s), antennas. A user can have several.                                                                 |
| **Bench**   | A named arrangement of panels for a specific kind of operating — e.g. "FT8 bench", "contest bench", "nets bench". A tab within a Station.                |
| **Panel**   | An individual UI element a user arranges on a bench: VFO, S-meter, log entry, rotator control, waterfall, etc. User-facing word for an *instance* placed on a Bench. |
| **PanelType** | The definition of a kind of Panel (code, not data). Lives in `src/panels/`. A single PanelType can have many Panel instances across Benches, each with its own config and layout. |
| **Device**  | A piece of physical gear connected to a Station: radio, amp, rotator, etc. Devices are owned by a Station; panels across many Benches subscribe to them. |
| **Adapter** | The piece of code that knows how to talk to a Device and exposes its capabilities on the bus. Panels and Devices are decoupled by Adapters — neither knows about the other directly. |
| **View**    | A routable top-level screen in the app (Splash, Setup, Station). Lives in `src/views/`. Internal term, not user-facing.                                  |
| **Pane**    | A self-contained chunk of a View (header, sidebar, tab strip, etc.). Named to avoid collision with radio-domain "Panel."                                 |

Hierarchy of persisted concepts: **Shack → Station → Bench → Panel**, with Devices parallel to Bench under Station.

PanelTypes and Adapters are **code, not data** — registered at app start, looked up by id. Only Panel *instances* are persisted.

## Persistent Domains

Not everything that's persisted is "config." Keep these mentally separate:

- **Account** — identity, callsign-as-login, subscription. Cloud-primary eventually; not built yet.
- **Shack** — Stations, Benches, Panels, Devices. Local source of truth; will become cloud-syncable.
- **Log** — QSO records. Append-mostly, cloud-primary eventually. Not built yet; will likely live behind a REST API rather than IndexedDB.
- **Settings** — true UI preferences (theme, units). Device-local, sync optional. Not built yet.
- **State** — runtime: current VFO, PTT, connection status. Not persisted. Flows via pub/sub from Devices to Panels.

Most panels get their data from Devices via pub/sub, not from persisted state. **Don't bake assumptions that everything goes through the IndexedDB layer.**

## Architecture

### Domain layer (`src/domain/`)

Follow the shape of `User` and `Station`. The non-obvious rules:

- **IDs are ULIDs**, not UUIDs. Sort lexicographically by creation time. `Entity.generateId()` mints them.
- **Constructors take discrete positional arguments**, not row objects. `UserRow` / `StationRow` are a storage detail confined to `database.ts` and the entity's own `fetch` / `save`.
- **All public methods return Promises**, even when the underlying call is sync. Lets us swap storage without rippling through callers.
- **Relationship accessors return domain objects, not IDs**: `user.stations()` returns `Promise<Station[]>`. `station.user()` throws on dangling references — that's a data-integrity bug, not a null case.
- **Methods take the related entity, not its id**: `Station.fetchForUser(user: User)`, not `fetchForUser(userId: string)`.
- **Use `#`-private fields for runtime privacy** (e.g. entity id). TypeScript `private` is compile-time only and doesn't survive `$state` proxies.
- **`null` and `undefined` are not interchangeable.** `null` is intentional, set by code, expected — the right value for "entity missing/deleted" or any deliberately-empty slot. `undefined` is "JavaScript did that" or "not yet set" — uninitialized fields, missing object properties, unsignaled state. Type signatures should say `T | null` when absence is part of the contract; reserve `T | undefined` for transient internal state (e.g. `EntityObserver`'s `#lastValue` sentinel for "no emission yet"). Never use `??` to paper over the distinction.

#### The watch API

Each entity exposes `watch*` methods parallel to its `fetch*` methods, returning an `Unsubscribe`. Implementation goes through `EntityObserver` (`src/domain/entity-observer.ts`), which wraps Dexie's `liveQuery`; consumers don't see Dexie.

**Contract:** callbacks fire immediately with the current value, then again on every change — *including changes from other tabs*. `watch(id, cb)` passes `null` when the entity is deleted or missing.

**Queries must never resolve to `undefined`.** `EntityObserver` uses `undefined` as the "no value emitted yet" sentinel for replay-on-subscribe. Singleton fetches normalize `undefined` (Dexie's "row not found") to `null` before returning — e.g. `row ? new Bench(...) : null`. Don't write a `watch*` whose query can pass `undefined` through to `liveQuery`; replay will silently break.

**Sharing:** subscriptions are deduplicated per (subclass, key). Ten VMs calling `Bench.watch(sameId, ...)` share one underlying `liveQuery`; new subscribers get the cached last value immediately. When the last subscriber unsubscribes, the underlying query is torn down.

Implemented via `Entity.observe<T>(key, query)` (protected static on the base class), backed by a `Map<typeof Entity, Map<key, EntityObserver>>` on `Entity`. Each `watch*` method on a subclass is a one-liner — picks a key (e.g. `single:${id}`, `by-station:${stationId}`, or `'all'`) and calls `this.observe(...).subscribe(callback)`. No per-subclass storage declarations.

**`watch*` is for config state, not live state.** Anything persisted in Dexie (Stations, Benches, Panels, Devices, layouts) flows through `watch*`. Live runtime values from devices (current VFO, S-meter readings, PTT) do *not* go through `EntityObserver` or `liveQuery` — they will flow through a separate pub/sub bus from Adapters to Panels (see "Pub/sub" below). Don't try to extend the watch API to cover device telemetry; that's a different problem with different primitives.

### Storage layer (`src/domain/database.ts`)

Dexie. Single shared `hubshackDB` instance. The rules that aren't visible from reading the file:

- **Foreign keys reference `id`, never natural keys.** Callsigns change; ULIDs don't.
- **Schema versions are append-only once real data exists.** Add `.version(N).stores({...}).upgrade(...)` blocks rather than editing version 1.
- **Keep Dexie confined to `src/domain/`.** Outside this directory, subscribe via `watch*`, not `liveQuery` directly.

### App-state layer (`src/app/app-state.svelte.ts`)

The `appState` singleton holds boot-level UI state. The constraints:

- **Not a cache for arbitrary entities.** Only the *current* user and station, plus loading flags. Don't add fields for other entities.
- **No `$effect.root`.** Transitions are imperative through setters; the watch callbacks are the only async events the class listens to.
- **`loading` is true until both watch callbacks have fired at least once.** Views consume this; don't replicate the check elsewhere.

### Reactivity tiers

- **App-wide singleton** — `appState`. Exists.
- **Page-scoped view models** — class instantiated inside a view's `<script>`, discarded on unmount. The pattern for view/Pane state.
- **Identity-mapped reactive entities** — *not built.* Today `User.fetch(id)` returns a fresh instance each call. **Don't try to make a single entity instance reactive in place** — `#` private fields are invisible to Svelte's `$state` proxies. Reactivity lives *above* the domain, not on it.

### Pub/sub — not yet built

Device → Panel flow will go through a topic bus (`vfoA.frequency`, etc.). Persisted state is the bench layout and device config; the values themselves are ephemeral. **No Panel ever imports an Adapter, and no Adapter knows about Panels** — they communicate only by topic name.

### Routing (`src/app/app-router.svelte.ts`)

Enum-based router singleton. Routes: `Splash`, `Setup`, `Station`.

- **`Splash` is the entry point** and owns the `loading` / `isSetup` routing decision. `App.svelte` is just a switch — no checks there.
- Setup writes `appState.currentUser` / `appState.currentStation` after creating the entities, then calls `appRouter.routeToStation()`. It also creates a default "Main" Bench and sets it as the Station's `activeBenchId` before the route — a Station is never persisted without at least one Bench.

## Station View Layout

The Station view is the operator's working surface. Its chrome is fixed; the bench area is what the user arranges.

```
┌────────────────────────────────────────────────────────────┐
│ HUBSHACK · Station name · Op callsign           [gear]     │  header
├──────────┬─────────────────────────────────────────────────┤
│ DEVICES  │  [Bench 1] [Bench 2] [Bench 3] [+]              │  bench tabs
│  · IC-705│ ─────────────────────────────────────────────── │
│  · Rotor │                                                 │
│  + Add   │           (panels arranged here)                │
├──────────┤                                                 │
│ PANELS ▾ │                                                 │  collapsible
│  Tuning  │                                                 │
│   VFO    │                                                 │
│   Memory │                                                 │
└──────────┴─────────────────────────────────────────────────┘
```

- **Header** — wordmark left; station name + operator callsign center/right; settings gear right.
- **Devices** sidebar section — always visible. Small finite list. `+ Add` at the bottom.
- **Panel Library** — collapsible. Lists `PanelType`s filtered by what installed Devices' adapters can satisfy. Drag source for adding panels to the active Bench.
- **Bench tab strip** — one tab per Bench, `+` after the last creates a new one.
- **Bench area** — flex/tile layout. Drop target. **Per-instance layout overrides (`fullWidth`, span, etc.) live on the Bench, not on the Panel.**

## Panels and Adapters

Three players meet at the bus:

- **PanelType** — code-defined kind of panel. Declares topics it subscribes/publishes, config schema, default layout hints.
- **Panel** — persisted *instance* of a PanelType on a Bench. Holds the user's config for this placement.
- **Adapter** — code that talks to a Device and publishes/subscribes topics. Each Device declares which Adapters it can host.

**Compatibility flows through Adapters, not Devices:**

- A PanelType lists adapter *capabilities* (topics) it requires — not "compatible devices."
- The Panel Library shows a PanelType iff every capability it needs is satisfied by some installed Device.
- Adding a Device unlocks the Panels its adapters provide; removing it hides them.

**Layout rule:** Panel owns what it *is* (config). Bench owns where it *goes* (per-instance layout). Same PanelType on two Benches can be different sizes; the same Panel instance is never on two Benches.

## Views, Panes, View Models

### Views are folders

Each view lives in its own lowercase folder under `src/views/`:

- `Foo.svelte` — the view (PascalCase). **Layout only when the view has Panes** — imports and arranges, no `<script>` logic beyond that.
- `foo-view-model.svelte.ts` — page-scoped store; owns `$state`, `$derived`, and action methods. Instantiated in the view's `<script>`, discarded on unmount.
- Any Panes the view decomposes into.
- Any view-local helpers (e.g. `taglines.ts`).

### Panes

When a view has enough structure to subdivide (Station does; Splash and Setup don't), break it into Panes. Each Pane lives in its own subfolder:

```
src/views/station/
  Station.svelte
  bench/
    BenchPane.svelte
    bench-pane-view-model.svelte.ts
  devices/
    DevicesPane.svelte
    devices-pane-view-model.svelte.ts
```

The `*Pane` suffix on file and class (`BenchPane`, `BenchPaneViewModel`) keeps the Pane concept distinct from radio-domain `Panel`.

**Pane self-sufficiency rules:**

- A Pane's VM never imports another Pane's VM, takes one as a constructor arg, or receives the parent view's VM.
- Pane VMs source data from `appState` and domain `watch*` APIs only. No prop-drilling.
- **Shared transient state belongs in the domain**, not on a parent VM passed down. E.g. the active Bench tab lives on the Station entity, so Tabs writes it and Bench reads it via the Station watcher.
- View-scoped state that doesn't fit the domain (e.g. "is the panel library collapsed") stays local to the one Pane that owns it.

### View-model lifecycle

VMs own their own subscription lifecycle. The constructor sets up observation inside `$effect`, and the view just constructs the VM:

```svelte
const viewModel = new FooViewModel()
```

```ts
// foo-view-model.svelte.ts
export default class FooViewModel {
  #thing = $state<Thing | null>(null)

  constructor() {
    $effect(() => Thing.watch(id, t => { this.#thing = t }))
  }
}
```

The `watch*` API returns an `Unsubscribe`, which is exactly what `$effect`'s cleanup expects — `return` it directly. Svelte tears down the subscription when the surrounding component unmounts.

VMs are constructed in a Svelte reactive context (a component's `<script>`). Tests that exercise observation wrap construction in `$effect.root(() => { ... })`.

## Components (`src/components/`)

- **Accept a `class` prop** for caller-supplied layout. Svelte does not forward classes through component boundaries:
  ```svelte
  let { class: className = '' }: { class?: string } = $props()
  ```
  Apply to the root: `class="...base... {className}"`.

- **Icons are inline SVG** using `stroke="currentColor"` so they inherit text color from Tailwind. No icon library — see Non-Goals.

## Conventions

### File naming — strict, by extension

- `.svelte` files → **PascalCase** (`Setup.svelte`, `Station.svelte`).
- Everything else → **lowercase kebab-case** (`database.ts`, `app-router.svelte.ts`, `user.ts`).

Yes, this means `User` lives in `user.ts`. **Filename is decided by extension, not by what the file exports.** Avoid abbreviations — `database.ts` not `db.ts`, `configuration.ts` not `config.ts`.

### Semantic HTML over divs

Prefer `<header>`, `<nav>`, `<aside>`, `<section>`, `<article>`, `<main>` over `<div>`. Each view's root is `<main>` (one per page).

A pattern that falls out of this: **leaf elements carry their own borders.** Two adjacent sections each get their own `border`; they double up at the boundary. Same visual result, no layout divs.

For multi-region top-level layouts (Station), use **CSS grid** on the view's `<main>` rather than nested flex wrappers.

### Code style

- **No comments unless the *why* is non-obvious.** Don't narrate what the next line does.
- **No backwards-compatibility shims** for code that hasn't shipped.
- **No emojis** in code, commit messages, or generated text unless asked.
- **Setters over `setX(value)` methods** when the operation is one assignment. Reserve methods for multi-arg or multi-effect operations.

## Path Aliases

Defined in `tsconfig.app.json` and `vite.config.ts` — keep in sync. Prefer aliased imports over relative paths for anything crossing a top-level directory.

`@src`, `@app`, `@domain`, `@components`, `@views`, `@panels`, `@spec`.

## Directory Layout

```
src/
  app/         — router, app-state, app-wide singletons
  domain/      — entity classes, database, row types, shared types
  components/  — generic UI primitives
  views/       — routable top-level screens
  panels/      — radio panels (user-arrangeable bench contents)
  stores/      — page-scoped reactive stores (planned)
spec/          — vitest tests
```

## Deliberate Non-Goals

Considered and intentionally deferred. Don't build until asked:

- **Generic repository base class.** Per-entity statics are fine until the duplication actually hurts.
- **Identity map for reactive entities.** Will change the contract of `fetch` when added.
- **`asyncDerived` / observable→state bridge.** Don't extract until a third consumer wants it.
- **Optimistic UI / undo.** `save()` is just `await db.put(...)`.
- **Cloud sync.** Architecture allows it (ULIDs, FK-by-id, async, watch-as-source-of-truth) but no sync code exists.
- **Migration tooling.** v1 schema is still mutable; no real data yet.
- **Multi-user on one machine.** `fetchAll` supports it but UI assumes one operator.
- **Formal MVVM abstractions.** Stores are plain classes with `$state` / `$derived`.
- **Setup as a multi-step flow.** One view, three fields. Devices come later, separately.
- **Icon library.** Radio-domain glyphs (S-meter, SWR, rotator compass) don't exist in general icon sets. Hand-drawn SVG only, to keep one visual language.
- **`svelte-dnd-action`.** Will be the choice when bench drops are wired (Svelte-native, animates, works with flex — `dnd-kit` is React-only, native HTML5 DnD fights touch). Not installed yet.
- **Audio DSP through the current reactive layer.** When audio arrives (waterfalls, FT8, packet), it runs in `AudioWorklet` on a real-time thread. Sample-rate data never crosses into Svelte state, viewmodels, `EntityObserver`, or Dexie. Worklet ↔ main thread communicates at UI rate (~60Hz) via `MessagePort` or `SharedArrayBuffer`, carrying summaries (peaks, FFT bins, decoded messages), not raw samples. Heavy decoders (FT8 LDPC, weak-signal modes) likely belong in WebAssembly inside a worker, not the main thread. **Don't try to generalize the config-plane patterns to cover audio** — it's a different subsystem with different primitives.

## When You're Unsure

- **Naming a new thing** → prefer radio-native words over generic tech words. Hams should recognize the language.
- **Adding a persistent entity** → extend `Entity`, follow the shape of `User` / `Station`.
- **Adding a UI screen** → it's a View. User-facing language stays in the radio domain.
- **Adding reactivity** → don't bolt `$state` onto domain classes. Reactivity lives above the domain.
- **Picking a PanelType id** → choose carefully and treat it as permanent. Panel *instances* persist a reference to their PanelType id; renaming or reusing an id breaks existing user layouts. New PanelType, new id — always.
- **Subscribing to DB changes** → use the entity's `watch*`, not Dexie's `liveQuery` directly.
