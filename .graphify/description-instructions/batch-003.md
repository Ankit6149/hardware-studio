# Node Description Batch 4 of 28

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

- "commit:repo:github.com/Ankit6149/hardware-studio@1d1ba8de77d9043503be68ccce54a3082608450c": "1d1ba8d Build connected device knowledge and component workflow (#58)" | kind=Commit | source=git | neighbors=[master, 0fe0d5b docs: start visual representati…, ComponentLibraryWorkbench.tsx, AppShell.tsx, TopBar.tsx, deviceKnowledge.ts] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@51e7527b6afa219598a3a2ea8c31c93409185bea": "51e7527 Upgrade: Complete Blueprint Editor implementation with 12 drafting mode…" | kind=Commit | source=git | neighbors=[master, 266e502 Harden and align gating checks,…, AppShell.tsx, ExportCenter.tsx, ProjectDashboard.tsx, ReadinessDashboard.tsx] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@83dc107e34360222c7fdba8f5ca40f6925692326": "83dc107 Complete and integrate connected offline-first hardware planning worksp…" | kind=Commit | source=git | neighbors=[0308eaa feat: integrate Board Studio & …, master, f778e84 Correct Touch Input circuitType…, AppShell.tsx, BoardStudio.tsx, ExportCenter.tsx] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@f8edf1c1cb1a9003eb5851cddde629c17b18cb1d": "f8edf1c feat: Blueprint Generation System - 16-sheet pack from live project data" | kind=Commit | source=git | neighbors=[bb27ce0 Fix visual styling theme mismat…, BlueprintDrawingRenderer.tsx, BlueprintSheetRenderer.tsx, master, a2a6010 fix: resolve duplicate keys in …, BlueprintSheets.tsx] | lang=en
- "components_pinmaptable": "PinMapTable.tsx" | kind=code-symbol | source=src/components/PinMapTable.tsx:L1 | neighbors=[0e8fa7a feat: complete local-first hard…, 46ca452 chore: rename package to hardwa…, AppShell.tsx, PinMapTable(), exportCsv.ts, exportToCSV()] | lang=en
- "components_powerbudgettable": "PowerBudgetTable.tsx" | kind=code-symbol | source=src/components/PowerBudgetTable.tsx:L1 | neighbors=[0e8fa7a feat: complete local-first hard…, 46ca452 chore: rename package to hardwa…, AppShell.tsx, PowerBudgetTable(), exportCsv.ts, exportToCSV()] | lang=en
- "lib_exportdossier": "exportDossier.ts" | kind=code-symbol | source=src/lib/exportDossier.ts:L1 | neighbors=[0308eaa feat: integrate Board Studio & …, 1a539cf feat: implement concept bluepri…, 67b9aff fix(brand): restore original lo…, BlueprintDossier.tsx, ExportCenter.tsx, escapeMarkdown()] | lang=en
- "mechanical_unifiedboard3dview": "UnifiedBoard3DView.tsx" | kind=code-symbol | source=src/components/mechanical/UnifiedBoard3DView.tsx:L1 | neighbors=[ceaef7e Unify the Electronics to PCB an…, MechanicalStudio.tsx, Board3DQuality, disposeObject(), outlineSize(), pixelRatioByQuality] | lang=en
- "studio_unifiedboarddrcworkbench": "UnifiedBoardDRCWorkbench.tsx" | kind=code-symbol | source=src/components/studio/UnifiedBoardDRCWorkbench.tsx:L1 | neighbors=[ceaef7e Unify the Electronics to PCB an…, AppShell.tsx, boardDRC.ts, runBoardDRC(), projectStore.ts, useProjectStore] | lang=en
- "ui_button_button": "Button()" | kind=code-symbol | source=src/ui/Button.tsx:L9 | neighbors=[BlueprintDossier.tsx, BlueprintSheets.tsx, BoardStudio.tsx, FactoryPackageBuilder.tsx, PCBConstraints.tsx, PinMapTable.tsx] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@2a55e09b284d2e2591497a7771c4b797cde235c5": "2a55e09 fix: preserve complete project graph across serialization" | kind=Commit | source=git | neighbors=[17918b0 feat: complete interactive engi…, master, 31431d7 feat: complete cross-domain pro…, AppShell.tsx, Sidebar.tsx, FirmwareStudio.tsx] | lang=pt
- "commit:repo:github.com/Ankit6149/hardware-studio@6c063dcb8637837ef1fb00c303a6503eadce5de2": "6c063dc chore: final verification pass, V1 execution ledger completion, and bui…" | kind=Commit | source=git | neighbors=[BoardInspector.tsx, master, 59e0d22 audit: reset unsupported V1 pas…, BoardStudio.tsx, blueprintGenerator.ts, designReview.ts] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@8fac0da110462c86f6f67216294749f93fe34a33": "8fac0da Build adaptive workflows and guided project navigation (#63)" | kind=Commit | source=git | neighbors=[74182b5 Build semantic Blueprint visual…, master, e6676b2 docs: record Studio unification…, AppShell.tsx, ProjectDashboard.tsx, Sidebar.tsx] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@c948130adff6dea4fc7e490160ac49a572828c3c": "c948130 V5 Release Candidate: Clean up ESLint warnings, fix navigation, improve…" | kind=Commit | source=git | neighbors=[c02c688 V4: Implement Factory Package B…, master, bb27ce0 Fix visual styling theme mismat…, ExportCenter.tsx, FactoryPackageBuilder.tsx, ProjectDashboard.tsx] | lang=en
- "firmware_firmwarecodepreview": "FirmwareCodePreview.tsx" | kind=code-symbol | source=src/components/firmware/FirmwareCodePreview.tsx:L1 | neighbors=[17918b0 feat: complete interactive engi…, c9e9d0c fix(ci): repair dependency lock…, fb2f623 feat: build persistent firmware…, FirmwareCodePreview(), exportFirmware.ts, generateFirmwareWorkspace()] | lang=en
- "firmware_firmwarestatemachinecanvas": "FirmwareStateMachineCanvas.tsx" | kind=code-symbol | source=src/components/firmware/FirmwareStateMachineCanvas.tsx:L1 | neighbors=[17918b0 feat: complete interactive engi…, 84415a2 fix(v1): complete truthful prod…, c9e9d0c fix(ci): repair dependency lock…, FirmwareStateMachineCanvas(), FirmwareStateNode(), nodeTypes] | lang=en
- "firmware_firmwarevalidation": "firmwareValidation.ts" | kind=code-symbol | source=src/lib/firmware/firmwareValidation.ts:L1 | neighbors=[17918b0 feat: complete interactive engi…, firmwareCodegen.ts, FirmwareStudio.tsx, FirmwareValidationIssue, sanitizeCIdentifier(), validateStateMachine()] | lang=en
- "knowledge_starterdeviceknowledge": "starterDeviceKnowledge.ts" | kind=code-symbol | source=src/lib/knowledge/starterDeviceKnowledge.ts:L1 | neighbors=[1d1ba8d Build connected device knowledg…, KnowledgeDrawer.tsx, deviceKnowledge.ts, DeviceKnowledgeEntry, KnowledgeProvenance, ARDUINO_LEARNING_REFERENCE] | lang=en
- "lib_blueprintpackexport": "blueprintPackExport.ts" | kind=code-symbol | source=src/lib/blueprintPackExport.ts:L1 | neighbors=[f8edf1c feat: Blueprint Generation Syst…, BlueprintSheets.tsx, ExportCenter.tsx, exportBlueprintPackHtml(), exportBlueprintPackJson(), exportBlueprintPackMarkdown()] | lang=en
- "lib_designreview": "designReview.ts" | kind=code-symbol | source=src/lib/designReview.ts:L1 | neighbors=[6c063dc chore: final verification pass,…, c02c688 V4: Implement Factory Package B…, c948130 V5 Release Candidate: Clean up …, e987b85 Upgrade Hardware Studio to V3: …, blueprintGenerator.ts, runDesignReview()] | lang=en
- "lib_exportboardplan": "exportBoardPlan.ts" | kind=code-symbol | source=src/lib/exportBoardPlan.ts:L1 | neighbors=[0308eaa feat: integrate Board Studio & …, escapeCsv(), escapeMarkdown(), exportBoardComponentsCsv(), exportBoardPlanJson(), exportBoardPlanMarkdown()] | lang=en
- "mcp_server_mcpserver_hardwarestudiomcpserver": "HardwareStudioMCPServer" | kind=code-symbol | source=packages/mcp-server/mcpServer.ts:L8 | neighbors=[mcpServer.ts, .callTool(), .constructor(), .getProject(), .getResource(), .recordAudit()] | lang=en
- "product_productinspector": "ProductInspector.tsx" | kind=code-symbol | source=src/components/product/ProductInspector.tsx:L1 | neighbors=[17918b0 feat: complete interactive engi…, inputStyle, labelStyle, ProductInspector(), Props, projectStore.ts] | lang=en
- "reliability_apperrorboundary": "AppErrorBoundary.tsx" | kind=code-symbol | source=src/components/reliability/AppErrorBoundary.tsx:L1 | neighbors=[c020639 Add crash recovery and visible …, reliability.ts, buildRedactedDiagnostics(), AppErrorBoundary, AppErrorBoundaryProps, AppErrorBoundaryState] | lang=en
- "tests_releasebranching_test": "releaseBranching.test.ts" | kind=code-symbol | source=src/__tests__/releaseBranching.test.ts:L1 | neighbors=[84415a2 fix(v1): complete truthful prod…, releaseEngine.ts, approveRelease(), createBranch(), createNamedRevision(), createReleaseCandidate()] | lang=en
- "tests_revisionsui_test": "revisionsUI.test.ts" | kind=code-symbol | source=src/__tests__/revisionsUI.test.ts:L1 | neighbors=[519cc54 feat: integrate revisions branc…, a257b9a feat: implement branching, tagg…, e20a167 feat: complete readiness engine…, releaseEngine.ts, approveRelease(), createBranch()] | lang=en
- "tests_unifiedgoldenpath_integration_test": "unifiedGoldenPath.integration.test.ts" | kind=code-symbol | source=src/__tests__/unifiedGoldenPath.integration.test.ts:L1 | neighbors=[ceaef7e Unify the Electronics to PCB an…, componentLibrary.ts, defaultComponents, projectMigrations.ts, normalizeProjectComponent(), projectStore.ts] | lang=en
- "validation_validationcoverage": "validationCoverage.ts" | kind=code-symbol | source=src/lib/validation/validationCoverage.ts:L1 | neighbors=[17918b0 feat: complete interactive engi…, releaseEngine.ts, projectStore.test.ts, index.ts, ProductRequirement, ValidationTest] | lang=en
- "blueprints_blueprintsheetrenderer": "BlueprintSheetRenderer.tsx" | kind=code-symbol | source=src/components/blueprints/BlueprintSheetRenderer.tsx:L1 | neighbors=[BlueprintDrawingRenderer.tsx, BlueprintDrawingRenderer(), BlueprintSheetRenderer(), BlueprintSheetRendererProps, severityIcons, statusStyles] | lang=en
- "board_boardinteraction_boarddesigneruistate": "BoardDesignerUIState" | kind=code-symbol | source=src/components/board/boardInteraction.ts:L13 | neighbors=[BoardCanvas.tsx, BoardComponentBin.tsx, BoardDesigner.tsx, BoardDRCPanel.tsx, BoardInspector.tsx, boardInteraction.ts] | lang=en
- "board_boardtoolbar": "BoardToolbar.tsx" | kind=code-symbol | source=src/components/board/BoardToolbar.tsx:L1 | neighbors=[BoardDesigner.tsx, boardInteraction.ts, BoardDesignerUIState, BoardTool, GRID_PRESETS, BoardToolbar()] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@74182b539b0b574f01e7a034b4e62dc46abfc5aa": "74182b5 Build semantic Blueprint visuals and representation inspector (#62)" | kind=Commit | source=git | neighbors=[master, 8fac0da Build adaptive workflows and gu…, BlueprintCanvas.tsx, Sidebar.tsx, visualRepresentationRegistry.test.ts, DeviceVisual.tsx] | lang=en
- "components_propertiespanel": "PropertiesPanel.tsx" | kind=code-symbol | source=src/components/PropertiesPanel.tsx:L1 | neighbors=[0e8fa7a feat: complete local-first hard…, 46ca452 chore: rename package to hardwa…, 67b9aff fix(brand): restore original lo…, 9c84530 feat: implement interactive pro…, AppShell.tsx, PropertiesPanel()] | lang=en
- "lib_nativeexports_getplacedcomponents": "getPlacedComponents()" | kind=code-symbol | source=src/lib/nativeExports.ts:L260 | neighbors=[nativeExports.ts, generateNativeBoardLayoutJson(), generateNativeCplDraftCsv(), generateNativeGerberBottomMask(), generateNativeGerberBottomPaste(), generateNativeGerberCopperBottom()] | lang=en
- "lib_readinessscore_calculatereadinessscore": "calculateReadinessScore()" | kind=code-symbol | source=src/lib/readinessScore.ts:L39 | neighbors=[BlueprintDossier.tsx, ReadinessDashboard.tsx, blueprintGenerator.ts, exportBlueprintSheets.ts, exportDossier.ts, exportMarkdown.ts] | lang=en
- "mechanical_mechanicalvalidation": "mechanicalValidation.ts" | kind=code-symbol | source=src/lib/mechanical/mechanicalValidation.ts:L1 | neighbors=[17918b0 feat: complete interactive engi…, MechanicalStudio.tsx, mechanicalGeometry.ts, getMechanicalBoundingBox(), isMechanicalObjectContained(), mechanicalObjectsOverlap()] | lang=en
- "schematic_schematicgeometry": "schematicGeometry.ts" | kind=code-symbol | source=src/components/schematic/schematicGeometry.ts:L1 | neighbors=[12bcbdd Unify workspace: Integrate Comp…, 356b610 Stabilize schematic and PCB rou…, SchematicCanvas.tsx, getPinPosition(), getSymbolPinLayouts(), snapToGrid()] | lang=en
- "sheets_electricalsheets": "ElectricalSheets.tsx" | kind=code-symbol | source=src/components/blueprints/sheets/ElectricalSheets.tsx:L1 | neighbors=[aa18a6c Upgrade Blueprint Sheets to Eng…, readinessScore.ts, ReadinessReport, CircuitSchematicSheet(), NetRoutingSheet(), PinMapSheet()] | lang=en
- "sheets_mechanicalsheets": "MechanicalSheets.tsx" | kind=code-symbol | source=src/components/blueprints/sheets/MechanicalSheets.tsx:L1 | neighbors=[aa18a6c Upgrade Blueprint Sheets to Eng…, readinessScore.ts, ReadinessReport, ArchitectureSheet(), ExplodedAssemblySheet(), InternalLayoutSheet()] | lang=en
- "sheets_pcbsheets": "PCBSheets.tsx" | kind=code-symbol | source=src/components/blueprints/sheets/PCBSheets.tsx:L1 | neighbors=[6c063dc chore: final verification pass,…, aa18a6c Upgrade Blueprint Sheets to Eng…, readinessScore.ts, ReadinessReport, BoardSpecsSheet(), ComponentPlacementSheet()] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\ANKIT BHARDWAJ\Desktop\hardware studio\.graphify\description-instructions\batch-003.json

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
