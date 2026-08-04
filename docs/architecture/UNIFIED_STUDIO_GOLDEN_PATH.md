# Unified Hardware Studio golden path

Status: active P0 integration architecture for issue #64.

## Why this exists

Hardware Studio accumulated useful workbenches, but a collection of routes is not a product. A user must be able to carry one engineering object through the complete build process without recreating it, losing context, or returning to a generic dashboard to unlock the next editor.

The first production golden path is:

`Component definition → project component instance → schematic placement → pins and nets → PCB placement/routing → lightweight board 3D → BOM → validation`

This document defines which layer owns each fact and which UI state may be temporary.

## Canonical engineering ownership

### Component definition

Owned by the component library domain.

Contains reusable knowledge such as:

- library ID and revision identity;
- name, category, manufacturer and part number;
- symbol and footprint references;
- pin definitions and electrical roles;
- package metadata and datasheet provenance.

A definition is not automatically a project component and is not automatically placed in a schematic or PCB.

### Project component instance

Owned by canonical `boardComponents` project state.

This is the shared identity used by every downstream workbench. It contains:

- one stable instance ID;
- source `libraryId`;
- reference designator;
- selected board ID;
- component pins and their net assignments;
- schematic placement state;
- PCB placement state;
- footprint/package references;
- BOM link;
- architecture and circuit links;
- lifecycle and qualification notes.

Component Library creates this instance. Schematic, PCB, BOM, 3D and Validation consume it. Those editors must not create parallel copies.

### Board

Owned by canonical `boards` plus `boardOutlines`.

Board Designer can recover from an empty project by creating a starter board or opening Board Settings. It must never depend on a removed dashboard generator.

A starter outline is explicitly provisional until the user verifies dimensions. It is not silently treated as manufacturing authority.

### Schematic

Owned by component `schematic` placement, `schematicWires`, `nets`, component pin net fields and `padNetAssignments`.

The live unified Schematic editor:

- places existing project instances;
- connects their real pins;
- creates or reuses canonical nets;
- exposes ERC findings linked to responsible objects;
- does not create a second project component from a library definition;
- uses an in-app dependency review before whole-product deletion.

### PCB

Owned by component `pcb` placement, board geometry, traces, vias, constraints and pad-net assignments.

The live Board Designer receives the selected board, component and net from shared UI context, while editing canonical project records.

### Lightweight 3D

Owned as a derived visual view, not engineering authority.

The connected board 3D view:

- filters to the selected board;
- highlights the selected canonical component;
- uses the board outline when available;
- uses package dimensions when available;
- labels provisional envelopes when exact dimensions are missing;
- renders only on interaction, resize or visibility return;
- does not auto-rotate or run a permanent animation loop;
- releases WebGL resources when closed.

It must never authorize dimensional clearance, interference, mass, manufacturing or release. Exact STEP/B-Rep authority remains part of the CAD-kernel roadmap.

### BOM

Owned by canonical `bom` records and the component instance's `bomItemId`.

A selected project component can create one linked BOM record. Electrical values remain blank until they are explicitly qualified; the UI must not infer authoritative values from a generic family visual.

### Validation

Owned by canonical `validationTests` and `validationRuns`.

A component-linked test stores the same component ID and current canonical net IDs. The validation editor remains capable of generic requirement/factory testing, but selected-object context is preserved above it.

## UI-only Studio context

`studioContextStore` is intentionally separate from project persistence.

It may store:

- active board ID;
- active component-definition ID;
- active component-instance ID;
- active net name;
- selected object type and ID;
- origin and return workbench;
- requested mechanical/3D mode.

It must not become a second engineering database. Clearing this store must not modify project records.

## Persistent Studio frame

Every workbench is mounted under:

1. the complete product build map;
2. the context bar when the workbench participates in shared object flow;
3. the workbench itself;
4. the shared findings/status area.

Workflow profiles control focus and emphasis. They do not remove discoverability of Product, Mechanical, Electronics, PCB, Firmware, Validation or Outputs from the build map.

## Connected handoff rules

### Components → Schematic

- preserve board, definition and instance IDs;
- place the selected instance if unplaced;
- focus the existing symbol if already placed.

### Schematic → PCB

- preserve board, instance and net context;
- open Board Settings when no board exists;
- otherwise open Board Designer with the same selected object.

### PCB → 3D

- preserve board and selected instance;
- open the event-driven board-context viewer;
- mark provisional dimensions and preview trust.

### Any engineering workbench → BOM

- preserve selected component;
- show its linked BOM row first;
- create a link through `bomItemId`, not a copied name.

### Any engineering workbench → Validation

- preserve selected component and active net;
- create tests with `linkedComponentIds` and `linkedNetIds`.

## Empty-state rule

Every empty state must do one of the following:

- create the real missing canonical object;
- route to the workbench that owns it;
- explain why progress is blocked.

It must not reference deleted actions, hidden generators or unrelated dashboards.

## Completion requirements for issue #64

The issue remains open until:

- one canonical component identity completes the full golden path;
- integration tests verify board, definition, component, pins, wires, nets, PCB placement, BOM and validation links;
- touched native browser dialogs are removed;
- CI and production builds pass;
- a Vercel preview and merged production deployment are verified;
- the production `/studio` route is healthy;
- the broader open boundaries are documented without closing unrelated parent issues.
