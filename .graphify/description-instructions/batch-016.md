# Node Description Batch 17 of 28

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

- "lib_nativeexports_scalegerber": "scaleGerber()" | kind=code-symbol | source=src/lib/nativeExports.ts:L14 | neighbors=[nativeExports.ts, generateNativeGerberBoardOutline()]
- "lib_navigationregistry_allnavigationitems": "allNavigationItems" | kind=code-symbol | source=src/lib/navigationRegistry.ts:L227 | neighbors=[navigationRegistry.ts, navigationRegistry.test.ts]
- "lib_navigationregistry_compatiblenavigationitems": "compatibleNavigationItems" | kind=code-symbol | source=src/lib/navigationRegistry.ts:L211 | neighbors=[navigationRegistry.ts, navigationRegistry.test.ts]
- "lib_navigationregistry_navigationdomain": "NavigationDomain" | kind=code-symbol | source=src/lib/navigationRegistry.ts:L83 | neighbors=[navigationRegistry.ts, workflowProfiles.ts]
- "lib_navigationregistry_navigationdomainid": "NavigationDomainId" | kind=code-symbol | source=src/lib/navigationRegistry.ts:L1 | neighbors=[navigationRegistry.ts, workflowProfiles.ts]
- "lib_navigationregistry_navigationiconkey": "NavigationIconKey" | kind=code-symbol | source=src/lib/navigationRegistry.ts:L11 | neighbors=[Sidebar.tsx, navigationRegistry.ts]
- "lib_navigationregistry_navigationsurface": "NavigationSurface" | kind=code-symbol | source=src/lib/navigationRegistry.ts:L43 | neighbors=[AppShell.tsx, navigationRegistry.ts]
- "lib_navigationregistry_visiblenavigationitems": "visibleNavigationItems" | kind=code-symbol | source=src/lib/navigationRegistry.ts:L226 | neighbors=[navigationRegistry.ts, navigationRegistry.test.ts]
- "lib_projectmigrations_synclegacyplacementfields": "syncLegacyPlacementFields()" | kind=code-symbol | source=src/lib/projectMigrations.ts:L92 | neighbors=[projectMigrations.ts, projectStore.ts]
- "lib_projectmigrations_syncnestedpcbfields": "syncNestedPcbFields()" | kind=code-symbol | source=src/lib/projectMigrations.ts:L115 | neighbors=[projectMigrations.ts, projectStore.ts]
- "lib_projectserialization_migrateprojectschema": "migrateProjectSchema()" | kind=code-symbol | source=src/lib/projectSerialization.ts:L92 | neighbors=[projectSerialization.ts, deserializeProject()]
- "lib_releaseengine_createworkingbranchfromrelease": "createWorkingBranchFromRelease()" | kind=code-symbol | source=src/lib/releaseEngine.ts:L82 | neighbors=[releaseEngine.ts, releaseBranching.test.ts]
- "lib_releaseengine_mergebranches": "mergeBranches()" | kind=code-symbol | source=src/lib/releaseEngine.ts:L138 | neighbors=[releaseEngine.ts, releaseBranching.test.ts]
- "lib_releaseengine_releaseblocker": "ReleaseBlocker" | kind=code-symbol | source=src/lib/releaseEngine.ts:L6 | neighbors=[releaseEngine.ts, RevisionsStudio.tsx]
- "lib_releaseengine_switchbranchstate": "switchBranchState()" | kind=code-symbol | source=src/lib/releaseEngine.ts:L103 | neighbors=[releaseEngine.ts, releaseBranching.test.ts]
- "lib_reliability_idlestoragehealth": "idleStorageHealth()" | kind=code-symbol | source=src/lib/reliability.ts:L19 | neighbors=[reliability.ts, storageHealthStore.ts]
- "lib_reliability_redactsensitivetext": "redactSensitiveText()" | kind=code-symbol | source=src/lib/reliability.ts:L108 | neighbors=[reliability.ts, buildRedactedDiagnostics()]
- "lib_reliability_savingstoragehealth": "savingStorageHealth()" | kind=code-symbol | source=src/lib/reliability.ts:L26 | neighbors=[reliability.ts, storageHealthStore.ts]
- "lib_reliability_storagehealth": "StorageHealth" | kind=code-symbol | source=src/lib/reliability.ts:L5 | neighbors=[reliability.ts, storageHealthStore.ts]
- "lib_schematicerc_runschematicerc": "runSchematicERC()" | kind=code-symbol | source=src/lib/schematicERC.ts:L4 | neighbors=[schematicERC.ts, UnifiedSchematicEditor.tsx]
- "lib_validationrules_runvalidationrules": "runValidationRules()" | kind=code-symbol | source=src/lib/validationRules.ts:L9 | neighbors=[ReviewWarnings.tsx, validationRules.ts]
- "lib_workflowprofiles_default_workflow_preference": "DEFAULT_WORKFLOW_PREFERENCE" | kind=code-symbol | source=src/lib/workflowProfiles.ts:L137 | neighbors=[workflowProfiles.ts, workflowPreferencesStore.ts]
- "lib_workflowprofiles_evidence": "evidence()" | kind=code-symbol | source=src/lib/workflowProfiles.ts:L291 | neighbors=[workflowProfiles.ts, deriveGuidedWorkflowActions()]
- "lib_workflowprofiles_workflowpreference": "WorkflowPreference" | kind=code-symbol | source=src/lib/workflowProfiles.ts:L40 | neighbors=[workflowProfiles.ts, workflowPreferencesStore.ts]
- "local_bridge_bridgeserver_ispathcontained": "isPathContained()" | kind=code-symbol | source=packages/local-bridge/bridgeServer.js:L36 | neighbors=[bridgeServer.js, localBridgeSecurity.test.ts]
- "mcp_server_mcpserver_hardwarestudiomcpserver_getresource": ".getResource()" | kind=code-symbol | source=packages/mcp-server/mcpServer.ts:L278 | neighbors=[HardwareStudioMCPServer, .callTool()]
- "mcp_server_mcpserver_hardwarestudiomcpserver_recordaudit": ".recordAudit()" | kind=code-symbol | source=packages/mcp-server/mcpServer.ts:L264 | neighbors=[HardwareStudioMCPServer, .callTool()]
- "mcp_server_mcpserverstdio_createstdiomcpserver": "createStdioMCPServer()" | kind=code-symbol | source=packages/mcp-server/mcpServerStdio.ts:L12 | neighbors=[mcpServerStdio.ts, mcpProtocol.test.ts]
- "mechanical_mechanicalcanvas_mechanicalcanvas": "MechanicalCanvas()" | kind=code-symbol | source=src/components/mechanical/MechanicalCanvas.tsx:L35 | neighbors=[MechanicalCanvas.tsx, MechanicalStudio.tsx]
- "mechanical_mechanicalgeometry_boxesoverlap": "boxesOverlap()" | kind=code-symbol | source=src/lib/mechanical/mechanicalGeometry.ts:L95 | neighbors=[mechanicalGeometry.ts, mechanicalObjectsOverlap()]
- "mechanical_mechanicalgeometry_deletepolygonvertex": "deletePolygonVertex()" | kind=code-symbol | source=src/lib/mechanical/mechanicalGeometry.ts:L145 | neighbors=[mechanicalGeometry.ts, mechanicalGeometry.test.ts]
- "mechanical_mechanicalgeometry_insertpolygonvertex": "insertPolygonVertex()" | kind=code-symbol | source=src/lib/mechanical/mechanicalGeometry.ts:L133 | neighbors=[mechanicalGeometry.ts, mechanicalGeometry.test.ts]
- "mechanical_mechanicalgeometry_movepolygonvertex": "movePolygonVertex()" | kind=code-symbol | source=src/lib/mechanical/mechanicalGeometry.ts:L122 | neighbors=[mechanicalGeometry.ts, mechanicalGeometry.test.ts]
- "mechanical_mechanicalgeometry_snapmechanicalpoint": "snapMechanicalPoint()" | kind=code-symbol | source=src/lib/mechanical/mechanicalGeometry.ts:L43 | neighbors=[mechanicalGeometry.ts, projectStore.test.ts]
- "mechanical_mechanicalinspector_mechanicalinspector": "MechanicalInspector()" | kind=code-symbol | source=src/components/mechanical/MechanicalInspector.tsx:L12 | neighbors=[MechanicalInspector.tsx, MechanicalStudio.tsx]
- "mechanical_mechanicalstudio_mechanicalstudio": "MechanicalStudio()" | kind=code-symbol | source=src/components/mechanical/MechanicalStudio.tsx:L17 | neighbors=[MechanicalStudio.tsx, UnifiedWorkbenchAdapters.tsx]
- "mechanical_mechanicalvalidation_validatemechanicallayout": "validateMechanicalLayout()" | kind=code-symbol | source=src/lib/mechanical/mechanicalValidation.ts:L12 | neighbors=[MechanicalStudio.tsx, mechanicalValidation.ts]
- "next_config": "next.config.ts" | kind=code-symbol | source=next.config.ts:L1 | neighbors=[b2d482b Initial commit from Create Next…, nextConfig]
- "pcb_pcbroutingengine_beginroutefromanchor": "beginRouteFromAnchor()" | kind=code-symbol | source=src/lib/pcb/pcbRoutingEngine.ts:L186 | neighbors=[pcbRoutingEngine.ts, pcbRouting.test.ts]
- "pcb_pcbroutingengine_computenetconnectivity": "computeNetConnectivity()" | kind=code-symbol | source=src/lib/pcb/pcbRoutingEngine.ts:L202 | neighbors=[pcbRoutingEngine.ts, pcbRouting.test.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\ANKIT BHARDWAJ\Desktop\hardware studio\.graphify\description-instructions\batch-016.json

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
