# Hardware Studio Product Recovery and End-to-End Execution Plan

**Audit baseline:** `a70a958a2b560dcc2609fb4b61e9e114e0390fcb`  
**Audit scope:** complete repository snapshot, including application routes, all workbenches, Zustand project store, shared types, domain engines, exporters, tests, local bridge, MCP server, CI, and product documentation.  
**Status:** authoritative recovery plan. Existing documents that claim V1/V5 completion do not override this plan.

## 1. Product definition

Hardware Studio should become a connected engineering environment for moving from product intent to a reviewed physical-product release. It should not be a collection of forms and unrelated canvases. Product, mechanical, electronics, PCB, firmware, validation, sourcing, drawings, and releases must operate on one canonical product model.

The first credible product milestone is not “replace Fusion, KiCad, Altium, Onshape, or PlatformIO.” The first credible milestone is a truthful connected V1 that can:

1. create and manage requirements and architecture;
2. create reusable electronic components with linked symbol, footprint, package, sourcing, and 3D representations;
3. create an authoritative schematic connectivity graph;
4. create and validate a multi-layer PCB draft without cross-board leakage;
5. create constrained mechanical sketches and parametric solid features for enclosure/assembly work;
6. map firmware to real components, pins, nets, and build environments;
7. execute validation with durable evidence and retest lineage;
8. create named immutable versions, branches, comparisons, release candidates, and qualified outputs;
9. expose safe semantic operations through MCP and AI without bypassing the command, approval, or audit systems.

## 2. Audit conclusion

The repository contains useful foundations, but the current application is not an integrated V1. The main problem is architectural divergence:

- a 3,700+ line Zustand store combines persistence, project management, commands, history, every domain mutation, generators, and release state;
- the project schema is a large optional object containing legacy and newer representations of the same concepts;
- the browser stores complete projects and command snapshots synchronously in `localStorage`;
- several production-looking engines are only exercised by isolated tests and are not used by the live UI;
- workbench navigation frequently maps several different sidebar entries to the same generic surface;
- the electrical, PCB, mechanical, firmware, validation, and release models are not authoritative enough to support professional operations;
- Three.js is being used as a renderer, but there is no CAD kernel or feature model;
- the MCP server runs against its own in-memory project rather than the user's live project;
- documentation contains mutually contradictory “complete” and “not ready” claims;
- tests validate helpers far more often than end-to-end user workflows.

This should be treated as a controlled rebuild around retained useful code, not as a sequence of cosmetic fixes.

## 3. Immediate safety and truthfulness rules

Until the corresponding recovery issues are complete:

- do not label the product V1 complete, release candidate, factory ready, parametric CAD, authoritative 3D, or fully integrated;
- do not present generated Gerber, drill, CPL, firmware, validation, or release data as qualified output;
- do not silently substitute guessed package dimensions, board dimensions, placements, or geometry in engineering checks;
- do not allow manual checkboxes alone to convert draft output into verified output;
- do not merge new feature work that creates a second model or second engine for an existing domain;
- do not mark an issue complete because types, UI controls, helper functions, or isolated unit tests exist.

## 4. Major findings

### 4.1 Application architecture and UX

- The application is a single full-screen client route with no backend API, durable server repository, authentication, permissions, object storage, or collaboration layer.
- Multiple sidebar destinations render the same component, so the information architecture promises distinct workflows that do not exist.
- View classification is duplicated between shell and sidebar.
- There is no route/deep-link model for project/workbench/object selection.
- There is no global error boundary, recovery mode, command palette, autosave status, storage-health display, or project corruption recovery.
- Broad Zustand subscriptions and a monolithic store create avoidable rerenders and coupling.
- Native browser alerts, confirms, and prompts are used for engineering and destructive actions.

### 4.2 Canonical project model and persistence

- Legacy entities (`nodes`, `edges`, `bom`, `testing`, `pinMap`, etc.) coexist with newer domain entities (`requirements`, `architectureNodes`, `mechanicalObjects`, `firmwareModules`, etc.).
- Board placement exists in both flat and nested structures.
- IDs, units, status values, board ownership, and active-board defaults are inconsistent.
- Complete project maps and unbounded history snapshots are synchronously serialized to browser `localStorage`.
- Some project fields are not included in the store's clean persistence path.
- Import can load a project even when validation reports errors.
- Navigation can mutate project timestamps/state.
- The history model is not whole-project and does not cover every domain.

### 4.3 Product graph and traceability

- Two product-graph implementations exist.
- Most relationships are arrays of IDs without an indexed graph, integrity constraints, domain events, or dependency-specific invalidation.
- Change-impact analysis is incomplete and partly hard-coded.
- There is no reliable mechanism to mark only affected tests, drawings, builds, or releases stale after a change.

### 4.4 Components and sourcing

- The component library is mainly hard-coded local data plus project-local custom definitions.
- Symbol, footprint, pad-stack, package, and 3D representations are not complete editors.
- There is no durable shared library, versioning, lifecycle state, supplier normalization, pricing/stock history, alternate qualification, or datasheet ingestion.
- Component creation and BOM/PCB/schematic registration are not guaranteed transactional.

### 4.5 Schematic and electrical connectivity

- Component placement uses hard-coded board/circuit IDs in one path.
- Wire anchoring has structured fields but retains fragile encoded-ID fallbacks.
- The editor lacks hierarchical sheets, buses, ports, global/local labels, junction semantics, no-connect markers, annotation workflows, and robust wire editing.
- ERC is heuristic and text-driven rather than based on a complete electrical pin/connectivity model.
- There is no qualified KiCad interchange or round-trip test.

### 4.6 PCB editor and manufacturing data

- Active-board identifiers are inconsistent (`board-main`, `board_main`, `board_0`, and template-specific IDs).
- Some selection/hit-testing and generators can operate outside the active board.
- Route anchors and net identity mix net IDs and net names.
- Routing can end as dangling drafts and does not persist a complete source/target topology.
- Autorouting and auto-placement are demonstrations, not engineering algorithms.
- DRC omits major classes of rules and uses simplified bounding boxes.
- Copper zones, topology, layer stackup, impedance, differential pairs, length tuning, thermal relief, and robust board geometry are absent.
- Native manufacturing exporters use simplified custom generation and fallbacks; outputs are not round-trip qualified.

### 4.7 Mechanical 2D

- The live tool supports basic rectangles/circles and simple movement/resizing.
- Polygon is present in types but not a complete creation/edit workflow.
- Rotation, dimensions, and constraints are not authoritative feature relationships.
- “Constraints” immediately rewrite geometry rather than remaining persistent and solvable.
- There is no sketch topology, line/arc/spline system, trim/extend, offset, fillet/chamfer, construction geometry, profile detection, or solver.
- Assembly thickness is parsed from free-form notes instead of typed dimensions.

### 4.8 3D modeling and assemblies

- The WebGL view renders hard-coded/fallback boxes and automatically rotates the scene.
- The first PCB is rendered with fixed dimensions even when an outline exists.
- Missing package dimensions and placements receive guessed values.
- Collision is axis-aligned bounding-box overlap, not authoritative geometric interference.
- The separate “parametric 3D preview” is SVG projection, not 3D modeling.
- There is no feature tree, sketch-to-solid workflow, B-Rep model, boolean operations, shell, fillet/chamfer, sweep, loft, pattern, assembly mates, mass properties, or STEP/IGES exchange.

### 4.9 Firmware and local bridge

- Firmware modules, states, and source files are browser records; the live UI does not call the local bridge.
- The source editor is a textarea without language tooling, project tree, diagnostics, search, diff, or filesystem synchronization.
- Code generation produces TODO skeletons and is not the authoritative build source.
- Hardware mapping links components but does not comprehensively model pins, peripherals, interrupts, buses, addresses, clocks, DMA, or conflicts.
- The bridge performs real `pio` process calls, but approval tokens are not bound to explicit human-approved operations, CORS/path policy needs hardening, long-running operations are not tracked/cancellable, overwrite reports success without writing, and serial monitoring is absent.

### 4.10 Validation and evidence

- The live Validation Studio edits definitions and evidence text, but does not execute the validation runner.
- Evidence is a text field/reference, not durable content with hashes, provenance, reviewers, or object storage.
- Validation runs are not connected to device serials, project versions, firmware builds, equipment/calibration, environmental conditions, or sample plans.
- There is no complete retest comparison, immutable run review, statistical analysis, or sign-off workflow.

### 4.11 Revisions, branches, releases, and outputs

- Revisions are deep JSON snapshots stored inside the same project.
- Branching and merging do not cover every domain and do not implement full base/source/target change semantics.
- Release candidates mutate revision records and fabricate output identifiers rather than freezing actual content-addressed artifacts.
- Eligibility checks are incomplete.
- A freeze flag is not reliably persisted through every save path.
- Blueprints and manufacturing files can be generated from incomplete/guessed data and manually marked verified.

### 4.12 MCP and AI

- The MCP transport uses the official SDK, but starts with a separate default in-memory project.
- Several listed resources have no matching resource handler.
- Proposal application shallow-merges arbitrary patches instead of executing typed domain commands.
- Component deletion leaves cross-domain references orphaned.
- Audit records can claim approval without a trusted approval event.
- There is no live project selection, authentication, authorization, persisted proposal queue, UI review, or command-level undo.

### 4.13 Testing, CI, and documentation

- CI runs lint, TypeScript, Vitest, and Next build, but does not verify the browser workflows.
- Vitest runs in Node; UI workbenches have no meaningful interaction coverage.
- Many tests validate isolated helpers or disconnected engines.
- There are no browser end-to-end, visual regression, accessibility, storage corruption, migration fuzz, security, real PlatformIO, real MCP client, manufacturing round-trip, or 3D rendering gates.
- Status documents contradict one another; some claim complete V1/V5 while the honest status document says the system is partial.

## 5. Target architecture

### 5.1 Repository layout

Move toward a monorepo with explicit boundaries:

```text
apps/
  web/                 browser workbenches and collaboration UI
  desktop/             optional Tauri shell and local filesystem/device access
  api/                 projects, users, permissions, revisions, artifacts, sync
services/
  local-bridge/        secure loopback operations and device sessions
packages/
  domain/              canonical schemas, IDs, units, invariants
  commands/            typed commands, events, transactions, undo/redo
  repository/          local and remote repository interfaces
  product-graph/       relationships, indexes, impact analysis, stale propagation
  electrical/          components, connectivity, ERC
  pcb/                 geometry, routing topology, DRC
  mechanical/          sketches, constraints, feature model, CAD-kernel adapter
  firmware/            workspaces, mappings, PlatformIO contracts
  validation/          tests, measurements, evidence, runs, retests
  release/             versions, branches, merges, freezes, manifests
  interchange/         KiCad, STEP/STL/DXF, BOM, manufacturing adapters
  mcp/                 safe semantic tools over repository + commands
```

### 5.2 Data architecture

- Canonical versioned domain schema with deterministic IDs and typed units.
- Repository interface used by UI, API, MCP, tests, and local bridge.
- Local-first cache using IndexedDB/OPFS or SQLite in a desktop shell; PostgreSQL for shared server state when collaboration is enabled.
- Object storage for images, evidence, CAD files, build artifacts, and release packages.
- Transactional command/event log with immutable named versions and content-addressed release artifacts.
- Derived render/export caches that are reproducible and invalidated from dependency changes.

### 5.3 3D architecture

Three.js should remain the rendering layer, not the modeling kernel. Use a real CAD kernel—preferably Open CASCADE Technology through a maintained WASM/native adapter—for B-Rep topology, booleans, fillets, shells, tessellation, and STEP exchange.

V1 modeling scope:

1. sketches containing lines, arcs, circles, polygons, construction geometry, dimensions, and constraints;
2. profile detection and validation;
3. feature history for extrude, cut, revolve, fillet/chamfer, shell, pattern, and datum/reference operations;
4. parts/bodies with stable topology references and generated tessellation caches;
5. assembly instances, transforms, simple mates, exploded views, clearances, and exact interference;
6. component package and PCB STEP placement inside assemblies;
7. STEP/STL import/export and drawing views.

Do not attempt to write a CAD kernel from scratch.

### 5.4 Electrical architecture

- One authoritative connectivity graph from component pins through labels, junctions, nets, pads, vias, traces, and zones.
- Rule engines operate on typed pin classes, net classes, board stackup, geometry, and manufacturing constraints—not labels/notes.
- Use KiCad interchange/CLI as a qualification and interoperability path while native editors mature.
- Never generate fabrication output from unresolved topology or fallback geometry.

### 5.5 MCP and AI architecture

- MCP and AI read/write through the same repository and typed command service as the UI.
- Read operations can be immediate; write operations create explicit proposals with deterministic diffs.
- High-impact commands require a trusted approval record bound to project, command, user, expiry, and exact payload hash.
- Every applied operation produces a command/event record and can be reverted where domain-safe.
- AI output should explain assumptions and unresolved evidence; it must not invent geometry or approval.

## 6. Phased execution

### Phase 0 — Recovery control and truthfulness

Create the authoritative product constitution, reference matrix, completion gates, status vocabulary, safety gates, and epic backlog. Remove contradictory completion claims and disable misleading release/fabrication language.

**Exit gate:** one authoritative plan; every domain has a truthful status and owner; no simulated/guessed output is presented as verified.

### Phase 1 — Foundation before features

Normalize schema/IDs/units; introduce repository abstraction and durable storage; build typed command/event transactions; implement complete undo/redo; rebuild shell/error recovery; establish browser/system test infrastructure; split monolithic boundaries.

**Exit gate:** a project can be created, edited through commands, closed, reopened, migrated, backed up, restored, corrupted safely, and tested without data loss.

### Phase 2 — Product graph and component truth

Build indexed graph/invariants/change impact; rebuild shared component definitions, representations, lifecycle, sourcing, and transactional instantiation.

**Exit gate:** changing a component or requirement produces a deterministic impact set and stale propagation across affected domains.

### Phase 3 — Electrical vertical slice

Rebuild schematic connectivity/ERC, PCB ownership/topology/routing/DRC, and qualified KiCad/manufacturing interchange.

**Exit gate:** a small real reference design can go from component library to schematic to PCB, survive save/reload/undo, pass native and KiCad checks, and produce reviewable non-fallback outputs.

### Phase 4 — Mechanical and real 3D

Build sketches/constraints/features, CAD-kernel adapter, assembly model, exact interference, PCB/package integration, STEP/STL exchange, and drawing generation.

**Exit gate:** a constrained enclosure can be modeled parametrically, edited by feature, assembled with PCB/components, checked for interference, versioned, and exported to STEP/STL.

### Phase 5 — Firmware and device workflow

Build filesystem-backed firmware projects, editor/language tooling, typed hardware mapping, PlatformIO environments/build/upload/monitor workflows, secure bridge operation records, cancellation, and artifact linkage.

**Exit gate:** a project can build and flash a supported reference board through explicit approval, with logs/artifacts recorded against the correct product version.

### Phase 6 — Validation, versions, release, and manufacturing

Build evidence storage, measurements, equipment context, immutable runs/retests, branch/version/merge system, release gates, drawings, manifests, and content-addressed artifacts.

**Exit gate:** a release candidate cannot be approved until all required evidence, checks, reviews, and exact artifacts are present and frozen.

### Phase 7 — Backend, collaboration, MCP, AI, and extensions

Add API/auth/permissions/teams, project sync, object storage, collaboration, live MCP repository access, proposal UI, AI workflows, simulation adapters, and integration APIs.

**Exit gate:** multiple authorized users and approved AI clients can work on one project without bypassing versioning, commands, approval, or audit.

## 7. Definition of done for every issue

An issue is complete only when all applicable conditions are met:

1. one canonical model is used; no parallel representation is introduced;
2. the real UI uses the production implementation;
3. state persists through the repository and survives reload/migration;
4. operations use typed commands and transactions;
5. undo/redo and cancellation behave correctly where applicable;
6. dependency effects and stale outputs are deterministic;
7. errors are recoverable and visible without native browser dialogs;
8. automated tests exercise production workflows, not copied helper logic;
9. CI runs the relevant package and integration gates;
10. manual verification evidence is attached to the issue;
11. documentation and status are updated truthfully;
12. no fallback or guessed engineering data is silently treated as valid.

## 8. Reference-product principles

- **Flux:** browser-native electronics workflow, one synchronized schematic/PCB model, contextual AI with user approval, live component/sourcing data, simulation, and collaboration. Hardware Studio should learn from the interaction model, not copy its branding or limit itself to electronics.
- **Onshape:** immutable versions, editable workspaces, branches, comparisons, explicit merge ancestry/conflicts, and release history.
- **Fusion/FreeCAD/Open CASCADE:** feature-based solid modeling, real CAD topology, manufacturing exchange, and assemblies.
- **KiCad:** mature electrical semantics, file interchange, ERC/DRC, CLI verification, and manufacturing/3D exports.
- **PlatformIO:** environment-based embedded builds, device discovery, upload targets, and serial monitoring.

New references supplied later must be added to the reference matrix and mapped to existing issues. They must not create unplanned side work or bypass phase dependencies.

## 9. Backlog governance

- The recovery epic is the single parent workstream.
- P0 issues must be completed before broad feature expansion.
- Each epic must be decomposed into reviewable implementation issues before coding starts.
- Every PR references one issue, states affected domains, includes migration/rollback notes, and contains verification evidence.
- No issue may be closed with “foundation,” “UI added,” or “tests pass” as the only evidence.
- Scope changes require updating this plan and the parent epic before implementation.
