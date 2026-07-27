# Hardware Studio Product Recovery Issue Map

This map is subordinate to `PRODUCT_RECOVERY_EXECUTION_PLAN.md` and parent epic #4. It defines the implementation sequence and prevents work from drifting into disconnected feature development.

## Parent program

- #4 — **[EPIC][P0] Hardware Studio product recovery and end-to-end rebuild**

## Phase 0 — Control, truthfulness, and scope

- #5 — Establish product constitution, reference matrix, truthful status, and completion gates

**Gate:** public/product language is consistent; references are mapped to the backlog; no historical completion claim overrides the recovery plan.

## Phase 1 — Mandatory product foundations

- #6 — Normalize canonical project schema, IDs, units, ownership, and migrations
- #7 — Replace browser localStorage monolith with repository layer and durable project storage
- #8 — Implement typed command bus, transactions, dependency invalidation, and complete undo/redo
- #9 — Rebuild workspace shell, navigation, crash recovery, and performance foundations
- #10 — Establish end-to-end test architecture and CI quality gates
- #11 — Remove legacy and dead code, split the monolith, and enforce package boundaries

**Gate:** a project can be created, edited only through commands, saved, closed, reopened, migrated, backed up, restored, recovered read-only after corruption, and tested without field loss or hidden parallel engines.

No broad PCB, CAD, MCP-write, AI-write, release, or backend feature work should bypass this gate.

## Phase 2 — Shared engineering truth

- #12 — Build canonical product graph, traceability, and change-impact engine
- #13 — Rebuild component library, symbol/footprint/package models, and sourcing lifecycle

**Gate:** one component/requirement change produces a deterministic affected-entity and stale-artifact set across domains.

## Phase 3 — Electrical vertical slice

- #14 — Rebuild schematic editor around authoritative connectivity and ERC
- #15 — Rebuild PCB editor, routing topology, DRC, multi-board isolation, and safe outputs

**Gate:** a real reference design moves from qualified component definitions to schematic to PCB, survives save/reload/undo, and passes documented native plus independent KiCad checks.

## Phase 4 — Mechanical and real 3D

- #16 — Build professional 2D sketch, dimension, constraint, and drawing foundations
- #17 — Build real parametric 3D modeling, parts, assemblies, and interference on a CAD kernel

**Gate:** a constrained enclosure is modeled as exact versioned solids, assembled with exact PCB/package geometry, checked for interference, edited parametrically, and exported/independently opened as STEP/STL according to declared support.

## Phase 5 — Firmware and physical devices

- #18 — Build filesystem-backed firmware workspace and secure PlatformIO/device integration

**Gate:** a supported reference board builds from exact source/environment, flashes only after trusted approval, streams serial output, and records version-bound artifacts and operation evidence.

## Phase 6 — Evidence, versions, outputs, and release

- #19 — Build validation execution, durable evidence, measurements, and retest lineage
- #20 — Build real versions, branches, comparisons, merges, freezes, and immutable releases
- #21 — Rebuild blueprints, engineering drawings, manufacturing packages, and qualified exports

**Gate:** reviewed evidence and exact content-addressed artifacts can form an immutable release candidate that is blocked by unresolved/stale dependencies and approved only by trusted role-bound decisions.

## Phase 7 — Safe external operation, collaboration, and intelligence

- #22 — Connect MCP to the live repository with typed proposals, approval, audit, and undo
- #23 — Add backend API, authentication, teams, permissions, object storage, and collaboration
- #24 — Build graph-grounded AI engineering copilot with explain-plan-propose-review workflows
- #25 — Add electrical, power, thermal, tolerance, and simulation workbench with qualified adapters
- #26 — Build qualified interoperability and round-trip adapters for KiCad, STEP/STL/DXF, PlatformIO, BOM, and external tools

These issues can have early research/spike tasks, but production implementation must consume the canonical repository, commands, graph, version, approval, and domain services rather than introducing parallel paths.

## Final integration and acceptance gate

- #27 — Deliver and independently qualify one complete reference-product vertical slice

#27 is not a demo-polish task. It is the closing acceptance gate for #4 and requires a complete evidence bundle, independent tool/parser verification, physical-device operations where specified, repeatable clean-environment execution, and an immutable release.

## Start order

Begin with:

1. #5 — product constitution/reference/status rules;
2. #6 — canonical schema/IDs/units/migrations;
3. #7 — repository and durable storage;
4. #8 — commands/transactions/undo/invalidation;
5. #10 — testing gates in parallel from the first foundation change;
6. #11 — remove/consolidate legacy paths incrementally as authoritative replacements land;
7. #9 — shell work in parallel, but finalize against the new repository/route model.

Then proceed to #12 and #13 before beginning full electrical or mechanical implementation.

## Non-deviation rules

- Every implementation PR references exactly one primary issue and lists secondary dependencies.
- Every issue is decomposed into reviewable child implementation issues before major coding begins.
- New references are recorded in #5 and mapped to an existing issue, later issue, or explicit non-goal before implementation.
- No issue closes because a type, helper, button, canvas, document, unit test, or generated file exists.
- Completion requires the production UI, repository, commands, persistence, undo/redo, tests, error/recovery behavior, documentation, and evidence listed in the issue.
- No fallback or guessed engineering data may satisfy a qualified check, validation result, manufacturing status, or release gate.
