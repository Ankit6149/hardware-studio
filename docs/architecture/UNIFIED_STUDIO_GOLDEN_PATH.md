# Unified Hardware Studio Golden Path

**Reconciled:** 2026-09-02  
**Current master:** `79902f6fceb0087e7f446960e9c8059841ba4daa`  
**Current Studio phase:** U8 — Release convergence

## Purpose

Hardware Studio must allow one product and its engineering objects to move across domains without being recreated, silently copied, or losing identity.

The original first connected-object proof focused on Electronics:

```text
Component definition
→ project component instance
→ schematic placement / pins / nets
→ PCB placement / routing context
→ BOM / representation context
→ linked validation
```

That remains an important golden path. The broader product path is now:

```text
Product Home / requirements / architecture
→ components
→ schematic / PCB
→ mechanical context
→ firmware
→ validation Define / Execute / Review
→ readiness / outputs / release
```

This document defines ownership and handoff principles. It does not claim the deep engineering engines behind every step are complete.

## 1. Canonical engineering ownership

### Component definition

Owned by the reusable component-library domain.

Contains reusable knowledge such as:

- library/revision identity;
- manufacturer and part number;
- category/name;
- pin definitions/electrical roles;
- symbol/footprint/package references;
- datasheet/provenance/qualification metadata where known.

A definition is not automatically a project instance, schematic placement, PCB placement, or qualified part.

### Project component instance

The project-specific component identity is consumed by downstream workbenches.

Current code still uses project structures such as `boardComponents` pending deeper canonical schema/repository migration. The important product rule is that Schematic, PCB, BOM, Firmware links, Mechanical representation links and Validation should refer to the same instance identity rather than create parallel copies.

Useful instance relationships include:

- stable instance ID;
- library-definition source;
- reference designator;
- board ownership/context;
- pins and canonical net IDs;
- schematic representation/placement;
- PCB footprint/placement;
- package/mechanical references;
- BOM relationship;
- architecture links;
- firmware links;
- validation links.

### Board

Board identity belongs to canonical project engineering state.

Rules:

- board-scoped operations must use explicit board identity;
- missing board context remains unresolved or routes to setup;
- no new placeholder `board_0`-style truth should be invented;
- selected-board exports/checks must not leak other-board objects;
- board outline/stack/geometry must carry appropriate provisional/authoritative trust state.

### Schematic connectivity

Current foundations use project component instances, structured pin anchors, wires/nets and related connectivity state.

Rules:

- moving/rotating a symbol should not destroy electrical identity;
- wires should connect to structured anchors rather than display-only coordinates;
- component deletion/replacement should expose relationship impact;
- Schematic must not create a second copy of a project component merely to render it;
- ERC claims are limited to implemented checks.

### PCB

PCB consumes the same project component/net/board identity.

The converged PCB workbench owns contextual board setup, rules, DRC and BOM access through its drawer/workbench grammar.

Rules:

- active board must be explicit;
- component/net context should survive Schematic → PCB handoff;
- routing/DRC state must refer to canonical engineering objects;
- DRC results belong in the shared bottom Problems surface;
- no fake auto-route/auto-place completion;
- current routing/rule depth remains governed by #15.

### Mechanical context

Mechanical uses one workbench with 2D Layout / 3D Review / Assembly representations.

Rules:

- board/package/component links should preserve shared IDs;
- exact geometry must not be inferred from an attractive visualization;
- 3D review is derived visualization unless backed by exact qualified geometry;
- missing dimensions/models remain unresolved;
- #16/#17 remain the authority for sketch/CAD depth.

### Firmware

Firmware consumes canonical hardware/component/pin/net relationships and owns firmware records.

Converged rules:

- opening Firmware does not silently select the first module/file;
- one Firmware Project Drawer owns Modules / Files / Map / Environment context;
- source editor does not own a second private Explorer;
- generated files are scaffolding, not verification;
- recorded build/device evidence is metadata unless a real execution chain produced it;
- successful build evidence is not silently selected for downstream device evidence;
- #18 remains open for real filesystem/PlatformIO/device/serial execution.

### Validation

Validation owns canonical test definitions and run records.

U7 established explicit responsibilities:

#### Define

- test name/stage/category;
- requirement/component/net/firmware links;
- procedure instructions and expected results;
- expected measurement/tolerance schema;
- pass criteria;
- editable definition/reference context.

Definition state is not execution evidence.

#### Execute

- explicitly selected test;
- observation/measurement input supported by the current runner;
- evidence reference;
- reviewer/operator attribution where supported;
- explicit manual verdict where required;
- creation of a new append-only run/retest record.

#### Review

- explicitly selected historical run;
- frozen run snapshot/history;
- logs/output/provenance currently captured by the project record;
- read-only historical interpretation.

Rules:

- no implicit first-test or first-run selection;
- linked component/net IDs should be canonical;
- manual/physical tests do not auto-pass from text/measurement alone;
- current evidence is not yet #19-grade durable release evidence.

### Version / Release context

U8 is the active convergence phase.

Release must eventually connect the same complete product state to:

- editable workspace identity;
- immutable named version;
- branch ancestry;
- comparisons/merge conflicts;
- readiness/blockers;
- exact generated artifacts;
- validation evidence;
- release candidate;
- trusted approval;
- immutable published release.

Current revision/output foundations do not yet provide all of those guarantees. #20/#21 remain open.

## 2. UI-only Studio context

UI/session stores may preserve navigation and selection context such as:

- active board ID;
- active component definition/instance;
- active net;
- selected object;
- active representation;
- selected firmware module/file;
- selected validation test/run;
- Project Drawer section;
- Inspector/dock state;
- origin/return-workbench hints.

This state is intentionally separate from canonical engineering data.

Clearing a UI context store must not delete or rewrite engineering project state.

## 3. Current Studio frame

The former lifecycle-rail idea has been superseded.

Current global frame:

```text
TopBar
→ workbench tabs
→ contextual Project Drawer
→ central work surface
→ shared Inspector
→ shared bottom diagnostics/jobs/evidence dock
→ status bar
```

Top-level workbench access currently includes:

```text
Home / Requirements / Architecture / Components / Schematic / PCB /
Mechanical / Firmware / Validate / Release
```

Product development is iterative; this is not a forced linear wizard. Project Home and domain evaluators may recommend the next action without preventing the engineer from moving between connected views.

## 4. Connected handoff rules

### Project Home → domain

- next action derives from real domain evidence;
- counts are inventory, not completion;
- navigation must not mutate engineering state merely to make the destination usable.

### Components → Schematic

- preserve definition/instance/board context;
- an explicit placement action may create placement state;
- navigation alone must not duplicate/create engineering records.

### Schematic → PCB

- preserve board/component/net context;
- if required board context is missing, expose setup/blocker rather than invent a board;
- open PCB around the same connected object where possible.

### PCB → Mechanical / 3D review

- preserve board/component context;
- distinguish exact geometry from provisional envelopes;
- visualization never grants clearance/manufacturing authority.

### Electronics / Mechanical → Firmware

- preserve canonical component/pin/net identities where links exist;
- hardware mapping references real project IDs;
- source/module selection remains explicit.

### Any domain → Validation

- preserve relevant requirement/component/net/firmware context;
- creating a linked test is an explicit mutation;
- entering Validation does not silently pick a test;
- run/review context remains explicit.

### Validation → Release

- Release should consume accepted current evidence without rewriting historical runs;
- stale/failed/missing required evidence must remain a release blocker;
- current browser run history is not yet a substitute for #19-grade evidence binding.

### Engineering state → Outputs / Release

- outputs derive from explicit source context;
- missing version/geometry/provenance must remain unresolved;
- generator success does not equal qualification;
- selected artifact/package/revision context must be explicit;
- #20/#21 remain the authority for professional release/output guarantees.

## 5. Empty-state rule

Every meaningful empty state should do one of three things:

1. explicitly create the real missing canonical object after a user action;
2. route to the workbench/context that owns the missing object;
3. explain the blocker and what evidence/input is required.

It must not:

- create placeholder engineering truth on view open;
- silently choose the first unrelated record;
- refer to deleted generators/actions;
- fabricate dimensions/placements/evidence;
- mark a domain complete because its collection is non-empty.

## 6. Cross-domain trust rule

A representation or result carries only the authority its source can support.

Examples:

- component family visual ≠ qualified exact package;
- Three.js view ≠ CAD-kernel solid;
- local DRC ≠ complete ECAD qualification;
- state-machine structural scan ≠ firmware runtime verification;
- approximate AABB screen ≠ exact physical clearance proof;
- generated ZIP ≠ qualified manufacturing package;
- JSON snapshot ≠ content-addressed immutable version;
- status field ≠ trusted release approval.

Handoffs must preserve these trust boundaries rather than becoming more confident downstream.

## 7. Golden-path proof status

### Proven structural progress

The repository now has meaningful integration/regression coverage around:

- shared Electronics component/board/net identity;
- Schematic → PCB/BOM/Validation relationships;
- PCB explicit board context;
- Mechanical representation synchronization;
- Firmware explicit module/file/evidence grammar;
- Validation explicit Define/Execute/Review grammar;
- Project Home evidence-driven next action.

### Still not proven end to end at professional depth

The following remain major blockers to a true release-grade reference journey:

- normalized canonical schema;
- durable cross-process repository;
- complete typed command/event architecture;
- professional PCB engine;
- professional sketch/CAD engine;
- real firmware workspace/device execution;
- durable trusted validation evidence;
- immutable version/release architecture;
- qualified drawings/manufacturing artifacts;
- independent interchange/tool verification;
- selected production browser E2E journey through the complete reference product.

## 8. Current completion boundary

U0–U7 prove that Hardware Studio can increasingly feel like one connected product rather than disconnected pages. They do **not** prove every workbench is professionally complete.

U8 must finish Release structural convergence without hiding #20/#21 gaps. U9 will then polish the stable shell.

The deeper engineering recovery program remains the final authority for whether the reference product can move from requirements to a trustworthy reviewed release.
