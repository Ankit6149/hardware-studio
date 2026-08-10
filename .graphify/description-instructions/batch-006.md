# Node Description Batch 7 of 28

Graphify is running in assistant/skill mode (no API key). You are the host
assistant (Claude Code / Codex / Gemini CLI). Read the prompt below and write
your JSON answer to the answer file.

## Prompt

You are documenting nodes in a knowledge graph.
For each entry below, write ONE concise factual plain-language sentence
describing what it is or does. Use only the provided context.
For a code symbol (kind=code-symbol — a function, class, or constant),
describe what the function/symbol does based on its name, source location
and neighbors — e.g. "Resolves the configured ontology profile from graphify.yaml.".
For an entity node (any other kind — e.g. a person, place, event, object),
describe what the entity is and its role, grounded in its type, its
relations (neighbors) and the provided citations/evidence — e.g.
"Lady Carfax, a wealthy heiress who disappears en route to Lausanne.".
Ground entity descriptions in the citations/evidence when present; do not
speculate beyond the context, so a node with no supporting context may be
left out of the reply.
LANGUAGE: each entry has a `lang=` marker giving the language of its source.
Write that entry's description in EXACTLY that language. Do not translate to
a single common language — match each node's source language individually.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "lib_blueprintgenerator_generatecomponentplacementsheet": "generateComponentPlacementSheet()" | kind=code-symbol | source=src/lib/blueprintGenerator.ts:L436 | neighbors=[blueprintGenerator.ts, generateBlueprintPack(), objId(), sheetStatus(), tblId(), warnId()] | lang=en
- "lib_blueprintgenerator_generatepinmapsheet": "generatePinMapSheet()" | kind=code-symbol | source=src/lib/blueprintGenerator.ts:L637 | neighbors=[blueprintGenerator.ts, generateBlueprintPack(), objId(), sheetStatus(), tblId(), warnId()] | lang=en
- "lib_blueprintgenerator_generateroutingsheet": "generateRoutingSheet()" | kind=code-symbol | source=src/lib/blueprintGenerator.ts:L499 | neighbors=[blueprintGenerator.ts, generateBlueprintPack(), objId(), sheetStatus(), tblId(), warnId()] | lang=en
- "lib_exportjson": "exportJson.ts" | kind=code-symbol | source=src/lib/exportJson.ts:L1 | neighbors=[9c84530 feat: implement interactive pro…, ExportCenter.tsx, ProjectManager.tsx, exportProjectJson(), index.ts, Project] | lang=en
- "lib_nativeexports_generatenativeexcellondrills": "generateNativeExcellonDrills()" | kind=code-symbol | source=src/lib/nativeExports.ts:L602 | neighbors=[mfgManifestEngine.ts, ExportCenter.tsx, FactoryPackageBuilder.tsx, nativeExports.ts, generateReleasePackageManifest(), blueprintManufacturing.test.ts] | lang=en
- "lib_nativeexports_generatenativegerberboardoutline": "generateNativeGerberBoardOutline()" | kind=code-symbol | source=src/lib/nativeExports.ts:L415 | neighbors=[mfgManifestEngine.ts, ExportCenter.tsx, FactoryPackageBuilder.tsx, nativeExports.ts, getBoardDimensions(), scaleGerber()] | lang=en
- "lib_nativeexports_generatenativenetlistjson": "generateNativeNetlistJson()" | kind=code-symbol | source=src/lib/nativeExports.ts:L714 | neighbors=[mfgManifestEngine.ts, ExportCenter.tsx, FactoryPackageBuilder.tsx, nativeExports.ts, exportConceptualNetRoutingJson(), generateReleasePackageManifest()] | lang=en
- "lib_navigationregistry_navigationdomains": "navigationDomains" | kind=code-symbol | source=src/lib/navigationRegistry.ts:L109 | neighbors=[ProjectDashboard.tsx, navigationRegistry.ts, workflowProfiles.ts, navigationRegistry.test.ts, workflowProfiles.test.ts, WorkflowSetupDialog.tsx] | lang=en
- "lib_releaseengine_approverelease": "approveRelease()" | kind=code-symbol | source=src/lib/releaseEngine.ts:L207 | neighbors=[releaseEngine.ts, RevisionsStudio.tsx, hardwareStudioV1Integration.test.ts, releaseBranching.test.ts, releaseEngine.test.ts, revisionsUI.test.ts] | lang=en
- "lib_releaseengine_createbranch": "createBranch()" | kind=code-symbol | source=src/lib/releaseEngine.ts:L68 | neighbors=[releaseEngine.ts, RevisionsStudio.tsx, hardwareStudioV1Integration.test.ts, releaseBranching.test.ts, releaseEngine.test.ts, revisionsUI.test.ts] | lang=en
- "lib_releaseengine_createnamedrevision": "createNamedRevision()" | kind=code-symbol | source=src/lib/releaseEngine.ts:L55 | neighbors=[releaseEngine.ts, RevisionsStudio.tsx, hardwareStudioV1Integration.test.ts, releaseBranching.test.ts, releaseEngine.test.ts, revisionsUI.test.ts] | lang=en
- "lib_releaseengine_createreleasecandidate": "createReleaseCandidate()" | kind=code-symbol | source=src/lib/releaseEngine.ts:L199 | neighbors=[releaseEngine.ts, RevisionsStudio.tsx, hardwareStudioV1Integration.test.ts, releaseBranching.test.ts, releaseEngine.test.ts, revisionsUI.test.ts] | lang=en
- "lib_workflowprofiles_workflowdomainid": "WorkflowDomainId" | kind=code-symbol | source=src/lib/workflowProfiles.ts:L18 | neighbors=[AppShell.tsx, ProjectDashboard.tsx, workflowProfiles.ts, workflowPreferencesStore.ts, StudioBuildMap.tsx, WorkflowSetupDialog.tsx] | lang=en
- "mechanical_mechanicalgeometry_checkmechanicalinterference": "checkMechanicalInterference()" | kind=code-symbol | source=src/lib/mechanical/mechanicalGeometry.ts:L221 | neighbors=[validationRunner.ts, mcpServer.ts, mechanicalGeometry.ts, hardwareStudioV1Integration.test.ts, mechanical3DSync.test.ts, webgl3DView.test.ts] | lang=en
- "mechanical_mechanicalgeometry_mechanicalobjectsoverlap": "mechanicalObjectsOverlap()" | kind=code-symbol | source=src/lib/mechanical/mechanicalGeometry.ts:L100 | neighbors=[mechanicalGeometry.ts, boxesOverlap(), getMechanicalBoundingBox(), mechanicalValidation.ts, mechanicalGeometry.test.ts, projectStore.test.ts] | lang=en
- "product_productgraph_validatearchitecturegraph": "validateArchitectureGraph()" | kind=code-symbol | source=src/lib/product/productGraph.ts:L65 | neighbors=[productGraph.ts, findDisconnectedNodes(), findPowerBlocksWithoutPowerConnection(), findProcessingBlocksWithoutInput(), findRequirementsWithoutLinks(), ProductStudio.tsx] | lang=en
- "schematic_schematicinteraction": "schematicInteraction.ts" | kind=code-symbol | source=src/components/schematic/schematicInteraction.ts:L1 | neighbors=[12bcbdd Unify workspace: Integrate Comp…, SchematicCanvas.tsx, initialSchematicUIState, SchematicTool, SchematicUIState, UnifiedSchematicEditor.tsx] | lang=en
- "schematic_schematicsymbolrenderer": "SchematicSymbolRenderer.tsx" | kind=code-symbol | source=src/components/schematic/SchematicSymbolRenderer.tsx:L1 | neighbors=[356b610 Stabilize schematic and PCB rou…, SchematicCanvas.tsx, getSymbolPinLayouts(), SchematicSymbolRenderer(), SchematicSymbolRendererProps, SymbolPinLayout] | lang=en
- "tests_feedbackstate_test": "feedbackState.test.ts" | kind=code-symbol | source=src/__tests__/feedbackState.test.ts:L1 | neighbors=[c020639 Add crash recovery and visible …, feedbackState.ts, feedbackReducer(), initialFeedbackState, PromptDecision, validatePromptValue()] | lang=en
- "tests_localbridgesecurity_test": "localBridgeSecurity.test.ts" | kind=code-symbol | source=src/__tests__/localBridgeSecurity.test.ts:L1 | neighbors=[84415a2 fix(v1): complete truthful prod…, c9e9d0c fix(ci): repair dependency lock…, bridgeServer.js, createServer(), isPathContained(), BridgeResponseBody] | lang=en
- "tests_mcpserver_test": "mcpServer.test.ts" | kind=code-symbol | source=src/__tests__/mcpServer.test.ts:L1 | neighbors=[31431d7 feat: complete cross-domain pro…, e20a167 feat: complete readiness engine…, mcpServer.ts, HardwareStudioMCPServer, index.ts, Project] | lang=en
- "tests_mfgmanifestengine_test": "mfgManifestEngine.test.ts" | kind=code-symbol | source=src/__tests__/mfgManifestEngine.test.ts:L1 | neighbors=[84415a2 fix(v1): complete truthful prod…, mfgManifestEngine.ts, computeSHA256(), generateManufacturingManifestPackage(), projectStore.ts, useProjectStore] | lang=en
- "tests_schematicwire_test": "schematicWire.test.ts" | kind=code-symbol | source=src/__tests__/schematicWire.test.ts:L1 | neighbors=[31431d7 feat: complete cross-domain pro…, schematicGeometry.ts, getSymbolPinLayouts(), index.ts, BoardComponent, Project] | lang=en
- "types_index_firmwarestate": "FirmwareState" | kind=code-symbol | source=src/types/index.ts:L921 | neighbors=[firmwareCodegen.ts, FirmwareStudio.tsx, firmwareValidation.ts, projectStore.ts, projectStore.test.ts, index.ts] | lang=en
- "types_index_firmwaretransition": "FirmwareTransition" | kind=code-symbol | source=src/types/index.ts:L934 | neighbors=[firmwareCodegen.ts, FirmwareStudio.tsx, firmwareValidation.ts, projectStore.ts, projectStore.test.ts, index.ts] | lang=en
- "types_index_productarchitecturenode": "ProductArchitectureNode" | kind=code-symbol | source=src/types/index.ts:L842 | neighbors=[ProductArchitectureCanvas.tsx, productGraph.ts, ProductInspector.tsx, relations.ts, projectStore.ts, index.ts] | lang=en
- "types_index_productrequirement": "ProductRequirement" | kind=code-symbol | source=src/types/index.ts:L825 | neighbors=[productGraph.ts, ProductRequirementsPanel.tsx, relations.ts, projectStore.ts, index.ts, validationCoverage.ts] | lang=en
- "ui_badge_badge": "Badge()" | kind=code-symbol | source=src/ui/Badge.tsx:L7 | neighbors=[BlueprintDossier.tsx, BlueprintSheets.tsx, BoardStudio.tsx, ReadinessDashboard.tsx, TemplatePicker.tsx, Badge.tsx] | lang=en
- "ui_modal": "Modal.tsx" | kind=code-symbol | source=src/ui/Modal.tsx:L1 | neighbors=[0e8fa7a feat: complete local-first hard…, 46ca452 chore: rename package to hardwa…, ProjectManager.tsx, TemplatePicker.tsx, Modal(), ModalProps] | lang=en
- "visual_representationregistry_getvisualfamily": "getVisualFamily()" | kind=code-symbol | source=src/lib/visual/representationRegistry.ts:L376 | neighbors=[Sidebar.tsx, visualRepresentationRegistry.test.ts, DeviceVisual.tsx, RepresentationInspector.tsx, representationRegistry.ts, resolveVisualFamily()] | lang=en
- "board_boardgeometry_getcomponentpads": "getComponentPads()" | kind=code-symbol | source=src/components/board/boardGeometry.ts:L38 | neighbors=[BoardCanvas.tsx, boardGeometry.ts, getPadsForNet(), pcbRoutingEngine.ts, pcbRouting.test.ts] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@04f0f7b01576eba8bf0bcd1562607ad656deaeb0": "04f0f7b fix(blueprints): replace fake cards with engineering diagrams" | kind=Commit | source=git | neighbors=[BlueprintDrawingRenderer.tsx, master, 0e71062 Audit recovery: restore CI inte…, engineeringBlueprintDrawing.test.ts, ffa0c86 ci: persist UX lint diagnostics…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@0be3b86bc2b545bbd3ff36b2474e05e9db0c6ec4": "0be3b86 feat: complete local-bridge CLI and workspace operations" | kind=Commit | source=git | neighbors=[master, f97cd61 test: add comprehensive vitest …, bridgeServer.js, bridgeWorkspaceOps.test.ts, 8d973c4 feat: synchronize blueprints an…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@1eebb1499b60d8f5cf1f42eb76daa6bc3c2d91fc": "1eebb14 feat: implement MCP server live integration, proposals, and audit recor…" | kind=Commit | source=git | neighbors=[master, 78bd697 feat: generate multi-sheet blue…, mcpServer.ts, mcpProtocol.test.ts, a257b9a feat: implement branching, tagg…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@3bc81e01c31fb8bd2d124c2a8391be98bc23d1a0": "3bc81e0 fix: connect canonical serialization to project import and export" | kind=Commit | source=git | neighbors=[3011fe7 fix: remove simulated bridge MC…, master, e872235 refactor: implement reversible …, projectStore.ts, projectStoreSerialization.test.ts] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@3e73302d57a5748b2dac1d95084cdf4ffe1a3afc": "3e73302 Bind Blueprint Sheets SVG drawings dynamically to live workspace databa…" | kind=Commit | source=git | neighbors=[master, aa18a6c Upgrade Blueprint Sheets to Eng…, BlueprintSheets.tsx, ExportCenter.tsx, 42e7274 Implement printable/exportable …] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@4a5eb82b58771377afa25353dbd0e247c5ba0b43": "4a5eb82 feat: complete canonical cross-domain product graph" | kind=Commit | source=git | neighbors=[master, cfe236b feat: complete component repres…, graph.ts, queries.ts, e872235 refactor: implement reversible …] | lang=pt
- "commit:repo:github.com/Ankit6149/hardware-studio@50dbe19fd53a78f6ba25caa0128becb2353cc001": "50dbe19 refactor: implement pointer-correct reversible commands" | kind=Commit | source=git | neighbors=[master, e4883f9 feat: complete structured schem…, projectStore.ts, commandBus.test.ts, 6939a13 fix: preserve every V1 domain t…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@78bd697c7c3969efc369c696cc3c34ba0a42bf3a": "78bd697 feat: generate multi-sheet blueprint packs and release manifest package…" | kind=Commit | source=git | neighbors=[1eebb14 feat: implement MCP server live…, master, e20a167 feat: complete readiness engine…, nativeExports.ts, blueprintManufacturing.test.ts] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@78d58ff424e68bf5d10b7504894ae4e88dcccc84": "78d58ff feat: complete validation runs and retest history" | kind=Commit | source=git | neighbors=[519cc54 feat: integrate revisions branc…, master, 8d973c4 feat: synchronize blueprints an…, validationRuns.test.ts, index.ts] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\ANKIT BHARDWAJ\Desktop\hardware studio\.graphify\description-instructions\batch-006.json

Keep each description factual and concise (one sentence). No markdown, no prose
outside the JSON object. It is acceptable to omit a node if context is
insufficient — but include every node you can ground confidently.

Example answer format:
```json
{
  "node_id_1": "Resolves the configured ontology profile from graphify.yaml.",
  "node_id_2": "Colonel James Barclay, an antagonist in The Crooked Man."
}
```
