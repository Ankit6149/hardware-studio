# U7 Validation Convergence Notes

**Reconciled:** 2026-09-02  
**Structural phase:** complete  
**Current Studio phase:** U8 — Release convergence  
**Engineering authority still open:** #19

This file records the bounded U7 interaction decisions and execution-authority boundaries that remain part of the accepted product baseline.

## Merged evidence

- PR #116 — `U7.1: Converge Validation on explicit Define Execute Review`
- child issue #114 — completed through PR #116
- merge commit: `754fbabff639cddeeb4e68c6b2d2d547665d4571`
- verified exact PR head: `643757f7f942702bbef4408e1edca621b1bf6ac3`

Exact-head gate before merge:

- lint: pass;
- typecheck: pass;
- tests: **339/339 across 89 test files**;
- production build: pass;
- Vercel deployment status: pass.

The final scope review also confirmed:

- Validation shell/workbench/state/tests were the focus;
- no landing-page redesign;
- no canonical schema fork;
- no PCB/Mechanical/Firmware/Release production rewrite in the U7 slice;
- #19 remained open;
- regression tests protected explicit selection and retired-panel ownership.

PR #117 then documented the U7 handoff and activated U8. Current documentation-baseline master is `79902f6f...`.

## 1. Landed Validation interaction grammar

Validation is one connected workbench rather than overlapping authoring/execution mini-apps.

### Project Drawer

Owns:

- Tests;
- Coverage;
- Factory QA;
- Runs.

Test/run selection is explicit UI/session state. Opening Validation does not silently choose the first test or first run.

### Center jobs

#### Define

Owns the mutable **test specification**:

- name/identity;
- stage/category;
- requirement/component/net/firmware linkage;
- procedure instructions;
- expected results;
- expected measurement schema;
- tolerances/criteria supported by current model;
- pass criteria;
- editable definition/reference material.

Define is not execution evidence.

U7 deliberately removed the misleading pattern where specification authoring also exposed:

- step-completion state as if execution occurred;
- actual measurement values as if the definition itself carried run evidence.

Editable definition references are planning/reference context, not immutable run evidence.

#### Execute

Requires an explicitly selected test.

Owns current execution inputs such as:

- observation/measurement supported by the runner;
- evidence reference;
- operator/reviewer field where used;
- explicit manual verdict where required;
- creation of a new run/retest record.

Execute must expose the actual authority of the selected validation mode before recording a result.

#### Review

Requires an explicitly selected historical run.

Owns read-only inspection of:

- run number/status;
- captured measured/observed value;
- pass criteria snapshot;
- evidence snapshot/reference;
- step results/logs captured at run time;
- prior run history/context.

Historical run snapshots must not become editable test-definition state.

### Inspector

The shared Inspector reflects the explicitly selected test/run context. It does not silently select records on behalf of the user.

### Bottom dock

Selected-run output/logs use the shared `EngineeringBottomDock`, replacing the old floating run/evidence side panel ownership.

## 2. Explicit-selection contract

The U7 regression suite protects against reintroduction of patterns such as:

- `visibleTests[0]` as implicit current test;
- `linkedTests[0]` as implicit execution test;
- `validationTests[0]` as implicit execution test;
- `runHistory[0]` as implicit current review run;
- private `testListOpen` test-browser ownership;
- private `runPanelOpen` floating execution ownership.

Explicit creation may select the object the engineer just created. Passive navigation may not invent canonical context.

## 3. Identity / traceability boundary

Validation should consume the same product identities used by other domains.

Examples:

- requirement IDs;
- component instance IDs;
- net IDs derived from canonical component pin `netId` fields;
- firmware module IDs;
- architecture IDs.

A Validation UI refactor must not create copied display-name relationships when canonical IDs exist.

## 4. Current execution authority

U7 reorganized useful existing validation behavior without broadening what the engine is allowed to claim.

### DRC

Automated DRC verdicts are limited to the implemented local PCB rule set.

A pass does not certify every electrical/manufacturing rule required by a professional ECAD/fabrication process.

### Firmware state machine

Automated state-machine checks validate structural properties such as reachability/transition validity supported by the current validator.

They do **not** prove:

- compilation;
- timing;
- peripheral correctness;
- runtime behavior;
- hardware interaction;
- safety behavior.

### Mechanical

The local Mechanical execution path is an approximate AABB collision/clearance screen.

- detected approximate collision can legitimately fail/block the local screen;
- clean approximate screen remains **Needs Review** unless a stronger evidence-backed engineer verdict is recorded;
- approximate geometry does not prove exact physical clearance.

### Thermal

Hardware Studio has no internal thermal solver.

A Thermal verdict requires external simulation/lab evidence plus reviewer identity under the current runner rules.

### Other manual/physical tests

Arbitrary text or a measurement alone cannot produce a trusted Pass.

An explicit engineer verdict is required; evidence/reviewer requirements depend on the validation type and current policy.

### Retest

Retesting creates a new run record while prior run history remains present.

U7 does not permit UI review to silently rewrite a historical run.

## 5. What U7 deliberately did not complete

U7 is structural UX convergence, not #19 completion.

#19 remains the authority for:

### Durable evidence/provenance

- evidence blobs/objects;
- content hashes;
- tamper-resistant provenance;
- exact source/version binding.

### Execution identity

- exact product version;
- procedure revision;
- DUT/sample/lot/build identity;
- operator/environment;
- equipment and calibration.

### Measurement model

- typed units;
- resolution/uncertainty;
- statistical treatment;
- richer tolerance semantics;
- instrument/fixture policy.

### Execution service

- durable run jobs;
- pause/resume/cancel/recovery;
- long-running operation state;
- immutable execution audit.

### Review/governance

- trusted reviewer roles;
- immutable signoff;
- deviations/waivers;
- approval policy;
- retest lineage/comparison;
- stale/revalidation rules.

### Release integration

- accepted evidence bound to exact release candidate/version;
- dependency-driven stale blocking;
- end-to-end browser/production workflow through Release.

Do not close #19 because the workbench is coherent.

## 6. Handoff into active U8 Release

U8 must consume Validation evidence at its actual strength.

Release must not infer that current Validation records are automatically:

- content-hashed;
- bound to an immutable product version;
- bound to calibrated equipment;
- trusted role-signed;
- tamper-evident;
- suitable for certification/QMS use.

Current run history can inform readiness and review, but #20/#21 release/output logic must preserve #19 limitations.

### Release blockers should remain conservative

Where release policy requires validated evidence, the following should remain blocking or unresolved as appropriate:

- missing required test/run;
- failed required run;
- stale evidence after source changes;
- unresolved reviewer/provenance requirements;
- unsupported execution authority;
- missing exact version binding when the policy requires it.

### No evidence laundering

A downstream Release screen must not make current mutable/project-record evidence look more authoritative merely because it is displayed beside revisions or generated packages.

## 7. Current phase relationship

Since U7 landed:

- U8 Release is active;
- U9 final polish remains pending;
- #19 engineering work continues in parallel;
- #20/#21 will eventually require stronger Validation provenance for professional release claims.

## 8. Non-negotiable regression rules

Do not improve Validation by:

- restoring implicit first-test/run selection;
- recombining Define/Execute/Review into one large mutable form;
- allowing historical run edits through Review;
- moving actual observations back into the test-definition authoring surface;
- treating editable definition references as immutable evidence;
- auto-passing unsupported tests;
- calling approximate Mechanical screening exact clearance proof;
- claiming an internal thermal solver;
- closing #19 because U7 looks complete.

U7 is structurally complete. Validation engineering completion remains governed by #19 and the final reference-product release path.
