# Hardware Studio — Product Status

> **Authoritative detailed status:** [`docs/CURRENT_STATUS.md`](docs/CURRENT_STATUS.md)  
> **Studio execution ledger:** [`docs/development/STUDIO_PHASE_EXECUTION_STATUS.md`](docs/development/STUDIO_PHASE_EXECUTION_STATUS.md)  
> **Status date:** 2026-09-02  
> **Master at status sync:** `79902f6fceb0087e7f446960e9c8059841ba4daa`  
> **Stable release:** None

Hardware Studio is an active engineering prototype for connected physical-product development. It now has a substantially more coherent Studio interaction model, but the product is **not** a qualified replacement for established ECAD, CAD, firmware, validation, PLM, or manufacturing toolchains.

## Executive status

The Studio recovery program separates two different kinds of progress:

1. **Structural UX convergence** — whether each domain behaves as a connected workbench inside one predictable Studio shell.
2. **Engineering completion** — whether the underlying domain engine has the accuracy, durability, provenance, verification, interoperability, and safety guarantees required for real professional use.

As of this status sync:

- U0 Architecture lock — landed;
- U1 shared Studio shell — landed foundation;
- U2 Project Home — truthful evidence-driven home landed;
- U3 Electronics reference workbench — structurally converged;
- U4 PCB workbench — structurally converged;
- U5 Mechanical — structurally converged;
- U6 Firmware — structurally converged;
- U7 Validation — structurally converged;
- **U8 Release — active**;
- U9 final polish — intentionally deferred until structural work stabilizes.

U7.1 landed through PR #116. Its exact verified head passed lint, typecheck, production build, Vercel deployment status, and **339/339 tests across 89 test files**. That proves the bounded U7 change met repository gates; it does not close the deeper validation-engine issue #19.

## Current domain classification

| Area | Structural UX | Engineering classification | Important boundary |
| --- | --- | --- | --- |
| Project Home / system planning | Converged foundation | Partial | Durable engineering history, repository-backed events and richer impact analysis remain open. |
| Requirements / architecture | Connected workbench | Partial | Full graph semantics, requirement lifecycle, impact analysis and repository durability remain recovery work. |
| Components / schematic / PCB | Connected reference workbench | Partial | #15 remains open for real ECAD depth, routing, comprehensive DRC/ERC, topology and fabrication qualification. |
| Mechanical | One workbench with 2D / 3D review / assembly grammar | Partial | #16/#17 remain open for real sketch constraints, CAD-kernel features, exact assemblies and exact clearance/interference. |
| Firmware | One drawer/workbench/Inspector/dock grammar | Partial | #18 remains open for real filesystem, PlatformIO execution, device operations, serial monitor and durable evidence. |
| Validation | Define → Execute → Review grammar landed | Partial | #19 remains open for durable evidence, DUT/version/equipment binding, reviewer policy, execution jobs and stale propagation. |
| Release | U8 active | Foundation / partial | #20 remains open for immutable versions/branches/merges/releases; #21 remains open for qualified outputs/packages. |
| Manufacturing outputs | Integrated draft surfaces | Draft / unqualified | Generator success is not qualification. Independent parser/viewer/DFM/review and exact provenance are still required. |
| Local bridge | Foundation | Partial | Security, operation lifecycle, workspace isolation, durable records and complete device workflows remain open. |
| MCP | Foundation | Partial | Typed protocol foundations exist, but complete live durable application integration and policy remain recovery work. |

## What is materially better now

The Studio no longer follows the earlier “many disconnected mini-apps” pattern. Current structural rules are:

- one product/project context;
- clean `/studio/...` routes rather than hash-routed workbenches;
- workbench tabs at the shell level;
- contextual Project Drawer rather than permanent domain rails;
- shared Inspector;
- shared bottom dock for Problems / execution / evidence / logs;
- explicit local selection rather than silent first-record fallbacks;
- Project Home state derived from real domain evidence instead of count-based completion;
- cross-domain identity preserved where current models support it.

The public landing page remains intentionally separate and is not part of the Studio redesign program.

## Current U8 objective

U8 is not “make Release look finished.” Its purpose is to converge existing readiness, revision, output, drawing and factory-package surfaces into one honest Release workbench.

The U8 UI must not imply that current foundations already provide:

- immutable content-addressed versions;
- explicit branch ancestry and true three-way merge semantics;
- repository-enforced freezes;
- approvals cryptographically/logically bound to exact candidate payloads;
- qualified drawings or manufacturing packages;
- reproducible, independently validated artifacts with exact hashes;
- immutable published releases with supersession/withdrawal history.

Those guarantees remain governed by #20 and #21.

## What must not be inferred from current UI

The presence of any of the following is not proof of professional engineering completion:

- a screen, editor, panel or navigation item;
- a TypeScript type;
- a local helper/engine;
- a generated file name or ZIP;
- a JSON snapshot;
- a status badge or approval-like toggle;
- a local geometry approximation;
- a unit/integration test;
- a successful application build;
- documentation describing the target.

A capability is only as strong as the production behavior, persistence, provenance, independent verification and documented limitation boundary behind it.

## Safety classification

No current Hardware Studio output should be used directly for:

- fabrication without independent CAM/DFM review;
- production assembly decisions without verified source data;
- safety-critical decisions;
- certification evidence;
- regulatory submission;
- final mechanical clearance claims where exact CAD evidence is required;
- trusted firmware-build/device proof where the local execution chain did not actually run;
- release approval where exact version/artifact/reviewer binding is not present.

See [`docs/SAFETY_AND_LIMITATIONS.md`](docs/SAFETY_AND_LIMITATIONS.md).

## Current source-of-truth order

For implementation and review, use:

1. `docs/CURRENT_STATUS.md`
2. `docs/development/STUDIO_PHASE_EXECUTION_STATUS.md`
3. `docs/development/PRODUCT_RECOVERY_EXECUTION_PLAN.md`
4. `docs/ARCHITECTURE.md`
5. `docs/SAFETY_AND_LIMITATIONS.md`
6. domain convergence notes
7. research documents as references only.

Older V1/V5 “complete” language is historical context, not current product status.
