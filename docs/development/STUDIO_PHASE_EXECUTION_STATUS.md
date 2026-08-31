# Hardware Studio — Studio phase execution status

**Status date:** 2026-08-31  
**Primary direction:** `STUDIO_UX_CONVERGENCE_EXECUTION_PLAN.md`  
**Engineering authority:** `PRODUCT_RECOVERY_EXECUTION_PLAN.md`

This is the live execution ledger for the U0–U9 Studio phases. It records what has actually landed, what remains intentionally open, and the next bounded slice. It does not replace the detailed UX or engineering plans.

## Operating rule

After every bounded phase slice:

1. merge only after exact-head verification;
2. record the merged PR/commit here and in the relevant domain notes;
3. state what the slice deliberately did **not** complete;
4. keep parent engineering issues open until their real acceptance criteria are satisfied;
5. start the next phase slice from the new verified master.

Open-issue count is not the completion metric. The product gates and verified user workflows are.

## Phase ledger

| Phase | Current state | Evidence / boundary | Next action |
| --- | --- | --- | --- |
| **U0 — Architecture lock** | Landed | One Studio grammar, freeze rules, issue reconciliation and convergence plan established. | Maintain freeze rules while later phases land. |
| **U1 — Shared Studio shell** | Foundation landed; broader recovery still open | Workbench tabs, shared Project Drawer host, shared Inspector/bottom-dock/status primitives are in production code. Routing/repository/layout durability remain governed by their engineering issues. | Reuse shell primitives; do not fork per-domain shells. |
| **U2 — Project Home** | Truthful Home model landed; not a substitute for durable history | Next action/blocker/lifecycle logic uses real domain evidence. Do not fabricate “recent changes” from timestamps/counts. | Add durable recent engineering change history only when command/repository history supports it. |
| **U3 — Electronics reference workbench** | Substantially converged; engineering depth still open | Shared identity, Schematic/PCB/BOM/contextual tools and common editor grammar are established. | Preserve canonical identity while #13–#15 deepen engineering capability. |
| **U4 — PCB editor depth** | Structural convergence landed; real PCB engine remains open | PCB owns one Project Drawer, one Inspector, one Problems dock, explicit board identity/rules and no fake auto-place/autoroute claims. | Continue #15 for real PCB depth; do not confuse UX convergence with ECAD completion. |
| **U5 — Mechanical** | **U5.1 merged; U5.2 next** | PR #107 / issue #106: one Mechanical Project Drawer, shared selection, explicit dimensions/tolerances/material/assembly evidence, no auto-first-object selection. #16/#17 remain open. | Converge 2D / 3D / Assembly as representations inside one Mechanical workbench. |
| **U6 — Firmware** | Pending dedicated phase pass | Existing firmware surfaces already contain useful state/source/evidence foundations, but the phase-level shell convergence has not been declared complete. | After U5 representation convergence, converge files/modules/hardware map/editor/build-upload-serial Problems grammar. |
| **U7 — Validation** | Pending dedicated phase pass | Existing test/run/evidence foundations exist; phase completion requires clear Define / Execute / Review separation. | Run dedicated U7 convergence against #19. |
| **U8 — Release** | Pending dedicated phase pass | Version/output/release foundations exist but remain governed by #20/#21 and release truth gates. | Run dedicated U8 control-surface convergence. |
| **U9 — Final polish** | Not started by design | Structural work must stabilize first. | Only after U5–U8 convergence: final visual system, accessibility, responsive layouts, motion and performance. |

## Latest completed slice — U5.1

**PR:** #107 — `U5.1: Converge Mechanical on one Project Drawer and explicit physical input`  
**Issue:** #106 — completed  
**Merged master:** `e1bc7f457329c2c0837b425ca4b862f916e566fe`

Verified exact-head gate before merge:

- lint: pass;
- typecheck: pass;
- tests: 321/321 pass;
- production build: pass;
- Vercel: external Hobby-plan build-rate-limit status, not a code failure.

Replaced:

- internal 300px Mechanical `Design Browser`;
- automatic first-object selection;
- fabricated starter physical dimensions;
- fabricated `0.10 mm` tolerance defaults;
- default assembly `Screw Thread` evidence.

Preserved:

- canonical Mechanical project objects/dimensions/assembly layers;
- explicit PCB outline/envelope synchronization;
- pointer transaction behavior;
- validation/findings;
- shared shell Inspector and Problems grammar.

## Next bounded slice — U5.2

### Goal

Make Mechanical feel like **one product workbench with connected 2D, 3D and Assembly representations**.

### Required outcomes

- representation switching lives inside Mechanical context rather than creating another global navigation model;
- the same Mechanical Project Drawer remains the structural authority;
- 2D and 3D preserve explicit product/board/selection context wherever the underlying canonical identity supports it;
- the 3D view is visually and semantically classified as evidence-backed visualization, not “real CAD”;
- unresolved package/board/mechanical geometry remains unresolved;
- Assembly is presented as the same product's physical structure, not a disconnected mini-app;
- legacy `requestedMechanicalMode` handling is reduced to a compatibility responsibility, not the permanent information architecture.

### Explicit non-goals

U5.2 does **not** satisfy #16 or #17. It does not claim:

- constraint solver;
- canonical sketch topology;
- B-Rep CAD kernel;
- parametric feature tree;
- assembly mate solver;
- exact interference;
- qualified STEP exchange.

Those remain deeper Mechanical engineering work after the workbench representations are structurally converged.

## Phase handoff discipline

When U5 is structurally converged enough to hand off:

1. update this ledger and `U5_MECHANICAL_CONVERGENCE_NOTES.md`;
2. record which #16/#17 requirements remain;
3. move to U6 without pretending Mechanical engineering is complete;
4. continue #16/#17 in the parallel engineering track.

The same pattern applies to U6, U7 and U8.
