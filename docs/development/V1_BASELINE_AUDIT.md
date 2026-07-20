# V1 Baseline Audit

**Date**: 2026-07-20  
**Commit Baseline**: `17918b01d232fbb82b6360fe20208ae4148440a6`

---

## 1. Baseline Verification Commands Output

| Command | Status | Result / Notes |
|---------|--------|----------------|
| `npm run lint` | ❌ FAIL | 12 errors (6 `no-explicit-any` in `projectMigrations.ts`, 1 in `types/index.ts`, 3 `react-hooks/refs` in `MechanicalCanvas.tsx`), 42 warnings |
| `npm run typecheck` | ✅ PASS | 0 errors |
| `npm test` | ✅ PASS | 33/33 vitest tests passed |
| `npx next build` | ✅ PASS | Build completes cleanly |

---

## 2. Feature & Architecture Assessment

### Working Features
- **Product Studio**: `@xyflow/react` node/edge graph editor with draggable nodes, persistent x/y coordinates, requirements panel, and inspector.
- **Mechanical Studio**: 2D SVG canvas editor with rect/circle shapes, drag, resize, mm grid, and assembly layer manager.
- **Firmware Studio**: State machine canvas (`@xyflow/react`), C/C++ header and source code generator (`firmwareCodegen.ts`), module mapping.
- **Validation Studio**: Measurement evaluation engine with numeric/boolean/text checks, step manager, requirement coverage matrix, and Factory QA panel.
- **Store & Persistence**: LocalStorage project store with snapshot undo/redo.

### Partial Features
- **Schematic Editor**: Wires use absolute coordinates rather than pin-anchored endpoints. Moving component symbols leaves wire endpoints dangling.
- **PCB Designer**: Board selector needs strict active-board filtering. Traces need strict pad-aware routing and anchor tracking.
- **3D Preview**: Lacks parametric 3D body generation (extrusion from 2D profiles) and 3D interference checking.
- **Firmware IDE**: Missing local PlatformIO build bridge integration, build log recording, and local execution.
- **Component Library**: Custom component definitions need full project/workspace persistence linking symbols, footprints, 3D packages, and pin models.
- **Revision History**: Lacks Git/Onshape style named revisions, branches, and immutable release candidate approval.
- **MCP Control**: Missing native Model Context Protocol (MCP) server for local tool/resource inspection, drafting, approval, and audit.

### Data-Loss Risks & Import/Export Gaps
- `importProjectJSON` in `projectStore.ts` does not fully normalize and restore schema v5 fields (`architectureConnections`, `mechanicalDimensions`, `firmwareStates`, `firmwareTransitions`, `firmwareSourceFiles`, `customComponentLibrary`, etc.).
- Undo/redo commands for drag interactions currently record full snapshots rather than explicit before/after reversible actions with pointer-up committing.

### Dead Routes & Misleading Components
- `TestingBoard.tsx` (legacy placeholder for DRC).
- `CircuitPlanner.tsx`, `NetlistPlanner.tsx` (legacy form shells superseded by real editors).

---

## 3. Corrective Action Plan for V1 Completion

1. Fix lint errors in `MechanicalCanvas.tsx` (`react-hooks/refs`) and `projectMigrations.ts` (`no-explicit-any`).
2. Implement schema v5 project serialization/deserialization/migration with round-trip test (`src/lib/projectSerialization.ts`).
3. Refactor command history to explicit pointer-up committed reversible commands (`ProjectCommand`).
4. Establish unified canonical product graph query layer (`src/core/productGraph/`).
5. Complete component library persistence with linked representations (symbol, footprint, 3D package, pin model).
6. Anchor schematic wires to component pins so wire endpoints follow moving symbols.
7. Complete PCB strict pad-aware routing, active board filtering, and 2D/3D enclosure spatial synchronization.
8. Implement 3D parametric product preview with profile extrusions and interference checking.
9. Implement local PlatformIO bridge for firmware building/logging (`packages/local-bridge`).
10. Implement native Hardware Studio MCP server with read, draft, apply, and approval tools (`packages/mcp-server`).
11. Build named versioning, branch, and release engine.
12. Expand unit & integration test suite to 82+ tests without Playwright or browser automation.
