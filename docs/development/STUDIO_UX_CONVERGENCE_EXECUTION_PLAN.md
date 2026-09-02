# Hardware Studio — Studio UX Convergence Execution Plan

**Original decision:** 2026-08-30  
**Reconciled:** 2026-09-02  
**Current master:** `79902f6fceb0087e7f446960e9c8059841ba4daa`  
**Status:** subordinate Studio/interaction plan to `PRODUCT_RECOVERY_EXECUTION_PLAN.md`  
**Current phase:** **U8 — Release convergence**

This plan governs information architecture, shared shell composition, progressive disclosure, cross-domain handoffs, contextual tools, interaction consistency and migration away from disconnected mini-app patterns.

It does **not** lower or replace the engineering acceptance criteria for schema, repository, commands, PCB, Mechanical, Firmware, Validation, versions/releases or qualified outputs.

## 1. Why this plan exists

Hardware Studio accumulated many useful workbenches, but a list of routes is not a coherent engineering product.

The product must feel like:

> **I am in one product/project. Requirements, architecture, components, schematic, PCB, Mechanical, Firmware, Validation and Release are connected views of the same product.**

It must not feel like:

> I am opening unrelated engineering apps that happen to share a database.

The convergence program therefore prioritizes:

- one shared Studio grammar;
- explicit engineering context;
- canonical identity across representations;
- progressive disclosure;
- contextual diagnostics/evidence;
- truthful empty/blocker states;
- removal of duplicate navigation and private mini-app shells.

## 2. Benchmark lessons

The plan draws interaction lessons from established engineering tools without copying their visual styling.

### Flux

Useful pattern:

- major engineering views as workspace/document tabs;
- contextual project drawer for utilities/objects;
- one Inspector;
- less simultaneous chrome.

Hardware Studio lesson: top-level navigation should represent meaningful product views; editor utilities belong to the active workbench.

### KiCad

Useful pattern:

- large primary canvas;
- contextual hierarchy/properties/tool panels;
- editor tools remain inside editor context rather than becoming product-level pages.

Hardware Studio lesson: board setup, rules, nets, DRC/ERC and similar tools should not become independent global applications.

### Altium

Useful pattern:

- contextual panels;
- cross-probing between representations;
- selection identity persists across schematic/PCB views.

Hardware Studio lesson: canonical object identity matters more than identical panel layout.

### Autodesk Fusion Electronics

Useful pattern:

- linked Schematic / PCB / 3D representations under one Electronics umbrella;
- synchronized document context.

Hardware Studio lesson: connected representations should not look like copied datasets.

### Onshape

Useful pattern:

- stable document context;
- workflow-specific tools;
- feature/assembly trees next to the active work surface.

Hardware Studio lesson: Mechanical should reveal tools based on the active representation/job rather than expose every capability globally.

### PlatformIO / VS Code

Useful pattern:

- files/editor separated from build/upload/monitor/problems/terminal output;
- execution output lives in supporting regions.

Hardware Studio lesson: Firmware execution/evidence belongs in a bottom operation/evidence dock rather than inside source authoring.

### NI TestStand

Useful pattern:

- test authoring and execution/review are distinct jobs.

Hardware Studio lesson: Validation should separate **Define / Execute / Review**.

## 3. Universal UX principles

### 3.1 One product, many representations

A requirement/component/board/net/Mechanical object/firmware module/validation test/release object keeps canonical identity while the workbench representation changes.

### 3.2 Progressive disclosure

Do not show every capability permanently.

- shell: project/product context;
- workbench tabs: major views;
- Project Drawer: domain objects and contextual tools;
- center: active engineering job/representation;
- Inspector: explicit selected object;
- bottom dock: diagnostics, operations, evidence, logs, jobs;
- status bar: compact state.

### 3.3 Context before taxonomy

The UI should help users perform the current engineering job, not teach the internal component/module taxonomy of the application.

### 3.4 Explicit selection

Passive navigation does not silently choose the first engineering record.

This is a central safety and predictability rule for board/module/file/test/run/revision/artifact/candidate context.

### 3.5 Contextual guidance

Permanent instructional paragraphs should not consume scarce editor space.

Use:

- Project Home;
- empty states;
- blockers/attention;
- tooltips/help;
- first-use guidance;
- compact next-action information.

### 3.6 Recommendations, not artificial workflow locks

Hardware development is iterative. Project Home may recommend the next action, but experienced users can open any valid workbench directly.

### 3.7 Truth is part of UX

- approximate looks approximate;
- unresolved stays unresolved;
- draft output looks draft;
- missing evidence remains visible;
- unsupported capability is not hidden behind optimistic wording.

## 4. Current Studio anatomy

```text
+----------------------------------------------------------------------------+
| TopBar: Hardware Studio | Project | storage/save | undo/redo | search ...   |
+----------------------------------------------------------------------------+
| Home | Requirements | Architecture | Components | Schematic | PCB | ...      |
+-------------------+--------------------------------------+------------------+
| PROJECT DRAWER    |                                      | INSPECTOR        |
|                   |         ACTIVE WORK SURFACE          |                  |
| objects/context   |                                      | explicit         |
| tools/files/rules |                                      | selection        |
+-------------------+--------------------------------------+------------------+
| Problems | checks | builds | device | evidence | jobs | logs               |
+----------------------------------------------------------------------------+
| compact status / coordinates / unresolved context                            |
+----------------------------------------------------------------------------+
```

This grammar is now a product baseline, not merely a design proposal.

## 5. Shell ownership rules

### TopBar

Owns global product/application concerns:

- project identity;
- storage/save/recovery state;
- global undo/redo where supported;
- search/command entry where implemented;
- global application settings/context.

It should not expose every domain operation.

### Workbench tabs

Own top-level engineering views.

Current top-level structure includes:

- Home;
- Requirements;
- Architecture;
- Components;
- Schematic;
- PCB;
- Mechanical;
- Firmware;
- Validate;
- Release.

### Project Drawer

Owns contextual navigation/objects/tools for the current workbench.

Examples:

- PCB: setup/rules/DRC/BOM/board context;
- Mechanical: object/assembly context;
- Firmware: modules/files/map/environment;
- Validation: tests/coverage/factory QA/runs;
- Release U8 target: readiness/revisions or versions/outputs/drawings/factory package/release context.

### Center work surface

Owns the primary user job or representation.

It should not become a permanent dashboard of every supporting tool.

### Inspector

Owns contextual properties/actions for the explicitly selected object/record.

It is not a second navigation system.

### Bottom dock

Owns supporting output such as:

- Problems;
- ERC/DRC;
- build/device/serial output;
- validation run logs/evidence;
- generation/preflight jobs;
- operation logs.

Closed docks should not permanently steal canvas/workspace size.

### Status bar

Owns compact state only.

## 6. Freeze rules

Do not introduce:

- a new permanent global domain rail;
- a new persistent subnavigation bar for each workbench;
- a second Inspector/property system;
- a second Problems/diagnostics system;
- a dashboard-card system inside every editor;
- long permanent coaching headers;
- duplicate context cards whose only purpose is to restate current navigation;
- hash-fragment Studio routing;
- UI-only duplicate engineering data models.

Do not redesign the approved public landing page during Studio convergence.

## 7. Phase status

### U0 — Architecture lock — **Landed**

Established:

- target mental model;
- navigation freeze;
- issue reconciliation;
- migration plan.

### U1 — Shared Studio shell — **Foundation landed**

Established:

- workbench tabs;
- contextual Project Drawer host;
- shared Inspector;
- shared bottom dock;
- status grammar;
- clean `/studio/...` routes;
- legacy hash migration compatibility.

Deep shell/repository/performance issues remain separate.

### U2 — Project Home — **Landed**

Established:

- one primary next action;
- lifecycle rows driven by domain evidence;
- attention/blocker queue;
- count/inventory separated from readiness.

Durable recent change history awaits repository/event infrastructure.

### U3 — Electronics reference workbench — **Structurally converged**

Established:

- connected component identity;
- cross-representation patterns;
- Electronics workflow evaluation;
- contextual tools rather than more global destinations.

### U4 — PCB — **Structurally converged**

Established:

- one PCB drawer;
- one Inspector;
- DRC Problems bottom dock;
- explicit board context/rules grammar;
- no convergence work pretending to deliver professional autorouting/placement.

Engineering depth stays with #15.

### U5 — Mechanical — **Structurally converged**

Established:

- one Mechanical drawer/workbench;
- explicit physical input;
- 2D Layout / 3D Review / Assembly representations;
- shared selection/Inspector/dock;
- 3D review explicitly non-authoritative.

Engineering depth stays with #16/#17.

### U6 — Firmware — **Structurally converged**

Established:

- one Firmware drawer/workbench;
- explicit module/file selection;
- module/behavior/map/source center representations;
- shared Inspector;
- bottom Problems / Build Evidence / Device Evidence grammar;
- generated source and recorded evidence truth boundaries;
- retired duplicate `FirmwareStudio` implementation removed.

Engineering execution stays with #18.

### U7 — Validation — **Structurally converged**

Established through PR #116:

- one Validation drawer;
- explicit test/run selection;
- Define / Execute / Review;
- specification separated from actual observations;
- read-only historical review;
- shared Inspector;
- run logs/output in shared bottom dock;
- current execution authority kept bounded.

Exact final head passed lint/typecheck, **339/339 tests across 89 files**, production build and Vercel status.

Engineering evidence/execution depth stays with #19.

### U8 — Release — **Active**

Goal:

Make Release one predictable control surface while preserving the difference between current foundations and professional release authority.

#### Current structural problems to audit/replace

- readiness/revision/output/drawing/package surfaces may behave like independent pages;
- revision/output/candidate context can be implicit or inconsistently owned;
- generator/download surfaces can visually outrank their qualification evidence;
- release/readiness state can over-rely on legacy helper assumptions;
- selected record/Inspector/preflight ownership must become predictable.

#### U8 target grammar

**Project Drawer**

- Readiness;
- Revisions / future Versions context;
- Outputs;
- Drawings;
- Factory Package;
- candidate/release context only where real records exist.

**Center**

- selected Release job/surface;
- no duplicated navigation dashboard.

**Inspector**

- explicitly selected revision/output/package/candidate/release record only.

**Bottom dock**

- blockers;
- generation/preflight jobs;
- logs;
- review/evidence where real records exist.

**Top actions**

- contextual actions only;
- no fake approval/release shortcuts.

#### U8 truth constraints

- no silent first revision/release/artifact/candidate selection;
- no JSON snapshot presented as content-addressed immutable version;
- no status toggle presented as trusted approval;
- no generated file/ZIP presented as qualified artifact merely because generation succeeded;
- missing source version/provenance/qualification remains visible;
- draft/unqualified output remains visually distinct;
- no second UX-only release data model;
- #20/#21 remain open.

### U9 — Final polish — **Pending**

Only after U8 structure stabilizes:

- visual hierarchy/design system;
- accessibility/keyboard behavior;
- responsive layouts/overflow;
- editor density/readability;
- motion where useful;
- performance/profiling;
- empty/error/recovery consistency;
- selected browser E2E/smoke journeys.

U9 must not hide unresolved engineering state.

## 8. Cross-domain selection rules

The same canonical object should preserve identity where supported.

Examples:

- component: library definition → project instance → schematic → PCB → BOM → Mechanical/package → Firmware links → Validation;
- net: Schematic → PCB → Firmware mapping → Validation;
- board: PCB → Mechanical/3D → outputs → Release;
- validation: requirement/component/net/module links → runs → Release evidence;
- output: exact source context → artifact → candidate/release.

UI selection is ephemeral. Engineering relationships are canonical project/repository state.

## 9. Empty and blocker-state rules

Every empty state should either:

1. explicitly create the real missing object after user action;
2. route to the owning workbench/context;
3. explain the blocker.

Never create placeholder engineering truth merely because a view opened.

## 10. Completion gate for every U-phase slice

Before merge:

1. inspect exact changed-file scope;
2. verify no accidental landing redesign;
3. verify no duplicate shell ownership;
4. verify no implicit first-record fallback;
5. run exact-head lint;
6. run exact-head typecheck;
7. run full tests;
8. run production build;
9. inspect exact-head deployment status;
10. distinguish external Vercel capacity from application failures;
11. confirm deep engineering parent issues remain correctly open;
12. update domain notes + `STUDIO_PHASE_EXECUTION_STATUS.md`.

## 11. Relationship to the recovery plan

The UX plan intentionally stops at structural/product interaction claims.

Examples:

- a coherent PCB workbench does not establish authoritative PCB topology;
- a coherent Mechanical workbench does not create a CAD kernel;
- a coherent Firmware workbench does not prove local compilation/device execution;
- a coherent Validation workbench does not create release-grade evidence provenance;
- a coherent Release workbench will not create immutable versions or qualified artifacts.

Those remain governed by `PRODUCT_RECOVERY_EXECUTION_PLAN.md` and the live GitHub issues.

## 12. End state of this convergence program

After U9, the Studio should be:

- understandable as one product;
- consistent enough that domain switching is predictable;
- explicit about current engineering context;
- free of duplicate navigation/Inspector/Problems ownership;
- clear about draft/approximate/unresolved state;
- ready for deeper engineering engines to grow without re-fragmenting the user experience.

The product will still require the deep recovery program before it can earn professional replacement-level claims.
