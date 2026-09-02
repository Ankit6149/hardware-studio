# Hardware Studio — Historical GitHub Issues Audit

**Original purpose:** record an earlier Graphify/static-code audit and its immediate cleanup issues.  
**Current reconciliation:** 2026-09-02  
**Current master:** `79902f6fceb0087e7f446960e9c8059841ba4daa`  
**Authority status:** **historical only** — this document is not the current backlog or implementation order.

## Why this document is being retained

This audit captured a useful early moment in the recovery: the repository contained duplicate prototypes, inconsistent UI styling, disconnected 3D, and board-context problems. Several of those findings led to real cleanup.

However, its original five “issues” are too narrow and some acceptance claims are now misleading. In particular:

- deleting a set of legacy files did not make the application architecture complete;
- styling convergence did not create a finished design system;
- routing Mechanical views to one Three.js surface did not create professional CAD;
- synchronizing Board Settings did not complete canonical board ownership;
- a Graphify snapshot is not product verification.

Use the current recovery program instead:

- `PRODUCT_RECOVERY_EXECUTION_PLAN.md`;
- `PRODUCT_RECOVERY_ISSUE_MAP.md`;
- `STUDIO_PHASE_EXECUTION_STATUS.md`;
- live GitHub issues #4–#27 and later bounded child issues.

## Current delta from the original findings

### Legacy prototypes and duplicate paths

**Original finding:** many stale workbench components created developer confusion.

**Current state:** substantial legacy cleanup has occurred, including removal of retired Studio navigation/source-transport paths and later domain-specific duplicate surfaces. U6 physically removed the retired `FirmwareStudio.tsx` path; PCB/Mechanical/Firmware/Validation convergence also replaced several private shell patterns.

**Still open:** #11/#42 and related architecture work remain because code ownership/package boundaries and monolith decomposition are not complete.

### Design-system consistency

**Original finding:** mixed inline styles and prototype-era visual language.

**Current state:** shared editor-shell primitives, workbench tabs, contextual drawer, Inspector, bottom dock and status grammar now create much stronger consistency.

**Still open:** U9 is intentionally reserved for final hierarchy/accessibility/responsiveness/motion/performance polish. Issue #45 and design-system work should not be considered complete merely because a few editors share Tailwind classes.

### Mechanical / 3D

**Original finding:** disconnected 3D rendering paths.

**Current state:** U5 established one Mechanical workbench with 2D Layout / 3D Review / Assembly and explicit trust language.

**Still open:** #16/#17. Three.js visualization is not a CAD kernel, exact B-Rep model, feature history, assembly solver, or qualified clearance engine.

### Board settings / canonical board state

**Original finding:** Board Settings and Studio context could diverge.

**Current state:** PCB convergence and identity hardening now make explicit board context a core product invariant. Selected-board tests and DRC/output safeguards have improved.

**Still open:** #6/#12/#15 and related repository work. The whole product schema and PCB topology are not yet fully canonical/professional.

### Static architecture reports

**Original finding:** update Graphify after cleanup.

**Current interpretation:** static graphs can help developers inspect dependency structure, but they are not a product completion gate. Current authority comes from production behavior, exact-head CI, integration tests, durable state, and live issue acceptance criteria.

## Current recovery issue hierarchy

The repository now uses a broader evidence-based recovery program.

### Program and foundations

- #4 — product recovery epic;
- #5 — constitution/status/reference gate;
- #6 — canonical schema/IDs/units/migrations;
- #7/#38 — repository/durable storage;
- #8/#39 — commands/transactions/undo;
- #9 — shell/recovery/performance;
- #10 — E2E/CI quality architecture;
- #11/#42 — legacy cleanup/monolith decomposition;
- #12 — canonical product graph.

### Engineering domains

- #13 — component library/representations/sourcing;
- #14 — schematic/connectivity/ERC;
- #15 — PCB/routing/DRC/multi-board/output safety;
- #16 — sketch/dimensions/constraints;
- #17 — CAD kernel/features/assemblies/exact exchange;
- #18 — firmware filesystem/PlatformIO/device/serial;
- #19 — validation execution/evidence/review;
- #20 — versions/branches/merges/releases;
- #21 — drawings/manufacturing/qualified outputs.

### Platform/intelligence/integration

- #22 — MCP live repository/proposal/apply/audit;
- #23 — backend/auth/teams/permissions/storage/collaboration;
- #24 — graph-grounded AI workflow;
- #25 — analysis/simulation adapters;
- #26 — qualified interoperability;
- #27 — independently qualified reference-product vertical slice.

## Studio convergence program

Separately, the U0–U9 Studio plan fixes interaction fragmentation without pretending to close the engineering issues above.

As of this reconciliation:

- U0–U7 are structurally landed;
- **U8 Release convergence is active**;
- U9 final polish is pending.

See `STUDIO_PHASE_EXECUTION_STATUS.md` for exact evidence.

## Historical original issue mapping

The old audit grouped work into five buckets:

1. legacy prototype deletion;
2. styling consistency;
3. Mechanical 3D consolidation;
4. Board Settings synchronization;
5. Graphify report update.

These are now treated as **historical sub-findings**, not current completion epics. Any old `[x]` acceptance marker in Git history means that narrow historical cleanup was performed at that time; it must not be cited as evidence that architecture, CAD, PCB, design system, or product recovery is complete today.

## Current issue-closing rule

A live issue closes only when its current user-facing/engineering acceptance criteria are satisfied by production behavior, tests, persistence/recovery semantics, truthful evidence and required independent checks.

Do not close a broad issue because:

- files were deleted;
- a panel was redesigned;
- one helper/test passed;
- an isolated route works;
- a generator emitted an artifact;
- a static graph/report looks cleaner.

This historical audit is preserved for provenance. For all new work, use the current recovery plans and GitHub issues.
