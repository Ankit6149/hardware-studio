# Node Description Batch 6 of 28

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

- "commit:repo:github.com/Ankit6149/hardware-studio@6939a13c3b906cb92bcaf66f118b3edf1a90172b": "6939a13 fix: preserve every V1 domain through canonical persistence" | kind=Commit | source=git | neighbors=[master, 50dbe19 refactor: implement pointer-cor…, projectSerialization.ts, projectStore.ts, projectStoreSerialization.test.ts, index.ts] | lang=pt
- "commit:repo:github.com/Ankit6149/hardware-studio@b2d482bd3c5852988a5ae1e51834c61732aeae46": "b2d482b Initial commit from Create Next App" | kind=Commit | source=git | neighbors=[layout.tsx, page.tsx, master, 9c84530 feat: implement interactive pro…, eslint.config.mjs, next.config.ts] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@b7cf95fb85523277a313a2697d964f9e856962fd": "b7cf95f fix: resolve Next.js hydration mismatch via dynamic client loading, dis…" | kind=Commit | source=git | neighbors=[9c84530 feat: implement interactive pro…, layout.tsx, page.tsx, master, 0e8fa7a feat: complete local-first hard…, ProductVisualizer.tsx] | lang=en
- "components_componentlibrary_electroniccomponentdefinition": "ElectronicComponentDefinition" | kind=code-symbol | source=src/lib/components/componentLibrary.ts:L26 | neighbors=[ComponentLibraryWorkbench.tsx, componentLibrary.ts, componentSearch.ts, deviceKnowledge.ts, KnowledgeProvider.tsx, projectStore.ts] | lang=en
- "components_productvisualizer": "ProductVisualizer.tsx" | kind=code-symbol | source=src/components/ProductVisualizer.tsx:L1 | neighbors=[9c84530 feat: implement interactive pro…, a2a6010 fix: resolve duplicate keys in …, b7cf95f fix: resolve Next.js hydration …, AppShell.tsx, ProductVisualizer(), projectStore.ts] | lang=en
- "components_reviewwarnings": "ReviewWarnings.tsx" | kind=code-symbol | source=src/components/ReviewWarnings.tsx:L1 | neighbors=[9c84530 feat: implement interactive pro…, AppShell.tsx, ReviewWarnings(), validationRules.ts, runValidationRules(), projectStore.ts] | lang=en
- "data_blocklibrary": "blockLibrary.ts" | kind=code-symbol | source=src/data/blockLibrary.ts:L1 | neighbors=[0e8fa7a feat: complete local-first hard…, 67b9aff fix(brand): restore original lo…, 9c84530 feat: implement interactive pro…, BlueprintCanvas.tsx, Sidebar.tsx, blockLibrary] | lang=en
- "feedback_feedbackprovider_usefeedback": "useFeedback()" | kind=code-symbol | source=src/components/feedback/FeedbackProvider.tsx:L298 | neighbors=[BoardLayerPanel.tsx, ComponentLibraryWorkbench.tsx, AppShell.tsx, ProjectManager.tsx, TopBar.tsx, FeedbackProvider.tsx] | lang=en
- "lib_blueprintgenerator_generatepcblayoutsheet": "generatePCBLayoutSheet()" | kind=code-symbol | source=src/lib/blueprintGenerator.ts:L343 | neighbors=[blueprintGenerator.ts, generateBlueprintPack(), dimId(), objId(), sheetStatus(), tblId()] | lang=en
- "lib_blueprintgenerator_generatepowertreesheet": "generatePowerTreeSheet()" | kind=code-symbol | source=src/lib/blueprintGenerator.ts:L583 | neighbors=[blueprintGenerator.ts, generateBlueprintPack(), connId(), objId(), sheetStatus(), tblId()] | lang=en
- "lib_blueprintgenerator_generateproductrequirementssheet": "generateProductRequirementsSheet()" | kind=code-symbol | source=src/lib/blueprintGenerator.ts:L101 | neighbors=[blueprintGenerator.ts, generateBlueprintPack(), emptyDrawing(), objId(), sheetStatus(), tblId()] | lang=en
- "lib_blueprintgenerator_objid": "objId()" | kind=code-symbol | source=src/lib/blueprintGenerator.ts:L27 | neighbors=[blueprintGenerator.ts, generateComponentPlacementSheet(), generatePCBLayoutSheet(), generatePinMapSheet(), generatePowerTreeSheet(), generateProductRequirementsSheet()] | lang=en
- "lib_nativeexports_generatenativegerbercoppertop": "generateNativeGerberCopperTop()" | kind=code-symbol | source=src/lib/nativeExports.ts:L291 | neighbors=[mfgManifestEngine.ts, ExportCenter.tsx, FactoryPackageBuilder.tsx, nativeExports.ts, getPlacedComponents(), generateReleasePackageManifest()] | lang=en
- "lib_readinessscore_readinessreport": "ReadinessReport" | kind=code-symbol | source=src/lib/readinessScore.ts:L4 | neighbors=[readinessScore.ts, CoverSheet.tsx, ElectricalSheets.tsx, HandoffSheets.tsx, MechanicalSheets.tsx, PCBSheets.tsx] | lang=en
- "product_productrequirementspanel": "ProductRequirementsPanel.tsx" | kind=code-symbol | source=src/components/product/ProductRequirementsPanel.tsx:L1 | neighbors=[17918b0 feat: complete interactive engi…, ProductRequirementsPanel(), projectStore.ts, useProjectStore, index.ts, ProductRequirement] | lang=en
- "reliability_apperrorboundary_apperrorboundary": "AppErrorBoundary" | kind=code-symbol | source=src/components/reliability/AppErrorBoundary.tsx:L44 | neighbors=[AppErrorBoundary.tsx, .componentDidCatch(), .getDerivedStateFromError(), .getDiagnostics(), .render(), StudioRoot.tsx] | lang=en
- "store_workflowpreferencesstore_useworkflowpreferencesstore": "useWorkflowPreferencesStore" | kind=code-symbol | source=src/store/workflowPreferencesStore.ts:L48 | neighbors=[AppShell.tsx, ProjectDashboard.tsx, Sidebar.tsx, StudioRoot.tsx, workflowPreferencesStore.ts, StudioBuildMap.tsx] | lang=en
- "tests_bridgesecurity_test": "bridgeSecurity.test.ts" | kind=code-symbol | source=src/__tests__/bridgeSecurity.test.ts:L1 | neighbors=[84415a2 fix(v1): complete truthful prod…, adc4f54 feat: add secure real PlatformI…, b349f30 feat: implement mandatory token…, c9e9d0c fix(ci): repair dependency lock…, bridgeServer.js, createServer()] | lang=en
- "tests_bridgeworkspaceops_test": "bridgeWorkspaceOps.test.ts" | kind=code-symbol | source=src/__tests__/bridgeWorkspaceOps.test.ts:L1 | neighbors=[0be3b86 feat: complete local-bridge CLI…, 84415a2 fix(v1): complete truthful prod…, b349f30 feat: implement mandatory token…, c9e9d0c fix(ci): repair dependency lock…, bridgeServer.js, createServer()] | lang=en
- "tests_schematicwireanchors_test": "schematicWireAnchors.test.ts" | kind=code-symbol | source=src/__tests__/schematicWireAnchors.test.ts:L1 | neighbors=[0c36fad feat: migrate schematic wires t…, e20a167 feat: complete readiness engine…, e4883f9 feat: complete structured schem…, projectStore.ts, useProjectStore, index.ts] | lang=en
- "tests_studiounification_test": "studioUnification.test.ts" | kind=code-symbol | source=src/__tests__/studioUnification.test.ts:L1 | neighbors=[ceaef7e Unify the Electronics to PCB an…, studioContextStore.ts, useStudioContextStore, StudioBuildMap.tsx, BUILD_STAGES, ELECTRONICS_FLOW] | lang=en
- "visual_representationregistry_resolvevisualfamilyid": "resolveVisualFamilyId()" | kind=code-symbol | source=src/lib/visual/representationRegistry.ts:L384 | neighbors=[BlueprintCanvas.tsx, Sidebar.tsx, visualRepresentationRegistry.test.ts, RepresentationInspector.tsx, representationRegistry.ts, resolveVisualFamily()] | lang=en
- "blueprints_blueprintpagelayout": "BlueprintPageLayout.tsx" | kind=code-symbol | source=src/components/blueprints/BlueprintPageLayout.tsx:L1 | neighbors=[BlueprintPageLayout(), BlueprintPageLayoutProps, BlueprintTitleBlock.tsx, BlueprintTitleBlock(), 67b9aff fix(brand): restore original lo…, aa18a6c Upgrade Blueprint Sheets to Eng…] | lang=en
- "board_boardgeometry_getnetratsnestlines": "getNetRatsnestLines()" | kind=code-symbol | source=src/components/board/boardGeometry.ts:L173 | neighbors=[BoardCanvas.tsx, boardGeometry.ts, getPadsForNet(), UnionFind, .find(), .union()] | lang=en
- "board_boardgeometry_getpadsfornet": "getPadsForNet()" | kind=code-symbol | source=src/components/board/boardGeometry.ts:L63 | neighbors=[boardGeometry.ts, getNetRatsnestLines(), getComponentPads(), .find(), roughAutorouteNet(), boardDRC.ts] | lang=en
- "board_boardgeometry_unionfind_find": ".find()" | kind=code-symbol | source=src/components/board/boardGeometry.ts:L144 | neighbors=[getNetRatsnestLines(), getPadsForNet(), inferPadNetAssignments(), roughAutorouteNet(), UnionFind, .union()] | lang=en
- "board_boardstatusbar": "BoardStatusBar.tsx" | kind=code-symbol | source=src/components/board/BoardStatusBar.tsx:L1 | neighbors=[BoardDesigner.tsx, boardInteraction.ts, BoardDesignerUIState, BoardStatusBar(), BoardStatusBarProps, 0cae633 Refactor PCB board designer fil…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@0c36fadc660f6ab2d3577797cf2402ad26bddbb3": "0c36fad feat: migrate schematic wires to structured anchors" | kind=Commit | source=git | neighbors=[master, 5139586 feat: complete active-board pad…, SchematicCanvas.tsx, schematicWireAnchors.test.ts, index.ts, cfe236b feat: complete component repres…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@21c12a90a67a38df0204e4396d3d56f09c1ff689": "21c12a9 feat: implement real validation run engine" | kind=Commit | source=git | neighbors=[master, a257b9a feat: implement branching, tagg…, validationRunner.ts, validationRuns.test.ts, index.ts, b349f30 feat: implement mandatory token…] | lang=pt
- "commit:repo:github.com/Ankit6149/hardware-studio@3011fe71d581e42955ee44c85791a08ec30bad09": "3011fe7 fix: remove simulated bridge MCP and 3D claims" | kind=Commit | source=git | neighbors=[master, 3bc81e0 fix: connect canonical serializ…, bridgeServer.js, MechanicalStudio.tsx, localBridge.test.ts, ec18200 audit: document simulated and d…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@353ec62f453aa3cf2927cb0bef58fc926f5bada8": "353ec62 feat: complete mechanical geometry dimensions and constraints" | kind=Commit | source=git | neighbors=[master, 9debb85 feat: synchronize persisted Web…, mechanicalGeometry.ts, projectStore.ts, mechanicalGeometry.test.ts, fb367cf feat: complete strict active-bo…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@380fca6a8bc6b7759033ae9cca7d6a6ae193b89a": "380fca6 feat: add real WebGL 3D product workbench" | kind=Commit | source=git | neighbors=[master, 329890b feat: synchronize PCB and mecha…, MechanicalStudio.tsx, webgl3DView.test.ts, index.ts, 56d64a6 feat: complete 2D mechanical ge…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@519cc54b3ce5d96fdef36ac8055db9c880617cfb": "519cc54 feat: integrate revisions branches and releases" | kind=Commit | source=git | neighbors=[master, 78d58ff feat: complete validation runs …, AppShell.tsx, RevisionsStudio.tsx, revisionsUI.test.ts, 9e2c2c6 feat: add real MCP server and s…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@9e2c2c6be70419263603e12e28de7b946bd940d9": "9e2c2c6 feat: add real MCP server and semantic tools" | kind=Commit | source=git | neighbors=[master, 519cc54 feat: integrate revisions branc…, mcpServer.ts, mcpServerStdio.ts, mcpProtocol.test.ts, adc4f54 feat: add secure real PlatformI…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@a2a60109a41000152ac5bb751358a1f3cc90b917": "a2a6010 fix: resolve duplicate keys in Sidebar navigation and align Blueprint E…" | kind=Commit | source=git | neighbors=[master, 5341241 Build native PCB Board Designer…, FactoryPackageBuilder.tsx, ProductVisualizer.tsx, Sidebar.tsx, f8edf1c feat: Blueprint Generation Syst…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@b349f3079a5605bed0bbc4f0fafef530d9302ef9": "b349f30 feat: implement mandatory token security and workspace path containment…" | kind=Commit | source=git | neighbors=[master, 21c12a9 feat: implement real validation…, bridgeServer.js, bridgeSecurity.test.ts, bridgeWorkspaceOps.test.ts, fb2f623 feat: build persistent firmware…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@fb2f623b834385f3f1f605d11379d692093613ea": "fb2f623 feat: build persistent firmware source workspace" | kind=Commit | source=git | neighbors=[9debb85 feat: synchronize persisted Web…, master, b349f30 feat: implement mandatory token…, FirmwareCodePreview.tsx, exportFirmware.ts, firmwareWorkspace.test.ts] | lang=en
- "components_brandmark": "BrandMark.tsx" | kind=code-symbol | source=src/components/BrandMark.tsx:L1 | neighbors=[page.tsx, 0a874a4 feat(brand): add reusable Hardw…, 67b9aff fix(brand): restore original lo…, BrandMark(), BrandMarkProps, TopBar.tsx] | lang=en
- "components_componentlibrary_defaultcomponents": "defaultComponents" | kind=code-symbol | source=src/lib/components/componentLibrary.ts:L86 | neighbors=[ComponentLibraryWorkbench.tsx, componentLibrary.ts, componentSearch.ts, projectMigrations.ts, deviceKnowledge.test.ts, unifiedGoldenPath.integration.test.ts] | lang=en
- "lib_blueprintgenerator_generateassemblysheet": "generateAssemblySheet()" | kind=code-symbol | source=src/lib/blueprintGenerator.ts:L190 | neighbors=[blueprintGenerator.ts, connId(), sheetStatus(), tblId(), warnId(), generateBlueprintPack()] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\ANKIT BHARDWAJ\Desktop\hardware studio\.graphify\description-instructions\batch-005.json

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
