# U5 Mechanical convergence notes

This file records the bounded Mechanical UX/convergence decisions while the broader Mechanical engineering issues remain open.

## Current status

**U5 structural UX convergence is complete enough to hand off to U6.**

Completed slices:

- **U5.1 — PR #107 / issue #106**  
  Merge: `e1bc7f457329c2c0837b425ca4b862f916e566fe`
- **U5.2 — PR #110 / issue #109**  
  Merge: `f83b2e51b99c259b8e885f241d903b0f116ac7ae`

Engineering parents that intentionally remain open: **#16 and #17**.

## U5.1 — one Mechanical shell and explicit physical input

U5.1 established:

- one shell-owned Mechanical Project Drawer;
- canonical Features / Dimensions / Assembly context;
- shared `mechanical-object` selection between drawer, viewport and Inspector;
- UI-only Mechanical panel state;
- no automatic first-object selection;
- no fabricated starter geometry;
- no default tolerance values;
- no invented material/fastening evidence;
- explicit PCB-envelope synchronization only from real board/outline context.

Exact-head verification before merge:

- lint: pass;
- TypeScript: pass;
- tests: 321/321 pass;
- production build: pass.

## U5.2 — one Mechanical workbench, three explicit representations

U5.2 converged **2D Layout / 3D Review / Assembly** into one Mechanical workbench.

Implemented:

- contextual Mechanical representation tabs rather than another global navigation layer;
- representation choice stored in `mechanicalWorkspaceUiStore`, not project engineering state;
- legacy `canvas`, `assembly`, `3d-preview`, and `webgl-3d` requests translated as compatibility handoffs and cleared;
- same shared Mechanical Project Drawer remains the structural owner around representations;
- canonical shared selection is preserved while representations change;
- 3D review now sits inside the shared editor grammar instead of presenting itself as a separate application;
- 3D review explicitly states **Visualization only — not CAD / not validation authority**;
- no guessed board, outline, package, placement or mechanical dimensions are introduced for rendering.

Exact-head verification before merge:

- lint: pass;
- TypeScript: pass;
- tests: 326/326 pass;
- production build: pass;
- Vercel deployment: pass.

## Mechanical representation boundary

The repository now has a coherent Mechanical UX, but two engineering layers must remain clearly separated:

1. **Current authoritative project evidence** — canonical mechanical objects, dimensions, assembly layers, explicit board references, command-backed pointer edits and validation findings.
2. **Current 3D visualization** — Three.js renders only explicit board/package/mechanical dimensions when available and leaves missing geometry unresolved.

The 3D renderer is useful for coordination/review, but it is **not** the modeling source of truth.

## #16 remains open — real sketch/drawing foundation

Do not interpret U5 completion as #16 completion.

Still required by #16:

- exact sketch documents/primitives/topology;
- persistent geometric constraints;
- persistent dimensional constraints;
- real constraint solving with under/fully/over-constrained state;
- conflict and degrees-of-freedom explanation;
- deterministic profile/region detection;
- typed parameters, units and expressions;
- stable topology references;
- drawing document/view foundations;
- qualified DXF/SVG round-trip and the required solver/E2E fixtures.

## #17 remains open — real CAD kernel / parametric modeling

Do not interpret the improved 3D review as #17 completion.

Still required by #17:

- reviewed Open CASCADE or equivalent kernel architecture;
- exact B-Rep/source geometry separate from render tessellation;
- parametric feature tree and regeneration diagnostics;
- sketch-to-solid operations;
- booleans, fillet/chamfer, shell, patterns, sweep/loft and documented supported features;
- assembly instances and mate semantics;
- exact interference/clearance;
- mass/volume properties;
- STEP import/export qualification;
- worker/process isolation, cancellation and deterministic cache invalidation.

## U5 handoff decision

U5 does not need another UI-only slice before U6. Adding more labels, shape buttons or Three.js effects would create false progress.

Mechanical now has a sufficiently coherent shell/representation model. The correct next product-convergence phase is **U6 Firmware**, while #16/#17 continue in the parallel engineering track and are only closed when their stated acceptance criteria are genuinely satisfied.
