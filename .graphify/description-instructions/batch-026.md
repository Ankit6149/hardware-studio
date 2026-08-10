# Node Description Batch 27 of 28

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

- "studio_studiobuildmap_countof": "countOf()" | kind=code-symbol | source=src/components/studio/StudioBuildMap.tsx:L49 | neighbors=[StudioBuildMap.tsx]
- "studio_unifiedboarddrcworkbench_severitystyles": "severityStyles" | kind=code-symbol | source=src/components/studio/UnifiedBoardDRCWorkbench.tsx:L20 | neighbors=[UnifiedBoardDRCWorkbench.tsx]
- "studio_unifiedvalidationworkbench_unifiedvalidationworkbenchprops": "UnifiedValidationWorkbenchProps" | kind=code-symbol | source=src/components/studio/UnifiedValidationWorkbench.tsx:L17 | neighbors=[UnifiedValidationWorkbench.tsx]
- "templates_index_gettemplatebyid": "getTemplateById()" | kind=code-symbol | source=src/data/templates/index.ts:L75 | neighbors=[index.ts]
- "tests_bridgesecurity_test_bridgeresponsebody": "BridgeResponseBody" | kind=code-symbol | source=src/__tests__/bridgeSecurity.test.ts:L6 | neighbors=[bridgeSecurity.test.ts]
- "tests_bridgeworkspaceops_test_bridgeresponsebody": "BridgeResponseBody" | kind=code-symbol | source=src/__tests__/bridgeWorkspaceOps.test.ts:L6 | neighbors=[bridgeWorkspaceOps.test.ts]
- "tests_localbridgesecurity_test_bridgeresponsebody": "BridgeResponseBody" | kind=code-symbol | source=src/__tests__/localBridgeSecurity.test.ts:L5 | neighbors=[localBridgeSecurity.test.ts]
- "tests_projectstore_test_makecircle": "makeCircle()" | kind=code-symbol | source=src/__tests__/projectStore.test.ts:L23 | neighbors=[projectStore.test.ts]
- "tests_projectstore_test_makerect": "makeRect()" | kind=code-symbol | source=src/__tests__/projectStore.test.ts:L19 | neighbors=[projectStore.test.ts]
- "tests_runtests_assert": "assert()" | kind=code-symbol | source=src/__tests__/runTests.js:L4 | neighbors=[runTests.js]
- "tests_runtests_runsuite": "runSuite()" | kind=code-symbol | source=src/__tests__/runTests.js:L10 | neighbors=[runTests.js]
- "tests_studiounification_test_source": "source()" | kind=code-symbol | source=src/__tests__/studioUnification.test.ts:L6 | neighbors=[studioUnification.test.ts]
- "tests_workflowprofiles_test_emptysnapshot": "emptySnapshot" | kind=code-symbol | source=src/__tests__/workflowProfiles.test.ts:L17 | neighbors=[workflowProfiles.test.ts]
- "types_index_coppershape": "CopperShape" | kind=code-symbol | source=src/types/index.ts:L416 | neighbors=[index.ts]
- "types_index_customcomponentdefinition": "CustomComponentDefinition" | kind=code-symbol | source=src/types/index.ts:L227 | neighbors=[index.ts]
- "types_index_engineeringcommand": "EngineeringCommand" | kind=code-symbol | source=src/types/index.ts:L993 | neighbors=[index.ts]
- "types_index_firmwareconfiguration": "FirmwareConfiguration" | kind=code-symbol | source=src/types/index.ts:L469 | neighbors=[index.ts]
- "types_index_pcbanchor": "PCBAnchor" | kind=code-symbol | source=src/types/index.ts:L430 | neighbors=[index.ts]
- "types_index_pcbanchortype": "PCBAnchorType" | kind=code-symbol | source=src/types/index.ts:L428 | neighbors=[index.ts]
- "types_index_pcblayer": "PcbLayer" | kind=code-symbol | source=src/types/index.ts:L393 | neighbors=[index.ts]
- "types_index_projectcomponentpin": "ProjectComponentPin" | kind=code-symbol | source=src/types/index.ts:L161 | neighbors=[index.ts]
- "types_index_projectelectroniccomponent": "ProjectElectronicComponent" | kind=code-symbol | source=src/types/index.ts:L225 | neighbors=[index.ts]
- "types_index_schematicpinanchor": "SchematicPinAnchor" | kind=code-symbol | source=src/types/index.ts:L343 | neighbors=[index.ts]
- "types_index_schematicpointanchor": "SchematicPointAnchor" | kind=code-symbol | source=src/types/index.ts:L349 | neighbors=[index.ts]
- "ui_badge_badgeprops": "BadgeProps" | kind=code-symbol | source=src/ui/Badge.tsx:L3 | neighbors=[Badge.tsx]
- "ui_button_buttonprops": "ButtonProps" | kind=code-symbol | source=src/ui/Button.tsx:L3 | neighbors=[Button.tsx]
- "ui_card_cardfooter": "CardFooter()" | kind=code-symbol | source=src/ui/Card.tsx:L55 | neighbors=[Card.tsx]
- "ui_card_cardprops": "CardProps" | kind=code-symbol | source=src/ui/Card.tsx:L3 | neighbors=[Card.tsx]
- "ui_emptystate_emptystate": "EmptyState()" | kind=code-symbol | source=src/ui/EmptyState.tsx:L11 | neighbors=[EmptyState.tsx]
- "ui_emptystate_emptystateprops": "EmptyStateProps" | kind=code-symbol | source=src/ui/EmptyState.tsx:L4 | neighbors=[EmptyState.tsx]
- "ui_formcontrols_inputfieldprops": "InputFieldProps" | kind=code-symbol | source=src/ui/FormControls.tsx:L3 | neighbors=[FormControls.tsx]
- "ui_formcontrols_select": "Select()" | kind=code-symbol | source=src/ui/FormControls.tsx:L40 | neighbors=[FormControls.tsx]
- "ui_formcontrols_selectprops": "SelectProps" | kind=code-symbol | source=src/ui/FormControls.tsx:L34 | neighbors=[FormControls.tsx]
- "ui_formcontrols_textareaprops": "TextareaProps" | kind=code-symbol | source=src/ui/FormControls.tsx:L73 | neighbors=[FormControls.tsx]
- "ui_modal_modalprops": "ModalProps" | kind=code-symbol | source=src/ui/Modal.tsx:L4 | neighbors=[Modal.tsx]
- "ui_statcard_statcardprops": "StatCardProps" | kind=code-symbol | source=src/ui/StatCard.tsx:L3 | neighbors=[StatCard.tsx]
- "validation_validationstudio_btnstyle": "btnStyle" | kind=code-symbol | source=src/components/validation/ValidationStudio.tsx:L470 | neighbors=[ValidationStudio.tsx]
- "validation_validationstudio_measinput": "measInput" | kind=code-symbol | source=src/components/validation/ValidationStudio.tsx:L474 | neighbors=[ValidationStudio.tsx]
- "validation_validationstudio_selectsmall": "selectSmall" | kind=code-symbol | source=src/components/validation/ValidationStudio.tsx:L471 | neighbors=[ValidationStudio.tsx]
- "validation_validationstudio_tabstyle": "tabStyle" | kind=code-symbol | source=src/components/validation/ValidationStudio.tsx:L469 | neighbors=[ValidationStudio.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\ANKIT BHARDWAJ\Desktop\hardware studio\.graphify\description-instructions\batch-026.json

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
