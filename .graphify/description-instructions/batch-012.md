# Node Description Batch 13 of 28

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

- "lib_exportdossier_exportblueprintdossiermarkdown": "exportBlueprintDossierMarkdown()" | kind=code-symbol | source=src/lib/exportDossier.ts:L9 | neighbors=[BlueprintDossier.tsx, ExportCenter.tsx, exportDossier.ts]
- "lib_exportfirmware_generatefirmwareskeleton": "generateFirmwareSkeleton()" | kind=code-symbol | source=src/lib/exportFirmware.ts:L3 | neighbors=[ExportCenter.tsx, exportFirmware.ts, exportFirmwareSkeletonFile()]
- "lib_exportfirmware_generatefirmwareworkspace": "generateFirmwareWorkspace()" | kind=code-symbol | source=src/lib/exportFirmware.ts:L204 | neighbors=[FirmwareCodePreview.tsx, exportFirmware.ts, firmwareWorkspace.test.ts]
- "lib_exportjson_exportprojectjson": "exportProjectJson()" | kind=code-symbol | source=src/lib/exportJson.ts:L3 | neighbors=[ExportCenter.tsx, ProjectManager.tsx, exportJson.ts]
- "lib_exportmarkdown_exportprojectmarkdown": "exportProjectMarkdown()" | kind=code-symbol | source=src/lib/exportMarkdown.ts:L9 | neighbors=[ExportCenter.tsx, ProjectManager.tsx, exportMarkdown.ts]
- "lib_nativeexports_exporthandoffmanifestjson": "exportHandoffManifestJson()" | kind=code-symbol | source=src/lib/nativeExports.ts:L204 | neighbors=[ExportCenter.tsx, FactoryPackageBuilder.tsx, nativeExports.ts]
- "lib_nativeexports_generatefactoryreviewreadme": "generateFactoryReviewReadme()" | kind=code-symbol | source=src/lib/nativeExports.ts:L786 | neighbors=[ExportCenter.tsx, FactoryPackageBuilder.tsx, nativeExports.ts]
- "lib_projectmigrations_migrateprojectschema": "migrateProjectSchema()" | kind=code-symbol | source=src/lib/projectMigrations.ts:L127 | neighbors=[projectMigrations.ts, projectSerialization.ts, projectStore.ts]
- "lib_projectserialization_serializeproject": "serializeProject()" | kind=code-symbol | source=src/lib/projectSerialization.ts:L14 | neighbors=[projectSerialization.ts, projectStore.ts, projectSerialization.test.ts]
- "lib_projectserialization_validateprojectintegrity": "validateProjectIntegrity()" | kind=code-symbol | source=src/lib/projectSerialization.ts:L124 | neighbors=[projectSerialization.ts, projectStore.ts, projectSerialization.test.ts]
- "lib_reliability_classifystorageerror": "classifyStorageError()" | kind=code-symbol | source=src/lib/reliability.ts:L51 | neighbors=[reliability.ts, storageHealthStore.ts, reliability.test.ts]
- "lib_reliability_memoryfallbackstoragehealth": "memoryFallbackStorageHealth()" | kind=code-symbol | source=src/lib/reliability.ts:L42 | neighbors=[reliability.ts, storageHealthStore.ts, reliability.test.ts]
- "lib_reliability_savedstoragehealth": "savedStorageHealth()" | kind=code-symbol | source=src/lib/reliability.ts:L34 | neighbors=[reliability.ts, storageHealthStore.ts, reliability.test.ts]
- "lib_reliability_storagehealthlabel": "storageHealthLabel()" | kind=code-symbol | source=src/lib/reliability.ts:L91 | neighbors=[TopBar.tsx, reliability.ts, reliability.test.ts]
- "lib_workflowprofiles_workflowprofileid": "WorkflowProfileId" | kind=code-symbol | source=src/lib/workflowProfiles.ts:L29 | neighbors=[workflowProfiles.ts, workflowPreferencesStore.ts, WorkflowSetupDialog.tsx]
- "lib_workflowprofiles_workflowprofiles": "workflowProfiles" | kind=code-symbol | source=src/lib/workflowProfiles.ts:L86 | neighbors=[workflowProfiles.ts, workflowProfiles.test.ts, WorkflowSetupDialog.tsx]
- "lib_workflowprofiles_workflowprojectsnapshot": "WorkflowProjectSnapshot" | kind=code-symbol | source=src/lib/workflowProfiles.ts:L56 | neighbors=[ProjectDashboard.tsx, workflowProfiles.ts, workflowProfiles.test.ts]
- "mcp_server_mcpserver_hardwarestudiomcpserver_calltool": ".callTool()" | kind=code-symbol | source=packages/mcp-server/mcpServer.ts:L50 | neighbors=[HardwareStudioMCPServer, .recordAudit(), .getResource()]
- "mechanical_unifiedboard3dview_unifiedboard3dview": "UnifiedBoard3DView()" | kind=code-symbol | source=src/components/mechanical/UnifiedBoard3DView.tsx:L53 | neighbors=[MechanicalStudio.tsx, UnifiedBoard3DView.tsx, UnifiedWorkbenchAdapters.tsx]
- "pcb_pcbroutingengine_resolvepcbanchor": "resolvePCBAnchor()" | kind=code-symbol | source=src/lib/pcb/pcbRoutingEngine.ts:L36 | neighbors=[BoardCanvas.tsx, pcbRoutingEngine.ts, pcbRouting.test.ts]
- "pcb_pcbroutingengine_validateroutefinishanchor": "validateRouteFinishAnchor()" | kind=code-symbol | source=src/lib/pcb/pcbRoutingEngine.ts:L157 | neighbors=[BoardCanvas.tsx, pcbRoutingEngine.ts, pcbRouting.test.ts]
- "pcb_pcbroutingengine_validateroutestartanchor": "validateRouteStartAnchor()" | kind=code-symbol | source=src/lib/pcb/pcbRoutingEngine.ts:L127 | neighbors=[BoardCanvas.tsx, pcbRoutingEngine.ts, pcbRouting.test.ts]
- "product_productgraph_finddisconnectednodes": "findDisconnectedNodes()" | kind=code-symbol | source=src/lib/product/productGraph.ts:L12 | neighbors=[productGraph.ts, validateArchitectureGraph(), projectStore.test.ts]
- "product_productgraph_findrequirementswithoutlinks": "findRequirementsWithoutLinks()" | kind=code-symbol | source=src/lib/product/productGraph.ts:L25 | neighbors=[productGraph.ts, validateArchitectureGraph(), projectStore.test.ts]
- "productgraph_queries_getcomponentdomainlinks": "getComponentDomainLinks()" | kind=code-symbol | source=src/core/productGraph/queries.ts:L88 | neighbors=[graph.ts, queries.ts, getProductImpactOfComponentReplacement()]
- "productgraph_queries_getnetconsumers": "getNetConsumers()" | kind=code-symbol | source=src/core/productGraph/queries.ts:L123 | neighbors=[graph.ts, queries.ts, getNetRelations()]
- "productgraph_queries_getnetrelations": "getNetRelations()" | kind=code-symbol | source=src/core/productGraph/queries.ts:L143 | neighbors=[graph.ts, queries.ts, getNetConsumers()]
- "productgraph_queries_getreleaseimpact": "getReleaseImpact()" | kind=code-symbol | source=src/core/productGraph/queries.ts:L195 | neighbors=[graph.ts, queries.ts, getProductImpactOfComponentReplacement()]
- "productgraph_relations_componentdomainlinks": "ComponentDomainLinks" | kind=code-symbol | source=src/core/productGraph/relations.ts:L3 | neighbors=[graph.ts, queries.ts, relations.ts]
- "productgraph_relations_impactanalysis": "ImpactAnalysis" | kind=code-symbol | source=src/core/productGraph/relations.ts:L13 | neighbors=[graph.ts, queries.ts, relations.ts]
- "schematic_schematicinteraction_schematicuistate": "SchematicUIState" | kind=code-symbol | source=src/components/schematic/schematicInteraction.ts:L15 | neighbors=[SchematicCanvas.tsx, schematicInteraction.ts, UnifiedSchematicEditor.tsx]
- "schematic_schematicsymbolrenderer_schematicsymbolrenderer": "SchematicSymbolRenderer()" | kind=code-symbol | source=src/components/schematic/SchematicSymbolRenderer.tsx:L98 | neighbors=[SchematicCanvas.tsx, SchematicSymbolRenderer.tsx, getSymbolPinLayouts()]
- "store_projectstore_getinitialactiveproject": "getInitialActiveProject()" | kind=code-symbol | source=src/store/projectStore.ts:L468 | neighbors=[projectStore.ts, getActiveId(), getSavedProjects()]
- "store_storagehealthstore_usestoragehealthstore": "useStorageHealthStore" | kind=code-symbol | source=src/store/storageHealthStore.ts:L21 | neighbors=[AppShell.tsx, TopBar.tsx, storageHealthStore.ts]
- "templates_index_templates": "templates" | kind=code-symbol | source=src/data/templates/index.ts:L24 | neighbors=[TemplatePicker.tsx, projectStore.ts, index.ts]
- "types_index_customedge": "CustomEdge" | kind=code-symbol | source=src/types/index.ts:L33 | neighbors=[validationRules.ts, projectStore.ts, index.ts]
- "types_index_editorconnection": "EditorConnection" | kind=code-symbol | source=src/types/index.ts:L798 | neighbors=[editorLayoutGenerators.ts, projectStore.ts, index.ts]
- "types_index_factoryfilestatus": "FactoryFileStatus" | kind=code-symbol | source=src/types/index.ts:L809 | neighbors=[editorLayoutGenerators.ts, projectStore.ts, index.ts]
- "types_index_firmwaretask": "FirmwareTask" | kind=code-symbol | source=src/types/index.ts:L114 | neighbors=[editorLayoutGenerators.ts, projectStore.ts, index.ts]
- "types_index_pcbconstraint": "PCBConstraint" | kind=code-symbol | source=src/types/index.ts:L271 | neighbors=[PCBConstraints.tsx, projectStore.ts, index.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\ANKIT BHARDWAJ\Desktop\hardware studio\.graphify\description-instructions\batch-012.json

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
