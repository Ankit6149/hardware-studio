# Hardware Studio — Studio phase execution status

**Status date:** 2026-09-02  
**Primary direction:** `STUDIO_UX_CONVERGENCE_EXECUTION_PLAN.md`  
**Engineering authority:** `PRODUCT_RECOVERY_EXECUTION_PLAN.md`

This is the live execution ledger for the U0–U9 Studio phases. It records what has actually landed, what remains intentionally open, and the next bounded slice. It does not replace the detailed UX or engineering plans.

## Operating rule

After every bounded phase slice:

1. merge only after exact-head verification;
2. double-check PR scope, stale/duplicate paths, parent issue boundaries and deployment status;
3. record the merged PR/commit here and in the relevant domain notes;
4. state what the slice deliberately did **not** complete;
5. keep parent engineering issues open until their real acceptance criteria are satisfied;
6. start the next phase slice from the new verified and documented master.

Open-issue count is not the completion metric. The product gates and verified user workflows are.

## Phase ledger

| Phase | Current state | Evidence / boundary | Next action |
| --- | --- | --- | --- |
| **U0 — Architecture lock** | Landed | One Studio grammar, freeze rules, issue reconciliation and convergence plan established. | Maintain freeze rules while later phases land. |
| **U1 — Shared Studio shell** | Foundation landed; broader recovery still open | Workbench tabs, shared Project Drawer host, shared Inspector/bottom-dock/status primitives are in production code. Routing/repository/layout durability remain governed by their engineering issues. | Reuse shell primitives; do not fork per-domain shells. |
| **U2 — Project Home** | Truthful Home model landed; not a substitute for durable history | Next action/blocker/lifecycle logic uses real domain evidence. Do not fabricate recent changes from timestamps/counts. | Add durable engineering-change history only when command/repository history supports it. |
| **U3 — Electronics reference workbench** | Substantially converged; engineering depth still open | Shared identity, Schematic/PCB/BOM/contextual tools and common editor grammar are established. | Preserve canonical identity while #13–#15 deepen engineering capability. |
| **U4 — PCB editor depth** | Structural convergence landed; real PCB engine remains open | One PCB drawer, one Inspector, one Problems dock, explicit board identity/rules, no fake auto-place/autoroute claims. | Continue #15 separately for real ECAD depth. |
| **U5 — Mechanical** | **Structural UX convergence complete** | PR #107/#106: one drawer + explicit physical input. PR #110/#109: 2D Layout / 3D Review / Assembly in one workbench. | Continue #16/#17 separately for real sketch/CAD engineering. |
| **U6 — Firmware** | **Structural UX convergence complete** | PR #113/#112: one Firmware drawer/workbench/Inspector/dock, explicit module/file/build selection, duplicate `FirmwareStudio` removed. | Continue #18 separately for filesystem/PlatformIO/device/serial engineering. |
| **U7 — Validation** | **Structural UX convergence complete** | PR #116/#114: one Validation drawer, explicit test/run selection, Define → Execute → Review, shared Inspector/dock, execution truth preserved. | Continue #19 separately for durable evidence/execution/review infrastructure. |
| **U8 — Release** | **Active** | Current readiness/revision/output/package foundations exist but must not be confused with #20-grade immutable versions/releases or #21-grade qualified artifacts. | Converge Release control surfaces with explicit context and draft/unqualified truth. |
| **U9 — Final polish** | Not started by design | Structural work must stabilize first. | After U8: full visual hierarchy, functional visuals, accessibility, responsive layouts, motion/performance and interaction predictability. |

## Latest completed slice — U7.1 Validation convergence

**PR:** #116 — `U7.1: Converge Validation on explicit Define Execute Review`  
**Issue:** #114 — completed  
**Merged master:** `754fbabff639cddeeb4e68c6b2d2d547665d4571`  
**Verified exact PR head:** `643757f7f942702bbef4408e1edca621b1bf6ac3`

Exact-head verification before merge:

- lint: pass;
- typecheck: pass;
- tests: **339/339 pass across 89 test files**;
- production build: pass;
- Vercel deployment status: pass.

Final double-check before merge:

- changed files were limited to Validation shell/workbench/state plus direct regression guards;
- no landing-page or schema changes;
- no PCB, Mechanical, Firmware or Release production changes;
- #19 confirmed open;
- explicit regression guards reject silent first-test/first-run fallback and retired floating-panel ownership.

### U7.1 landed behavior

- one shell-owned Validation Project Drawer: **Tests / Coverage / Factory QA / Runs**;
- selection/job/dock state lives only in `validationWorkspaceUiStore`;
- project `validationTests` and `validationRuns` remain in canonical project state;
- opening Validation no longer silently chooses the first test or first run;
- center work is explicitly divided into **Define / Execute / Review**;
- Define owns specification: procedure, expected/tolerance schema, links, pass criteria and editable definition references;
- Define no longer exposes actual measurements or step-completion state as if they were specification truth;
- Execute owns observed result, evidence reference, reviewer/verdict and run/retest creation;
- Review owns read-only historical run snapshot/history;
- selected run logs use the shared bottom dock;
- the internal test-list overlay and floating run/evidence side panel are retired;
- component-linked validation derives actual canonical net IDs from component pin `netId` values.

### U7 execution truth preserved

- local DRC automation covers implemented local DRC rules only;
- firmware-state automation validates state-machine structure only;
- Mechanical execution remains an approximate AABB collision screen and cannot auto-pass exact physical clearance;
- Thermal has no internal solver and requires external simulation/lab evidence plus reviewer identity;
- arbitrary text or a measurement alone does not become a trusted manual/physical Pass;
- retests add a new run while prior history remains present.

Full handoff details: `U7_VALIDATION_CONVERGENCE_NOTES.md`.

## Validation engineering boundary after U7

Issue #19 remains open for:

- durable hashed evidence/object storage and provenance;
- exact product-version/procedure/DUT/sample/operator/environment binding;
- equipment and calibration policy;
- typed uncertainty/statistical measurement support;
- durable pause/resume/cancel/recovery execution jobs;
- immutable reviewer/sign-off records and roles;
- waivers/deviations;
- trusted retest lineage/comparison;
- deterministic stale propagation;
- release-grade accepted-evidence policy.

Do not close #19 because the Validation workbench is structurally coherent.

## Active phase — U8 Release convergence

### Confirmed engineering boundary

Issue #20 remains the authority for real versions, branches and releases. Current revision/snapshot/status UI must **not** be presented as equivalent to:

- immutable content-addressed named versions;
- explicit branch ancestry/base semantics;
- domain-aware comparisons;
- true three-way merges/conflicts;
- repository-enforced freezes;
- exact candidate/artifact hashes;
- trusted approval bound to exact payload hash;
- immutable published releases with supersession/withdrawal.

Issue #21 remains the authority for real drawings/manufacturing/qualified outputs. Current generators/download surfaces must **not** imply that generation alone establishes qualification.

Qualified output eventually requires canonical source data, provenance/tool/input/output hashes, independent parser/viewer checks, review policy, reproducibility and exact release integration.

### U8 target grammar

The U8 structural target is one connected Release workbench:

- **Left Project Drawer:** Readiness / Versions or Revisions / Outputs / Drawings / Factory Package / release context supported by real state;
- **Center:** selected Release job/surface rather than disconnected mini-app pages;
- **Right Inspector:** explicitly selected revision/output/candidate/package context only;
- **Bottom dock:** blockers, generation/preflight jobs, logs and review evidence where real records exist;
- **Top:** contextual actions only.

### U8 truth constraints

- no silent first revision/release/artifact selection;
- no JSON snapshot presented as a content-addressed immutable version;
- no status toggle presented as trusted release approval;
- no generated filename/ZIP presented as manufacturing-qualified merely because generation succeeded;
- missing geometry/version/provenance/qualification remains visible and blocking where appropriate;
- draft/unqualified artifacts remain visually distinct from release evidence;
- do not create a second version/output data model merely for UX convergence;
- keep #20 and #21 open.

## Double-check discipline for U8 and U9

Before calling a phase slice complete:

1. review exact PR changed-file scope;
2. run exact-head lint, typecheck, all tests and production build;
3. inspect Vercel/deployment status;
4. scan for retired duplicate paths and implicit selection fallbacks;
5. verify deep parent issues remain correctly open;
6. verify truth labels and unsupported-capability boundaries;
7. update domain notes and this ledger;
8. start the next phase from the verified documented master only.
