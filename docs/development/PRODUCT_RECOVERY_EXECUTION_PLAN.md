# Hardware Studio — Product Recovery and End-to-End Execution Plan

**Plan reconciliation:** 2026-09-02  
**Current master:** `79902f6fceb0087e7f446960e9c8059841ba4daa`  
**Status:** authoritative deep-engineering recovery plan  
**Parallel Studio plan:** `STUDIO_UX_CONVERGENCE_EXECUTION_PLAN.md`  
**Live phase ledger:** `STUDIO_PHASE_EXECUTION_STATUS.md`

This plan governs the deep engineering recovery of Hardware Studio. It is intentionally separate from the U0–U9 Studio convergence program.

> **Studio convergence makes the product coherent. Engineering recovery makes the product trustworthy. Neither can replace the other.**

## 1. Product definition

Hardware Studio should become a connected engineering environment for moving from product intent to a reviewed physical-product release.

The bounded V1 goal is not to instantly replace Fusion, KiCad, Altium, Onshape, PlatformIO, PLM, QMS and manufacturing systems. The credible V1 goal is a truthful connected workflow for a small embedded product that can:

1. define requirements and architecture;
2. create/qualify reusable components and project instances;
3. create authoritative electrical connectivity;
4. create and validate a board without cross-board leakage;
5. create constrained Mechanical design and exact physical context;
6. map firmware to exact hardware and execute reproducible builds/device operations;
7. execute validation with durable evidence/retest lineage;
8. create immutable versions, branches, comparisons, candidates and releases;
9. generate qualified drawings/manufacturing/output artifacts tied to exact source versions;
10. expose safe semantic operations through MCP/AI without bypassing commands, review, policy or audit.

The reference product and exact V1 scope remain defined by `docs/product/V1_PRODUCT_CONSTITUTION.md`.

## 2. Current recovery position

The repository has advanced significantly since the original audit, especially in Studio structure.

### Structurally landed

- U0 architecture/navigation lock;
- U1 shared shell foundation and clean routes;
- U2 evidence-driven Project Home;
- U3 Electronics convergence;
- U4 PCB convergence;
- U5 Mechanical convergence;
- U6 Firmware convergence;
- U7 Validation convergence.

### Active

- **U8 Release convergence**.

### Still not professionally complete

The core recovery findings remain valid at the engineering layer:

- schema/domain ownership is still too broad/legacy-heavy;
- durable repository/event architecture is incomplete;
- typed command coverage is incomplete;
- the canonical product graph is not complete;
- PCB/CAD/Firmware/Validation/Release/output engines are below professional depth;
- MCP/backend/interoperability remain partial;
- generated output is not comprehensively independently qualified.

The recovery program should therefore continue as a controlled evolution around retained useful code, not a cosmetic rewrite and not a second parallel architecture.

## 3. Recovery principles

### 3.1 Truth before appearance

Do not label a domain complete, verified, qualified, release-ready or fabrication-ready unless the corresponding production behavior/evidence supports that exact claim.

### 3.2 Unknown stays unresolved

Do not substitute guessed:

- board dimensions/identity;
- placements;
- package dimensions;
- geometry;
- evidence;
- tool versions;
- reviewer identity;
- qualification;
- release hashes.

### 3.3 One canonical engineering model

A workbench may have UI/session state, but must not create a private copy of canonical project objects to make its workflow easier.

### 3.4 One governed mutation path

UI, MCP and future backend operations should converge on typed command/repository semantics with validation, impact, audit and reversibility where appropriate.

### 3.5 Derived output never outranks its source

A derived visualization/check/report/package can only be as authoritative as:

- its source data;
- algorithm/tool authority;
- provenance;
- qualification/review.

### 3.6 Structural UX completion does not close engineering issues

Examples:

- U5 does not close #16/#17;
- U6 does not close #18;
- U7 does not close #19;
- U8 will not close #20/#21.

## 4. Recovery architecture target

```text
Shared Studio Shell / MCP / APIs
        ↓
Typed domain commands and proposals
        ↓
Transactional durable repository + events
        ↓
Canonical product graph / domain packages
        ↓
Domain engines and external adapters
        ↓
Derived analysis / evidence / outputs
        ↓
Versions / candidates / review / release
```

No layer should bypass the ones beneath it with hidden local state or a parallel persistence path.

## 5. Foundation recovery — #5–#12

### #5 — Constitution, reference, status and completion rules

Purpose:

- define bounded product scope;
- normalize truth language;
- preserve reference-tool research without confusing aspiration with implementation;
- establish evidence-based completion rules.

Current state:

- strong foundation exists;
- documentation must continue to be synchronized after phase/domain changes.

### #6 — Canonical schema, IDs, units, ownership and migrations

Target:

- stable typed identity families;
- explicit units and coordinate systems;
- normalized board/component/net/mechanical/firmware/validation/release ownership;
- runtime validation;
- deterministic migration diagnostics;
- removal of ambiguous legacy duplicate representations.

Completion requires more than cleaning individual fallback IDs.

### #7 / #38 — Durable repository and project storage

Target:

- repository abstraction shared by browser/Node/MCP/jobs;
- transactional writes;
- durable project/workspace identity;
- atomic save/recovery;
- corruption/read-only recovery;
- backup/export/import;
- artifact/blob handling;
- conflict/revision checks;
- eventual local/cloud parity without sacrificing local-first ownership.

Browser-local storage is not the final cross-process repository architecture.

### #8 / #39 — Typed commands, transactions, invalidation and undo/redo

Target:

- typed mutation registry;
- exact before/after/reversible semantics;
- pointer begin → preview → commit-once lifecycle;
- deterministic undo/redo;
- affected-object/domain IDs;
- validation before commit;
- dependency invalidation;
- audit/event records.

### #9 — Shell, routing, recovery and performance

U1 solved major interaction-structure problems, but #9 still covers deeper platform quality:

- route/layout durability;
- error boundaries/recovery;
- storage health;
- autosave/repository status;
- performance profiling;
- crash/reload behavior;
- accessibility and browser robustness foundations.

### #10 — Test architecture and CI quality gates

Current root CI is meaningful:

- workflow hygiene;
- lint;
- typecheck;
- full configured Vitest suite;
- production build.

Future completion also requires selected browser E2E, durability/recovery, adapter/interchange, accessibility/visual/performance and domain-independent verification as specified by issues.

### #11 / #42 — Legacy cleanup, monolith decomposition and package boundaries

Target:

- remove retired duplicate engines/surfaces as authoritative replacements land;
- reduce monolithic store/component ownership;
- separate domain packages/services;
- keep source reviewable and ordinary—no encoded workflow source transport.

### #12 — Canonical product graph and impact engine

Target:

- typed relationships;
- indexed traversal;
- integrity constraints;
- domain events;
- deterministic affected-entity calculation;
- dependency-specific stale propagation;
- traceability from requirement through implementation/evidence/release.

## 6. Components and sourcing — #13

Target capabilities:

- reusable versioned component definitions;
- normalized manufacturer/supplier identity;
- typed electrical pins;
- symbol/footprint/pad/package/3D representations;
- representation provenance/qualification;
- alternatives and lifecycle/sourcing risk;
- transactional project-instance creation;
- downstream change impact.

Current Electronics identity foundations are useful, but do not satisfy the complete component lifecycle model.

## 7. Schematic — #14

Target:

- authoritative connectivity graph;
- robust pin/electrical types;
- structured anchors;
- wires/junctions/labels/no-connect semantics;
- hierarchy/buses/ports as scoped;
- annotation/replacement impact;
- ERC based on canonical connectivity;
- save/reload/undo correctness;
- qualified KiCad/interchange checks through #26.

Current structured pin anchors are a foundation, not completion.

## 8. PCB — #15

Studio U4 provides a coherent PCB workbench. #15 remains the engineering authority.

Target:

- strict explicit board identity;
- authoritative outline/stack/layers;
- footprints/pads/placements;
- route sessions with structured source/target anchors;
- traces/vias/layer transitions;
- connectivity graph and ratsnest;
- zones/keepouts;
- physical/electrical constraints;
- comprehensive DRC for declared capability;
- no cross-board leakage;
- selected-board outputs from canonical geometry/topology;
- independent KiCad/CAM verification.

No demonstration auto-place/autoroute algorithm should be presented as professional routing authority.

## 9. Mechanical sketch/drawings — #16

Studio U5 provides coherent 2D/3D/assembly representations. #16 remains the 2D/constraint authority.

Target:

- canonical sketch topology;
- lines/arcs/circles/splines/polygons and construction geometry;
- trim/extend/offset/fillet/chamfer as scoped;
- dimensions/tolerances;
- persistent geometric constraints;
- solver/conflict explanation;
- profile detection;
- typed parameters/expressions;
- drawing object foundations;
- exact undo/reload/regeneration semantics.

## 10. CAD kernel, features and assemblies — #17

Target:

- reviewed geometry-kernel adapter;
- exact B-Rep solids/topology;
- sketch-to-feature workflow;
- parametric feature history/regeneration;
- part/body identity;
- assemblies/mates;
- exact interference/clearance;
- mass/properties as scoped;
- qualified STEP/STL exchange;
- drawing views generated from exact model state.

Three.js remains visualization, not CAD authority.

## 11. Firmware and physical devices — #18

Studio U6 established a strong interaction grammar, but current evidence may still be externally recorded metadata.

Target:

- filesystem-backed source workspace;
- project/environment configuration;
- generated vs user-authored file lifecycle;
- hardware mapping;
- reproducible PlatformIO build jobs;
- exact build artifacts/logs/checksums/tool versions;
- port/device discovery;
- upload with scoped approval;
- serial monitor;
- cancellation/recovery;
- version/source/environment/device-bound durable evidence.

No UI state or manual evidence entry may impersonate an executed build/device operation.

## 12. Validation and evidence — #19

Studio U7 established one Define → Execute → Review workflow and explicit test/run selection.

Current local execution authority remains bounded:

- DRC = implemented local rules;
- firmware-state = structural checks;
- Mechanical = approximate AABB screen;
- Thermal = no internal solver;
- manual/physical = explicit engineer verdict.

Target #19 capabilities:

- immutable/versioned procedure definitions;
- durable execution jobs;
- DUT/sample/operator/environment binding;
- equipment/calibration records and policy;
- typed units/tolerances/uncertainty/statistics;
- durable evidence blobs + hashes;
- immutable run snapshots;
- reviewer roles/signoff;
- deviations/waivers;
- retest lineage/comparison;
- deterministic stale propagation;
- release-grade accepted-evidence policy.

## 13. Versions, branches and releases — #20

**Current Studio phase U8 is structurally converging this domain.**

U8 must not lower #20's engineering bar.

Target:

### Workspace

Editable state with branch/base-version identity, repository revision, dirty/conflict state and governed history.

### Version

Immutable named content tree/snapshot with parent(s), author, time, message, schema/tool versions and content hashes.

### Branch

Named editable lineage from an explicit base, with archive/protection/review policy.

### Comparison

Domain-aware deltas for requirements, graph, electrical topology, PCB, Mechanical, firmware, validation and outputs.

### Merge

True base/source/target three-way merge with typed conflicts, explicit resolution, validation, abort/retry and provenance.

### Freeze

Repository/command enforced—not only disabled UI controls.

### Release candidate

Immutable candidate referencing exact versions, checks/evidence and artifact hashes.

### Approval

Trusted actor/role/scope/decision bound to exact candidate/payload hash.

### Release

Immutable manifest/artifact set; changes happen by supersession/withdrawal/new release, never silent mutation.

## 14. Drawings, manufacturing and qualified outputs — #21

Current generated output remains draft/unqualified unless stronger evidence exists.

Target:

### Mechanical drawings

- exact model-derived orthographic/section/detail/assembly views;
- controlled scale/projection;
- dimensions/tolerances/datums/GD&T foundations as scoped;
- title/revision/approval metadata;
- stale tracking from exact model dependencies.

### PCB/manufacturing outputs

- authoritative Gerber/Excellon or declared fabrication format;
- BOM/CPL/netlist/assembly/paste/drill outputs;
- exact board/version/units/origin/tool/checksum manifest;
- independent parser/viewer/KiCad/CAM comparison.

### Firmware/validation reports

- exact build artifacts/config/dependency/toolchain manifests;
- validation reports referencing immutable accepted run/evidence records.

### Package system

- recipe definitions;
- deterministic isolated generation jobs;
- progress/cancellation/logs;
- preflight blockers/warnings/waivers;
- preview/download with exact source and hash;
- trusted review bound to exact manifest;
- content-addressed storage and #20 integration.

Generator success is never qualification.

## 15. Safe external operation and platform — #22–#26

### #22 — MCP live repository integration

Read/draft/apply/undo/high-impact operations over the same canonical repository/command layer as the UI, with proposal/approval/audit policy.

### #23 — Backend/auth/teams/permissions/storage/collaboration

Add only after repository/domain ownership is sufficiently stable. Cloud collaboration must not become a second canonical data model.

### #24 — Graph-grounded AI copilot

AI should explain, plan, propose and review over real graph state. It must not fabricate engineering facts or bypass approval/evidence gates.

### #25 — Analysis/simulation workbench

Power/thermal/tolerance/electrical/simulation capabilities should use declared qualified engines/adapters and explicit authority boundaries.

### #26 — Interoperability

Qualified round trips/import/export for KiCad, CAD formats, firmware, BOM/manufacturing and other external tools. Independent opening/parsing/comparison is part of completion.

## 16. Reference-product acceptance — #27

#27 is the closing evidence gate for parent epic #4.

The reference product must demonstrate:

```text
requirements / architecture
→ qualified components
→ schematic
→ PCB
→ exact Mechanical context
→ firmware build/device workflow
→ validation evidence
→ version / output preflight
→ immutable reviewed release
```

Acceptance requires:

- clean-environment repeatability;
- save/reload/recovery;
- canonical identity;
- reversible governed mutations;
- independent tool/parser checks;
- real physical-device operations where specified;
- durable accepted evidence;
- exact content-addressed artifacts;
- immutable release manifest and trusted approval.

This is not a visual demo milestone.

## 17. Current execution priority

### Studio track

1. finish U8 Release structural convergence;
2. document/verify U8 without closing #20/#21;
3. execute U9 final polish only after structure is stable.

### Engineering track

In parallel, prioritize architecture dependencies and the deepest blockers to the reference path:

1. #6 schema;
2. #7/#38 repository;
3. #8/#39 commands/events;
4. #10 verification architecture;
5. #11/#42 decomposition/cleanup;
6. #12 graph;
7. #15–#21 domain depth according to dependency readiness;
8. #22–#26 platform/integration consuming the canonical foundations;
9. #27 final reference-product qualification.

Do not block every domain improvement on a theoretical perfect foundation, but do not solve missing foundations by creating another private architecture.

## 18. PR and completion discipline

Every meaningful recovery slice should:

1. have a bounded primary issue/scope;
2. preserve canonical ownership;
3. remove contradictory old paths where safe;
4. include migration/backward-compatibility thinking;
5. include focused behavioral tests;
6. run exact-head lint/typecheck/full tests/build;
7. inspect exact-head deployment status;
8. distinguish external hosting capacity from application failures;
9. keep broad parent issues open when criteria remain;
10. update current-status/domain documentation after merge.

## 19. Final recovery principle

Hardware Studio should become **more truthful as it becomes more capable**.

The recovery program fails if the product looks unified but hides uncertain engineering state. It also fails if deep engines exist behind fragmented workflows no one can reason about.

The goal is one connected system in which identity, engineering authority, provenance, review and release strength increase together.
