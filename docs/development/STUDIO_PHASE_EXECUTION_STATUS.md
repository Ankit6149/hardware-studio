# Hardware Studio — Studio Phase Execution Status

**Status date:** 2026-09-02  
**Master at status baseline:** `79902f6fceb0087e7f446960e9c8059841ba4daa`  
**Primary Studio direction:** `STUDIO_UX_CONVERGENCE_EXECUTION_PLAN.md`  
**Engineering authority:** `PRODUCT_RECOVERY_EXECUTION_PLAN.md`  
**Active phase:** **U8 — Release convergence**

This is the live execution ledger for U0–U9. It records what has actually landed, exact evidence where available, what each phase deliberately did **not** complete, and the next bounded Studio action.

Open issue count is not the completion metric. Verified user workflows, product invariants and engineering acceptance criteria are.

## Operating rule

After every bounded Studio slice:

1. work from the new verified/documented master;
2. keep the slice bounded to one user job/structural correction;
3. inspect exact changed-file scope;
4. remove contradictory old ownership where safe rather than layer a second system;
5. run exact-head lint/typecheck/full tests/build;
6. inspect exact-head deployment status;
7. distinguish application failures from external hosting-plan limits;
8. verify deep parent engineering issues remain open when their criteria are incomplete;
9. record merge/head/test evidence here and in domain notes;
10. start the next phase only from the verified documented baseline.

## Phase ledger

| Phase | Current state | Landed structural boundary | Deep engineering boundary / next action |
| --- | --- | --- | --- |
| **U0 — Architecture lock** | **Landed** | One product mental model, navigation freeze, convergence plan, no new permanent global rails. | Preserve freeze rules. |
| **U1 — Shared Studio shell** | **Foundation landed** | Workbench tabs, contextual Project Drawer host, shared Inspector, bottom dock, status bar, clean `/studio/...` routes. | #6–#12/#9/#10 continue durability/repository/performance/testing. |
| **U2 — Project Home** | **Landed** | Evidence-driven next action/lifecycle/attention; counts are inventory only. | Durable recent engineering history waits for repository/event infrastructure. |
| **U3 — Electronics reference workbench** | **Structurally converged** | Shared component identity and connected Schematic/PCB/BOM/contextual patterns. | #13–#15 continue domain depth. |
| **U4 — PCB** | **Structurally converged** | One PCB drawer, Inspector, Problems/DRC dock, explicit board/rules context, no fake auto-place/autoroute convergence claims. | #15 remains open for professional PCB/ECAD. |
| **U5 — Mechanical** | **Structurally converged** | One Mechanical drawer/workbench; 2D Layout / 3D Review / Assembly; explicit physical input; shared context. | #16/#17 remain open for sketch/CAD/exact geometry. |
| **U6 — Firmware** | **Structurally converged** | One Firmware drawer/workbench/Inspector/dock; explicit module/file/build context; duplicate `FirmwareStudio` removed. | #18 remains open for filesystem/PlatformIO/device/serial execution. |
| **U7 — Validation** | **Structurally converged** | One Validation drawer; explicit test/run context; Define → Execute → Review; shared Inspector/dock; execution authority bounded. | #19 remains open for durable release-grade evidence/execution/review. |
| **U8 — Release** | **ACTIVE** | Current readiness/revision/output/drawing/package foundations are being converged into one honest Release workbench. | Keep #20/#21 open; no snapshot/ZIP/status toggle may impersonate professional version/release/output authority. |
| **U9 — Final polish** | **Pending by design** | No broad polish pass until U8 structure stabilizes. | Accessibility/responsive/hierarchy/motion/performance/E2E after U8. |

## U0–U4 summary

### U0 — architecture/navigation lock

Established:

- target one-product mental model;
- no new permanent global domain rail/subnav;
- no duplicate Inspector/Problems systems;
- landing page excluded from Studio redesign;
- phase-based convergence and exact-head discipline.

### U1 — shell and routing

Landed:

- workbench tabs;
- contextual Project Drawer host;
- shared editor chrome primitives;
- shared Inspector/bottom dock/status bar;
- clean nested Studio routes;
- browser navigation/legacy-hash migration foundations;
- landing-section navigation without hash mutation.

This did not finish repository/layout/performance/recovery architecture.

### U2 — Project Home

Landed:

- one primary next action;
- lifecycle areas derive state from real domain evaluators/evidence;
- attention queue surfaces real missing/blocked conditions;
- inventory counts do not become fake readiness.

Durable “recent meaningful engineering changes” remains intentionally absent until repository/event history can support it.

### U3/U4 — Electronics and PCB

Landed direction:

- canonical component identity preserved across key Electronics representations;
- Schematic/PCB/BOM/contextual tools feel connected;
- PCB owns contextual setup/rules/DRC/BOM grammar;
- DRC uses shared bottom Problems surface;
- board context is explicit in repaired paths;
- no convergence work claims production auto-routing/placement.

#13–#15 remain the domain engineering authorities.

## U5 — Mechanical handoff

### Landed slices

- PR #107 / issue #106 — one Mechanical Project Drawer and explicit physical input.
- PR #110 / issue #109 — 2D Layout / 3D Review / Assembly representations inside one workbench.

### Structural result

- one Mechanical workbench;
- one shared selection/Inspector/dock grammar;
- representation choice is UI/session state;
- 3D is review/visualization, not CAD authority;
- missing exact package/geometry remains unresolved;
- board/mechanical handoff is clearer.

### Intentionally not completed

#16 remains open for:

- canonical sketch topology;
- persistent dimensions/constraints;
- solver/conflict explanation;
- profiles/parameters/expressions;
- drawing foundations.

#17 remains open for:

- CAD-kernel adapter;
- exact B-Rep solids/features;
- parametric regeneration;
- assemblies/mates;
- exact interference/clearance;
- qualified STEP/STL exchange.

## U6 — Firmware handoff

### Landed slice

- PR #113 / issue #112.
- merge commit: `ab4312f0f929103fc7baf3f2b52a80610639e72f`.
- final exact head during U6 gate: `646e70a581dc524ac8a8bfcd2899fe488a6dfdae`.

Repository code gate on final U6 head:

- lint: pass;
- typecheck: pass;
- tests: 332/332 at that U6 point;
- production build: pass;
- Vercel status at that checkpoint: external Hobby-plan build-rate-limit, documented separately from code correctness.

### Structural result

- one Firmware Project Drawer;
- one center representation/work surface;
- one Inspector;
- bottom Problems / Build Evidence / Device Evidence grammar;
- explicit module/file/build selection;
- no private source Explorer;
- duplicate `FirmwareStudio.tsx` removed;
- opening Source does not silently generate/select the first file;
- generated source is scaffolding, not verification;
- recorded build/device evidence is external/project metadata unless a real operation produced it.

### Intentionally not completed

#18 remains open for:

- real filesystem workspace;
- hardened/reproducible PlatformIO jobs;
- exact build artifacts/logs/toolchain provenance;
- upload/device/port workflow;
- serial monitor;
- cancellation/recovery;
- durable exact source/environment/device evidence.

## U7 — Validation handoff

### Landed slice

**PR:** #116 — `U7.1: Converge Validation on explicit Define Execute Review`  
**Issue:** #114 — completed  
**Merge commit:** `754fbabff639cddeeb4e68c6b2d2d547665d4571`  
**Verified exact PR head:** `643757f7f942702bbef4408e1edca621b1bf6ac3`

Exact-head gate:

- lint: pass;
- typecheck: pass;
- tests: **339/339 across 89 test files**;
- production build: pass;
- Vercel deployment status: pass.

Documentation handoff PR #117 then merged as current master `79902f6f...`.

### Structural result

- one Validation Project Drawer: Tests / Coverage / Factory QA / Runs;
- selection/job/dock state isolated in a UI-only workspace store;
- project `validationTests` / `validationRuns` remain canonical project state;
- no silent first-test or first-run selection;
- explicit **Define / Execute / Review** jobs;
- Define owns specification, not execution observation;
- Execute owns observation/evidence/reviewer/verdict/new run/retest;
- Review owns read-only historical run snapshots/history;
- selected run output/logs use shared bottom dock;
- old test-list overlay and floating run/evidence side panel retired;
- component-linked tests preserve canonical component/net IDs.

### Execution authority preserved

- DRC auto verdict = implemented local DRC rules only;
- firmware-state auto verdict = structural state-machine validation only;
- Mechanical = approximate AABB screen, cannot auto-pass exact clearance;
- Thermal = no internal solver, needs external evidence + reviewer;
- other manual/physical tests need explicit engineer verdict;
- retest appends new run, preserving prior history.

### Intentionally not completed

#19 remains open for:

- durable evidence blobs/hashes/provenance;
- version/procedure/DUT/sample/operator/environment binding;
- equipment/calibration policy;
- typed uncertainty/statistical measurement depth;
- durable execution jobs and recovery;
- trusted reviewer/signoff roles;
- deviations/waivers;
- retest comparison/lineage;
- deterministic stale propagation;
- release-grade accepted evidence.

## U8 — Active Release convergence

### Problem to solve

Release-related product state already exists across readiness, revisions/snapshots, outputs, drawings/blueprints, factory-package/manufacturing and release helpers. The structural risk is that these surfaces can look like separate applications and can visually imply stronger release authority than the underlying data provides.

### U8 target grammar

**Project Drawer**

- Readiness;
- Revisions / future Versions context;
- Outputs;
- Drawings;
- Factory Package;
- candidate/release context only where real records support it.

**Center**

- active Release job/surface;
- no duplicate dashboard/navigation shell.

**Inspector**

- explicit selected revision/output/package/candidate/release record only.

**Bottom dock**

- blockers;
- generation/preflight jobs;
- logs;
- review/evidence where real records exist.

**Top**

- contextual actions only.

### U8 truth constraints

- no silent first revision/version/release/artifact/candidate selection;
- no JSON snapshot presented as immutable content-addressed version;
- no status field/toggle presented as trusted role-bound approval;
- no generated filename/ZIP presented as manufacturing-qualified simply because generation succeeded;
- missing exact source version/provenance/hash/qualification remains visible;
- draft/unqualified artifacts remain visually distinct from accepted release evidence;
- no second UI-only version/output engineering model;
- #20/#21 remain open.

### #20 boundary

Real version/release completion still requires:

- editable workspace/base ancestry;
- immutable content-addressed versions;
- branches/protection;
- domain-aware comparisons;
- true three-way merges/conflicts;
- repository-enforced freeze;
- exact candidates/artifact hashes;
- trusted approval bound to exact payload;
- immutable releases + supersession/withdrawal.

### #21 boundary

Qualified output completion still requires:

- exact model-derived drawings;
- authoritative PCB/manufacturing formats;
- deterministic generation jobs;
- provenance/tool/input/output hashes;
- independent parser/viewer/preflight checks;
- trusted review bound to exact manifest;
- content-addressed release artifacts.

## U9 — Final polish gate

Do not begin a broad polish pass before U8 structural ownership is stable.

U9 scope will include:

- visual hierarchy/design-system cleanup;
- accessibility/keyboard behavior;
- responsive/editor-density/overflow behavior;
- motion only where useful;
- performance/profiling;
- complete empty/error/recovery consistency;
- selected browser smoke/E2E journeys.

U9 will not close unresolved engineering issues.

## Phase completion double-check

Before declaring any remaining U8/U9 slice complete:

1. exact PR changed-file review;
2. no landing-page design drift;
3. no duplicate shell ownership;
4. no silent canonical selection fallback;
5. exact-head lint/typecheck/full tests/build;
6. exact-head deployment-status inspection;
7. deep issue boundaries verified open;
8. truth labels/unsupported capabilities reviewed;
9. domain notes and this ledger updated;
10. next work starts from verified documented master.
