# Hubshack — Agent Guide

Hubshack is integrated ham radio rig control software. The browser is the host; radios and accessories connect over WebSerial and Web Audio. The product is built around the operator's workflow, not the hardware vendor's UI.

## How to read this doc

This file is an **index of decisions**, not a tutorial. Most rules are one line with a pointer to a canonical file — the *why* lives as a comment at that file, where it fires when you're about to violate it. Read sections 1–4 once for orientation, then skim section 5 as a checklist.

1. **Domain Terminology** — disambiguates Panel/Pane/BenchPanel. Everything else assumes you know these words.
2. **Current scaffolding state** — what's wired vs. mocked vs. not built.
3. **Persistent Domains** — taxonomy of what's persisted and where.
4. **Architecture overview** — one paragraph per layer + a canonical file pointer.
5. **Rules** — flat list of decisions with pointers. Read the comment at the pointer for the *why*.
6. **Adding things** — checklists for the recurring shapes of new work.
7. **Deliberate Non-Goals** — what *not* to build.

## 1. Domain Terminology

These names appear in the UI, in code, and in conversations with users. They are radio-native by design — use them consistently.

| Term          | Meaning                                                                                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Shack**     | The whole application. The operator's digital shack.                                                                                                                                 |
| **Station**   | A physical/logical operating setup: location, rig(s), antennas. A user can have several.                                                                                             |
| **Bench**     | A named arrangement of panels for a specific kind of operating — e.g. "FT8 bench", "contest bench", "nets bench". A tab within a Station.                                            |
| **Panel**     | A kind of UI element a user can arrange on a bench: VFO, S-meter, log entry, rotator control, waterfall, etc. Code, not data — lives in `src/panels/` and is registered with `PanelRegistry` at startup.                                  |
| **BenchPanel** | A persisted _placement_ of a Panel on a Bench. Carries the Bench id, the Panel registry id, and (eventually) per-placement config. The thing that goes in Dexie.                    |
| **Device**    | A piece of physical gear connected to a Station: radio, amp, rotator, etc. Devices are owned by a Station; panels across many Benches subscribe to them.                             |
| **Adapter**   | The piece of code that knows how to talk to a Device and exposes its capabilities on the bus. Panels and Devices are decoupled by Adapters — neither knows about the other directly. |
| **View**      | A routable top-level screen in the app (Splash, Setup, Station). Lives in `src/views/`. Internal term, not user-facing.                                                              |
| **Pane**      | A self-contained chunk of a View (header, sidebar, tab strip, etc.). Named to avoid collision with radio-domain "Panel."                                                             |

Hierarchy of persisted concepts: **Shack → Station → Bench → BenchPanel**, with Devices parallel to Bench under Station.

Panels and Adapters are **code, not data** — registered at app start, looked up by id. Only `BenchPanel` placements are persisted.

## 2. Current scaffolding state

The architecture description below is the target. As of now:

- **Wired to the domain:** `User`, `Station`, `Bench`, `BenchPanel`. `HeaderPane`, `TabsPane`, `LibraryPane`, and `BenchPane` consume them through `AppState` and `watch*`.
- **Code-not-data, fully wired:** `Panel` and `PanelRegistry` (loaded once from `App.svelte`). Three real Panels ship: `callsign`, `clock`, `on-air`. `LibraryPane` and `BenchPane` both read from the registry.
- **Adding panels to a bench:** `+` button on each `LibraryPane` row. Disabled when no bench is active. Drag-and-drop is not wired; `svelte-dnd-action` is uninstalled.
- **In-VM mocks (no domain entity yet):** `DevicesPane`.
- **Not built:** Devices entity, pub/sub bus, per-`BenchPanel` config blob, panel deletion from a bench. Test suite is empty except for a placeholder.

## 3. Persistent Domains

Not everything that's persisted is "config." Keep these mentally separate:

- **Account** — identity, callsign-as-login, subscription. Cloud-primary eventually; not built yet.
- **Shack** — Stations, Benches, Panels, Devices. Local source of truth; will become cloud-syncable.
- **Log** — QSO records. Append-mostly, cloud-primary eventually. Not built yet; will likely live behind a REST API rather than IndexedDB.
- **Settings** — true UI preferences (theme, units). Device-local, sync optional. Not built yet.
- **State** — runtime: current VFO, PTT, connection status. Not persisted. Flows via pub/sub from Devices to Panels.

Most panels get their data from Devices via pub/sub, not from persisted state. **Don't bake assumptions that everything goes through the IndexedDB layer.**

## 4. Architecture overview

**Domain layer (`src/domain/`).** Entity classes (`User`, `Station`, `Bench`, `BenchPanel`) extend `Entity`. Each entity exposes `fetch*` (one-shot) and parallel `watch*` (live) static methods, plus instance `save()`. Follow the shape of `User` or `Bench` for new entities — see section 5 for the rules that aren't visible from the file.

**Storage (`src/domain/database.ts`).** Single shared Dexie `hubshackDB` instance. Confined to `src/domain/` — outside this directory, subscribe via `watch*`, not `liveQuery` directly. Schema versions append-only once real data exists (v1 is still mutable; no real data yet).

**Watch API (`src/domain/entity-observer.ts`).** Wraps Dexie's `liveQuery`. Subscriptions are deduplicated per `(subclass, key)`; new subscribers get the cached last value immediately; the underlying query tears down when the last subscriber unsubscribes. See the comments in `entity.ts` and `entity-observer.ts` for the partitioning trick and the `undefined`-sentinel invariant.

**App-wide state.** Two patterns:
- `AppRouter` (`src/app/app-router.svelte.ts`) — static singleton. No subscriptions to manage.
- `AppState` (`src/app/app-state.svelte.ts`) — context-registered singleton. Owns `$effect`-driven subscriptions over the current user and station.

**Pub/sub (not built).** Device → Panel flow will go through a topic bus (`vfoA.frequency`, etc.). No Panel ever imports an Adapter; no Adapter knows about Panels. Persisted state is layout + config; the values themselves are ephemeral. `watch*` is **not** for telemetry — that's a different subsystem.

**Routing (`src/app/app-router.svelte.ts`).** Enum-based: `Splash`, `Setup`, `Station`. `Splash` owns the `loading` / `isSetup` decision; `App.svelte` is just a switch.

**Views, Panes, View Models.** Each view lives in a lowercase folder under `src/views/`. Views with internal structure decompose into Panes (each in its own subfolder). Each Pane has a `*Pane.svelte` and `*-pane-view-model.svelte.ts`. The Station view is a CSS grid on `<main>`: header / tab strip / bench, with a sidebar holding Devices + Library.

**Panels (`src/panels/`).** Each Panel is a folder of three files: `panel.svelte` (component), `<name>-panel-view-model.svelte.ts` (VM), `<name>-panel.ts` (the metadata object). `panel-registry.ts` is a plain namespace, not a class; `load()` is called once from `App.svelte` and hand-registers each Panel. Compatibility flows through Adapters, not Devices — a Panel lists adapter capabilities it requires.

**Components (`src/components/`).** Generic, VM-unaware UI primitives. Each accepts a `class` prop applied to its root. Existing: `InlineEdit`, `SidePane`, `SidePaneHeader`, and icons in `src/components/icons/`. Display-only components never call `fetchViewModel`.

## 5. Rules

Each rule is a one-liner. Where a *why* would help, the canonical file carries a comment — read it when you're about to touch that code.

### Domain

- **Active selection: flag on child, not FK on parent.** See `Bench.activate()` in `src/domain/bench.ts`.
- **Don't make domain entities reactive.** Reactivity lives in VMs and `AppState`. See `src/domain/entity.ts`.
- **IDs are ULIDs.** Mint with `Entity.generateId()`. List order falls out of ID sort — no separate `order` column.
- **Constructors take discrete positional arguments**, not row objects. `*Row` types are a storage detail confined to `database.ts` and the entity's own `fetch`/`save`.
- **All public methods return Promises**, even when the underlying call is sync.
- **Relationship accessors return domain objects, not IDs.** `user.stations()` returns `Promise<Station[]>`. Methods take the related entity, not its id: `Bench.fetchForStation(station)`.
- **A dangling FK is a data-integrity bug**, not a null case. Throw, don't return null.
- **Use `#`-private fields for runtime privacy.** TypeScript `private` is compile-time only and doesn't survive `$state` proxies.
- **Transient shared state belongs on the domain entity**, not lifted to a parent VM. Every consumer subscribes via `watch*`.
- **`null` is intentional, `undefined` is "JavaScript did that."** `T | null` when absence is part of the contract; reserve `T | undefined` for transient internal state. Never use `??` to paper over the distinction. See the `#lastValue` comment in `entity-observer.ts` for the one place `undefined` is load-bearing.
- **Keep Dexie inside `src/domain/`.** Outside, use `watch*`.
- **FKs reference `id`, never natural keys.** Callsigns change; ULIDs don't.

### Watch API

- **Queries must never resolve to `undefined`.** Singleton fetches normalize Dexie's row-not-found to `null`. See `entity-observer.ts`.
- **`watch*` is for config state, not telemetry.** Device values flow through the pub/sub bus (not built yet), not `EntityObserver`.
- **Each `watch*` is a one-liner** picking a key and calling `this.observe(...).subscribe(callback)`. Keys are strings like `single:${id}`, `by-station:${stationId}`, or `'all'`.

### Views, Panes, VMs

- **Pane VMs are self-sufficient.** A Pane VM never imports another Pane's VM, takes one as a constructor arg, or receives the parent view's VM. Source data from `AppState` and `watch*` only.
- **Local component state stays local.** `menuOpen`, hover, etc. live on the component (`let menuOpen = $state(false)`), not the VM.
- **View-scoped state that doesn't fit the domain** (e.g. "is the panel library collapsed") stays in the one Pane that owns it.
- **VMs present, components render.** VMs expose strings/booleans shaped for the view (`callsign: string`, `tab.active: boolean`), not domain entities. Components don't reach into entities or compare ids.
- **View-shaped types live in the VM file.** Name them for the view (`BenchTab`, not `Row`). Export only when the consuming component imports the type.
- **VM context only when descendants need it.** Add `registerViewModel` / `fetchViewModel` the first time a child component needs the VM, not prophylactically. `TabsPane` is the current example.
- **VMs own their subscription lifecycle.** Set up observation inside `$effect`; `return` the `Unsubscribe` directly — Svelte uses it as the cleanup.
- **Display-only components (`src/components/`) take primitive props** and never call `fetchViewModel`.

### Panels

- **Panel ids are permanent.** `BenchPanel` rows persist references to them. New Panel, new id — always. Never rename or reuse.
- **Layout: Panel owns what it _is_; Bench owns where it _goes_.** Per-instance layout overrides live on the Bench, not the Panel.
- **Panel compatibility flows through Adapters, not Devices.** A Panel lists adapter capabilities it requires.
- **Adding a Panel = folder + import line + `register(...)` call** in `panel-registry.ts`. No auto-discovery.

### Components & Svelte

- **Accept a `class` prop** on every component and apply it to the root. Svelte doesn't forward classes across boundaries.
- **Event handlers are `function` declarations in `<script>`**, referenced by name in markup. No inline arrows in attributes. Factory handlers that close over iteration values: outer `function` + inner arrow.
- **Extract conditional class fragments into `$derived`** rather than inlining ternaries in `class=` strings.
- **Dynamic component rendering: capitalize the binding in markup.** `{@const PanelComponent = panel.component}` then `<PanelComponent />`. No `<svelte:component>` in Svelte 5.
- **DOM lifecycle goes through Svelte actions** (`use:foo` returning `{ destroy }`). See `focusAndSelect` in `InlineEdit.svelte` and `dismissOnInteraction` in `TabMenu.svelte`.
- **`mousedown` openers for `mousedown` dismissers.** If a popover dismisser listens on `mousedown`, the opener must use `onmousedown` with `stopPropagation()`. See the comment in `Tab.svelte`.
- **Use existing primitives.** Inline rename → `InlineEdit`. Dismiss-on-outside-click → copy `dismissOnInteraction`. Don't reinvent.

### File naming & code style

- **`.svelte` → PascalCase. Everything else → lowercase kebab-case.** Filename is decided by extension, not by what the file exports. `User` lives in `user.ts`.
- **No abbreviations in filenames.** `database.ts`, not `db.ts`.
- **Semantic HTML over `<div>`.** Each view's root is `<main>`. Adjacent sections carry their own borders; no wrapper divs for layout. Multi-region top-level layouts use CSS grid on `<main>`.
- **No comments unless the _why_ is non-obvious.** Don't narrate what the next line does.
- **No backwards-compatibility shims** for code that hasn't shipped.
- **No emojis** in code, commit messages, or generated text unless asked.
- **Setters over `setX(value)` methods** when the operation is one assignment.

### Path aliases

Defined in `tsconfig.app.json` and `vite.config.ts` — keep in sync. Prefer aliased imports over relative paths across top-level directories.

`@src`, `@app`, `@domain`, `@components`, `@views`, `@panels`, `@spec`.

## 6. Adding things

- **A persistent entity** → extend `Entity`; follow `User` or `Bench`. Add `fetch*` + parallel `watch*` + `save()`. Foreign keys by `id`. Add a Dexie store in `database.ts`.
- **A UI screen** → it's a View. Lowercase folder under `src/views/`, `PascalCase.svelte` + `*-view-model.svelte.ts`. User-facing language stays in the radio domain.
- **A Pane VM** → don't register it in context until a descendant needs it.
- **A Panel** → folder under `src/panels/<name>/`, three files (`*.svelte`, `*-panel-view-model.svelte.ts`, `*-panel.ts`). Add an import + `register(...)` line to `panel-registry.ts`. Pick an id and treat it as permanent.
- **App-wide state** → static singleton (`AppRouter`-style) if no subscriptions; context-registered (`AppState`-style) if it observes anything.
- **A popover with dismiss-on-outside-click** → copy `dismissOnInteraction`; check the `mousedown` opener gotcha in `Tab.svelte`.
- **Inline editing a field** → use `InlineEdit`. Don't roll a new one.

## 7. Deliberate Non-Goals

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
- **Icon library.** Radio-domain glyphs don't exist in general icon sets. Hand-drawn SVG only, one visual language.
- **Drag-and-drop, currently.** A `+` button covers the add path. Within-bench reorder and library→bench drag are deferred until the layout model firms up; revisit `svelte-dnd-action` (for reorder) and HTML5 native DnD (for adds) then.
- **Audio DSP through the current reactive layer.** Audio runs in `AudioWorklet` on a real-time thread. Sample-rate data never crosses into Svelte state, VMs, `EntityObserver`, or Dexie. Worklet ↔ main thread communicates at UI rate (~60Hz) via `MessagePort` or `SharedArrayBuffer`, carrying summaries (peaks, FFT bins, decoded messages), not raw samples. Heavy decoders (FT8 LDPC, weak-signal modes) likely belong in WebAssembly inside a worker. Different subsystem, different primitives.

## Directory layout

```
src/
  app/         — router, app-state, app-wide singletons
  domain/      — entity classes, database, row types, shared types
  components/  — generic UI primitives + icons
  views/       — routable screens, with per-view Panes and VMs
  panels/      — radio panels (user-arrangeable bench contents)
spec/          — vitest tests (placeholder only; conventions TBD)
```

## Testing

Vitest is configured; `spec/` currently contains only a placeholder. When you add the first real test:

- Tests touching `$state`, `$derived`, or `watch*` must run inside `$effect.root(() => { ... })`.
- Mock at the Dexie boundary, not above it — the watch API and `EntityObserver` are part of the system under test.

If you invent a fixture or harness pattern, note it here in the same PR so it's not reinvented.
