# Hardware Studio Roadmap

## Roadmap principle

Hardware Studio should not expand through more disconnected panels. It should deepen a small number of complete vertical workflows over one canonical product graph.

Every phase must connect:

```text
Domain model
→ engineering engine
→ command layer
→ production UI
→ persistence
→ undo/redo
→ cross-domain effects
→ tests
→ CI
```

## Phase 0 — Truthful public foundation

### Goal

Make the repository understandable without overstating readiness.

### Work

- public landing page
- development workspace at `/studio`
- complete README
- product vision
- architecture overview
- current-status document
- safety and limitations
- contribution rules
- evidence-based execution ledger

### Exit criteria

Visitors can understand:

- what Hardware Studio is trying to become
- what exists today
- what remains incomplete
- why current output is not fabrication-ready

## Phase 1 — Durable product graph

### Goal

Create one reliable project document for every workbench and process.

### Work

- explicit schema versioning
- deterministic serializer and deserializer
- complete domain persistence
- migration system
- integrity validation
- shared Node-compatible local repository
- browser and MCP access to the same active project
- project switching and reload tests

### Exit criteria

A complete project can be exported, reset, imported, switched, reloaded, and opened by MCP without losing any domain.

## Phase 2 — Reversible engineering commands

### Goal

Make every meaningful edit explicit and undoable.

### Work

- typed command registry
- pointer transaction controller
- exact before/after state
- one history record per interaction
- cancellation
- domain validation before commit
- affected-object tracking
- derived-output staleness
- command audit log

### Workbenches to connect

- product architecture
- mechanical canvas
- schematic canvas
- PCB canvas
- firmware state machine

### Exit criteria

Every supported interaction restores exact original state on undo and exact final state on redo.

## Phase 3 — Product and systems traceability

### Goal

Make product intent the root of downstream engineering state.

### Work

- requirement hierarchy
- interfaces and constraints
- architecture connections
- decision records
- risks
- requirement-to-component links
- requirement-to-test links
- impact analysis
- coverage dashboard

### Exit criteria

A requirement can be traced through architecture, implementation, validation, and release.

## Phase 4 — Electronics and schematic foundation

### Goal

Build a structurally correct electrical graph.

### Work

- reusable component definitions
- symbols and electrical pin types
- structured wire anchors
- junctions
- labels
- no-connect markers
- net creation and deletion
- symbol rotation and movement
- ERC
- component replacement impact

### Exit criteria

Connectivity survives symbol movement, rotation, export/import, deletion, and component replacement.

## Phase 5 — PCB V1 engine

### Goal

Build a truthful board editor foundation before advanced routing features.

### Work

- strict active-board isolation
- canonical board outlines and stack
- footprints and pads
- placements
- structured trace anchors
- route sessions
- vias and layer transitions
- connectivity graph
- ratsnest derived from graph
- DRC
- keepouts and zones
- selected-board exports

### Exit criteria

A net is marked routed only when all assigned pads belong to one connected graph. No board-specific object leaks into another board or its output package.

## Phase 6 — Mechanical 2D and 3D V1

### Goal

Provide a dependable layout and enclosure-coordination system without falsely presenting it as a mature CAD kernel.

### Work

- rectangles, circles, ellipses, polygons, lines, and arcs
- vertex editing
- transforms and grouping
- persisted dimensions
- lightweight persistent constraints
- board and battery zones
- enclosure bodies
- package dimensions
- board-derived 3D bodies
- collision and clearance calculations
- missing-geometry blockers

### Exit criteria

The UI never guesses authoritative engineering geometry. Missing dimensions produce blockers rather than successful checks.

## Phase 7 — Firmware workspace and local bridge

### Goal

Connect firmware state to real local build and device workflows safely.

### Work

- source tree
- editor and dirty state
- generated-file diffs
- PlatformIO configuration
- hardware mappings
- builds and artifacts
- port discovery
- upload
- serial monitor
- operation registry
- cancellation
- durable logs
- scoped approvals

### Exit criteria

The bridge never simulates success. Every operation has a real process result and a durable project record.

## Phase 8 — Validation system

### Goal

Make evidence and retest history first-class product state.

### Work

- test definitions
- step execution
- operators and environments
- numeric and boolean measurements
- units and tolerances
- evidence
- reviewer decisions
- immutable runs
- retests
- run comparison
- critical release blockers

### Exit criteria

Unsupported tests never auto-pass, old runs cannot be overwritten, and failed critical validation blocks release.

## Phase 9 — Revisions, branches, and releases

### Goal

Create safe hardware versioning over complete product state.

### Work

- named revisions
- branch snapshots
- branch switching
- revision comparison
- restore
- domain-aware merge
- conflict resolution
- release candidates
- approvals
- immutable release snapshots
- working branch from release

### Exit criteria

Switching branches restores complete state. Released snapshots remain immutable while development continues on new working branches.

## Phase 10 — MCP live engineering control

### Goal

Allow approved AI clients to inspect and operate the real project through semantic commands.

### Work

- shared durable repository
- complete resource handlers
- aligned tool registry
- read tools
- draft tools
- typed apply tools
- undo
- high-impact approvals
- persistent proposals
- audit records
- protocol-level tests

### Exit criteria

A real MCP client can read the active project, draft a change without mutation, apply the change through the command layer, observe it in the UI, undo it, and inspect the audit record.

## Phase 11 — Blueprints and manufacturing drafts

### Goal

Generate deterministic, selected-board, live-data outputs with explicit trust boundaries.

### Work

- blueprint dependency tracking
- selected-board copper layers
- outline
- drills
- masks
- silkscreen
- paste
- BOM
- CPL
- netlist
- firmware package
- validation report
- release manifest
- real checksums
- independent-review labels

### Exit criteria

Outputs contain only live canonical data for the selected product and board, with no guessed coordinates or cross-board leakage.

## Phase 12 — Collaboration and lifecycle

### Goal

Add optional team workflows after the local product model is dependable.

### Possible work

- optional synchronization
- access control
- review requests
- comments
- supplier integrations
- component lifecycle data
- change notifications
- release distribution

This phase should not compromise local ownership or require a cloud account for basic use.

## Long-term research directions

- parametric geometry kernel integration
- external Fusion and Onshape adapters
- KiCad IPC adapter
- supplier-data graph
- simulation adapters
- device-fleet workflows
- hardware-in-the-loop validation
- AI-assisted impact analysis
- engineering knowledge and reusable subsystem templates

## What is deliberately not promised

The roadmap does not promise that Hardware Studio will quickly replace mature CAD, EDA, PLM, firmware, or manufacturing systems.

The immediate priority is a truthful, connected engineering foundation with deep vertical workflows—not a large collection of superficial features.
