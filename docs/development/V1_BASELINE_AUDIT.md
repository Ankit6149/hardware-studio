# V1 Baseline Audit — Historical Record with Current Reconciliation

**Original audit date:** 2026-07-20  
**Original commit baseline:** `17918b01d232fbb82b6360fe20208ae4148440a6`  
**Reconciled:** 2026-09-02  
**Current master:** `79902f6fceb0087e7f446960e9c8059841ba4daa`  
**Authority status:** historical audit; **not** current product status.

For current truth, use:

1. `docs/CURRENT_STATUS.md`;
2. `docs/development/STUDIO_PHASE_EXECUTION_STATUS.md`;
3. `docs/development/PRODUCT_RECOVERY_EXECUTION_PLAN.md`;
4. live GitHub issue acceptance criteria.

## Why this audit is still useful

The July 20 baseline captured the early recovery state before the later architecture and Studio convergence program. It documents real defects that motivated subsequent work:

- lint failures and weak verification coverage;
- incomplete serialization/migration;
- snapshot-heavy undo/redo;
- dangling schematic-wire behavior;
- weak PCB board/routing context;
- immature 3D/CAD authority;
- incomplete Firmware build/device integration;
- incomplete Validation/release/MCP systems;
- legacy/dead components.

Those findings are useful historical context. They must not be read as the present backlog verbatim because many surfaces have since changed or been replaced.

## Original verification snapshot

At commit `17918b01...` the audit recorded:

| Check | Historical result |
| --- | --- |
| `npm run lint` | fail — 12 errors / 42 warnings |
| `npm run typecheck` | pass |
| `npm test` | 33/33 tests pass |
| `next build` | pass |

Current CI and test counts are much broader. The latest U7 structural slice, for example, passed lint/typecheck/build plus **339/339 tests across 89 test files** on exact head `643757f7...`. That comparison shows recovery progress, but test-count growth alone is not product completion evidence.

## Current delta from July 20 findings

### Product / Studio structure

**Then:** workbenches were present but interaction architecture was fragmented.

**Now:** U0–U7 structural convergence is landed:

- shared workbench tabs;
- contextual Project Drawers;
- shared Inspector/bottom-dock/status grammar;
- clean `/studio/...` routes;
- evidence-driven Project Home;
- connected PCB/Mechanical/Firmware/Validation workbench patterns.

**Still open:** durable shell/repository/performance/recovery work under foundation issues; U8 Release active; U9 polish pending.

### Schematic / PCB

**Then:** schematic wires and board/routing context were major gaps.

**Now:** structured anchors, board-identity hardening, connected Electronics identity and PCB shell convergence have improved.

**Still open:** #14/#15 remain the authority for professional connectivity/ERC/PCB topology/routing/rules/multi-board/output qualification.

### Mechanical / 3D

**Then:** 3D was a preview with no parametric authority.

**Now:** U5 gives one Mechanical workbench with 2D Layout / 3D Review / Assembly and explicit visualization-only trust boundaries.

**Still open:** #16/#17 for real constraints/CAD kernel/feature history/assemblies/exact interference/exchange.

### Firmware

**Then:** no complete local PlatformIO execution/log integration.

**Now:** U6 structurally converged Firmware, removed implicit module/file selection, separated authoring from Build/Device Evidence and deleted the duplicate `FirmwareStudio` implementation.

**Still open:** #18 for real filesystem/PlatformIO/device/serial/durable operation evidence.

### Validation

**Then:** validation forms/measurement helpers existed but execution/review integration was incomplete.

**Now:** U7 structurally landed explicit **Define → Execute → Review**, explicit test/run selection, append-only run review and shared Inspector/dock.

**Still open:** #19 for durable hashed evidence, exact version/DUT/equipment binding, trusted reviewer policy, execution service and stale propagation.

### Versions / Release

**Then:** named versions/branches/releases were identified as missing.

**Now:** current revision/readiness/output foundations exist and **U8 Release convergence is active**.

**Still open:** #20 for real immutable versions/branches/comparisons/three-way merges/freezes/approvals/releases and #21 for qualified drawings/manufacturing outputs.

### MCP / bridge

**Then:** MCP and PlatformIO bridge were largely missing target systems.

**Now:** meaningful official SDK/protocol/local-process/security foundations exist.

**Still open:** shared durable repository integration, typed proposal/apply policy, hardened operation lifecycle, backend/roles and interoperability.

## Superseded original corrective sequence

The July audit proposed a linear list of 12 corrective actions. Several remain valid engineering goals, but the repository now uses a clearer two-track program:

### Studio track

- U0–U7 landed;
- U8 active;
- U9 pending.

### Engineering recovery track

- #5–#12 foundations;
- #13–#21 domain engines/evidence/release/output;
- #22–#26 platform/intelligence/interoperability;
- #27 independently qualified reference-product acceptance.

Use `PRODUCT_RECOVERY_EXECUTION_PLAN.md` instead of the old numbered list.

## Current lessons retained from the original audit

The following principles remain correct and are now stronger product rules:

- serialization/migration must preserve all known state;
- undo/redo should model real transactions, not UI illusions;
- schematic connectivity needs structured anchors/graph semantics;
- PCB operations require explicit board/topology context;
- 3D visualization must not impersonate CAD authority;
- firmware evidence must reflect real execution provenance;
- validation needs immutable/reviewable run lineage;
- versions/releases must be real, not status cards;
- MCP must use typed semantic operations over the live governed project;
- tests must exercise production behavior rather than helper presence.

## Historical completion boundary

This audit must never be used to claim that a domain is complete because its July checklist item was later addressed superficially.

Current completion requires the live issue's acceptance criteria, production behavior, persistence/recovery, truthful authority, exact-head verification, and independent evidence where the claim requires it.

The July baseline is preserved as historical evidence of how far the project has moved—not as today's specification.
