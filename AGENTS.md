<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Hardware Studio agent operating contract

**Documentation sync:** 2026-09-02  
**Current master at sync:** `79902f6fceb0087e7f446960e9c8059841ba4daa`  
**Current Studio phase:** U8 — Release convergence  
**Completed structural UX phases:** U0 through U7  
**Important:** structural UX convergence is not equivalent to completion of the underlying engineering engine.

## Read order before changing production code

1. `docs/CURRENT_STATUS.md` — current product reality and known limitations.
2. `docs/development/STUDIO_PHASE_EXECUTION_STATUS.md` — active U0–U9 execution phase and exact landed evidence.
3. `docs/development/PRODUCT_RECOVERY_EXECUTION_PLAN.md` — engineering authority and dependency order.
4. `docs/ARCHITECTURE.md` — canonical architecture and state ownership.
5. `docs/SAFETY_AND_LIMITATIONS.md` — claims the product must not make.
6. Domain notes under `docs/development/` for the workbench being changed.
7. Research documents under `docs/research/` only as design references; they are not implementation-status authority.

When documents disagree, prefer the current-status and execution-ledger documents above older research/audit text.

## Non-negotiable product rules

### One product, one connected engineering context

The Studio mental model is:

> I am in one product/project, and Product, Electronics, PCB, Mechanical, Firmware, Validation, and Release are connected views of that same product.

Do not add another permanent global rail, second workbench navigation system, duplicate Inspector, duplicate Problems surface, or domain-specific mini-application shell.

### Shared shell grammar

Reuse the established shell:

- global TopBar;
- workbench tabs;
- contextual Project Drawer;
- central engineering work surface;
- shared selection-aware Inspector;
- shared bottom dock for Problems / jobs / evidence / logs;
- thin status bar.

Panel open/closed state and explicit local selection are UI/session state. Canonical engineering data belongs in the project model, not in shell state.

### Explicit selection

Opening a workbench must not silently select the first board, component, module, file, validation test, validation run, revision, release, or artifact merely because one exists.

If a user explicitly creates an object, selecting that newly created object can be appropriate. Passive navigation must not invent canonical context.

### Truthful engineering claims

Never equate these with completion or verification:

- a TypeScript type;
- a button or panel;
- a generated file name;
- a JSON snapshot;
- a status toggle;
- a local approximation;
- a test fixture;
- a successful generator process;
- a disclaimer string;
- a passing build.

The product must expose unresolved engineering state instead of inventing missing values or hiding unsupported capability.

### Current deep-engine boundaries

The following parent issues remain authoritative even though their workbenches are structurally coherent:

- #15 — real PCB/ECAD depth;
- #16 — real sketch/constraint engine;
- #17 — real CAD-kernel/feature/assembly depth;
- #18 — real firmware filesystem/PlatformIO/device/serial execution;
- #19 — durable validation execution/evidence/review infrastructure;
- #20 — immutable versions/branches/merges/releases;
- #21 — qualified drawings/manufacturing/output system;
- #6–#12, #23, #26 and related recovery issues — schema, repository, command, graph, backend, interoperability and platform foundations.

Do not close or document these as complete because a coherent UI exists.

## Current U8 focus

Release convergence must unify existing readiness, revisions, outputs, drawings, and factory-package surfaces without overstating them.

Do not present current foundations as equivalent to:

- content-addressed immutable versions;
- true branch ancestry and three-way merges;
- repository-enforced freezes;
- trusted approvals bound to exact candidate hashes;
- qualified manufacturing artifacts;
- independently validated Gerber/Excellon/drawing packages;
- release-grade provenance and reproducibility.

Issues #20 and #21 remain open until those engineering guarantees exist.

## Landing-page freeze

The public landing page is an approved surface. Do not redesign it as part of Studio recovery work. Changes should be limited to correctness, accessibility, routing, or explicitly requested maintenance.

## URL and routing rule

Studio routes use clean paths under `/studio/...`. Do not reintroduce hash-fragment navigation for Studio routing. Landing-page section navigation should not mutate the URL hash.

## Verification and merge discipline

For every bounded production PR:

1. review exact changed-file scope;
2. run lint;
3. run TypeScript typecheck;
4. run the full Vitest suite;
5. run the production build;
6. inspect the exact-head deployment status;
7. distinguish application failures from external Vercel plan/rate-limit failures;
8. verify parent engineering issues remain correctly open;
9. update the relevant documentation checkpoint;
10. merge with expected-head-SHA protection when available.

Never cite a previous commit's green checks after pushing a new head.

## Test philosophy

Prefer tests that exercise production behavior and exact state transitions. Do not weaken a real product contract merely to satisfy stale copy-based assertions; update stale tests to protect the intended behavior.

Strong guards include:

- canonical identity preservation;
- explicit selection/no first-record fallback;
- one-drawer/one-Inspector/one-dock ownership;
- undo/redo transaction correctness;
- board isolation;
- truthful validation execution authority;
- missing-data blockers;
- output provenance and stale-state rules.

## Research and inspiration

Use established engineering tools for interaction and workflow lessons, including KiCad, Altium, Autodesk Fusion, Onshape, FreeCAD, PlatformIO, NI TestStand and relevant PLM/release systems. Borrow proven mental models, not superficial visual copies.

## Documentation rule

After a meaningful phase or engineering slice, update current-status and domain notes immediately. Historical audits may remain as historical evidence, but they must carry a clear current-status reconciliation so they cannot be mistaken for today's product state.
