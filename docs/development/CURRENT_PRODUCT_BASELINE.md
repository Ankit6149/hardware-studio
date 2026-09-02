# Hardware Studio — Current Product Baseline

**Baseline reconciled:** 2026-09-02  
**Current master:** `79902f6fceb0087e7f446960e9c8059841ba4daa`  
**Active Studio phase:** U8 — Release convergence

This document is the repository's **current product-behavior contract**. It is intentionally shorter and more operational than the recovery plan. It defines rules that new implementation work must preserve.

If a historical issue, old mockup, stale test, research proposal, or generated implementation conflicts with this baseline, defer to:

1. `docs/CURRENT_STATUS.md`;
2. `docs/development/STUDIO_PHASE_EXECUTION_STATUS.md`;
3. `docs/development/PRODUCT_RECOVERY_EXECUTION_PLAN.md`;
4. this baseline;
5. the live GitHub issue acceptance criteria.

## 1. Product classification

Hardware Studio is currently a **connected engineering-workspace prototype under active recovery**.

It already has meaningful production foundations across:

- requirements and architecture;
- component/electronics identity;
- schematic and PCB;
- Mechanical 2D/3D review/assembly context;
- Firmware modules/source/hardware mapping/evidence;
- Validation definitions/runs/review;
- readiness/revisions/outputs;
- local machine bridge;
- MCP.

It is not yet a qualified replacement for mature CAD, ECAD, firmware, validation/QMS, PLM/release, or manufacturing systems.

The near-term objective remains: **make existing workflows connected, truthful, durable, and deep before expanding breadth.**

## 2. Current Studio structural baseline

U0–U7 structural UX convergence is accepted baseline.

### Required shell grammar

```text
TopBar
→ workbench tabs
→ contextual Project Drawer
→ central work surface
→ shared Inspector
→ shared bottom Problems / jobs / evidence / logs dock
→ status bar
```

### Do not reintroduce

- permanent product-stage rail;
- persistent domain sidebar as a second top-level navigation system;
- duplicate Inspector/property panels;
- duplicate Problems/diagnostics surfaces;
- per-workbench mini-app navigation strips that duplicate shell ownership;
- private source/test/explorer panels when the Project Drawer owns that context;
- hash-based Studio routing.

### Landing page

The public landing page is an approved surface and is outside the Studio redesign program. Change it only for correctness, accessibility, routing, or explicitly requested maintenance.

## 3. Canonical vertical path

The current reference product path is broader than the original Electronics-only slice:

```text
Project Home / requirements / architecture
→ components
→ schematic / PCB
→ mechanical context
→ firmware
→ validation Define / Execute / Review
→ readiness / outputs / release
```

Every step should preserve identity and evidence instead of recreating engineering objects.

## 4. Non-negotiable invariants

### 4.1 Unknown means unknown

Do not manufacture engineering facts to make a UI or generator look complete.

Examples:

- missing board dimensions remain unresolved;
- missing board ownership remains unresolved;
- missing component/package dimensions remain unresolved;
- missing placements remain unresolved;
- missing evidence/provenance/reviewer data remains unresolved;
- missing release hashes/qualification remain unresolved.

Use states such as **Unknown / Unresolved / Approximate / Draft / Needs Review / Blocked** instead of guessed values.

### 4.2 One canonical engineering identity

A project component, board, net, firmware module, validation test/run, revision, or output record must not be silently duplicated for individual workbenches.

UI/session state may remember which record is selected; it does not own a parallel engineering record.

### 4.3 Explicit context

Opening a workbench must not silently select the first available canonical record.

This applies especially to:

- board;
- firmware module/file/build;
- validation test/run;
- revision/version;
- output/package/candidate.

An explicit user creation action may select the object just created.

### 4.4 Navigation must not mutate engineering state

Opening a route/view/representation should not create project objects, alter timestamps as an engineering change, generate files, or repair ambiguous relationships merely to make the destination non-empty.

### 4.5 Generated artifacts are not verified facts

Generation and qualification are different states.

Generated content should carry truthful status such as:

- Draft;
- Concept;
- Generated in app;
- Needs Review;
- Unqualified;
- Stale;
- Blocked.

A generator must never turn missing upstream engineering truth into apparent readiness.

### 4.6 Editors mutate real project state

Visible production editing actions must affect the canonical project/repository model, not isolated demo state, unless the UI clearly identifies a transient preview.

### 4.7 Destructive changes respect dependency impact

Distinguish:

- removing one representation;
- removing a domain relationship;
- deleting the canonical product object.

Cross-product deletion must surface dependent objects/evidence/output impact before commit.

### 4.8 Derived state becomes stale

A source change should invalidate affected downstream:

- checks;
- firmware build/device evidence;
- validation evidence;
- drawings;
- manufacturing packages;
- release candidates/approvals;

according to dependency policy.

### 4.9 Output truth is stricter than editor convenience

A file-shaped artifact is not sufficient proof for:

- Gerber/drill qualification;
- BOM/CPL correctness;
- exact CAD/STEP authority;
- firmware execution proof;
- accepted validation evidence;
- immutable release.

## 5. Accepted structural progress

### Project Home

- evidence drives area state;
- counts are inventory only;
- next action and attention are explicit.

### Electronics / PCB

- connected component/board/net context exists;
- PCB owns one contextual drawer/Inspector/Problems grammar;
- board context is explicit in repaired flows;
- fake auto-place/autoroute claims are excluded from convergence work.

### Mechanical

- one Mechanical workbench;
- 2D Layout / 3D Review / Assembly representations;
- 3D remains review/visualization rather than exact CAD authority.

### Firmware

- one Firmware Project Drawer/workbench;
- explicit module/file selection;
- shared Inspector and bottom evidence/Problems dock;
- generated source distinguished from verification;
- recorded evidence distinguished from executed proof.

### Validation

- one Validation Project Drawer;
- explicit test/run selection;
- Define → Execute → Review separation;
- historical run review is read-only;
- current local execution authority remains bounded and truthful.

## 6. Active U8 baseline

U8 must converge Release without creating false release authority.

Required rules:

- one Release Project Drawer;
- explicit selected revision/version/output/package/candidate;
- shared Inspector;
- shared bottom blockers/jobs/preflight/log/evidence dock;
- no JSON snapshot presented as an immutable content-addressed version;
- no status toggle presented as trusted approval;
- no generated filename/ZIP presented as qualified output;
- missing source version/provenance/qualification remains visible;
- draft/unqualified artifacts remain visually distinct from accepted release evidence;
- no second UI-only version/output project model;
- #20 and #21 remain open.

## 7. Deep engineering issues remain authoritative

Structural convergence must not close:

- #15 — professional PCB/ECAD depth;
- #16 — sketch/constraint engine;
- #17 — CAD kernel/features/assemblies;
- #18 — filesystem/PlatformIO/device/serial execution;
- #19 — durable validation evidence/execution/review;
- #20 — immutable versions/branches/merges/releases;
- #21 — qualified drawings/manufacturing outputs.

Foundation issues for schema/repository/commands/graph/backend/interoperability also remain active.

## 8. Validation authority baseline

The current system may only make these bounded claims:

- local DRC: implemented local PCB rules;
- firmware state-machine validation: structural state-machine checks;
- Mechanical: approximate AABB screening, not exact clearance certification;
- Thermal: no internal solver; external evidence + reviewer required;
- other manual/physical tests: explicit engineer verdict required;
- retest: append a new run; preserve prior history.

Downstream readiness/Release must not infer stronger evidence than this.

## 9. Merge/completion rule

A baseline change is complete only when:

1. contradictory/retired behavior is removed rather than left beside the new path;
2. canonical state and consumers agree on ownership;
3. migration/backward compatibility is deliberate;
4. regression tests protect the behavior, not stale copy;
5. exact-head lint/typecheck/full tests/build pass;
6. deployment status is inspected honestly;
7. broad parent issues remain open when their engineering criteria are incomplete;
8. documentation is updated in the same change/handoff.

The current baseline should become **stricter** as professional engineering capability grows; it should never become more permissive merely to make completion easier to claim.
