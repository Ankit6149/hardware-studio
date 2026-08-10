# Node Description Batch 16 of 28

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

- "knowledge_deviceknowledge_deviceknowledgecategory": "DeviceKnowledgeCategory" | kind=code-symbol | source=src/lib/knowledge/deviceKnowledge.ts:L14 | neighbors=[deviceKnowledge.ts, KnowledgeDrawer.tsx]
- "knowledge_deviceknowledge_deviceknowledgeentry": "DeviceKnowledgeEntry" | kind=code-symbol | source=src/lib/knowledge/deviceKnowledge.ts:L47 | neighbors=[deviceKnowledge.ts, starterDeviceKnowledge.ts]
- "knowledge_deviceknowledge_knowledgeentrycompleteness": "knowledgeEntryCompleteness()" | kind=code-symbol | source=src/lib/knowledge/deviceKnowledge.ts:L187 | neighbors=[deviceKnowledge.ts, deviceKnowledge.test.ts]
- "knowledge_deviceknowledge_knowledgeprovenance": "KnowledgeProvenance" | kind=code-symbol | source=src/lib/knowledge/deviceKnowledge.ts:L37 | neighbors=[deviceKnowledge.ts, starterDeviceKnowledge.ts]
- "knowledge_knowledgedrawer_knowledgedrawer": "KnowledgeDrawer()" | kind=code-symbol | source=src/components/knowledge/KnowledgeDrawer.tsx:L52 | neighbors=[KnowledgeDrawer.tsx, KnowledgeProvider.tsx]
- "knowledge_knowledgeprovider_knowledgeprovider": "KnowledgeProvider()" | kind=code-symbol | source=src/components/knowledge/KnowledgeProvider.tsx:L19 | neighbors=[KnowledgeProvider.tsx, StudioRoot.tsx]
- "knowledge_starterdeviceknowledge_getstarterknowledgeentry": "getStarterKnowledgeEntry()" | kind=code-symbol | source=src/lib/knowledge/starterDeviceKnowledge.ts:L553 | neighbors=[KnowledgeDrawer.tsx, starterDeviceKnowledge.ts]
- "lib_blueprintgenerator_dimid": "dimId()" | kind=code-symbol | source=src/lib/blueprintGenerator.ts:L29 | neighbors=[blueprintGenerator.ts, generatePCBLayoutSheet()]
- "lib_blueprintgenerator_emptydrawing": "emptyDrawing()" | kind=code-symbol | source=src/lib/blueprintGenerator.ts:L32 | neighbors=[blueprintGenerator.ts, generateProductRequirementsSheet()]
- "lib_blueprintsheettypes_blueprintdimension": "BlueprintDimension" | kind=code-symbol | source=src/lib/blueprintSheetTypes.ts:L70 | neighbors=[blueprintGenerator.ts, blueprintSheetTypes.ts]
- "lib_blueprintsheettypes_blueprintpackstatustype": "BlueprintPackStatusType" | kind=code-symbol | source=src/lib/blueprintSheetTypes.ts:L24 | neighbors=[blueprintSheetTypes.ts, index.ts]
- "lib_blueprintsheettypes_blueprintpacksummary": "BlueprintPackSummary" | kind=code-symbol | source=src/lib/blueprintSheetTypes.ts:L144 | neighbors=[blueprintGenerator.ts, blueprintSheetTypes.ts]
- "lib_blueprintsheettypes_blueprintsheetstatus": "BlueprintSheetStatus" | kind=code-symbol | source=src/lib/blueprintSheetTypes.ts:L17 | neighbors=[blueprintGenerator.ts, blueprintSheetTypes.ts]
- "lib_blueprintsheettypes_blueprintsourceref": "BlueprintSourceRef" | kind=code-symbol | source=src/lib/blueprintSheetTypes.ts:L120 | neighbors=[blueprintGenerator.ts, blueprintSheetTypes.ts]
- "lib_blueprintsheettypes_blueprinttable": "BlueprintTable" | kind=code-symbol | source=src/lib/blueprintSheetTypes.ts:L99 | neighbors=[blueprintGenerator.ts, blueprintSheetTypes.ts]
- "lib_blueprintsheettypes_blueprintwarning": "BlueprintWarning" | kind=code-symbol | source=src/lib/blueprintSheetTypes.ts:L108 | neighbors=[blueprintGenerator.ts, blueprintSheetTypes.ts]
- "lib_boarddrc_drcid": "drcId()" | kind=code-symbol | source=src/lib/boardDRC.ts:L14 | neighbors=[boardDRC.ts, runBoardDRC()]
- "lib_editorlayoutgenerators_addrequiredfactoryfilechecklist": "addRequiredFactoryFileChecklist()" | kind=code-symbol | source=src/lib/editorLayoutGenerators.ts:L999 | neighbors=[editorLayoutGenerators.ts, getInitialFactoryFiles()]
- "lib_editorlayoutgenerators_autocreatefirmwaretasksfromhardware": "autoCreateFirmwareTasksFromHardware()" | kind=code-symbol | source=src/lib/editorLayoutGenerators.ts:L846 | neighbors=[editorLayoutGenerators.ts, projectStore.ts]
- "lib_editorlayoutgenerators_autocreatehandoffchecklist": "autoCreateHandoffChecklist()" | kind=code-symbol | source=src/lib/editorLayoutGenerators.ts:L955 | neighbors=[editorLayoutGenerators.ts, projectStore.ts]
- "lib_editorlayoutgenerators_autocreatenetsfrompinmap": "autoCreateNetsFromPinMap()" | kind=code-symbol | source=src/lib/editorLayoutGenerators.ts:L767 | neighbors=[editorLayoutGenerators.ts, projectStore.ts]
- "lib_editorlayoutgenerators_autocreatepinmapfromcircuits": "autoCreatePinMapFromCircuits()" | kind=code-symbol | source=src/lib/editorLayoutGenerators.ts:L801 | neighbors=[editorLayoutGenerators.ts, projectStore.ts]
- "lib_editorlayoutgenerators_autocreatetestsfromhardware": "autoCreateTestsFromHardware()" | kind=code-symbol | source=src/lib/editorLayoutGenerators.ts:L910 | neighbors=[editorLayoutGenerators.ts, projectStore.ts]
- "lib_editorlayoutgenerators_autoplacecomponents": "autoPlaceComponents()" | kind=code-symbol | source=src/lib/editorLayoutGenerators.ts:L725 | neighbors=[editorLayoutGenerators.ts, projectStore.ts]
- "lib_editorlayoutgenerators_fixmissingdimensionswithplaceholder": "fixMissingDimensionsWithPlaceholder()" | kind=code-symbol | source=src/lib/editorLayoutGenerators.ts:L985 | neighbors=[editorLayoutGenerators.ts, projectStore.ts]
- "lib_exportfirmware_exportfirmwareskeletonfile": "exportFirmwareSkeletonFile()" | kind=code-symbol | source=src/lib/exportFirmware.ts:L244 | neighbors=[exportFirmware.ts, generateFirmwareSkeleton()]
- "lib_footprints_footprint_library": "FOOTPRINT_LIBRARY" | kind=code-symbol | source=src/lib/footprints.ts:L21 | neighbors=[footprints.ts, nativeExports.ts]
- "lib_footprints_footprintpad": "FootprintPad" | kind=code-symbol | source=src/lib/footprints.ts:L1 | neighbors=[boardGeometry.ts, footprints.ts]
- "lib_footprints_footprintpreset": "FootprintPreset" | kind=code-symbol | source=src/lib/footprints.ts:L9 | neighbors=[boardGeometry.ts, footprints.ts]
- "lib_nativeexports_computecryptosha256": "computeCryptoSHA256()" | kind=code-symbol | source=src/lib/nativeExports.ts:L829 | neighbors=[nativeExports.ts, generateReleasePackageManifest()]
- "lib_nativeexports_exportconceptualmechanicallayoutjson": "exportConceptualMechanicalLayoutJson()" | kind=code-symbol | source=src/lib/nativeExports.ts:L66 | neighbors=[ExportCenter.tsx, nativeExports.ts]
- "lib_nativeexports_exportconceptualnetroutingjson": "exportConceptualNetRoutingJson()" | kind=code-symbol | source=src/lib/nativeExports.ts:L94 | neighbors=[nativeExports.ts, generateNativeNetlistJson()]
- "lib_nativeexports_exportconceptualplacementcsv": "exportConceptualPlacementCsv()" | kind=code-symbol | source=src/lib/nativeExports.ts:L29 | neighbors=[nativeExports.ts, generateNativeCplDraftCsv()]
- "lib_nativeexports_exportconceptualschematicjson": "exportConceptualSchematicJson()" | kind=code-symbol | source=src/lib/nativeExports.ts:L34 | neighbors=[ExportCenter.tsx, nativeExports.ts]
- "lib_nativeexports_exporteditorlayoutsjson": "exportEditorLayoutsJson()" | kind=code-symbol | source=src/lib/nativeExports.ts:L17 | neighbors=[ExportCenter.tsx, nativeExports.ts]
- "lib_nativeexports_exportfactoryreadinessjson": "exportFactoryReadinessJson()" | kind=code-symbol | source=src/lib/nativeExports.ts:L152 | neighbors=[ExportCenter.tsx, nativeExports.ts]
- "lib_nativeexports_exportfirmwarearchitecturejson": "exportFirmwareArchitectureJson()" | kind=code-symbol | source=src/lib/nativeExports.ts:L99 | neighbors=[ExportCenter.tsx, nativeExports.ts]
- "lib_nativeexports_exporthardwarestudioboardjson": "exportHardwareStudioBoardJson()" | kind=code-symbol | source=src/lib/nativeExports.ts:L781 | neighbors=[nativeExports.ts, generateNativeBoardLayoutJson()]
- "lib_nativeexports_exportmissingfactoryfilesmarkdown": "exportMissingFactoryFilesMarkdown()" | kind=code-symbol | source=src/lib/nativeExports.ts:L172 | neighbors=[ExportCenter.tsx, nativeExports.ts]
- "lib_nativeexports_getboarddimensions": "getBoardDimensions()" | kind=code-symbol | source=src/lib/nativeExports.ts:L250 | neighbors=[nativeExports.ts, generateNativeGerberBoardOutline()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\ANKIT BHARDWAJ\Desktop\hardware studio\.graphify\description-instructions\batch-015.json

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
