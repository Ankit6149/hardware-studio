# U6 Firmware Convergence Notes

**Reconciled:** 2026-09-02  
**Structural phase:** complete  
**Current Studio phase:** U8 — Release convergence  
**Engineering authority still open:** #18

This file records the bounded Firmware UX decisions that remain part of the accepted Studio baseline. U6 made Firmware structurally coherent; it did not turn the browser workspace into a complete production firmware IDE/device-execution system.

## Merged evidence

- PR #113 — U6.1 Firmware convergence
- completed child issue: #112
- merge commit: `ab4312f0f929103fc7baf3f2b52a80610639e72f`
- verified final PR head: `646e70a581dc524ac8a8bfcd2899fe488a6dfdae`

Exact-head repository gate at the time:

- lint: pass;
- typecheck: pass;
- tests: 332/332;
- production build: pass.

Vercel returned an external Hobby-plan build-rate-limit status for that head. That was recorded as hosting capacity, not an application production-build failure and not a successful deployment.

## Landed Firmware shell contract

Firmware now follows the shared Studio grammar.

### Project Drawer

Owns contextual Firmware structure such as:

- Modules;
- Files;
- Map;
- Environment.

The drawer replaces the earlier stack of shell drawer + internal module sidebar + private Source Explorer.

### Center work surface

Owns the active Firmware representation/job:

- module responsibility/authoring;
- Behavior/state machine;
- Hardware Map;
- Source.

### Inspector

Owns context for an explicitly selected module/file rather than acting as another navigation system.

### Bottom dock

Owns:

- Problems;
- Build Evidence;
- Device Evidence.

New real build/device/serial functionality should enter this grammar instead of creating another center-page mini-app.

### UI state ownership

Representation, drawer section, selected module/file, Inspector and dock state belong in `firmwareWorkspaceUiStore` or equivalent UI/session state.

Canonical firmware modules/files/mappings/evidence remain project engineering state.

## Explicit-selection rules

U6 established and regression-protected these rules:

- opening Firmware does not silently select the first module;
- opening Source does not silently select the first file;
- regenerating starter scaffolding does not silently select a generated file;
- creating a module/file may select the item the user explicitly created;
- Device Evidence does not silently choose the first successful build;
- selection is UI context, not a hidden mutation of engineering records.

These rules should extend to future environment/build/device/port selection.

## Source truth boundary

Current source records are browser project records, not a complete filesystem-backed IDE workspace.

Rules:

- opening Source does not generate files;
- generated workspace/source is scaffolding;
- generated files are labelled as not verification;
- dirty/saved state describes the browser project record unless real filesystem persistence exists;
- a browser “save” must not be described as an atomic filesystem write;
- real filesystem synchronization remains #18.

## Build evidence boundary

Current Build Evidence can record externally produced build metadata/logs.

It must not imply:

- Hardware Studio invoked the compiler;
- the exact source tree was built locally;
- the toolchain/environment is fully reproduced;
- the artifact is content-addressed/version-bound;
- the build passed an independent release policy.

Those claims require #18 and later #20/#21 integration.

## Device evidence boundary

Current Device Evidence can record externally observed device behavior.

It must not imply Hardware Studio:

- flashed the device;
- selected/verified the physical target;
- queried the device;
- streamed serial output;
- preserved complete operation logs;
- bound evidence to exact firmware artifact/device/version.

Those claims require real bridge/device execution and provenance.

## State-machine authority

The current Firmware state-machine validator is useful structural analysis.

A successful structural scan does **not** prove:

- compilation;
- timing correctness;
- peripheral configuration;
- runtime behavior;
- hardware behavior;
- safety behavior;
- communication correctness.

Validation/Release must not upgrade state-machine structural evidence into stronger firmware verification.

## Preserved useful behavior

U6 intentionally retained useful production foundations:

- canonical `FirmwareModule` records;
- state/transition records;
- state-machine canvas and pointer transactions;
- hardware mapping to canonical component/pin/net IDs;
- source-file records/editing;
- firmware evidence evaluator and blockers;
- generated-scaffolding distinction;
- build/device evidence records and their links into downstream validation context.

The convergence goal was to organize these behaviors, not replace them with another model.

## #18 remains the engineering authority

U6 does **not** satisfy #18.

Still required includes:

### Filesystem workspace

- real workspace tree;
- repository/workspace root ownership;
- atomic writes/backups;
- path traversal/symlink/origin hardening;
- reliable create/rename/delete/recovery;
- editor/search/language-service integration as scoped.

### PlatformIO/build

- authoritative `platformio.ini` project/environment model;
- build/clean jobs;
- exact command/environment/tool versions;
- streaming logs;
- progress/state;
- timeout/cancellation/recovery;
- durable records;
- artifact checksums/content identity.

### Device/upload

- device/port discovery;
- explicit target selection;
- exact-payload approval;
- upload/erase where declared;
- operation lifecycle;
- safe failure/recovery;
- durable source/build/device binding.

### Serial

- real monitor;
- reconnect/capture;
- cancellation;
- log/evidence capture;
- exact device/session provenance.

### End-to-end evidence

A reference workflow should prove:

```text
exact source/environment
→ real build
→ exact artifact
→ approved device operation
→ serial/runtime evidence
→ linked validation run
```

## Handoff into current U8 Release phase

U7 Validation has now landed structurally. U8 Release is active.

Release must consume Firmware evidence conservatively:

- recorded external Build Evidence is not automatically an executed/reproducible build;
- recorded Device Evidence is not automatically trusted flash/runtime proof;
- generated source is not verification;
- source/environment/build/device provenance gaps remain release blockers where policy requires them;
- #18 must stay open.

Future #20/#21 release/output work should eventually bind firmware artifacts to exact source/environment/toolchain/version/checksums rather than copying mutable evidence text.

## Non-negotiable regression rules

Do not improve Firmware by:

- reintroducing an internal project tree alongside the Project Drawer;
- auto-selecting the first module/file/build/device;
- adding another execution/evidence mini-app;
- calling recorded metadata an executed operation;
- calling browser-record save a real filesystem sync;
- calling generated scaffolding verified implementation;
- closing #18 because U6 looks coherent.

U6 is structurally complete. Firmware engineering completion remains governed by #18 and the reference-product release path.
