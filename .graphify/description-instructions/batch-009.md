# Node Description Batch 10 of 28

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
Write every description in English (en). Do not switch languages.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "lib_nativeexports_exportbomcsv": "exportBomCsv()" | kind=code-symbol | source=src/lib/nativeExports.ts:L767 | neighbors=[mfgManifestEngine.ts, nativeExports.ts, generateReleasePackageManifest(), blueprintManufacturing.test.ts]
- "lib_nativeexports_generatenativegerberbottommask": "generateNativeGerberBottomMask()" | kind=code-symbol | source=src/lib/nativeExports.ts:L523 | neighbors=[ExportCenter.tsx, FactoryPackageBuilder.tsx, nativeExports.ts, getPlacedComponents()]
- "lib_nativeexports_generatenativegerberbottompaste": "generateNativeGerberBottomPaste()" | kind=code-symbol | source=src/lib/nativeExports.ts:L576 | neighbors=[ExportCenter.tsx, FactoryPackageBuilder.tsx, nativeExports.ts, getPlacedComponents()]
- "lib_nativeexports_generatenativegerbertopmask": "generateNativeGerberTopMask()" | kind=code-symbol | source=src/lib/nativeExports.ts:L496 | neighbors=[ExportCenter.tsx, FactoryPackageBuilder.tsx, nativeExports.ts, getPlacedComponents()]
- "lib_nativeexports_generatenativegerbertoppaste": "generateNativeGerberTopPaste()" | kind=code-symbol | source=src/lib/nativeExports.ts:L550 | neighbors=[ExportCenter.tsx, FactoryPackageBuilder.tsx, nativeExports.ts, getPlacedComponents()]
- "lib_nativeexports_generatenativegerbertopsilkscreen": "generateNativeGerberTopSilkscreen()" | kind=code-symbol | source=src/lib/nativeExports.ts:L453 | neighbors=[ExportCenter.tsx, FactoryPackageBuilder.tsx, nativeExports.ts, getPlacedComponents()]
- "lib_navigationregistry_iscanvasnavigationitem": "isCanvasNavigationItem()" | kind=code-symbol | source=src/lib/navigationRegistry.ts:L235 | neighbors=[AppShell.tsx, Sidebar.tsx, navigationRegistry.ts, navigationRegistry.test.ts]
- "lib_projectmigrations_normalizeprojectcomponent": "normalizeProjectComponent()" | kind=code-symbol | source=src/lib/projectMigrations.ts:L7 | neighbors=[projectMigrations.ts, projectStore.ts, projectStore.test.ts, unifiedGoldenPath.integration.test.ts]
- "lib_projectserialization_deserializeproject": "deserializeProject()" | kind=code-symbol | source=src/lib/projectSerialization.ts:L82 | neighbors=[projectSerialization.ts, migrateProjectSchema(), projectStore.ts, projectSerialization.test.ts]
- "lib_releaseengine_validatereleaseeligibility": "validateReleaseEligibility()" | kind=code-symbol | source=src/lib/releaseEngine.ts:L26 | neighbors=[releaseEngine.ts, RevisionsStudio.tsx, releaseEngine.test.ts, revisionsUI.test.ts]
- "lib_reliability_buildredacteddiagnostics": "buildRedactedDiagnostics()" | kind=code-symbol | source=src/lib/reliability.ts:L122 | neighbors=[reliability.ts, redactSensitiveText(), AppErrorBoundary.tsx, reliability.test.ts]
- "lib_validationrunner_runvalidationtest": "runValidationTest()" | kind=code-symbol | source=src/lib/validationRunner.ts:L13 | neighbors=[validationRunner.ts, hardwareStudioV1Integration.test.ts, validationExecution.test.ts, validationRuns.test.ts]
- "lib_workflowprofiles_createpreferencefromprofile": "createPreferenceFromProfile()" | kind=code-symbol | source=src/lib/workflowProfiles.ts:L152 | neighbors=[workflowProfiles.ts, getWorkflowProfile(), workflowPreferencesStore.ts, workflowProfiles.test.ts]
- "lib_workflowprofiles_deriveguidedworkflowactions": "deriveGuidedWorkflowActions()" | kind=code-symbol | source=src/lib/workflowProfiles.ts:L295 | neighbors=[ProjectDashboard.tsx, workflowProfiles.ts, evidence(), workflowProfiles.test.ts]
- "lib_workflowprofiles_gethiddendomaincount": "getHiddenDomainCount()" | kind=code-symbol | source=src/lib/workflowProfiles.ts:L228 | neighbors=[ProjectDashboard.tsx, Sidebar.tsx, workflowProfiles.ts, workflowProfiles.test.ts]
- "lib_workflowprofiles_getvisiblenavigationdomains": "getVisibleNavigationDomains()" | kind=code-symbol | source=src/lib/workflowProfiles.ts:L215 | neighbors=[Sidebar.tsx, workflowProfiles.ts, getDomainIdForView(), workflowProfiles.test.ts]
- "lib_workflowprofiles_getworkflowconnectionnotices": "getWorkflowConnectionNotices()" | kind=code-symbol | source=src/lib/workflowProfiles.ts:L232 | neighbors=[ProjectDashboard.tsx, workflowProfiles.ts, workflowProfiles.test.ts, WorkflowSetupDialog.tsx]
- "lib_workflowprofiles_normalizeworkflowpreference": "normalizeWorkflowPreference()" | kind=code-symbol | source=src/lib/workflowProfiles.ts:L177 | neighbors=[workflowProfiles.ts, inferProfileId(), workflowPreferencesStore.ts, workflowProfiles.test.ts]
- "lib_workflowprofiles_toggleworkflowdomain": "toggleWorkflowDomain()" | kind=code-symbol | source=src/lib/workflowProfiles.ts:L196 | neighbors=[workflowProfiles.ts, workflowPreferencesStore.ts, workflowProfiles.test.ts, WorkflowSetupDialog.tsx]
- "mechanical_mechanicalgeometry_applylightweightconstraint": "applyLightweightConstraint()" | kind=code-symbol | source=src/lib/mechanical/mechanicalGeometry.ts:L155 | neighbors=[mechanicalGeometry.ts, getMechanicalBoundingBox(), MechanicalInspector.tsx, mechanicalGeometry.test.ts]
- "mechanical_mechanicalgeometry_ismechanicalobjectcontained": "isMechanicalObjectContained()" | kind=code-symbol | source=src/lib/mechanical/mechanicalGeometry.ts:L107 | neighbors=[mechanicalGeometry.ts, getMechanicalBoundingBox(), mechanicalValidation.ts, projectStore.test.ts]
- "mechanical_mechanicalgeometry_minimumdistancebetweenmechanicalobjects": "minimumDistanceBetweenMechanicalObjects()" | kind=code-symbol | source=src/lib/mechanical/mechanicalGeometry.ts:L191 | neighbors=[mechanicalGeometry.ts, getMechanicalBoundingBox(), mechanicalGeometry.test.ts, projectStore.test.ts]
- "productgraph_queries_getproductimpactofcomponentreplacement": "getProductImpactOfComponentReplacement()" | kind=code-symbol | source=src/core/productGraph/queries.ts:L200 | neighbors=[graph.ts, queries.ts, getComponentDomainLinks(), getReleaseImpact()]
- "schematic_schematicgeometry_getsymbolpinlayouts": "getSymbolPinLayouts()" | kind=code-symbol | source=src/components/schematic/schematicGeometry.ts:L16 | neighbors=[SchematicCanvas.tsx, schematicGeometry.ts, getPinPosition(), schematicWire.test.ts]
- "tests_pcbmechanicalsync_test": "pcbMechanicalSync.test.ts" | kind=code-symbol | source=src/__tests__/pcbMechanicalSync.test.ts:L1 | neighbors=[329890b feat: synchronize PCB and mecha…, efd5072 docs: complete V1 completion au…, projectStore.ts, useProjectStore]
- "tests_runtests": "runTests.js" | kind=code-symbol | source=src/__tests__/runTests.js:L1 | neighbors=[356b610 Stabilize schematic and PCB rou…, projectStore.ts, assert(), runSuite()]
- "types_index_boarditem": "BoardItem" | kind=code-symbol | source=src/types/index.ts:L126 | neighbors=[BoardStudio.tsx, editorLayoutGenerators.ts, projectStore.ts, index.ts]
- "types_index_firmwaresourcefile": "FirmwareSourceFile" | kind=code-symbol | source=src/types/index.ts:L480 | neighbors=[FirmwareCodePreview.tsx, exportFirmware.ts, firmwareWorkspace.test.ts, index.ts]
- "types_index_manufacturingchecklistitem": "ManufacturingChecklistItem" | kind=code-symbol | source=src/types/index.ts:L281 | neighbors=[editorLayoutGenerators.ts, exportBoardPlan.ts, projectStore.ts, index.ts]
- "types_index_nodedata": "NodeData" | kind=code-symbol | source=src/types/index.ts:L5 | neighbors=[BlueprintCanvas.tsx, projectStore.ts, index.ts, RepresentationInspector.tsx]
- "types_index_padnetassignment": "PadNetAssignment" | kind=code-symbol | source=src/types/index.ts:L461 | neighbors=[boardGeometry.ts, pcbRoutingEngine.ts, projectStore.ts, index.ts]
- "types_index_productarchitectureconnection": "ProductArchitectureConnection" | kind=code-symbol | source=src/types/index.ts:L859 | neighbors=[productGraph.ts, ProductInspector.tsx, projectStore.ts, index.ts]
- "types_index_teststage": "TestStage" | kind=code-symbol | source=src/types/index.ts:L62 | neighbors=[editorLayoutGenerators.ts, exportMarkdown.ts, projectStore.ts, index.ts]
- "types_index_trace": "Trace" | kind=code-symbol | source=src/types/index.ts:L444 | neighbors=[boardGeometry.ts, pcbRoutingEngine.ts, projectStore.ts, index.ts]
- "types_index_validationmeasurement": "ValidationMeasurement" | kind=code-symbol | source=src/types/index.ts:L951 | neighbors=[projectStore.test.ts, index.ts, measurementEvaluation.ts, ValidationStudio.tsx]
- "validation_measurementevaluation_evaluatevalidationmeasurement": "evaluateValidationMeasurement()" | kind=code-symbol | source=src/lib/validation/measurementEvaluation.ts:L4 | neighbors=[projectStore.test.ts, measurementEvaluation.ts, validationCoverage.ts, ValidationStudio.tsx]
- "validation_validationcoverage_calculaterequirementcoverage": "calculateRequirementCoverage()" | kind=code-symbol | source=src/lib/validation/validationCoverage.ts:L16 | neighbors=[releaseEngine.ts, projectStore.test.ts, validationCoverage.ts, ValidationStudio.tsx]
- "visual_devicevisual_architectureglyph": "ArchitectureGlyph()" | kind=code-symbol | source=src/components/visual/DeviceVisual.tsx:L45 | neighbors=[BlueprintCanvas.tsx, Sidebar.tsx, DeviceVisual.tsx, commonStroke]
- "visual_representationregistry_resolvevisualfamily": "resolveVisualFamily()" | kind=code-symbol | source=src/lib/visual/representationRegistry.ts:L428 | neighbors=[BlueprintCanvas.tsx, representationRegistry.ts, getVisualFamily(), resolveVisualFamilyId()]
- "blueprints_blueprintdrawingrenderer_blueprintdrawingrenderer": "BlueprintDrawingRenderer()" | kind=code-symbol | source=src/components/blueprints/BlueprintDrawingRenderer.tsx:L225 | neighbors=[BlueprintDrawingRenderer.tsx, createEngineeringLayout(), BlueprintSheetRenderer.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\ANKIT BHARDWAJ\Desktop\hardware studio\.graphify\description-instructions\batch-009.json

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
