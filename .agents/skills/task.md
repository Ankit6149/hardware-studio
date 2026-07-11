# PCB Board Designer — Task Tracker

## Phase 1: Types & Data Model
- `[x]` Extend `index.ts` with PadNetAssignment, KeepoutZone, Trace extensions, Project extensions

## Phase 2: Utilities
- `[x]` Create `boardInteractionTypes.ts` — tool enums, view state types
- `[x]` Create `boardGeometry.ts` — pad helpers, ratsnest, collision, coordinate transforms

## Phase 3: DRC Engine
- `[x]` Create `boardDRC.ts` — live design rule checking

## Phase 4: Board UI Components
- `[x]` Create `BoardCanvas.tsx` — SVG PCB canvas with pan/zoom/grid/rendering
- `[x]` Create `BoardToolbar.tsx` — tool and action buttons
- `[x]` Create `BoardLayerPanel.tsx` — layer visibility and board selector
- `[x]` Create `BoardObjectInspector.tsx` — context-sensitive property editor
- `[x]` Create `BoardNetPanel.tsx` — net list with routing status
- `[x]` Create `BoardComponentBin.tsx` — unplaced/placed component list
- `[x]` Create `BoardDRCPanel.tsx` — DRC results display
- `[x]` Create `BoardDesigner.tsx` — main layout orchestrator

## Phase 5: Store Extensions
- `[x]` Add keepoutZone CRUD, padNetAssignment CRUD, placement helpers, auto-place, rough autoroute, board DRC

## Phase 6: Navigation
- `[x]` Update `Sidebar.tsx` — add Board Designer nav item
- `[x]` Update `AppShell.tsx` — add Board Designer route

## Phase 7: The Ring Demo Data
- `[x]` Seed `theRingTemplate.ts` with board, outline, layers, components, nets, traces, vias, drills, keepouts

## Phase 8: Export Updates
- `[x]` Audit/update `nativeExports.ts` — use real board data, add board JSON export

## Phase 9: Verification
- `[x]` npm run lint — clean
- `[x]` npm run build — clean
- `[x]` Create walkthrough
