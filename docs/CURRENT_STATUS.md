# Hardware Studio Current Status

**Last reviewed:** July 26, 2026  
**Engineering implementation baseline reviewed:** `84415a2354d2005567358cdb34cc405d655d8756`  
**Stage:** Research and active development  
**Stable release:** None

## Summary

Hardware Studio is an ambitious engineering prototype with several real foundations, but it is not a complete or professionally verified V1.

The repository should currently be evaluated as:

- a public product and architecture experiment
- an early multi-workbench engineering application
- a foundation for a connected product graph
- a place to develop real domain engines incrementally

It should not be evaluated as:

- production CAD or EDA software
- a fabrication-ready PCB tool
- a complete firmware IDE
- a stable manufacturing-release platform
- a finished MCP engineering system

## Status language

This document uses three labels.

### Foundation

A real production implementation exists, but the workflow is not complete enough for professional use.

### Partial

Some production behavior exists, but important parts are disconnected, approximated, simulated, or missing.

### Not ready

The user-facing workflow is absent or does not yet satisfy its engineering requirements.

## Domain status

| Domain | Status | Current reality |
|---|---|---|
| Public landing page | Foundation | Product vision, workbenches, architecture, and limitations are presented publicly. |
| Canonical project persistence | Foundation | Many product domains persist and round-trip, but the long-term shared durable repository is not complete. |
| Product requirements and architecture | Foundation | Requirements and architecture surfaces exist; full traceability and impact analysis remain incomplete. |
| Command and undo system | Partial | Mechanical drag uses transactions, but all canvases do not yet share a complete pointer-correct lifecycle. |
| Schematic connectivity | Foundation | Structured pin anchors exist; ERC and complete migration/cleanup behavior still require work. |
| PCB editor | Partial | Pad-aware route validation exists, but complete anchors, connectivity, DRC, and strict board isolation are unfinished. |
| Mechanical 2D | Partial | Basic objects, movement, resizing, and one-time alignment operations exist; polygon, dimension, and constraint workflows are incomplete. |
| WebGL 3D | Partial | A real Three.js view and collision foundation exist, but some geometry is still approximated or guessed. |
| Firmware workspace | Partial | Source-file and state-machine foundations exist; full configuration, build history, upload, and serial workflows remain incomplete. |
| Local PlatformIO bridge | Foundation | Real process spawning, tokens, and approval foundations exist; operation tracking, monitor, cancellation, and durable records are incomplete. |
| Validation | Partial | Validation definitions and runner foundations exist; full measurement, evidence, retest, history, and review UI are incomplete. |
| Revisions and releases | Partial | Snapshot and release helpers exist; real branch switching, merging, conflict UI, and complete immutable release behavior are unfinished. |
| MCP server | Partial | Official MCP SDK foundations exist; the stdio process does not yet operate on the complete live durable browser project. |
| Blueprints and exports | Partial | Multi-sheet and export foundations exist; complete live-data synchronization remains unfinished. |
| Manufacturing drafts | Partial | Draft generators and real SHA-256 exist; strict active-board isolation and fabrication-grade validity are not complete. |
| Readiness | Partial | Readiness calculations exist, but all engineering blockers are not yet represented. |
| CI | Partial | Application lint, typecheck, tests, and build are configured; dedicated MCP and bridge gates are missing. |

## Verified strengths

The repository contains meaningful work in these areas:

- a broad workbench shell
- local multi-project state
- canonical serialization foundations
- product architecture and requirement models
- structured schematic pin anchors
- initial PCB route validation
- mechanical pointer transactions
- a real Three.js viewport
- collision-checking foundations
- firmware source-file foundations
- real PlatformIO process execution foundations
- cryptographically correct SHA-256 manifests
- initial validation-run logic
- revision and release helper functions
- official MCP SDK transport foundations

## Known engineering blockers

### Command lifecycle

- PCB component dragging still bypasses a complete transaction lifecycle.
- Not every canvas supports exact pointer-down undo and pointer-up redo.
- Some form edits create excessive or inconsistent history entries.

### PCB

- Created traces do not always preserve both source and target anchors.
- Connectivity is not yet a complete graph across traces, vias, intersections, and layers.
- Net ID and net-name handling is inconsistent in some anchor paths.
- Strict active-board selection and export isolation are incomplete.
- DRC does not yet represent every required physical and electrical rule.

### Mechanical

- Polygon creation and vertex editing are not complete in the UI.
- Displayed width and height labels are not a complete persisted dimension system.
- Current constraint operations rewrite geometry instead of maintaining persistent relationships.
- A professional parametric geometry kernel does not exist.

### WebGL and collision

- Board dimensions and thickness may be hard-coded or approximated.
- Missing component package dimensions may still receive fallback geometry.
- Unplaced components may receive fallback positions.
- Collision results are therefore not yet authoritative engineering evidence.

### Firmware and bridge

- Serial-monitor operations are incomplete.
- Long-running operation tracking and cancellation are incomplete.
- Build and upload records are not fully integrated into the canonical project.
- Approval tokens need stronger binding to operation, project, environment, and device.

### Validation

- Manual measurements do not yet have complete unit and tolerance evaluation.
- Evidence requirements and review decisions are incomplete.
- Full retest and run-comparison UI does not exist.

### Revisions and releases

- Production Revisions UI does not fully load branch snapshots.
- Merge and conflict resolution are not complete.
- Release eligibility checks only a subset of required blockers.
- Released-state immutability and new-working-branch flows need complete integration.

### MCP

- The stdio process can still create a separate default in-memory project.
- It does not yet share a durable canonical repository with the browser application.
- Draft application is not fully routed through typed application commands.
- Complete protocol-level client/server tests are missing.
- Some advertised resources do not have complete handlers.

### Manufacturing

- Some output paths still fall back to first-board or guessed values.
- Vias and geometry can leak across board boundaries in some generators.
- Missing placement may receive fallback coordinates.
- Outputs are planning drafts, not verified fabrication packages.

## Safety status

Current output is not approved for:

- direct fabrication
- medical devices
- automotive safety systems
- industrial safety systems
- mains-powered products
- certified RF products
- regulated products
- production firmware flashing

Independent engineering review remains mandatory.

## Completion rule

A domain should be described as complete only when:

1. the production engine exists;
2. the real UI uses it;
3. state persists correctly;
4. undo and redo work where applicable;
5. cross-domain dependencies update;
6. automated tests exercise production behavior;
7. manual verification is recorded; and
8. CI verifies the relevant package.

A type, helper, test object, button, or documentation page is not completion evidence.
