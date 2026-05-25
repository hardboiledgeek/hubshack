# Hubshack — Agent Guide

Hubshack is integrated ham radio rig control software. The browser is the host; radios and accessories connect over WebSerial and Web Audio. The product is built around the operator's workflow, not the hardware vendor's UI.

## How to read this doc

If this is your first time in the repo, read in this order:

1. **Domain Terminology** — disambiguates Panel/Pane/PanelType. Everything else assumes you know these words.
2. **Architecture → Domain layer** — the shape every entity follows.
3. **Views, Panes, View Models** — how the UI is decomposed.
4. **Current scaffolding state** — what's wired to the domain and what's still mocked.

The rest is reference. **Deliberate Non-Goals** at the end tells you what _not_ to build.

## Domain Terminology

These names appear in the UI, in code, and in conversations with users. They are radio-native by design — use them consistently.

| Term          | Meaning                                                                                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Shack**     | The whole application. The operator's digital shack.                                                                                                                                 |
| **Station**   | A physical/logical operating setup: location, rig(s), antennas. A user can have several.                                                                                             |
| **Bench**     | A named arrangement of panels for a specific kind of operating — e.g. "FT8 bench", "contest bench", "nets bench". A tab within a Station.                                            |
| **Panel**     | An individual UI element a user arranges on a bench: VFO, S-meter, log entry, rotator control, waterfall, etc. User-facing word for an _instance_ placed on a Bench.                 |
| **PanelType** | The definition of a kind of Panel (code, not data). Lives in `src/panels/`. A single PanelType can have many Panel instances across Benches, each with its own config and layout.    |
| **Device**    | A piece of physical gear connected to a Station: radio, amp, rotator, etc. Devices are owned by a Station; panels across many Benches subscribe to them.                             |
| **Adapter**   | The piece of code that knows how to talk to a Device and exposes its capabilities on the bus. Panels and Devices are decoupled by Adapters — neither knows about the other directly. |
| **View**      | A routable top-level screen in the app (Splash, Setup, Station). Lives in `src/views/`. Internal term, not user-facing.                                                              |
| **Pane**      | A self-contained chunk of a View (header, sidebar, tab strip, etc.). Named to avoid collision with radio-domain "Panel."                                                             |

Hierarchy of persisted concepts: **Shack → Station → Bench → Panel**, with Devices parallel to Bench under Station.

PanelTypes and Adapters are **code, not data** — registered at app start, looked up by id. Only Panel _instances_ are persisted.

## Current scaffolding state

The architecture is fully described below, but the code hasn't all caught up. As of now:

- **Wired to the domain:** `User`, `Station`, `Bench`. `HeaderPane` and `TabsPane` consume them through `AppState` and `watch*`.
- **Code-not-data, fully wired:** `Panel` (the metadata type) and `PanelRegistry` (the in-memory map, loaded once at app startup from `App.svelte`). Three real Panels ship: `callsign`, `clock`, `on-air`. `LibraryPane` and `BenchPane` both read from the registry.
- **In-VM mocks (no domain entity yet):** `DevicesPane`. `BenchPane` panel instances are in-memory `$state` (lost on reload, shared across tabs because there's one VM).
- **Drag and drop:** wired with `svelte-dnd-action`. Library → Bench works as a palette pattern (drops out, restores). Within-bench reorder works as a side effect. See [[reference-svelte-dnd-action]] memory and the **Drag and drop** section below.
- **Not built:** `PanelInstance` entity (the persisted thing on a Bench), Devices entity, pub/sub bus. Test suite is empty except for a placeholder.

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

Follow the shape of `User`, `Station`, and `Bench`. The non-obvious rules:

- **IDs are ULIDs**, not UUIDs. Sort lexicographically by creation time. `Entity.generateId()` mints them.
- **List order falls out of IDs.** `Bench.fetchForStation` uses `.sortBy('id')` — ULID order = creation order. No separate `order` column on listable entities.
- **Constructors take discrete positional arguments**, not row objects. `UserRow` / `StationRow` / `BenchRow` are a storage detail confined to `database.ts` and the entity's own `fetch` / `save`.
- **All public methods return Promises**, even when the underlying call is sync. Lets us swap storage without rippling through callers.
- **Relationship accessors return domain objects, not IDs**: `user.stations()` returns `Promise<Station[]>`. `station.user()` throws on dangling references — that's a data-integrity bug, not a null case.
- **Methods take the related entity, not its id**: `Station.fetchForUser(user: User)`, not `fetchForUser(userId: string)`.
- **Use `#`-private fields for runtime privacy** (e.g. entity id). TypeScript `private` is compile-time only and doesn't survive `$state` proxies.
- **Transient shared state belongs on the domain entity, not on a VM.** The canonical example is `Station.activeBenchId`: it's read by `TabsPane`, written when the user clicks a tab, and persisted by side effect. Don't lift it to a parent VM.
- **`null` and `undefined` are not interchangeable.** `null` is intentional, set by code, expected — the right value for "entity missing/deleted" or any deliberately-empty slot. `undefined` is "JavaScript did that" or "not yet set" — uninitialized fields, missing object properties, unsignaled state. Type signatures should say `T | null` when absence is part of the contract; reserve `T | undefined` for transient internal state (e.g. `EntityObserver`'s `#lastValue` sentinel for "no emission yet"). Never use `??` to paper over the distinction.

#### The watch API

Each entity exposes `watch*` methods parallel to its `fetch*` methods, returning an `Unsubscribe`. Implementation goes through `EntityObserver` (`src/domain/entity-observer.ts`), which wraps Dexie's `liveQuery`; consumers don't see Dexie.

**Contract:** callbacks fire immediately with the current value, then again on every change — _including changes from other tabs_. `watch(id, cb)` passes `null` when the entity is deleted or missing.

**Queries must never resolve to `undefined`.** `EntityObserver` uses `undefined` as the "no value emitted yet" sentinel for replay-on-subscribe. Singleton fetches normalize `undefined` (Dexie's "row not found") to `null` before returning — e.g. `row ? new Bench(...) : null`. Don't write a `watch*` whose query can pass `undefined` through to `liveQuery`; replay will silently break.

**Sharing:** subscriptions are deduplicated per (subclass, key). Ten VMs calling `Bench.watch(sameId, ...)` share one underlying `liveQuery`; new subscribers get the cached last value immediately. When the last subscriber unsubscribes, the underlying query is torn down.

Implemented via `Entity.observe<T>(key, query)` (protected static on the base class), backed by a `Map<typeof Entity, Map<key, EntityObserver>>` on `Entity`. The partitioning trick: in a static method, `this` is the subclass constructor — so `Entity.#observers.get(this)` returns the bucket for `Bench` when called from `Bench.watch`, without each subclass declaring its own storage. Each `watch*` method on a subclass is a one-liner — picks a key (e.g. `single:${id}`, `by-station:${stationId}`, or `'all'`) and calls `this.observe(...).subscribe(callback)`.

**`watch*` is for config state, not live state.** Anything persisted in Dexie (Stations, Benches, Panels, Devices, layouts) flows through `watch*`. Live runtime values from devices (current VFO, S-meter readings, PTT) do _not_ go through `EntityObserver` or `liveQuery` — they will flow through a separate pub/sub bus from Adapters to Panels (see "Pub/sub" below). Don't try to extend the watch API to cover device telemetry; that's a different problem with different primitives.

### Storage layer (`src/domain/database.ts`)

Dexie. Single shared `hubshackDB` instance. The rules that aren't visible from reading the file:

- **Foreign keys reference `id`, never natural keys.** Callsigns change; ULIDs don't.
- **Schema versions are append-only once real data exists.** Add `.version(N).stores({...}).upgrade(...)` blocks rather than editing version 1. _Currently version 1 is still mutable — no real data yet._
- **Keep Dexie confined to `src/domain/`.** Outside this directory, subscribe via `watch*`, not `liveQuery` directly.

### App-wide state and singletons

Two patterns coexist for app-wide things; pick by lifecycle:

- **`AppRouter` (`src/app/app-router.svelte.ts`) — static singleton.** Private constructor, `AppRouter.instance` accessor, exported as `appRouter`. Use this pattern when the thing has no per-mount subscriptions to manage.
- **`AppState` (`src/app/app-state.svelte.ts`) — context-registered singleton.** Constructed once in `App.svelte`, registered via `registerAppState`, consumed by `fetchAppState()`. Use this pattern when the thing owns `$effect`-driven subscriptions that need to live inside the component tree.

#### AppState

`AppState` is the app-wide reactive view over session selection — _which_ user and station are currently active, plus their live projection from the domain. localStorage is the persistence layer; `AppState` is the runtime source of truth.

- One instance per running app. Writes from one VM are seen reactively by every other VM in the same render — no instance-divergence issues.
- Setters write localStorage and flip the internal id `$state`. An internal `$effect` picks up the id change and re-watches automatically.
- **Not a cache for arbitrary entities.** Only the _current_ user and station, plus per-entity `loaded` flags. Don't add fields for other entities.
- Exposes raw signals, not derived UX state. `userLoaded` and `stationLoaded` say "has this watch fired at least once." Composed flags like "splash is still loading" belong in the consuming viewmodel.

#### Don't try to make domain entities reactive

`User.fetch(id)` returns a fresh instance each call. **Don't try to make a single entity instance reactive in place** — `#` private fields are invisible to Svelte's `$state` proxies. Reactivity lives _above_ the domain (in VMs, in `AppState`), not on it. An identity-mapped reactive entity layer is a deliberate Non-Goal.

### Pub/sub — not yet built

Device → Panel flow will go through a topic bus (`vfoA.frequency`, etc.). Persisted state is the bench layout and device config; the values themselves are ephemeral. **No Panel ever imports an Adapter, and no Adapter knows about Panels** — they communicate only by topic name.

### Routing (`src/app/app-router.svelte.ts`)

Enum-based static singleton. Routes: `Splash`, `Setup`, `Station`.

- **`Splash` is the entry point** and owns the `loading` / `isSetup` routing decision. `App.svelte` is just a switch — no checks there.
- Setup writes `appState.currentUser` / `appState.currentStation` after creating the entities, then calls `appRouter.routeToStation()`. It also creates a default "Main" Bench and sets it as the Station's `activeBenchId` before the route — a Station is never persisted without at least one Bench.

## Station View Layout

The Station view is the operator's working surface. Its chrome is fixed; the bench area is what the user arranges. Implemented as a CSS grid on `<main>` in `Station.svelte`: two columns (sidebar, content), three rows (header, tab strip, bench).

- **Header** — wordmark left; station name + operator callsign center/right; settings gear right.
- **Devices** sidebar section — always visible. Small finite list. `+ Add` at the bottom.
- **Panel Library** — collapsible. Lists `PanelType`s filtered by what installed Devices' adapters can satisfy. Drag source for adding panels to the active Bench.
- **Bench tab strip** — one tab per Bench, `+` after the last creates a new one.
- **Bench area** — flex/tile layout. Drop target. **Per-instance layout overrides (`fullWidth`, span, etc.) will live on the Bench, not on the Panel.**

## Panels and Adapters

> Nomenclature update: the old PanelType / Panel split is now **Panel** (the code-defined kind, with metadata + component + VM) and **PanelInstance** (the persisted placement on a Bench). The Library is the registry of Panels. Documentation below still uses the historic "PanelType / Panel" wording in a few places — read "PanelType" as "Panel" and "Panel" (as instance) as "PanelInstance" until the prose is fully migrated.

Three players meet at the bus:

- **Panel** — code-defined kind of panel. Declares topics it subscribes/publishes (eventually), config schema (eventually), categories, required capabilities, the Svelte component to render, and an optional library icon. Lives in `src/panels/<name>/` as three files: `panel.svelte` (component), `<name>-panel-view-model.svelte.ts` (VM), `<name>-panel.ts` (the `Panel` metadata object, registered with `PanelRegistry`).
- **PanelInstance** — persisted _instance_ of a Panel on a Bench. Will hold the user's config for this placement. Not built yet.
- **Adapter** — code that talks to a Device and publishes/subscribes topics. Each Device declares which Adapters it can host.

### The Library / PanelRegistry

`src/panels/panel-registry.ts` is a plain JavaScript namespace (object with module-level state) — not a class, not a domain entity, not in Dexie. Exposes `load()` and `available()`. `load()` is called once from `App.svelte` before `registerAppState`; it explicitly registers each Panel by importing its module and calling the internal `register(panel)`. The hand-maintained list of registered Panels lives in `load()` — adding a panel is a folder + an import line + a `register(...)` call. No auto-discovery (intentional — see [[panel-registry-pattern]] discussion).

The `Panel` shape (in `src/panels/panel.ts`) is a `type` (not a class — see [[feedback-types-vs-interfaces]] memory). Convert to a class only if/when per-panel behavior shows up; the property surface stays the same so the migration is mechanical.

**Compatibility flows through Adapters, not Devices:**

- A Panel lists adapter _capabilities_ (topics) it requires — not "compatible devices."
- The Panel Library shows a Panel iff every capability it needs is satisfied by some installed Device. (Capability filtering is not yet implemented; `PanelRegistry.available()` returns all.)
- Adding a Device unlocks the Panels its adapters provide; removing it hides them.

**Layout rule:** Panel owns what it _is_ (config). Bench owns where it _goes_ (per-instance layout). Same Panel on two Benches can be different sizes; the same PanelInstance is never on two Benches.

### Icons

Icons live in `src/components/icons/` as `.svelte` components using `stroke="currentColor"` so they inherit Tailwind text color. App-chrome icons (`ChevronIcon`, `GearIcon`, `PlusIcon`) sit alongside domain icons (`DefaultIcon`, `ClockIcon`, `OnAirIcon`, `RadioIcon`, `RotatorIcon`). `DefaultIcon` is the shared fallback for both Panels (in the Library) and Devices. Each Panel/Device may supply its own icon; if absent, the consuming VM falls back to `DefaultIcon`.

### Dynamic component rendering

Render a Svelte component held in a variable by capitalizing the binding in markup:

```svelte
{@const PanelComponent = panel.component}
<PanelComponent />
```

No `<svelte:component>` needed in Svelte 5. The component reference travels from `Panel.component` through view-model projection rows into the rendering component as a value.

## Drag and drop

Library uses `svelte-dnd-action` (already installed). Two zones share `type: 'panel'`:

- **Library (source-only palette):** `dropFromOthersDisabled: true`. `consider` assigns `e.detail.items` back to the state array (required — skipping it crashes the library in an infinite `requestAnimationFrame` loop). `finalize` rebuilds the source list from the registry so dragged items snap back regardless of where they dropped.
- **Bench (target):** `consider` is passive (stores the items array as dnd-action provides it). `finalize` filters out shadow items (marked with `isDndShadowItem: true`) and resolves panels for new arrivals (items without a `component` field), minting a fresh ULID per new instance. Existing instances pass through unchanged so within-bench reordering keeps their ids.

The default yellow drop-target outline is disabled via `dropTargetStyle: {}` on both zones. The library uses `transformDraggedElement` to replace the dragged clone's contents with just the icon at h-10 w-10 — no name, no row chrome.

See [[reference-svelte-dnd-action]] memory for the gotchas that bit us during the first integration. Future work (per-bench keying, drag-out-to-remove, layout/span hints) waits on `PanelInstance` persistence.

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
- Pane VMs source data from `AppState` and domain `watch*` APIs only. No prop-drilling.
- **Shared transient state belongs in the domain**, not on a parent VM passed down. E.g. the active Bench tab lives on the Station entity (`Station.activeBenchId`), so Tabs writes it and any future Bench reader gets it via the Station watcher.
- View-scoped state that doesn't fit the domain (e.g. "is the panel library collapsed") stays local to the one Pane that owns it.

#### VM context — register only when descendants need it

A Pane VM is shared with its descendants via Svelte context **iff a descendant component needs it.** The VM module exports a file-local `ViewModelSymbol`, a `registerViewModel(vm)` helper (calls `setContext`), and a `fetchViewModel()` helper (calls `getContext`, throws if not registered). The Pane root component calls `registerViewModel`; descendants call `fetchViewModel`.

Today only `TabsPane` does this — `Tab.svelte` and `TabMenu.svelte` both call `fetchViewModel` to reach `TabsPaneViewModel`. `HeaderPane`, `DevicesPane`, `LibraryPane`, `BenchPane` keep their VMs as `<script>` locals because nothing descends from them that needs the VM. **Don't add `register`/`fetch` boilerplate prophylactically** — add it the first time a child component needs the VM.

Naming inside the VM file is unqualified (`registerViewModel`, `fetchViewModel`) — the VM type is implicit from the import path.

**Why context, not props, when it's used:** the VM is feature-scoped state. Every component inside the Pane's subtree may need it, and prop-drilling through intermediate components hides nothing and clutters call sites. Symbols give type safety; the `fetch` helper centralizes the "not set" error.

**Display-only components (anything in `src/components/`) take primitive props** and do not call `fetchViewModel`. Reusability across features means refusing to know about any specific VM.

**Local component state stays local.** Display-only state like `menuOpen` belongs on the component (`let menuOpen = $state(false)`), not the VM. The VM owns _application_ state (persisted or shared across the Pane); the component owns _renderer_ state (one widget's open/closed, hover, etc.).

#### Projection rule — VMs present, components render

A VM exposes data in the shape its component needs to render, not the shape the domain stores it in. Components should not reach into domain entities to display fields, compute identity comparisons, or derive view-flags. Concretely:

- **Strings, not entities, for text rendering.** `HeaderPaneViewModel` exposes `callsign: string` and `stationName: string` (derived from `User`/`Station`), not the entities themselves. Placeholders for "not loaded" belong on the VM, not in the template.
- **Pre-computed booleans, not raw ids to compare.** `TabsPaneViewModel` exposes `tabs: BenchTab[]` where each row carries `{ id, name, active, editing }`. The component renders; it does not compare `bench.id === viewModel.activeBenchId`.
- **View-shaped types are local to the VM file.** Name them for the view (`BenchTab`, not generic `Row`). Export only if the consuming component imports the type. Domain entities (`Bench`, `Station`) stay private in the VM.

Action methods (`setActiveBench`, `commitRename`, `submit`, etc.) take raw inputs from the component (an id, a name) and translate them into domain operations. The component still doesn't see domain entities — it passes ids back, the VM does the lookup.

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
    $effect(() =>
      Thing.watch(id, t => {
        this.#thing = t
      })
    )
  }
}
```

The `watch*` API returns an `Unsubscribe`, which is exactly what `$effect`'s cleanup expects — `return` it directly. Svelte tears down the subscription when the surrounding component unmounts.

VMs are constructed in a Svelte reactive context (a component's `<script>`). Tests that exercise observation wrap construction in `$effect.root(() => { ... })`.

## Components (`src/components/`)

Generic, VM-unaware UI primitives. Each accepts a `class` prop and applies it to its root.

### Existing primitives

- **`InlineEdit`** — the canonical inline rename. Props: `value`, `onCommit(value)`, optional `onCancel`. Behavior: autofocus + select on mount; **blur commits**, Enter commits, Escape cancels, empty/whitespace value calls `onCancel` instead of `onCommit`. Used by Tab rename. If you need another inline-edit affordance, reach for this — don't reinvent.
- **Icons** — `ChevronIcon`, `GearIcon`, `PlusIcon`. Inline SVG with `stroke="currentColor"` so they inherit Tailwind text color. No icon library — see Non-Goals.

### Rules

- **Accept a `class` prop** for caller-supplied layout. Svelte does not forward classes through component boundaries:

  ```svelte
  let { class: className = '' }: { class?: string } = $props()
  ```

  Apply to the root: `class="...base... {className}"`.

- **Event handlers are `function` declarations in `<script>`, referenced by name in markup.** No inline arrows in attributes. Factory handlers that close over iteration values use outer `function` + inner arrow:

  ```svelte
  function onActivate(id: string) {
    return () => viewModel.setActiveBench(id)
  }
  <!-- ... -->
  <button onclick={onActivate(tab.id)}>...</button>
  ```

  _Inner_ callbacks attached to listeners inside Svelte actions or other setup functions can be arrows — the `function` rule is about the top-level handler surface, not every nested closure.

- **Extract conditional class fragments into `$derived`** rather than inlining ternaries in `class=` strings. Keeps the structural classes inline and visible; only the variable bit is named:
  ```svelte
  const borderColor = $derived(tab.active ? 'border-amber-400' : 'border-transparent')
  <div class="relative flex items-center border-b-2 {borderColor}">...</div>
  ```
  For components where the whole class string is conditional or has 3+ variants, derive the whole string. For mostly-static class lists with a small conditional, derive only the conditional fragment.

### Svelte actions for DOM lifecycle

Popovers, modals, and other components that need document-level listeners (or imperative DOM setup like autofocus) use a Svelte action (`use:foo`) that attaches listeners and returns `{ destroy }`. The action runs when the element mounts and `destroy` runs when it unmounts — no manual `onMount`/`onDestroy` plumbing.

Two recurring patterns in the codebase:

- **`focusAndSelect`** (in `InlineEdit.svelte`) — one-liner action: `node.focus(); node.select()`. The minimal action; use it whenever an input should be focused on mount.
- **`dismissOnInteraction`** (in `TabMenu.svelte`) — attaches `mousedown` and `keydown` listeners on `document`, calls `onClose` when the target is outside the node or when Escape is pressed. The shape to copy for any new dismiss-on-outside-click popover.

### `mousedown` vs `click` for popovers

If a popover's dismisser listens on `mousedown` (the pattern in `dismissOnInteraction`, so a click outside dismisses on press, not release), the _opener_ must use `onmousedown` — not `onclick` — to call `event.stopPropagation()`. Otherwise the opener's click bubbles to the document before `onclick` fires, the dismisser sees the click as "outside the not-yet-mounted popover," and the popover closes the instant it opens. See `Tab.svelte`'s menu button for the working example.

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

- **No comments unless the _why_ is non-obvious.** Don't narrate what the next line does.
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
  views/       — routable top-level screens, with per-view Panes and VMs
  panels/      — radio panels (user-arrangeable bench contents) — not built yet
spec/          — vitest tests (placeholder only; conventions TBD)
```

## Testing

Vitest is configured; `spec/` currently contains only a placeholder. Conventions are not yet established. When you add the first real test:

- Tests that touch `$state`, `$derived`, or `watch*` must run inside `$effect.root(() => { ... })` so Svelte's reactive context exists.
- Mock at the Dexie boundary, not above it — the watch API and `EntityObserver` are part of the system under test.

If you're about to invent a fixture or harness pattern, note it here in the same PR so it's not reinvented next time.

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
- **Adding a persistent entity** → extend `Entity`, follow the shape of `User` / `Station` / `Bench`.
- **Adding a UI screen** → it's a View. User-facing language stays in the radio domain.
- **Adding reactivity** → don't bolt `$state` onto domain classes. Reactivity lives above the domain.
- **Adding app-wide state** → static singleton like `AppRouter` if it has no subscriptions; context-registered like `AppState` if it observes anything.
- **Adding a Pane VM** → don't register it in context until a descendant needs it.
- **Picking a PanelType id** → choose carefully and treat it as permanent. Panel _instances_ persist a reference to their PanelType id; renaming or reusing an id breaks existing user layouts. New PanelType, new id — always.
- **Subscribing to DB changes** → use the entity's `watch*`, not Dexie's `liveQuery` directly.
- **Inline editing a field** → use `InlineEdit`. Don't roll a new one.
