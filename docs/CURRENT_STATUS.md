# Hardware Studio — Current Status

**Last reconciled:** 2026-09-02  
**Master at reconciliation:** `79902f6fceb0087e7f446960e9c8059841ba4daa`  
**Product-scope authority:** `docs/product/V1_PRODUCT_CONSTITUTION.md`  
**Studio execution authority:** `docs/development/STUDIO_PHASE_EXECUTION_STATUS.md`  
**Engineering recovery authority:** `docs/development/PRODUCT_RECOVERY_EXECUTION_PLAN.md`  
**Stage:** active product recovery and engineering development  
**Stable release:** None

> This is the primary implementation-status document. Older audits and research documents may describe historical states or target designs; they do not override this file, the current phase ledger, or the live GitHub issue acceptance criteria.

## Executive summary

Hardware Studio is a serious engineering prototype with a large connected-product vision and a materially improved Studio structure. It is **not** yet a professionally qualified ECAD/CAD/firmware/validation/release system.

The most important current distinction is:

- **Studio structural convergence has progressed quickly.** U0 through U7 are landed.
- **Deep engineering completion is still incomplete.** Schema/repository/command/graph work and domain-engine issues remain open.
- **U8 Release convergence is active.** It must organize current readiness/revision/output/package foundations without presenting them as immutable versions or qualified release artifacts.

The current product should be evaluated as:

- a connected engineering-workspace prototype;
- an active recovery project focused on truthful state and canonical identity;
- a platform for deepening real engineering engines incrementally;
- a local-first architecture experiment with MCP and local-machine integration foundations.

It should **not** be evaluated as:

- a fabrication-ready PCB system;
- a production parametric CAD system;
- a trusted firmware build/flash environment;
- a regulated validation/QMS platform;
- a complete PLM/version-control/release system;
- a qualified manufacturing package generator;
- a production-ready AI/MCP engineering authority.

## Current Studio phase state

| Phase | State | What that means |
| --- | --- | --- |
| U0 — Architecture lock | Landed | One Studio mental model/freeze direction established. |
| U1 — Shared shell | Foundation landed | Workbench tabs, contextual drawer host, shared Inspector/bottom dock/status grammar and clean routing exist. |
| U2 — Project Home | Landed | Next action/lifecycle/attention use real domain evidence rather than count-only completion. |
| U3 — Electronics | Structurally converged | Shared identity and connected Electronics workflow grammar established. |
| U4 — PCB | Structurally converged | One PCB drawer/Inspector/Problems grammar and explicit board context established. |
| U5 — Mechanical | Structurally converged | One workbench with 2D Layout / 3D Review / Assembly representations. |
| U6 — Firmware | Structurally converged | One Firmware drawer, explicit module/file selection, shared Inspector/dock and evidence truth labels. |
| U7 — Validation | Structurally converged | One Validation drawer and explicit Define → Execute → Review flow; no first-test/run fallback. |
| **U8 — Release** | **Active** | Converge readiness/revisions/outputs/drawings/factory-package control surfaces while preserving #20/#21 truth boundaries. |
| U9 — Final polish | Deferred | Visual hierarchy/accessibility/responsiveness/motion/performance pass after structure stabilizes. |

### Latest structural slice evidence

U7.1 merged through PR #116:

- merged master commit: `754fbabff639cddeeb4e68c6b2d2d547665d4571`;
- exact verified PR head: `643757f7f942702bbef4408e1edca621b1bf6ac3`;
- lint: pass;
- typecheck: pass;
- tests: **339/339 across 89 test files**;
- production build: pass;
- Vercel deployment status: pass.

PR #117 then documented the U7 handoff and activated U8; current master is `79902f6...`.

These results prove the bounded U7 slice met its repository gate. They do not close #19 or certify the whole application.

## Current interaction architecture

The Studio now follows one primary grammar:

```text
TopBar
→ workbench tabs
→ contextual Project Drawer
→ central work surface
→ shared selection-aware Inspector
→ shared bottom Problems / jobs / evidence / logs dock
→ status bar
```

### Clean routes

Top-level workbench paths include:

```text
/studio
/studio/requirements
/studio/architecture
/studio/components
/studio/schematic
/studio/pcb
/studio/mechanical
/studio/firmware
/studio/validate
/studio/release
```

Legacy hash aliases are compatibility only. New Studio work must not reintroduce hash-based routing.

### Explicit selection

A major convergence rule is now established: passive navigation should not silently choose the first available canonical record. This has been enforced in the newer PCB/Firmware/Validation work.

## Domain status

### 1. Public landing page — **Approved surface / maintenance only**

Current reality:

- product identity and high-level workbench story exist;
- section navigation no longer needs URL hash mutation;
- public landing is intentionally separate from Studio shell recovery.

Boundary:

- do not redesign the landing page as part of workbench convergence;
- public wording must stay aligned with current safety/status claims.

### 2. Project Home / requirements / architecture — **Foundation / partial engineering depth**

Current strengths:

- evidence-driven Project Home model;
- explicit next action and attention queue;
- requirements and architecture authoring foundations;
- links into downstream domains;
- product-level lifecycle framing.

Important limitations:

- durable recent engineering-change history is not yet backed by a mature repository/event log;
- requirement/interface governance and impact analysis remain incomplete;
- canonical graph/schema work is still active.

### 3. Canonical schema / project model — **Partial**

Current reality:

- many domains share the project model;
- cross-domain identity has been tightened in multiple slices;
- deterministic migrations have improved;
- legacy/new representations still coexist;
- broad optional/monolithic state remains.

Open authorities include #6, #11/#42 and #12.

Do not treat the existing `Project` type as the final canonical graph.

### 4. Persistence / durable repository — **Foundation / incomplete**

Current reality:

- browser project persistence and serialization foundations exist;
- project migration/round-trip tests exist;
- the long-term transactional shared repository for browser, MCP, bridge and release jobs is not complete.

Open authorities include #7/#38 and related backend work.

### 5. Commands / undo / transactions — **Partial**

Current strengths:

- command/history foundations exist;
- several pointer interactions use cleaner begin/preview/commit semantics;
- mechanical/firmware transaction tests improved.

Limitations:

- not every engineering mutation passes through one typed durable command boundary;
- audit/event/revert semantics are not complete;
- UI/session state still needs continuing separation from engineering mutation state.

Open authorities include #8/#39.

### 6. Components / schematic / Electronics — **Structural convergence; partial engineering depth**

Current strengths:

- canonical component identity is shared across key Electronics views;
- structured schematic pin anchors and net foundations exist;
- Electronics context/representation work is substantially converged;
- DRC/BOM workflow guidance derives from real current state.

Limitations:

- complete topology/ERC semantics remain incomplete;
- representation qualification/provenance remains incomplete;
- professional interchange/verification is not complete.

### 7. PCB — **Structural convergence; #15 engineering issue open**

Current strengths:

- explicit board context;
- one PCB Project Drawer;
- shared Inspector and DRC Problems dock;
- routing/placement/DRC foundations;
- selected-board and identity tests;
- no new fake auto-place/autoroute claims in convergence work.

Limitations:

- routing/connectivity graph is not yet professional ECAD authority;
- rule coverage is incomplete;
- stackup/layer/zone/topology depth remains incomplete;
- output qualification is not fabrication-grade;
- multi-board guarantees require continued engineering hardening.

Issue #15 remains open.

### 8. Mechanical — **Structural convergence; #16/#17 open**

Current strengths:

- one Mechanical Project Drawer/workbench;
- explicit physical inputs;
- 2D Layout / 3D Review / Assembly representations;
- shared selection and Inspector/dock grammar;
- board/mechanical synchronization foundations;
- approximate collision/clearance review foundations.

Limitations:

- no production sketch constraint solver comparable to mature CAD;
- no qualified CAD-kernel feature/history system;
- 3D review is visualization, not exact CAD authority;
- exact assemblies/mates/interference/clearance remain incomplete;
- missing package/geometry data must remain unresolved.

Issues #16 and #17 remain open.

### 9. Firmware — **Structural convergence; #18 open**

Current strengths:

- one Firmware Project Drawer;
- explicit module/file selection;
- no silent first-file/module fallback in the converged flow;
- module/behavior/hardware-map/source representations;
- shared Inspector;
- bottom Problems / Build Evidence / Device Evidence grammar;
- generated source clearly distinguished from verification;
- evidence evaluator can distinguish source/mapping/build/device readiness.

Limitations:

- browser project source records are not a finished real filesystem workspace;
- recorded build/device evidence can be external metadata rather than executed proof;
- hardened PlatformIO build/upload lifecycle is incomplete;
- serial monitor, cancellation/recovery and durable operation history are incomplete;
- device/port/environment binding needs deeper safety integration.

Issue #18 remains open.

### 10. Validation — **Structural convergence; #19 open**

U7 landed a major interaction cleanup:

- one Validation Project Drawer: Tests / Coverage / Factory QA / Runs;
- explicit test and run selection;
- separate **Define / Execute / Review** user jobs;
- Define owns procedure, expected/tolerance schema, links, pass criteria and editable definition references;
- Define no longer presents actual observations or step-completion state as specification truth;
- Execute owns observation, evidence reference, reviewer/verdict and new run/retest creation;
- Review owns read-only historical run snapshot/history;
- run output/logs use the shared bottom dock;
- old floating run/evidence and test-list overlays were retired.

Current execution authority is deliberately limited:

- DRC automation = implemented local rules only;
- firmware state-machine automation = structural checks only;
- Mechanical = approximate AABB screen; clean screen does not auto-pass exact clearance;
- Thermal = no internal solver; external evidence + reviewer required;
- other manual/physical tests = explicit engineer verdict required;
- retests append a new run and preserve prior history.

Remaining #19 engineering work:

- durable hashed evidence/blob storage;
- exact product version/procedure/DUT/sample binding;
- operator/environment/equipment/calibration metadata and policy;
- typed measurement units/uncertainty/statistics depth;
- durable execution jobs with pause/resume/cancel/recovery;
- trusted immutable reviewer/sign-off records;
- waivers/deviations;
- retest lineage/comparison;
- deterministic stale propagation;
- release-grade accepted-evidence policy.

### 11. Release / revisions / outputs — **U8 active; #20/#21 open**

Current foundations include:

- readiness evaluation;
- revision/snapshot helpers and UI;
- output/export surfaces;
- blueprint/drawing foundations;
- factory-package/manufacturing draft surfaces;
- release helper concepts.

These foundations are **not yet equivalent to professional release infrastructure**.

Issue #20 remains open for:

- immutable content-addressed versions;
- explicit editable workspace/base-version identity;
- branch ancestry/protection;
- domain-aware comparisons;
- true three-way merge/conflict handling;
- repository-enforced freeze;
- exact candidate/artifact hashes;
- role-aware approvals bound to exact candidate payload;
- immutable releases with supersession/withdrawal.

Issue #21 remains open for:

- exact model-derived drawings;
- qualified PCB/manufacturing formats;
- deterministic isolated generation jobs;
- provenance/tool/input/output hashes;
- independent parser/viewer checks;
- preflight/waiver/review policy;
- content-addressed release artifacts.

U8 must keep draft/unqualified output visibly distinct from release evidence.

### 12. Readiness — **Partial**

Current strengths:

- Project Home intentionally avoids count-only readiness;
- Electronics and Firmware evaluators provide more truthful domain state;
- Release-facing readiness helpers exist.

Limitations:

- legacy readiness assumptions remain in parts of the code;
- release readiness cannot become authoritative until #15–#21 evidence and versioning are strong enough;
- current generated artifacts/status values cannot independently prove readiness.

### 13. Blueprints / manufacturing exports — **Draft / unqualified**

Current code can generate/use draft engineering output foundations, but:

- fallback/permissive legacy behavior remains under engineering scrutiny;
- exact canonical source dependency is not complete for every output;
- independent parser/viewer/DFM qualification is incomplete;
- output provenance/hashes/review binding are not release-grade.

Generated output must not be described as fabrication-qualified merely because a generator completed.

### 14. Local bridge — **Foundation / partial**

Current strengths:

- loopback/process/token/approval foundations;
- real PlatformIO process-spawning foundations;
- workspace/security tests.

Limitations:

- full long-running operation lifecycle is incomplete;
- serial monitor/device workflows are incomplete;
- approval binding and durable evidence need deeper integration;
- repository/version linkage is incomplete.

### 15. MCP — **Foundation / partial**

Current strengths:

- official MCP SDK/protocol foundations;
- resource/tool tests;
- security direction and draft/apply concepts.

Limitations:

- complete shared durable repository integration is not finished;
- typed proposal/apply/approval policy is not complete across every domain;
- MCP must not gain authority to invent geometry, evidence, qualification or human approval.

### 16. CI / verification — **Good root gate; incomplete product qualification**

Current canonical root gate covers:

- workflow hygiene;
- dependency install;
- lint;
- typecheck;
- full configured Vitest suite;
- production build.

Recent U7 exact-head evidence shows this gate working well for bounded structural work.

Still incomplete:

- selected full browser E2E journeys;
- automated accessibility/visual regression breadth;
- durability/corruption/recovery scenarios;
- real adapter/interchange qualification;
- independent ECAD/CAD/manufacturing format validation;
- performance/scalability qualification.

## Current highest-priority engineering risks

1. canonical schema/repository/command architecture can still diverge beneath a coherent UI;
2. PCB/Mechanical domain depth remains far below mature ECAD/CAD systems;
3. Firmware evidence can still be recorded metadata rather than executed proof;
4. Validation is structurally coherent but lacks release-grade provenance/execution infrastructure;
5. Release/output foundations could be visually overtrusted unless U8 preserves explicit draft/unqualified boundaries;
6. independent toolchain/interoperability verification remains incomplete.

## Safety status

Hardware Studio is not approved for direct use as the sole engineering authority for:

- fabrication orders;
- production tooling;
- medical devices;
- automotive/aerospace/industrial safety systems;
- mains or high-energy safety systems;
- certified RF products;
- regulated products;
- unattended production firmware flashing;
- certification/regulatory evidence;
- trusted production release approval.

See `SAFETY_AND_LIMITATIONS.md`.

## Completion rule

A domain may only be described as complete when the relevant bounded scope and GitHub issue acceptance criteria are actually met, including the necessary production engine, state ownership, persistence, error/recovery semantics, reversibility, provenance, independent checks, end-to-end workflow evidence, and deployment/CI verification.

A type, helper, screen, generated file, snapshot, status badge, test fixture, passing build, screenshot, agent assertion, or documentation page is not completion evidence by itself.
