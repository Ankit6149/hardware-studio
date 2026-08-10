# Node Description Batch 20 of 28

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

- "visual_representationinspector_representationinspector": "RepresentationInspector()" | kind=code-symbol | source=src/components/visual/RepresentationInspector.tsx:L66 | neighbors=[BlueprintCanvas.tsx, RepresentationInspector.tsx]
- "visual_representationregistry_architectureport": "ArchitecturePort" | kind=code-symbol | source=src/lib/visual/representationRegistry.ts:L51 | neighbors=[BlueprintCanvas.tsx, representationRegistry.ts]
- "visual_representationregistry_normalize": "normalize()" | kind=code-symbol | source=src/lib/visual/representationRegistry.ts:L380 | neighbors=[representationRegistry.ts, resolveVisualFamilyId()]
- "visual_representationregistry_portkindstyles": "portKindStyles" | kind=code-symbol | source=src/lib/visual/representationRegistry.ts:L432 | neighbors=[BlueprintCanvas.tsx, representationRegistry.ts]
- "visual_representationregistry_representation": "representation()" | kind=code-symbol | source=src/lib/visual/representationRegistry.ts:L95 | neighbors=[representationRegistry.ts, representationSet()]
- "visual_representationregistry_representationset": "representationSet()" | kind=code-symbol | source=src/lib/visual/representationRegistry.ts:L123 | neighbors=[representationRegistry.ts, representation()]
- "visual_representationregistry_visualfamilyregistry": "visualFamilyRegistry" | kind=code-symbol | source=src/lib/visual/representationRegistry.ts:L249 | neighbors=[visualRepresentationRegistry.test.ts, representationRegistry.ts]
- "workflow_workflowsetupdialog_workflowsetupdialog": "WorkflowSetupDialog()" | kind=code-symbol | source=src/components/workflow/WorkflowSetupDialog.tsx:L180 | neighbors=[StudioRoot.tsx, WorkflowSetupDialog.tsx]
- "app_layout_metadata": "metadata" | kind=code-symbol | source=src/app/layout.tsx:L4 | neighbors=[layout.tsx]
- "app_layout_rootlayout": "RootLayout()" | kind=code-symbol | source=src/app/layout.tsx:L51 | neighbors=[layout.tsx]
- "app_page_foundations": "foundations" | kind=code-symbol | source=src/app/page.tsx:L86 | neighbors=[page.tsx]
- "app_page_graphnode": "GraphNode()" | kind=code-symbol | source=src/app/page.tsx:L428 | neighbors=[page.tsx]
- "app_page_home": "Home()" | kind=code-symbol | source=src/app/page.tsx:L104 | neighbors=[page.tsx]
- "app_page_notready": "notReady" | kind=code-symbol | source=src/app/page.tsx:L95 | neighbors=[page.tsx]
- "app_page_principles": "principles" | kind=code-symbol | source=src/app/page.tsx:L63 | neighbors=[page.tsx]
- "app_page_statuscard": "StatusCard()" | kind=code-symbol | source=src/app/page.tsx:L453 | neighbors=[page.tsx]
- "app_page_workbenches": "workbenches" | kind=code-symbol | source=src/app/page.tsx:L24 | neighbors=[page.tsx]
- "blueprints_blueprintdrawingrenderer_blueprintdrawingrendererprops": "BlueprintDrawingRendererProps" | kind=code-symbol | source=src/components/blueprints/BlueprintDrawingRenderer.tsx:L8 | neighbors=[BlueprintDrawingRenderer.tsx]
- "blueprints_blueprintdrawingrenderer_centeroflongestsegment": "centerOfLongestSegment()" | kind=code-symbol | source=src/components/blueprints/BlueprintDrawingRenderer.tsx:L163 | neighbors=[BlueprintDrawingRenderer.tsx]
- "blueprints_blueprintdrawingrenderer_connectioncolors": "connectionColors" | kind=code-symbol | source=src/components/blueprints/BlueprintDrawingRenderer.tsx:L16 | neighbors=[BlueprintDrawingRenderer.tsx]
- "blueprints_blueprintdrawingrenderer_connectiondash": "connectionDash" | kind=code-symbol | source=src/components/blueprints/BlueprintDrawingRenderer.tsx:L26 | neighbors=[BlueprintDrawingRenderer.tsx]
- "blueprints_blueprintdrawingrenderer_path": "path()" | kind=code-symbol | source=src/components/blueprints/BlueprintDrawingRenderer.tsx:L159 | neighbors=[BlueprintDrawingRenderer.tsx]
- "blueprints_blueprintdrawingrenderer_point": "Point" | kind=code-symbol | source=src/components/blueprints/BlueprintDrawingRenderer.tsx:L13 | neighbors=[BlueprintDrawingRenderer.tsx]
- "blueprints_blueprintdrawingrenderer_ports": "Ports()" | kind=code-symbol | source=src/components/blueprints/BlueprintDrawingRenderer.tsx:L188 | neighbors=[BlueprintDrawingRenderer.tsx]
- "blueprints_blueprintdrawingrenderer_symbolkind": "SymbolKind" | kind=code-symbol | source=src/components/blueprints/BlueprintDrawingRenderer.tsx:L14 | neighbors=[BlueprintDrawingRenderer.tsx]
- "blueprints_blueprintpagelayout_blueprintpagelayout": "BlueprintPageLayout()" | kind=code-symbol | source=src/components/blueprints/BlueprintPageLayout.tsx:L16 | neighbors=[BlueprintPageLayout.tsx]
- "blueprints_blueprintpagelayout_blueprintpagelayoutprops": "BlueprintPageLayoutProps" | kind=code-symbol | source=src/components/blueprints/BlueprintPageLayout.tsx:L4 | neighbors=[BlueprintPageLayout.tsx]
- "blueprints_blueprintsheetrenderer_blueprintsheetrendererprops": "BlueprintSheetRendererProps" | kind=code-symbol | source=src/components/blueprints/BlueprintSheetRenderer.tsx:L6 | neighbors=[BlueprintSheetRenderer.tsx]
- "blueprints_blueprintsheetrenderer_severityicons": "severityIcons" | kind=code-symbol | source=src/components/blueprints/BlueprintSheetRenderer.tsx:L20 | neighbors=[BlueprintSheetRenderer.tsx]
- "blueprints_blueprintsheetrenderer_statusstyles": "statusStyles" | kind=code-symbol | source=src/components/blueprints/BlueprintSheetRenderer.tsx:L12 | neighbors=[BlueprintSheetRenderer.tsx]
- "blueprints_blueprinttitleblock_blueprinttitleblockprops": "BlueprintTitleBlockProps" | kind=code-symbol | source=src/components/blueprints/BlueprintTitleBlock.tsx:L3 | neighbors=[BlueprintTitleBlock.tsx]
- "blueprints_mfgmanifestengine_manufacturingfilemanifest": "ManufacturingFileManifest" | kind=code-symbol | source=src/lib/blueprints/mfgManifestEngine.ts:L13 | neighbors=[mfgManifestEngine.ts]
- "blueprints_mfgmanifestengine_manufacturingmanifestpackage": "ManufacturingManifestPackage" | kind=code-symbol | source=src/lib/blueprints/mfgManifestEngine.ts:L21 | neighbors=[mfgManifestEngine.ts]
- "board_boardcanvas_boardcanvasprops": "BoardCanvasProps" | kind=code-symbol | source=src/components/board/BoardCanvas.tsx:L20 | neighbors=[BoardCanvas.tsx]
- "board_boardcomponentbin_boardcomponentbinprops": "BoardComponentBinProps" | kind=code-symbol | source=src/components/board/BoardComponentBin.tsx:L7 | neighbors=[BoardComponentBin.tsx]
- "board_boarddesigner_righttab": "RightTab" | kind=code-symbol | source=src/components/board/BoardDesigner.tsx:L33 | neighbors=[BoardDesigner.tsx]
- "board_boarddrcpanel_boarddrcpanelprops": "BoardDRCPanelProps" | kind=code-symbol | source=src/components/board/BoardDRCPanel.tsx:L6 | neighbors=[BoardDRCPanel.tsx]
- "board_boarddrcpanel_severitycolor": "severityColor" | kind=code-symbol | source=src/components/board/BoardDRCPanel.tsx:L16 | neighbors=[BoardDRCPanel.tsx]
- "board_boarddrcpanel_severityicon": "severityIcon" | kind=code-symbol | source=src/components/board/BoardDRCPanel.tsx:L13 | neighbors=[BoardDRCPanel.tsx]
- "board_boarddrcpanel_severityorder": "severityOrder" | kind=code-symbol | source=src/components/board/BoardDRCPanel.tsx:L12 | neighbors=[BoardDRCPanel.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\ANKIT BHARDWAJ\Desktop\hardware studio\.graphify\description-instructions\batch-019.json

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
