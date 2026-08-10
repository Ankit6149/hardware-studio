# Node Description Batch 21 of 28

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

- "board_boardgeometry_absolutepad": "AbsolutePad" | kind=code-symbol | source=src/components/board/boardGeometry.ts:L15 | neighbors=[boardGeometry.ts]
- "board_boardgeometry_bbox": "BBox" | kind=code-symbol | source=src/components/board/boardGeometry.ts:L367 | neighbors=[boardGeometry.ts]
- "board_boardgeometry_generaterectangularoutline": "generateRectangularOutline()" | kind=code-symbol | source=src/components/board/boardGeometry.ts:L399 | neighbors=[boardGeometry.ts]
- "board_boardgeometry_ratsnestline": "RatsnestLine" | kind=code-symbol | source=src/components/board/boardGeometry.ts:L166 | neighbors=[boardGeometry.ts]
- "board_boardgeometry_rotatepoint": "rotatePoint()" | kind=code-symbol | source=src/components/board/boardGeometry.ts:L27 | neighbors=[boardGeometry.ts]
- "board_boardinspector_boardobjectinspectorprops": "BoardObjectInspectorProps" | kind=code-symbol | source=src/components/board/BoardInspector.tsx:L7 | neighbors=[BoardInspector.tsx]
- "board_boardinspector_editfield": "EditField()" | kind=code-symbol | source=src/components/board/BoardInspector.tsx:L247 | neighbors=[BoardInspector.tsx]
- "board_boardinspector_field": "Field()" | kind=code-symbol | source=src/components/board/BoardInspector.tsx:L240 | neighbors=[BoardInspector.tsx]
- "board_boardinspector_noselection": "NoSelection()" | kind=code-symbol | source=src/components/board/BoardInspector.tsx:L258 | neighbors=[BoardInspector.tsx]
- "board_boardlayerpanel_boardlayerpanelprops": "BoardLayerPanelProps" | kind=code-symbol | source=src/components/board/BoardLayerPanel.tsx:L7 | neighbors=[BoardLayerPanel.tsx]
- "board_boardlayerpanel_layer_defs": "LAYER_DEFS" | kind=code-symbol | source=src/components/board/BoardLayerPanel.tsx:L12 | neighbors=[BoardLayerPanel.tsx]
- "board_boardnetpanel_boardnetpanelprops": "BoardNetPanelProps" | kind=code-symbol | source=src/components/board/BoardNetPanel.tsx:L6 | neighbors=[BoardNetPanel.tsx]
- "board_boardstatusbar_boardstatusbarprops": "BoardStatusBarProps" | kind=code-symbol | source=src/components/board/BoardStatusBar.tsx:L4 | neighbors=[BoardStatusBar.tsx]
- "board_boardtoolbar_boardtoolbarprops": "BoardToolbarProps" | kind=code-symbol | source=src/components/board/BoardToolbar.tsx:L8 | neighbors=[BoardToolbar.tsx]
- "board_boardtoolbar_tools": "tools" | kind=code-symbol | source=src/components/board/BoardToolbar.tsx:L20 | neighbors=[BoardToolbar.tsx]
- "board_boardtypes_boardkeepout": "BoardKeepout" | kind=code-symbol | source=src/components/board/boardTypes.ts:L55 | neighbors=[boardTypes.ts]
- "board_boardtypes_boardoutline": "BoardOutline" | kind=code-symbol | source=src/components/board/boardTypes.ts:L3 | neighbors=[boardTypes.ts]
- "board_boardtypes_drillhole": "DrillHole" | kind=code-symbol | source=src/components/board/boardTypes.ts:L44 | neighbors=[boardTypes.ts]
- "board_boardtypes_padnetassignment": "PadNetAssignment" | kind=code-symbol | source=src/components/board/boardTypes.ts:L11 | neighbors=[boardTypes.ts]
- "board_boardtypes_trace": "Trace" | kind=code-symbol | source=src/components/board/boardTypes.ts:L19 | neighbors=[boardTypes.ts]
- "board_boardtypes_via": "Via" | kind=code-symbol | source=src/components/board/boardTypes.ts:L31 | neighbors=[boardTypes.ts]
- "component_library_componentlibraryworkbench_component_categories": "COMPONENT_CATEGORIES" | kind=code-symbol | source=src/components/component-library/ComponentLibraryWorkbench.tsx:L29 | neighbors=[ComponentLibraryWorkbench.tsx]
- "component_library_componentlibraryworkbench_componentdraft": "ComponentDraft" | kind=code-symbol | source=src/components/component-library/ComponentLibraryWorkbench.tsx:L40 | neighbors=[ComponentLibraryWorkbench.tsx]
- "component_library_componentlibraryworkbench_draftfromcomponent": "draftFromComponent()" | kind=code-symbol | source=src/components/component-library/ComponentLibraryWorkbench.tsx:L74 | neighbors=[ComponentLibraryWorkbench.tsx]
- "component_library_componentlibraryworkbench_emptydraft": "emptyDraft()" | kind=code-symbol | source=src/components/component-library/ComponentLibraryWorkbench.tsx:L56 | neighbors=[ComponentLibraryWorkbench.tsx]
- "component_library_componentlibraryworkbench_field": "Field()" | kind=code-symbol | source=src/components/component-library/ComponentLibraryWorkbench.tsx:L128 | neighbors=[ComponentLibraryWorkbench.tsx]
- "component_library_componentlibraryworkbench_footprintpreview": "FootprintPreview()" | kind=code-symbol | source=src/components/component-library/ComponentLibraryWorkbench.tsx:L137 | neighbors=[ComponentLibraryWorkbench.tsx]
- "component_library_componentlibraryworkbench_parsepins": "parsePins()" | kind=code-symbol | source=src/components/component-library/ComponentLibraryWorkbench.tsx:L94 | neighbors=[ComponentLibraryWorkbench.tsx]
- "component_library_componentlibraryworkbench_pin_types": "PIN_TYPES" | kind=code-symbol | source=src/components/component-library/ComponentLibraryWorkbench.tsx:L35 | neighbors=[ComponentLibraryWorkbench.tsx]
- "component_library_componentlibraryworkbench_referenceprefix": "referencePrefix()" | kind=code-symbol | source=src/components/component-library/ComponentLibraryWorkbench.tsx:L113 | neighbors=[ComponentLibraryWorkbench.tsx]
- "components_appshell_unavailableworkspace": "UnavailableWorkspace()" | kind=code-symbol | source=src/components/AppShell.tsx:L72 | neighbors=[AppShell.tsx]
- "components_blueprintcanvas_blueprintcanvascontent": "BlueprintCanvasContent()" | kind=code-symbol | source=src/components/BlueprintCanvas.tsx:L217 | neighbors=[BlueprintCanvas.tsx]
- "components_blueprintcanvas_nodetypes": "nodeTypes" | kind=code-symbol | source=src/components/BlueprintCanvas.tsx:L212 | neighbors=[BlueprintCanvas.tsx]
- "components_blueprintcanvas_portposition": "portPosition()" | kind=code-symbol | source=src/components/BlueprintCanvas.tsx:L66 | neighbors=[BlueprintCanvas.tsx]
- "components_blueprintcanvas_representationinspectorcontext": "RepresentationInspectorContext" | kind=code-symbol | source=src/components/BlueprintCanvas.tsx:L58 | neighbors=[BlueprintCanvas.tsx]
- "components_blueprintcanvas_representationinspectorcontextvalue": "RepresentationInspectorContextValue" | kind=code-symbol | source=src/components/BlueprintCanvas.tsx:L54 | neighbors=[BlueprintCanvas.tsx]
- "components_blueprintdossier_blueprintdossier": "BlueprintDossier()" | kind=code-symbol | source=src/components/BlueprintDossier.tsx:L26 | neighbors=[BlueprintDossier.tsx]
- "components_brandmark_brandmarkprops": "BrandMarkProps" | kind=code-symbol | source=src/components/BrandMark.tsx:L3 | neighbors=[BrandMark.tsx]
- "components_componentsearch_searchcomponents": "searchComponents()" | kind=code-symbol | source=src/lib/components/componentSearch.ts:L4 | neighbors=[componentSearch.ts]
- "components_factorypackagebuilder_csvcell": "csvCell()" | kind=code-symbol | source=src/components/FactoryPackageBuilder.tsx:L31 | neighbors=[FactoryPackageBuilder.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\ANKIT BHARDWAJ\Desktop\hardware studio\.graphify\description-instructions\batch-020.json

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
