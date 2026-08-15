# Hardware Studio Current Status

**Last reviewed:** August 15, 2026  
**Engineering implementation baseline reviewed:** `5a60f37f80d6ea9da25a0dfda98e744ec3243656`  
**Product scope authority:** `docs/product/V1_PRODUCT_CONSTITUTION.md`  
**Stage:** Product recovery and active development  
**Stable release:** None

> This is the single authoritative implementation-status document. `docs/product/V1_PRODUCT_CONSTITUTION.md` is the authority for V1 scope and product boundaries. Historical development audits, issue descriptions, generated reports, and root summaries must not override either document. A passing CI run, helper test, generated file, UI screen, manual checkbox, or agent assertion is not by itself evidence of professional product readiness.

## Summary

Hardware Studio is an ambitious engineering prototype with several real foundations, but it is not a complete or professionally verified V1.

The V1 target is now deliberately bounded: a solo product engineer or small multidisciplinary team must be able to take one small embedded product from requirements through components, schematic, PCB, enclosure/assembly context, firmware, validation, and an immutable reviewed release without invented engineering facts or disconnected object identity.

The reference product is a USB-C powered desktop environmental status node defined in the V1 constitution.

The repository should currently be evaluated as:

- a public product and architecture experiment;
- an early multi-workbench engineering application;
- a foundation for a connected canonical product model;
- a place to consolidate real domain engines incrementally;
- an active recovery effort focused on truthfulness before feature breadth.

It should not be evaluated as:

- production CAD or EDA software;
- a fabrication-ready PCB tool;
- a complete firmware IDE;
- a stable manufacturing-release platform;
- a finished MCP engineering system;
- enterprise PLM, MES, QMS, or collaboration software.

## Status language

The product constitution defines the full qualification vocabulary. This status page uses three compact implementation labels.

### Foundation

A real production implementation exists, but the workflow is not complete enough for professional use.

### Partial

Some production behavior exists, but important parts are disconnected, approximated, simulated, or missing.

### Not ready

The user-facing workflow is absent or does not yet satisfy its engineering requirements.

## Domain status

| Domain | Status | Current reality |
|---|---|---|
| Public landing page | Foundation | Product vision, workbenches, architecture, and limitations are presented publicly, but public wording still needs full alignment to the V1 constitution. |
| Canonical project model | Partial | Board identity and unresolved placement behavior have been tightened, but the project type still contains overlapping legacy/new representations and broad optional state. |
| Canonical project persistence | Foundation | Many product domains persist and round-trip, but the long-term transactional durable repository is not complete and browser storage remains too central. |
| Product requirements and architecture | Foundation | Requirements and architecture surfaces exist; full traceability, governed interfaces, impact analysis, and baseline behavior remain incomplete. |
| Command and undo system | Partial | Command foundations exist, but all engineering writes do not yet share one typed transactional lifecycle. |
| Component identity / representations | Foundation | Canonical component handoff foundations exist; full provenance, qualification, representation lifecycle, and cross-workbench coverage remain incomplete. |
| Schematic connectivity | Foundation | Structured pin anchors exist; ERC, canonical topology, and complete migration/cleanup behavior still require work. |
| PCB editor | Partial | Board-context, routing, DRC, and placement foundations exist; full topology, layers, rules, output qualification, and complete production interaction coverage are unfinished. |
| Mechanical 2D | Partial | Basic objects, movement, resizing, and one-time alignment operations exist; professional dimensions, constraints, sketch solving, and associative geometry are incomplete. |
| WebGL 3D | Partial | A real Three.js view and collision foundation exist, but Three.js remains visualization only and some representations are not exact engineering geometry. |
| Exact CAD / enclosure | Not ready | A qualified exact-solid/kernel workflow from constrained geometry to authoritative STEP is not complete. |
| Firmware workspace | Partial | Source-file and state-machine foundations exist; full configuration, build history, upload, serial, and hardware mapping workflows remain incomplete. |
| Local PlatformIO bridge | Foundation | Real process spawning, tokens, and approval foundations exist; operation tracking, monitor, cancellation, and durable records are incomplete. |
| Validation | Partial | Validation definitions and runner foundations exist; full measurement, evidence, retest, history, immutable run lineage, and review UI are incomplete. |
| Revisions and releases | Partial | Snapshot and release helpers exist; real branch/workspace semantics, merging, conflict handling, candidate invalidation, and immutable release behavior are unfinished. |
| MCP server | Partial | Official MCP SDK foundations exist; the stdio process does not yet operate on the complete live durable canonical repository and writes are not fully proposal/command governed. |
| Blueprints and exports | Partial | Multi-sheet and export foundations exist; some output paths still rely on permissive fallbacks and complete live-data synchronization is unfinished. |
| Manufacturing drafts | Partial | Draft generators and real SHA-256 exist, but strict manufacturing truthfulness and independent qualification are not complete. |
| Readiness | Partial | Readiness calculations exist, but generated artifacts and manual state cannot yet prove professional readiness. |
| CI | Partial | Application lint, typecheck, tests, and build are configured; production browser journeys, interchange qualification, MCP/bridge system gates, accessibility, and visual regression remain incomplete. |

## Verified strengths

The repository contains meaningful work in these areas:

- a broad workbench shell;
- local multi-project state;
- project serialization and migration foundations;
- product architecture and requirement models;
- structured schematic pin anchors;
- initial PCB route validation and DRC foundations;
- board-identity and unresolved-placement normalization work;
- mechanical pointer transactions;
- a real Three.js viewport;
- collision-checking foundations;
- firmware source-file foundations;
- real PlatformIO process execution foundations;
- cryptographically correct SHA-256 manifests;
- initial validation-run logic;
- revision and release helper functions;
- official MCP SDK transport foundations;
- a now-bounded V1 product constitution and reference lifecycle.

## Recent baseline corrections

The August 15 recovery pass intentionally removed or tightened behavior before adding new product breadth.

- Retired UX transport/generated repository debris was removed.
- Duplicate global Studio stage navigation was reduced rather than layered again.
- The properties inspector no longer occupies permanent empty workspace width.
- Component/PCB state no longer intentionally creates placeholder `board_0`, `block_0`, `board-main`, or `board_main` ownership in the repaired paths.
- Missing PCB placement coordinates remain unresolved instead of becoming zero or arbitrary center positions in repaired migration/store paths.
- Legacy real coordinates remain migratable when they actually exist.
- DRC/editor paths were tightened around explicit selected-board context.
- The V1 constitution now defines the only approved scope expansion rule.

These are foundation corrections, not evidence that PCB, manufacturing, schema, shell, or Studio-unification epics are complete.

## Known engineering blockers

### Canonical schema and ownership

- The current `Project` shape still contains overlapping legacy and newer domain representations.
- Flat and nested representations still coexist in parts of the model.
- Stable typed IDs, units, ownership, runtime validation, and migration diagnostics are not yet complete across every domain.
- The monolithic application store still owns too much persistence and domain behavior.

### Command lifecycle

- Not every production engineering write is executed through one typed transactional command boundary.
- Pointer/form history is not yet uniformly coalesced and exact across every workbench.
- Navigation/UI preferences and engineering mutations still need stronger architectural separation.
- Durable event/audit/revert semantics are incomplete.

### PCB

- Connectivity is not yet a complete authoritative graph across traces, vias, intersections, pads, and layers.
- Layer, stackup, physical-rule, anchor, and routing behavior remain incomplete for professional use.
- DRC does not yet represent every required physical and electrical rule.
- Production output qualification is not yet tied tightly enough to explicit board topology and independent checks.

### Mechanical and exact CAD

- Polygon/sketch creation, dimensions, constraints, and feature regeneration are incomplete.
- Current constraint operations are not a professional persistent solver/model.
- A qualified parametric geometry kernel does not exist in the production path.
- Exact-solid versus provisional-envelope trust must be enforced end to end.

### WebGL and collision

- Three.js visualization cannot be treated as CAD authority.
- Missing exact component package geometry must remain unresolved rather than become convenient collision evidence.
- Collision results are not yet independently qualified engineering evidence.

### Firmware and bridge

- Serial-monitor operations are incomplete.
- Long-running operation tracking and cancellation are incomplete.
- Build and upload records are not fully integrated into the canonical project/version/evidence model.
- Approval tokens need stronger binding to operation, project, environment, and device.

### Validation

- Measurement units, tolerance semantics, instruments/fixtures, evidence requirements, review decisions, immutable execution lineage, and retest comparison need deeper integration.
- Release blocking must depend on authoritative validation state, not only checklist-style summaries.

### Revisions and releases

- Production Revisions UI does not yet implement complete workspace/version/branch semantics.
- Merge and conflict resolution are incomplete.
- Candidate invalidation and dependency-driven stale behavior are incomplete.
- Released-state immutability and supersession/new-working-branch flows need complete integration.

### MCP and AI

- MCP does not yet share one durable canonical repository with the browser application.
- Proposed writes are not fully routed through typed application commands and approval/impact review.
- Complete protocol-level client/server tests are missing.
- AI/MCP must never gain authority to invent dimensions, placements, evidence, qualification, or human approvals.

### Manufacturing

- `nativeExports` still contains permissive legacy behavior that must be replaced, not wrapped: first-board/fallback assumptions, guessed dimensions/placement, UI-layout-derived geometry, cross-board leakage risk, and default drill/outline behavior remain under audit.
- Manufacturing files must be generated only from explicit real board identity, real geometry, real placement, and qualified representations.
- Outputs remain planning/draft artifacts until independent parser/viewer/DFM/interchange checks and release evidence are recorded.

### Storage and repository

- Browser-local storage remains too close to the canonical engineering source of truth.
- Transactional durable local storage, repository interfaces, artifact/blob handling, corruption recovery, conflict detection, and future cloud parity are not complete.

### Test architecture

- Passing current lint/typecheck/unit/build gates does not prove the reference product works end to end.
- Browser workflow, accessibility, visual, migration fuzz, storage failure, interchange, real adapter, and performance gates are still required.

## Safety status

Current output is not approved for:

- direct fabrication without independent review;
- medical devices;
- automotive safety systems;
- industrial safety systems;
- mains-powered products;
- certified RF products;
- regulated products;
- unattended production firmware flashing.

Independent engineering review remains mandatory.

## Completion rule

A domain should be described as complete only when:

1. the bounded V1 job and authoritative objects are defined;
2. the production engine exists;
3. the real UI uses it;
4. state persists and reloads correctly;
5. unknown engineering data remains unresolved rather than fabricated;
6. undo/revert and cross-domain impact work where applicable;
7. automated tests exercise production behavior;
8. the reference-product journey exercises the capability end to end;
9. independent qualification is recorded where the claim requires it; and
10. CI/deployment verify the relevant production path.

A type, helper, test object, button, generated file, screenshot, agent assertion, or documentation page is not completion evidence.
