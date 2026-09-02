# Hardware Studio — Active Recovery Task Tracker

**Reconciled:** 2026-09-02  
**Current master at reconciliation:** `79902f6fceb0087e7f446960e9c8059841ba4daa`  
**Primary ledger:** `docs/development/STUDIO_PHASE_EXECUTION_STATUS.md`  
**Engineering plan:** `docs/development/PRODUCT_RECOVERY_EXECUTION_PLAN.md`

> This file used to contain an obsolete PCB checklist that marked retired navigation, rough autoroute/auto-place and legacy editor ownership as “complete.” That checklist is no longer authoritative. Use this tracker only as an agent execution pointer; GitHub issues and the recovery plans remain the acceptance authority.

## Studio convergence status

- [x] U0 — architecture/navigation lock.
- [x] U1 — shared Studio shell foundation: workbench tabs, contextual drawer host, shared Inspector/bottom dock/status grammar, clean Studio routes.
- [x] U2 — truthful evidence-driven Project Home.
- [x] U3 — Electronics reference workbench convergence.
- [x] U4 — PCB structural convergence.
- [x] U5 — Mechanical structural convergence.
- [x] U6 — Firmware structural convergence.
- [x] U7 — Validation structural convergence: explicit selection and Define → Execute → Review.
- [ ] **U8 — Release convergence: active.**
- [ ] U9 — final polish: intentionally deferred until U8 and core architecture stabilize.

## U8 active work

Goal: one predictable Release workbench without pretending current snapshots and generated files are professional release infrastructure.

Required structural outcomes:

- [ ] map current Readiness / Revisions / Outputs / Drawings / Factory Package surfaces;
- [ ] remove duplicate/per-page mini-app navigation;
- [ ] use one Release Project Drawer;
- [ ] require explicit revision/output/package/candidate selection;
- [ ] use shared Inspector for selected Release context;
- [ ] use shared bottom dock for blockers/jobs/logs/preflight evidence where real records exist;
- [ ] make draft/unqualified output visibly different from release-grade evidence;
- [ ] preserve current project data model—do not create a UI-only duplicate release model;
- [ ] add regression tests for one-drawer ownership, explicit selection and truth labels;
- [ ] run exact-head lint/typecheck/full tests/build/deployment inspection;
- [ ] update U8 notes and phase ledger after merge.

## U8 engineering boundaries

### Issue #20 must remain open for real version/release infrastructure

U8 structural work must not claim completion of:

- immutable content-addressed named versions;
- explicit workspace/branch base ancestry;
- domain-aware comparisons;
- real three-way merge/conflict resolution;
- repository-enforced freezes;
- candidate manifests bound to exact artifact hashes;
- trusted role-aware approvals bound to exact payloads;
- immutable published releases with supersession/withdrawal.

### Issue #21 must remain open for qualified outputs

U8 structural work must not claim completion of:

- exact model-derived engineering drawings;
- qualified Gerber/Excellon/CPL/BOM packages;
- independent parser/viewer validation;
- exact provenance, tool versions and input/output hashes;
- reproducible isolated generation jobs;
- trusted review bound to exact package manifest;
- content-addressed release artifacts.

## Parallel deep-engine recovery

These are not replaced by Studio convergence:

- [ ] #6 schema normalization;
- [ ] #7/#38 durable repository/persistence;
- [ ] #8/#39 typed commands, transactions, undo/redo;
- [ ] #9 shell/navigation/crash/performance hardening;
- [ ] #10 E2E/CI strategy;
- [ ] #11/#42 monolith decomposition;
- [ ] #12 canonical graph;
- [ ] #15 real PCB/ECAD depth;
- [ ] #16 sketch/constraint engine;
- [ ] #17 CAD kernel/features/assemblies;
- [ ] #18 filesystem/PlatformIO/device/serial execution;
- [ ] #19 durable validation execution/evidence/review;
- [ ] #20 versions/branches/releases;
- [ ] #21 qualified outputs/manufacturing;
- [ ] #23 backend/roles as defined by recovery plan;
- [ ] #26 interoperability/independent tool validation.

## Agent rules while executing tasks

1. Read `AGENTS.md` first.
2. Work from a bounded GitHub issue or clearly documented slice.
3. Do not redesign the approved landing page.
4. Do not reintroduce hash-routed Studio navigation.
5. Do not add duplicate shell chrome.
6. Do not silently select the first canonical record.
7. Do not invent missing engineering data.
8. Do not close deep parent issues after UX-only work.
9. Merge only after exact-head verification.
10. Update documentation immediately after a meaningful merge.

## Completion meaning

A checked Studio phase above means **structural UX convergence for that phase**, not that the underlying professional engineering engine is complete. Engineering closure is governed by the corresponding GitHub issue acceptance criteria.
