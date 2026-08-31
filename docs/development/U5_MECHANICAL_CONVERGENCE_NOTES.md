# U5 Mechanical convergence notes

This file records the bounded Mechanical UX/convergence decisions while the broader Mechanical engineering issues remain open.

## Current status

**U5.1 is complete and merged via PR #107.**  
Merged commit: `e1bc7f457329c2c0837b425ca4b862f916e566fe`  
Completed issue: #106  
Engineering parents that intentionally remain open: #16 and #17.

The exact U5.1 PR head passed:

- lint;
- TypeScript typecheck;
- 321/321 tests;
- production build.

The Vercel status on the PR head was still the known Hobby-plan build-rate-limit status and was recorded separately from code correctness.

## U5.1 shell contract now implemented

- Mechanical uses the shared Studio shell and one Project Drawer.
- The old internal Mechanical `Design Browser` is removed rather than hidden.
- Drawer owns canonical **Features**, **Dimensions**, and **Assembly** context.
- Center remains the authoritative Mechanical viewport/work surface.
- Right Inspector edits the selected canonical `mechanical-object` only.
- Bottom dock owns Mechanical findings.
- Panel state remains UI/session state in `mechanicalWorkspaceUiStore`, outside the canonical project model.
- Drawer, viewport, and Inspector share selection through `studioContextStore`.

## U5.1 truthfulness rules now protected

- Opening Mechanical never auto-selects the first object.
- New geometry never receives fabricated starter dimensions.
- Feature creation requires explicit valid position and shape dimensions before project mutation.
- Tolerances are unresolved until explicitly entered.
- Assembly rows do not invent material or fastening method.
- PCB envelopes are synchronized only from explicit board/outline context.
- The current Three.js representation is treated as a visualization/coordination renderer over explicit evidence, not as a CAD kernel.
- U5.1 does not claim parametric constraints, exact B-Rep solids, qualified interference, or manufacturing-grade STEP/STL output.

## Current Mechanical representation boundary

The repository currently has two different levels of Mechanical capability and they must not be conflated:

1. **Authoring/layout evidence** — canonical `mechanicalObjects`, dimensions, assembly layers, explicit board references, pointer transactions, and validation findings.
2. **3D visualization/coordination** — `UnifiedBoard3DView` renders explicit board/package/mechanical dimensions when available and leaves missing geometry unresolved.

This 3D view is useful and should be integrated into the Mechanical workbench, but it is **not** the modeling source of truth. Issue #17 remains the authority for a real CAD kernel, exact topology, feature history, assemblies/mates, exact interference, and STEP exchange.

## U5.2 next slice

U5.2 should converge **2D / 3D / Assembly as representations inside one Mechanical workbench** rather than separate application-like destinations.

Target behavior:

- one Mechanical Project Drawer remains visible/authoritative across representations where relevant;
- representation switching is contextual inside Mechanical, not another global navigation layer;
- selected Mechanical/PCB/package identity is preserved when switching 2D ↔ 3D where the canonical identity supports it;
- the 3D surface clearly labels itself as evidence-backed visualization until #17 lands;
- no guessed board/package/mechanical geometry is introduced for visual convenience;
- Assembly stays connected to the same physical product context;
- old `requestedMechanicalMode` compatibility remains only as long as required for legacy/deep-link migration.

## Deeper U5 work after representation convergence

U5.3+ must continue through #16/#17 and related Mechanical issues for:

- canonical sketch documents and stable topology;
- persistent geometric/dimensional constraints;
- solver status and conflict explanation;
- closed-profile detection;
- real feature history;
- reviewed CAD-kernel adapter architecture;
- exact solids/B-Rep topology and deterministic tessellation;
- assembly instances/mates and exact interference/clearance;
- ECAD/MCAD change review;
- qualified STEP/STL/drawing outputs.

## Non-negotiable rule

Do not close #16 after adding more shape/dimension UI, and do not close #17 after improving Three.js. Those issues close only when their stated engineering acceptance criteria are genuinely satisfied.
