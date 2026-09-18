# Hardware Studio — Current Product Baseline

_Last reviewed: 2026-08-15_

This document is the repository's **current-state contract**. It is not a feature wishlist, redesign brief, or replacement for GitHub issues. Its purpose is to stop the product from accumulating contradictory implementations while the underlying engineering workflow is still being unified.

If an issue, mockup, generated implementation, or old test conflicts with this baseline, the baseline wins until it is deliberately revised with evidence.

## 1. What Hardware Studio is today

Hardware Studio is currently a **connected engineering workflow foundation for physical-product development**.

The codebase already contains product requirements, architecture, component definitions and project component instances, schematic connectivity, PCB/board state, mechanical representations, firmware state, validation records, BOM/output workflows, project persistence, and manufacturing-oriented surfaces.

However, the product must **not** yet be described internally or externally as a qualified replacement for professional CAD, ECAD, EDA, firmware IDE, simulation, PLM, or manufacturing-signoff software. Several editors and export paths are still incomplete, partially generated, or not yet backed by enough domain validation to make that claim truthfully.

The near-term objective is not to create more screens. It is to make the existing system behave as **one trustworthy product**.

## 2. Start-anywhere baseline

There is no canonical user path.

The current recovery program still uses bounded vertical slices to prove integration, but those slices are test/implementation strategies rather than required product sequencing.

A Hardware Studio project may legitimately begin with requirements, architecture, components/BOM, schematic/PCB, mechanical geometry, firmware, manufacturing artifacts, validation evidence, or an empty product.

The baseline contract is:

1. adopt only facts the source actually supports;
2. preserve source identity/provenance;
3. keep missing context unresolved;
4. reconcile later artifacts into the same canonical product identity;
5. expose every available workbench without stage gating;
6. block only the qualified operation whose prerequisites are missing;
7. derive next-action guidance from capability/evidence gaps rather than lifecycle percentage.

The electronics slice remains useful as an integration proving ground, but it is not the product's canonical workflow.

See #120 for adoption/reconciliation and #122 for cross-domain context.

## 3. Non-negotiable engineering invariants

### 3.1 Unknown means unknown

Do not manufacture engineering facts to make a screen look complete.

Examples:
- Missing board dimensions remain unresolved; they do not become `50x50`, `68.6 x 53.4`, or `100x60` automatically.
- Missing board identity remains unassigned; it does not become `board-main`, `board_main`, or `board_0`.
- Missing circuit-block identity remains unassigned; it does not become `block_0` or an invented `Main` block.
- Missing footprint, sourcing, electrical, thermal, RF, mechanical, validation, or manufacturing data must be presented as unresolved unless a reviewed generator explicitly creates a **Draft / Needs Review** artifact.

### 3.2 One canonical project component identity

A component selected from the reusable component library becomes **one project component instance**.

That same identity should be referenced by:
- schematic placement and pin connectivity;
- PCB placement and routing context;
- BOM/procurement state;
- mechanical representation when linked;
- firmware mappings when linked;
- validation evidence and tests;
- output/manufacturing records when applicable.

Do not create separate hidden component copies for individual workbenches.

### 3.3 Real relationships are explicit

A board-scoped action must operate on a real board that exists in project state.

Routing, placement, DRC, board exports, board-level 3D, and manufacturing preparation must not guess a board because a board was not selected.

Legacy sentinel IDs may be repaired during migration **only when the target is unambiguous**. Ambiguous relationships remain unresolved and must be surfaced to the user.

### 3.4 Generated artifacts are not verified facts

Generators can accelerate work, but generated engineering content must carry its real confidence/state.

Generated content should default to a state such as:
- Draft;
- Concept;
- Not Started;
- Needs Review;
- Unverified.

A generator must not make a product appear manufacturing-ready merely by filling empty fields.

### 3.5 Editors mutate real project state

Visible editor actions must affect canonical project data, not isolated demo state.

If an editor displays a component, net, board, validation test, requirement, or output record, its add/edit/delete/placement/connect actions must map back to that same project object unless the UI clearly labels the content as a transient preview.

### 3.6 One shell, contextual tools

The application should have one clear workspace shell and one shared engineering context model.

Do not solve navigation problems by stacking more persistent navigation bars, build maps, duplicated context cards, or global toolbars. Persistent shell UI should be minimal; workbench-specific actions belong inside the relevant workbench.

### 3.7 Deletion and destructive actions respect dependency impact

Deleting or unplacing an engineering object must distinguish between:
- removing a representation from one workbench;
- removing a discipline-specific relationship;
- deleting the canonical product object and its dependent artifacts.

Dependencies should be surfaced before destructive cross-product deletion.

### 3.8 Output truthfulness is stricter than editor convenience

Gerber, drill, BOM/CPL, blueprint, STEP/STL, firmware build, validation evidence, and release/manufacturing outputs must not be marked ready merely because a file-shaped artifact can be emitted.

Output readiness requires appropriate upstream identity, geometry, checks, provenance, and review state.

## 4. What is already baseline-correct

The following work is now part of the accepted baseline:

- Retired CI source-transport workflows and generated repository debris have been removed.
- The duplicate persistent Studio Build Map has been removed from the global shell.
- The sidebar has been consolidated rather than layered with another navigation system.
- Board Studio no longer pre-fills an invented board dimension.
- PCB editor view state no longer starts with a synthetic active board.
- Project migrations preserve missing board/block relationships as unresolved and only repair legacy sentinel IDs when unambiguous.
- Component-library handoff requires a real project board instead of creating placeholder board/block IDs.
- Board DRC requires explicit valid board context and does not borrow another board's outline.
- PCB canvas mutations require real board context and board-scoped entities.
- Board Designer no longer creates a starter board or hidden fallback outline for auto-placement.
- Browser-native save alert behavior has been removed from the active PCB canvas in favor of the shared feedback system.
- Regression tests now defend these rules.

## 5. Known baseline blockers

These are architectural/product-truth blockers, not a complete issue list.

### 5.1 Canonical store still contains legacy fallbacks

`src/store/projectStore.ts` still contains several paths that can reintroduce synthetic board identity, dimensions, or template-specific relationships. These must be normalized at the state boundary so cleaned workbenches cannot regress after save/load or through legacy actions.

### 5.2 Legacy generators mix convenience with engineering truth

Several generators still infer a first board, produce template-oriented values, or create detailed design values from high-level product names. These may remain useful as drafting helpers, but they need explicit provenance/review semantics and must not masquerade as verified engineering decisions.

### 5.3 Export and blueprint readiness is not yet strict enough

Some native export / blueprint paths still contain fallback identity or geometry behavior. Manufacturing-oriented output must eventually refuse invalid or unresolved prerequisites rather than silently generate plausible files.

### 5.4 The editors are not yet qualification-grade CAD / EDA

Schematic, PCB, mechanical, firmware, and validation surfaces have meaningful state and interaction, but they still need deeper domain functionality, constraints, editing ergonomics, interoperability, and verification before they can be treated as professional-tool replacements.

### 5.5 Product graph ownership is still distributed

The product has shared IDs and increasingly connected workflows, but some state/action responsibilities remain duplicated across legacy models, workbench adapters, generators, and store actions. Consolidation should reduce parallel implementations rather than adding new abstractions on top of them.

## 6. Implementation order from this baseline

This order manages architectural risk. It is **not a user workflow**.

1. **Correct authority and canonical semantics** — product context, entity identity, units, provenance, qualification and unresolved state.
2. **Adoption/migration boundary** — safe staged import, source identity, reconciliation and rollback (#37/#120).
3. **Repository boundary** — durable local-first storage for canonical metadata, command history and large artifacts (#38).
4. **Typed application commands** — one mutation path for UI, importers, MCP, AI and engine-derived changes (#39).
5. **Canonical graph/impact** — typed relations, cross-domain queries and deterministic stale propagation (#40).
6. **Universal context** — one object identity followed across every workbench (#122), with Electronics as the first bounded proof (#66).
7. **Engineering runtime** — one capability/job/approval boundary for KiCad, OCCT/FreeCAD, PlatformIO, OpenOCD/GDB, ngspice and validators (#121).
8. **Representation system** — real symbols/footprints/package/CAD/render assets with explicit authority/provenance (#60).
9. **Truthful outputs and versioning** — exact prerequisites, immutable artifacts, evidence and release lineage.
10. **Reference-product convergence** — prove the same environmental node can be adopted/built from multiple starting points (#27).
11. **Expand breadth** — only after the shared spine survives real cross-domain use.

A small blocking security/data-loss/CI repair may pre-empt this order, but new feature breadth must not bypass the shared spine.

## 7. GitHub issue policy during baseline work

GitHub issues are **evidence and acceptance contracts**, not the sole source of truth for what should be worked on next.

- Do not close a broad issue because one subcomponent improved.
- Do not implement a stale issue literally when it conflicts with the current product baseline.
- Update tests and issue context when an old acceptance condition protects behavior that is now known to be unsafe.
- Close an issue only when its user-facing acceptance criteria are demonstrably complete and tested.
- New discoveries that materially affect architecture, safety, data integrity, or product truth should be captured, but baseline work should not stop merely to create issue bookkeeping.

## 8. Definition of a professionally complete baseline change

A baseline change is complete only when:

1. the old contradictory behavior is actually removed, not left beside the new implementation;
2. canonical state and downstream consumers agree on the new rule;
3. migration/backward compatibility is handled deliberately;
4. regression coverage protects the invariant;
5. lint, typecheck, tests, and production build pass;
6. the change does not falsely close a broader product issue;
7. documentation/tests that encoded the old unsafe behavior are updated in the same baseline direction.

---

This file should stay short enough to function as a contract. Detailed domain architecture, product specifications, issue acceptance criteria, and future roadmap material belong in their respective documents/issues rather than being duplicated here.
