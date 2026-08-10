# Node Description Batch 2 of 28

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
Write every description in English (en). Do not switch languages.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "productgraph_queries": "queries.ts" | kind=code-symbol | source=src/core/productGraph/queries.ts:L1 | neighbors=[31431d7 feat: complete cross-domain pro…, 4a5eb82 feat: complete canonical cross-…, efd5072 docs: complete V1 completion au…, graph.ts, getArchitectureNodeRelations(), getBoardRelations()]
- "visual_devicevisual": "DeviceVisual.tsx" | kind=code-symbol | source=src/components/visual/DeviceVisual.tsx:L1 | neighbors=[74182b5 Build semantic Blueprint visual…, BlueprintCanvas.tsx, Sidebar.tsx, ArchitectureGlyph(), ArchitectureGlyphProps, commonStroke]
- "lib_blueprintsheettypes": "blueprintSheetTypes.ts" | kind=code-symbol | source=src/lib/blueprintSheetTypes.ts:L1 | neighbors=[BlueprintDrawingRenderer.tsx, BlueprintSheetRenderer.tsx, f8edf1c feat: Blueprint Generation Syst…, blueprintGenerator.ts, blueprintPackExport.ts, BlueprintCallout]
- "reliability_studioroot": "StudioRoot.tsx" | kind=code-symbol | source=src/components/reliability/StudioRoot.tsx:L1 | neighbors=[1d1ba8d Build connected device knowledg…, 8fac0da Build adaptive workflows and gu…, c020639 Add crash recovery and visible …, AppShell.tsx, FeedbackProvider.tsx, FeedbackProvider()]
- "schematic_schematiccanvas": "SchematicCanvas.tsx" | kind=code-symbol | source=src/components/schematic/SchematicCanvas.tsx:L1 | neighbors=[0c36fad feat: migrate schematic wires t…, 12bcbdd Unify workspace: Integrate Comp…, 20bb699 fix: clean up schematic wire re…, 31431d7 feat: complete cross-domain pro…, 356b610 Stabilize schematic and PCB rou…, 84415a2 fix(v1): complete truthful prod…]
- "studio_unifiedworkbenchadapters": "UnifiedWorkbenchAdapters.tsx" | kind=code-symbol | source=src/components/studio/UnifiedWorkbenchAdapters.tsx:L1 | neighbors=[ceaef7e Unify the Electronics to PCB an…, AppShell.tsx, BoardDesigner.tsx, BoardDesigner(), ComponentLibraryWorkbench.tsx, ComponentLibraryWorkbench()]
- "commit:repo:github.com/Ankit6149/hardware-studio@31431d7c8f889926828ad8bf21da9c55a37ec00c": "31431d7 feat: complete cross-domain product graph, 3D mechanical preview, local…" | kind=Commit | source=git | neighbors=[2a55e09 fix: preserve complete project …, master, 20bb699 fix: clean up schematic wire re…, FirmwareStudio.tsx, projectMigrations.ts, releaseEngine.ts]
- "commit:repo:github.com/Ankit6149/hardware-studio@c9e9d0cc8c80f6529231e0627c7cf30d48341050": "c9e9d0c fix(ci): repair dependency lock and strict TypeScript failures" | kind=Commit | source=git | neighbors=[7e58361 chore(repo): add project descri…, master, 174879d fix(ui): restore component typo…, ProjectManager.tsx, FirmwareCodePreview.tsx, FirmwareStateMachineCanvas.tsx]
- "components_templatepicker": "TemplatePicker.tsx" | kind=code-symbol | source=src/components/TemplatePicker.tsx:L1 | neighbors=[0e8fa7a feat: complete local-first hard…, TemplatePicker(), TemplatePickerProps, projectStore.ts, useProjectStore, index.ts]
- "lib_boarddrc": "boardDRC.ts" | kind=code-symbol | source=src/lib/boardDRC.ts:L1 | neighbors=[BoardDesigner.tsx, 356b610 Stabilize schematic and PCB rou…, 5341241 Build native PCB Board Designer…, boardGeometry.ts, componentsOverlap(), getOutlineBounds()]
- "local_bridge_bridgeserver": "bridgeServer.js" | kind=code-symbol | source=packages/local-bridge/bridgeServer.js:L1 | neighbors=[0be3b86 feat: complete local-bridge CLI…, 3011fe7 fix: remove simulated bridge MC…, 31431d7 feat: complete cross-domain pro…, 84415a2 fix(v1): complete truthful prod…, b349f30 feat: implement mandatory token…, consumeApprovalToken()]
- "store_storagehealthstore": "storageHealthStore.ts" | kind=code-symbol | source=src/store/storageHealthStore.ts:L1 | neighbors=[c020639 Add crash recovery and visible …, AppShell.tsx, ProjectManager.tsx, TopBar.tsx, StudioRoot.tsx, reliability.ts]
- "store_workflowpreferencesstore": "workflowPreferencesStore.ts" | kind=code-symbol | source=src/store/workflowPreferencesStore.ts:L1 | neighbors=[8fac0da Build adaptive workflows and gu…, AppShell.tsx, ProjectDashboard.tsx, Sidebar.tsx, StudioRoot.tsx, workflowProfiles.ts]
- "commit:repo:github.com/Ankit6149/hardware-studio@356b61040cc0444160665b82770f4683f7c90f70": "356b610 Stabilize schematic and PCB routing, multi-board DRC, live blueprint dr…" | kind=Commit | source=git | neighbors=[12bcbdd Unify workspace: Integrate Comp…, BoardCanvas.tsx, BoardComponentBin.tsx, boardGeometry.ts, BoardInspector.tsx, BoardLayerPanel.tsx]
- "commit:repo:github.com/Ankit6149/hardware-studio@5341241f653d45b5b24147ae8b64cbf2e0c4d889": "5341241 Build native PCB Board Designer experience with visual layout editor, l…" | kind=Commit | source=git | neighbors=[BoardCanvas.tsx, BoardComponentBin.tsx, BoardDesigner.tsx, BoardDRCPanel.tsx, boardGeometry.ts, BoardLayerPanel.tsx]
- "commit:repo:github.com/Ankit6149/hardware-studio@9c845304e398a6200412c7591984cfa21a7b837a": "9c84530 feat: implement interactive product visualizer, resolve hydration misma…" | kind=Commit | source=git | neighbors=[page.tsx, master, b7cf95f fix: resolve Next.js hydration …, AppShell.tsx, BlueprintCanvas.tsx, ExportCenter.tsx]
- "components_readinessdashboard": "ReadinessDashboard.tsx" | kind=code-symbol | source=src/components/ReadinessDashboard.tsx:L1 | neighbors=[0e8fa7a feat: complete local-first hard…, 266e502 Harden and align gating checks,…, 46ca452 chore: rename package to hardwa…, 51e7527 Upgrade: Complete Blueprint Edi…, 83dc107 Complete and integrate connecte…, e987b85 Upgrade Hardware Studio to V3: …]
- "lib_projectmigrations": "projectMigrations.ts" | kind=code-symbol | source=src/lib/projectMigrations.ts:L1 | neighbors=[12bcbdd Unify workspace: Integrate Comp…, 2a55e09 fix: preserve complete project …, 31431d7 feat: complete cross-domain pro…, 356b610 Stabilize schematic and PCB rou…, 931aeec fix: resolve ValidationTest typ…, ceaef7e Unify the Electronics to PCB an…]
- "lib_reliability": "reliability.ts" | kind=code-symbol | source=src/lib/reliability.ts:L1 | neighbors=[c020639 Add crash recovery and visible …, AppShell.tsx, TopBar.tsx, buildRedactedDiagnostics(), classifyStorageError(), DiagnosticContext]
- "lib_validationrunner": "validationRunner.ts" | kind=code-symbol | source=src/lib/validationRunner.ts:L1 | neighbors=[21c12a9 feat: implement real validation…, 84415a2 fix(v1): complete truthful prod…, c9e9d0c fix(ci): repair dependency lock…, e20a167 feat: complete readiness engine…, firmwareValidation.ts, validateStateMachine()]
- "mcp_server_mcpserver": "mcpServer.ts" | kind=code-symbol | source=packages/mcp-server/mcpServer.ts:L1 | neighbors=[1eebb14 feat: implement MCP server live…, 31431d7 feat: complete cross-domain pro…, 84415a2 fix(v1): complete truthful prod…, 9e2c2c6 feat: add real MCP server and s…, e20a167 feat: complete readiness engine…, efd5072 docs: complete V1 completion au…]
- "templates_index": "index.ts" | kind=code-symbol | source=src/data/templates/index.ts:L1 | neighbors=[0e8fa7a feat: complete local-first hard…, 67b9aff fix(brand): restore original lo…, TemplatePicker.tsx, projectStore.ts, bleButtonTemplate.ts, bleButtonTemplate]
- "components_blueprintsheets": "BlueprintSheets.tsx" | kind=code-symbol | source=src/components/BlueprintSheets.tsx:L1 | neighbors=[3e73302 Bind Blueprint Sheets SVG drawi…, 42e7274 Implement printable/exportable …, aa18a6c Upgrade Blueprint Sheets to Eng…, f8edf1c feat: Blueprint Generation Syst…, AppShell.tsx, BlueprintSheetRenderer.tsx]
- "lib_blueprintgenerator_generateblueprintpack": "generateBlueprintPack()" | kind=code-symbol | source=src/lib/blueprintGenerator.ts:L970 | neighbors=[blueprintGenerator.ts, generateAssemblySheet(), generateComponentPlacementSheet(), generateElectronicsArchSheet(), generateFirmwareArchSheet(), generateFirmwareStateMachineSheet()]
- "store_studiocontextstore": "studioContextStore.ts" | kind=code-symbol | source=src/store/studioContextStore.ts:L1 | neighbors=[BoardDesigner.tsx, ceaef7e Unify the Electronics to PCB an…, BoardStudio.tsx, UnifiedBoard3DView.tsx, UnifiedSchematicEditor.tsx, MechanicalWorkbenchMode]
- "tests_pcbrouting_test": "pcbRouting.test.ts" | kind=code-symbol | source=src/__tests__/pcbRouting.test.ts:L1 | neighbors=[5139586 feat: complete active-board pad…, 84415a2 fix(v1): complete truthful prod…, c9e9d0c fix(ci): repair dependency lock…, e20a167 feat: complete readiness engine…, efd5072 docs: complete V1 completion au…, fb367cf feat: complete strict active-bo…]
- "workflow_workflowsetupdialog": "WorkflowSetupDialog.tsx" | kind=code-symbol | source=src/components/workflow/WorkflowSetupDialog.tsx:L1 | neighbors=[8fac0da Build adaptive workflows and gu…, StudioRoot.tsx, navigationRegistry.ts, navigationDomains, workflowProfiles.ts, getWorkflowConnectionNotices()]
- "commit:repo:github.com/Ankit6149/hardware-studio@67b9aff9d625743460190de730198d703cdec695": "67b9aff fix(brand): restore original logo favicon and compact landing scale" | kind=Commit | source=git | neighbors=[0af0a13 ci: remove final legacy brandin…, layout.tsx, page.tsx, BlueprintPageLayout.tsx, master, 1e86240 chore(ci): remove temporary vis…]
- "commit:repo:github.com/Ankit6149/hardware-studio@c0206397e65f95fa6016e9c8e908b48570a0b3cc": "c020639 Add crash recovery and visible browser-storage health (#57)" | kind=Commit | source=git | neighbors=[0e71062 Audit recovery: restore CI inte…, BoardLayerPanel.tsx, master, e74ed91 placeholder, AppShell.tsx, ProjectManager.tsx]
- "lib_blueprintgenerator_sheetstatus": "sheetStatus()" | kind=code-symbol | source=src/lib/blueprintGenerator.ts:L36 | neighbors=[blueprintGenerator.ts, generateAssemblySheet(), generateComponentPlacementSheet(), generateElectronicsArchSheet(), generateFirmwareArchSheet(), generateFirmwareStateMachineSheet()]
- "lib_blueprintgenerator_tblid": "tblId()" | kind=code-symbol | source=src/lib/blueprintGenerator.ts:L30 | neighbors=[blueprintGenerator.ts, generateAssemblySheet(), generateComponentPlacementSheet(), generateElectronicsArchSheet(), generateFirmwareArchSheet(), generateFirmwareStateMachineSheet()]
- "studio_studiobuildmap": "StudioBuildMap.tsx" | kind=code-symbol | source=src/components/studio/StudioBuildMap.tsx:L1 | neighbors=[ceaef7e Unify the Electronics to PCB an…, AppShell.tsx, workflowProfiles.ts, getDomainIdForView(), WorkflowDomainId, projectStore.ts]
- "blueprints_mfgmanifestengine": "mfgManifestEngine.ts" | kind=code-symbol | source=src/lib/blueprints/mfgManifestEngine.ts:L1 | neighbors=[computeSHA256(), generateManufacturingManifestPackage(), ManufacturingFileManifest, ManufacturingManifestPackage, nativeExports.ts, exportBomCsv()]
- "commit:repo:github.com/Ankit6149/hardware-studio@266e5027551b6f19a27ea6a2763baa9ce57dbeee": "266e502 Harden and align gating checks, dashboard indicators, templates, and ex…" | kind=Commit | source=git | neighbors=[master, e987b85 Upgrade Hardware Studio to V3: …, ExportCenter.tsx, ProjectDashboard.tsx, ProjectManager.tsx, ReadinessDashboard.tsx]
- "commit:repo:github.com/Ankit6149/hardware-studio@46ca452e514d463beb603ff318197199060457fb": "46ca452 chore: rename package to hardware-studio, rewrite README, and resolve a…" | kind=Commit | source=git | neighbors=[0e8fa7a feat: complete local-first hard…, master, 1a539cf feat: implement concept bluepri…, AppShell.tsx, ExportCenter.tsx, PinMapTable.tsx]
- "commit:repo:github.com/Ankit6149/hardware-studio@aa18a6c8d48fb4cc9caa002de0b449d3aac6dd8f": "aa18a6c Upgrade Blueprint Sheets to Engineering Blueprint Pack v2 (16 sheets, d…" | kind=Commit | source=git | neighbors=[3e73302 Bind Blueprint Sheets SVG drawi…, BlueprintPageLayout.tsx, BlueprintTitleBlock.tsx, master, 51e7527 Upgrade: Complete Blueprint Edi…, BlueprintSheets.tsx]
- "commit:repo:github.com/Ankit6149/hardware-studio@ceaef7e189e80e8c7b59cb8ac27ee268fe864bfb": "ceaef7e Unify the Electronics to PCB and 3D Studio golden path (#65)" | kind=Commit | source=git | neighbors=[BoardDesigner.tsx, master, AppShell.tsx, projectMigrations.ts, UnifiedBoard3DView.tsx, UnifiedSchematicEditor.tsx]
- "commit:repo:github.com/Ankit6149/hardware-studio@e20a16702d8ece3d4971987ed5d2bcc74dacbe89": "e20a167 feat: complete readiness engine calculation and master hardware studio …" | kind=Commit | source=git | neighbors=[78bd697 feat: generate multi-sheet blue…, master, 6c063dc chore: final verification pass,…, validationRunner.ts, mcpServer.ts, mechanicalGeometry.ts]
- "commit:repo:github.com/Ankit6149/hardware-studio@efd5072df38474fe0b75bd489417fccf74af5c33": "efd5072 docs: complete V1 completion audit and release manifest" | kind=Commit | source=git | neighbors=[master, 927989c audit: replace false V1 signoff…, ProjectManager.tsx, releaseEngine.ts, mcpServer.ts, MechanicalStudio.tsx]
- "components_boardstudio": "BoardStudio.tsx" | kind=code-symbol | source=src/components/BoardStudio.tsx:L1 | neighbors=[0308eaa feat: integrate Board Studio & …, 6c063dc chore: final verification pass,…, 83dc107 Complete and integrate connecte…, AppShell.tsx, BoardStudio(), projectStore.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\ANKIT BHARDWAJ\Desktop\hardware studio\.graphify\description-instructions\batch-001.json

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
