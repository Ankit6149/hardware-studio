# Studio Unification Audit — Historical Finding and Current Reconciliation

**Original role:** corrective architecture audit  
**Reconciled:** 2026-09-02  
**Current master:** `79902f6fceb0087e7f446960e9c8059841ba4daa`  
**Current Studio phase:** U8 — Release convergence

## Status of this audit

This audit originally identified a real product failure: Hardware Studio had many useful routes and components, but the Studio behaved like a collection of independent pages rather than one connected engineering product.

That diagnosis remains historically important. However, several corrective ideas in the original document have since been **superseded by a better shell decision**.

In particular, the original recommendation for a permanent product-stage rail is **not current architecture**. U0/U1 convergence established workbench tabs plus a contextual Project Drawer instead. Do not reintroduce the permanent stage rail based on this historical audit.

Current source of truth:

1. `docs/CURRENT_STATUS.md`
2. `docs/development/STUDIO_PHASE_EXECUTION_STATUS.md`
3. `docs/development/STUDIO_UX_CONVERGENCE_EXECUTION_PLAN.md`
4. `docs/ARCHITECTURE.md`

## Original core finding

The original Studio mounted separate workbench components through one shell, but shared mounting did not provide:

- one continuous product context;
- one predictable interaction grammar;
- explicit selected-object context;
- consistent diagnostics/evidence ownership;
- connected handoffs between engineering representations;
- visible trust/limitation state.

The user therefore had to understand the application's route structure rather than the product-development workflow.

## What has since been corrected

### Navigation architecture

**Original fracture:** page-centric navigation with overlapping global and per-domain navigation.

**Current correction:**

- workbench tabs own top-level Product/Requirements/Architecture/Components/Schematic/PCB/Mechanical/Firmware/Validate/Release access;
- contextual Project Drawers own supporting tools and local domain navigation;
- clean `/studio/...` URLs replace hash-routed workbench state;
- legacy aliases are compatibility only;
- duplicate permanent rails/subnavigation are frozen out.

### Shared editor chrome

**Original fracture:** every workbench invented its own headers, side panels, findings and action placement.

**Current correction:**

- shared command-bar/editor framing;
- one reusable Inspector grammar;
- one reusable bottom diagnostics/jobs/evidence dock;
- one status-bar grammar;
- domain Project Drawers instead of private explorer/navigation panels where appropriate.

PCB, Mechanical, Firmware and Validation now use this structure materially more consistently.

### Explicit context

**Original fracture:** selection was local and inconsistent.

**Current correction:**

- shared Studio context supports cross-domain component/board/net handoffs where the model allows it;
- newer workbenches avoid silent first-record selection;
- Firmware no longer silently selects the first module/file in its converged flow;
- Validation no longer silently selects the first test/run;
- PCB convergence emphasizes explicit board context.

Explicit Release selection is a U8 requirement.

### Electronics visibility and connected workflow

**Original fracture:** Schematic/PCB were technically present but felt disconnected.

**Current correction:**

- Electronics identity and representation work established a connected reference workbench;
- component identity can cross Component Library, Schematic, PCB, BOM and Validation foundations;
- Schematic/PCB/BOM progression uses real current blockers through Electronics workflow evaluation;
- PCB owns contextual setup/rules/DRC/BOM tools rather than exposing them as unrelated domains.

This is structural convergence, not proof that #15 ECAD depth is complete.

### Mechanical

**Original fracture:** lightweight 3D was detached and trust boundaries were unclear.

**Current correction:**

- one Mechanical workbench now owns 2D Layout / 3D Review / Assembly representations;
- 3D is explicitly review/visualization, not CAD authority;
- shared selection/context is preserved;
- missing exact geometry remains a limitation rather than a hidden default.

#16/#17 remain open for real constraints/CAD depth.

### Firmware

**Original fracture:** duplicate internal mode navigation, private source Explorer, implicit module/file selection and center-page evidence forms.

**Current correction through U6:**

- one Firmware Project Drawer;
- one center work surface;
- one Inspector;
- bottom Problems / Build Evidence / Device Evidence dock;
- explicit module/file/build selection;
- generated source and recorded evidence truth boundaries.

#18 remains open for real filesystem/PlatformIO/device/serial execution.

### Validation

**Original fracture:** definition, execution, evidence and review blended together with multiple implicit selected-test models.

**Current correction through U7:**

- one Validation drawer: Tests / Coverage / Factory QA / Runs;
- explicit test/run selection;
- Define → Execute → Review center jobs;
- specification no longer edits actual execution observations;
- run history is reviewed read-only;
- run output/logs use the shared bottom dock.

#19 remains open for durable release-grade validation infrastructure.

### Project Home

**Original fracture:** the product graph and next path were not visible enough.

**Current correction:**

- Project Home uses evidence-driven domain state;
- one primary next action is surfaced;
- attention/blocker queue uses real missing/blocked conditions;
- counts are inventory only, not completion proof.

Durable recent engineering history still depends on repository/event work.

## What remains unresolved

The Studio is more unified, but the underlying architecture still has major gaps.

### Canonical data architecture

- current project/store shape still contains legacy/new overlap;
- durable repository boundaries are incomplete;
- typed command/event coverage is incomplete;
- canonical graph semantics and relationship ownership remain recovery work.

### Deep engineering authority

- #15 PCB/ECAD;
- #16 sketch/constraints;
- #17 CAD kernel/features/assemblies;
- #18 firmware execution/device/serial;
- #19 durable validation/evidence/review;
- #20 immutable versions/branches/merges/releases;
- #21 qualified drawings/manufacturing outputs.

A unified UI cannot substitute for those engines.

### Release convergence — active U8

Release is the remaining major Studio-structure phase before final polish.

Current U8 requirements:

- one Release Project Drawer;
- explicit revision/version/output/package/candidate selection;
- one central selected job/surface;
- one contextual Inspector;
- bottom blockers/jobs/preflight/logs/evidence;
- no snapshot presented as immutable version;
- no status toggle presented as trusted approval;
- no generated ZIP/file presented as qualified artifact;
- draft/unqualified state must remain visible;
- #20/#21 remain open.

### Final polish — U9

Only after U8 structural convergence:

- visual hierarchy/design-system refinement;
- accessibility/keyboard review;
- responsive/editor-density work;
- performance/motion refinement;
- selected browser E2E journeys;
- complete empty/error/recovery consistency.

## Current corrective architecture

The current Studio direction is:

```text
TopBar
→ workbench tabs
→ contextual Project Drawer
→ central engineering work surface
→ shared Inspector
→ shared bottom diagnostics/jobs/evidence dock
→ status bar
```

The user journey is not a mandatory linear wizard. Product development is iterative. Workbench tabs expose major product views while contextual tools and evidence-driven next actions guide the current job.

## Audit conclusion — current

The original unification problem was real and drove a successful structural recovery program. U0–U7 have corrected much of the interaction fragmentation.

The remaining risk has shifted:

> **Hardware Studio must now avoid mistaking a coherent Studio for a complete engineering system.**

Future work should deepen canonical data, engines, evidence, versioning, interoperability and qualification while preserving the shared shell already established. Another navigation abstraction or another mini-app is not progress unless it replaces something and makes the connected reference-product journey measurably stronger.
