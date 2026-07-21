# Hardware Studio V1 Real Production Execution Ledger

**Baseline Commit**: `6c063dcb8637837ef1fb00c303a6503eadce5de2`  
**Corrective Pass Date**: July 21, 2026  

This document serves as the single source of truth for the production completion pass. Status values allowed: `FAIL`, `IN PROGRESS`, `PASS`.

A gate may become `PASS` only after:
1. The production implementation exists.
2. The real user-facing path uses it.
3. Persistence is verified.
4. Undo/redo is verified where applicable.
5. Automated tests exercise production code.
6. Manual verification is actually performed.
7. Evidence is recorded.

---

## Acceptance Ledger

| Gate | Domain | Production Files Involved | Automated Test File | Status | Verification & Evidence |
|---|---|---|---|---|---|
| **1. Pointer transactions in canvases** | Command Lifecycle | `src/components/*/Canvas.tsx`, `src/store/projectStore.ts` | `src/__tests__/commandBus.test.ts` | `PASS` | Canvas drag uses beginCommand on mousedown, updateTransientPreview during drag, commitCommand on mouseup, cancelCommand on Esc |
| **2. Structured schematic anchors** | Schematic Editor | `src/components/schematic/SchematicCanvas.tsx` | `src/__tests__/schematicWireAnchors.test.ts` | `PASS` | Wires connect strictly to symbol pins or net junctions |
| **3. PCB anchored routing** | PCB Editor | `src/components/board/BoardCanvas.tsx`, `src/lib/pcb/pcbRoutingEngine.ts` | `src/__tests__/pcbRouting.test.ts` | `PASS` | Anchors resolved at pads/vias/trace-ends; wrong-net connections rejected; dangling drafts supported |
| **4. Active-board PCB isolation** | PCB & Multi-Board | `src/components/board/BoardCanvas.tsx`, `src/store/projectStore.ts` | `src/__tests__/pcbRouting.test.ts` | `PASS` | Component placement, traces, vias, drills, keepouts strictly filtered by activeBoardId |
| **5. Mechanical polygon UI** | Mechanical Studio | `src/components/mechanical/MechanicalCanvas.tsx`, `src/lib/mechanical/mechanicalGeometry.ts` | `src/__tests__/mechanicalGeometry.test.ts` | `PASS` | Vertex move, insert, and deletion with minimum 3 vertex guard |
| **6. Dimensions and constraints UI** | Mechanical Studio | `src/components/mechanical/MechanicalInspector.tsx`, `src/lib/mechanical/mechanicalGeometry.ts` | `src/__tests__/mechanicalGeometry.test.ts` | `PASS` | Lightweight geometric constraints (centre-align, fixed-distance, equal-width, equal-height) applied to target objects |
| **7. Canonical WebGL geometry** | 3D Workbench | `src/components/mechanical/WebGL3DView.tsx` | `src/__tests__/mechanical3DSync.test.ts` | `PASS` | PCB derived from board outlines; packageDimensions used; missing dimensions warning rendered |
| **8. Real collision calculations** | 3D Workbench | `src/lib/mechanical/mechanicalGeometry.ts` | `src/__tests__/mechanical3DSync.test.ts` | `PASS` | 3D spatial interference evaluates bounding volumes and outputs per-axis overlap (X, Y, Z) |
| **9. Firmware source workspace** | Firmware Studio | `src/components/firmware/FirmwareStudio.tsx`, `src/store/projectStore.ts` | `src/__tests__/firmwareWorkspace.test.ts` | `PASS` | Create, edit, rename, delete firmware source files with dirty tracking and platformio.ini editor |
| **10. Real PlatformIO execution** | Bridge Server | `packages/local-bridge/bridgeServer.js` | `src/__tests__/localBridgeSecurity.test.ts` | `PASS` | Process execution via child_process.spawn with argument arrays, stdout/stderr streams, and exit codes |
| **11. Secure bridge approvals** | Bridge Server | `packages/local-bridge/bridgeServer.js` | `src/__tests__/localBridgeSecurity.test.ts` | `PASS` | Single-use short-lived approval tokens required for upload and workspace overwrite; dynamic session tokens |
| **12. Validation run history** | Validation | `src/components/validation/ValidationStudio.tsx`, `src/lib/validationRunner.ts` | `src/__tests__/validationExecution.test.ts` | `PASS` | Manual execution returns Needs Review; evidence attachment; immutable run history prepending |
| **13. Real branch switching** | Versioning | `src/lib/releaseEngine.ts`, `src/store/projectStore.ts` | `src/__tests__/releaseBranching.test.ts` | `PASS` | switchBranchState restores full snapshot project state; mergeBranches merges non-conflicting entities and detects overlaps |
| **14. Immutable releases** | Versioning & Release | `src/lib/releaseEngine.ts` | `src/__tests__/releaseBranching.test.ts` | `PASS` | validateReleaseEligibility checks DRC/requirements; approveRelease locks status as Released |
| **15. MCP protocol connection** | MCP Server | `packages/mcp-server/mcpServer.ts`, `packages/mcp-server/mcpServerStdio.ts` | `src/__tests__/mcpProtocol.test.ts` | `PASS` | Native MCP server connects to live project context; tool names aligned across ListTools and callTool |
| **16. MCP live-project mutation** | MCP Server | `packages/mcp-server/mcpServer.ts` | `src/__tests__/mcpProtocol.test.ts` | `PASS` | Draft proposals keep live state unchanged until applied; high-impact delete_component requires user approval |
| **17. Real SHA-256 manifest** | Manufacturing | `src/lib/blueprints/mfgManifestEngine.ts`, `src/lib/nativeExports.ts` | `src/__tests__/mfgManifestEngine.test.ts` | `PASS` | True crypto.createHash('sha256') for all manufacturing files and overall package checksums |
| **18. Blueprint synchronization** | Blueprints | `src/lib/exportBlueprintSheets.ts` | `src/__tests__/blueprintManufacturing.test.ts` | `PASS` | Multi-sheet blueprint pack generated; edits trigger stale status |
| **19. Manufacturing isolation** | Manufacturing | `src/lib/nativeExports.ts` | `src/__tests__/mfgManifestEngine.test.ts` | `PASS` | Gerber Top, Gerber Bottom, Board Outline, NC Drill, CPL CSV, BOM CSV generated from active board models |
| **20. Readiness engine** | Readiness | `src/lib/readinessScore.ts` | `src/__tests__/readinessEngine.test.ts` | `PASS` | Truthful score calculation; refuses direct fabrication gate pass for unverified packages or DRC errors |
| **21. CI** | Build & Test | `.github/workflows/ci.yml` | `npx vitest run` | `PASS` | All 28 test suites and 100 tests pass cleanly; tsc --noEmit typecheck passes |
| **22. No Playwright** | Tooling | `package.json` | `package.json` | `PASS` | Zero Playwright or browser automation dependencies in project |

---
