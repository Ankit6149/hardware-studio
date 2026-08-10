# Node Description Batch 29 of 29

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

- "validation_validationstudio_tdstyle": "tdStyle" | kind=code-symbol | source=src/components/validation/ValidationStudio.tsx:L473 | neighbors=[ValidationStudio.tsx]
- "validation_validationstudio_thstyle": "thStyle" | kind=code-symbol | source=src/components/validation/ValidationStudio.tsx:L472 | neighbors=[ValidationStudio.tsx]
- "validation_validationstudio_validationstudioprops": "ValidationStudioProps" | kind=code-symbol | source=src/components/validation/ValidationStudio.tsx:L10 | neighbors=[ValidationStudio.tsx]
- "visual_devicevisual_architectureglyphprops": "ArchitectureGlyphProps" | kind=code-symbol | source=src/components/visual/DeviceVisual.tsx:L31 | neighbors=[DeviceVisual.tsx]
- "visual_devicevisual_devicevisualprops": "DeviceVisualProps" | kind=code-symbol | source=src/components/visual/DeviceVisual.tsx:L23 | neighbors=[DeviceVisual.tsx]
- "visual_devicevisual_footprintvisual": "FootprintVisual()" | kind=code-symbol | source=src/components/visual/DeviceVisual.tsx:L164 | neighbors=[DeviceVisual.tsx]
- "visual_devicevisual_lazylightweight3dpreview": "LazyLightweight3DPreview" | kind=code-symbol | source=src/components/visual/DeviceVisual.tsx:L19 | neighbors=[DeviceVisual.tsx]
- "visual_devicevisual_packagevisual": "PackageVisual()" | kind=code-symbol | source=src/components/visual/DeviceVisual.tsx:L191 | neighbors=[DeviceVisual.tsx]
- "visual_devicevisual_pictorialvisual": "PictorialVisual()" | kind=code-symbol | source=src/components/visual/DeviceVisual.tsx:L138 | neighbors=[DeviceVisual.tsx]
- "visual_devicevisual_schematicvisual": "SchematicVisual()" | kind=code-symbol | source=src/components/visual/DeviceVisual.tsx:L99 | neighbors=[DeviceVisual.tsx]
- "visual_devicevisual_unavailablevisual": "UnavailableVisual()" | kind=code-symbol | source=src/components/visual/DeviceVisual.tsx:L223 | neighbors=[DeviceVisual.tsx]
- "visual_devicevisual_unavailablevisualprops": "UnavailableVisualProps" | kind=code-symbol | source=src/components/visual/DeviceVisual.tsx:L217 | neighbors=[DeviceVisual.tsx]
- "visual_lightweight3dpreview_lightweight3dpreview": "Lightweight3DPreview()" | kind=code-symbol | source=src/components/visual/Lightweight3DPreview.tsx:L233 | neighbors=[Lightweight3DPreview.tsx]
- "visual_lightweight3dpreview_lightweight3dpreviewprops": "Lightweight3DPreviewProps" | kind=code-symbol | source=src/components/visual/Lightweight3DPreview.tsx:L10 | neighbors=[Lightweight3DPreview.tsx]
- "visual_lightweight3dpreview_qualitypixelratio": "qualityPixelRatio" | kind=code-symbol | source=src/components/visual/Lightweight3DPreview.tsx:L16 | neighbors=[Lightweight3DPreview.tsx]
- "visual_lightweight3dpreview_renderwebglunavailable": "renderWebGLUnavailable()" | kind=code-symbol | source=src/components/visual/Lightweight3DPreview.tsx:L226 | neighbors=[Lightweight3DPreview.tsx]
- "visual_representationinspector_representationicon": "representationIcon" | kind=code-symbol | source=src/components/visual/RepresentationInspector.tsx:L41 | neighbors=[RepresentationInspector.tsx]
- "visual_representationinspector_representationinspectorprops": "RepresentationInspectorProps" | kind=code-symbol | source=src/components/visual/RepresentationInspector.tsx:L35 | neighbors=[RepresentationInspector.tsx]
- "visual_representationinspector_statusclasses": "statusClasses" | kind=code-symbol | source=src/components/visual/RepresentationInspector.tsx:L52 | neighbors=[RepresentationInspector.tsx]
- "visual_representationinspector_trustclasses": "trustClasses" | kind=code-symbol | source=src/components/visual/RepresentationInspector.tsx:L59 | neighbors=[RepresentationInspector.tsx]
- "visual_representationregistry_architectureportdirection": "ArchitecturePortDirection" | kind=code-symbol | source=src/lib/visual/representationRegistry.ts:L27 | neighbors=[representationRegistry.ts]
- "visual_representationregistry_architectureportkind": "ArchitecturePortKind" | kind=code-symbol | source=src/lib/visual/representationRegistry.ts:L16 | neighbors=[representationRegistry.ts]
- "visual_representationregistry_familybyid": "familyById" | kind=code-symbol | source=src/lib/visual/representationRegistry.ts:L372 | neighbors=[representationRegistry.ts]
- "visual_representationregistry_port": "port()" | kind=code-symbol | source=src/lib/visual/representationRegistry.ts:L241 | neighbors=[representationRegistry.ts]
- "visual_representationregistry_representationavailability": "RepresentationAvailability" | kind=code-symbol | source=src/lib/visual/representationRegistry.ts:L59 | neighbors=[representationRegistry.ts]
- "visual_representationregistry_representationstatus": "RepresentationStatus" | kind=code-symbol | source=src/lib/visual/representationRegistry.ts:L14 | neighbors=[representationRegistry.ts]
- "visual_representationregistry_representationtrust": "RepresentationTrust" | kind=code-symbol | source=src/lib/visual/representationRegistry.ts:L15 | neighbors=[representationRegistry.ts]
- "visual_representationregistry_visualfamilydefinition": "VisualFamilyDefinition" | kind=code-symbol | source=src/lib/visual/representationRegistry.ts:L71 | neighbors=[representationRegistry.ts]
- "visual_representationregistry_visualnodelike": "VisualNodeLike" | kind=code-symbol | source=src/lib/visual/representationRegistry.ts:L84 | neighbors=[representationRegistry.ts]
- "vitest_config": "vitest.config.ts" | kind=code-symbol | source=vitest.config.ts:L1 | neighbors=[931aeec fix: resolve ValidationTest typ…]
- "workflow_workflowsetupdialog_domaindetail": "domainDetail" | kind=code-symbol | source=src/components/workflow/WorkflowSetupDialog.tsx:L28 | neighbors=[WorkflowSetupDialog.tsx]
- "workflow_workflowsetupdialog_workflowsetupsession": "WorkflowSetupSession()" | kind=code-symbol | source=src/components/workflow/WorkflowSetupDialog.tsx:L41 | neighbors=[WorkflowSetupDialog.tsx]
- "workflow_workflowsetupdialog_workflowsetupsessionprops": "WorkflowSetupSessionProps" | kind=code-symbol | source=src/components/workflow/WorkflowSetupDialog.tsx:L34 | neighbors=[WorkflowSetupDialog.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\ANKIT BHARDWAJ\Desktop\hardware studio\.graphify\description-instructions\batch-028.json

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
