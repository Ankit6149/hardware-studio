# Node Description Batch 5 of 28

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

- "studio_engineeringcontextbar": "EngineeringContextBar.tsx" | kind=code-symbol | source=src/components/studio/EngineeringContextBar.tsx:L1 | neighbors=[ceaef7e Unify the Electronics to PCB an…, AppShell.tsx, workflowProfiles.ts, getDomainIdForView(), projectStore.ts, useProjectStore] | lang=en
- "studio_unifiedvalidationworkbench": "UnifiedValidationWorkbench.tsx" | kind=code-symbol | source=src/components/studio/UnifiedValidationWorkbench.tsx:L1 | neighbors=[ceaef7e Unify the Electronics to PCB an…, AppShell.tsx, projectStore.ts, useProjectStore, studioContextStore.ts, useStudioContextStore] | lang=en
- "tests_mcpprotocol_test": "mcpProtocol.test.ts" | kind=code-symbol | source=src/__tests__/mcpProtocol.test.ts:L1 | neighbors=[1eebb14 feat: implement MCP server live…, 84415a2 fix(v1): complete truthful prod…, 9e2c2c6 feat: add real MCP server and s…, e20a167 feat: complete readiness engine…, mcpServer.ts, HardwareStudioMCPServer] | lang=en
- "tests_reliability_test": "reliability.test.ts" | kind=code-symbol | source=src/__tests__/reliability.test.ts:L1 | neighbors=[c020639 Add crash recovery and visible …, reliability.ts, buildRedactedDiagnostics(), classifyStorageError(), memoryFallbackStorageHealth(), savedStorageHealth()] | lang=en
- "tests_webgl3dview_test": "webgl3DView.test.ts" | kind=code-symbol | source=src/__tests__/webgl3DView.test.ts:L1 | neighbors=[380fca6 feat: add real WebGL 3D product…, 9debb85 feat: synchronize persisted Web…, e20a167 feat: complete readiness engine…, mechanicalGeometry.ts, checkMechanicalInterference(), projectStore.ts] | lang=en
- "validation_measurementevaluation": "measurementEvaluation.ts" | kind=code-symbol | source=src/lib/validation/measurementEvaluation.ts:L1 | neighbors=[17918b0 feat: complete interactive engi…, projectStore.test.ts, index.ts, ValidationEvidence, ValidationMeasurement, ValidationTest] | lang=en
- "board_boardnetpanel": "BoardNetPanel.tsx" | kind=code-symbol | source=src/components/board/BoardNetPanel.tsx:L1 | neighbors=[BoardDesigner.tsx, boardInteraction.ts, BoardDesignerUIState, BoardNetPanel(), BoardNetPanelProps, projectStore.ts] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@42e727445313b80e2106de18ce4be65008363a5a": "42e7274 Implement printable/exportable Blueprint Sheets layer with A4-styled en…" | kind=Commit | source=git | neighbors=[master, 3e73302 Bind Blueprint Sheets SVG drawi…, AppShell.tsx, BlueprintSheets.tsx, ExportCenter.tsx, ProjectDashboard.tsx] | lang=en
- "components_pcbconstraints": "PCBConstraints.tsx" | kind=code-symbol | source=src/components/PCBConstraints.tsx:L1 | neighbors=[0308eaa feat: integrate Board Studio & …, AppShell.tsx, PCBConstraints(), projectStore.ts, useProjectStore, index.ts] | lang=en
- "lib_footprints_getfootprint": "getFootprint()" | kind=code-symbol | source=src/lib/footprints.ts:L487 | neighbors=[BoardCanvas.tsx, BoardComponentBin.tsx, boardGeometry.ts, BoardInspector.tsx, ComponentLibraryWorkbench.tsx, blueprintGenerator.ts] | lang=en
- "lib_nativeexports_generatereleasepackagemanifest": "generateReleasePackageManifest()" | kind=code-symbol | source=src/lib/nativeExports.ts:L833 | neighbors=[nativeExports.ts, computeCryptoSHA256(), exportBomCsv(), generateNativeCplDraftCsv(), generateNativeExcellonDrills(), generateNativeGerberCopperTop()] | lang=en
- "sheets_handoffsheets": "HandoffSheets.tsx" | kind=code-symbol | source=src/components/blueprints/sheets/HandoffSheets.tsx:L1 | neighbors=[266e502 Harden and align gating checks,…, aa18a6c Upgrade Blueprint Sheets to Eng…, readinessScore.ts, ReadinessReport, MfgChecklistSheet(), MissingFilesSheet()] | lang=en
- "studio_unifiedbomworkbench": "UnifiedBOMWorkbench.tsx" | kind=code-symbol | source=src/components/studio/UnifiedBOMWorkbench.tsx:L1 | neighbors=[ceaef7e Unify the Electronics to PCB an…, AppShell.tsx, projectStore.ts, useProjectStore, studioContextStore.ts, useStudioContextStore] | lang=en
- "tests_deviceknowledge_test": "deviceKnowledge.test.ts" | kind=code-symbol | source=src/__tests__/deviceKnowledge.test.ts:L1 | neighbors=[1d1ba8d Build connected device knowledg…, componentLibrary.ts, defaultComponents, deviceKnowledge.ts, knowledgeEntryCompleteness(), resolveKnowledgeIdForComponent()] | lang=en
- "tests_releaseengine_test": "releaseEngine.test.ts" | kind=code-symbol | source=src/__tests__/releaseEngine.test.ts:L1 | neighbors=[31431d7 feat: complete cross-domain pro…, releaseEngine.ts, approveRelease(), createBranch(), createNamedRevision(), createReleaseCandidate()] | lang=en
- "tests_visualrepresentationregistry_test": "visualRepresentationRegistry.test.ts" | kind=code-symbol | source=src/__tests__/visualRepresentationRegistry.test.ts:L1 | neighbors=[74182b5 Build semantic Blueprint visual…, representationRegistry.ts, getVisualFamily(), portHandleId(), portKindFromHandleId(), REPRESENTATION_KINDS] | lang=en
- "types_index_reviewresult": "ReviewResult" | kind=code-symbol | source=src/types/index.ts:L602 | neighbors=[BoardCanvas.tsx, BoardDesigner.tsx, BoardDRCPanel.tsx, boardDRC.ts, designReview.ts, schematicERC.ts] | lang=en
- "types_index_validationtest": "ValidationTest" | kind=code-symbol | source=src/types/index.ts:L974 | neighbors=[validationRunner.ts, relations.ts, projectStore.ts, projectStore.test.ts, validationRuns.test.ts, index.ts] | lang=en
- "ui_card": "Card.tsx" | kind=code-symbol | source=src/ui/Card.tsx:L1 | neighbors=[0e8fa7a feat: complete local-first hard…, ReadinessDashboard.tsx, TemplatePicker.tsx, Card(), CardContent(), CardFooter()] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@0e710629cffe3ef2028505324c57e6914bfcfc5b": "0e71062 Audit recovery: restore CI integrity, navigation truth, and authoritati…" | kind=Commit | source=git | neighbors=[04f0f7b fix(blueprints): replace fake c…, master, c020639 Add crash recovery and visible …, AppShell.tsx, Sidebar.tsx, TopBar.tsx] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@a8af0f5109bb301a6cdc8f1302ac881e10a6015c": "a8af0f5 Stabilize schematic locked types" | kind=Commit | source=git | neighbors=[356b610 Stabilize schematic and PCB rou…, BoardLayerPanel.tsx, master, 931aeec fix: resolve ValidationTest typ…, blueprintGenerator.ts, SchematicCanvas.tsx] | lang=pt
- "firmware_firmwarecodegen": "firmwareCodegen.ts" | kind=code-symbol | source=src/lib/firmware/firmwareCodegen.ts:L1 | neighbors=[17918b0 feat: complete interactive engi…, generateFirmwareSource(), firmwareValidation.ts, sanitizeCIdentifier(), index.ts, FirmwareModule] | lang=en
- "lib_boarddrc_runboarddrc": "runBoardDRC()" | kind=code-symbol | source=src/lib/boardDRC.ts:L16 | neighbors=[BoardDesigner.tsx, boardDRC.ts, drcId(), releaseEngine.ts, validationRunner.ts, mcpServer.ts] | lang=en
- "lib_nativeexports_generatenativecpldraftcsv": "generateNativeCplDraftCsv()" | kind=code-symbol | source=src/lib/nativeExports.ts:L656 | neighbors=[mfgManifestEngine.ts, ExportCenter.tsx, FactoryPackageBuilder.tsx, nativeExports.ts, exportConceptualPlacementCsv(), getPlacedComponents()] | lang=en
- "lib_schematicerc": "schematicERC.ts" | kind=code-symbol | source=src/lib/schematicERC.ts:L1 | neighbors=[12bcbdd Unify workspace: Integrate Comp…, 356b610 Stabilize schematic and PCB rou…, 6c063dc chore: final verification pass,…, runSchematicERC(), index.ts, Project] | lang=en
- "lib_validationrules": "validationRules.ts" | kind=code-symbol | source=src/lib/validationRules.ts:L1 | neighbors=[67b9aff fix(brand): restore original lo…, 9c84530 feat: implement interactive pro…, ReviewWarnings.tsx, runValidationRules(), Warning, index.ts] | lang=en
- "mechanical_mechanicalgeometry_getmechanicalboundingbox": "getMechanicalBoundingBox()" | kind=code-symbol | source=src/lib/mechanical/mechanicalGeometry.ts:L55 | neighbors=[mechanicalGeometry.ts, applyLightweightConstraint(), isMechanicalObjectContained(), mechanicalObjectsOverlap(), minimumDistanceBetweenMechanicalObjects…, mechanicalValidation.ts] | lang=en
- "sheets_coversheet": "CoverSheet.tsx" | kind=code-symbol | source=src/components/blueprints/sheets/CoverSheet.tsx:L1 | neighbors=[266e502 Harden and align gating checks,…, aa18a6c Upgrade Blueprint Sheets to Eng…, readinessScore.ts, ReadinessReport, CoverSheet(), CoverSheetProps] | lang=en
- "sheets_softwareqasheets": "SoftwareQASheets.tsx" | kind=code-symbol | source=src/components/blueprints/sheets/SoftwareQASheets.tsx:L1 | neighbors=[aa18a6c Upgrade Blueprint Sheets to Eng…, readinessScore.ts, ReadinessReport, FirmwareArchitectureSheet(), SheetProps, TestingValidationSheet()] | lang=en
- "tests_firmwareworkspace_test": "firmwareWorkspace.test.ts" | kind=code-symbol | source=src/__tests__/firmwareWorkspace.test.ts:L1 | neighbors=[d706e7c feat: add persistent firmware s…, fb2f623 feat: build persistent firmware…, exportFirmware.ts, generateFirmwareWorkspace(), projectStore.ts, useProjectStore] | lang=en
- "tests_navigationregistry_test": "navigationRegistry.test.ts" | kind=code-symbol | source=src/__tests__/navigationRegistry.test.ts:L1 | neighbors=[0e71062 Audit recovery: restore CI inte…, navigationRegistry.ts, allNavigationItems, compatibleNavigationItems, getNavigationItem(), isCanvasNavigationItem()] | lang=en
- "tests_projectserialization_test": "projectSerialization.test.ts" | kind=code-symbol | source=src/__tests__/projectSerialization.test.ts:L1 | neighbors=[2a55e09 fix: preserve complete project …, 31431d7 feat: complete cross-domain pro…, projectSerialization.ts, deserializeProject(), serializeProject(), validateProjectIntegrity()] | lang=en
- "tests_projectstoreserialization_test": "projectStoreSerialization.test.ts" | kind=code-symbol | source=src/__tests__/projectStoreSerialization.test.ts:L1 | neighbors=[3bc81e0 fix: connect canonical serializ…, 6939a13 fix: preserve every V1 domain t…, 84415a2 fix(v1): complete truthful prod…, efd5072 docs: complete V1 completion au…, projectStore.ts, useProjectStore] | lang=en
- "tests_validationruns_test": "validationRuns.test.ts" | kind=code-symbol | source=src/__tests__/validationRuns.test.ts:L1 | neighbors=[21c12a9 feat: implement real validation…, 78d58ff feat: complete validation runs …, validationRunner.ts, runValidationTest(), projectStore.ts, useProjectStore] | lang=en
- "types_index_mechanicalobject": "MechanicalObject" | kind=code-symbol | source=src/types/index.ts:L871 | neighbors=[MechanicalCanvas.tsx, mechanicalGeometry.ts, MechanicalInspector.tsx, mechanicalValidation.ts, projectStore.ts, mechanicalGeometry.test.ts] | lang=en
- "ui_badge": "Badge.tsx" | kind=code-symbol | source=src/ui/Badge.tsx:L1 | neighbors=[0e8fa7a feat: complete local-first hard…, BlueprintDossier.tsx, BlueprintSheets.tsx, BoardStudio.tsx, ReadinessDashboard.tsx, TemplatePicker.tsx] | lang=en
- "ui_formcontrols": "FormControls.tsx" | kind=code-symbol | source=src/ui/FormControls.tsx:L1 | neighbors=[0e8fa7a feat: complete local-first hard…, ProjectManager.tsx, Input(), InputFieldProps, Select(), SelectProps] | lang=en
- "app_layout": "layout.tsx" | kind=code-symbol | source=src/app/layout.tsx:L1 | neighbors=[metadata, RootLayout(), 5cd6df7 fix(brand): remove legacy brand…, 67b9aff fix(brand): restore original lo…, b2d482b Initial commit from Create Next…, b7cf95f fix: resolve Next.js hydration …] | lang=en
- "board_boardtypes": "boardTypes.ts" | kind=code-symbol | source=src/components/board/boardTypes.ts:L1 | neighbors=[BoardKeepout, BoardOutline, DrillHole, PadNetAssignment, Trace, Via] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@1a539cf469e8c3dab5ce761d2f2508c22fe589c3": "1a539cf feat: implement concept blueprint dossier with print layouts and svg di…" | kind=Commit | source=git | neighbors=[master, 0308eaa feat: integrate Board Studio & …, AppShell.tsx, BlueprintDossier.tsx, Sidebar.tsx, exportDossier.ts] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\ANKIT BHARDWAJ\Desktop\hardware studio\.graphify\description-instructions\batch-004.json

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
