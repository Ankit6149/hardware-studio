# Node Description Batch 11 of 28

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

- "blueprints_blueprintdrawingrenderer_classify": "classify()" | kind=code-symbol | source=src/components/blueprints/BlueprintDrawingRenderer.tsx:L104 | neighbors=[BlueprintDrawingRenderer.tsx, meta(), Symbol()] | lang=en
- "blueprints_blueprintdrawingrenderer_createengineeringlayout": "createEngineeringLayout()" | kind=code-symbol | source=src/components/blueprints/BlueprintDrawingRenderer.tsx:L32 | neighbors=[BlueprintDrawingRenderer.tsx, BlueprintDrawingRenderer(), engineeringBlueprintDrawing.test.ts] | lang=en
- "blueprints_blueprintdrawingrenderer_meta": "meta()" | kind=code-symbol | source=src/components/blueprints/BlueprintDrawingRenderer.tsx:L99 | neighbors=[BlueprintDrawingRenderer.tsx, classify(), TechnicalLabel()] | lang=en
- "blueprints_blueprintdrawingrenderer_technicallabel": "TechnicalLabel()" | kind=code-symbol | source=src/components/blueprints/BlueprintDrawingRenderer.tsx:L173 | neighbors=[BlueprintDrawingRenderer.tsx, labelLines(), meta()] | lang=en
- "blueprints_mfgmanifestengine_computesha256": "computeSHA256()" | kind=code-symbol | source=src/lib/blueprints/mfgManifestEngine.ts:L30 | neighbors=[mfgManifestEngine.ts, generateManufacturingManifestPackage(), mfgManifestEngine.test.ts] | lang=en
- "blueprints_mfgmanifestengine_generatemanufacturingmanifestpackage": "generateManufacturingManifestPackage()" | kind=code-symbol | source=src/lib/blueprints/mfgManifestEngine.ts:L35 | neighbors=[mfgManifestEngine.ts, computeSHA256(), mfgManifestEngine.test.ts] | lang=en
- "board_boardgeometry_autoplacecomponents": "autoPlaceComponents()" | kind=code-symbol | source=src/components/board/boardGeometry.ts:L416 | neighbors=[BoardDesigner.tsx, boardGeometry.ts, getOutlineBounds()] | lang=en
- "board_boardgeometry_getnearestpad": "getNearestPad()" | kind=code-symbol | source=src/components/board/boardGeometry.ts:L120 | neighbors=[BoardCanvas.tsx, boardGeometry.ts, pcbRoutingEngine.ts] | lang=en
- "board_boardgeometry_inferpadnetassignments": "inferPadNetAssignments()" | kind=code-symbol | source=src/components/board/boardGeometry.ts:L525 | neighbors=[BoardDesigner.tsx, boardGeometry.ts, .find()] | lang=en
- "board_boardgeometry_unionfind_union": ".union()" | kind=code-symbol | source=src/components/board/boardGeometry.ts:L157 | neighbors=[getNetRatsnestLines(), UnionFind, .find()] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@0af0a13ac4ad0ab497b8a77156474efca460f30f": "0af0a13 ci: remove final legacy branding remnants" | kind=Commit | source=git | neighbors=[master, 67b9aff fix(brand): restore original lo…, b51d44c ci: expose exact remaining lega…] | lang=pt
- "commit:repo:github.com/Ankit6149/hardware-studio@0fd33e9876d58510cfc7dabeb9354b6d25d01dfc": "0fd33e9 ci: expose brand correction diagnostics" | kind=Commit | source=git | neighbors=[master, f79020a ci: capture visual correction d…, eed3ee3 ci: run verified brand and scal…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@0fe0d5b8f1f11cce7f9b38802558b37b69a1ea3a": "0fe0d5b docs: start visual representation system" | kind=Commit | source=git | neighbors=[master, ccad2f1 revert: remove accidental visua…, 1d1ba8d Build connected device knowledg…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@10b7170d5c9ba3ab8c046d9eaeb574f9888e3190": "10b7170 chore: apply unified logo favicon and landing scale fix" | kind=Commit | source=git | neighbors=[master, eed3ee3 ci: run verified brand and scal…, 174879d fix(ui): restore component typo…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@174879d77457304b577bfc7cc9a2e8d768ad8fe3": "174879d fix(ui): restore component typography scale" | kind=Commit | source=git | neighbors=[master, 10b7170 chore: apply unified logo favic…, c9e9d0c fix(ci): repair dependency lock…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@1b950962f903f6447dd93dcb69594be548792cd3": "1b95096 docs: add product recovery issue dependency map" | kind=Commit | source=git | neighbors=[master, f686a93 docs: start professional hardwa…, ffccd5f docs: add authoritative product…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@1e20e279aae7edef7c06131bfa9e1e5c8d22589c": "1e20e27 docs: add architecture-first product roadmap" | kind=Commit | source=git | neighbors=[master, 4bda572 docs: define safety boundaries …, 594db9c docs: publish honest current de…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@1e86240f57bb0001a445dea37bdb6fa3564f55ca": "1e86240 chore(ci): remove temporary visual verification workflow" | kind=Commit | source=git | neighbors=[master, 25e9667 chore(ci): add temporary source…, 67b9aff fix(brand): restore original lo…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@25e966737fa2ed9c8a9e3ee25417e7d0b75c1f8b": "25e9667 chore(ci): add temporary source audit snapshot" | kind=Commit | source=git | neighbors=[1e86240 chore(ci): remove temporary vis…, master, a70a958 chore(ci): remove temporary sou…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@2c82cdc691ce923fd2088bc61880e8325b9fe85d": "2c82cdc docs: replace README with honest product overview" | kind=Commit | source=git | neighbors=[master, b4c6028 docs: add complete Hardware Stu…, dded91e seo(site): add honest product m…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@2d25baf9a04d2d0bf553c4344e1291ae6ae254ed": "2d25baf ci: add one-time hash-checked UX payload repair" | kind=Commit | source=git | neighbors=[master, 9c94b0d ci: capture complete UX batch l…, 98ba04a ci: capture raw UX payload for …] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@2ddcb2da51f1e72d90acab88f86687a517621567": "2ddcb2d ci: normalize transport line endings before UX payload verification" | kind=Commit | source=git | neighbors=[master, a7bca39 ci: repair one-byte transport c…, 92e04ee ci: validate UX payload chunks …] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@334b67f0f1693031b4f90938dd56643aae25d5a0": "334b67f docs: document Hardware Studio system architecture" | kind=Commit | source=git | neighbors=[master, 594db9c docs: publish honest current de…, b4c6028 docs: add complete Hardware Stu…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@3db6173d34748aec441a92bbfa9b55927f1ccead": "3db6173 ci: verify first UX foundations batch" | kind=Commit | source=git | neighbors=[master, 92e04ee ci: validate UX payload chunks …, e17a249 fix(brand): use original hardwa…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@4bda5729f28ce8afa2314894ab14a614df03093b": "4bda572 docs: define safety boundaries and engineering limitations" | kind=Commit | source=git | neighbors=[1e20e27 docs: add architecture-first pr…, master, ca77dd0 docs: add engineering contribut…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@52be84b1506c5ae5c8c0cf48b73e55b84b7da94c": "52be84b Update README.md" | kind=Commit | source=git | neighbors=[master, 0a874a4 feat(brand): add reusable Hardw…, ca77dd0 docs: add engineering contribut…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@55109ec0428db12bc31d54470b4cb7540ee2d200": "55109ec feat(brand): publish reusable repository mark" | kind=Commit | source=git | neighbors=[master, 5cd6df7 fix(brand): remove legacy brand…, 5a2debf feat(brand): add Hardware Studi…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@594db9c089331cfb19944650d84db8fa1eb4909f": "594db9c docs: publish honest current development status" | kind=Commit | source=git | neighbors=[334b67f docs: document Hardware Studio …, master, 1e20e27 docs: add architecture-first pr…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@59e0d22709a168cfacb9883913525c34cf02bb4f": "59e0d22 audit: reset unsupported V1 pass claims" | kind=Commit | source=git | neighbors=[master, 84415a2 fix(v1): complete truthful prod…, 6c063dc chore: final verification pass,…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@5a2debf746f9a45f61db905d5eacfdf281cf75cf": "5a2debf feat(brand): add Hardware Studio favicon" | kind=Commit | source=git | neighbors=[0a874a4 feat(brand): add reusable Hardw…, master, 55109ec feat(brand): publish reusable r…] | lang=pt
- "commit:repo:github.com/Ankit6149/hardware-studio@775cd9f0b9ef0ee550da3396b4eda3d117b0bdb6": "775cd9f style(site): support scrolling landing page and preserve studio canvas" | kind=Commit | source=git | neighbors=[523a787 feat(site): move development wo…, master, dded91e seo(site): add honest product m…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@7e58361f0e2cb3248458bf856aa12c3fcf94e9cf": "7e58361 chore(repo): add project description website and keywords" | kind=Commit | source=git | neighbors=[master, c9e9d0c fix(ci): repair dependency lock…, d2d8fac chore(brand): remove legacy fav…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@87befaa1ff03b3a70f933409b54afd6f3d58e34f": "87befaa revert: remove accidental placeholder file" | kind=Commit | source=git | neighbors=[master, 1d1ba8d Build connected device knowledg…, e74ed91 placeholder] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@927989cfeb5853a0ed626745df3aa51bbbc20a7e": "927989c audit: replace false V1 signoff with execution ledger" | kind=Commit | source=git | neighbors=[master, 6939a13 fix: preserve every V1 domain t…, efd5072 docs: complete V1 completion au…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@92e04eea54efed6d342a583bb1afd3b98e01ca05": "92e04ee ci: validate UX payload chunks before reconstruction" | kind=Commit | source=git | neighbors=[3db6173 ci: verify first UX foundations…, master, 2ddcb2d ci: normalize transport line en…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@93eeb1baa3f6cddb0fa9090578a53c04d2eabe92": "93eeb1b ci: normalize remaining legacy identifiers" | kind=Commit | source=git | neighbors=[master, b51d44c ci: expose exact remaining lega…, f79020a ci: capture visual correction d…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@98ba04ae23b0076bab9023517adcf47a0399dd11": "98ba04a ci: capture raw UX payload for deterministic diagnosis" | kind=Commit | source=git | neighbors=[master, 2d25baf ci: add one-time hash-checked U…, a7bca39 ci: repair one-byte transport c…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@9c94b0d94c75a0e7319a648ebb4a7c50eb556024": "9c94b0d ci: capture complete UX batch lint diagnostics" | kind=Commit | source=git | neighbors=[2d25baf ci: add one-time hash-checked U…, master, ffa0c86 ci: persist UX lint diagnostics…] | lang=en
- "commit:repo:github.com/Ankit6149/hardware-studio@a70a958a2b560dcc2609fb4b61e9e114e0390fcb": "a70a958 chore(ci): remove temporary source audit snapshot" | kind=Commit | source=git | neighbors=[25e9667 chore(ci): add temporary source…, master, ffccd5f docs: add authoritative product…] | lang=pt
- "commit:repo:github.com/Ankit6149/hardware-studio@a7bca39976e387da306d85d489b2d3c82627e0a9": "a7bca39 ci: repair one-byte transport corruption by verified hash" | kind=Commit | source=git | neighbors=[2ddcb2d ci: normalize transport line en…, master, 98ba04a ci: capture raw UX payload for …] | lang=en

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: C:\Users\ANKIT BHARDWAJ\Desktop\hardware studio\.graphify\description-instructions\batch-010.json

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
