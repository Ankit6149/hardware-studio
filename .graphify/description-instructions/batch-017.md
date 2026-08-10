# Node Description Batch 18 of 28

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

- "pcb_pcbroutingengine_pcbanchor": "PCBAnchor" | kind=code-symbol | source=src/lib/pcb/pcbRoutingEngine.ts:L7 | neighbors=[BoardCanvas.tsx, pcbRoutingEngine.ts]
- "postcss_config": "postcss.config.mjs" | kind=code-symbol | source=postcss.config.mjs:L1 | neighbors=[b2d482b Initial commit from Create Next…, config]
- "product_productarchitecturecanvas_productarchitecturecanvas": "ProductArchitectureCanvas()" | kind=code-symbol | source=src/components/product/ProductArchitectureCanvas.tsx:L97 | neighbors=[ProductArchitectureCanvas.tsx, ProductStudio.tsx]
- "product_productgraph_findpowerblockswithoutpowerconnection": "findPowerBlocksWithoutPowerConnection()" | kind=code-symbol | source=src/lib/product/productGraph.ts:L39 | neighbors=[productGraph.ts, validateArchitectureGraph()]
- "product_productgraph_findprocessingblockswithoutinput": "findProcessingBlocksWithoutInput()" | kind=code-symbol | source=src/lib/product/productGraph.ts:L52 | neighbors=[productGraph.ts, validateArchitectureGraph()]
- "product_productinspector_productinspector": "ProductInspector()" | kind=code-symbol | source=src/components/product/ProductInspector.tsx:L12 | neighbors=[ProductInspector.tsx, ProductStudio.tsx]
- "product_productrequirementspanel_productrequirementspanel": "ProductRequirementsPanel()" | kind=code-symbol | source=src/components/product/ProductRequirementsPanel.tsx:L8 | neighbors=[ProductRequirementsPanel.tsx, ProductStudio.tsx]
- "product_productstudio_productstudio": "ProductStudio()" | kind=code-symbol | source=src/components/product/ProductStudio.tsx:L15 | neighbors=[AppShell.tsx, ProductStudio.tsx]
- "productgraph_queries_getarchitecturenoderelations": "getArchitectureNodeRelations()" | kind=code-symbol | source=src/core/productGraph/queries.ts:L73 | neighbors=[graph.ts, queries.ts]
- "productgraph_queries_getboardrelations": "getBoardRelations()" | kind=code-symbol | source=src/core/productGraph/queries.ts:L154 | neighbors=[graph.ts, queries.ts]
- "productgraph_queries_getfirmwaremodulerelations": "getFirmwareModuleRelations()" | kind=code-symbol | source=src/core/productGraph/queries.ts:L169 | neighbors=[graph.ts, queries.ts]
- "productgraph_queries_getproductsummary": "getProductSummary()" | kind=code-symbol | source=src/core/productGraph/queries.ts:L40 | neighbors=[graph.ts, queries.ts]
- "productgraph_queries_getrequirementimpact": "getRequirementImpact()" | kind=code-symbol | source=src/core/productGraph/queries.ts:L58 | neighbors=[graph.ts, queries.ts]
- "productgraph_queries_getrequirementimplementationcoverage": "getRequirementImplementationCoverage()" | kind=code-symbol | source=src/core/productGraph/queries.ts:L5 | neighbors=[graph.ts, queries.ts]
- "productgraph_queries_getvalidationrelations": "getValidationRelations()" | kind=code-symbol | source=src/core/productGraph/queries.ts:L182 | neighbors=[graph.ts, queries.ts]
- "reliability_apperrorboundary_apperrorboundary_componentdidcatch": ".componentDidCatch()" | kind=code-symbol | source=src/components/reliability/AppErrorBoundary.tsx:L56 | neighbors=[AppErrorBoundary, recordCrash()]
- "reliability_apperrorboundary_apperrorboundary_getdiagnostics": ".getDiagnostics()" | kind=code-symbol | source=src/components/reliability/AppErrorBoundary.tsx:L64 | neighbors=[AppErrorBoundary, .render()]
- "reliability_apperrorboundary_apperrorboundary_render": ".render()" | kind=code-symbol | source=src/components/reliability/AppErrorBoundary.tsx:L95 | neighbors=[AppErrorBoundary, .getDiagnostics()]
- "reliability_apperrorboundary_recordcrash": "recordCrash()" | kind=code-symbol | source=src/components/reliability/AppErrorBoundary.tsx:L21 | neighbors=[AppErrorBoundary.tsx, .componentDidCatch()]
- "reliability_apperrorboundary_triggertestcrash": "triggerTestCrash()" | kind=code-symbol | source=src/components/reliability/AppErrorBoundary.tsx:L161 | neighbors=[AppErrorBoundary.tsx, reliability.test.ts]
- "revisions_revisionsstudio_revisionsstudio": "RevisionsStudio()" | kind=code-symbol | source=src/components/revisions/RevisionsStudio.tsx:L17 | neighbors=[AppShell.tsx, RevisionsStudio.tsx]
- "schematic_schematiccanvas_schematiccanvas": "SchematicCanvas()" | kind=code-symbol | source=src/components/schematic/SchematicCanvas.tsx:L16 | neighbors=[SchematicCanvas.tsx, UnifiedSchematicEditor.tsx]
- "schematic_schematicgeometry_getpinposition": "getPinPosition()" | kind=code-symbol | source=src/components/schematic/schematicGeometry.ts:L143 | neighbors=[schematicGeometry.ts, getSymbolPinLayouts()]
- "schematic_schematicgeometry_snaptogrid": "snapToGrid()" | kind=code-symbol | source=src/components/schematic/schematicGeometry.ts:L4 | neighbors=[SchematicCanvas.tsx, schematicGeometry.ts]
- "schematic_schematicinteraction_initialschematicuistate": "initialSchematicUIState" | kind=code-symbol | source=src/components/schematic/schematicInteraction.ts:L38 | neighbors=[schematicInteraction.ts, UnifiedSchematicEditor.tsx]
- "schematic_schematicsymbolrenderer_getsymbolpinlayouts": "getSymbolPinLayouts()" | kind=code-symbol | source=src/components/schematic/SchematicSymbolRenderer.tsx:L26 | neighbors=[SchematicSymbolRenderer.tsx, SchematicSymbolRenderer()]
- "schematic_unifiedschematiceditor_unifiedschematiceditor": "UnifiedSchematicEditor()" | kind=code-symbol | source=src/components/schematic/UnifiedSchematicEditor.tsx:L41 | neighbors=[UnifiedSchematicEditor.tsx, UnifiedWorkbenchAdapters.tsx]
- "store_projectstore_getactiveid": "getActiveId()" | kind=code-symbol | source=src/store/projectStore.ts:L447 | neighbors=[projectStore.ts, getInitialActiveProject()]
- "store_projectstore_getsavedprojects": "getSavedProjects()" | kind=code-symbol | source=src/store/projectStore.ts:L343 | neighbors=[projectStore.ts, getInitialActiveProject()]
- "store_projectstore_normalizenetname": "normalizeNetName()" | kind=code-symbol | source=src/store/projectStore.ts:L70 | neighbors=[projectStore.ts, projectStore.test.ts]
- "store_projectstore_projectstate": "ProjectState" | kind=code-symbol | source=src/store/projectStore.ts:L80 | neighbors=[projectStore.ts, Project]
- "store_storagehealthstore_allowstoragerecoveryoverwrite": "allowStorageRecoveryOverwrite()" | kind=code-symbol | source=src/store/storageHealthStore.ts:L51 | neighbors=[ProjectManager.tsx, storageHealthStore.ts]
- "store_storagehealthstore_istrackedlocalstorage": "isTrackedLocalStorage()" | kind=code-symbol | source=src/store/storageHealthStore.ts:L33 | neighbors=[storageHealthStore.ts, prepareStorageReliability()]
- "store_storagehealthstore_latestsavedat": "latestSavedAt()" | kind=code-symbol | source=src/store/storageHealthStore.ts:L42 | neighbors=[storageHealthStore.ts, prepareStorageReliability()]
- "store_storagehealthstore_sethealth": "setHealth()" | kind=code-symbol | source=src/store/storageHealthStore.ts:L29 | neighbors=[storageHealthStore.ts, prepareStorageReliability()]
- "store_studiocontextstore_mechanicalworkbenchmode": "MechanicalWorkbenchMode" | kind=code-symbol | source=src/store/studioContextStore.ts:L13 | neighbors=[studioContextStore.ts, UnifiedWorkbenchAdapters.tsx]
- "store_workflowpreferencesstore_workflowpreferencesstate": "WorkflowPreferencesState" | kind=code-symbol | source=src/store/workflowPreferencesStore.ts:L15 | neighbors=[workflowPreferencesStore.ts, WorkflowPreference]
- "studio_engineeringcontextbar_engineeringcontextbar": "EngineeringContextBar()" | kind=code-symbol | source=src/components/studio/EngineeringContextBar.tsx:L36 | neighbors=[AppShell.tsx, EngineeringContextBar.tsx]
- "studio_studiobuildmap_build_stages": "BUILD_STAGES" | kind=code-symbol | source=src/components/studio/StudioBuildMap.tsx:L30 | neighbors=[StudioBuildMap.tsx, studioUnification.test.ts]
- "studio_studiobuildmap_electronics_flow": "ELECTRONICS_FLOW" | kind=code-symbol | source=src/components/studio/StudioBuildMap.tsx:L40 | neighbors=[StudioBuildMap.tsx, studioUnification.test.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\ANKIT BHARDWAJ\Desktop\hardware studio\.graphify\description-instructions\batch-017.json

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
