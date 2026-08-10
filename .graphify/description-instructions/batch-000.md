# Node Description Batch 1 of 28

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
For an entity node (any other kind — e.g. a person, place, event, object),
describe what the entity is and its role, grounded in its type, its
relations (neighbors) and the provided citations/evidence — e.g.
"Lady Carfax, a wealthy heiress who disappears en route to Lausanne.".
Ground entity descriptions in the citations/evidence when present; do not
speculate beyond the context, so a node with no supporting context may be
left out of the reply.
LANGUAGE: each entry has a `lang=` marker giving the language of its source.
Write that entry's description in EXACTLY that language. Do not translate to
a single common language — match each node's source language individually.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "store_projectstore": "projectStore.ts" | kind=code-symbol | source=src/store/projectStore.ts:L1 | neighbors=[BoardCanvas.tsx, BoardComponentBin.tsx, BoardDesigner.tsx, BoardInspector.tsx, BoardLayerPanel.tsx, BoardNetPanel.tsx] | lang=en
- "types_index": "index.ts" | kind=code-symbol | source=src/types/index.ts:L1 | neighbors=[mfgManifestEngine.ts, BoardCanvas.tsx, BoardDesigner.tsx, BoardDRCPanel.tsx, boardGeometry.ts, 0308eaa feat: integrate Board Studio & …] | lang=en
- "branch:repo:github.com/Ankit6149/hardware-studio#master": "master" | kind=Branch | source=git | neighbors=[0308eaa feat: integrate Board Studio & …, 04f0f7b fix(blueprints): replace fake c…, 0a874a4 feat(brand): add reusable Hardw…, 0af0a13 ci: remove final legacy brandin…, 0be3b86 feat: complete local-bridge CLI…, 0c36fad feat: migrate schematic wires t…] | lang=en
- "components_appshell": "AppShell.tsx" | kind=code-symbol | source=src/components/AppShell.tsx:L1 | neighbors=[0308eaa feat: integrate Board Studio & …, 0e71062 Audit recovery: restore CI inte…, 0e8fa7a feat: complete local-first hard…, 12bcbdd Unify workspace: Integrate Comp…, 17918b0 feat: complete interactive engi…, 1a539cf feat: implement concept bluepri…] | lang=en
- "store_projectstore_useprojectstore": "useProjectStore" | kind=code-symbol | source=src/store/projectStore.ts:L498 | neighbors=[BoardCanvas.tsx, BoardComponentBin.tsx, BoardDesigner.tsx, BoardInspector.tsx, BoardLayerPanel.tsx, BoardNetPanel.tsx] | lang=en
- "components_exportcenter": "ExportCenter.tsx" | kind=code-symbol | source=src/components/ExportCenter.tsx:L1 | neighbors=[0e8fa7a feat: complete local-first hard…, 266e502 Harden and align gating checks,…, 3e73302 Bind Blueprint Sheets SVG drawi…, 42e7274 Implement printable/exportable …, 46ca452 chore: rename package to hardwa…, 51e7527 Upgrade: Complete Blueprint Edi…] | lang=en
- "lib_nativeexports": "nativeExports.ts" | kind=code-symbol | source=src/lib/nativeExports.ts:L1 | neighbors=[mfgManifestEngine.ts, 266e502 Harden and align gating checks,…, 356b610 Stabilize schematic and PCB rou…, 5341241 Build native PCB Board Designer…, 78bd697 feat: generate multi-sheet blue…, 84415a2 fix(v1): complete truthful prod…] | lang=en
- "lib_blueprintgenerator": "blueprintGenerator.ts" | kind=code-symbol | source=src/lib/blueprintGenerator.ts:L1 | neighbors=[356b610 Stabilize schematic and PCB rou…, 5341241 Build native PCB Board Designer…, 6c063dc chore: final verification pass,…, a8af0f5 Stabilize schematic locked types, f8edf1c feat: Blueprint Generation Syst…, connId()] | lang=en
- "types_index_project": "Project" | kind=code-symbol | source=src/types/index.ts:L632 | neighbors=[mfgManifestEngine.ts, BoardCanvas.tsx, boardGeometry.ts, blueprintGenerator.ts, boardDRC.ts, designReview.ts] | lang=en
- "components_sidebar": "Sidebar.tsx" | kind=code-symbol | source=src/components/Sidebar.tsx:L1 | neighbors=[0308eaa feat: integrate Board Studio & …, 0e71062 Audit recovery: restore CI inte…, 0e8fa7a feat: complete local-first hard…, 12bcbdd Unify workspace: Integrate Comp…, 17918b0 feat: complete interactive engi…, 1a539cf feat: implement concept bluepri…] | lang=en
- "board_boardgeometry": "boardGeometry.ts" | kind=code-symbol | source=src/components/board/boardGeometry.ts:L1 | neighbors=[BoardCanvas.tsx, BoardDesigner.tsx, AbsolutePad, autoPlaceComponents(), BBox, bboxesOverlap()] | lang=en
- "lib_workflowprofiles": "workflowProfiles.ts" | kind=code-symbol | source=src/lib/workflowProfiles.ts:L1 | neighbors=[8fac0da Build adaptive workflows and gu…, AppShell.tsx, ProjectDashboard.tsx, Sidebar.tsx, navigationRegistry.ts, getNavigationItem()] | lang=en
- "board_boarddesigner": "BoardDesigner.tsx" | kind=code-symbol | source=src/components/board/BoardDesigner.tsx:L1 | neighbors=[BoardCanvas.tsx, BoardCanvas(), BoardComponentBin.tsx, BoardComponentBin(), BoardDesigner(), RightTab] | lang=en
- "mechanical_mechanicalgeometry": "mechanicalGeometry.ts" | kind=code-symbol | source=src/lib/mechanical/mechanicalGeometry.ts:L1 | neighbors=[17918b0 feat: complete interactive engi…, 353ec62 feat: complete mechanical geome…, 9debb85 feat: synchronize persisted Web…, c9e9d0c fix(ci): repair dependency lock…, e20a167 feat: complete readiness engine…, validationRunner.ts] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@0e8fa7aef1ebf4c9dd36fb2ccc898f844c8533ad": "0e8fa7a feat: complete local-first hardware planning studio workspace overhaul" | kind=Commit | source=git | neighbors=[master, 46ca452 chore: rename package to hardwa…, AppShell.tsx, ExportCenter.tsx, PinMapTable.tsx, PowerBudgetTable.tsx] | lang=pt
- "components_blueprintcanvas": "BlueprintCanvas.tsx" | kind=code-symbol | source=src/components/BlueprintCanvas.tsx:L1 | neighbors=[67b9aff fix(brand): restore original lo…, 74182b5 Build semantic Blueprint visual…, 9c84530 feat: implement interactive pro…, AppShell.tsx, ArchitectureNode(), BlueprintCanvas()] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@84415a2354d2005567358cdb34cc405d655d8756": "84415a2 fix(v1): complete truthful production corrective implementation pass" | kind=Commit | source=git | neighbors=[59e0d22 audit: reset unsupported V1 pas…, mfgManifestEngine.ts, BoardCanvas.tsx, master, 41f3691 feat(site): build public Hardwa…, FirmwareStateMachineCanvas.tsx] | lang=pt
- "tests_projectstore_test": "projectStore.test.ts" | kind=code-symbol | source=src/__tests__/projectStore.test.ts:L1 | neighbors=[17918b0 feat: complete interactive engi…, 931aeec fix: resolve ValidationTest typ…, firmwareValidation.ts, sanitizeCIdentifier(), validateStateMachine(), projectMigrations.ts] | lang=en
- "visual_representationregistry": "representationRegistry.ts" | kind=code-symbol | source=src/lib/visual/representationRegistry.ts:L1 | neighbors=[74182b5 Build semantic Blueprint visual…, BlueprintCanvas.tsx, Sidebar.tsx, visualRepresentationRegistry.test.ts, DeviceVisual.tsx, Lightweight3DPreview.tsx] | lang=en
- "board_boardcanvas": "BoardCanvas.tsx" | kind=code-symbol | source=src/components/board/BoardCanvas.tsx:L1 | neighbors=[BoardCanvas(), BoardCanvasProps, boardGeometry.ts, getComponentPads(), getNearestPad(), getNetRatsnestLines()] | lang=en
- "components_projectdashboard": "ProjectDashboard.tsx" | kind=code-symbol | source=src/components/ProjectDashboard.tsx:L1 | neighbors=[266e502 Harden and align gating checks,…, 42e7274 Implement printable/exportable …, 51e7527 Upgrade: Complete Blueprint Edi…, 83dc107 Complete and integrate connecte…, 8fac0da Build adaptive workflows and gu…, 931aeec fix: resolve ValidationTest typ…] | lang=en
- "components_topbar": "TopBar.tsx" | kind=code-symbol | source=src/components/TopBar.tsx:L1 | neighbors=[0e71062 Audit recovery: restore CI inte…, 0e8fa7a feat: complete local-first hard…, 1d1ba8d Build connected device knowledg…, 46ca452 chore: rename package to hardwa…, 61d8d93 refactor(studio): tighten heade…, 9c84530 feat: implement interactive pro…] | lang=en
- "lib_readinessscore": "readinessScore.ts" | kind=code-symbol | source=src/lib/readinessScore.ts:L1 | neighbors=[0e8fa7a feat: complete local-first hard…, 266e502 Harden and align gating checks,…, 46ca452 chore: rename package to hardwa…, 51e7527 Upgrade: Complete Blueprint Edi…, 83dc107 Complete and integrate connecte…, aa18a6c Upgrade Blueprint Sheets to Eng…] | lang=en
- "feedback_feedbackprovider": "FeedbackProvider.tsx" | kind=code-symbol | source=src/components/feedback/FeedbackProvider.tsx:L1 | neighbors=[BoardLayerPanel.tsx, c020639 Add crash recovery and visible …, ComponentLibraryWorkbench.tsx, AppShell.tsx, ProjectManager.tsx, TopBar.tsx] | lang=en
- "lib_releaseengine": "releaseEngine.ts" | kind=code-symbol | source=src/lib/releaseEngine.ts:L1 | neighbors=[31431d7 feat: complete cross-domain pro…, 84415a2 fix(v1): complete truthful prod…, c9e9d0c fix(ci): repair dependency lock…, efd5072 docs: complete V1 completion au…, boardDRC.ts, runBoardDRC()] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@17918b01d232fbb82b6360fe20208ae4148440a6": "17918b0 feat: complete interactive engineering editors for Product, Mechanical,…" | kind=Commit | source=git | neighbors=[master, 2a55e09 fix: preserve complete project …, AppShell.tsx, Sidebar.tsx, firmwareCodegen.ts, FirmwareCodePreview.tsx] | lang=en
- "component_library_componentlibraryworkbench": "ComponentLibraryWorkbench.tsx" | kind=code-symbol | source=src/components/component-library/ComponentLibraryWorkbench.tsx:L1 | neighbors=[1d1ba8d Build connected device knowledg…, COMPONENT_CATEGORIES, ComponentDraft, ComponentLibraryWorkbench(), draftFromComponent(), emptyDraft()] | lang=en
- "components_factorypackagebuilder": "FactoryPackageBuilder.tsx" | kind=code-symbol | source=src/components/FactoryPackageBuilder.tsx:L1 | neighbors=[a2a6010 fix: resolve duplicate keys in …, c02c688 V4: Implement Factory Package B…, c948130 V5 Release Candidate: Clean up …, AppShell.tsx, csvCell(), downloadFile()] | lang=en
- "components_projectmanager": "ProjectManager.tsx" | kind=code-symbol | source=src/components/ProjectManager.tsx:L1 | neighbors=[0e8fa7a feat: complete local-first hard…, 266e502 Harden and align gating checks,…, 46ca452 chore: rename package to hardwa…, c020639 Add crash recovery and visible …, c9e9d0c fix(ci): repair dependency lock…, efd5072 docs: complete V1 completion au…] | lang=en
- "blueprints_blueprintdrawingrenderer": "BlueprintDrawingRenderer.tsx" | kind=code-symbol | source=src/components/blueprints/BlueprintDrawingRenderer.tsx:L1 | neighbors=[anchor(), BlueprintDrawingRenderer(), BlueprintDrawingRendererProps, centerOfLongestSegment(), classify(), connectionColors] | lang=en
- "lib_editorlayoutgenerators": "editorLayoutGenerators.ts" | kind=code-symbol | source=src/lib/editorLayoutGenerators.ts:L1 | neighbors=[266e502 Harden and align gating checks,…, 51e7527 Upgrade: Complete Blueprint Edi…, 6c063dc chore: final verification pass,…, addRequiredFactoryFileChecklist(), autoCreateFirmwareTasksFromHardware(), autoCreateHandoffChecklist()] | lang=en
- "validation_validationstudio": "ValidationStudio.tsx" | kind=code-symbol | source=src/components/validation/ValidationStudio.tsx:L1 | neighbors=[17918b0 feat: complete interactive engi…, 931aeec fix: resolve ValidationTest typ…, UnifiedValidationWorkbench.tsx, projectStore.ts, useProjectStore, index.ts] | lang=en
- "knowledge_deviceknowledge": "deviceKnowledge.ts" | kind=code-symbol | source=src/lib/knowledge/deviceKnowledge.ts:L1 | neighbors=[1d1ba8d Build connected device knowledg…, ComponentLibraryWorkbench.tsx, componentLibrary.ts, ElectronicComponentDefinition, categoryMappings, DEVICE_KNOWLEDGE_CATEGORIES] | lang=en
- "tests_hardwarestudiov1integration_test": "hardwareStudioV1Integration.test.ts" | kind=code-symbol | source=src/__tests__/hardwareStudioV1Integration.test.ts:L1 | neighbors=[84415a2 fix(v1): complete truthful prod…, e20a167 feat: complete readiness engine…, f97cd61 test: add comprehensive vitest …, boardDRC.ts, runBoardDRC(), exportBlueprintSheets.ts] | lang=en
- "firmware_firmwarestudio": "FirmwareStudio.tsx" | kind=code-symbol | source=src/components/firmware/FirmwareStudio.tsx:L1 | neighbors=[17918b0 feat: complete interactive engi…, 2a55e09 fix: preserve complete project …, 31431d7 feat: complete cross-domain pro…, 931aeec fix: resolve ValidationTest typ…, AppShell.tsx, FirmwareCodePreview.tsx] | lang=en
- "pcb_pcbroutingengine": "pcbRoutingEngine.ts" | kind=code-symbol | source=src/lib/pcb/pcbRoutingEngine.ts:L1 | neighbors=[BoardCanvas.tsx, 84415a2 fix(v1): complete truthful prod…, c9e9d0c fix(ci): repair dependency lock…, boardGeometry.ts, getComponentPads(), getNearestPad()] | lang=en
- "visual_representationinspector": "RepresentationInspector.tsx" | kind=code-symbol | source=src/components/visual/RepresentationInspector.tsx:L1 | neighbors=[74182b5 Build semantic Blueprint visual…, BlueprintCanvas.tsx, KnowledgeProvider.tsx, useKnowledge(), projectStore.ts, useProjectStore] | lang=en
- "lib_navigationregistry": "navigationRegistry.ts" | kind=code-symbol | source=src/lib/navigationRegistry.ts:L1 | neighbors=[0e71062 Audit recovery: restore CI inte…, AppShell.tsx, ProjectDashboard.tsx, Sidebar.tsx, allNavigationItems, compatibleNavigationItems] | lang=en
- "mechanical_mechanicalstudio": "MechanicalStudio.tsx" | kind=code-symbol | source=src/components/mechanical/MechanicalStudio.tsx:L1 | neighbors=[17918b0 feat: complete interactive engi…, 3011fe7 fix: remove simulated bridge MC…, 31431d7 feat: complete cross-domain pro…, 380fca6 feat: add real WebGL 3D product…, 931aeec fix: resolve ValidationTest typ…, efd5072 docs: complete V1 completion au…] | lang=en
- "productgraph_graph": "graph.ts" | kind=code-symbol | source=src/core/productGraph/graph.ts:L1 | neighbors=[31431d7 feat: complete cross-domain pro…, 4a5eb82 feat: complete canonical cross-…, ProductGraphEngine, queries.ts, getArchitectureNodeRelations(), getBoardRelations()] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\ANKIT BHARDWAJ\Desktop\hardware studio\.graphify\description-instructions\batch-000.json

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
