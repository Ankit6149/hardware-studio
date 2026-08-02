# Adaptive workflows and capability-based navigation

Status: implementation decision for issue #59.

## Product problem

Hardware Studio spans product intent, mechanical design, electronics, PCB, firmware, validation, and release outputs. Showing every workbench to every user makes the product appear comprehensive but makes ordinary tasks harder to understand.

The product must therefore support both:

- **connected work**, where multiple domains share one project graph; and
- **standalone work**, where a user can focus on one domain without being forced through unrelated upstream or downstream modules.

Progressive disclosure changes what the shell shows. It does not delete engineering records or create a second project model.

## Research patterns

### KiCad

KiCad intentionally connects schematic and PCB editors while still allowing standalone editor workflows. The PCB editor can maintain board-local nets in standalone use, while richer synchronization comes from the associated schematic.

Sources:

- https://docs.kicad.org/9.0/en/eeschema/eeschema.html
- https://docs.kicad.org/10.0/en/pcbnew/pcbnew.pdf

Hardware Studio decision: Electronics and PCB can be enabled independently. When PCB is shown without Electronics, the product must state that schematic synchronization and component-definition context are unavailable rather than blocking the user.

### Autodesk Fusion

Fusion groups capabilities into purpose-driven workspaces. The active workspace controls the commands and data most relevant to the current task.

Source:

- https://help.autodesk.com/view/NINVFUS/ENU/?guid=GS-WORKSPACES

Hardware Studio decision: workflow profiles are task-oriented starting points, not permanent product editions. Every non-overview domain remains independently configurable.

### Blender

Blender workspaces are task-oriented arrangements of editors. They reduce visible complexity without creating separate copies of the underlying scene.

Source:

- https://docs.blender.org/manual/en/4.2/interface/window_system/workspaces.html

Hardware Studio decision: workflow preferences affect navigation and guidance only. Canonical project engineering data remains shared and unchanged.

### Onshape

Onshape documents can hold multiple linked artifact types as tabs, and larger or reusable areas can be split into linked documents for performance and ownership.

Sources:

- https://cad.onshape.com/help/Content/Document/documents.htm
- https://cad.onshape.com/help/Content/Document/linking_documents.htm

Hardware Studio decision: keep one connected local project graph now, while preserving the architectural option to split large domain data behind stable references later. The adaptive shell must not require that split.

## Implemented workflow model

The shell supports these profiles:

- Complete Product
- Electronics + PCB
- Mechanical + Assembly
- Firmware + Device
- Validation + Handoff
- Custom

Profiles select initial capabilities. They do not lock the user. Product, Mechanical, Electronics, PCB, Firmware, Validation, and Outputs can each be shown or hidden independently. Overview is always available.

## Persistence boundary

Workflow preferences are stored under a dedicated local-storage key:

`hardware-studio:workflow-preferences:v1`

They are not included in canonical project serialization and do not call project-store mutation actions. Hiding a domain therefore cannot remove its requirements, geometry, components, nets, firmware, tests, revisions, or output records.

Malformed or unknown preference data normalizes to safe values. Unknown domain IDs are discarded. If storage is blocked, preferences remain usable in memory.

## Active-view safety

If a user hides the domain containing the currently open workbench:

- the workbench stays open;
- the domain remains temporarily visible in navigation;
- a banner explains that it is hidden from the configured workflow;
- the user can show the domain again or leave the workbench;
- no silent redirect occurs.

## Guided home

The previous dashboard assumed one universal linear pipeline and exposed generation or repair actions that could mutate the project before the user understood the design.

The guided home instead shows:

- selected workflow;
- visible and hidden domains;
- current canonical project-data counts;
- connected versus standalone limitations;
- one next action per visible domain;
- evidence explaining why each action is suggested;
- a direct route to workflow configuration.

Actions are derived from existing project data. No fake completion percentage is used as primary guidance, and showing a domain does not imply its work is complete.

## Lightweight 3D versus CAD kernel

Workflow configuration and lightweight visualization are separate concerns.

The lightweight Three.js representation introduced by issue #61 is:

- visualization-only;
- lazy-loaded;
- event-driven;
- capped by a quality profile;
- non-authoritative for dimensions, interference, mass, manufacturing, or release.

The future CAD kernel in issue #17 remains responsible for exact solids, STEP/B-Rep processing, dimensional authority, interference, manufacturing geometry, and qualified exports.

Adaptive workflows can hide or show Mechanical and 3D entry points, but they do not change this trust boundary.

## Non-goals

This implementation does not:

- create separate product editions;
- delete data for hidden domains;
- force domain dependencies;
- claim parity with KiCad, Fusion, Blender, or Onshape;
- turn Three.js previews into CAD;
- replace the canonical product graph;
- complete the broader shell redesign in issue #9.
