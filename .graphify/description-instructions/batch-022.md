# Node Description Batch 23 of 28

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

- "knowledge_deviceknowledge_knowledgeworkbenchlink": "KnowledgeWorkbenchLink" | kind=code-symbol | source=src/lib/knowledge/deviceKnowledge.ts:L17 | neighbors=[deviceKnowledge.ts]
- "knowledge_knowledgedrawer_detailsection": "DetailSection()" | kind=code-symbol | source=src/components/knowledge/KnowledgeDrawer.tsx:L32 | neighbors=[KnowledgeDrawer.tsx]
- "knowledge_knowledgedrawer_guidancelist": "GuidanceList()" | kind=code-symbol | source=src/components/knowledge/KnowledgeDrawer.tsx:L39 | neighbors=[KnowledgeDrawer.tsx]
- "knowledge_knowledgedrawer_knowledgedrawerprops": "KnowledgeDrawerProps" | kind=code-symbol | source=src/components/knowledge/KnowledgeDrawer.tsx:L26 | neighbors=[KnowledgeDrawer.tsx]
- "knowledge_knowledgeprovider_knowledgecontext": "KnowledgeContext" | kind=code-symbol | source=src/components/knowledge/KnowledgeProvider.tsx:L17 | neighbors=[KnowledgeProvider.tsx]
- "knowledge_knowledgeprovider_knowledgecontextvalue": "KnowledgeContextValue" | kind=code-symbol | source=src/components/knowledge/KnowledgeProvider.tsx:L8 | neighbors=[KnowledgeProvider.tsx]
- "knowledge_starterdeviceknowledge_arduino_learning_reference": "ARDUINO_LEARNING_REFERENCE" | kind=code-symbol | source=src/lib/knowledge/starterDeviceKnowledge.ts:L18 | neighbors=[starterDeviceKnowledge.ts]
- "knowledge_starterdeviceknowledge_open_source_library_references": "OPEN_SOURCE_LIBRARY_REFERENCES" | kind=code-symbol | source=src/lib/knowledge/starterDeviceKnowledge.ts:L3 | neighbors=[starterDeviceKnowledge.ts]
- "knowledge_starterdeviceknowledge_provenance": "provenance()" | kind=code-symbol | source=src/lib/knowledge/starterDeviceKnowledge.ts:L23 | neighbors=[starterDeviceKnowledge.ts]
- "lib_blueprintpackexport_exportblueprintpacksummaryjson": "exportBlueprintPackSummaryJson()" | kind=code-symbol | source=src/lib/blueprintPackExport.ts:L219 | neighbors=[blueprintPackExport.ts]
- "lib_blueprintpackexport_rendersheethtml": "renderSheetHtml()" | kind=code-symbol | source=src/lib/blueprintPackExport.ts:L97 | neighbors=[blueprintPackExport.ts]
- "lib_blueprintsheettypes_blueprintcallout": "BlueprintCallout" | kind=code-symbol | source=src/lib/blueprintSheetTypes.ts:L78 | neighbors=[blueprintSheetTypes.ts]
- "lib_blueprintsheettypes_blueprintsheetcategory": "BlueprintSheetCategory" | kind=code-symbol | source=src/lib/blueprintSheetTypes.ts:L5 | neighbors=[blueprintSheetTypes.ts]
- "lib_exportboardplan_escapecsv": "escapeCsv()" | kind=code-symbol | source=src/lib/exportBoardPlan.ts:L3 | neighbors=[exportBoardPlan.ts]
- "lib_exportboardplan_escapemarkdown": "escapeMarkdown()" | kind=code-symbol | source=src/lib/exportBoardPlan.ts:L9 | neighbors=[exportBoardPlan.ts]
- "lib_exportboardplan_exportboardcomponentscsv": "exportBoardComponentsCsv()" | kind=code-symbol | source=src/lib/exportBoardPlan.ts:L129 | neighbors=[exportBoardPlan.ts]
- "lib_exportboardplan_exportboardplanjson": "exportBoardPlanJson()" | kind=code-symbol | source=src/lib/exportBoardPlan.ts:L87 | neighbors=[exportBoardPlan.ts]
- "lib_exportboardplan_exportboardplanmarkdown": "exportBoardPlanMarkdown()" | kind=code-symbol | source=src/lib/exportBoardPlan.ts:L14 | neighbors=[exportBoardPlan.ts]
- "lib_exportboardplan_exportmanufacturingchecklistmarkdown": "exportManufacturingChecklistMarkdown()" | kind=code-symbol | source=src/lib/exportBoardPlan.ts:L153 | neighbors=[exportBoardPlan.ts]
- "lib_exportboardplan_exportnetlistcsv": "exportNetlistCsv()" | kind=code-symbol | source=src/lib/exportBoardPlan.ts:L105 | neighbors=[exportBoardPlan.ts]
- "lib_exportdossier_escapemarkdown": "escapeMarkdown()" | kind=code-symbol | source=src/lib/exportDossier.ts:L4 | neighbors=[exportDossier.ts]
- "lib_exportmarkdown_escapemarkdown": "escapeMarkdown()" | kind=code-symbol | source=src/lib/exportMarkdown.ts:L4 | neighbors=[exportMarkdown.ts]
- "lib_footprints_validatefootprintlibrary": "validateFootprintLibrary()" | kind=code-symbol | source=src/lib/footprints.ts:L491 | neighbors=[footprints.ts]
- "lib_nativeexports_csvcell": "csvCell()" | kind=code-symbol | source=src/lib/nativeExports.ts:L6 | neighbors=[nativeExports.ts]
- "lib_nativeexports_exporttestingplanjson": "exportTestingPlanJson()" | kind=code-symbol | source=src/lib/nativeExports.ts:L132 | neighbors=[nativeExports.ts]
- "lib_navigationregistry_item": "item()" | kind=code-symbol | source=src/lib/navigationRegistry.ts:L90 | neighbors=[navigationRegistry.ts]
- "lib_navigationregistry_navigationitem": "NavigationItem" | kind=code-symbol | source=src/lib/navigationRegistry.ts:L72 | neighbors=[navigationRegistry.ts]
- "lib_navigationregistry_navigationitembyid": "navigationItemById" | kind=code-symbol | source=src/lib/navigationRegistry.ts:L229 | neighbors=[navigationRegistry.ts]
- "lib_navigationregistry_navigationlayout": "NavigationLayout" | kind=code-symbol | source=src/lib/navigationRegistry.ts:L70 | neighbors=[navigationRegistry.ts]
- "lib_projectserialization_projectintegrityissue": "ProjectIntegrityIssue" | kind=code-symbol | source=src/lib/projectSerialization.ts:L6 | neighbors=[projectSerialization.ts]
- "lib_releaseengine_mergeconflict": "MergeConflict" | kind=code-symbol | source=src/lib/releaseEngine.ts:L12 | neighbors=[releaseEngine.ts]
- "lib_releaseengine_mergeresult": "MergeResult" | kind=code-symbol | source=src/lib/releaseEngine.ts:L19 | neighbors=[releaseEngine.ts]
- "lib_reliability_diagnosticcontext": "DiagnosticContext" | kind=code-symbol | source=src/lib/reliability.ts:L115 | neighbors=[reliability.ts]
- "lib_reliability_storagehealthstatus": "StorageHealthStatus" | kind=code-symbol | source=src/lib/reliability.ts:L3 | neighbors=[reliability.ts]
- "lib_reliability_storageoperationresult": "StorageOperationResult" | kind=code-symbol | source=src/lib/reliability.ts:L13 | neighbors=[reliability.ts]
- "lib_validationrules_warning": "Warning" | kind=code-symbol | source=src/lib/validationRules.ts:L3 | neighbors=[validationRules.ts]
- "lib_validationrunner_executerunoptions": "ExecuteRunOptions" | kind=code-symbol | source=src/lib/validationRunner.ts:L6 | neighbors=[validationRunner.ts]
- "lib_workflowprofiles_all_domains": "ALL_DOMAINS" | kind=code-symbol | source=src/lib/workflowProfiles.ts:L84 | neighbors=[workflowProfiles.ts]
- "lib_workflowprofiles_guidedworkflowaction": "GuidedWorkflowAction" | kind=code-symbol | source=src/lib/workflowProfiles.ts:L75 | neighbors=[workflowProfiles.ts]
- "lib_workflowprofiles_profilebyid": "profileById" | kind=code-symbol | source=src/lib/workflowProfiles.ts:L145 | neighbors=[workflowProfiles.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\ANKIT BHARDWAJ\Desktop\hardware studio\.graphify\description-instructions\batch-022.json

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
