# Node Description Batch 12 of 28

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

- "commit:repo:github.com/Ankit6149/hardware-studio@b4c602812a6a8d00f713b541c0d119c3fd37a3b9": "b4c6028 docs: add complete Hardware Studio product vision" | kind=Commit | source=git | neighbors=[2c82cdc docs: replace README with hones…, master, 334b67f docs: document Hardware Studio …] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@b51d44c8d8111076ab3c23a1aa978f6be3950e03": "b51d44c ci: expose exact remaining legacy matches" | kind=Commit | source=git | neighbors=[93eeb1b ci: normalize remaining legacy …, master, 0af0a13 ci: remove final legacy brandin…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@ca77dd0be33836ac75869217dcee05f158855a20": "ca77dd0 docs: add engineering contribution standards" | kind=Commit | source=git | neighbors=[4bda572 docs: define safety boundaries …, master, 52be84b Update README.md] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@ccad2f19cce07c20bdd474fdfaa1c56551552349": "ccad2f1 revert: remove accidental visual-system placeholder" | kind=Commit | source=git | neighbors=[0fe0d5b docs: start visual representati…, master, 74182b5 Build semantic Blueprint visual…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@cfe236b8dcaf09924fb98933256f36dc48851880": "cfe236b feat: complete component representation editors" | kind=Commit | source=git | neighbors=[4a5eb82 feat: complete canonical cross-…, master, 0c36fad feat: migrate schematic wires t…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@d00bf91cd9aafe46958ed66b8299e40f6c1011c4": "d00bf91 docs: add master hardware studio product research and build blueprint" | kind=Commit | source=git | neighbors=[master, e17a249 fix(brand): use original hardwa…, f686a93 docs: start professional hardwa…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@d2d8facd65319ec806f007f3968391f522f6a5f0": "d2d8fac chore(brand): remove legacy favicon asset" | kind=Commit | source=git | neighbors=[master, 7e58361 chore(repo): add project descri…, d4da782 docs(readme): polish repository…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@d4da782c63b7f288b2ea54ebf09cd754960c696e": "d4da782 docs(readme): polish repository front door and remove legacy branding" | kind=Commit | source=git | neighbors=[87cb462 refactor(site): reduce landing …, master, d2d8fac chore(brand): remove legacy fav…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@e17a2495091c45343574fd27076cd30c8e589fc6": "e17a249 fix(brand): use original hardware studio mark in readme" | kind=Commit | source=git | neighbors=[d00bf91 docs: add master hardware studi…, master, 3db6173 ci: verify first UX foundations…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@e6676b240ae32e9710bc558d92024b89d42d83e3": "e6676b2 docs: record Studio unification gaps and corrective architecture" | kind=Commit | source=git | neighbors=[8fac0da Build adaptive workflows and gu…, master, ceaef7e Unify the Electronics to PCB an…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@e74ed91f25992f05f257962adb4c1f6a3470e0f8": "e74ed91 placeholder" | kind=Commit | source=git | neighbors=[c020639 Add crash recovery and visible …, master, 87befaa revert: remove accidental place…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@ec1820098b35f5a5299752f147fa7c53428efc11": "ec18200 audit: document simulated and disconnected V1 systems" | kind=Commit | source=git | neighbors=[20bb699 fix: clean up schematic wire re…, master, 3011fe7 fix: remove simulated bridge MC…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@eed3ee3037a52b44f9e2c06a359222d9b1dba116": "eed3ee3 ci: run verified brand and scale correction" | kind=Commit | source=git | neighbors=[10b7170 chore: apply unified logo favic…, master, 0fd33e9 ci: expose brand correction dia…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@f686a93633f9e1b64939a9cf85bf21ad0537f060": "f686a93 docs: start professional hardware tool landscape research" | kind=Commit | source=git | neighbors=[1b95096 docs: add product recovery issu…, master, d00bf91 docs: add master hardware studi…] | lang=pt
- "commit:repo:github.com/Ankit6149/hardware-studio@f79020a1796e3492874b379dd9022d0133c09fb2": "f79020a ci: capture visual correction diagnostics" | kind=Commit | source=git | neighbors=[0fd33e9 ci: expose brand correction dia…, master, 93eeb1b ci: normalize remaining legacy …] | lang=pt
- "commit:repo:github.com/Ankit6149/hardware-studio@ffa0c86db65be0218b539bd40dc660b7f68e61e2": "ffa0c86 ci: persist UX lint diagnostics for repair" | kind=Commit | source=git | neighbors=[9c94b0d ci: capture complete UX batch l…, master, 04f0f7b fix(blueprints): replace fake c…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@ffccd5f5864855725fe1df68577e37fd222ce096": "ffccd5f docs: add authoritative product recovery execution plan" | kind=Commit | source=git | neighbors=[a70a958 chore(ci): remove temporary sou…, master, 1b95096 docs: add product recovery issu…] | lang=en
- "components_blueprintcanvas_getstatusclasses": "getStatusClasses()" | kind=code-symbol | source=src/components/BlueprintCanvas.tsx:L42 | neighbors=[BlueprintCanvas.tsx, ArchitectureNode(), BoundaryNode()] | lang=en
- "components_brandmark_brandmark": "BrandMark()" | kind=code-symbol | source=src/components/BrandMark.tsx:L8 | neighbors=[page.tsx, BrandMark.tsx, TopBar.tsx] | lang=en
- "data_blocklibrary_blocklibraryitem": "BlockLibraryItem" | kind=code-symbol | source=src/data/blockLibrary.ts:L1 | neighbors=[BlueprintCanvas.tsx, Sidebar.tsx, blockLibrary.ts] | lang=en
- "feedback_feedbackstate_confirmdecision": "ConfirmDecision" | kind=code-symbol | source=src/lib/feedback/feedbackState.ts:L24 | neighbors=[FeedbackProvider.tsx, feedbackState.ts, DecisionBase] | lang=en
- "feedback_feedbackstate_decisionbase": "DecisionBase" | kind=code-symbol | source=src/lib/feedback/feedbackState.ts:L16 | neighbors=[feedbackState.ts, ConfirmDecision, PromptDecision] | lang=en
- "feedback_feedbackstate_feedbackreducer": "feedbackReducer()" | kind=code-symbol | source=src/lib/feedback/feedbackState.ts:L57 | neighbors=[FeedbackProvider.tsx, feedbackState.ts, feedbackState.test.ts] | lang=en
- "feedback_feedbackstate_initialfeedbackstate": "initialFeedbackState" | kind=code-symbol | source=src/lib/feedback/feedbackState.ts:L52 | neighbors=[FeedbackProvider.tsx, feedbackState.ts, feedbackState.test.ts] | lang=en
- "feedback_feedbackstate_toastrequest": "ToastRequest" | kind=code-symbol | source=src/lib/feedback/feedbackState.ts:L3 | neighbors=[FeedbackProvider.tsx, feedbackState.ts, ToastRecord] | lang=en
- "feedback_feedbackstate_validatepromptvalue": "validatePromptValue()" | kind=code-symbol | source=src/lib/feedback/feedbackState.ts:L72 | neighbors=[FeedbackProvider.tsx, feedbackState.ts, feedbackState.test.ts] | lang=en
- "firmware_firmwarevalidation_sanitizecidentifier": "sanitizeCIdentifier()" | kind=code-symbol | source=src/lib/firmware/firmwareValidation.ts:L11 | neighbors=[firmwareCodegen.ts, firmwareValidation.ts, projectStore.test.ts] | lang=en
- "knowledge_deviceknowledge_normalize": "normalize()" | kind=code-symbol | source=src/lib/knowledge/deviceKnowledge.ts:L104 | neighbors=[deviceKnowledge.ts, resolveKnowledgeIdForComponent(), searchKnowledgeEntries()] | lang=en
- "knowledge_starterdeviceknowledge_starterdeviceknowledge": "starterDeviceKnowledge" | kind=code-symbol | source=src/lib/knowledge/starterDeviceKnowledge.ts:L32 | neighbors=[KnowledgeDrawer.tsx, starterDeviceKnowledge.ts, deviceKnowledge.test.ts] | lang=en
- "lib_blueprintgenerator_connid": "connId()" | kind=code-symbol | source=src/lib/blueprintGenerator.ts:L28 | neighbors=[blueprintGenerator.ts, generateAssemblySheet(), generatePowerTreeSheet()] | lang=en
- "lib_blueprintpackexport_exportblueprintpackhtml": "exportBlueprintPackHtml()" | kind=code-symbol | source=src/lib/blueprintPackExport.ts:L155 | neighbors=[BlueprintSheets.tsx, ExportCenter.tsx, blueprintPackExport.ts] | lang=en
- "lib_blueprintpackexport_exportblueprintpackjson": "exportBlueprintPackJson()" | kind=code-symbol | source=src/lib/blueprintPackExport.ts:L8 | neighbors=[BlueprintSheets.tsx, ExportCenter.tsx, blueprintPackExport.ts] | lang=en
- "lib_blueprintpackexport_exportblueprintpackmarkdown": "exportBlueprintPackMarkdown()" | kind=code-symbol | source=src/lib/blueprintPackExport.ts:L13 | neighbors=[BlueprintSheets.tsx, ExportCenter.tsx, blueprintPackExport.ts] | lang=en
- "lib_blueprintsheettypes_blueprintdrawingconnection": "BlueprintDrawingConnection" | kind=code-symbol | source=src/lib/blueprintSheetTypes.ts:L61 | neighbors=[BlueprintDrawingRenderer.tsx, blueprintGenerator.ts, blueprintSheetTypes.ts] | lang=en
- "lib_blueprintsheettypes_blueprintdrawingobject": "BlueprintDrawingObject" | kind=code-symbol | source=src/lib/blueprintSheetTypes.ts:L33 | neighbors=[BlueprintDrawingRenderer.tsx, blueprintGenerator.ts, blueprintSheetTypes.ts] | lang=en
- "lib_editorlayoutgenerators_generateeditorlayouts": "generateEditorLayouts()" | kind=code-symbol | source=src/lib/editorLayoutGenerators.ts:L36 | neighbors=[editorLayoutGenerators.ts, getInitialFactoryFiles(), projectStore.ts] | lang=en
- "lib_exportblueprintsheets_exportblueprintsheetshtml": "exportBlueprintSheetsHtml()" | kind=code-symbol | source=src/lib/exportBlueprintSheets.ts:L330 | neighbors=[ExportCenter.tsx, exportBlueprintSheets.ts, totalAvgCurrent()] | lang=en
- "lib_exportblueprintsheets_exportblueprintsheetsmarkdown": "exportBlueprintSheetsMarkdown()" | kind=code-symbol | source=src/lib/exportBlueprintSheets.ts:L222 | neighbors=[ExportCenter.tsx, exportBlueprintSheets.ts, totalAvgCurrent()] | lang=en
- "lib_exportcsv_exporttocsv": "exportToCSV()" | kind=code-symbol | source=src/lib/exportCsv.ts:L1 | neighbors=[PinMapTable.tsx, PowerBudgetTable.tsx, exportCsv.ts] | lang=en
- "lib_exportdossier_exportblueprintdossierjson": "exportBlueprintDossierJson()" | kind=code-symbol | source=src/lib/exportDossier.ts:L393 | neighbors=[BlueprintDossier.tsx, ExportCenter.tsx, exportDossier.ts] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\ANKIT BHARDWAJ\Desktop\hardware studio\.graphify\description-instructions\batch-011.json

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
