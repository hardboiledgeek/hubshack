# Hubshack — Agent Guide

Hubshack is integrated ham radio rig control software. The browser is the host; radios and accessories connect over WebSerial and Web Audio. The product is built around the operator's workflow, not the hardware vendor's UI.

## Domain Terminology

These names appear in the UI, in code, and in conversations with users. They are radio-native by design — use them consistently.

| Term        | Meaning                                                                                                                                                  |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Shack**   | The whole application. The operator's digital shack.                                                                                                     |
| **Station** | A physical/logical operating setup: location, rig(s), antennas. A user can have several.                                                                 |
| **Bench**   | A named arrangement of panels for a specific kind of operating — e.g. "FT8 bench", "contest bench", "nets bench". A tab within a Station.                |
| **Panel**   | An individual UI element a user arranges on a bench: VFO, S-meter, log entry, rotator control, waterfall, etc.                                           |
| **Device**  | A piece of physical gear connected to a Station: radio, amp, rotator, etc. Devices are owned by a Station; panels across many Benches subscribe to them. |
| **View**    | A routable top-level screen in the app (Setup, Station, AddDevice). Lives in `src/views/`. Internal term, not user-facing.                               |

Hierarchy of persisted concepts: **Shack → Station → Bench → Panel**, with Devices parallel to Bench under Station.

## Persistent Domains

Not everything that's persisted is "config." Keep these mentally separate:

- **Account** — identity, callsign-as-login, subscription. Cloud-primary eventually; not built yet.
- **Shack** — Stations, Benches, Panels, Devices. Local source of truth; will become cloud-syncable.
- **Log** — QSO records. Append-mostly, cloud-primary eventually. Not built yet; will likely live behind a REST API rather than IndexedDB.
- **Settings** — true UI preferences (theme, units). Device-local, sync optional. Not built yet.
- **State** — runtime: current VFO, PTT, connection status. Not persisted. Flows via pub/sub from Devices to Panels.

Most widgets get their data from the Devices via pub/sub, not from persisted state. Persisted state is comparatively small; **don't bake assumptions that everything goes through the IndexedDB layer.**

## Architecture

### Domain layer (`src/domain/`)

Plain TypeScript classes representing persistent entities. No reactivity, no Svelte, no UI concerns. Testable in isolation.

- All entities extend `Entity` (`src/domain/entity.ts`), which owns a `readonly #id: string` exposed via an `id` getter, plus a `static generateId()` helper that returns a ULID.
- IDs are **ULIDs** (`ulid` package), not UUIDs. They sort lexicographically by creation time, which is useful for indexed queries and human-readable logs.
- Constructors are `private` on subclasses, `protected` on `Entity`. Construction goes through `static create(...)` (mints a new ID, calls `save()`) or `static fetch(...)` / `static fetchBy*(...)` (restores from storage).
- Fields are private (`#field`) with explicit getter / setter pairs. Identity fields have a getter only.
- Constructors take **discrete positional arguments**, not row objects. Row interfaces (`UserRow`, `StationRow`) are a storage detail confined to `database.ts` and the entity's own `fetch` / `save`.
- Static `create` and `save` both await DB writes. **All public methods return Promises**, even where the underlying call is sync, so the storage layer can be swapped without rippling through callers.
- Relationship accessors return domain objects, not IDs: `user.stations` returns `Promise<Station[]>`, `station.user` returns `Promise<User>` (throws on dangling references — this is a data-integrity bug, not a null case).
- Methods that operate on a relationship take the related entity, not an ID: `Station.fetchForUser(user: User)`, `Station.create(user: User, name: string)`.

### Storage layer (`src/domain/database.ts`)

- IndexedDB via **Dexie**.
- `HubshackDatabase` class extends Dexie. Single shared instance exported as `hubshackDB`.
- Row interfaces (`UserRow`, `StationRow`) describe the storage shape, separate from domain classes.
- Primary keys are `id` (ULID). Natural keys like `callsign` are unique secondary indexes (`&callsign`).
- Foreign keys reference the related entity's `id`, never its natural key — callsigns change, IDs don't.
- Schema versions live in the file. Add `.version(N).stores({...}).upgrade(tx => ...)` blocks rather than editing version 1 once data exists.

### Reactivity (not yet built)

The reactive layer is **not** in the domain. Planned approach:

- **Long-lived state** read by many panels (User, Station, Device, live radio state): reactive entities + identity map, so all consumers share one in-memory instance per ID. Mutations propagate automatically.
- **Transient form state** (Setup form, "edit device" dialog): page-scoped store classes instantiated inside the view. Snapshot from the entity, edit locally, write back on submit. Don't make every keystroke a global event.
- **App-level UI concerns** (`isSetup`, current user, current station): a singleton `appStore` exposing `$state` and `$derived` fields. Views read derived flags rather than touching domain classes directly.

Stores will live in `src/stores/` when introduced. The router will likely become a thin `$derived` over `appStore` state and disappear as a class.

### Pub/sub (not yet built)

Device → Panel data flow will go through a pub/sub bus, not through stores or the domain. Panels subscribe to topics (e.g. "vfoA.frequency"); devices publish. Persisted state is the bench layout and device config; the values themselves are ephemeral.

## File Naming Conventions

**Strict rule, based on extension:**

- `.svelte` files → **PascalCase** (`Setup.svelte`, `Station.svelte`).
- Everything else → **lowercase kebab-case** (`database.ts`, `app-router.svelte.ts`, `user.ts`, `station.ts`).

Yes, this means domain class files like `User` live in `user.ts`, not `User.ts`. **Filename convention is decided by extension, not by what the file exports.**

Avoid abbreviations — `database.ts`, not `db.ts`; `configuration.ts`, not `config.ts`.

## Path Aliases

Defined in both `tsconfig.app.json` (TypeScript) and `vite.config.ts` (build). Keep them in sync.

| Alias           | Path               |
| --------------- | ------------------ |
| `@src/*`        | `src/*`            |
| `@app/*`        | `src/app/*`        |
| `@domain/*`     | `src/domain/*`     |
| `@components/*` | `src/components/*` |
| `@views/*`      | `src/views/*`      |
| `@panels/*`     | `src/panels/*`     |
| `@spec/*`       | `spec/*`           |

Prefer aliased imports over relative paths for anything crossing a top-level directory.

## Directory Layout

```
src/
  app/         — router, app-wide singletons
  domain/      — entity classes, database, row types
  components/  — generic UI primitives (buttons, inputs)
  views/       — routable top-level screens (Setup, Station, AddDevice)
  panels/      — radio panels (the user-arrangeable bench contents)
  stores/      — reactive UI state (planned, not yet present)
spec/          — vitest tests
```

## Deliberate Non-Goals (Right Now)

Don't build these until asked. They've been considered and intentionally deferred:

- **Generic repository base class.** Entities each carry their own static fetch/create. Lifting these into `Entity` requires generics over Dexie tables and adds machinery before the duplication actually hurts.
- **Optimistic UI / undo.** `save()` is just `await db.put(...)`. No queue, no rollback.
- **Cloud sync.** Architecture is designed to allow it (ULIDs, FK by id, async API), but no sync code exists. Don't pre-build sync adapters.
- **Migration tooling.** Version 1 of the schema is still mutable because no real data exists yet.
- **Multi-user / multi-account on one machine.** A `fetchAll` returning multiple Users is supported but the UI assumes one operator.
- **A formal MVVM "ViewModel" abstraction.** Stores will be plain classes with `$state` / `$derived`. Don't reach for INotifyPropertyChanged-shaped patterns.

## Style & Code Conventions

- **No comments unless the _why_ is non-obvious.** Well-named code documents itself. Don't narrate what the next line does.
- **No backwards-compatibility shims** for code that hasn't shipped. Just change the code.
- **No emojis** in code, commit messages, or generated text unless explicitly asked.
- **TypeScript `private` / `readonly`** are compile-time only. When runtime enforcement matters (e.g. the entity ID), use `#`-prefixed private fields.
- **Async everywhere** at storage boundaries, even when the underlying call is sync.

## When You're Unsure

- Naming a new thing → prefer radio-native words over generic tech words. Hams should recognize the language.
- Adding a new persistent entity → extend `Entity`, follow the User/Station shape. Don't invent a new pattern.
- Adding a new UI screen → it's a "view" (lives in `src/views/`). User-facing language stays in the radio domain.
- Adding reactivity → don't bolt `$state` onto domain classes. The reactivity layer lives above the domain.
