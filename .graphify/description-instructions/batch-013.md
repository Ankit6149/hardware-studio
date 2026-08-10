# Node Description Batch 14 of 28

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

- "types_index_pinmapitem": "PinMapItem" | kind=code-symbol | source=src/types/index.ts:L103 | neighbors=[editorLayoutGenerators.ts, projectStore.ts, index.ts]
- "types_index_validationevidence": "ValidationEvidence" | kind=code-symbol | source=src/types/index.ts:L966 | neighbors=[index.ts, measurementEvaluation.ts, ValidationStudio.tsx]
- "types_index_via": "Via" | kind=code-symbol | source=src/types/index.ts:L560 | neighbors=[pcbRoutingEngine.ts, projectStore.ts, index.ts]
- "ui_card_card": "Card()" | kind=code-symbol | source=src/ui/Card.tsx:L7 | neighbors=[ReadinessDashboard.tsx, TemplatePicker.tsx, Card.tsx]
- "ui_card_cardcontent": "CardContent()" | kind=code-symbol | source=src/ui/Card.tsx:L45 | neighbors=[ReadinessDashboard.tsx, TemplatePicker.tsx, Card.tsx]
- "ui_card_cardheader": "CardHeader()" | kind=code-symbol | source=src/ui/Card.tsx:L25 | neighbors=[ReadinessDashboard.tsx, TemplatePicker.tsx, Card.tsx]
- "ui_card_cardtitle": "CardTitle()" | kind=code-symbol | source=src/ui/Card.tsx:L35 | neighbors=[ReadinessDashboard.tsx, TemplatePicker.tsx, Card.tsx]
- "ui_emptystate": "EmptyState.tsx" | kind=code-symbol | source=src/ui/EmptyState.tsx:L1 | neighbors=[0e8fa7a feat: complete local-first hard…, EmptyState(), EmptyStateProps]
- "ui_modal_modal": "Modal()" | kind=code-symbol | source=src/ui/Modal.tsx:L13 | neighbors=[ProjectManager.tsx, TemplatePicker.tsx, Modal.tsx]
- "ui_statcard_statcard": "StatCard()" | kind=code-symbol | source=src/ui/StatCard.tsx:L12 | neighbors=[PinMapTable.tsx, PowerBudgetTable.tsx, StatCard.tsx]
- "validation_measurementevaluation_calculateteststatus": "calculateTestStatus()" | kind=code-symbol | source=src/lib/validation/measurementEvaluation.ts:L69 | neighbors=[projectStore.test.ts, measurementEvaluation.ts, ValidationStudio.tsx]
- "validation_validationstudio_validationstudio": "ValidationStudio()" | kind=code-symbol | source=src/components/validation/ValidationStudio.tsx:L14 | neighbors=[UnifiedValidationWorkbench.tsx, ValidationStudio.tsx, statusColor()]
- "visual_lightweight3dpreview_addbox": "addBox()" | kind=code-symbol | source=src/components/visual/Lightweight3DPreview.tsx:L26 | neighbors=[Lightweight3DPreview.tsx, material(), buildFamilyModel()]
- "visual_lightweight3dpreview_addcylinder": "addCylinder()" | kind=code-symbol | source=src/components/visual/Lightweight3DPreview.tsx:L39 | neighbors=[Lightweight3DPreview.tsx, material(), buildFamilyModel()]
- "visual_lightweight3dpreview_addpins": "addPins()" | kind=code-symbol | source=src/components/visual/Lightweight3DPreview.tsx:L54 | neighbors=[Lightweight3DPreview.tsx, material(), buildFamilyModel()]
- "visual_lightweight3dpreview_visualqualityprofile": "VisualQualityProfile" | kind=code-symbol | source=src/components/visual/Lightweight3DPreview.tsx:L8 | neighbors=[DeviceVisual.tsx, Lightweight3DPreview.tsx, RepresentationInspector.tsx]
- "visual_representationregistry_porthandleid": "portHandleId()" | kind=code-symbol | source=src/lib/visual/representationRegistry.ts:L444 | neighbors=[BlueprintCanvas.tsx, visualRepresentationRegistry.test.ts, representationRegistry.ts]
- "visual_representationregistry_portkindfromhandleid": "portKindFromHandleId()" | kind=code-symbol | source=src/lib/visual/representationRegistry.ts:L448 | neighbors=[BlueprintCanvas.tsx, visualRepresentationRegistry.test.ts, representationRegistry.ts]
- "visual_representationregistry_representation_kinds": "REPRESENTATION_KINDS" | kind=code-symbol | source=src/lib/visual/representationRegistry.ts:L1 | neighbors=[visualRepresentationRegistry.test.ts, RepresentationInspector.tsx, representationRegistry.ts]
- "visual_representationregistry_representationkind": "RepresentationKind" | kind=code-symbol | source=src/lib/visual/representationRegistry.ts:L12 | neighbors=[DeviceVisual.tsx, RepresentationInspector.tsx, representationRegistry.ts]
- "visual_representationregistry_representationstatuscounts": "representationStatusCounts()" | kind=code-symbol | source=src/lib/visual/representationRegistry.ts:L454 | neighbors=[visualRepresentationRegistry.test.ts, RepresentationInspector.tsx, representationRegistry.ts]
- "visual_representationregistry_visualfamilyid": "VisualFamilyId" | kind=code-symbol | source=src/lib/visual/representationRegistry.ts:L29 | neighbors=[DeviceVisual.tsx, Lightweight3DPreview.tsx, representationRegistry.ts]
- "blueprints_blueprintdrawingrenderer_anchor": "anchor()" | kind=code-symbol | source=src/components/blueprints/BlueprintDrawingRenderer.tsx:L138 | neighbors=[BlueprintDrawingRenderer.tsx, connectionPoints()]
- "blueprints_blueprintdrawingrenderer_connectionpoints": "connectionPoints()" | kind=code-symbol | source=src/components/blueprints/BlueprintDrawingRenderer.tsx:L147 | neighbors=[BlueprintDrawingRenderer.tsx, anchor()]
- "blueprints_blueprintdrawingrenderer_labellines": "labelLines()" | kind=code-symbol | source=src/components/blueprints/BlueprintDrawingRenderer.tsx:L124 | neighbors=[BlueprintDrawingRenderer.tsx, TechnicalLabel()]
- "blueprints_blueprintdrawingrenderer_symbol": "Symbol()" | kind=code-symbol | source=src/components/blueprints/BlueprintDrawingRenderer.tsx:L193 | neighbors=[BlueprintDrawingRenderer.tsx, classify()]
- "blueprints_blueprintsheetrenderer_blueprintsheetrenderer": "BlueprintSheetRenderer()" | kind=code-symbol | source=src/components/blueprints/BlueprintSheetRenderer.tsx:L27 | neighbors=[BlueprintSheetRenderer.tsx, BlueprintSheets.tsx]
- "blueprints_blueprinttitleblock_blueprinttitleblock": "BlueprintTitleBlock()" | kind=code-symbol | source=src/components/blueprints/BlueprintTitleBlock.tsx:L13 | neighbors=[BlueprintPageLayout.tsx, BlueprintTitleBlock.tsx]
- "board_boardcanvas_boardcanvas": "BoardCanvas()" | kind=code-symbol | source=src/components/board/BoardCanvas.tsx:L26 | neighbors=[BoardCanvas.tsx, BoardDesigner.tsx]
- "board_boardcomponentbin_boardcomponentbin": "BoardComponentBin()" | kind=code-symbol | source=src/components/board/BoardComponentBin.tsx:L13 | neighbors=[BoardComponentBin.tsx, BoardDesigner.tsx]
- "board_boarddesigner_boarddesigner": "BoardDesigner()" | kind=code-symbol | source=src/components/board/BoardDesigner.tsx:L35 | neighbors=[BoardDesigner.tsx, UnifiedWorkbenchAdapters.tsx]
- "board_boarddrcpanel_boarddrcpanel": "BoardDRCPanel()" | kind=code-symbol | source=src/components/board/BoardDRCPanel.tsx:L20 | neighbors=[BoardDesigner.tsx, BoardDRCPanel.tsx]
- "board_boardgeometry_bboxesoverlap": "bboxesOverlap()" | kind=code-symbol | source=src/components/board/boardGeometry.ts:L388 | neighbors=[boardGeometry.ts, componentsOverlap()]
- "board_boardgeometry_getcomponentboundingbox": "getComponentBoundingBox()" | kind=code-symbol | source=src/components/board/boardGeometry.ts:L372 | neighbors=[boardGeometry.ts, componentsOverlap()]
- "board_boardgeometry_ispointinsideoutline": "isPointInsideOutline()" | kind=code-symbol | source=src/components/board/boardGeometry.ts:L330 | neighbors=[boardGeometry.ts, boardDRC.ts]
- "board_boardgeometry_mmtosvg": "mmToSvg()" | kind=code-symbol | source=src/components/board/boardGeometry.ts:L7 | neighbors=[BoardCanvas.tsx, boardGeometry.ts]
- "board_boardgeometry_snaptogrid": "snapToGrid()" | kind=code-symbol | source=src/components/board/boardGeometry.ts:L10 | neighbors=[BoardCanvas.tsx, boardGeometry.ts]
- "board_boardgeometry_svgtomm": "svgToMm()" | kind=code-symbol | source=src/components/board/boardGeometry.ts:L8 | neighbors=[BoardCanvas.tsx, boardGeometry.ts]
- "board_boardinspector_boardinspector": "BoardInspector()" | kind=code-symbol | source=src/components/board/BoardInspector.tsx:L12 | neighbors=[BoardDesigner.tsx, BoardInspector.tsx]
- "board_boardinteraction_boardtool": "BoardTool" | kind=code-symbol | source=src/components/board/boardInteraction.ts:L3 | neighbors=[boardInteraction.ts, BoardToolbar.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\ANKIT BHARDWAJ\Desktop\hardware studio\.graphify\description-instructions\batch-013.json

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
