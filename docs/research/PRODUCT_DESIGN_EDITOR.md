# Product Design editor research and product decisions

Status: active implementation research for issue #67.
Date: 2026-08-04.

## Purpose

Hardware Studio needs a useful early product-design workbench, not another architecture dashboard and not a false mechanical CAD claim. This research identifies patterns worth adopting from mature open-source tools and deliberately reduces them into a beginner-readable workflow.

The first Product Design journey is:

`Document → layers → objects → dimensions/notes → concept part → lightweight 3D → checkpoint → reload/export`

## Penpot

Official sources:

- https://github.com/penpot/penpot
- https://help.penpot.app/technical-guide/developer/architecture/
- https://help.penpot.app/user-guide/first-steps/the-interface/
- https://help.penpot.app/user-guide/design-systems/components/
- https://help.penpot.app/user-guide/export-import/penpot-file-format/

License: Mozilla Public License 2.0.

Patterns adopted:

- one workspace with a viewport, layers, properties, history and visible file status;
- reusable definition/instance thinking rather than copied names;
- explicit separation between structured design data and binary media assets;
- document export with a manifest/version and referenced objects;
- contextual properties instead of one universal form.

Patterns intentionally not copied:

- the complete design-system, prototyping, inspect and collaboration surface;
- Penpot source code or internal Clojure/ClojureScript architecture;
- UI density intended for expert interface designers.

Hardware Studio simplification:

- Product Design begins with layers and common concept objects;
- advanced libraries and variants do not appear until reusable concept definitions exist;
- engineering authority is shown directly in the inspector.

## Excalidraw

Official source:

- https://github.com/excalidraw/excalidraw

License: MIT for the open-source editor repository; verify each bundled asset separately before reuse.

Patterns adopted:

- approachable direct manipulation;
- clear select/draw/pan modes;
- useful keyboard shortcuts;
- low-friction object creation;
- exportable document state;
- beginner-friendly empty canvas behavior.

Patterns intentionally not copied:

- hand-drawn visual identity as the default engineering language;
- collaboration implementation;
- application source code or bundled assets.

Hardware Studio simplification:

- direct manipulation remains simple, but object dimensions, units, materials and authority are first-class;
- visual playfulness cannot obscure whether geometry is provisional.

## Konva and layered canvas architecture

Official sources:

- https://konvajs.org/docs/overview.html
- https://konvajs.org/docs/performance/All_Performance_Tips.html

License: MIT.

Patterns adopted:

- explicit stage/layer/group/shape hierarchy;
- keep rendering layers few;
- avoid event listeners on non-interactive content;
- isolate high-frequency drag rendering from persisted commands;
- render only changed content.

Implementation decision:

The first slice uses a dependency-free SVG editor because the repository does not currently include Konva and adding a new canvas runtime plus lockfile churn would delay the usable vertical slice. The domain and command model are renderer-independent. Konva remains a valid later renderer if SVG performance measurements show a real need.

## FreeCAD Sketcher and Part Design

Official sources:

- https://github.com/FreeCAD/FreeCAD-documentation/blob/main/wiki/Sketcher_Workbench.md
- https://github.com/FreeCAD/FreeCAD-documentation/blob/main/wiki/PartDesign_Workbench.md
- https://www.freecad.org/features.php

License: FreeCAD is LGPL-2.1-or-later; documentation licensing must be checked separately before reuse.

Patterns adopted:

- separate a 2D sketch/concept from later solid features;
- keep simple sketches manageable rather than creating one giant sketch;
- distinguish snapping from actual geometric constraints;
- expose dimensions and degrees of authority clearly;
- later exact mechanical work should consume product concepts rather than silently replacing their identity.

Patterns intentionally not copied:

- full constraint solving;
- feature-history CAD;
- exact B-Rep/STEP authority;
- desktop workbench complexity.

Hardware Studio simplification:

- Product Design dimensions document intent but do not claim a solved parametric sketch;
- concept parts contain explicit width, height and depth for derived lightweight 3D;
- exact CAD is a later Mechanical responsibility.

## Persistence research

Official sources:

- https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
- https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase/transaction
- https://pglite.dev/docs/
- https://pglite.dev/docs/filesystems
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/storage/security/access-control

### Decision: native IndexedDB for the first production slice

Reasons:

- no new runtime dependency or large WebAssembly database bundle;
- transactional object stores are sufficient for documents, assets and named checkpoints;
- binary `Blob` assets can be stored directly;
- the editor remains usable offline without credentials;
- repository interfaces keep a later PGlite/PostgreSQL implementation possible.

PGlite remains a strong later option when Hardware Studio needs local PostgreSQL query compatibility across multiple mature domains. It is not required to prove the first Product Design product journey.

### Cloud boundary

Supabase remains the intended authenticated cloud target because PostgreSQL rows and Storage assets can be protected with row-level security. Cloud sync is not claimed in issue #67 until a real environment, policies and failure handling are verified.

## Canonical product model

Persisted:

- Product Design documents;
- layers;
- design objects;
- reference assets;
- concept-part properties;
- named checkpoints;
- document schema version and timestamps.

Session-only:

- active tool;
- hover state;
- current selection;
- marquee rectangle;
- drag/resize preview;
- pan and zoom;
- open panel state;
- temporary asset object URLs.

Derived:

- selection bounds;
- visible ordered objects;
- SVG rendering nodes;
- lightweight 3D meshes;
- missing-asset findings;
- save-status labels.

## Simplicity rules

1. A user sees no more than the tools needed for the current task.
2. The layer tree controls organisation; the inspector controls selected-object properties.
3. Drawing creates a real object immediately; pointer movement is transient and one command is committed on completion.
4. Dimensions are labelled `intent` until an exact Mechanical model owns them.
5. A concept part is created from selected design objects and keeps one stable ID in 2D and 3D.
6. Advanced operations are available through contextual controls rather than permanent toolbars.
7. Save, error and checkpoint state remain visible.
8. No native browser alert, confirm or prompt is used.
9. The editor must remain useful without sign-in.
10. The product map remains visible so Product Design never becomes another isolated application.

## Performance rules

- keep the SVG DOM proportional to visible objects;
- do not persist pointer-move frames;
- one logical drag/resize becomes one undoable command;
- use a single SVG grid definition;
- lazy-mount Three.js only when 3D preview opens;
- render Three.js on interaction and scene changes, not through a permanent loop;
- revoke object URLs and dispose WebGL resources;
- keep reference-image files in the asset store rather than base64 inside document JSON.

## Trust boundary

Product Design is authoritative for:

- product intent;
- visual arrangement;
- concept dimensions and annotations;
- reference provenance;
- concept-part identity;
- appearance intent.

Product Design is not authoritative for:

- exact manufacturable geometry;
- tolerance stacks;
- interference clearance;
- mass properties;
- STEP/B-Rep output;
- tooling or fabrication release.

Those claims require later Mechanical/CAD qualification.