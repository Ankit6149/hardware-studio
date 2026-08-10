# Node Description Batch 26 of 28

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

- "schematic_schematicsymbolrenderer_symbolpinlayout": "SymbolPinLayout" | kind=code-symbol | source=src/components/schematic/SchematicSymbolRenderer.tsx:L3 | neighbors=[SchematicSymbolRenderer.tsx]
- "schematic_unifiedschematiceditor_deleteimpact": "DeleteImpact" | kind=code-symbol | source=src/components/schematic/UnifiedSchematicEditor.tsx:L25 | neighbors=[UnifiedSchematicEditor.tsx]
- "schematic_unifiedschematiceditor_istextentrytarget": "isTextEntryTarget()" | kind=code-symbol | source=src/components/schematic/UnifiedSchematicEditor.tsx:L34 | neighbors=[UnifiedSchematicEditor.tsx]
- "sheets_coversheet_coversheet": "CoverSheet()" | kind=code-symbol | source=src/components/blueprints/sheets/CoverSheet.tsx:L10 | neighbors=[CoverSheet.tsx]
- "sheets_coversheet_coversheetprops": "CoverSheetProps" | kind=code-symbol | source=src/components/blueprints/sheets/CoverSheet.tsx:L5 | neighbors=[CoverSheet.tsx]
- "sheets_electricalsheets_circuitschematicsheet": "CircuitSchematicSheet()" | kind=code-symbol | source=src/components/blueprints/sheets/ElectricalSheets.tsx:L14 | neighbors=[ElectricalSheets.tsx]
- "sheets_electricalsheets_netroutingsheet": "NetRoutingSheet()" | kind=code-symbol | source=src/components/blueprints/sheets/ElectricalSheets.tsx:L150 | neighbors=[ElectricalSheets.tsx]
- "sheets_electricalsheets_pinmapsheet": "PinMapSheet()" | kind=code-symbol | source=src/components/blueprints/sheets/ElectricalSheets.tsx:L338 | neighbors=[ElectricalSheets.tsx]
- "sheets_electricalsheets_powertreesheet": "PowerTreeSheet()" | kind=code-symbol | source=src/components/blueprints/sheets/ElectricalSheets.tsx:L252 | neighbors=[ElectricalSheets.tsx]
- "sheets_electricalsheets_sheetprops": "SheetProps" | kind=code-symbol | source=src/components/blueprints/sheets/ElectricalSheets.tsx:L6 | neighbors=[ElectricalSheets.tsx]
- "sheets_handoffsheets_mfgchecklistsheet": "MfgChecklistSheet()" | kind=code-symbol | source=src/components/blueprints/sheets/HandoffSheets.tsx:L13 | neighbors=[HandoffSheets.tsx]
- "sheets_handoffsheets_missingfilessheet": "MissingFilesSheet()" | kind=code-symbol | source=src/components/blueprints/sheets/HandoffSheets.tsx:L141 | neighbors=[HandoffSheets.tsx]
- "sheets_handoffsheets_sheetprops": "SheetProps" | kind=code-symbol | source=src/components/blueprints/sheets/HandoffSheets.tsx:L5 | neighbors=[HandoffSheets.tsx]
- "sheets_mechanicalsheets_architecturesheet": "ArchitectureSheet()" | kind=code-symbol | source=src/components/blueprints/sheets/MechanicalSheets.tsx:L13 | neighbors=[MechanicalSheets.tsx]
- "sheets_mechanicalsheets_explodedassemblysheet": "ExplodedAssemblySheet()" | kind=code-symbol | source=src/components/blueprints/sheets/MechanicalSheets.tsx:L341 | neighbors=[MechanicalSheets.tsx]
- "sheets_mechanicalsheets_internallayoutsheet": "InternalLayoutSheet()" | kind=code-symbol | source=src/components/blueprints/sheets/MechanicalSheets.tsx:L245 | neighbors=[MechanicalSheets.tsx]
- "sheets_mechanicalsheets_outershellsheet": "OuterShellSheet()" | kind=code-symbol | source=src/components/blueprints/sheets/MechanicalSheets.tsx:L138 | neighbors=[MechanicalSheets.tsx]
- "sheets_mechanicalsheets_sheetprops": "SheetProps" | kind=code-symbol | source=src/components/blueprints/sheets/MechanicalSheets.tsx:L5 | neighbors=[MechanicalSheets.tsx]
- "sheets_pcbsheets_boardspecssheet": "BoardSpecsSheet()" | kind=code-symbol | source=src/components/blueprints/sheets/PCBSheets.tsx:L13 | neighbors=[PCBSheets.tsx]
- "sheets_pcbsheets_componentplacementsheet": "ComponentPlacementSheet()" | kind=code-symbol | source=src/components/blueprints/sheets/PCBSheets.tsx:L229 | neighbors=[PCBSheets.tsx]
- "sheets_pcbsheets_sheetprops": "SheetProps" | kind=code-symbol | source=src/components/blueprints/sheets/PCBSheets.tsx:L5 | neighbors=[PCBSheets.tsx]
- "sheets_pcbsheets_stackupconstraintssheet": "StackupConstraintsSheet()" | kind=code-symbol | source=src/components/blueprints/sheets/PCBSheets.tsx:L133 | neighbors=[PCBSheets.tsx]
- "sheets_softwareqasheets_firmwarearchitecturesheet": "FirmwareArchitectureSheet()" | kind=code-symbol | source=src/components/blueprints/sheets/SoftwareQASheets.tsx:L13 | neighbors=[SoftwareQASheets.tsx]
- "sheets_softwareqasheets_sheetprops": "SheetProps" | kind=code-symbol | source=src/components/blueprints/sheets/SoftwareQASheets.tsx:L5 | neighbors=[SoftwareQASheets.tsx]
- "sheets_softwareqasheets_testingvalidationsheet": "TestingValidationSheet()" | kind=code-symbol | source=src/components/blueprints/sheets/SoftwareQASheets.tsx:L116 | neighbors=[SoftwareQASheets.tsx]
- "store_projectstore_inmemoryprojectsstore": "inMemoryProjectsStore" | kind=code-symbol | source=src/store/projectStore.ts:L339 | neighbors=[projectStore.ts]
- "store_projectstore_project": "Project" | kind=code-symbol | neighbors=[ProjectState]
- "store_projectstore_saveprojectstostorage": "saveProjectsToStorage()" | kind=code-symbol | source=src/store/projectStore.ts:L454 | neighbors=[projectStore.ts]
- "store_storagehealthstore_storagehealthstate": "StorageHealthState" | kind=code-symbol | source=src/store/storageHealthStore.ts:L16 | neighbors=[storageHealthStore.ts]
- "store_storagehealthstore_tracked_keys": "TRACKED_KEYS" | kind=code-symbol | source=src/store/storageHealthStore.ts:L14 | neighbors=[storageHealthStore.ts]
- "store_studiocontextstore_studiocontextentity": "StudioContextEntity" | kind=code-symbol | source=src/store/studioContextStore.ts:L3 | neighbors=[studioContextStore.ts]
- "store_studiocontextstore_studiocontextstate": "StudioContextState" | kind=code-symbol | source=src/store/studioContextStore.ts:L21 | neighbors=[studioContextStore.ts]
- "store_studiocontextstore_studioselection": "StudioSelection" | kind=code-symbol | source=src/store/studioContextStore.ts:L15 | neighbors=[studioContextStore.ts]
- "store_workflowpreferencesstore_persist": "persist()" | kind=code-symbol | source=src/store/workflowPreferencesStore.ts:L29 | neighbors=[workflowPreferencesStore.ts]
- "store_workflowpreferencesstore_preferencefromstate": "preferenceFromState()" | kind=code-symbol | source=src/store/workflowPreferencesStore.ts:L38 | neighbors=[workflowPreferencesStore.ts]
- "store_workflowpreferencesstore_workflowpreference": "WorkflowPreference" | kind=code-symbol | neighbors=[WorkflowPreferencesState]
- "studio_engineeringcontextbar_contextualviews": "contextualViews" | kind=code-symbol | source=src/components/studio/EngineeringContextBar.tsx:L18 | neighbors=[EngineeringContextBar.tsx]
- "studio_page_studiopage": "StudioPage()" | kind=code-symbol | source=src/app/studio/page.tsx:L10 | neighbors=[page.tsx]
- "studio_page_studioroot": "StudioRoot" | kind=code-symbol | source=src/app/studio/page.tsx:L5 | neighbors=[page.tsx]
- "studio_studiobuildmap_buildstage": "BuildStage" | kind=code-symbol | source=src/components/studio/StudioBuildMap.tsx:L23 | neighbors=[StudioBuildMap.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\ANKIT BHARDWAJ\Desktop\hardware studio\.graphify\description-instructions\batch-025.json

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
