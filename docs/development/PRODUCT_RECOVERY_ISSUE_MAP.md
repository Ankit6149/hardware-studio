# Hardware Studio — Product Recovery Issue Map

**Reconciled:** 2026-09-02  
**Current master:** `79902f6fceb0087e7f446960e9c8059841ba4daa`  
**Parent program:** #4 — Hardware Studio product recovery and end-to-end rebuild

This map is subordinate to `PRODUCT_RECOVERY_EXECUTION_PLAN.md` and the live GitHub issue bodies. It defines the dependency order for deep engineering recovery. It must be read alongside the separate U0–U9 Studio convergence plan.

## Important distinction: two parallel programs

### Studio convergence

U0–U9 improves the connected product interaction model.

Current state:

- U0–U7 structurally landed;
- **U8 Release active**;
- U9 final polish pending.

A structurally completed Studio phase does not close its deep engineering issue.

### Engineering recovery

Issues #5–#27 define the deeper product architecture and professional engineering requirements. This map remains the main dependency ordering for that work.

## Phase 0 — Control, truthfulness and scope

### #5 — Product constitution, reference matrix, truthful status and completion gates

Current status: major foundation landed; keep governance documents current as recovery proceeds.

Gate:

- current status and product scope agree;
- historical completion claims cannot override live evidence;
- references/research are mapped to current backlog or explicit non-goals;
- qualification language is controlled.

## Phase 1 — Mandatory product foundations

### #6 — Canonical project schema, IDs, units, ownership and migrations
### #7 / #38 — Durable repository and project storage
### #8 / #39 — Typed commands, transactions, invalidation and undo/redo
### #9 — Workspace shell, navigation, crash recovery and performance foundations
### #10 — End-to-end test architecture and CI quality gates
### #11 / #42 — Legacy/dead-code removal, monolith decomposition and package boundaries

Current reality:

- several individual repairs have landed;
- Studio shell structure is materially better;
- migrations/transactions/tests have improved;
- the full foundation gate remains open because schema/repository/command/package architecture is not yet complete.

Foundation gate:

A project can be created, edited through governed mutations, saved, closed, reopened, migrated, backed up/restored/recovered, and verified without hidden parallel engines or field loss.

No deep domain should bypass these architecture requirements by creating another private state model.

## Phase 2 — Shared engineering truth

### #12 — Canonical product graph, traceability and change-impact engine
### #13 — Component library, symbol/footprint/package models and sourcing lifecycle

Current strengths:

- shared component identity and downstream links have improved;
- Electronics convergence provides a useful reference path.

Remaining gate:

One requirement/component/representation change must produce deterministic relationship/impact/stale-state behavior across affected domains.

## Phase 3 — Electrical vertical slice

### #14 — Authoritative schematic connectivity and ERC
### #15 — PCB topology/routing/DRC/multi-board isolation/safe outputs

Studio state:

- Electronics and PCB are structurally converged.

Engineering state:

- #14/#15 requirements remain deeper than the current UI and local rule engines.

Gate:

A real reference design moves from qualified component definitions through schematic and PCB, survives save/reload/undo, preserves authoritative connectivity, and passes documented native plus independent tool checks without cross-board leakage or guessed data.

## Phase 4 — Mechanical and exact 3D

### #16 — Professional sketch, dimension, constraint and drawing foundations
### #17 — Parametric 3D, parts, assemblies and exact interference on a CAD kernel

Studio state:

- U5 structurally converged one Mechanical workbench with 2D Layout / 3D Review / Assembly.

Engineering state:

- current review geometry does not satisfy #16/#17.

Gate:

A constrained enclosure exists as exact versioned geometry, regenerates parametrically, assembles with exact PCB/package geometry, produces reliable interference/clearance results, and exchanges through declared/independently verified formats.

## Phase 5 — Firmware and physical devices

### #18 — Filesystem-backed firmware workspace and secure PlatformIO/device integration

Studio state:

- U6 structurally converged Firmware and removed implicit module/file selection and duplicate source-navigation ownership.

Engineering state:

- build/device evidence can still be recorded metadata rather than locally executed proof;
- filesystem/build/upload/serial/cancellation/recovery/durable provenance remain open.

Gate:

A supported reference board builds from exact source/environment, flashes only after trusted scoped approval, streams serial output, records real operation evidence, and survives reload/review.

## Phase 6 — Evidence, versions, outputs and release

### #19 — Validation execution, durable evidence, measurements and retest lineage
### #20 — Real versions, branches, comparisons, merges, freezes and immutable releases
### #21 — Blueprints, drawings, manufacturing packages and qualified exports

### #19 current state

U7 structurally landed one Validation drawer and Define → Execute → Review with explicit selection and append-only run history.

Still required:

- durable hashed evidence;
- exact version/procedure/DUT/equipment/operator/environment binding;
- trusted reviewer/signoff;
- durable execution jobs;
- stale propagation and release-grade evidence policy.

### #20/#21 current state

**U8 Release convergence is active.**

U8 may reorganize current readiness/revision/output/drawing/package surfaces, but must not present them as equivalent to:

- immutable content-addressed versions;
- true branch ancestry/three-way merges;
- repository-enforced freezes;
- trusted approval bound to exact candidate hash;
- qualified independently verified artifacts;
- immutable published releases.

Phase gate:

Reviewed evidence and exact content-addressed artifacts can form an immutable release candidate that is blocked by unresolved/stale dependencies and approved only by trusted role-bound decisions.

## Phase 7 — Safe external operation, collaboration and intelligence

### #22 — MCP connected to live repository with typed proposals/approval/audit/undo
### #23 — Backend API, auth, teams, permissions, object storage and collaboration
### #24 — Graph-grounded AI engineering copilot with explain/plan/propose/review
### #25 — Electrical/power/thermal/tolerance/simulation workbench with qualified adapters
### #26 — Qualified interoperability and round-trip adapters

Early research/spikes are allowed, but production implementation must consume the canonical repository, command, graph, version, approval and domain services rather than create parallel sources of truth.

AI/MCP must never gain authority to fabricate geometry, qualification, evidence or human approval.

## Final integration and acceptance gate

### #27 — Independently qualify one complete reference-product vertical slice

#27 is not a demo-polish issue.

It requires the reference product to move through the complete bounded lifecycle with:

- canonical identity;
- durable save/reload/recovery;
- reversible governed changes;
- independent tool/parser checks;
- real physical-device operations where specified;
- durable validation evidence;
- exact content-addressed outputs;
- immutable reviewed release;
- repeatable clean-environment execution.

#27 is the final evidence gate for closing parent recovery epic #4.

## Recommended execution order from current state

The original ordering remains broadly correct, but recovery is now incremental rather than strictly serial.

### Immediate/current

1. finish U8 Release structural convergence without closing #20/#21;
2. run U9 only after U8 structure stabilizes;
3. continue #6/#7/#8/#10/#11/#12 foundations in parallel;
4. deepen #15–#21 behind the already converged workbench structure;
5. preserve exact-head CI and documentation checkpoints after each bounded slice.

### Dependency rule

A domain-engine implementation may proceed when its required foundation interfaces are stable enough, but it must not bypass missing foundation work with another private schema/store/command/repository path.

## Non-deviation rules

- Every production PR has one primary bounded issue/slice and lists secondary dependencies.
- Broad issues are decomposed into reviewable child work before major coding.
- No issue closes because a type, helper, panel, canvas, generated file or isolated test exists.
- No guessed/fallback engineering value may satisfy a qualified check, validation result, manufacturing status or release gate.
- UI/session state must not become a second engineering model.
- Passive navigation must not silently choose canonical records.
- Deep parent issues remain open after UX-only convergence.
- Exact-head lint/typecheck/full tests/build/deployment status are reviewed before merge.
- Current status/domain docs are updated after meaningful merges.

## Current relationship to Studio phases

| Studio phase | Deep engineering issues that remain after structural work |
| --- | --- |
| U0/U1/U2 | #6–#12, #9/#10/#11 particularly |
| U3/U4 Electronics/PCB | #13/#14/#15 |
| U5 Mechanical | #16/#17 |
| U6 Firmware | #18 |
| U7 Validation | #19 |
| **U8 Release** | **#20/#21** |
| U9 polish | does not replace any engineering issue |

The purpose of the two-track model is to let the product become understandable and coherent without lowering the engineering completion bar.
