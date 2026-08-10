# Node Description Batch 25 of 28

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

- "pcb_pcbroutingengine_pcbanchortype": "PCBAnchorType" | kind=code-symbol | source=src/lib/pcb/pcbRoutingEngine.ts:L5 | neighbors=[pcbRoutingEngine.ts]
- "pcb_pcbroutingengine_routesession": "RouteSession" | kind=code-symbol | source=src/lib/pcb/pcbRoutingEngine.ts:L20 | neighbors=[pcbRoutingEngine.ts]
- "pcb_pcbroutingengine_validationresult": "ValidationResult" | kind=code-symbol | source=src/lib/pcb/pcbRoutingEngine.ts:L29 | neighbors=[pcbRoutingEngine.ts]
- "postcss_config_config": "config" | kind=code-symbol | source=postcss.config.mjs:L1 | neighbors=[postcss.config.mjs]
- "product_productarchitecturecanvas_architectureblocknode": "ArchitectureBlockNode()" | kind=code-symbol | source=src/components/product/ProductArchitectureCanvas.tsx:L45 | neighbors=[ProductArchitectureCanvas.tsx]
- "product_productarchitecturecanvas_category_colors": "CATEGORY_COLORS" | kind=code-symbol | source=src/components/product/ProductArchitectureCanvas.tsx:L26 | neighbors=[ProductArchitectureCanvas.tsx]
- "product_productarchitecturecanvas_connection_type_colors": "CONNECTION_TYPE_COLORS" | kind=code-symbol | source=src/components/product/ProductArchitectureCanvas.tsx:L81 | neighbors=[ProductArchitectureCanvas.tsx]
- "product_productarchitecturecanvas_nodetypes": "nodeTypes" | kind=code-symbol | source=src/components/product/ProductArchitectureCanvas.tsx:L79 | neighbors=[ProductArchitectureCanvas.tsx]
- "product_productarchitecturecanvas_productarchitecturecanvasprops": "ProductArchitectureCanvasProps" | kind=code-symbol | source=src/components/product/ProductArchitectureCanvas.tsx:L91 | neighbors=[ProductArchitectureCanvas.tsx]
- "product_productarchitecturecanvas_status_border": "STATUS_BORDER" | kind=code-symbol | source=src/components/product/ProductArchitectureCanvas.tsx:L38 | neighbors=[ProductArchitectureCanvas.tsx]
- "product_productgraph_architecturevalidationissue": "ArchitectureValidationIssue" | kind=code-symbol | source=src/lib/product/productGraph.ts:L3 | neighbors=[productGraph.ts]
- "product_productinspector_inputstyle": "inputStyle" | kind=code-symbol | source=src/components/product/ProductInspector.tsx:L194 | neighbors=[ProductInspector.tsx]
- "product_productinspector_labelstyle": "labelStyle" | kind=code-symbol | source=src/components/product/ProductInspector.tsx:L191 | neighbors=[ProductInspector.tsx]
- "product_productinspector_props": "Props" | kind=code-symbol | source=src/components/product/ProductInspector.tsx:L7 | neighbors=[ProductInspector.tsx]
- "product_productstudio_productstudioprops": "ProductStudioProps" | kind=code-symbol | source=src/components/product/ProductStudio.tsx:L11 | neighbors=[ProductStudio.tsx]
- "product_productstudio_toolbtnstyle": "toolBtnStyle" | kind=code-symbol | source=src/components/product/ProductStudio.tsx:L144 | neighbors=[ProductStudio.tsx]
- "productgraph_graph_productgraphengine_constructor": ".constructor()" | kind=code-symbol | source=src/core/productGraph/graph.ts:L20 | neighbors=[ProductGraphEngine]
- "productgraph_graph_productgraphengine_getarchitecturenoderelations": ".getArchitectureNodeRelations()" | kind=code-symbol | source=src/core/productGraph/graph.ts:L34 | neighbors=[ProductGraphEngine]
- "productgraph_graph_productgraphengine_getboardrelations": ".getBoardRelations()" | kind=code-symbol | source=src/core/productGraph/graph.ts:L50 | neighbors=[ProductGraphEngine]
- "productgraph_graph_productgraphengine_getcomponentlinks": ".getComponentLinks()" | kind=code-symbol | source=src/core/productGraph/graph.ts:L38 | neighbors=[ProductGraphEngine]
- "productgraph_graph_productgraphengine_getconsumersofnet": ".getConsumersOfNet()" | kind=code-symbol | source=src/core/productGraph/graph.ts:L42 | neighbors=[ProductGraphEngine]
- "productgraph_graph_productgraphengine_getfirmwaremodulerelations": ".getFirmwareModuleRelations()" | kind=code-symbol | source=src/core/productGraph/graph.ts:L54 | neighbors=[ProductGraphEngine]
- "productgraph_graph_productgraphengine_getimpactofcomponentreplacement": ".getImpactOfComponentReplacement()" | kind=code-symbol | source=src/core/productGraph/graph.ts:L66 | neighbors=[ProductGraphEngine]
- "productgraph_graph_productgraphengine_getnetrelations": ".getNetRelations()" | kind=code-symbol | source=src/core/productGraph/graph.ts:L46 | neighbors=[ProductGraphEngine]
- "productgraph_graph_productgraphengine_getproductsummary": ".getProductSummary()" | kind=code-symbol | source=src/core/productGraph/graph.ts:L22 | neighbors=[ProductGraphEngine]
- "productgraph_graph_productgraphengine_getreleaseimpact": ".getReleaseImpact()" | kind=code-symbol | source=src/core/productGraph/graph.ts:L62 | neighbors=[ProductGraphEngine]
- "productgraph_graph_productgraphengine_getrequirementcoverage": ".getRequirementCoverage()" | kind=code-symbol | source=src/core/productGraph/graph.ts:L26 | neighbors=[ProductGraphEngine]
- "productgraph_graph_productgraphengine_getrequirementimpact": ".getRequirementImpact()" | kind=code-symbol | source=src/core/productGraph/graph.ts:L30 | neighbors=[ProductGraphEngine]
- "productgraph_graph_productgraphengine_getvalidationrelations": ".getValidationRelations()" | kind=code-symbol | source=src/core/productGraph/graph.ts:L58 | neighbors=[ProductGraphEngine]
- "reliability_apperrorboundary_apperrorboundary_getderivedstatefromerror": ".getDerivedStateFromError()" | kind=code-symbol | source=src/components/reliability/AppErrorBoundary.tsx:L52 | neighbors=[AppErrorBoundary]
- "reliability_apperrorboundary_apperrorboundaryprops": "AppErrorBoundaryProps" | kind=code-symbol | source=src/components/reliability/AppErrorBoundary.tsx:L7 | neighbors=[AppErrorBoundary.tsx]
- "reliability_apperrorboundary_apperrorboundarystate": "AppErrorBoundaryState" | kind=code-symbol | source=src/components/reliability/AppErrorBoundary.tsx:L12 | neighbors=[AppErrorBoundary.tsx]
- "reliability_apperrorboundary_clearcrashhistory": "clearCrashHistory()" | kind=code-symbol | source=src/components/reliability/AppErrorBoundary.tsx:L35 | neighbors=[AppErrorBoundary.tsx]
- "reliability_studioroot_shellcomponent": "ShellComponent" | kind=code-symbol | source=src/components/reliability/StudioRoot.tsx:L12 | neighbors=[StudioRoot.tsx]
- "reliability_studioroot_studioapplicationloader": "StudioApplicationLoader()" | kind=code-symbol | source=src/components/reliability/StudioRoot.tsx:L14 | neighbors=[StudioRoot.tsx]
- "reliability_studioroot_studioroot": "StudioRoot()" | kind=code-symbol | source=src/components/reliability/StudioRoot.tsx:L44 | neighbors=[StudioRoot.tsx]
- "schematic_schematiccanvas_schematiccanvasprops": "SchematicCanvasProps" | kind=code-symbol | source=src/components/schematic/SchematicCanvas.tsx:L10 | neighbors=[SchematicCanvas.tsx]
- "schematic_schematicgeometry_symbolpinlayout": "SymbolPinLayout" | kind=code-symbol | source=src/components/schematic/schematicGeometry.ts:L8 | neighbors=[schematicGeometry.ts]
- "schematic_schematicinteraction_schematictool": "SchematicTool" | kind=code-symbol | source=src/components/schematic/schematicInteraction.ts:L4 | neighbors=[schematicInteraction.ts]
- "schematic_schematicsymbolrenderer_schematicsymbolrendererprops": "SchematicSymbolRendererProps" | kind=code-symbol | source=src/components/schematic/SchematicSymbolRenderer.tsx:L12 | neighbors=[SchematicSymbolRenderer.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\ANKIT BHARDWAJ\Desktop\hardware studio\.graphify\description-instructions\batch-024.json

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
