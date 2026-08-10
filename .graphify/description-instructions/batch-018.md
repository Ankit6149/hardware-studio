# Node Description Batch 19 of 28

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

- "studio_studiobuildmap_studiobuildmap": "StudioBuildMap()" | kind=code-symbol | source=src/components/studio/StudioBuildMap.tsx:L53 | neighbors=[AppShell.tsx, StudioBuildMap.tsx]
- "studio_unifiedboarddrcworkbench_unifiedboarddrcworkbench": "UnifiedBoardDRCWorkbench()" | kind=code-symbol | source=src/components/studio/UnifiedBoardDRCWorkbench.tsx:L27 | neighbors=[AppShell.tsx, UnifiedBoardDRCWorkbench.tsx]
- "studio_unifiedbomworkbench_unifiedbomworkbench": "UnifiedBOMWorkbench()" | kind=code-symbol | source=src/components/studio/UnifiedBOMWorkbench.tsx:L21 | neighbors=[AppShell.tsx, UnifiedBOMWorkbench.tsx]
- "studio_unifiedvalidationworkbench_unifiedvalidationworkbench": "UnifiedValidationWorkbench()" | kind=code-symbol | source=src/components/studio/UnifiedValidationWorkbench.tsx:L21 | neighbors=[AppShell.tsx, UnifiedValidationWorkbench.tsx]
- "studio_unifiedworkbenchadapters_unifiedboarddesignerworkbench": "UnifiedBoardDesignerWorkbench()" | kind=code-symbol | source=src/components/studio/UnifiedWorkbenchAdapters.tsx:L58 | neighbors=[AppShell.tsx, UnifiedWorkbenchAdapters.tsx]
- "studio_unifiedworkbenchadapters_unifiedcomponentlibraryworkbench": "UnifiedComponentLibraryWorkbench()" | kind=code-symbol | source=src/components/studio/UnifiedWorkbenchAdapters.tsx:L12 | neighbors=[AppShell.tsx, UnifiedWorkbenchAdapters.tsx]
- "studio_unifiedworkbenchadapters_unifiedmechanicalworkbench": "UnifiedMechanicalWorkbench()" | kind=code-symbol | source=src/components/studio/UnifiedWorkbenchAdapters.tsx:L65 | neighbors=[AppShell.tsx, UnifiedWorkbenchAdapters.tsx]
- "studio_unifiedworkbenchadapters_unifiedschematicworkbench": "UnifiedSchematicWorkbench()" | kind=code-symbol | source=src/components/studio/UnifiedWorkbenchAdapters.tsx:L32 | neighbors=[AppShell.tsx, UnifiedWorkbenchAdapters.tsx]
- "templates_blebuttontemplate_blebuttontemplate": "bleButtonTemplate" | kind=code-symbol | source=src/data/templates/bleButtonTemplate.ts:L3 | neighbors=[bleButtonTemplate.ts, index.ts]
- "templates_emptytemplate_emptytemplate": "emptyTemplate" | kind=code-symbol | source=src/data/templates/emptyTemplate.ts:L3 | neighbors=[emptyTemplate.ts, index.ts]
- "templates_genericwearabletemplate_genericwearabletemplate": "genericWearableTemplate" | kind=code-symbol | source=src/data/templates/genericWearableTemplate.ts:L3 | neighbors=[genericWearableTemplate.ts, index.ts]
- "templates_index_templatemetadata": "TemplateMetadata" | kind=code-symbol | source=src/data/templates/index.ts:L9 | neighbors=[TemplatePicker.tsx, index.ts]
- "templates_iotsensortemplate_iotsensortemplate": "iotSensorTemplate" | kind=code-symbol | source=src/data/templates/iotSensorTemplate.ts:L3 | neighbors=[index.ts, iotSensorTemplate.ts]
- "templates_theringtemplate_theringtemplate": "theRingTemplate" | kind=code-symbol | source=src/data/templates/theRingTemplate.ts:L3 | neighbors=[index.ts, theRingTemplate.ts]
- "types_index_assemblylayer": "AssemblyLayer" | kind=code-symbol | source=src/types/index.ts:L306 | neighbors=[projectStore.ts, index.ts]
- "types_index_boardoutline": "BoardOutline" | kind=code-symbol | source=src/types/index.ts:L405 | neighbors=[boardGeometry.ts, index.ts]
- "types_index_circuitblock": "CircuitBlock" | kind=code-symbol | source=src/types/index.ts:L143 | neighbors=[projectStore.ts, index.ts]
- "types_index_drillhole": "DrillHole" | kind=code-symbol | source=src/types/index.ts:L578 | neighbors=[projectStore.ts, index.ts]
- "types_index_editormode": "EditorMode" | kind=code-symbol | source=src/types/index.ts:L744 | neighbors=[projectStore.ts, index.ts]
- "types_index_editorobject": "EditorObject" | kind=code-symbol | source=src/types/index.ts:L758 | neighbors=[projectStore.ts, index.ts]
- "types_index_keepoutzone": "KeepoutZone" | kind=code-symbol | source=src/types/index.ts:L539 | neighbors=[projectStore.ts, index.ts]
- "types_index_mcpauditrecord": "MCPAuditRecord" | kind=code-symbol | source=src/types/index.ts:L525 | neighbors=[mcpServer.ts, index.ts]
- "types_index_mcpproposal": "MCPProposal" | kind=code-symbol | source=src/types/index.ts:L510 | neighbors=[mcpServer.ts, index.ts]
- "types_index_mechanicalbody": "MechanicalBody" | kind=code-symbol | source=src/types/index.ts:L370 | neighbors=[webgl3DView.test.ts, index.ts]
- "types_index_mechanicaldimension": "MechanicalDimension" | kind=code-symbol | source=src/types/index.ts:L894 | neighbors=[projectStore.ts, index.ts]
- "types_index_mechanicalzone": "MechanicalZone" | kind=code-symbol | source=src/types/index.ts:L290 | neighbors=[projectStore.ts, index.ts]
- "types_index_pcbrule": "PcbRule" | kind=code-symbol | source=src/types/index.ts:L592 | neighbors=[projectStore.ts, index.ts]
- "types_index_powerbudgetitem": "PowerBudgetItem" | kind=code-symbol | source=src/types/index.ts:L92 | neighbors=[projectStore.ts, index.ts]
- "types_index_productrevision": "ProductRevision" | kind=code-symbol | source=src/types/index.ts:L615 | neighbors=[releaseEngine.ts, index.ts]
- "types_index_schematicconnection": "SchematicConnection" | kind=code-symbol | source=src/types/index.ts:L332 | neighbors=[projectStore.ts, index.ts]
- "types_index_schematicsymbol": "SchematicSymbol" | kind=code-symbol | source=src/types/index.ts:L318 | neighbors=[projectStore.ts, index.ts]
- "types_index_schematicwire": "SchematicWire" | kind=code-symbol | source=src/types/index.ts:L356 | neighbors=[projectStore.ts, index.ts]
- "types_index_validationrun": "ValidationRun" | kind=code-symbol | source=src/types/index.ts:L492 | neighbors=[validationRunner.ts, index.ts]
- "types_index_validationteststep": "ValidationTestStep" | kind=code-symbol | source=src/types/index.ts:L944 | neighbors=[index.ts, ValidationStudio.tsx]
- "ui_formcontrols_input": "Input()" | kind=code-symbol | source=src/ui/FormControls.tsx:L8 | neighbors=[ProjectManager.tsx, FormControls.tsx]
- "ui_formcontrols_textarea": "Textarea()" | kind=code-symbol | source=src/ui/FormControls.tsx:L78 | neighbors=[ProjectManager.tsx, FormControls.tsx]
- "validation_validationcoverage_coverageentry": "CoverageEntry" | kind=code-symbol | source=src/lib/validation/validationCoverage.ts:L4 | neighbors=[validationCoverage.ts, ValidationStudio.tsx]
- "validation_validationstudio_statuscolor": "statusColor()" | kind=code-symbol | source=src/components/validation/ValidationStudio.tsx:L459 | neighbors=[ValidationStudio.tsx, ValidationStudio()]
- "visual_devicevisual_commonstroke": "commonStroke" | kind=code-symbol | source=src/components/visual/DeviceVisual.tsx:L37 | neighbors=[DeviceVisual.tsx, ArchitectureGlyph()]
- "visual_devicevisual_devicevisual": "DeviceVisual()" | kind=code-symbol | source=src/components/visual/DeviceVisual.tsx:L235 | neighbors=[DeviceVisual.tsx, RepresentationInspector.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\ANKIT BHARDWAJ\Desktop\hardware studio\.graphify\description-instructions\batch-018.json

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
