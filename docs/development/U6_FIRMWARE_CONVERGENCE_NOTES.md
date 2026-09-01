# U6 Firmware convergence notes

This file records the bounded Firmware UX/convergence decisions while the broader Firmware engineering issue remains open.

## Current status

**U6.1 is complete and merged via PR #113.**  
Merged commit: `ab4312f0f929103fc7baf3f2b52a80610639e72f`  
Completed issue: #112  
Engineering parent that intentionally remains open: #18.

The exact U6.1 PR head `646e70a581dc524ac8a8bfcd2899fe488a6dfdae` passed:

- lint;
- TypeScript typecheck;
- 332/332 tests;
- production build.

Vercel reported the external Hobby-plan build-rate-limit status for that exact head. This was inspected and recorded separately from repository correctness; it was not an application production-build failure.

## U6.1 shell contract now implemented

- Firmware uses one shell-owned Project Drawer instead of stacking drawer + internal module sidebar + source Explorer.
- Drawer owns explicit **Modules / Files / Map / Environment** structure.
- All live Firmware routes mount one `EngineeringFirmwareWorkbench` authority.
- The retired `FirmwareStudio.tsx` duplicate implementation is physically deleted.
- Center owns the active authoring representation: module responsibility, Behavior/state-machine, Hardware Map, or Source.
- Right Inspector is contextual to an explicitly selected module/file.
- Bottom dock owns **Problems / Build Evidence / Device Evidence**.
- Representation, drawer, selected module/file and panel state live only in `firmwareWorkspaceUiStore`; canonical firmware project records remain in the project store.

## Explicit-selection rules now protected

- Opening Firmware does not select the first firmware module.
- Opening Source does not select the first source file.
- Generated workspace regeneration does not silently select a generated file.
- Creating a module/file may select the item that the user explicitly created.
- Device evidence does not silently choose the first successful build; the user must choose the build record explicitly.
- File/module selection is UI context, not a hidden mutation of firmware engineering records.

## Execution and evidence truthfulness

Current U6 surfaces distinguish authoring/evidence from real execution:

- Build Evidence records externally produced build metadata/logs; Hardware Studio does not claim the browser ran the compiler.
- Device Evidence records externally observed device behavior; Hardware Studio does not claim it flashed, queried, or monitored a device.
- Generated source remains scaffolding and is labelled `Generated · not verification`.
- Source files are still browser project records. The UI explicitly states that real filesystem synchronization/build remains #18.
- State-machine Problems use the existing structural validator only. They do not imply compilation, timing, hardware, or runtime verification.

## Preserved useful behavior

U6.1 preserved rather than replaced:

- canonical `FirmwareModule`, state, transition, hardware-link and source-file records;
- state-machine canvas and pointer transactions;
- hardware mapping through canonical component/pin/net IDs;
- firmware evidence evaluator and verification blockers;
- source editing, dirty-state and keyboard-save behavior;
- generated-scaffolding boundary;
- existing build/device evidence history links into Validation.

## #18 remains the engineering authority

U6 structural convergence does **not** satisfy #18. The following still require real engineering implementation:

- filesystem-backed workspace tree and repository boundary;
- Monaco/equivalent language services, search, references, diagnostics and diff;
- authoritative `platformio.ini` environment/project handling;
- real PlatformIO build/clean/upload/erase/device-list operations;
- secure exact-payload approvals for device operations;
- operation queue/state, streaming logs, timeout, cancellation and durable records;
- real serial monitor and reconnect/capture workflow;
- atomic file writes/backups and traversal/symlink/origin hardening;
- content-addressed build artifacts tied to source snapshot/tool versions/product version;
- richer typed hardware mapping and conflict detection;
- end-to-end build → approved flash → serial capture → validation evidence reference-device workflow.

Do not close #18 because the Firmware workbench is now coherent.

## Handoff to U7

U7 begins from issue #114 and must converge Validation around explicit **Define / Execute / Review** jobs.

The Firmware-to-Validation handoff must preserve:

- exact firmware module/component/net links;
- build/device evidence as recorded provenance, never fabricated execution;
- validation evidence generated from device observations without claiming #19-grade durable evidence;
- state-machine automation limited to structural checks only.

## Non-negotiable rule

Do not improve Firmware by reintroducing a second project tree, another execution panel, or hidden first-item selection. New real build/device functionality must enter through the shared Firmware grammar and #18-backed execution boundary.
