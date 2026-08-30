# Hardware Studio Studio UX Convergence Execution Plan

**Status:** subordinate implementation plan to `docs/development/PRODUCT_RECOVERY_EXECUTION_PLAN.md`  
**Decision date:** 2026-08-30  
**Applies to:** Studio shell, information architecture, workbench composition, progressive disclosure, cross-domain navigation, and UX migration order.  
**Does not override:** canonical-domain, repository, command, migration, validation, release, or truthfulness requirements in the parent recovery plan.

---

## 1. Why this plan exists

Hardware Studio is materially cleaner than the earlier prototype, but direct use of the current Studio still shows a structural problem: the product exposes too much of its internal taxonomy to the user.

The current application still asks a user to understand a hierarchy similar to:

`Hardware Studio -> domain -> workbench -> supporting tool -> selected object`

before the user can complete an engineering job.

The current two-level rail/sub-navigation model was a valid convergence step away from the original long sidebar, but it is not the final architecture. Production feedback now shows its ceiling: there are still too many persistent destinations, too much explanatory chrome, and too many equally weighted concepts competing for attention.

The goal of the next UX phase is therefore not to redesign colors or add more navigation. The goal is to make the application feel like **one product with multiple connected representations of the same hardware**, using progressive disclosure and contextual tools.

The target mental model is:

> I am building one product. Requirements, schematic, PCB, 3D, firmware, validation, and release are connected views of that product.

Not:

> I am navigating a collection of independent engineering applications.

---

## 2. Benchmark conclusions

This plan is informed by current professional-tool patterns, without copying any one product visually.

### Flux

Official source: https://docs.flux.ai/Introduction/new-workspace-transition

Flux shipped its largest workspace redesign on 2026-08-17. The useful principle is not its visual styling; it is the decision to stop showing everything simultaneously.

Relevant patterns:

- major design views such as Schematic, Layout, Files, Preview/3D, Components, BOM, and Nets are presented as workspace tabs;
- project utilities such as layers, rules, objects, and manufacturing are placed in a collapsible project drawer;
- properties of the selected object live in one contextual Inspector;
- the workspace surfaces what is relevant to the current task and tucks away the rest.

**Hardware Studio lesson:** persistent global navigation should describe product-level context; editor-specific utilities belong inside the active workbench.

### KiCad

Official source: https://docs.kicad.org/9.0/en/eeschema/eeschema.html

Relevant patterns:

- a large central editing canvas is the primary work surface;
- hierarchy/navigation is contextual to the schematic editor rather than a global product destination;
- object properties are invoked from selection/context;
- editor tools surround the work surface without becoming separate application-level pages.

**Hardware Studio lesson:** PCB rules, layers, nets, DRC, board setup, hierarchy, and related utilities should be panels/tools in the relevant editor, not first-class global destinations.

### Altium Designer

Official source: https://www.altium.com/documentation/altium-designer/sch-pcb/navigator-panel

Relevant patterns:

- active-editor panels change with engineering context;
- the Navigator supports cross-probing between schematic and PCB objects;
- object identity and navigation are more important than maintaining independent copies of the same object.

**Hardware Studio lesson:** cross-workbench object identity and cross-probing are a core product capability. The Inspector should change representation while preserving selected canonical identity.

### Autodesk Fusion Electronics

Official sources:

- https://help.autodesk.com/view/fusion360/ENU/?contextId=LP-READ-P13N-SNP-GS-ECD-CRD-6
- https://help.autodesk.com/view/fusion360/ENU/?guid=ECAD-NAV-DOCUMENTS

Relevant patterns:

- one umbrella Electronics Design keeps Schematic, 2D PCB, and 3D PCB linked;
- these views appear as linked document tabs rather than unrelated top-level applications;
- switching between documents preserves design context and synchronization.

**Hardware Studio lesson:** Electronics should behave as one connected product area with linked documents/views rather than Components -> Schematic -> Board Setup -> PCB -> Rules -> DRC as separate application destinations.

### Onshape

Official source: https://cad.onshape.com/help/Content/Home/user_interface_basics.htm

Relevant patterns:

- document-level context remains stable;
- toolbars change according to current workflow such as Part Studio, Sketch, Assembly, or Drawing;
- feature/document trees and contextual controls live next to the active work surface.

**Hardware Studio lesson:** Mechanical should expose context-specific commands and a feature/assembly tree rather than every mechanical capability as global navigation.

### PlatformIO

Official source: https://docs.platformio.org/en/latest/integration/ide/vscode.html

Relevant patterns:

- source files, project tasks, build/upload/monitor actions, problems, and terminal output are separate but connected regions;
- execution output belongs in terminal/panel regions rather than inside the source editor itself.

**Hardware Studio lesson:** Firmware needs files/editor/context plus a bottom Build/Upload/Serial/Problems region. Build and device execution should not be represented as another global page.

### NI TestStand

Official source: https://www.ni.com/en/support/documentation/supplemental/06/guide-to-effective-test-software-development-with-teststand.html

Relevant patterns:

- authoring a test procedure and executing/debugging a test are distinct interaction modes;
- execution has its own context, progress, variables, reports, and state.

**Hardware Studio lesson:** Validation must distinguish test definition, execution, and evidence/review rather than blending them into one large form.

---

## 3. Core UX principles

### 3.1 One product, many representations

A component, requirement, net, board, feature, firmware module, validation test, or release object should keep one canonical identity while its representation changes by workbench.

Example component identity:

`Component definition -> project instance -> schematic symbol/pins -> PCB footprint/pads -> BOM line -> package/3D -> firmware mapping -> validation evidence`

The UI must never make these feel like unrelated copied records.

### 3.2 Progressive disclosure

Do not show every capability permanently.

- global shell shows global context;
- document/workbench tabs show active engineering views;
- left drawer shows objects/tools relevant to the active workbench;
- right Inspector shows properties/actions relevant to current selection;
- bottom dock shows diagnostics, execution, evidence, and asynchronous work;
- advanced options appear when the user opens the relevant tool or selects the relevant object.

### 3.3 Context before taxonomy

Users should see what they need for the current job, not an inventory of everything Hardware Studio knows how to do.

### 3.4 One universal workbench grammar

Every major editor should use the same high-level anatomy:

1. global project bar;
2. open workbench/document tabs;
3. contextual left drawer;
4. central work surface;
5. contextual Inspector;
6. bottom diagnostics/jobs/evidence dock;
7. thin status bar.

Domain-specific editors can differ internally, but the surrounding grammar should remain predictable.

### 3.5 Guidance should be contextual, not permanent chrome

Long explanatory sentences, consequences, tutorials, and workflow education belong in:

- Project Home;
- first-use onboarding;
- empty states;
- tooltips/help;
- an optional Learn surface;
- a compact Next Action / Blocker summary.

They should not permanently consume editor space once the user is actively working.

### 3.6 Recommendations, not artificial locks

Hardware Studio should recommend the next meaningful action based on project state, but experienced users must be able to open any valid workbench directly.

### 3.7 Truthfulness remains part of UX

- approximate geometry is visibly approximate;
- unresolved data stays unresolved;
- failed checks cannot be overridden by unrelated UI state;
- draft output cannot look released;
- missing evidence cannot be hidden by friendly wording.

---

## 4. Target Studio anatomy

```text
+--------------------------------------------------------------------------+
| Hardware Studio | Project | Workspace/Version | Search | Save | Undo ... |
+--------------------------------------------------------------------------+
| Requirements | Architecture | Schematic | PCB | 3D | Firmware | ...     |
+----------------+--------------------------------------+------------------+
|                |                                      |                  |
| PROJECT DRAWER |                                      | INSPECTOR        |
|                |            ACTIVE EDITOR             |                  |
| objects/tree   |                                      | selection        |
| library        |                                      | properties       |
| layers/rules   |                                      | links/actions    |
| files/etc.     |                                      |                  |
+----------------+--------------------------------------+------------------+
| Problems | DRC/ERC | Builds | Serial | Tests | Jobs | Logs              |
+--------------------------------------------------------------------------+
| Active board / sheet / body | unresolved count | coordinates / status  |
+--------------------------------------------------------------------------+
```

### 4.1 Global top bar

Only global context belongs here:

- Hardware Studio identity;
- current project;
- current editable workspace / immutable version when versioning exists;
- global search/command palette;
- save/storage/sync health;
- undo/redo;
- later: review/share/AI proposal state where applicable.

Do not put discipline-specific engineering tools in the global bar.

### 4.2 Workbench/document tabs

Primary work surfaces should behave as open connected documents/views:

- Requirements
- Architecture
- Schematic
- PCB
- Mechanical / 3D
- Firmware
- Validation
- Release

Additional views can be opened from the Project Drawer or command palette without becoming permanent global navigation.

Tabs are not merely a horizontal recreation of the old sidebar. They represent **open work surfaces in the current project**, similar to linked documents in professional design tools.

### 4.3 Left Project Drawer

The drawer changes with active workbench.

Examples:

#### Requirements
- Requirements
- Interfaces
- Risks
- Verification links

#### Architecture
- Functions
- Components/subsystems
- Interfaces
- Decisions

#### Schematic
- Sheets
- Objects
- Library
- Nets

#### PCB
- Objects
- Nets
- Layers
- Rules
- Stackup

#### Mechanical
- Sketch/feature tree
- Parts
- Assembly
- References

#### Firmware
- Files
- Modules
- Hardware map
- Tasks/environments

#### Validation
- Test definitions
- Runs
- Evidence
- Equipment/fixtures later

#### Release
- Readiness
- Versions
- Changes
- Outputs/package

The drawer must be collapsible and preserve layout as UI preference, not engineering project state.

### 4.4 Right Inspector

There should be one canonical Inspector primitive.

Its content is driven by:

- active workbench;
- selected canonical object;
- selected representation;
- qualification/trust state;
- current workspace/version permissions.

Selecting `U1` in schematic and switching to PCB should keep the same component identity selected while showing PCB-relevant properties.

### 4.5 Bottom dock

Use the bottom dock for diagnostics, execution, evidence, and asynchronous work:

- Problems
- ERC / DRC
- Build
- Upload/device operation
- Serial
- Validation execution/results
- Jobs
- Logs

The exact tabs are workbench-dependent; the shell owns the panel primitive and persistence behavior.

### 4.6 Status bar

Use a thin status bar for high-frequency low-level context:

- active board/sheet/body/environment;
- coordinates/units/zoom where relevant;
- selection count;
- unresolved/error count;
- read-only/version state;
- operation state where useful.

---

## 5. Project Home

Project Home has one job:

> Tell the user where the product is, what is blocked, and what the next meaningful engineering action is.

Target information:

- project name/workspace/version;
- one recommended next action;
- compact lifecycle progress;
- unresolved/blocking conditions;
- recent meaningful engineering changes;
- storage/recovery warnings when applicable.

Avoid:

- generic analytics dashboards;
- decorative KPI card walls;
- duplicate editor controls;
- broad enterprise project-management UI;
- long tutorials.

A healthy Home example:

```text
Environmental Monitor
Workspace: Main

Next action
Complete schematic connectivity
3 component pins remain unresolved.
[Open schematic]

Product state
Requirements       8 / 10
Architecture       Ready
Electronics        In progress
Mechanical         Not started
Firmware           Not started
Validation         Blocked
Release            Blocked

Needs attention
3 unconnected pins
2 components missing footprints
PCB outline not defined
1 requirement has no validation plan
```

---

## 6. Workbench contracts

### 6.1 Electronics reference implementation

Electronics is the first workbench family that must prove the new UX model.

Connected views:

`Components -> Schematic -> PCB -> BOM -> 3D representation`

However, Power, Pin Mapping, Board Setup, Rules, DRC, Layers, Nets, and manufacturing preview are **contextual tools/panels**, not global product destinations.

Required behavior:

- one selected component identity survives view switching;
- schematic and PCB cross-probe the same pins/nets/components;
- BOM refers to the same component instances;
- 3D/package state is inspectable without creating a second component model;
- missing footprint/package/model is explicitly unresolved;
- DRC/ERC findings navigate directly to affected objects;
- active board is explicit and never fabricated.

PCB target anatomy:

- left: objects / nets / layers / rules;
- center: board editor;
- right: selected footprint/trace/via/net inspector;
- bottom: DRC / unrouted / connectivity / jobs;
- contextual toolbar: select / route / via / zone / keepout / measure / etc.

### 6.2 Mechanical

Use a CAD-like contextual model:

- left: sketch/feature/assembly tree;
- center: 2D sketch or 3D viewport;
- right: selected geometry/feature/mate Inspector;
- bottom: constraints / regeneration / interference / problems;
- contextual toolbar changes between Sketch, Part, Assembly, Drawing.

Do not make sketch constraints, assembly, interference, dimensions, or drawing tools global navigation destinations.

### 6.3 Firmware

Target anatomy:

- left: files / modules / hardware map / environments/tasks;
- center: source editor or behavior/state view;
- right: selected file/module/hardware mapping Inspector;
- bottom: Problems / Build / Upload / Serial / Logs.

State machine and hardware mapping are alternate work surfaces/contextual views inside Firmware, not equal global product destinations.

### 6.4 Validation

Separate three jobs:

1. **Define** test specification/procedure;
2. **Execute** a specific run against a product/build/device/sample;
3. **Review** measurements/evidence/retest lineage.

Do not mix editable procedure authoring and immutable run evidence into one undifferentiated surface.

### 6.5 Release

Release is a product-level control surface, not another CAD editor.

Primary concepts:

- readiness;
- changes/versions;
- exact output artifacts;
- manufacturing/release package;
- review/approval;
- published release/supersession.

Supporting generation tools remain contextual.

---

## 7. Progressive disclosure policy

A new project may initially emphasize:

- Requirements
- Architecture
- Components

The application then recommends Schematic, PCB, Mechanical, Firmware, Validation, and Release as project evidence develops.

This is a recommendation system, not a hard lock.

Experienced users can open any supported workbench from tabs/drawer/search.

The UI should distinguish:

- available now;
- recommended next;
- blocked because required source data is absent;
- experimental/unsupported;
- read-only because the user is viewing a version/release.

---

## 8. Phase plan

The UI phases run in parallel with the engineering-foundation phases from the parent recovery plan. No UI phase may create a second canonical data model to make the interface easier to build.

### Phase U0 — Architecture lock and navigation freeze

**Goal:** stop further UI divergence before more implementation.

Actions:

- freeze creation of new permanent navigation destinations;
- freeze additional permanent workflow/stage rails;
- freeze new dashboard-card systems;
- freeze additional instructional banners in active editors;
- adopt this document as the detailed Studio UX direction under the recovery plan;
- revise issues #34, #43, #46, and #66 so their acceptance criteria no longer conflict;
- define canonical shell regions and shared terminology;
- define migration map from current domain rail/sub-navigation to workbench tabs + contextual drawer.

**Exit gate:** one documented shell model and one non-conflicting implementation backlog.

### Phase U1 — Shared Studio shell

**Goal:** implement the universal workbench grammar without rewriting every domain.

Build:

- global TopBar contract;
- open workbench/document tabs;
- collapsible Project Drawer primitive;
- central workbench host;
- contextual Inspector primitive;
- bottom diagnostics/jobs dock primitive;
- thin status bar;
- layout state as UI preference rather than canonical project mutation;
- loading/empty/unavailable/error/read-only states.

Existing workbenches mount inside the new shell during migration.

**Exit gate:** Requirements, Electronics, Mechanical, Firmware, Validation, and Release can mount inside one predictable shell without adding per-workbench shell forks.

### Phase U2 — Project Home

**Goal:** make the product understandable from the first screen.

Build:

- next meaningful action;
- lifecycle progress derived from real state;
- blockers/unresolved conditions;
- recent meaningful changes;
- storage/recovery state;
- direct links into the relevant workbench/object.

**Exit gate:** a first-time user can identify where the project is and what to do next without understanding Hardware Studio's internal architecture.

### Phase U3 — Electronics reference workbench

**Goal:** prove one connected multi-representation workflow end-to-end.

Build/converge:

- Components;
- Schematic;
- PCB;
- BOM;
- package/3D representation access;
- shared selection/cross-probe;
- contextual Power, Pin Map, Board Setup, Layers, Rules, DRC, Nets;
- one Inspector;
- bottom diagnostics dock integration.

**Exit gate:** a user can follow one component from definition to schematic to PCB to BOM to 3D/package context without losing identity or navigating disconnected mini-apps.

### Phase U4 — PCB editor depth

**Goal:** make PCB feel like a professional editor while the canonical PCB engine matures.

Focus:

- editor-specific drawer/tree;
- toolbar and routing modes;
- board context/status;
- object Inspector;
- DRC/unrouted/connectivity dock;
- cross-probe to schematic;
- selection and keyboard behavior;
- responsive laptop layout.

Engineering depth remains governed by PCB issue #15.

### Phase U5 — Mechanical

**Goal:** apply the same shell grammar to sketch/part/assembly/3D work.

Focus:

- feature/assembly tree;
- contextual toolbars;
- geometry Inspector;
- constraint/regeneration/interference dock;
- cross-probe to PCB/package objects.

Real CAD capability remains governed by #16/#17.

### Phase U6 — Firmware

**Goal:** provide a coherent embedded-development workspace.

Focus:

- filesystem/project tree when repository/bridge permits;
- source editor;
- behavior/state views;
- hardware-map context;
- build/upload/serial/problems dock;
- exact build/device evidence links.

Engineering implementation remains governed by #18.

### Phase U7 — Validation

**Goal:** separate authoring, execution, and evidence review clearly.

Focus:

- test definition view;
- run execution view;
- evidence/result/retest review;
- qualification/trust state;
- product/build/device/sample context.

Engineering implementation remains governed by #19.

### Phase U8 — Release

**Goal:** make release simple, reviewable, and controlled.

Focus:

- readiness;
- versions/changes;
- exact outputs/package;
- approval/release state;
- stale blockers;
- immutable artifact identity.

Engineering implementation remains governed by #20/#21.

### Phase U9 — Final visual/system polish

Only after the shell and workbench structures are proven:

- semantic design-system completion;
- spacing/typography tuning;
- consistent icons/control states;
- animations and transition refinement;
- resizable/saved layouts;
- accessibility;
- reduced motion;
- responsive laptop/tablet review modes;
- visual regression;
- performance budgets.

Do not use visual polish to hide structural problems.

---

## 9. Parallel engineering track

UI work must remain synchronized with the architecture recovery:

| UX track | Foundation dependency |
| --- | --- |
| Shell/context | #9, #34, #43, #42 |
| Identity/cross-probe | #36, #40 |
| Durable layout/project restore | #38 |
| Editor mutations/undo | #39 |
| Legacy route/data migration | #37 |
| Electronics | #13-#15, #66 |
| Mechanical | #16-#17 |
| Firmware | #18 |
| Validation | #19 |
| Release | #20-#21 |
| End-to-end proof | #10, #27 |

The shell may land before the repository/command refactor is complete, but it must not introduce a new project data model or persist UI layout as engineering state.

---

## 10. Issue reconciliation decisions

### #34 — Information architecture

Keep as the product/IA decision issue. Update its implementation direction to this shell model and use this document as the detailed execution reference.

### #43 — Professional application shell

Make #43 the primary implementation issue for the global shell regions, route/deep-link migration, contextual selection, error/read-only states, and panel primitives.

### #46 — Navigation

The old final target of a permanent domain rail + contextual sub-navigation is superseded by production feedback.

#46 should now implement:

- workbench/document tabs;
- contextual Project Drawer;
- migration from current rail/subnav;
- beginner-readable labels;
- keyboard navigation;
- compact laptop behavior;
- compatibility handling for old `activeView` IDs.

The current rail may remain temporarily during migration, but it is not the final architecture.

### #66 — Electronics unification

Keep cross-workbench identity, selection persistence, direct transitions, and shared grammar.

Remove the requirement for another permanent product-stage rail.

The final Electronics experience should use:

- workbench/document tabs;
- contextual drawer;
- Inspector;
- bottom diagnostics dock;
- shared canonical selection.

---

## 11. Freeze rules during convergence

Until U1/U3 are proven:

- no new permanent global navigation destination;
- no new permanent stage rail;
- no new workflow-profile system;
- no additional always-visible coach/tutorial layer;
- no new workbench-specific shell architecture;
- no duplicate Inspector/property system;
- no second problems/findings implementation;
- no new project dashboard card system;
- no major landing-page redesign;
- no feature should bypass canonical repository/command/domain plans for UX convenience.

---

## 12. PR convergence gate

Every Studio/UX PR must state:

### Replaces
What old UI path, chrome, navigation, or duplicate component becomes unnecessary?

### Canonical context
What project/workbench/object identity is authoritative?

### User job
What exact user task becomes easier or more coherent?

### Progressive disclosure
What information is hidden until it is relevant?

### Proof
As applicable:

- lint;
- typecheck;
- tests;
- production build;
- browser interaction test;
- supported laptop viewport review;
- keyboard/focus behavior;
- save/reload/context restore;
- exact-head deployment.

### Cleanup
What compatibility code can be deleted now or after a defined migration gate?

A PR that adds another layer without replacing anything should be treated as suspicious.

---

## 13. UX acceptance metrics

The redesign is not successful because it looks cleaner in a screenshot.

Minimum evidence should eventually show:

- a new user can identify the next meaningful project action from Home;
- a user can open Schematic/PCB/Mechanical/Firmware without learning internal route taxonomy;
- no global navigation requires knowledge of Power Budget, Pin Mapping, Board Setup, DRC, Factory QA, etc.;
- one component remains identifiable while cross-probing Schematic -> PCB -> BOM -> 3D;
- editor-specific tools are discoverable without permanently occupying global chrome;
- a 1366x768 laptop viewport remains usable at 100% browser zoom;
- Inspector/Drawer/Dock can collapse without losing project data;
- diagnostics navigate to affected objects;
- keyboard users can move among workbench tabs, drawer, editor, Inspector, and dock;
- unsupported/read-only/stale states are explicit;
- no UX convenience silently invents engineering data.

---

## 14. Five-gate product completion model

Do not measure recovery primarily by open issue count.

### Gate 1 — Foundation

Canonical schema, repository, commands, migrations, boundaries.

### Gate 2 — Shell

One understandable Studio with stable context and progressive disclosure.

### Gate 3 — Design

Requirements -> schematic -> PCB -> enclosure -> firmware works as one connected product.

### Gate 4 — Prove

Build -> validate -> evidence -> retest is truthful and durable.

### Gate 5 — Ship

Version -> outputs -> review -> release is controlled, reproducible, and immutable.

Issues exist to advance these gates. Closing issue count alone is not progress.

---

## 15. Immediate execution order

1. Complete Phase U0 backlog/document convergence.
2. Implement the U1 shell skeleton without rewriting domain engines.
3. Rebuild Project Home around next action/blockers.
4. Migrate Electronics into the new shell as the reference workbench.
5. In parallel continue #36 -> #37/#38/#39/#42 foundation convergence.
6. Deepen PCB once identity/repository/command contracts are stable enough.
7. Extend the same workbench grammar to Mechanical, Firmware, Validation, and Release.
8. Perform final visual/design-system polish only after the structural model is stable.

The operating principle for this phase is:

> **Convergence is progress. The user should see less structure while the product becomes more capable underneath.**
