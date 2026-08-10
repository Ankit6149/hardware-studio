# Node Description Batch 9 of 28

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

- "types_index_firmwaremodule": "FirmwareModule" | kind=code-symbol | source=src/types/index.ts:L906 | neighbors=[firmwareCodegen.ts, FirmwareStudio.tsx, relations.ts, projectStore.ts, index.ts] | lang=en
- "types_index_netitem": "NetItem" | kind=code-symbol | source=src/types/index.ts:L256 | neighbors=[editorLayoutGenerators.ts, pcbRoutingEngine.ts, relations.ts, projectStore.ts, index.ts] | lang=en
- "ui_statcard": "StatCard.tsx" | kind=code-symbol | source=src/ui/StatCard.tsx:L1 | neighbors=[0e8fa7a feat: complete local-first hard…, PinMapTable.tsx, PowerBudgetTable.tsx, StatCard(), StatCardProps] | lang=en
- "visual_lightweight3dpreview_buildfamilymodel": "buildFamilyModel()" | kind=code-symbol | source=src/components/visual/Lightweight3DPreview.tsx:L73 | neighbors=[Lightweight3DPreview.tsx, addBox(), addCylinder(), addPins(), material()] | lang=en
- "visual_lightweight3dpreview_material": "material()" | kind=code-symbol | source=src/components/visual/Lightweight3DPreview.tsx:L22 | neighbors=[Lightweight3DPreview.tsx, addBox(), addCylinder(), addPins(), buildFamilyModel()] | lang=en
- "blueprints_blueprinttitleblock": "BlueprintTitleBlock.tsx" | kind=code-symbol | source=src/components/blueprints/BlueprintTitleBlock.tsx:L1 | neighbors=[BlueprintPageLayout.tsx, BlueprintTitleBlock(), BlueprintTitleBlockProps, aa18a6c Upgrade Blueprint Sheets to Eng…] | lang=en
- "board_boardgeometry_componentsoverlap": "componentsOverlap()" | kind=code-symbol | source=src/components/board/boardGeometry.ts:L392 | neighbors=[boardGeometry.ts, bboxesOverlap(), getComponentBoundingBox(), boardDRC.ts] | lang=en
- "board_boardgeometry_getoutlinebounds": "getOutlineBounds()" | kind=code-symbol | source=src/components/board/boardGeometry.ts:L354 | neighbors=[BoardCanvas.tsx, boardGeometry.ts, autoPlaceComponents(), boardDRC.ts] | lang=en
- "board_boardgeometry_roughautoroutenet": "roughAutorouteNet()" | kind=code-symbol | source=src/components/board/boardGeometry.ts:L484 | neighbors=[BoardDesigner.tsx, boardGeometry.ts, getPadsForNet(), .find()] | lang=en
- "board_boardgeometry_unionfind": "UnionFind" | kind=code-symbol | source=src/components/board/boardGeometry.ts:L141 | neighbors=[boardGeometry.ts, getNetRatsnestLines(), .find(), .union()] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@0a874a4ff4eadf1660a1364004bd1601ad7f9d80": "0a874a4 feat(brand): add reusable Hardware Studio mark" | kind=Commit | source=git | neighbors=[master, 5a2debf feat(brand): add Hardware Studi…, BrandMark.tsx, 52be84b Update README.md] | lang=pt
- "commit:repo:github.com/Ankit6149/hardware-studio@20bb6997ecb2a2a8774ac21f7c64166d95dcd723": "20bb699 fix: clean up schematic wire rendering const declaration" | kind=Commit | source=git | neighbors=[master, ec18200 audit: document simulated and d…, SchematicCanvas.tsx, 31431d7 feat: complete cross-domain pro…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@329890be9daaef484568bfa732b5ba69272aa219": "329890b feat: synchronize PCB and mechanical geometry" | kind=Commit | source=git | neighbors=[master, d706e7c feat: add persistent firmware s…, pcbMechanicalSync.test.ts, 380fca6 feat: add real WebGL 3D product…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@41f3691ddd5e38a966c624159f6bcf1d13b16adb": "41f3691 feat(site): build public Hardware Studio landing page" | kind=Commit | source=git | neighbors=[page.tsx, master, 523a787 feat(site): move development wo…, 84415a2 fix(v1): complete truthful prod…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@5139586a81548ef23a44db6fd12b4d802a55b4b6": "5139586 feat: complete active-board pad-aware PCB routing" | kind=Commit | source=git | neighbors=[0c36fad feat: migrate schematic wires t…, master, 56d64a6 feat: complete 2D mechanical ge…, pcbRouting.test.ts] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@523a787244f790f68068e088a812d7c8ead21230": "523a787 feat(site): move development workspace to studio route" | kind=Commit | source=git | neighbors=[41f3691 feat(site): build public Hardwa…, master, 775cd9f style(site): support scrolling …, page.tsx] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@56d64a6aae703d59bfc0e7c867df21491cf8b1e1": "56d64a6 feat: complete 2D mechanical geometry and constraints" | kind=Commit | source=git | neighbors=[5139586 feat: complete active-board pad…, master, 380fca6 feat: add real WebGL 3D product…, mechanicalGeometry.test.ts] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@5cd6df75646d42db4611b73195a86e31d3377f2b": "5cd6df7 fix(brand): remove legacy branding from site metadata" | kind=Commit | source=git | neighbors=[55109ec feat(brand): publish reusable r…, layout.tsx, master, 61d8d93 refactor(studio): tighten heade…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@61d8d938adfaab4c43376399864afec870659c86": "61d8d93 refactor(studio): tighten header scale and apply brand mark" | kind=Commit | source=git | neighbors=[5cd6df7 fix(brand): remove legacy brand…, master, 83d60e7 refactor(studio): compact sideb…, TopBar.tsx] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@83d60e7e45835c92b909028cc7f745c0335de39a": "83d60e7 refactor(studio): compact sidebar typography and spacing" | kind=Commit | source=git | neighbors=[61d8d93 refactor(studio): tighten heade…, master, 87cb462 refactor(site): reduce landing …, Sidebar.tsx] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@87cb4622ae3d4a4aeb3ad8adead3551988966da7": "87cb462 refactor(site): reduce landing scale and improve responsive layout" | kind=Commit | source=git | neighbors=[83d60e7 refactor(studio): compact sideb…, page.tsx, master, d4da782 docs(readme): polish repository…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@8d973c4674b201cf0dcd4e20a1e8c64241b41555": "8d973c4 feat: synchronize blueprints and manufacturing drafts" | kind=Commit | source=git | neighbors=[78d58ff feat: complete validation runs …, master, 0be3b86 feat: complete local-bridge CLI…, blueprintManufacturing.test.ts] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@adc4f546641edf015814ec1c39466ee6a2e9b367": "adc4f54 feat: add secure real PlatformIO bridge" | kind=Commit | source=git | neighbors=[master, 9e2c2c6 feat: add real MCP server and s…, bridgeSecurity.test.ts, d706e7c feat: add persistent firmware s…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@bb27ce08b07891260d4de2fb1948141e0552a5fa": "bb27ce0 Fix visual styling theme mismatch in ProjectDashboard: convert from dar…" | kind=Commit | source=git | neighbors=[master, f8edf1c feat: Blueprint Generation Syst…, ProjectDashboard.tsx, c948130 V5 Release Candidate: Clean up …] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@dded91e8cd6fc50040c0b7052329913b660d0d36": "dded91e seo(site): add honest product metadata" | kind=Commit | source=git | neighbors=[775cd9f style(site): support scrolling …, layout.tsx, master, 2c82cdc docs: replace README with hones…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@f778e84ba4b848040c886a8ab635956f2d32eb2e": "f778e84 Correct Touch Input circuitType to Sensor" | kind=Commit | source=git | neighbors=[83dc107 Complete and integrate connecte…, master, 42e7274 Implement printable/exportable …, projectStore.ts] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@f97cd6168a985455384f393c2d89fd1f6e88c987": "f97cd61 test: add comprehensive vitest integration suite" | kind=Commit | source=git | neighbors=[0be3b86 feat: complete local-bridge CLI…, master, efd5072 docs: complete V1 completion au…, hardwareStudioV1Integration.test.ts] | lang=en
- "components_blueprintcanvas_architecturenode": "ArchitectureNode()" | kind=code-symbol | source=src/components/BlueprintCanvas.tsx:L83 | neighbors=[BlueprintCanvas.tsx, getStatusClasses(), splitPorts(), useRepresentationInspector()] | lang=en
- "feedback_feedbackstate_promptdecision": "PromptDecision" | kind=code-symbol | source=src/lib/feedback/feedbackState.ts:L29 | neighbors=[FeedbackProvider.tsx, feedbackState.ts, DecisionBase, feedbackState.test.ts] | lang=en
- "firmware_firmwarevalidation_validatestatemachine": "validateStateMachine()" | kind=code-symbol | source=src/lib/firmware/firmwareValidation.ts:L28 | neighbors=[FirmwareStudio.tsx, firmwareValidation.ts, validationRunner.ts, projectStore.test.ts] | lang=en
- "knowledge_deviceknowledge_searchknowledgeentries": "searchKnowledgeEntries()" | kind=code-symbol | source=src/lib/knowledge/deviceKnowledge.ts:L108 | neighbors=[deviceKnowledge.ts, normalize(), KnowledgeDrawer.tsx, deviceKnowledge.test.ts] | lang=en
- "knowledge_knowledgeprovider_useknowledge": "useKnowledge()" | kind=code-symbol | source=src/components/knowledge/KnowledgeProvider.tsx:L56 | neighbors=[ComponentLibraryWorkbench.tsx, TopBar.tsx, KnowledgeProvider.tsx, RepresentationInspector.tsx] | lang=en
- "lib_blueprintgenerator_generateschematicsheet": "generateSchematicSheet()" | kind=code-symbol | source=src/lib/blueprintGenerator.ts:L286 | neighbors=[blueprintGenerator.ts, generateBlueprintPack(), sheetStatus(), tblId()] | lang=en
- "lib_blueprintsheettypes_blueprintdrawing": "BlueprintDrawing" | kind=code-symbol | source=src/lib/blueprintSheetTypes.ts:L88 | neighbors=[BlueprintDrawingRenderer.tsx, blueprintGenerator.ts, blueprintSheetTypes.ts, engineeringBlueprintDrawing.test.ts] | lang=en
- "lib_blueprintsheettypes_blueprintpack": "BlueprintPack" | kind=code-symbol | source=src/lib/blueprintSheetTypes.ts:L155 | neighbors=[blueprintGenerator.ts, blueprintPackExport.ts, blueprintSheetTypes.ts, index.ts] | lang=en
- "lib_blueprintsheettypes_blueprintsheet": "BlueprintSheet" | kind=code-symbol | source=src/lib/blueprintSheetTypes.ts:L128 | neighbors=[BlueprintSheetRenderer.tsx, blueprintGenerator.ts, blueprintPackExport.ts, blueprintSheetTypes.ts] | lang=en
- "lib_designreview_rundesignreview": "runDesignReview()" | kind=code-symbol | source=src/lib/designReview.ts:L3 | neighbors=[blueprintGenerator.ts, designReview.ts, readinessScore.ts, projectStore.ts] | lang=en
- "lib_editorlayoutgenerators_getinitialfactoryfiles": "getInitialFactoryFiles()" | kind=code-symbol | source=src/lib/editorLayoutGenerators.ts:L14 | neighbors=[editorLayoutGenerators.ts, addRequiredFactoryFileChecklist(), generateEditorLayouts(), projectStore.ts] | lang=en
- "lib_exportblueprintsheets_totalavgcurrent": "totalAvgCurrent()" | kind=code-symbol | source=src/lib/exportBlueprintSheets.ts:L5 | neighbors=[exportBlueprintSheets.ts, exportBlueprintSheetsHtml(), exportBlueprintSheetsJson(), exportBlueprintSheetsMarkdown()] | lang=en
- "lib_exportcsv": "exportCsv.ts" | kind=code-symbol | source=src/lib/exportCsv.ts:L1 | neighbors=[0e8fa7a feat: complete local-first hard…, PinMapTable.tsx, PowerBudgetTable.tsx, exportToCSV()] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\ANKIT BHARDWAJ\Desktop\hardware studio\.graphify\description-instructions\batch-008.json

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
