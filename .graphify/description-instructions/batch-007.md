# Node Description Batch 8 of 28

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

- "commit:repo:github.com/Ankit6149/hardware-studio@9debb85e4099b39729846974d0715949312a0f6d": "9debb85 feat: synchronize persisted WebGL bodies and collision checks" | kind=Commit | source=git | neighbors=[353ec62 feat: complete mechanical geome…, master, fb2f623 feat: build persistent firmware…, mechanicalGeometry.ts, webgl3DView.test.ts] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@a257b9a0cf40c7c6c9a7e1dc64f8fbe36f7e533c": "a257b9a feat: implement branching, tagged revisions, release candidates, and fr…" | kind=Commit | source=git | neighbors=[21c12a9 feat: implement real validation…, master, 1eebb14 feat: implement MCP server live…, projectStore.ts, revisionsUI.test.ts] | lang=pt
- "commit:repo:github.com/Ankit6149/hardware-studio@d706e7c05567406619a25d73b2d90e5c26f41fa6": "d706e7c feat: add persistent firmware source workspace" | kind=Commit | source=git | neighbors=[329890b feat: synchronize PCB and mecha…, master, adc4f54 feat: add secure real PlatformI…, firmwareWorkspace.test.ts, index.ts] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@e4883f9d359557e297dbe91ef248c43877eede81": "e4883f9 feat: complete structured schematic connectivity" | kind=Commit | source=git | neighbors=[50dbe19 refactor: implement pointer-cor…, master, fb367cf feat: complete strict active-bo…, projectStore.ts, schematicWireAnchors.test.ts] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@e872235cc87afeac2af401a827490e1d05d390ea": "e872235 refactor: implement reversible engineering command bus" | kind=Commit | source=git | neighbors=[3bc81e0 fix: connect canonical serializ…, master, 4a5eb82 feat: complete canonical cross-…, commandBus.test.ts, index.ts] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@fb367cf963571c68686f670cf73fb168fa72a374": "fb367cf feat: complete strict active-board PCB routing" | kind=Commit | source=git | neighbors=[e4883f9 feat: complete structured schem…, master, 353ec62 feat: complete mechanical geome…, pcbRouting.test.ts, index.ts] | lang=en
- "components_componentsearch": "componentSearch.ts" | kind=code-symbol | source=src/lib/components/componentSearch.ts:L1 | neighbors=[12bcbdd Unify workspace: Integrate Comp…, componentLibrary.ts, defaultComponents, ElectronicComponentDefinition, searchComponents()] | lang=en
- "knowledge_deviceknowledge_resolveknowledgeidforcomponent": "resolveKnowledgeIdForComponent()" | kind=code-symbol | source=src/lib/knowledge/deviceKnowledge.ts:L167 | neighbors=[ComponentLibraryWorkbench.tsx, deviceKnowledge.ts, normalize(), KnowledgeProvider.tsx, deviceKnowledge.test.ts] | lang=en
- "lib_blueprintgenerator_generateelectronicsarchsheet": "generateElectronicsArchSheet()" | kind=code-symbol | source=src/lib/blueprintGenerator.ts:L229 | neighbors=[blueprintGenerator.ts, generateBlueprintPack(), sheetStatus(), tblId(), warnId()] | lang=en
- "lib_blueprintgenerator_generatefirmwarearchsheet": "generateFirmwareArchSheet()" | kind=code-symbol | source=src/lib/blueprintGenerator.ts:L698 | neighbors=[blueprintGenerator.ts, generateBlueprintPack(), sheetStatus(), tblId(), warnId()] | lang=en
- "lib_blueprintgenerator_generatefirmwarestatemachinesheet": "generateFirmwareStateMachineSheet()" | kind=code-symbol | source=src/lib/blueprintGenerator.ts:L735 | neighbors=[blueprintGenerator.ts, generateBlueprintPack(), sheetStatus(), tblId(), warnId()] | lang=en
- "lib_blueprintgenerator_generatemanufacturingsheet": "generateManufacturingSheet()" | kind=code-symbol | source=src/lib/blueprintGenerator.ts:L865 | neighbors=[blueprintGenerator.ts, generateBlueprintPack(), sheetStatus(), tblId(), warnId()] | lang=en
- "lib_blueprintgenerator_generatemechanicalsheet": "generateMechanicalSheet()" | kind=code-symbol | source=src/lib/blueprintGenerator.ts:L143 | neighbors=[blueprintGenerator.ts, generateBlueprintPack(), sheetStatus(), tblId(), warnId()] | lang=en
- "lib_blueprintgenerator_generateproductarchitecturesheet": "generateProductArchitectureSheet()" | kind=code-symbol | source=src/lib/blueprintGenerator.ts:L45 | neighbors=[blueprintGenerator.ts, generateBlueprintPack(), sheetStatus(), tblId(), warnId()] | lang=en
- "lib_blueprintgenerator_generatereadinesssheet": "generateReadinessSheet()" | kind=code-symbol | source=src/lib/blueprintGenerator.ts:L911 | neighbors=[blueprintGenerator.ts, generateBlueprintPack(), sheetStatus(), tblId(), warnId()] | lang=en
- "lib_blueprintgenerator_generatetestingsheet": "generateTestingSheet()" | kind=code-symbol | source=src/lib/blueprintGenerator.ts:L819 | neighbors=[blueprintGenerator.ts, generateBlueprintPack(), sheetStatus(), tblId(), warnId()] | lang=en
- "lib_exportblueprintsheets_exportblueprintsheetsjson": "exportBlueprintSheetsJson()" | kind=code-symbol | source=src/lib/exportBlueprintSheets.ts:L15 | neighbors=[ExportCenter.tsx, exportBlueprintSheets.ts, totalAvgCurrent(), blueprintManufacturing.test.ts, hardwareStudioV1Integration.test.ts] | lang=en
- "lib_nativeexports_generatenativeboardlayoutjson": "generateNativeBoardLayoutJson()" | kind=code-symbol | source=src/lib/nativeExports.ts:L745 | neighbors=[ExportCenter.tsx, FactoryPackageBuilder.tsx, nativeExports.ts, exportHardwareStudioBoardJson(), getPlacedComponents()] | lang=en
- "lib_nativeexports_generatenativegerbercopperbottom": "generateNativeGerberCopperBottom()" | kind=code-symbol | source=src/lib/nativeExports.ts:L361 | neighbors=[mfgManifestEngine.ts, ExportCenter.tsx, FactoryPackageBuilder.tsx, nativeExports.ts, getPlacedComponents()] | lang=en
- "lib_navigationregistry_getnavigationitem": "getNavigationItem()" | kind=code-symbol | source=src/lib/navigationRegistry.ts:L231 | neighbors=[AppShell.tsx, Sidebar.tsx, navigationRegistry.ts, workflowProfiles.ts, navigationRegistry.test.ts] | lang=en
- "lib_workflowprofiles_getdomainidforview": "getDomainIdForView()" | kind=code-symbol | source=src/lib/workflowProfiles.ts:L206 | neighbors=[AppShell.tsx, workflowProfiles.ts, getVisibleNavigationDomains(), EngineeringContextBar.tsx, StudioBuildMap.tsx] | lang=en
- "lib_workflowprofiles_getworkflowprofile": "getWorkflowProfile()" | kind=code-symbol | source=src/lib/workflowProfiles.ts:L148 | neighbors=[ProjectDashboard.tsx, Sidebar.tsx, workflowProfiles.ts, createPreferenceFromProfile(), WorkflowSetupDialog.tsx] | lang=en
- "lib_workflowprofiles_inferprofileid": "inferProfileId()" | kind=code-symbol | source=src/lib/workflowProfiles.ts:L166 | neighbors=[workflowProfiles.ts, normalizeWorkflowPreference(), workflowPreferencesStore.ts, workflowProfiles.test.ts, WorkflowSetupDialog.tsx] | lang=en
- "local_bridge_bridgeserver_createserver": "createServer()" | kind=code-symbol | source=packages/local-bridge/bridgeServer.js:L63 | neighbors=[bridgeServer.js, bridgeSecurity.test.ts, bridgeWorkspaceOps.test.ts, localBridge.test.ts, localBridgeSecurity.test.ts] | lang=en
- "mcp_server_mcpserverstdio": "mcpServerStdio.ts" | kind=code-symbol | source=packages/mcp-server/mcpServerStdio.ts:L1 | neighbors=[9e2c2c6 feat: add real MCP server and s…, mcpServer.ts, HardwareStudioMCPServer, createStdioMCPServer(), mcpProtocol.test.ts] | lang=en
- "store_storagehealthstore_preparestoragereliability": "prepareStorageReliability()" | kind=code-symbol | source=src/store/storageHealthStore.ts:L55 | neighbors=[StudioRoot.tsx, storageHealthStore.ts, isTrackedLocalStorage(), latestSavedAt(), setHealth()] | lang=en
- "studio_page": "page.tsx" | kind=code-symbol | source=src/app/studio/page.tsx:L1 | neighbors=[523a787 feat(site): move development wo…, c020639 Add crash recovery and visible …, StudioRoot.tsx, StudioPage(), StudioRoot] | lang=en
- "templates_blebuttontemplate": "bleButtonTemplate.ts" | kind=code-symbol | source=src/data/templates/bleButtonTemplate.ts:L1 | neighbors=[0e8fa7a feat: complete local-first hard…, bleButtonTemplate, index.ts, Project, index.ts] | lang=en
- "templates_emptytemplate": "emptyTemplate.ts" | kind=code-symbol | source=src/data/templates/emptyTemplate.ts:L1 | neighbors=[0e8fa7a feat: complete local-first hard…, emptyTemplate, index.ts, Project, index.ts] | lang=en
- "templates_genericwearabletemplate": "genericWearableTemplate.ts" | kind=code-symbol | source=src/data/templates/genericWearableTemplate.ts:L1 | neighbors=[0e8fa7a feat: complete local-first hard…, genericWearableTemplate, index.ts, Project, index.ts] | lang=en
- "templates_iotsensortemplate": "iotSensorTemplate.ts" | kind=code-symbol | source=src/data/templates/iotSensorTemplate.ts:L1 | neighbors=[0e8fa7a feat: complete local-first hard…, index.ts, iotSensorTemplate, index.ts, Project] | lang=en
- "tests_commandbus_test": "commandBus.test.ts" | kind=code-symbol | source=src/__tests__/commandBus.test.ts:L1 | neighbors=[50dbe19 refactor: implement pointer-cor…, e872235 refactor: implement reversible …, efd5072 docs: complete V1 completion au…, projectStore.ts, useProjectStore] | lang=en
- "tests_engineeringblueprintdrawing_test": "engineeringBlueprintDrawing.test.ts" | kind=code-symbol | source=src/__tests__/engineeringBlueprintDrawing.test.ts:L1 | neighbors=[04f0f7b fix(blueprints): replace fake c…, BlueprintDrawingRenderer.tsx, createEngineeringLayout(), blueprintSheetTypes.ts, BlueprintDrawing] | lang=en
- "tests_localbridge_test": "localBridge.test.ts" | kind=code-symbol | source=src/__tests__/localBridge.test.ts:L1 | neighbors=[3011fe7 fix: remove simulated bridge MC…, 31431d7 feat: complete cross-domain pro…, e20a167 feat: complete readiness engine…, bridgeServer.js, createServer()] | lang=en
- "tests_mechanical3dsync_test": "mechanical3DSync.test.ts" | kind=code-symbol | source=src/__tests__/mechanical3DSync.test.ts:L1 | neighbors=[84415a2 fix(v1): complete truthful prod…, mechanicalGeometry.ts, checkMechanicalInterference(), projectStore.ts, useProjectStore] | lang=en
- "tests_productgraph_test": "productGraph.test.ts" | kind=code-symbol | source=src/__tests__/productGraph.test.ts:L1 | neighbors=[31431d7 feat: complete cross-domain pro…, graph.ts, ProductGraphEngine, index.ts, Project] | lang=en
- "tests_readinessengine_test": "readinessEngine.test.ts" | kind=code-symbol | source=src/__tests__/readinessEngine.test.ts:L1 | neighbors=[84415a2 fix(v1): complete truthful prod…, readinessScore.ts, calculateReadinessScore(), projectStore.ts, useProjectStore] | lang=en
- "tests_validationexecution_test": "validationExecution.test.ts" | kind=code-symbol | source=src/__tests__/validationExecution.test.ts:L1 | neighbors=[84415a2 fix(v1): complete truthful prod…, validationRunner.ts, runValidationTest(), projectStore.ts, useProjectStore] | lang=en
- "types_index_bomitem": "BOMItem" | kind=code-symbol | source=src/types/index.ts:L38 | neighbors=[exportMarkdown.ts, projectStore.ts, UnifiedBOMWorkbench.tsx, unifiedGoldenPath.integration.test.ts, index.ts] | lang=en
- "types_index_customnode": "CustomNode" | kind=code-symbol | source=src/types/index.ts:L31 | neighbors=[BlueprintCanvas.tsx, exportMarkdown.ts, validationRules.ts, projectStore.ts, index.ts] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\ANKIT BHARDWAJ\Desktop\hardware studio\.graphify\description-instructions\batch-007.json

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
