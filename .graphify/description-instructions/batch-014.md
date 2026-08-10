# Node Description Batch 15 of 28

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

- "board_boardinteraction_default_view_state": "DEFAULT_VIEW_STATE" | kind=code-symbol | source=src/components/board/boardInteraction.ts:L42 | neighbors=[BoardDesigner.tsx, boardInteraction.ts]
- "board_boardinteraction_grid_presets": "GRID_PRESETS" | kind=code-symbol | source=src/components/board/boardInteraction.ts:L81 | neighbors=[boardInteraction.ts, BoardToolbar.tsx]
- "board_boardlayerpanel_boardlayerpanel": "BoardLayerPanel()" | kind=code-symbol | source=src/components/board/BoardLayerPanel.tsx:L24 | neighbors=[BoardDesigner.tsx, BoardLayerPanel.tsx]
- "board_boardnetpanel_boardnetpanel": "BoardNetPanel()" | kind=code-symbol | source=src/components/board/BoardNetPanel.tsx:L11 | neighbors=[BoardDesigner.tsx, BoardNetPanel.tsx]
- "board_boardstatusbar_boardstatusbar": "BoardStatusBar()" | kind=code-symbol | source=src/components/board/BoardStatusBar.tsx:L8 | neighbors=[BoardDesigner.tsx, BoardStatusBar.tsx]
- "board_boardtoolbar_boardtoolbar": "BoardToolbar()" | kind=code-symbol | source=src/components/board/BoardToolbar.tsx:L31 | neighbors=[BoardDesigner.tsx, BoardToolbar.tsx]
- "component_library_componentlibraryworkbench_componentlibraryworkbench": "ComponentLibraryWorkbench()" | kind=code-symbol | source=src/components/component-library/ComponentLibraryWorkbench.tsx:L189 | neighbors=[ComponentLibraryWorkbench.tsx, UnifiedWorkbenchAdapters.tsx]
- "components_appshell_appshell": "AppShell()" | kind=code-symbol | source=src/components/AppShell.tsx:L90 | neighbors=[AppShell.tsx, renderSurface()]
- "components_appshell_rendersurface": "renderSurface()" | kind=code-symbol | source=src/components/AppShell.tsx:L40 | neighbors=[AppShell.tsx, AppShell()]
- "components_blueprintcanvas_blueprintcanvas": "BlueprintCanvas()" | kind=code-symbol | source=src/components/BlueprintCanvas.tsx:L378 | neighbors=[AppShell.tsx, BlueprintCanvas.tsx]
- "components_blueprintcanvas_boundarynode": "BoundaryNode()" | kind=code-symbol | source=src/components/BlueprintCanvas.tsx:L196 | neighbors=[BlueprintCanvas.tsx, getStatusClasses()]
- "components_blueprintcanvas_splitports": "splitPorts()" | kind=code-symbol | source=src/components/BlueprintCanvas.tsx:L71 | neighbors=[BlueprintCanvas.tsx, ArchitectureNode()]
- "components_blueprintcanvas_userepresentationinspector": "useRepresentationInspector()" | kind=code-symbol | source=src/components/BlueprintCanvas.tsx:L60 | neighbors=[BlueprintCanvas.tsx, ArchitectureNode()]
- "components_blueprintsheets_blueprintsheets": "BlueprintSheets()" | kind=code-symbol | source=src/components/BlueprintSheets.tsx:L22 | neighbors=[AppShell.tsx, BlueprintSheets.tsx]
- "components_boardstudio_boardstudio": "BoardStudio()" | kind=code-symbol | source=src/components/BoardStudio.tsx:L22 | neighbors=[AppShell.tsx, BoardStudio.tsx]
- "components_componentlibrary_componentpindefinition": "ComponentPinDefinition" | kind=code-symbol | source=src/lib/components/componentLibrary.ts:L3 | neighbors=[ComponentLibraryWorkbench.tsx, componentLibrary.ts]
- "components_exportcenter_exportcenter": "ExportCenter()" | kind=code-symbol | source=src/components/ExportCenter.tsx:L38 | neighbors=[AppShell.tsx, ExportCenter.tsx]
- "components_factorypackagebuilder_factorypackagebuilder": "FactoryPackageBuilder()" | kind=code-symbol | source=src/components/FactoryPackageBuilder.tsx:L50 | neighbors=[AppShell.tsx, FactoryPackageBuilder.tsx]
- "components_pcbconstraints_pcbconstraints": "PCBConstraints()" | kind=code-symbol | source=src/components/PCBConstraints.tsx:L12 | neighbors=[AppShell.tsx, PCBConstraints.tsx]
- "components_pinmaptable_pinmaptable": "PinMapTable()" | kind=code-symbol | source=src/components/PinMapTable.tsx:L17 | neighbors=[AppShell.tsx, PinMapTable.tsx]
- "components_powerbudgettable_powerbudgettable": "PowerBudgetTable()" | kind=code-symbol | source=src/components/PowerBudgetTable.tsx:L18 | neighbors=[AppShell.tsx, PowerBudgetTable.tsx]
- "components_productvisualizer_productvisualizer": "ProductVisualizer()" | kind=code-symbol | source=src/components/ProductVisualizer.tsx:L5 | neighbors=[AppShell.tsx, ProductVisualizer.tsx]
- "components_projectdashboard_projectdashboard": "ProjectDashboard()" | kind=code-symbol | source=src/components/ProjectDashboard.tsx:L46 | neighbors=[AppShell.tsx, ProjectDashboard.tsx]
- "components_projectmanager_projectmanager": "ProjectManager()" | kind=code-symbol | source=src/components/ProjectManager.tsx:L25 | neighbors=[ProjectManager.tsx, TopBar.tsx]
- "components_propertiespanel_propertiespanel": "PropertiesPanel()" | kind=code-symbol | source=src/components/PropertiesPanel.tsx:L6 | neighbors=[AppShell.tsx, PropertiesPanel.tsx]
- "components_readinessdashboard_readinessdashboard": "ReadinessDashboard()" | kind=code-symbol | source=src/components/ReadinessDashboard.tsx:L12 | neighbors=[AppShell.tsx, ReadinessDashboard.tsx]
- "components_reviewwarnings_reviewwarnings": "ReviewWarnings()" | kind=code-symbol | source=src/components/ReviewWarnings.tsx:L6 | neighbors=[AppShell.tsx, ReviewWarnings.tsx]
- "components_sidebar_sidebar": "Sidebar()" | kind=code-symbol | source=src/components/Sidebar.tsx:L87 | neighbors=[AppShell.tsx, Sidebar.tsx]
- "components_templatepicker_templatepicker": "TemplatePicker()" | kind=code-symbol | source=src/components/TemplatePicker.tsx:L15 | neighbors=[TemplatePicker.tsx, TopBar.tsx]
- "components_topbar_topbar": "TopBar()" | kind=code-symbol | source=src/components/TopBar.tsx:L50 | neighbors=[AppShell.tsx, TopBar.tsx]
- "data_blocklibrary_blocklibrary": "blockLibrary" | kind=code-symbol | source=src/data/blockLibrary.ts:L17 | neighbors=[Sidebar.tsx, blockLibrary.ts]
- "eslint_config": "eslint.config.mjs" | kind=code-symbol | source=eslint.config.mjs:L1 | neighbors=[b2d482b Initial commit from Create Next…, eslintConfig]
- "feedback_feedbackprovider_feedbackprovider": "FeedbackProvider()" | kind=code-symbol | source=src/components/feedback/FeedbackProvider.tsx:L236 | neighbors=[FeedbackProvider.tsx, StudioRoot.tsx]
- "feedback_feedbackstate_decisionrequest": "DecisionRequest" | kind=code-symbol | source=src/lib/feedback/feedbackState.ts:L39 | neighbors=[FeedbackProvider.tsx, feedbackState.ts]
- "feedback_feedbackstate_feedbacktone": "FeedbackTone" | kind=code-symbol | source=src/lib/feedback/feedbackState.ts:L1 | neighbors=[FeedbackProvider.tsx, feedbackState.ts]
- "feedback_feedbackstate_toastrecord": "ToastRecord" | kind=code-symbol | source=src/lib/feedback/feedbackState.ts:L12 | neighbors=[feedbackState.ts, ToastRequest]
- "firmware_firmwarecodepreview_firmwarecodepreview": "FirmwareCodePreview()" | kind=code-symbol | source=src/components/firmware/FirmwareCodePreview.tsx:L9 | neighbors=[FirmwareCodePreview.tsx, FirmwareStudio.tsx]
- "firmware_firmwarestatemachinecanvas_firmwarestatemachinecanvas": "FirmwareStateMachineCanvas()" | kind=code-symbol | source=src/components/firmware/FirmwareStateMachineCanvas.tsx:L57 | neighbors=[FirmwareStateMachineCanvas.tsx, FirmwareStudio.tsx]
- "firmware_firmwarestudio_firmwarestudio": "FirmwareStudio()" | kind=code-symbol | source=src/components/firmware/FirmwareStudio.tsx:L15 | neighbors=[AppShell.tsx, FirmwareStudio.tsx]
- "knowledge_deviceknowledge_device_knowledge_categories": "DEVICE_KNOWLEDGE_CATEGORIES" | kind=code-symbol | source=src/lib/knowledge/deviceKnowledge.ts:L3 | neighbors=[deviceKnowledge.ts, KnowledgeDrawer.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\ANKIT BHARDWAJ\Desktop\hardware studio\.graphify\description-instructions\batch-014.json

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
