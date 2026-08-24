# Unified Hardware Studio golden path

**Status:** active connected-object architecture. The bounded issue #64 implementation is complete; the broader V1 convergence program remains active.  
**Current shell decision:** PR #69, merged August 25, 2026.

## Why this exists

Hardware Studio accumulated useful workbenches, but a collection of routes is not a product. A user must be able to carry one engineering object through the complete build process without recreating it, losing context, or returning to unrelated surfaces to unlock the next editor.

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

Owned by canonical `boardComponents` project state today, pending migration into the canonical repository/domain packages.

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

The PCB workbench can recover from an empty project by creating or configuring the real board context. It must never depend on a removed dashboard generator.

A starter outline is explicitly provisional until the user verifies dimensions. It is not silently treated as manufacturing authority.

### Schematic

Owned by component `schematic` placement, `schematicWires`, `nets`, component pin net fields and `padNetAssignments` while the canonical electrical graph is being completed.

The live Schematic editor:

- places existing project instances;
- connects their real pins;
- creates or reuses canonical nets;
- exposes ERC findings linked to responsible objects;
- does not create a second project component from a library definition;
- uses in-app dependency review for destructive whole-product changes.

### PCB

Owned by component `pcb` placement, board geometry, traces, vias, constraints and pad-net assignments.

PCB is part of the **Electronics** product area in the V1 shell. Board setup, routing rules and DRC are contextual PCB tools, not separate product domains.

The live PCB editor receives the selected board, component and net from shared UI context while editing canonical project records.

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

A component-linked test stores the same component ID and current canonical net IDs. The validation editor remains capable of generic requirement/factory testing, but selected-object context is preserved across handoffs.

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

## V1 Studio frame

The V1 shell deliberately has one stable product lifecycle:

`Home → Define → Electronics → Mechanical → Firmware → Validate → Release`

The global shell owns only:

1. product-area navigation;
2. the active area's compact primary-workbench navigation;
3. project/storage state and recovery;
4. the active workbench.

The owning workbench supplies its own toolbar, inspector, findings/status and contextual next action. Supporting tools remain inside that workbench instead of becoming additional global routes the user has to learn.

The following are **not** part of the current V1 shell architecture:

- workflow profiles;
- custom domain visibility configuration;
- Scope/show-hidden-domain controls;
- permanent workspace coaching;
- permanent “Start here” tutorials beside every workbench.

Those systems were removed in PR #69 because they duplicated navigation and guidance rather than completing the engineering lifecycle.

## Connected handoff rules

### Components → Schematic

- preserve board, definition and instance IDs;
- place the selected instance if explicitly requested and unplaced;
- focus the existing symbol if already placed;
- navigation alone must never create engineering data.

### Schematic → PCB

- preserve board, instance and net context;
- if no board exists, the PCB workspace must expose the real setup action;
- otherwise open PCB with the same selected object.

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
- create tests with `linkedComponentIds` and `linkedNetIds` only through an explicit mutation action.

## Empty-state rule

Every empty state must do one of the following:

- create the real missing canonical object after an explicit user action;
- route to the workbench/tool that owns it;
- explain why progress is blocked.

It must not reference deleted actions, hidden generators, unrelated dashboards, or create placeholder engineering truth merely by opening a view.

## Current completion boundary

Issue #64 proved a bounded connected Electronics → PCB → 3D path with one component/board/net identity and production verification. It did **not** complete the broader product architecture.

The remaining convergence work is governed by the product constitution and recovery plan, especially:

- canonical schema and ownership;
- durable shared repository;
- typed command/transaction lifecycle;
- monolith decomposition;
- browser-level reference-product verification;
- authoritative electrical/mechanical/firmware/validation/release depth.

A new shell wrapper or another navigation abstraction is not progress unless it replaces an existing path and makes the reference-product lifecycle measurably more complete.
