# Graph Report - .  (2026-08-10)

## Corpus Check
- 222 files · ~2,22,015 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1113 nodes · 3024 edges · 52 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output
- Edge kinds: imports: 821 · contains: 772 · MODIFIES: 520 · imports_from: 459 · calls: 169 · ON_BRANCH: 127 · PARENT_OF: 126 · method: 25 · inherits: 5


## Input Scope
- Requested: auto
- Resolved: committed (source: default-auto)
- Included files: 222 · Candidates: 244
- Excluded: 248 untracked · 35125 ignored · 0 sensitive · 16 missing committed
- Recommendation: Use --scope all or graphify.yaml inputs.corpus for a knowledge-base folder.

## Graph Freshness
- Built from Git commit: `ceaef7e`
- Compare this hash to `git rev-parse HEAD` before trusting freshness-sensitive graph output.
## God Nodes (most connected - your core abstractions)
1. `useProjectStore` - 69 edges
2. `Project` - 46 edges
3. `generateBlueprintPack()` - 18 edges
4. `tblId()` - 17 edges
5. `sheetStatus()` - 17 edges
6. `warnId()` - 16 edges
7. `ProductGraphEngine` - 15 edges
8. `BoardComponent` - 14 edges
9. `useStudioContextStore` - 13 edges
10. `Button()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `0308eaa feat: integrate Board Studio & ECAD Prep module components and dossier exports` --ON_BRANCH--> `master`  [EXTRACTED]
  git → git  _Bridges community 0 → community 8_
- `0308eaa feat: integrate Board Studio & ECAD Prep module components and dossier exports` --PARENT_OF--> `83dc107 Complete and integrate connected offline-first hardware planning workspace, Project Dashboard, extended readiness verification, and template seeding`  [EXTRACTED]
  git → git  _Bridges community 0 → community 20_
- `04f0f7b fix(blueprints): replace fake cards with engineering diagrams` --ON_BRANCH--> `master`  [EXTRACTED]
  git → git  _Bridges community 33 → community 8_
- `04f0f7b fix(blueprints): replace fake cards with engineering diagrams` --PARENT_OF--> `0e71062 Audit recovery: restore CI integrity, navigation truth, and authoritative status (#56)`  [EXTRACTED]
  git → git  _Bridges community 33 → community 28_
- `0a874a4 feat(brand): add reusable Hardware Studio mark` --ON_BRANCH--> `master`  [EXTRACTED]
  git → git  _Bridges community 34 → community 8_

## Communities

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (42): 0308eaa feat: integrate Board Studio & ECAD Prep module components and dossier exports, 0e8fa7a feat: complete local-first hardware planning studio workspace overhaul, 1a539cf feat: implement concept blueprint dossier with print layouts and svg diagrams, 46ca452 chore: rename package to hardware-studio, rewrite README, and resolve all strict compilation lints, 67b9aff fix(brand): restore original logo favicon and compact landing scale, BrandMark(), BrandMarkProps, ProjectManager() (+34 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (48): c020639 Add crash recovery and visible browser-storage health (#57), ConfirmOptions, FeedbackApi, FeedbackContext, FeedbackProvider(), PromptOptions, tonePresentation, useFeedback() (+40 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (55): anchor(), BlueprintDrawingRenderer(), BlueprintDrawingRendererProps, classify(), connectionColors, connectionDash, connectionPoints(), createEngineeringLayout() (+47 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (56): 3bc81e0 fix: connect canonical serialization to project import and export, 50dbe19 refactor: implement pointer-correct reversible commands, 6939a13 fix: preserve every V1 domain through canonical persistence, e4883f9 feat: complete structured schematic connectivity, e872235 refactor: implement reversible engineering command bus, fb367cf feat: complete strict active-board PCB routing, addRequiredFactoryFileChecklist(), autoCreateFirmwareTasksFromHardware() (+48 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (26): 31431d7 feat: complete cross-domain product graph, 3D mechanical preview, local bridge, release engine, and native MCP server, 4a5eb82 feat: complete canonical cross-domain product graph, ProductGraphEngine, getArchitectureNodeRelations(), getBoardRelations(), getComponentDomainLinks(), getFirmwareModuleRelations(), getNetConsumers() (+18 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (34): 1d1ba8d Build connected device knowledge and component workflow (#58), COMPONENT_CATEGORIES, ComponentDraft, PIN_TYPES, ComponentPinDefinition, defaultComponents, ElectronicComponentDefinition, categoryMappings (+26 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (27): 8fac0da Build adaptive workflows and guided project navigation (#63), NavigationDomain, NavigationDomainId, ALL_DOMAINS, createPreferenceFromProfile(), DEFAULT_WORKFLOW_PREFERENCE, deriveGuidedWorkflowActions(), evidence() (+19 more)

### Community 7 - "Community 7"
Cohesion: 0.10
Nodes (25): 17918b0 feat: complete interactive engineering editors for Product, Mechanical, Firmware, and Validation Studios, 931aeec fix: resolve ValidationTest type conflicts and add vertical engineering studios, CATEGORY_COLORS, CONNECTION_TYPE_COLORS, nodeTypes, ProductArchitectureCanvas(), ProductArchitectureCanvasProps, STATUS_BORDER (+17 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (30): master, 0c36fad feat: migrate schematic wires to structured anchors, 0fe0d5b docs: start visual representation system, 1b95096 docs: add product recovery issue dependency map, 1e86240 chore(ci): remove temporary visual verification workflow, 20bb699 fix: clean up schematic wire rendering const declaration, 25e9667 chore(ci): add temporary source audit snapshot, 329890b feat: synchronize PCB and mechanical geometry (+22 more)

### Community 9 - "Community 9"
Cohesion: 0.15
Nodes (22): BoardComponentBin(), BoardComponentBinProps, RightTab, BoardDRCPanel(), BoardDRCPanelProps, severityColor, severityIcon, severityOrder (+14 more)

### Community 10 - "Community 10"
Cohesion: 0.18
Nodes (20): exportConceptualMechanicalLayoutJson(), exportConceptualSchematicJson(), exportEditorLayoutsJson(), exportFactoryReadinessJson(), exportFirmwareArchitectureJson(), exportHandoffManifestJson(), exportHardwareStudioBoardJson(), exportMissingFactoryFilesMarkdown() (+12 more)

### Community 11 - "Community 11"
Cohesion: 0.09
Nodes (23): BoardDesigner(), ComponentLibraryWorkbench(), AppShell(), renderSurface(), BlueprintSheets(), BoardStudio(), ExportCenter(), FactoryPackageBuilder() (+15 more)

### Community 12 - "Community 12"
Cohesion: 0.14
Nodes (19): snapMechanicalPoint(), normalizeNetName(), ValidationEvidence, ValidationMeasurement, ValidationTest, ValidationTestStep, calculateTestStatus(), evaluateValidationMeasurement() (+11 more)

### Community 13 - "Community 13"
Cohesion: 0.14
Nodes (18): 353ec62 feat: complete mechanical geometry dimensions and constraints, 9debb85 feat: synchronize persisted WebGL bodies and collision checks, applyLightweightConstraint(), BoundingBox, BoundingBox3D, boxesOverlap(), checkMechanicalInterference(), CollisionPair (+10 more)

### Community 14 - "Community 14"
Cohesion: 0.14
Nodes (15): ceaef7e Unify the Electronics to PCB and 3D Studio golden path (#65), WorkflowDomainId, StudioContextEntity, StudioContextState, StudioSelection, useStudioContextStore, useWorkflowPreferencesStore, contextualViews (+7 more)

### Community 15 - "Community 15"
Cohesion: 0.09
Nodes (14): metadata, foundations, notReady, principles, workbenches, 41f3691 feat(site): build public Hardware Studio landing page, 523a787 feat(site): move development workspace to studio route, 775cd9f style(site): support scrolling landing page and preserve studio canvas (+6 more)

### Community 16 - "Community 16"
Cohesion: 0.13
Nodes (15): 0be3b86 feat: complete local-bridge CLI and workspace operations, 3011fe7 fix: remove simulated bridge MCP and 3D claims, b349f30 feat: implement mandatory token security and workspace path containment for local bridge, c9e9d0c fix(ci): repair dependency lock and strict TypeScript failures, createServer(), crypto, fs, http (+7 more)

### Community 17 - "Community 17"
Cohesion: 0.14
Nodes (16): 12bcbdd Unify workspace: Integrate Component Library, Schematic Editor, live ERC checks, and schema migrations, runSchematicERC(), SchematicCanvas(), SchematicCanvasProps, getPinPosition(), getSymbolPinLayouts(), snapToGrid(), SymbolPinLayout (+8 more)

### Community 18 - "Community 18"
Cohesion: 0.13
Nodes (20): 74182b5 Build semantic Blueprint visuals and representation inspector (#62), ArchitecturePortDirection, ArchitecturePortKind, familyById, getVisualFamily(), normalize(), portHandleId(), portKindFromHandleId() (+12 more)

### Community 19 - "Community 19"
Cohesion: 0.12
Nodes (17): FirmwareCodePreview(), FirmwareStateMachineCanvas(), nodeTypes, Props, STATE_TYPE_COLORS, btnStyle, FirmwareStudio(), FirmwareStudioProps (+9 more)

### Community 20 - "Community 20"
Cohesion: 0.16
Nodes (11): 266e502 Harden and align gating checks, dashboard indicators, templates, and exports for Engineering Blueprint Pack V3, 51e7527 Upgrade: Complete Blueprint Editor implementation with 12 drafting modes and 16 categories readiness score gating, 83dc107 Complete and integrate connected offline-first hardware planning workspace, Project Dashboard, extended readiness verification, and template seeding, c02c688 V4: Implement Factory Package Builder, Footprints Library, Hardened Design Review and Advanced Gerber/Excellon Serializers, c948130 V5 Release Candidate: Clean up ESLint warnings, fix navigation, improve Project Dashboard layouts, and finalize template loader, e987b85 Upgrade Hardware Studio to V3: 10-gates readiness review, premium app home dashboard, schematic SVG canvas symbols, native Gerber/Excellon serializers, and Ring template update, runDesignReview(), ReadinessReport (+3 more)

### Community 21 - "Community 21"
Cohesion: 0.14
Nodes (18): BoardCanvas(), BoardCanvasProps, getNearestPad(), mmToSvg(), snapToGrid(), svgToMm(), beginRouteFromAnchor(), computeNetConnectivity() (+10 more)

### Community 22 - "Community 22"
Cohesion: 0.16
Nodes (14): AbsolutePad, autoPlaceComponents(), BBox, bboxesOverlap(), componentsOverlap(), getComponentBoundingBox(), getOutlineBounds(), isPointInsideOutline() (+6 more)

### Community 23 - "Community 23"
Cohesion: 0.17
Nodes (10): 1eebb14 feat: implement MCP server live integration, proposals, and audit records, 78bd697 feat: generate multi-sheet blueprint packs and release manifest package with SHA-256 checksums, 9e2c2c6 feat: add real MCP server and semantic tools, e20a167 feat: complete readiness engine calculation and master hardware studio V1 end-to-end integration test suite, drcId(), runBoardDRC(), HardwareStudioMCPServer, createStdioMCPServer() (+2 more)

### Community 24 - "Community 24"
Cohesion: 0.25
Nodes (14): 519cc54 feat: integrate revisions branches and releases, approveRelease(), createBranch(), createNamedRevision(), createReleaseCandidate(), createWorkingBranchFromRelease(), mergeBranches(), MergeConflict (+6 more)

### Community 25 - "Community 25"
Cohesion: 0.13
Nodes (16): MechanicalCanvas(), MechanicalCanvasProps, ToolMode, TYPE_COLORS, ViewState, inputStyle, labelStyle, MechanicalInspector() (+8 more)

### Community 26 - "Community 26"
Cohesion: 0.22
Nodes (13): computeSHA256(), generateManufacturingManifestPackage(), ManufacturingFileManifest, ManufacturingManifestPackage, computeCryptoSHA256(), exportBomCsv(), exportConceptualNetRoutingJson(), exportConceptualPlacementCsv() (+5 more)

### Community 27 - "Community 27"
Cohesion: 0.19
Nodes (11): ArchitectureNode(), BlueprintCanvas(), BoundaryNode(), getStatusClasses(), nodeTypes, RepresentationInspectorContext, RepresentationInspectorContextValue, splitPorts() (+3 more)

### Community 28 - "Community 28"
Cohesion: 0.24
Nodes (10): 0e71062 Audit recovery: restore CI integrity, navigation truth, and authoritative status (#56), allNavigationItems, compatibleNavigationItems, getNavigationItem(), isCanvasNavigationItem(), navigationDomains, NavigationItem, navigationItemById (+2 more)

### Community 29 - "Community 29"
Cohesion: 0.20
Nodes (5): BlueprintPageLayoutProps, BlueprintTitleBlock(), BlueprintTitleBlockProps, aa18a6c Upgrade Blueprint Sheets to Engineering Blueprint Pack v2 (16 sheets, drawing grids, heuristics checklist), SheetProps

### Community 30 - "Community 30"
Cohesion: 0.18
Nodes (6): ArchitectureGlyph(), ArchitectureGlyphProps, commonStroke, DeviceVisualProps, LazyLightweight3DPreview, UnavailableVisualProps

### Community 31 - "Community 31"
Cohesion: 0.27
Nodes (9): addBox(), addCylinder(), addPins(), buildFamilyModel(), Lightweight3DPreviewProps, material(), qualityPixelRatio, VisualQualityProfile (+1 more)

### Community 32 - "Community 32"
Cohesion: 0.22
Nodes (9): iconByKey, Sidebar(), SidebarProps, blockLibrary, BlockLibraryItem, NavigationIconKey, getDomainIdForView(), getHiddenDomainCount() (+1 more)

### Community 33 - "Community 33"
Cohesion: 0.20
Nodes (10): 04f0f7b fix(blueprints): replace fake cards with engineering diagrams, 2d25baf ci: add one-time hash-checked UX payload repair, 2ddcb2d ci: normalize transport line endings before UX payload verification, 3db6173 ci: verify first UX foundations batch, 92e04ee ci: validate UX payload chunks before reconstruction, 98ba04a ci: capture raw UX payload for deterministic diagnosis, 9c94b0d ci: capture complete UX batch lint diagnostics, a7bca39 ci: repair one-byte transport corruption by verified hash (+2 more)

### Community 34 - "Community 34"
Cohesion: 0.20
Nodes (10): 0a874a4 feat(brand): add reusable Hardware Studio mark, 1e20e27 docs: add architecture-first product roadmap, 2c82cdc docs: replace README with honest product overview, 334b67f docs: document Hardware Studio system architecture, 4bda572 docs: define safety boundaries and engineering limitations, 52be84b Update README.md, 594db9c docs: publish honest current development status, 5a2debf feat(brand): add Hardware Studio favicon (+2 more)

### Community 35 - "Community 35"
Cohesion: 0.24
Nodes (7): 9c84530 feat: implement interactive product visualizer, resolve hydration mismatch issues, and polish UI/UX, ProductVisualizer(), ReviewWarnings(), runValidationRules(), Warning, CustomEdge, CustomNode

### Community 36 - "Community 36"
Cohesion: 0.20
Nodes (7): a2a6010 fix: resolve duplicate keys in Sidebar navigation and align Blueprint Editor and visual components to light theme, bb27ce0 Fix visual styling theme mismatch in ProjectDashboard: convert from dark-mode to coherent application light-mode, f8edf1c feat: Blueprint Generation System - 16-sheet pack from live project data, exportBlueprintPackHtml(), exportBlueprintPackJson(), exportBlueprintPackMarkdown(), BlueprintPack

### Community 37 - "Community 37"
Cohesion: 0.20
Nodes (9): useKnowledge(), NodeData, DeviceVisual(), representationIcon, RepresentationInspector(), RepresentationInspectorProps, statusClasses, trustClasses (+1 more)

### Community 38 - "Community 38"
Cohesion: 0.25
Nodes (5): BoardLayerPanel(), BoardLayerPanelProps, LAYER_DEFS, 356b610 Stabilize schematic and PCB routing, multi-board DRC, live blueprint drawings, active board fabrication exports, cross-probing navigation, and unit tests, a8af0f5 Stabilize schematic locked types

### Community 39 - "Community 39"
Cohesion: 0.43
Nodes (6): getComponentPads(), getNetRatsnestLines(), getPadsForNet(), inferPadNetAssignments(), roughAutorouteNet(), UnionFind

### Community 40 - "Community 40"
Cohesion: 0.25
Nodes (8): 0af0a13 ci: remove final legacy branding remnants, 0fd33e9 ci: expose brand correction diagnostics, 10b7170 chore: apply unified logo favicon and landing scale fix, 174879d fix(ui): restore component typography scale, 93eeb1b ci: normalize remaining legacy identifiers, b51d44c ci: expose exact remaining legacy matches, eed3ee3 ci: run verified brand and scale correction, f79020a ci: capture visual correction diagnostics

### Community 41 - "Community 41"
Cohesion: 0.39
Nodes (5): 21c12a9 feat: implement real validation run engine, 84415a2 fix(v1): complete truthful production corrective implementation pass, a257b9a feat: implement branching, tagged revisions, release candidates, and frozen immutable releases, ExecuteRunOptions, runValidationTest()

### Community 42 - "Community 42"
Cohesion: 0.43
Nodes (6): 2a55e09 fix: preserve complete project graph across serialization, deserializeProject(), migrateProjectSchema(), ProjectIntegrityIssue, serializeProject(), validateProjectIntegrity()

### Community 43 - "Community 43"
Cohesion: 0.36
Nodes (7): 3e73302 Bind Blueprint Sheets SVG drawings dynamically to live workspace databases and support page breaks during print, 42e7274 Implement printable/exportable Blueprint Sheets layer with A4-styled engineering SVG diagrams, f778e84 Correct Touch Input circuitType to Sensor, exportBlueprintSheetsHtml(), exportBlueprintSheetsJson(), exportBlueprintSheetsMarkdown(), totalAvgCurrent()

### Community 44 - "Community 44"
Cohesion: 0.25
Nodes (8): 55109ec feat(brand): publish reusable repository mark, 5cd6df7 fix(brand): remove legacy branding from site metadata, 61d8d93 refactor(studio): tighten header scale and apply brand mark, 7e58361 chore(repo): add project description website and keywords, 83d60e7 refactor(studio): compact sidebar typography and spacing, 87cb462 refactor(site): reduce landing scale and improve responsive layout, d2d8fac chore(brand): remove legacy favicon asset, d4da782 docs(readme): polish repository front door and remove legacy branding

### Community 45 - "Community 45"
Cohesion: 0.50
Nodes (5): fb2f623 feat: build persistent firmware source workspace, exportFirmwareSkeletonFile(), generateFirmwareSkeleton(), generateFirmwareWorkspace(), FirmwareSourceFile

### Community 46 - "Community 46"
Cohesion: 0.29
Nodes (6): BoardKeepout, BoardOutline, DrillHole, PadNetAssignment, Trace, Via

### Community 47 - "Community 47"
Cohesion: 0.29
Nodes (4): domainById, ProjectDashboard(), statusStyles, WorkflowProjectSnapshot

### Community 48 - "Community 48"
Cohesion: 0.33
Nodes (2): BoardInspector(), BoardObjectInspectorProps

### Community 49 - "Community 49"
Cohesion: 0.33
Nodes (3): Board3DQuality, pixelRatioByQuality, UnifiedBoard3DView()

### Community 50 - "Community 50"
Cohesion: 0.33
Nodes (1): SheetProps

### Community 51 - "Community 51"
Cohesion: 0.33
Nodes (1): SheetProps

## Knowledge Gaps
- **221 isolated node(s):** `eslintConfig`, `nextConfig`, `http`, `{ spawn }`, `crypto` (+216 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 48`** (2 nodes): `BoardInspector()`, `BoardObjectInspectorProps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (1 nodes): `SheetProps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (1 nodes): `SheetProps`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useProjectStore` connect `Community 0` to `Community 21`, `Community 9`, `Community 48`, `Community 38`, `Community 5`, `Community 11`, `Community 27`, `Community 10`, `Community 35`, `Community 47`, `Community 32`, `Community 45`, `Community 19`, `Community 25`, `Community 49`, `Community 7`, `Community 24`, `Community 17`, `Community 3`, `Community 14`, `Community 26`, `Community 23`, `Community 13`, `Community 8`, `Community 12`, `Community 41`, `Community 37`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `Project` connect `Community 4` to `Community 26`, `Community 21`, `Community 22`, `Community 2`, `Community 20`, `Community 3`, `Community 43`, `Community 0`, `Community 45`, `Community 10`, `Community 5`, `Community 42`, `Community 24`, `Community 17`, `Community 41`, `Community 23`, `Community 13`, `Community 50`, `Community 51`, `Community 29`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `http` to the rest of the system?**
  _221 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06278538812785388 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.050921861281826165 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.0819252432155658 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.06041986687147977 - nodes in this community are weakly interconnected._