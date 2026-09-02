# Hardware Studio — Roadmap

**Roadmap reconciliation:** 2026-09-02  
**Current master at reconciliation:** `79902f6fceb0087e7f446960e9c8059841ba4daa`  
**Active Studio phase:** U8 — Release convergence

This roadmap uses **two coordinated tracks**:

1. **Studio convergence track (U0–U9)** — make the product predictable, connected, truthful, and usable as one engineering environment.
2. **Engineering recovery track** — deepen schema, repository, commands, graph, ECAD, CAD, firmware, validation, release, outputs, interoperability, backend, and safety until the product earns professional claims.

The tracks must advance together. A coherent UI over weak engineering state is not completion; deep engines hidden behind fragmented mini-apps are not a good product either.

## Roadmap principles

### One connected product, not more panels

Hardware Studio should deepen end-to-end product workflows instead of adding disconnected feature shells.

### Structural convergence and engineering completion are separate gates

A Studio phase may be structurally complete while its engineering parent issue remains open.

Examples:

- U5 Mechanical structure landed; #16/#17 remain open.
- U6 Firmware structure landed; #18 remains open.
- U7 Validation structure landed; #19 remains open.
- U8 can structurally converge Release while #20/#21 remain open.

### Every mature engineering capability eventually needs

```text
canonical domain model
→ production engine / adapter
→ typed commands / transactions
→ durable repository
→ production UI
→ failure / recovery semantics
→ cross-domain impact / staleness
→ provenance / review where required
→ automated tests
→ independent qualification where required
→ release evidence
```

## Track A — Studio convergence U0–U9

### U0 — Architecture lock — **Landed**

Goal:

- establish one product mental model;
- freeze duplicate navigation patterns;
- define shared shell ownership;
- reconcile UX/recovery issues.

Outcome:

- one Studio direction established;
- no new permanent domain rail/subnav;
- no duplicate Inspector/Problems systems;
- landing page excluded from redesign work.

### U1 — Shared Studio shell — **Foundation landed**

Goal:

- one predictable application grammar across workbenches.

Landed foundations:

- workbench tabs;
- contextual Project Drawer host;
- shared Inspector;
- shared bottom dock;
- status bar;
- clean `/studio/...` routes;
- browser back/forward and legacy alias handling foundations.

Still separate engineering work:

- repository/layout durability;
- performance/crash hardening;
- broader shell decomposition and testing.

### U2 — Project Home — **Landed**

Goal:

- show what matters now, based on real engineering evidence.

Landed:

- next action;
- lifecycle state;
- attention/blocker queue;
- counts treated as inventory rather than completion evidence.

Still open:

- durable recent engineering history from real repository/event data.

### U3 — Electronics reference workbench — **Structurally converged**

Goal:

- establish the reference interaction model for connected engineering representations and identity.

Landed direction:

- component/schematic/PCB/BOM relationships;
- shared identity and cross-probing foundations;
- contextual tools instead of duplicate app shells.

Deep engineering continues through Electronics/PCB recovery issues.

### U4 — PCB — **Structurally converged**

Goal:

- make PCB one coherent editor/workbench with explicit board context.

Landed direction:

- one PCB Project Drawer;
- one Inspector;
- DRC in shared Problems dock;
- explicit board/settings/rules context;
- no false auto-place/autoroute claims.

Engineering exit for professional PCB remains issue #15, not U4.

### U5 — Mechanical — **Structurally converged**

Goal:

- one Mechanical workbench that distinguishes layout, review, and assembly context.

Landed:

- explicit physical inputs;
- one drawer/Inspector/dock grammar;
- 2D Layout / 3D Review / Assembly representations;
- 3D classified as review/visualization rather than CAD authority.

Engineering continuation:

- #16 sketch/constraint engine;
- #17 CAD-kernel/features/assemblies/exact exchange.

### U6 — Firmware — **Structurally converged**

Goal:

- one Firmware workspace around modules, files, hardware mapping and evidence.

Landed:

- one Firmware Project Drawer;
- explicit module/file selection;
- module/behavior/hardware-map/source center representations;
- shared Inspector;
- bottom Problems / Build Evidence / Device Evidence grammar;
- generated source distinguished from verified implementation;
- recorded external evidence distinguished from locally executed proof.

Engineering continuation:

- #18 filesystem/PlatformIO/device/serial/durable operation infrastructure.

### U7 — Validation — **Structurally converged**

Goal:

- separate authoring, execution and review into predictable user jobs.

Landed through PR #116:

- one Validation Project Drawer;
- explicit test/run selection;
- Define → Execute → Review;
- no implicit first-test/run fallback;
- specification separated from actual observations;
- read-only historical run review;
- shared Inspector and run-log bottom dock;
- existing bounded execution authority preserved.

Verified U7 head:

- lint/typecheck/build pass;
- **339/339 tests across 89 test files**;
- Vercel pass.

Engineering continuation:

- #19 durable evidence/execution/reviewer/stale/release-grade validation infrastructure.

### U8 — Release — **Active**

Goal:

- make readiness, revisions/versions, outputs, drawings, factory packages and release decisions one connected control surface without overstating current engineering guarantees.

Target interaction grammar:

- one Release Project Drawer;
- explicit selected revision/version/output/package/candidate context;
- center surface based on the active Release job;
- one contextual Inspector;
- bottom blockers/jobs/preflight/log/evidence dock;
- contextual top actions;
- draft/unqualified output visibly distinct from release evidence.

Required structural work:

- audit current readiness/revision/output/drawing/factory-package surfaces;
- retire duplicate navigation/mini-app shells;
- remove silent first-record selection fallbacks;
- unify explicit Release context in UI-only state where appropriate;
- preserve current canonical project records rather than fork a UX-only release model;
- surface missing source version/provenance/qualification honestly;
- add regression guards;
- exact-head CI/build/deployment verification;
- dedicated U8 documentation handoff.

U8 must **not** claim completion of #20 or #21.

#### #20 engineering continuation

- content-addressed immutable versions;
- editable workspace/base ancestry;
- branches/protection;
- domain-aware comparisons;
- three-way merge/conflict resolution;
- repository-enforced freezes;
- exact release candidates/manifests;
- trusted approvals bound to exact payloads;
- immutable releases + supersession/withdrawal.

#### #21 engineering continuation

- exact model-derived drawings;
- authoritative ECAD/manufacturing outputs;
- deterministic generation jobs;
- provenance/tool/input/output hashes;
- independent parser/viewer/preflight qualification;
- review/approval bound to manifest;
- content-addressed release artifacts.

### U9 — Final polish — **Deferred intentionally**

Goal:

- polish a structurally stable product rather than beautifying unstable architecture.

Scope after U8:

- visual hierarchy/design-system convergence;
- accessibility and keyboard behavior;
- responsive layouts and overflow behavior;
- editor density/readability;
- motion only where it clarifies state;
- performance profiling and perceived latency;
- interaction consistency;
- empty/error/recovery states;
- production-browser smoke/E2E coverage for key journeys.

U9 is not an excuse to hide unresolved engineering state behind visual polish.

## Track B — Engineering recovery

The engineering track is dependency-driven and remains authoritative even when the Studio phase for that domain is structurally complete.

### Foundation layer — schema, repository, commands, graph, shell

Primary work includes:

- #6 canonical schema normalization;
- #7/#38 durable repository and persistence;
- #8/#39 typed commands, transactions, undo/redo;
- #9 shell/navigation/crash/performance hardening;
- #10 end-to-end/CI strategy;
- #11/#42 monolith decomposition;
- #12 canonical product graph.

Exit condition:

Engineering domains share stable IDs, ownership, units, migrations, repository semantics, commands/events, and cross-domain relationships rather than relying on monolithic optional state.

### Product / requirements / architecture

Goals:

- measurable requirements;
- governed interfaces;
- traceability;
- decisions/risks;
- impact analysis;
- requirement-to-validation/release lifecycle.

Exit condition:

A requirement change can deterministically reveal affected implementation, evidence, outputs and release state.

### Electronics / PCB — #15 and related work

Goals:

- canonical connectivity graph;
- robust schematic/ERC;
- authoritative board topology;
- real routing/via/layer behavior;
- stackup/rules/zones/keepouts;
- comprehensive DRC;
- strict board isolation;
- qualified interchange/output inputs.

Exit condition:

The reference board survives editing, save/reload, validation and independent output checks with no hidden cross-board or guessed-data behavior.

### Mechanical — #16/#17

Goals:

- canonical sketch topology;
- persistent dimensional/geometric constraints;
- solver/conflict explanation;
- profiles/parameters/expressions;
- reviewed CAD-kernel adapter;
- exact B-Rep feature history/regeneration;
- assemblies/mates;
- exact interference/clearance;
- qualified STEP/STL/drawing foundations.

Exit condition:

Mechanical design and release drawings derive from exact, reproducible, reviewable model state rather than screen geometry or approximate envelopes.

### Firmware — #18

Goals:

- real workspace/filesystem model;
- reproducible PlatformIO configuration;
- build jobs/artifacts/logs;
- upload/device selection;
- serial monitor;
- cancellation/recovery;
- exact source/environment/device provenance;
- durable evidence integration.

Exit condition:

A build/upload/device claim corresponds to a real operation tied to exact source/environment/target and survives reload/review.

### Validation — #19

Goals:

- version-bound test definitions;
- execution jobs;
- DUT/sample/operator/environment/equipment/calibration binding;
- typed measurements/uncertainty;
- durable evidence blobs/hashes;
- immutable accepted run snapshots;
- reviewer roles/signoff;
- waivers/deviations;
- retest comparison;
- deterministic stale propagation;
- release policy integration.

Exit condition:

A release can cite trusted accepted evidence that is immutable, attributable, reproducible enough for its scope, and stale when its dependencies change.

### Versions / Release — #20

Goals:

- editable workspaces;
- immutable versions;
- branches and ancestry;
- domain-aware comparisons;
- real merges/conflicts;
- freezes;
- candidates;
- trusted approvals;
- immutable releases/manifests;
- supersession/withdrawal.

Exit condition:

A complete branch → compare → merge → candidate → approval → release journey survives reload and cannot silently mutate reviewed/released state.

### Drawings / outputs / manufacturing — #21

Goals:

- canonical recipes;
- exact source dependencies;
- drawings from exact models;
- PCB/BOM/CPL/drill/manufacturing packages from authoritative topology;
- firmware/validation artifacts from immutable records;
- deterministic jobs;
- hashes/provenance;
- independent parsers/viewers/preflight;
- review/approval bound to exact manifest;
- release integration.

Exit condition:

A reference-product package is reproducible, reviewable, independently checkable, and clearly qualified or blocked—never merely “generated.”

### MCP, backend, roles, interoperability

Goals include:

- shared durable repository for UI and MCP;
- typed draft/apply operations;
- audit/approval policy;
- backend/role/security boundaries;
- external tool adapters;
- independent KiCad/CAD/output validation;
- supplier/component services where useful.

AI/MCP must remain subordinate to engineering truth and explicit approval policy.

## Reference-product journey

The bounded V1 reference product in the product constitution remains the end-to-end proof target.

The roadmap should eventually demonstrate:

```text
requirements
→ architecture
→ components
→ schematic
→ PCB
→ mechanical context
→ firmware
→ validation
→ version/output preflight
→ reviewed release
```

Every stage must preserve object identity and expose unresolved facts instead of inventing them.

## Roadmap exit philosophy

Hardware Studio does not “finish” by reaching U9. U9 closes the current Studio-convergence program. Professional readiness depends on the engineering recovery acceptance criteria and end-to-end evidence.

The product should only claim mature capability when:

- the engine is real;
- UI uses the real engine;
- state is durable;
- change history/impact is correct;
- missing data is not fabricated;
- tests exercise production behavior;
- independent verification exists where the claim requires it;
- release evidence reflects exact source state.

The immediate priority remains a truthful, deeply connected engineering foundation—not maximum feature count.
