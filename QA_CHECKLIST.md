# Hardware Studio — Verification and QA Checklist

**Status sync:** 2026-09-02  
**Purpose:** repository verification and change-review discipline, not product qualification.

A green pull request proves only the checks actually executed for that exact source head. It does **not** certify Hardware Studio, its engineering calculations, generated manufacturing artifacts, or any physical product.

## 1. Exact-head automated merge gate

The canonical CI workflow must verify a clean checkout of the exact PR head/merge ref:

- [ ] repository source-transport/workflow hygiene guard passes;
- [ ] `npm ci` succeeds;
- [ ] `npm run lint` succeeds with no errors;
- [ ] `npm run typecheck` succeeds;
- [ ] `npm test` succeeds for the complete configured suite;
- [ ] `npm run build` succeeds;
- [ ] deployment status is inspected for the exact head.

If a new commit is pushed, previous green results are stale for merge purposes.

### Deployment-status interpretation

- [ ] application/build failure is treated as a code/repository blocker;
- [ ] Vercel plan/build-rate-limit failures are documented as external capacity failures, not application correctness failures;
- [ ] no one claims production deployment succeeded unless the deployment status actually succeeded;
- [ ] production/browser verification is tracked separately when deployment is unavailable.

## 2. PR scope and architecture review

For every production PR:

- [ ] linked issue or PR body defines a bounded user job and acceptance criteria;
- [ ] changed-file scope matches the intended domain;
- [ ] no accidental landing-page redesign is included;
- [ ] no retired source-transport or temporary diagnostic workflow is reintroduced;
- [ ] no second permanent Studio navigation system is introduced;
- [ ] no duplicate Inspector, Problems surface, Project Drawer, or domain mini-app shell is introduced;
- [ ] canonical project data remains separate from UI-only panel/selection state;
- [ ] opening a workbench does not silently select the first available canonical record;
- [ ] clean `/studio/...` routing is preserved;
- [ ] parent engineering issues remain open if the slice only improves structure/UX.

## 3. State, persistence and reversibility

Where the change mutates engineering state:

- [ ] mutation uses the intended project command/store/repository path;
- [ ] before/after state is well defined;
- [ ] undo/redo semantics are tested where applicable;
- [ ] pointer interactions commit once after transient preview rather than polluting history;
- [ ] persistence/migration behavior is understood;
- [ ] cross-domain identity is preserved;
- [ ] affected derived outputs/analyses become stale or blocked when required;
- [ ] missing data remains unresolved rather than receiving guessed authoritative defaults.

## 4. UI behavior

Where relevant, verify:

- [ ] loading state;
- [ ] empty state;
- [ ] explicit-selection state;
- [ ] error state;
- [ ] recovery path;
- [ ] destructive-action confirmation;
- [ ] keyboard/focus behavior;
- [ ] responsive overflow/layout behavior;
- [ ] dock/Inspector open/close behavior is UI-only state;
- [ ] status text does not overstate engineering authority.

## 5. Domain truth checks

### Electronics / PCB

- [ ] active board identity is explicit;
- [ ] other-board objects do not leak into board-scoped operations/exports;
- [ ] component/net identity remains canonical across schematic/PCB/BOM links;
- [ ] DRC/ERC claims are limited to implemented rules;
- [ ] no fake auto-place/autoroute completion is introduced;
- [ ] generated fabrication data remains draft/unqualified unless independent qualification exists.

### Mechanical

- [ ] approximate 2D/3D geometry is not presented as exact CAD-kernel truth;
- [ ] unresolved dimensions/package geometry remain unresolved;
- [ ] visualization is not described as validation authority;
- [ ] exact-clearance claims require exact supporting geometry/evidence;
- [ ] #16/#17 remain open until their engineering acceptance criteria are actually met.

### Firmware

- [ ] generated source is labeled scaffolding, not verification;
- [ ] recorded build/device evidence is not described as locally executed unless the bridge actually ran it;
- [ ] source/module/build/device selection is explicit;
- [ ] no successful build is silently chosen for downstream evidence;
- [ ] #18 remains open until real filesystem/PlatformIO/device/serial workflow is complete.

### Validation

- [ ] Define / Execute / Review responsibilities remain separated;
- [ ] no silent first-test or first-run selection;
- [ ] actual observations do not live in the test-definition schema UI;
- [ ] historical run snapshots are read-only in Review;
- [ ] manual/physical tests cannot Pass from arbitrary text or a measurement alone;
- [ ] Mechanical local screening cannot auto-pass exact clearance;
- [ ] Thermal does not claim an internal solver;
- [ ] retests add new history rather than overwriting prior runs;
- [ ] #19 remains open for durable provenance/evidence/reviewer/execution infrastructure.

### Release / outputs

- [ ] no JSON snapshot is presented as a content-addressed immutable version;
- [ ] no status toggle is presented as trusted approval;
- [ ] no generated filename/ZIP is presented as qualified manufacturing evidence;
- [ ] source version/provenance gaps remain visible;
- [ ] draft/unqualified output is visibly distinct from release evidence;
- [ ] #20 and #21 remain open until their exact version/release/output guarantees exist.

## 6. Test quality

Tests should exercise production behavior rather than reproduce simplified logic.

Reject or improve tests that:

- [ ] manually construct the desired final state and claim the production workflow created it;
- [ ] duplicate production algorithms inside the test;
- [ ] rely only on `toBeDefined()`/non-empty checks for meaningful behavior;
- [ ] treat an empty result as success without a contract that requires emptiness;
- [ ] use copy/disclaimer strings as the only proof of correctness;
- [ ] encode a stale visual implementation instead of a behavioral contract.

Prefer exact fixtures for identity, coordinates, transactions, board isolation, provenance, validation authority, and missing-data blockers.

## 7. Documentation checkpoint

When behavior/status/architecture changes:

- [ ] `docs/CURRENT_STATUS.md` is updated;
- [ ] `docs/development/STUDIO_PHASE_EXECUTION_STATUS.md` is updated for phase work;
- [ ] relevant domain convergence notes are updated;
- [ ] architecture/safety docs are updated if ownership or authority changed;
- [ ] research documents receive a current-status reconciliation if the implementation diverges from an older proposal;
- [ ] PR/commit/test evidence is recorded precisely without implying broader completion.

## 8. Missing qualification layers

The repository still does not provide complete professional qualification for:

- browser end-to-end coverage across the whole product;
- automated accessibility and visual regression coverage across all surfaces;
- repository/backend corruption and multi-project recovery;
- complete bridge/device/serial lifecycle;
- durable validation evidence and trusted sign-off;
- content-addressed version/release infrastructure;
- independent ECAD/CAD parser/tool validation for all claimed formats;
- electrical, mechanical, firmware, safety, regulatory, DFM, manufacturing, or certification approval.

These gaps must remain visible in status and PR language. They cannot be replaced by checked boxes or agent assertions.

## Authoritative status

See [`docs/CURRENT_STATUS.md`](docs/CURRENT_STATUS.md). Historical V1/V5 completion checklists are retained only as historical audit context and must not be used as current qualification evidence.
