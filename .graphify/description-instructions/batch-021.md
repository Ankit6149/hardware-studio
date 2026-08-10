# Node Description Batch 22 of 28

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

- "components_factorypackagebuilder_downloadfile": "downloadFile()" | kind=code-symbol | source=src/components/FactoryPackageBuilder.tsx:L38 | neighbors=[FactoryPackageBuilder.tsx]
- "components_projectdashboard_arraylength": "arrayLength()" | kind=code-symbol | source=src/components/ProjectDashboard.tsx:L26 | neighbors=[ProjectDashboard.tsx]
- "components_projectdashboard_domainbyid": "domainById" | kind=code-symbol | source=src/components/ProjectDashboard.tsx:L34 | neighbors=[ProjectDashboard.tsx]
- "components_projectdashboard_statusstyles": "statusStyles" | kind=code-symbol | source=src/components/ProjectDashboard.tsx:L40 | neighbors=[ProjectDashboard.tsx]
- "components_projectdashboard_stringvalue": "stringValue()" | kind=code-symbol | source=src/components/ProjectDashboard.tsx:L30 | neighbors=[ProjectDashboard.tsx]
- "components_projectmanager_projectmanagerprops": "ProjectManagerProps" | kind=code-symbol | source=src/components/ProjectManager.tsx:L20 | neighbors=[ProjectManager.tsx]
- "components_sidebar_iconbykey": "iconByKey" | kind=code-symbol | source=src/components/Sidebar.tsx:L54 | neighbors=[Sidebar.tsx]
- "components_sidebar_sidebarprops": "SidebarProps" | kind=code-symbol | source=src/components/Sidebar.tsx:L50 | neighbors=[Sidebar.tsx]
- "components_templatepicker_templatepickerprops": "TemplatePickerProps" | kind=code-symbol | source=src/components/TemplatePicker.tsx:L10 | neighbors=[TemplatePicker.tsx]
- "components_topbar_projectnameeditor": "ProjectNameEditor()" | kind=code-symbol | source=src/components/TopBar.tsx:L18 | neighbors=[TopBar.tsx]
- "components_topbar_projectnameeditorprops": "ProjectNameEditorProps" | kind=code-symbol | source=src/components/TopBar.tsx:L13 | neighbors=[TopBar.tsx]
- "eslint_config_eslintconfig": "eslintConfig" | kind=code-symbol | source=eslint.config.mjs:L5 | neighbors=[eslint.config.mjs]
- "feedback_feedbackprovider_confirmoptions": "ConfirmOptions" | kind=code-symbol | source=src/components/feedback/FeedbackProvider.tsx:L17 | neighbors=[FeedbackProvider.tsx]
- "feedback_feedbackprovider_createid": "createId()" | kind=code-symbol | source=src/components/feedback/FeedbackProvider.tsx:L29 | neighbors=[FeedbackProvider.tsx]
- "feedback_feedbackprovider_decisiondialog": "DecisionDialog()" | kind=code-symbol | source=src/components/feedback/FeedbackProvider.tsx:L134 | neighbors=[FeedbackProvider.tsx]
- "feedback_feedbackprovider_feedbackapi": "FeedbackApi" | kind=code-symbol | source=src/components/feedback/FeedbackProvider.tsx:L20 | neighbors=[FeedbackProvider.tsx]
- "feedback_feedbackprovider_feedbackcontext": "FeedbackContext" | kind=code-symbol | source=src/components/feedback/FeedbackProvider.tsx:L27 | neighbors=[FeedbackProvider.tsx]
- "feedback_feedbackprovider_promptoptions": "PromptOptions" | kind=code-symbol | source=src/components/feedback/FeedbackProvider.tsx:L18 | neighbors=[FeedbackProvider.tsx]
- "feedback_feedbackprovider_toastitem": "ToastItem()" | kind=code-symbol | source=src/components/feedback/FeedbackProvider.tsx:L59 | neighbors=[FeedbackProvider.tsx]
- "feedback_feedbackprovider_tonepresentation": "tonePresentation" | kind=code-symbol | source=src/components/feedback/FeedbackProvider.tsx:L36 | neighbors=[FeedbackProvider.tsx]
- "feedback_feedbackstate_feedbackaction": "FeedbackAction" | kind=code-symbol | source=src/lib/feedback/feedbackState.ts:L46 | neighbors=[feedbackState.ts]
- "feedback_feedbackstate_feedbackstate": "FeedbackState" | kind=code-symbol | source=src/lib/feedback/feedbackState.ts:L41 | neighbors=[feedbackState.ts]
- "firmware_firmwarecodegen_generatefirmwaresource": "generateFirmwareSource()" | kind=code-symbol | source=src/lib/firmware/firmwareCodegen.ts:L5 | neighbors=[firmwareCodegen.ts]
- "firmware_firmwarestatemachinecanvas_firmwarestatenode": "FirmwareStateNode()" | kind=code-symbol | source=src/components/firmware/FirmwareStateMachineCanvas.tsx:L22 | neighbors=[FirmwareStateMachineCanvas.tsx]
- "firmware_firmwarestatemachinecanvas_nodetypes": "nodeTypes" | kind=code-symbol | source=src/components/firmware/FirmwareStateMachineCanvas.tsx:L49 | neighbors=[FirmwareStateMachineCanvas.tsx]
- "firmware_firmwarestatemachinecanvas_props": "Props" | kind=code-symbol | source=src/components/firmware/FirmwareStateMachineCanvas.tsx:L51 | neighbors=[FirmwareStateMachineCanvas.tsx]
- "firmware_firmwarestatemachinecanvas_state_type_colors": "STATE_TYPE_COLORS" | kind=code-symbol | source=src/components/firmware/FirmwareStateMachineCanvas.tsx:L12 | neighbors=[FirmwareStateMachineCanvas.tsx]
- "firmware_firmwarestudio_btnstyle": "btnStyle" | kind=code-symbol | source=src/components/firmware/FirmwareStudio.tsx:L258 | neighbors=[FirmwareStudio.tsx]
- "firmware_firmwarestudio_firmwarestudioprops": "FirmwareStudioProps" | kind=code-symbol | source=src/components/firmware/FirmwareStudio.tsx:L11 | neighbors=[FirmwareStudio.tsx]
- "firmware_firmwarestudio_inp": "inp" | kind=code-symbol | source=src/components/firmware/FirmwareStudio.tsx:L260 | neighbors=[FirmwareStudio.tsx]
- "firmware_firmwarestudio_lbl": "lbl" | kind=code-symbol | source=src/components/firmware/FirmwareStudio.tsx:L259 | neighbors=[FirmwareStudio.tsx]
- "firmware_firmwarestudio_tabstyle": "tabStyle" | kind=code-symbol | source=src/components/firmware/FirmwareStudio.tsx:L257 | neighbors=[FirmwareStudio.tsx]
- "firmware_firmwarevalidation_firmwarevalidationissue": "FirmwareValidationIssue" | kind=code-symbol | source=src/lib/firmware/firmwareValidation.ts:L3 | neighbors=[firmwareValidation.ts]
- "knowledge_deviceknowledge_categorymappings": "categoryMappings" | kind=code-symbol | source=src/lib/knowledge/deviceKnowledge.ts:L146 | neighbors=[deviceKnowledge.ts]
- "knowledge_deviceknowledge_explicitcomponentmappings": "explicitComponentMappings" | kind=code-symbol | source=src/lib/knowledge/deviceKnowledge.ts:L136 | neighbors=[deviceKnowledge.ts]
- "knowledge_deviceknowledge_flattenentry": "flattenEntry()" | kind=code-symbol | source=src/lib/knowledge/deviceKnowledge.ts:L75 | neighbors=[deviceKnowledge.ts]
- "knowledge_deviceknowledge_knowledgeconnectionguide": "KnowledgeConnectionGuide" | kind=code-symbol | source=src/lib/knowledge/deviceKnowledge.ts:L29 | neighbors=[deviceKnowledge.ts]
- "knowledge_deviceknowledge_knowledgeprerequisites": "KnowledgePrerequisites" | kind=code-symbol | source=src/lib/knowledge/deviceKnowledge.ts:L23 | neighbors=[deviceKnowledge.ts]
- "knowledge_deviceknowledge_knowledgequalification": "KnowledgeQualification" | kind=code-symbol | source=src/lib/knowledge/deviceKnowledge.ts:L15 | neighbors=[deviceKnowledge.ts]
- "knowledge_deviceknowledge_knowledgesearchoptions": "KnowledgeSearchOptions" | kind=code-symbol | source=src/lib/knowledge/deviceKnowledge.ts:L70 | neighbors=[deviceKnowledge.ts]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\ANKIT BHARDWAJ\Desktop\hardware studio\.graphify\description-instructions\batch-021.json

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
