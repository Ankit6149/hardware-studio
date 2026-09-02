# U5 Mechanical Convergence Notes

**Reconciled:** 2026-09-02  
**Structural phase:** complete  
**Current Studio phase:** U8 — Release convergence  
**Engineering authorities still open:** #16 and #17

This file records the bounded Mechanical UX decisions that remain part of the accepted Studio baseline. It is a handoff record, not a claim that Mechanical engineering is complete.

## Merged evidence

### U5.1

- PR #107 / issue #106
- merge commit: `e1bc7f457329c2c0837b425ca4b862f916e566fe`
- exact-head repository gate at the time:
  - lint: pass;
  - typecheck: pass;
  - tests: 321/321;
  - production build: pass.

### U5.2

- PR #110 / issue #109
- merge commit: `f83b2e51b99c259b8e885f241d903b0f116ac7ae`
- exact-head repository gate at the time:
  - lint: pass;
  - typecheck: pass;
  - tests: 326/326;
  - production build: pass;
  - Vercel deployment status: pass.

Those historical test counts are evidence for the corresponding exact heads, not permanent expected suite sizes.

## Landed Mechanical grammar

### One shell-owned Mechanical Project Drawer

Mechanical no longer needs another global navigation system to expose its local context.

The drawer/workbench owns:

- features/objects;
- dimensions/evidence context;
- assembly context;
- explicit user selection.

### Explicit physical input

U5 intentionally rejected fake starter truth.

Rules established:

- no automatic first-object selection;
- no fabricated starter geometry;
- no default tolerance values presented as engineering decisions;
- no invented material/fastening evidence;
- PCB envelope synchronization occurs only from real board/outline context and explicit actions.

### Three representations, one workbench

Mechanical supports the structural representation grammar:

- **2D Layout**;
- **3D Review**;
- **Assembly**.

Representation selection is UI/session state, not engineering project state.

Legacy Mechanical mode requests may be translated for compatibility, but must not recreate separate applications.

### Shared context

The same Mechanical object selection is intended to flow between:

- Project Drawer;
- viewport/representation;
- Inspector;
- validation/check context where linked.

Panel state must not become a duplicate Mechanical data model.

## 3D authority boundary

The central U5 truth rule remains:

> **3D Review is visualization/review, not CAD or validation authority.**

Current Three.js rendering may coordinate explicit board/package/mechanical dimensions when available. It must not invent exact engineering geometry when those dimensions are absent.

A visually plausible scene does not prove:

- exact B-Rep geometry;
- exact clearance;
- exact interference absence;
- exact mass/volume;
- exact assembly constraints;
- tooling/manufacturing readiness.

This boundary must be preserved by U8 Release/readiness code. Release must not upgrade a 3D-review result into stronger Mechanical evidence than it actually is.

## #16 remains open — sketch / dimensions / constraints / drawing foundations

U5 does not satisfy #16.

Still required includes:

- canonical sketch documents and topology;
- line/arc/spline/polygon/construction primitives as scoped;
- persistent dimensional constraints;
- persistent geometric constraints;
- under/fully/over-constrained state;
- solver conflicts and degrees-of-freedom explanation;
- deterministic profile/region detection;
- typed parameters/units/expressions;
- stable topology references;
- drawing document/view foundations;
- qualified supported interchange and regression/E2E fixtures.

## #17 remains open — CAD kernel / parametric modeling / assemblies

U5 does not satisfy #17.

Still required includes:

- reviewed Open CASCADE/equivalent kernel architecture;
- exact B-Rep/source geometry distinct from render meshes;
- parametric feature tree and regeneration diagnostics;
- sketch-to-solid features;
- booleans and declared supported modeling features;
- assembly instances and mates;
- exact interference/clearance;
- mass/volume properties as scoped;
- qualified STEP/STL import/export;
- worker/process isolation, cancellation and deterministic cache invalidation.

## Cross-domain handoff rules after U5

Mechanical must consume connected product context without taking ownership away from other domains.

Examples:

- board identity remains canonical PCB/product state;
- package/component identity remains canonical component/product state;
- Mechanical may reference those IDs and derive review geometry;
- Validation may reference Mechanical objects/results but must preserve their authority level;
- Release/output may consume Mechanical evidence only at the strength actually supported.

## Current status after U6/U7

Since U5 landed:

- U6 Firmware has structurally converged;
- U7 Validation has structurally converged;
- U8 Release is now active.

Therefore the Mechanical handoff is no longer “next phase U6.” The standing requirement is now:

> Preserve the U5 shell/representation contract while #16/#17 deepen the engine and U8/U9 consume Mechanical evidence truthfully.

## Non-negotiable regression rules

Do not improve Mechanical by:

- reintroducing a second Mechanical app shell;
- auto-selecting the first Mechanical object;
- inventing geometry/tolerances/materials;
- treating Three.js display geometry as exact CAD;
- duplicating Inspector/Problems ownership;
- adding decorative 3D effects that imply stronger engineering authority;
- closing #16/#17 because the workbench looks coherent.

U5 is structurally complete. Mechanical engineering completion remains governed by #16/#17 and the reference-product acceptance path.
