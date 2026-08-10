# Node Description Batch 24 of 28

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

- "lib_workflowprofiles_validdomainids": "validDomainIds" | kind=code-symbol | source=src/lib/workflowProfiles.ts:L146 | neighbors=[workflowProfiles.ts]
- "lib_workflowprofiles_workflow_profile_ids": "WORKFLOW_PROFILE_IDS" | kind=code-symbol | source=src/lib/workflowProfiles.ts:L20 | neighbors=[workflowProfiles.ts]
- "lib_workflowprofiles_workflowconnectionnotice": "WorkflowConnectionNotice" | kind=code-symbol | source=src/lib/workflowProfiles.ts:L48 | neighbors=[workflowProfiles.ts]
- "lib_workflowprofiles_workflowprofile": "WorkflowProfile" | kind=code-symbol | source=src/lib/workflowProfiles.ts:L31 | neighbors=[workflowProfiles.ts]
- "local_bridge_bridgeserver_consumeapprovaltoken": "consumeApprovalToken()" | kind=code-symbol | source=packages/local-bridge/bridgeServer.js:L24 | neighbors=[bridgeServer.js]
- "local_bridge_bridgeserver_crypto": "crypto" | kind=code-symbol | source=packages/local-bridge/bridgeServer.js:L4 | neighbors=[bridgeServer.js]
- "local_bridge_bridgeserver_defaultspawnrunner": "defaultSpawnRunner()" | kind=code-symbol | source=packages/local-bridge/bridgeServer.js:L43 | neighbors=[bridgeServer.js]
- "local_bridge_bridgeserver_fs": "fs" | kind=code-symbol | source=packages/local-bridge/bridgeServer.js:L6 | neighbors=[bridgeServer.js]
- "local_bridge_bridgeserver_generateapprovaltoken": "generateApprovalToken()" | kind=code-symbol | source=packages/local-bridge/bridgeServer.js:L17 | neighbors=[bridgeServer.js]
- "local_bridge_bridgeserver_http": "http" | kind=code-symbol | source=packages/local-bridge/bridgeServer.js:L2 | neighbors=[bridgeServer.js]
- "local_bridge_bridgeserver_path": "path" | kind=code-symbol | source=packages/local-bridge/bridgeServer.js:L5 | neighbors=[bridgeServer.js]
- "local_bridge_bridgeserver_spawn": "{ spawn }" | kind=code-symbol | source=packages/local-bridge/bridgeServer.js:L3 | neighbors=[bridgeServer.js]
- "local_bridge_bridgeserver_validapprovaltokens": "validApprovalTokens" | kind=code-symbol | source=packages/local-bridge/bridgeServer.js:L15 | neighbors=[bridgeServer.js]
- "mcp_server_mcpserver_hardwarestudiomcpserver_constructor": ".constructor()" | kind=code-symbol | source=packages/mcp-server/mcpServer.ts:L11 | neighbors=[HardwareStudioMCPServer]
- "mcp_server_mcpserver_hardwarestudiomcpserver_getproject": ".getProject()" | kind=code-symbol | source=packages/mcp-server/mcpServer.ts:L42 | neighbors=[HardwareStudioMCPServer]
- "mcp_server_mcpserver_hardwarestudiomcpserver_setproject": ".setProject()" | kind=code-symbol | source=packages/mcp-server/mcpServer.ts:L46 | neighbors=[HardwareStudioMCPServer]
- "mechanical_mechanicalcanvas_mechanicalcanvasprops": "MechanicalCanvasProps" | kind=code-symbol | source=src/components/mechanical/MechanicalCanvas.tsx:L13 | neighbors=[MechanicalCanvas.tsx]
- "mechanical_mechanicalcanvas_toolmode": "ToolMode" | kind=code-symbol | source=src/components/mechanical/MechanicalCanvas.tsx:L11 | neighbors=[MechanicalCanvas.tsx]
- "mechanical_mechanicalcanvas_type_colors": "TYPE_COLORS" | kind=code-symbol | source=src/components/mechanical/MechanicalCanvas.tsx:L19 | neighbors=[MechanicalCanvas.tsx]
- "mechanical_mechanicalcanvas_viewstate": "ViewState" | kind=code-symbol | source=src/components/mechanical/MechanicalCanvas.tsx:L7 | neighbors=[MechanicalCanvas.tsx]
- "mechanical_mechanicalgeometry_boundingbox": "BoundingBox" | kind=code-symbol | source=src/lib/mechanical/mechanicalGeometry.ts:L9 | neighbors=[mechanicalGeometry.ts]
- "mechanical_mechanicalgeometry_boundingbox3d": "BoundingBox3D" | kind=code-symbol | source=src/lib/mechanical/mechanicalGeometry.ts:L199 | neighbors=[mechanicalGeometry.ts]
- "mechanical_mechanicalgeometry_collisionpair": "CollisionPair" | kind=code-symbol | source=src/lib/mechanical/mechanicalGeometry.ts:L205 | neighbors=[mechanicalGeometry.ts]
- "mechanical_mechanicalgeometry_collisionresult": "CollisionResult" | kind=code-symbol | source=src/lib/mechanical/mechanicalGeometry.ts:L214 | neighbors=[mechanicalGeometry.ts]
- "mechanical_mechanicalgeometry_mechanicalmmtoscreen": "mechanicalMmToScreen()" | kind=code-symbol | source=src/lib/mechanical/mechanicalGeometry.ts:L31 | neighbors=[mechanicalGeometry.ts]
- "mechanical_mechanicalgeometry_screentomechanicalmm": "screenToMechanicalMm()" | kind=code-symbol | source=src/lib/mechanical/mechanicalGeometry.ts:L19 | neighbors=[mechanicalGeometry.ts]
- "mechanical_mechanicalgeometry_viewstate": "ViewState" | kind=code-symbol | source=src/lib/mechanical/mechanicalGeometry.ts:L3 | neighbors=[mechanicalGeometry.ts]
- "mechanical_mechanicalinspector_inputstyle": "inputStyle" | kind=code-symbol | source=src/components/mechanical/MechanicalInspector.tsx:L200 | neighbors=[MechanicalInspector.tsx]
- "mechanical_mechanicalinspector_labelstyle": "labelStyle" | kind=code-symbol | source=src/components/mechanical/MechanicalInspector.tsx:L199 | neighbors=[MechanicalInspector.tsx]
- "mechanical_mechanicalinspector_props": "Props" | kind=code-symbol | source=src/components/mechanical/MechanicalInspector.tsx:L8 | neighbors=[MechanicalInspector.tsx]
- "mechanical_mechanicalstudio_mechanicalstudioprops": "MechanicalStudioProps" | kind=code-symbol | source=src/components/mechanical/MechanicalStudio.tsx:L13 | neighbors=[MechanicalStudio.tsx]
- "mechanical_mechanicalstudio_tabstyle": "tabStyle" | kind=code-symbol | source=src/components/mechanical/MechanicalStudio.tsx:L209 | neighbors=[MechanicalStudio.tsx]
- "mechanical_mechanicalstudio_toolbtnstyle": "toolBtnStyle" | kind=code-symbol | source=src/components/mechanical/MechanicalStudio.tsx:L205 | neighbors=[MechanicalStudio.tsx]
- "mechanical_mechanicalstudio_toolmode": "ToolMode" | kind=code-symbol | source=src/components/mechanical/MechanicalStudio.tsx:L11 | neighbors=[MechanicalStudio.tsx]
- "mechanical_mechanicalvalidation_mechanicalvalidationissue": "MechanicalValidationIssue" | kind=code-symbol | source=src/lib/mechanical/mechanicalValidation.ts:L4 | neighbors=[mechanicalValidation.ts]
- "mechanical_unifiedboard3dview_board3dquality": "Board3DQuality" | kind=code-symbol | source=src/components/mechanical/UnifiedBoard3DView.tsx:L18 | neighbors=[UnifiedBoard3DView.tsx]
- "mechanical_unifiedboard3dview_disposeobject": "disposeObject()" | kind=code-symbol | source=src/components/mechanical/UnifiedBoard3DView.tsx:L44 | neighbors=[UnifiedBoard3DView.tsx]
- "mechanical_unifiedboard3dview_outlinesize": "outlineSize()" | kind=code-symbol | source=src/components/mechanical/UnifiedBoard3DView.tsx:L26 | neighbors=[UnifiedBoard3DView.tsx]
- "mechanical_unifiedboard3dview_pixelratiobyquality": "pixelRatioByQuality" | kind=code-symbol | source=src/components/mechanical/UnifiedBoard3DView.tsx:L20 | neighbors=[UnifiedBoard3DView.tsx]
- "next_config_nextconfig": "nextConfig" | kind=code-symbol | source=next.config.ts:L3 | neighbors=[next.config.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\ANKIT BHARDWAJ\Desktop\hardware studio\.graphify\description-instructions\batch-023.json

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
