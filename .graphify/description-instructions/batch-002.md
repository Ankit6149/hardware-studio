# Node Description Batch 3 of 28

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

- "lib_blueprintgenerator_warnid": "warnId()" | kind=code-symbol | source=src/lib/blueprintGenerator.ts:L26 | neighbors=[blueprintGenerator.ts, generateAssemblySheet(), generateComponentPlacementSheet(), generateElectronicsArchSheet(), generateFirmwareArchSheet(), generateFirmwareStateMachineSheet()]
- "lib_exportmarkdown": "exportMarkdown.ts" | kind=code-symbol | source=src/lib/exportMarkdown.ts:L1 | neighbors=[0e8fa7a feat: complete local-first hard…, 266e502 Harden and align gating checks,…, 46ca452 chore: rename package to hardwa…, 67b9aff fix(brand): restore original lo…, 9c84530 feat: implement interactive pro…, ExportCenter.tsx]
- "product_productstudio": "ProductStudio.tsx" | kind=code-symbol | source=src/components/product/ProductStudio.tsx:L1 | neighbors=[17918b0 feat: complete interactive engi…, 931aeec fix: resolve ValidationTest typ…, AppShell.tsx, ProductArchitectureCanvas.tsx, ProductArchitectureCanvas(), productGraph.ts]
- "revisions_revisionsstudio": "RevisionsStudio.tsx" | kind=code-symbol | source=src/components/revisions/RevisionsStudio.tsx:L1 | neighbors=[519cc54 feat: integrate revisions branc…, c020639 Add crash recovery and visible …, efd5072 docs: complete V1 completion au…, AppShell.tsx, FeedbackProvider.tsx, useFeedback()]
- "schematic_unifiedschematiceditor": "UnifiedSchematicEditor.tsx" | kind=code-symbol | source=src/components/schematic/UnifiedSchematicEditor.tsx:L1 | neighbors=[ceaef7e Unify the Electronics to PCB an…, schematicERC.ts, runSchematicERC(), SchematicCanvas.tsx, SchematicCanvas(), schematicInteraction.ts]
- "app_page": "page.tsx" | kind=code-symbol | source=src/app/page.tsx:L1 | neighbors=[foundations, GraphNode(), Home(), notReady, principles, StatusCard()]
- "board_boardinspector": "BoardInspector.tsx" | kind=code-symbol | source=src/components/board/BoardInspector.tsx:L1 | neighbors=[BoardDesigner.tsx, BoardInspector(), BoardObjectInspectorProps, EditField(), Field(), NoSelection()]
- "board_boardlayerpanel": "BoardLayerPanel.tsx" | kind=code-symbol | source=src/components/board/BoardLayerPanel.tsx:L1 | neighbors=[BoardDesigner.tsx, boardInteraction.ts, BoardDesignerUIState, BoardLayerPanel(), BoardLayerPanelProps, LAYER_DEFS]
- "commit:repo:github.com/Ankit6149/hardware-studio@931aeec295a1040e96cb9f7061085afa76b7a356": "931aeec fix: resolve ValidationTest type conflicts and add vertical engineering…" | kind=Commit | source=git | neighbors=[master, 17918b0 feat: complete interactive engi…, AppShell.tsx, ProjectDashboard.tsx, Sidebar.tsx, FirmwareStudio.tsx]
- "components_blueprintdossier": "BlueprintDossier.tsx" | kind=code-symbol | source=src/components/BlueprintDossier.tsx:L1 | neighbors=[0308eaa feat: integrate Board Studio & …, 1a539cf feat: implement concept bluepri…, 67b9aff fix(brand): restore original lo…, BlueprintDossier(), exportDossier.ts, exportBlueprintDossierJson()]
- "feedback_feedbackstate": "feedbackState.ts" | kind=code-symbol | source=src/lib/feedback/feedbackState.ts:L1 | neighbors=[c020639 Add crash recovery and visible …, FeedbackProvider.tsx, ConfirmDecision, DecisionBase, DecisionRequest, FeedbackAction]
- "knowledge_knowledgedrawer": "KnowledgeDrawer.tsx" | kind=code-symbol | source=src/components/knowledge/KnowledgeDrawer.tsx:L1 | neighbors=[1d1ba8d Build connected device knowledg…, deviceKnowledge.ts, DEVICE_KNOWLEDGE_CATEGORIES, DeviceKnowledgeCategory, searchKnowledgeEntries(), DetailSection()]
- "knowledge_knowledgeprovider": "KnowledgeProvider.tsx" | kind=code-symbol | source=src/components/knowledge/KnowledgeProvider.tsx:L1 | neighbors=[1d1ba8d Build connected device knowledg…, ComponentLibraryWorkbench.tsx, TopBar.tsx, componentLibrary.ts, ElectronicComponentDefinition, deviceKnowledge.ts]
- "lib_footprints": "footprints.ts" | kind=code-symbol | source=src/lib/footprints.ts:L1 | neighbors=[BoardCanvas.tsx, BoardComponentBin.tsx, boardGeometry.ts, BoardInspector.tsx, c02c688 V4: Implement Factory Package B…, c948130 V5 Release Candidate: Clean up …]
- "product_productarchitecturecanvas": "ProductArchitectureCanvas.tsx" | kind=code-symbol | source=src/components/product/ProductArchitectureCanvas.tsx:L1 | neighbors=[17918b0 feat: complete interactive engi…, 84415a2 fix(v1): complete truthful prod…, c9e9d0c fix(ci): repair dependency lock…, ArchitectureBlockNode(), CATEGORY_COLORS, CONNECTION_TYPE_COLORS]
- "productgraph_graph_productgraphengine": "ProductGraphEngine" | kind=code-symbol | source=src/core/productGraph/graph.ts:L19 | neighbors=[graph.ts, .constructor(), .getArchitectureNodeRelations(), .getBoardRelations(), .getComponentLinks(), .getConsumersOfNet()]
- "tests_workflowprofiles_test": "workflowProfiles.test.ts" | kind=code-symbol | source=src/__tests__/workflowProfiles.test.ts:L1 | neighbors=[8fac0da Build adaptive workflows and gu…, navigationRegistry.ts, navigationDomains, workflowProfiles.ts, createPreferenceFromProfile(), deriveGuidedWorkflowActions()]
- "visual_lightweight3dpreview": "Lightweight3DPreview.tsx" | kind=code-symbol | source=src/components/visual/Lightweight3DPreview.tsx:L1 | neighbors=[74182b5 Build semantic Blueprint visual…, DeviceVisual.tsx, addBox(), addCylinder(), addPins(), buildFamilyModel()]
- "board_boardinteraction": "boardInteraction.ts" | kind=code-symbol | source=src/components/board/boardInteraction.ts:L1 | neighbors=[BoardCanvas.tsx, BoardComponentBin.tsx, BoardDesigner.tsx, BoardDRCPanel.tsx, BoardInspector.tsx, BoardDesignerUIState]
- "commit:repo:github.com/Ankit6149/hardware-studio@0cae633859a45c53dbae328420bc9523ce6f862a": "0cae633 Refactor PCB board designer files to use new states and components" | kind=Commit | source=git | neighbors=[BoardCanvas.tsx, BoardComponentBin.tsx, BoardDesigner.tsx, BoardDRCPanel.tsx, BoardInspector.tsx, boardInteraction.ts]
- "commit:repo:github.com/Ankit6149/hardware-studio@12bcbdd21767dafd54bd06e054a86f398b3a474a": "12bcbdd Unify workspace: Integrate Component Library, Schematic Editor, live ER…" | kind=Commit | source=git | neighbors=[0cae633 Refactor PCB board designer fil…, master, 356b610 Stabilize schematic and PCB rou…, AppShell.tsx, componentLibrary.ts, componentSearch.ts]
- "commit:repo:github.com/Ankit6149/hardware-studio@c02c68840d9a3d71ad8261a9123d9b388934f4fb": "c02c688 V4: Implement Factory Package Builder, Footprints Library, Hardened Des…" | kind=Commit | source=git | neighbors=[master, c948130 V5 Release Candidate: Clean up …, AppShell.tsx, ExportCenter.tsx, FactoryPackageBuilder.tsx, Sidebar.tsx]
- "lib_exportblueprintsheets": "exportBlueprintSheets.ts" | kind=code-symbol | source=src/lib/exportBlueprintSheets.ts:L1 | neighbors=[266e502 Harden and align gating checks,…, 42e7274 Implement printable/exportable …, aa18a6c Upgrade Blueprint Sheets to Eng…, ExportCenter.tsx, exportBlueprintSheetsHtml(), exportBlueprintSheetsJson()]
- "mechanical_mechanicalinspector": "MechanicalInspector.tsx" | kind=code-symbol | source=src/components/mechanical/MechanicalInspector.tsx:L1 | neighbors=[17918b0 feat: complete interactive engi…, 84415a2 fix(v1): complete truthful prod…, c9e9d0c fix(ci): repair dependency lock…, mechanicalGeometry.ts, applyLightweightConstraint(), inputStyle]
- "tests_mechanicalgeometry_test": "mechanicalGeometry.test.ts" | kind=code-symbol | source=src/__tests__/mechanicalGeometry.test.ts:L1 | neighbors=[353ec62 feat: complete mechanical geome…, 56d64a6 feat: complete 2D mechanical ge…, 84415a2 fix(v1): complete truthful prod…, efd5072 docs: complete V1 completion au…, mechanicalGeometry.ts, applyLightweightConstraint()]
- "types_index_boardcomponent": "BoardComponent" | kind=code-symbol | source=src/types/index.ts:L173 | neighbors=[boardGeometry.ts, BoardStudio.tsx, editorLayoutGenerators.ts, projectMigrations.ts, pcbRoutingEngine.ts, queries.ts]
- "ui_button": "Button.tsx" | kind=code-symbol | source=src/ui/Button.tsx:L1 | neighbors=[0e8fa7a feat: complete local-first hard…, BlueprintDossier.tsx, BlueprintSheets.tsx, BoardStudio.tsx, FactoryPackageBuilder.tsx, PCBConstraints.tsx]
- "commit:repo:github.com/Ankit6149/hardware-studio@e987b85eef900a6952dd52838800ad429c2f662d": "e987b85 Upgrade Hardware Studio to V3: 10-gates readiness review, premium app h…" | kind=Commit | source=git | neighbors=[266e502 Harden and align gating checks,…, master, c02c688 V4: Implement Factory Package B…, ExportCenter.tsx, ProjectDashboard.tsx, ReadinessDashboard.tsx]
- "components_componentlibrary": "componentLibrary.ts" | kind=code-symbol | source=src/lib/components/componentLibrary.ts:L1 | neighbors=[12bcbdd Unify workspace: Integrate Comp…, ComponentLibraryWorkbench.tsx, ComponentPinDefinition, defaultComponents, ElectronicComponentDefinition, componentSearch.ts]
- "lib_exportfirmware": "exportFirmware.ts" | kind=code-symbol | source=src/lib/exportFirmware.ts:L1 | neighbors=[0e8fa7a feat: complete local-first hard…, 46ca452 chore: rename package to hardwa…, c9e9d0c fix(ci): repair dependency lock…, fb2f623 feat: build persistent firmware…, ExportCenter.tsx, FirmwareCodePreview.tsx]
- "lib_projectserialization": "projectSerialization.ts" | kind=code-symbol | source=src/lib/projectSerialization.ts:L1 | neighbors=[2a55e09 fix: preserve complete project …, 6939a13 fix: preserve every V1 domain t…, projectMigrations.ts, migrateProjectSchema(), deserializeProject(), migrateProjectSchema()]
- "mechanical_mechanicalcanvas": "MechanicalCanvas.tsx" | kind=code-symbol | source=src/components/mechanical/MechanicalCanvas.tsx:L1 | neighbors=[17918b0 feat: complete interactive engi…, 2a55e09 fix: preserve complete project …, 84415a2 fix(v1): complete truthful prod…, MechanicalCanvas(), MechanicalCanvasProps, ToolMode]
- "product_productgraph": "productGraph.ts" | kind=code-symbol | source=src/lib/product/productGraph.ts:L1 | neighbors=[17918b0 feat: complete interactive engi…, ArchitectureValidationIssue, findDisconnectedNodes(), findPowerBlocksWithoutPowerConnection(), findProcessingBlocksWithoutInput(), findRequirementsWithoutLinks()]
- "productgraph_relations": "relations.ts" | kind=code-symbol | source=src/core/productGraph/relations.ts:L1 | neighbors=[31431d7 feat: complete cross-domain pro…, graph.ts, queries.ts, ComponentDomainLinks, ImpactAnalysis, index.ts]
- "store_studiocontextstore_usestudiocontextstore": "useStudioContextStore" | kind=code-symbol | source=src/store/studioContextStore.ts:L40 | neighbors=[BoardDesigner.tsx, BoardStudio.tsx, UnifiedBoard3DView.tsx, UnifiedSchematicEditor.tsx, studioContextStore.ts, EngineeringContextBar.tsx]
- "templates_theringtemplate": "theRingTemplate.ts" | kind=code-symbol | source=src/data/templates/theRingTemplate.ts:L1 | neighbors=[0e8fa7a feat: complete local-first hard…, 5341241 Build native PCB Board Designer…, 67b9aff fix(brand): restore original lo…, 83dc107 Complete and integrate connecte…, 9c84530 feat: implement interactive pro…, b7cf95f fix: resolve Next.js hydration …]
- "tests_blueprintmanufacturing_test": "blueprintManufacturing.test.ts" | kind=code-symbol | source=src/__tests__/blueprintManufacturing.test.ts:L1 | neighbors=[78bd697 feat: generate multi-sheet blue…, 84415a2 fix(v1): complete truthful prod…, 8d973c4 feat: synchronize blueprints an…, exportBlueprintSheets.ts, exportBlueprintSheetsJson(), nativeExports.ts]
- "board_boardcomponentbin": "BoardComponentBin.tsx" | kind=code-symbol | source=src/components/board/BoardComponentBin.tsx:L1 | neighbors=[BoardComponentBin(), BoardComponentBinProps, boardInteraction.ts, BoardDesignerUIState, footprints.ts, getFootprint()]
- "board_boarddrcpanel": "BoardDRCPanel.tsx" | kind=code-symbol | source=src/components/board/BoardDRCPanel.tsx:L1 | neighbors=[BoardDesigner.tsx, BoardDRCPanel(), BoardDRCPanelProps, severityColor, severityIcon, severityOrder]
- "commit:repo:github.com/Ankit6149/hardware-studio@0308eaac48c52d77808b034981c3d6cb12d73a1c": "0308eaa feat: integrate Board Studio & ECAD Prep module components and dossier …" | kind=Commit | source=git | neighbors=[master, 83dc107 Complete and integrate connecte…, AppShell.tsx, BlueprintDossier.tsx, BoardStudio.tsx, PCBConstraints.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\ANKIT BHARDWAJ\Desktop\hardware studio\.graphify\description-instructions\batch-002.json

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
