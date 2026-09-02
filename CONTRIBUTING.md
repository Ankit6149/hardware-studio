# Contributing to Hardware Studio

Hardware Studio is an experimental connected engineering workspace. Contributions should increase **truthful, connected engineering behavior** rather than feature count or visual surface area.

**Documentation sync:** 2026-09-02  
**Current master at sync:** `79902f6fceb0087e7f446960e9c8059841ba4daa`  
**Active Studio phase:** U8 — Release convergence  
**Current structural UX state:** U0–U7 landed; U8 active; U9 intentionally deferred.

> Structural UX convergence does not mean the underlying engineering engine is complete. The deep recovery issues remain the authority for real capability.

## Before contributing

Read these in order:

1. [Current Status](docs/CURRENT_STATUS.md)
2. [Studio Phase Execution Status](docs/development/STUDIO_PHASE_EXECUTION_STATUS.md)
3. [Product Recovery Execution Plan](docs/development/PRODUCT_RECOVERY_EXECUTION_PLAN.md)
4. [Architecture](docs/ARCHITECTURE.md)
5. [Safety and Limitations](docs/SAFETY_AND_LIMITATIONS.md)
6. [Product Vision](docs/PRODUCT_VISION.md)
7. the relevant domain convergence/research notes.

Research documents describe useful target models and external-tool lessons; they do not prove a feature exists.

## Core contribution rule

A feature is not complete because:

- a TypeScript interface exists;
- a helper function exists;
- a test creates an object;
- a UI tab, card, panel, or button exists;
- an SDK dependency is installed;
- documentation describes intended behavior;
- lint, typecheck, tests, or build pass in isolation;
- a generator emits a file name;
- a local approximation returns a result.

A production vertical slice normally needs the appropriate combination of:

1. canonical domain model;
2. real production engine/adapter;
3. command/store integration;
4. production UI using the shared Studio grammar;
5. persistence and migration behavior;
6. undo/redo or transactional semantics where applicable;
7. cross-domain identity, staleness, impact, or provenance;
8. automated tests exercising production behavior;
9. explicit truth/limitation handling;
10. documentation and current-status updates.

## Current architecture expectations

### One canonical product context

Do not create private duplicate engineering models inside components. UI/session state may contain panel state, active representation, explicit local selection, and similar ephemeral state. Canonical requirements, components, boards, geometry, firmware records, validation records, revisions, outputs, and relationships belong to the project model/repository architecture.

### One Studio shell grammar

Reuse:

- TopBar;
- workbench tabs;
- contextual Project Drawer;
- central work surface;
- shared Inspector;
- shared bottom dock;
- status bar.

Do not add another permanent navigation rail, duplicate Inspector, duplicate Problems implementation, or a mini-app shell inside a workbench.

### Explicit selection

Passive navigation must not silently choose the first available canonical record. A board/module/file/test/run/revision/artifact becomes active because the user explicitly selected or created it, or because a clearly defined persisted context owns it.

### Typed engineering commands

User and MCP mutations should converge on typed, auditable domain operations rather than ad hoc component mutations.

### Reversible changes

Pointer interactions should follow the transaction model:

```text
begin
→ transient preview
→ commit once
→ persist
```

A drag should not create dozens of undo entries.

### Derived outputs and staleness

Changes to source engineering data should invalidate or mark dependent analysis/output/review state stale. Never silently keep a release/output/validation claim green after its dependencies changed.

### Missing data

Do not invent authoritative engineering values. Missing package dimensions, board identity, geometry, evidence, provenance, calibration, tool version, or release hashes must remain visible as unresolved state, warning, or blocker according to domain policy.

## Deep-engine boundaries that must stay honest

Current structural workbenches do not close the following recovery authorities:

- #15 — real PCB/ECAD depth;
- #16 — sketch and constraints;
- #17 — CAD kernel/features/assemblies;
- #18 — firmware filesystem, PlatformIO, device and serial execution;
- #19 — durable validation execution/evidence/review;
- #20 — versions, branches, comparisons, merges, freezes and immutable releases;
- #21 — qualified drawings, manufacturing packages and outputs.

The active U8 phase may reorganize Release UI, but it must not present snapshot revisions/status toggles/generated files as #20/#21-grade engineering guarantees.

## Do not overstate completion

Avoid broad phrases such as:

- production ready;
- fabrication ready;
- fully integrated;
- complete professional implementation;
- all engineering gates pass.

Use scoped language such as:

- foundation;
- structural UX convergence;
- implemented local rule set;
- experimental;
- draft/unqualified;
- needs review;
- blocked;
- verified for a named workflow and exact commit.

## Development setup

```bash
npm install
npm run dev
```

Routes:

```text
/                    public landing page
/studio              Project Home
/studio/requirements
/studio/architecture
/studio/components
/studio/schematic
/studio/pcb
/studio/mechanical
/studio/firmware
/studio/validate
/studio/release
```

Studio routing uses clean paths. Do not reintroduce hash-based Studio navigation.

## Required verification for a bounded PR

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Then inspect deployment status for the **exact PR head**. If Vercel fails because of an external plan/build-rate limit, document that separately from application correctness; never report deployment success when no deployment occurred.

Before merge:

1. verify changed-file scope;
2. verify there is no accidental landing-page redesign;
3. scan for duplicate/retired shell paths;
4. verify no silent first-record fallback was introduced;
5. verify parent engineering issues remain correctly open;
6. verify truth labels and unsupported capability boundaries;
7. merge with expected-head SHA protection when available;
8. update the phase/domain documentation checkpoint.

## Testing expectations

Tests should exercise production behavior and exact contracts.

Avoid tests that:

- manually construct the desired final state and claim the production flow created it;
- duplicate simplified production logic inside the test;
- check only that something is defined;
- accept an empty collection as proof of success;
- use disclaimer copy as proof of correctness;
- hard-code stale UI text when the real behavioral contract is stronger.

Prefer guards for:

- exact state transitions and undo/redo;
- canonical object identity across workbenches;
- board isolation;
- explicit selection;
- one-drawer/one-Inspector/one-dock ownership;
- missing-data blockers;
- validation execution authority;
- immutable/history semantics where implemented;
- deterministic output/provenance rules.

### Browser E2E

Do not add a heavy browser-automation stack casually or use it as a substitute for deterministic domain tests. However, recovery issues that explicitly require end-to-end browser proof may introduce a reviewed E2E strategy. The decision should be deliberate, scoped, reproducible in CI, and documented.

## Engineering safety

Never remove warnings or blockers merely to make the UI look complete. Current manufacturing and release output still requires independent engineering and toolchain review.

Examples of required external review include:

- verified schematic/PCB review;
- CAM/Gerber/Excellon inspection for fabrication outputs;
- DFM review by the fabricator/assembler;
- verified component footprints/package geometry;
- exact mechanical CAD/clearance review where required;
- prototype and validation testing;
- applicable regulatory/safety review.

## Pull request structure

A focused PR should explain:

- problem and user job;
- affected domains;
- canonical state ownership;
- production files changed;
- persistence/migration behavior;
- undo/redo/transaction behavior where relevant;
- cross-domain impact;
- tests and exact-head verification;
- known limitations/non-goals;
- parent issues that intentionally remain open;
- screenshots/logs when they materially improve review.

## Suggested commit style

```text
feat(pcb): preserve structured route anchors
fix(bridge): bind approvals to upload target
refactor(commands): share pointer transaction controller
test(validation): reject implicit first-run context
docs(status): record release qualification boundary
```

Avoid `complete`, `final`, or `production-ready` unless the statement is deliberately narrow and fully evidenced.

## High-value contribution areas

- canonical schema/repository/migrations;
- command and event architecture;
- computational geometry;
- schematic connectivity/ERC;
- PCB topology/routing/DRC;
- mechanical constraints/CAD integration;
- firmware workspace/device tooling;
- validation execution/evidence/provenance;
- version/release architecture;
- drawing/manufacturing qualification;
- MCP safety and typed operations;
- interoperability and independent verification.

For broad architectural changes, open or update an issue first and explain the domain model, migration impact, reversibility, safety implications, and how the proposal fits the recovery execution plan.
