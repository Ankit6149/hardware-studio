# Adaptive workflow research — superseded implementation

**Status:** historical research only  
**Superseded by:** PR #69, merged August 25, 2026  
**Current navigation authority:** `src/lib/navigationRegistry.ts`  
**Product scope authority:** `docs/product/V1_PRODUCT_CONSTITUTION.md`

## Why this document remains

This research explored how mature engineering tools reduce visible complexity while keeping connected project data. The research observations remain useful, but the workflow-profile implementation that originally came from this document has been removed from Hardware Studio V1.

The implementation had introduced another product-structure layer on top of domain navigation, contextual navigation, workbench guidance, and shared engineering context. In practice that created more choices about **how to navigate** without making the underlying engineering workflow more complete.

The V1 convergence decision is therefore simpler:

> **One product lifecycle is always understandable. Supporting tools live inside the workbench that owns the decision.**

## Retained research lessons

### KiCad

Schematic and PCB can remain distinct specialist editors while sharing authoritative electrical identity. Hardware Studio should preserve this principle without turning every supporting tool into a global destination.

Sources:

- https://docs.kicad.org/9.0/en/eeschema/eeschema.html
- https://docs.kicad.org/10.0/en/pcbnew/pcbnew.pdf

### Autodesk Fusion and Blender

Task-oriented workspaces reduce visible commands and panels. The transferable lesson is **contextual tools**, not user-configurable product structure before the core lifecycle is mature.

Sources:

- https://help.autodesk.com/view/NINVFUS/ENU/?guid=GS-WORKSPACES
- https://docs.blender.org/manual/en/4.2/interface/window_system/workspaces.html

### Onshape

Different artifact types can remain linked without duplicating canonical identity. Hardware Studio should keep that principle while repository and product-graph boundaries converge.

Sources:

- https://cad.onshape.com/help/Content/Document/documents.htm
- https://cad.onshape.com/help/Content/Document/linking_documents.htm

## Current V1 shell decision

The normal Studio lifecycle is:

`Home → Define → Electronics → Mechanical → Firmware → Validate → Release`

Visible primary workbenches are deliberately bounded:

- **Define:** Requirements, Architecture
- **Electronics:** Components, Schematic, PCB, BOM
- **Mechanical:** Design, Assembly
- **Firmware:** Behavior, Hardware Map, Source
- **Validate:** Tests & Evidence, Coverage
- **Release:** Readiness, Outputs, Revisions

Power, pin mapping, board setup, PCB rules/DRC, factory QA, drawings, factory-package preparation, legacy Blueprint routes, and experimental Product Design remain contextual, compatibility-only, or experimental rather than competing top-level workflows.

## Removed implementation

PR #69 removed:

- workflow profiles;
- custom workflow configuration;
- workflow preference persistence;
- Scope/show-hidden-domain controls;
- the workflow setup dialog;
- hidden-domain warning behavior;
- the permanent Workspace Coach;
- permanent “Start here” instructions in contextual navigation.

These concepts must not be recreated from this historical research document unless a future product decision explicitly supersedes the current V1 constitution and demonstrates a user need after the reference lifecycle is complete.

## Still-valid boundaries

This convergence decision does **not** change engineering truth boundaries:

- hiding or reorganizing UI must never mutate canonical engineering data;
- Three.js remains a visualization layer, not CAD authority;
- missing dimensions, placement, evidence, or qualification remain unresolved;
- one canonical component identity must survive Electronics, PCB, BOM, Firmware, Validation, and Release handoffs;
- future customization must operate on the same repository and command system, not introduce a second project model.
