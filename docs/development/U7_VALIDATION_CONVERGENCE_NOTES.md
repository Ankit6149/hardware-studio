# U7 Validation convergence notes

**Status date:** 2026-09-02  
**Structural UX phase:** complete  
**Engineering authority still open:** #19

## Merged evidence

- PR #116 — `U7.1: Converge Validation on explicit Define Execute Review`
- Issue #114 — completed through PR #116
- merged master: `754fbabff639cddeeb4e68c6b2d2d547665d4571`
- verified exact PR head: `643757f7f942702bbef4408e1edca621b1bf6ac3`

Exact-head verification before merge:

- lint: pass;
- typecheck: pass;
- tests: **339/339 pass across 89 test files**;
- production build: pass;
- Vercel deployment status: pass.

A final pre-merge double-check also confirmed:

- PR scope was limited to Validation shell/workbench/test files;
- no landing-page, schema, persistence, Firmware, PCB, Mechanical or Release production changes were included;
- #19 remained open;
- regression guards reject the retired implicit-selection and floating-panel patterns.

## Landed interaction grammar

Validation is now one connected workbench rather than overlapping authoring/execution mini-apps.

### Left Project Drawer

- Tests
- Coverage
- Factory QA
- Runs

Test and run selection are explicit UI/session state in `validationWorkspaceUiStore`. Opening Validation does not silently choose the first test or first run.

### Center jobs

#### Define
Owns the mutable test specification:

- test identity/name;
- stage/category;
- requirement linkage;
- procedure instructions and expected results;
- expected measurement schema and tolerances;
- pass criteria;
- editable **definition references**.

Define no longer presents execution completion or actual readings as specification data. `step.completed` and `measurement.actualValue` are not editable execution controls in this surface.

Definition references are explicitly labelled as editable planning/reference data, **not immutable validation run evidence**.

#### Execute
Requires an explicitly selected test and surfaces the existing bounded execution authority before recording a run/retest.

Observed result, evidence reference, reviewer identity and manual verdict belong here rather than in test definition authoring.

#### Review
Requires an explicitly selected historical run and displays the frozen run snapshot/history read-only. Historical run logs use the shared bottom dock.

## Shared shell

U7 now uses the common Studio grammar:

- shared `EngineeringEditorBar`;
- shell-owned `ValidationProjectDrawer`;
- contextual `EngineeringInspector`;
- `EngineeringBottomDock` for selected-run output/logs;
- shared `EngineeringStatusBar`.

The former internal test-list overlay and floating run/evidence side panel are retired from the live Validation workflow.

## Selection and identity truth

The U7 regression suite explicitly guards against:

- `visibleTests[0]` fallback;
- `linkedTests[0]` fallback;
- `validationTests[0]` fallback;
- `runHistory[0]` fallback;
- retired `testListOpen` ownership;
- retired `runPanelOpen` ownership.

Component-linked validation continues to derive actual linked net IDs from canonical component pin `netId` values rather than a display-name shortcut.

## Execution truth preserved

U7 reorganized existing useful validation behavior without broadening its claimed authority.

- **DRC:** automated verdicts are limited to implemented local DRC rules.
- **Firmware state:** automated checks validate state-machine structure/reachability only; they do not prove build/runtime/hardware behavior.
- **Mechanical:** local execution is an approximate AABB collision screen. A clean screen is not exact CAD/physical clearance verification.
- **Thermal:** Hardware Studio has no internal thermal solver. A verdict requires external simulation/lab evidence plus reviewer identity.
- **Manual/physical:** arbitrary text or a measurement alone cannot produce a trusted Pass.
- **Retest:** a new run is appended/prepended in history while prior run records remain present; prior history is not silently overwritten.

## What U7 deliberately did not complete

U7 is structural UX convergence, not closure of #19.

Issue #19 remains the authority for:

- durable object/blob evidence storage and content hashes;
- exact product version / procedure revision binding;
- DUT, sample, lot/build, operator and environment binding;
- equipment/calibration records and policy;
- typed units, uncertainty, resolution and statistical analysis;
- durable execution jobs with pause/resume/cancel/recovery;
- immutable reviewed/sign-off records and role policy;
- waivers/deviations;
- trusted retest comparison and lineage;
- deterministic stale propagation after design/build/procedure changes;
- release-grade accepted-evidence policy;
- end-to-end browser workflow from execution through release gate.

Do **not** close #19 because the Validation workbench is now coherent.

## Handoff to U8

The next Studio phase is U8 Release convergence.

U8 must use the same truth discipline:

- one Release control surface rather than independent readiness/revision/output/factory mini-apps;
- explicit revision/version/candidate/artifact context;
- current JSON snapshot revisions must not be presented as immutable content-addressed versions;
- generated output filenames/ZIPs must not be presented as qualified manufacturing artifacts merely because generation succeeded;
- draft/unqualified output state must remain visually distinct from release evidence;
- #20 and #21 remain open until their full engineering completion guards are satisfied.
