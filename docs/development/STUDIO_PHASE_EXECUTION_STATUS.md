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
| **U5 — Mechanical** | **Structural UX convergence complete** | PR #107/#106 established one drawer + explicit physical input. PR #110/#109 converged 2D Layout / 3D Review / Assembly. #16/#17 remain open for real sketch/CAD engineering. | Continue #16/#17 in parallel; do not fake solver/CAD depth in UX phases. |
| **U6 — Firmware** | **Structural UX convergence complete** | PR #113/#112: one Firmware drawer/workbench/Inspector/dock, explicit module/file/build selection, duplicate `FirmwareStudio` removed. #18 remains open for real filesystem/PlatformIO/device/serial engineering. | Continue #18 in parallel through the shared Firmware grammar. |
| **U7 — Validation** | **Active — U7.1 scoped in #114** | Existing runner/history foundations are useful but current UI has two implicit first-test fallbacks and blends Define/Execute/Review. #19 remains the durable-validation authority. | U7.1: explicit test/run selection, one drawer, Define → Execute → Review, bottom execution/evidence dock. |
| **U8 — Release** | Pending dedicated phase pass | Version/output/release foundations exist but remain governed by #20/#21 and release truth gates. | Run dedicated U8 control-surface convergence after U7 handoff. |
| **U9 — Final polish** | Not started by design | Structural work must stabilize first. | After U7–U8: final visual hierarchy, functional visuals, accessibility, responsive layouts, motion/performance and interaction predictability. |

## Latest completed slice — U6.1 Firmware convergence

**PR:** #113 — `U6.1: Converge Firmware on one drawer and explicit evidence grammar`  
**Issue:** #112 — completed  
**Merged master:** `ab4312f0f929103fc7baf3f2b52a80610639e72f`  
**Verified exact PR head:** `646e70a581dc524ac8a8bfcd2899fe488a6dfdae`

Exact-head verification before merge:

- lint: pass;
- typecheck: pass;
- tests: 332/332 pass;
- production build: pass;
- Vercel: inspected external Hobby-plan build-rate-limit status; not an application build failure.

### U6.1 landed behavior

- one shell-owned Firmware Project Drawer: **Modules / Files / Map / Environment**;
- one `EngineeringFirmwareWorkbench` authority for all live Firmware routes;
- the retired 676-line `FirmwareStudio.tsx` duplicate mini-app is physically deleted;
- module responsibility, Behavior/state-machine, Hardware Map and Source are representations of one Firmware workbench;
- right Inspector is selection-aware;
- bottom dock owns **Problems / Build Evidence / Device Evidence**;
- `firmwareWorkspaceUiStore` contains only UI/session state;
- canonical firmware modules, states, transitions, mappings, source records and evidence remain in project state;
- opening Firmware does not auto-select the first module;
- opening Source does not auto-select the first file;
- generated scaffolding does not silently become the selected/authoritative implementation;
- device evidence requires an explicitly chosen successful build record;
- source-editor tree ownership moved to the shared Firmware drawer;
- source editor retains line numbers, cursor position, keyboard save and explicit generated-file truth labels.

### U6.1 truth boundary

U6.1 deliberately did **not** claim real firmware execution capability.

Current Build Evidence:
- records externally produced build metadata/logs;
- does not claim Hardware Studio ran a compiler.

Current Device Evidence:
- records an externally observed device result;
- does not claim Hardware Studio flashed, queried or monitored the device.

Generated source:
- remains scaffolding;
- remains `Generated · not verification`.

State-machine diagnostics:
- validate structural reachability/transition integrity only;
- do not prove compilation, timing, hardware behavior or runtime correctness.

## Firmware engineering boundary after U6

Issue #18 remains the authority for:

- filesystem-backed project tree and conflict/recovery semantics;
- Monaco/equivalent source editor and language services;
- authoritative PlatformIO environments and dependency/toolchain configuration;
- real build/clean/upload/erase/device-list operations;
- hardened exact-payload approval flow;
- durable queued/running/completed/failed/cancelled operation records;
- streaming stdout/stderr, timeout, retry and cancellation;
- real serial monitor and evidence capture;
- atomic file writes/backups plus path/origin/symlink hardening;
- content-addressed artifacts tied to source snapshot, tools and product version;
- richer typed hardware maps/conflict detection;
- a reference-device edit → build → approved flash → serial → Validation workflow.

Do not close #18 because U6 is structurally coherent.

## Active bounded slice — U7.1 Validation convergence

**Issue:** #114 — `[U7.1][Validation] Converge Define / Execute / Review with explicit test selection`

### Current structural defects confirmed by audit

Validation currently has two independent implicit-selection paths:

1. `ValidationStudio` resolves its selected test as explicit ID **or `visibleTests[0]`**;
2. `UnifiedValidationWorkbench` resolves execution target as explicit ID **or `linkedTests[0]` or `validationTests[0]`**.

That means authoring and execution can silently point at a test the user never selected, and the two surfaces can reason about different implicit tests.

Other confirmed problems:

- run/evidence interaction is a floating right-side panel instead of the shared bottom-dock grammar;
- definition fields, mutable test evidence, execution, and historical review are visually blended;
- Coverage and Factory QA are route modes rather than clearly contextual jobs inside one Validation workbench;
- current append-only run records are useful but are not the durable hashed/reviewed evidence model required by #19.

### U7.1 target grammar

- **Left Project Drawer:** explicit Tests / Coverage / Factory QA / Runs context backed by existing project data;
- **Center:** explicit **Define / Execute / Review** job surface;
- **Right Inspector:** explicitly selected test/run context only;
- **Bottom dock:** execution output, Problems and evidence/history context rather than a floating side mini-app;
- **Top:** contextual actions only.

### Execution truth to preserve

The current runner has bounded useful authority and U7 must preserve it:

- DRC automation derives only from implemented local DRC rules;
- firmware-state automation validates structural state-machine consistency only;
- Mechanical automation is an approximate AABB collision screen and cannot auto-pass exact physical clearance;
- Thermal has no internal solver and requires external evidence + reviewer for a verdict;
- manual/physical validation cannot Pass from arbitrary text or a measurement alone;
- retests append a new run while prior runs remain present.

## Validation engineering boundary during U7

Issue #19 remains open for the real durable validation system, including:

- version/procedure/DUT/equipment/calibration binding;
- durable hashed evidence storage and provenance;
- typed measurement uncertainty/statistical analysis;
- pause/resume/cancel/incomplete execution recovery;
- immutable reviewed/sign-off records;
- waivers/deviations;
- retest lineage and dependency-change comparison;
- deterministic stale propagation;
- release-grade validation policy.

U7 structural convergence must not hide those gaps or close #19.

## Phase handoff discipline

For U7 and U8:

1. implement one bounded structural/truth slice at a time;
2. merge only after exact-head lint/typecheck/tests/build/deployment inspection;
3. update this ledger plus domain-specific notes immediately after merge;
4. keep #19/#20/#21 open until their engineering completion guards are genuinely satisfied;
5. do not start U9 polish until U7/U8 structure is stable enough that polish will not be thrown away.
