# Hardware Studio — Agent Entry Point

Hardware Studio is being recovered into **one moldable engineering environment for one physical product**, not a collection of independent hardware mini-apps.

Read this file before changing product behavior, state architecture, workbench structure, imports, rendering, engineering engines, or documentation.

## Active authority order

When active documents disagree, use this order:

1. `docs/product/V1_PRODUCT_CONSTITUTION.md` — product scope and hard product invariants.
2. `docs/ARCHITECTURE.md` — target architecture and authority boundaries.
3. `docs/development/CURRENT_PRODUCT_BASELINE.md` — current verified state and immediate blockers.
4. `docs/development/PRODUCT_RECOVERY_EXECUTION_PLAN.md` — implementation sequencing.
5. Current GitHub issues and ADRs for the specific slice being changed.
6. Research/historical documents only as evidence; they are not product authority.

The execution plan's phases are **engineering implementation order, never a required user workflow**.

## Product mental model

> One product. One canonical graph. Many representations. Many engineering engines.

A user may start from any trustworthy artifact or discipline: blank project, requirements, concept/sketch, components/BOM, KiCad schematic/PCB, STEP/DXF/mechanical data, PlatformIO firmware, manufacturing files, or validation evidence.

Hardware Studio adopts what is actually known, leaves missing facts unresolved, and progressively connects the artifacts into the same canonical product.

See:
- #120 — start-anywhere adoption and reconciliation;
- #121 — engineering-engine runtime and secure local agent;
- #122 — universal engineering context and cross-domain continuity.

## Hard invariants

1. **No mandatory first workbench.** Requirements → PCB is valid; PCB → Requirements is also valid.
2. **One canonical identity.** A component/part/net/board/test is not copied merely because another workbench needs to display it.
3. **Unknown stays unknown.** Do not invent board IDs, dimensions, placements, packages, evidence, mappings, or source provenance.
4. **Generated is not verified.** AI/generators create proposals or derived artifacts, never evidence by existence.
5. **Renderer state is not engineering state.** Pixi/React/Three scene objects, pixels, meshes and UI layout do not own canonical geometry/topology.
6. **Visual 3D is not exact CAD.** Three.js/glTF is visualization. Exact mechanical authority requires qualified B-Rep/STEP/kernel data.
7. **External software is an engine, not a second workflow silo.** KiCad, OCCT/FreeCAD, PlatformIO, OpenOCD/GDB, ngspice and validators integrate through the shared engine/runtime boundary.
8. **No raw AI/MCP patching.** UI, importers, MCP, AI and engine-derived changes converge on typed commands and repository transactions.
9. **Readiness is capability/evidence based.** Do not force stage percentages or gate unrelated work because an earlier discipline is incomplete.
10. **Every new path must name what old/duplicate path it replaces.** Do not solve migration by keeping two authorities indefinitely.

## Target application boundaries

```
UI / Workbenches
    ↓
Universal Engineering Context + Queries
    ↓
Typed Application Commands
    ↓
Canonical Product Graph / Domain
    ↓
Repository + Versions + Artifacts
    ↕
Adoption / Interchange
    ↕
Engineering Engine Runtime
    ↕
Secure Local Agent / Qualified External Tools
```

Expected dependency direction:

`UI → Application → Domain`

Adapters depend inward. Domain code must not depend on React, Zustand, localStorage, MCP transport, browser routing, KiCad, PlatformIO, or local-agent implementation details.

## Representation rules

One canonical entity may have multiple linked representations:

- semantic/architecture;
- schematic symbol;
- PCB footprint;
- mechanical package/envelope;
- exact B-Rep/STEP model;
- lightweight glTF/GLB render cache;
- educational/pictorial illustration;
- photo/reference asset.

Every representation records source/provenance, qualification/trust, units/coordinate frame where applicable, version/hash, and licensing metadata where required.

Current technology hypotheses must be proven through #35 ADRs:
- React Flow for semantic architecture graphs;
- PixiJS/WebGL-class scene graphs for dense schematic/PCB surfaces;
- Three.js for interactive 3D visualization;
- OCCT/Open CASCADE for exact CAD authority;
- IndexedDB/repository metadata + OPFS for large local artifacts;
- Monaco + xterm.js for firmware/code/console UI;
- KiCad/`kicad-cli`, PlatformIO, OpenOCD/GDB and ngspice through #121.

Do not introduce these as hidden one-off dependencies before their ADR/spike boundary is clear.

## Current foundation priority

Before broad new feature expansion:

1. correct active product/architecture context;
2. canonical entity taxonomy and provenance (#36);
3. staged migration/adoption semantics (#37/#120);
4. repository boundary (#38);
5. typed commands (#39);
6. canonical graph/impact (#40);
7. universal context (#122);
8. engine/runtime boundary (#121);
9. representation pipeline (#60);
10. prove the environmental status node from multiple starting points (#27).

This is implementation sequencing only.

## Change checklist

Before coding:
- identify canonical entities/relations touched;
- identify the command(s) that should own mutation;
- identify repository/artifact implications;
- identify provenance/qualification impact;
- identify renderer/view projection;
- identify old code that becomes redundant;
- identify migration/backward-compatibility behavior;
- identify tests proving user behavior, not just helper functions.

A PR is incomplete when it only adds UI, types, helpers, or an alternate engine without migrating the production path.

## Current product safety language

Use explicit states such as provisional, unresolved, implemented, verified, independently qualified, stale, blocked, unsupported, and released according to the constitution.

Do not call an artifact manufacturing-ready, CAD-authoritative, verified, or released merely because it rendered or a file was generated.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
