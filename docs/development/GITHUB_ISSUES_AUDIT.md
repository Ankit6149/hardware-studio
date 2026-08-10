# Hardware Studio — Production Codebase Audit & GitHub Issues

This document registers the official detailed GitHub issues resulting from a comprehensive codebase audit using `@sentropic/graphify` static ontology analysis and deep AST file inspection across the entire Hardware Studio codebase.

---

## ISSUE #1: Codebase Bloat & Legacy Prototype Deletion

**Title:** `chore(arch): Remove 16 stale legacy prototype files and prune dead component subdirectories`

**Labels:** `refactor`, `tech-debt`, `architecture`, `cleanup`

### Summary
The codebase contained 16 obsolete prototype components created prior to the V1 Studio Unification pass. These files were completely unreferenced in active navigation, created duplicate component names (`SchematicEditor` vs `UnifiedSchematicEditor`, `ComponentLibrary` vs `ComponentLibraryWorkbench`, `WebGL3DView` vs `UnifiedBoard3DView`), and cluttered developer mental models.

### Target Files for Removal
1. `src/components/BOMTable.tsx` (superseded by `UnifiedBOMWorkbench.tsx`)
2. `src/components/BlueprintEditor.tsx` (superseded by `BlueprintSheets.tsx` & `BlueprintCanvas.tsx`)
3. `src/components/CircuitPlanner.tsx` (superseded by `UnifiedSchematicEditor.tsx`)
4. `src/components/FirmwarePlan.tsx` (superseded by `FirmwareStudio.tsx`)
5. `src/components/ManufacturingPack.tsx` (superseded by `FactoryPackageBuilder.tsx`)
6. `src/components/NetlistPlanner.tsx` (superseded by `PinMapTable.tsx` & `BoardNetPanel.tsx`)
7. `src/components/TestingBoard.tsx` (superseded by `UnifiedValidationWorkbench.tsx`)
8. `src/components/component-library/ComponentLibrary.tsx` (superseded by `ComponentLibraryWorkbench.tsx`)
9. `src/components/editor/EditorCanvas.tsx` (legacy prototype canvas)
10. `src/components/editor/EditorInspector.tsx` (legacy prototype inspector)
11. `src/components/editor/EditorLayerPanel.tsx` (legacy prototype layer panel)
12. `src/components/editor/EditorToolbar.tsx` (legacy prototype toolbar)
13. `src/components/editor/editorTypes.ts` (legacy prototype types)
14. `src/components/mechanical/Mechanical3DView.tsx` (superseded by `UnifiedBoard3DView.tsx`)
15. `src/components/mechanical/WebGL3DView.tsx` (superseded by `UnifiedBoard3DView.tsx`)
16. `src/components/schematic/SchematicEditor.tsx` (superseded by `UnifiedSchematicEditor.tsx`)

### Acceptance Criteria
- [x] All 16 legacy prototype files deleted from workspace.
- [x] `src/components/editor/` directory purged.
- [x] No lingering imports of dead components in active views.
- [x] `npx vitest run` passes with 100% test success.

---

## ISSUE #2: Design System & Styling Consistency

**Title:** `fix(ui): Eliminate raw inline styles and standardize dark/light CAD studio design system tokens`

**Labels:** `ui`, `design-system`, `refactor`, `frontend`

### Summary
Several components (e.g. `MechanicalStudio.tsx`, `BoardStudio.tsx`, and `BoardDesigner.tsx`) contained hardcoded inline `style={{ ... }}` objects and legacy hex color values (`#e2e8f0`, `#3b82f6`, `#1e293b`). This produced fragmented visual styling where some panels looked like basic prototypes alongside modern Tailwind CAD toolbars.

### Acceptance Criteria
- [x] `MechanicalStudio.tsx` refactored to use Tailwind classes consistent with `AppShell` and `UnifiedBoard3DView`.
- [x] `BoardStudio.tsx` modernized into a sleek, dark/light theme CAD board configuration panel using unified UI controls (`Button`, `Badge`, Tailwind tokens).
- [x] All workbench modes use unified typography, flex container bounds, and slate/indigo design tokens.

---

## ISSUE #3: Mechanical 3D CAD & WebGL Synchronization

**Title:** `feat(mechanical): Consolidate 3D previews into production Three.js UnifiedBoard3DView`

**Labels:** `mechanical`, `3d`, `webgl`, `enhancement`

### Summary
`MechanicalStudio.tsx` maintained legacy references to SVG 3D previews and an isolated WebGL canvas. This resulted in disconnected 3D rendering where footprint placements, layer stackups, and mechanical enclosures were not consistently rendered in 3D.

### Acceptance Criteria
- [x] `MechanicalStudio.tsx` routes all 3D view modes (`3d-preview` and `webgl-3d`) to `UnifiedBoard3DView`.
- [x] Real-time 3D board stackup, footprint height bounding boxes, enclosure visibility toggle, and camera controls operate seamlessly.
- [x] WebGL fallback gracefully handles environments without hardware acceleration.

---

## ISSUE #4: Single Source of Truth for Board Settings

**Title:** `fix(board): Synchronize Board Settings surface with Studio Context Store and active project boards`

**Labels:** `board`, `pcb`, `state-management`, `cad`

### Summary
`BoardStudio.tsx` was using local state for board editing rather than cleanly committing commands via the `useProjectStore` command bus.

### Acceptance Criteria
- [x] Board CRUD actions in `BoardStudio.tsx` issue store actions (`addBoard`, `updateBoard`, `deleteBoard`, `addBoardComponent`).
- [x] Active board selection syncs bi-directionally with `useStudioContextStore`.
- [x] Switching between Board Settings and Board Designer maintains context without lost edits.

---

## ISSUE #5: Unified Graphify Architecture Snapshot & Verification

**Title:** `docs(arch): Update Graphify knowledge graph report following legacy deletion`

**Labels:** `documentation`, `graphify`, `ci`

### Summary
Run `@sentropic/graphify update` to ensure graph nodes and community clusters reflect the pruned, unified single-app structure.

### Acceptance Criteria
- [x] Rebuild `.graphify/graph.json` and `.graphify/GRAPH_REPORT.md`.
- [x] Verify total nodes represent active, production-grade components without orphaned edges.
- [x] Commit and push changes to master.
