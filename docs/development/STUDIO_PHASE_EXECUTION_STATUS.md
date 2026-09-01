# Hardware Studio — Studio phase execution status

**Status date:** 2026-09-01  
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
| **U5 — Mechanical** | **Structural UX convergence complete** | PR #107 / #106: one drawer + explicit physical input. PR #110 / #109: one Mechanical workbench with 2D Layout / 3D Review / Assembly representations. #16/#17 remain open for real sketch/CAD engineering. | Continue #16/#17 in the parallel engineering track; do not fake solver/CAD depth in UX phases. |
| **U6 — Firmware** | **Active** | Existing Firmware has useful modules/state/source/evidence foundations, but still duplicates shell navigation internally, auto-selects the first module/file in places, and mixes manual evidence capture into authoring. | U6.1: one Firmware Project Drawer + one center work surface + one Inspector + bottom Build/Device/Problems dock; remove duplicate mode navigation and implicit selection. |
| **U7 — Validation** | Pending dedicated phase pass | Existing test/run/evidence foundations exist; phase completion requires clear Define / Execute / Review separation. | Run dedicated U7 convergence against #19. |
| **U8 — Release** | Pending dedicated phase pass | Version/output/release foundations exist but remain governed by #20/#21 and release truth gates. | Run dedicated U8 control-surface convergence. |
| **U9 — Final polish** | Not started by design | Structural work must stabilize first. | Only after U6–U8 convergence: final visual system, accessibility, responsive layouts, motion and performance. |

## Latest completed Mechanical slice — U5.2

**PR:** #110 — `U5.2: Converge Mechanical representations inside one workbench`  
**Issue:** #109 — completed  
**Merged master:** `f83b2e51b99c259b8e885f241d903b0f116ac7ae`

Verified exact-head gate before merge:

- lint: pass;
- typecheck: pass;
- tests: 326/326 pass;
- production build: pass;
- Vercel deployment status: pass.

Landed behavior:

- one contextual Mechanical representation switch: **2D Layout / 3D Review / Assembly**;
- representation choice is UI/session state, not engineering project state;
- legacy Mechanical mode requests are translated for compatibility and then cleared;
- shared Mechanical selection/context is preserved across representations;
- 3D review is mounted inside the shared editor grammar instead of behaving like a second application;
- 3D is explicitly classified as visualization/review only and never as CAD or validation authority;
- unresolved board/package/placement/mechanical geometry stays unresolved.

U5 structural UX convergence is therefore complete enough to hand off to U6. This does **not** mean Mechanical engineering is complete.

## Mechanical engineering boundary after U5

Issue #16 remains the authority for:

- canonical sketch topology;
- persistent geometric/dimensional constraints;
- solver state/conflict explanation;
- profile detection;
- typed parameters/expressions;
- drawing foundations.

Issue #17 remains the authority for:

- reviewed CAD-kernel adapter;
- exact B-Rep solids/topology;
- parametric feature history/regeneration;
- assemblies/mates;
- exact interference/clearance;
- qualified STEP/STL exchange.

Do not close either issue because the Mechanical workbench now looks coherent.

## Active bounded slice — U6.1 Firmware shell convergence

### Current structural defects

The current Firmware experience still exposes overlapping structures:

- shell Project Drawer destinations for State Machine / Hardware Map / Source / Evidence;
- a second internal Firmware mode strip for Modules / Behavior / Hardware Map / Source / Evidence;
- source editor owns another internal Explorer panel;
- `FirmwareStudio` can fall back to the first firmware module when nothing was explicitly selected;
- `FirmwareCodePreview` can fall back to the first source file;
- build/device evidence entry is mixed into the same large authoring component;
- real filesystem/PlatformIO/device execution remains governed by #18 and must not be simulated.

### U6.1 target grammar

- **Left Project Drawer:** Files | Modules | Hardware Map | Tasks/Environment | Evidence context as supported by real project state;
- **Center:** Source / Behavior / module authoring surface;
- **Right Inspector:** selected module/file/hardware mapping only;
- **Bottom dock:** Problems | Build | Device | Serial/Logs when real operations exist;
- **Top:** contextual edit/build commands, not another navigation row.

### Truth constraints

- opening Firmware must not auto-select the first module or file as canonical context;
- build/upload/device controls must not claim execution unless the local bridge actually ran them;
- recorded manual evidence remains visibly recorded metadata, not executed build/device proof;
- generated source remains scaffolding, not a hidden second source of truth;
- #18 stays open until real filesystem, hardened PlatformIO/device operations, durable evidence and serial workflow satisfy its acceptance criteria.

## Phase handoff discipline

After every U6 slice:

1. merge only after exact-head lint/typecheck/tests/build/deployment inspection;
2. update this ledger and Firmware-specific notes;
3. state exactly which #18 requirements remain;
4. move to U7 only after Firmware’s shell/interaction grammar is structurally coherent;
5. continue #18 separately until its engineering completion guard is genuinely satisfied.
