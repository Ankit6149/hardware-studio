# Studio unification audit

Status: corrective architecture record.

## Core finding

Hardware Studio currently mounts many separate workbench components through one shell, but that is not the same as a unified engineering product.

The current shell switches between independent pages such as Component Library, Schematic, Board Designer, Mechanical, Firmware, Validation, and Outputs. Each page may use the same project store, but the user is not given one continuous engineering context, one selected-object context, or a visible cross-domain path.

## Current fractures

1. **Navigation is page-centric rather than product-centric.** Users see many workbench names, but not a clear progression from product intent to component selection, schematic, PCB, physical assembly, firmware, validation, and release.
2. **PCB and schematic feel hidden.** They exist as routes, but the Studio does not present them as the next connected state of the same design.
3. **Visual representations are isolated.** The representation inspector and lightweight 3D preview exist, but they are not embedded as a persistent product-view capability in the main Studio.
4. **Selection context is local.** Selecting a component in one editor does not create a global cross-domain context that can be inspected in schematic, PCB, BOM, firmware mapping, and 3D.
5. **Workbench layouts are inconsistent.** Different pages use different headers, side panels, density, terminology, and action placement.
6. **The shell does not explain what is real, provisional, or missing at the point of work.** Trust information exists in some subsystems but is not consistently visible.
7. **Several editors still expose prototype-era interaction patterns.** For example, native browser confirmation remains in the schematic editor, and some workbenches create placeholder board/block identities.
8. **The product graph is not visible.** Shared data may exist in the store, but the user cannot see how one artifact propagates across domains.

## Corrective direction

Stop adding isolated pages. Build a unified product workspace with:

- a permanent product-stage rail: Define → Architecture → Components → Schematic → PCB → 3D/Mechanical → Firmware → Validate → Release;
- a shared context header showing active product, board, selected component/object, revision, and trust state;
- a shared inspector that follows the selected engineering object across workbenches;
- cross-probing between component library, schematic, PCB, BOM, firmware mapping, and representations;
- one consistent workbench frame and interaction grammar;
- explicit empty, unresolved, and not-yet-connected states;
- direct next/previous transitions between connected stages;
- embedded lightweight 3D in the Studio rather than only in a modal inspector;
- no fake exact geometry, no silent placeholder records, and no native browser dialogs;
- responsive behavior designed at the shell level rather than independently per page.

## First corrective slice

The first implementation must unify the Electronics path end to end:

Component Library → Schematic → PCB → BOM → Representation/3D

It must use one selected component identity and show its state in every stage. The slice is incomplete unless a user can create/select a component, place it in schematic, see its PCB placement state, inspect BOM and visual representations, and move between those views without losing context.
