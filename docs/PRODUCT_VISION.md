# Hardware Studio — Product Vision

**Vision reconciliation:** 2026-09-02  
**Current master at reconciliation:** `79902f6fceb0087e7f446960e9c8059841ba4daa`  
**Current Studio phase:** U8 — Release convergence

This document describes the product Hardware Studio is being built toward. For current implementation reality, read `CURRENT_STATUS.md`; for active execution, read `development/STUDIO_PHASE_EXECUTION_STATUS.md`.

## Purpose

Hardware Studio is being built as one connected operating environment for designing, validating, reviewing, and releasing complete physical products.

The central observation is simple: a hardware product is never just a PCB file, CAD model, firmware repository, spreadsheet, or test report. It is simultaneously:

- product intent and requirements;
- system architecture and interfaces;
- electrical connectivity and physical electronics;
- mechanical geometry and assembly context;
- firmware and hardware mapping;
- validation evidence;
- revisions, outputs, manufacturing context, and release decisions.

Most teams represent those realities in separate tools and manually preserve the relationships between them. Hardware Studio explores whether those relationships can become durable product state instead of tribal knowledge.

## The core product idea

The target is **not** a launcher for unrelated mini-apps.

The target mental model is:

> “I am in one product/project, and Product, Electronics, PCB, Mechanical, Firmware, Validation, and Release are connected views of that same product.”

That implies one connected digital thread, shared object identity, visible change impact, explicit engineering evidence, and predictable workbench interaction.

## Current progress toward that vision

The Studio interaction model has already moved substantially in this direction:

- U0–U7 structural UX convergence is landed;
- workbench tabs own top-level domain navigation;
- contextual Project Drawers own domain/project navigation;
- the Inspector is a shared selection-aware surface;
- the bottom dock is the shared home for diagnostics/jobs/evidence/logs;
- Project Home uses domain evidence rather than raw counts;
- PCB, Mechanical, Firmware, and Validation have been converged away from separate mini-app shells;
- passive navigation is moving toward explicit selection rather than hidden first-record context;
- Studio routing uses clean `/studio/...` paths rather than hash routing.

U8 is now applying the same discipline to Release.

This is meaningful product progress, but it does not mean the underlying engineering engines are complete. Issues #15–#21 remain the deep engineering authorities for PCB, Mechanical, Firmware, Validation, versions/releases, and qualified outputs.

## The problem Hardware Studio should solve

A single change can cross many engineering boundaries.

Replacing a component can affect:

- requirements and system behavior;
- architecture interfaces;
- voltage/current assumptions;
- schematic symbol and pin mappings;
- footprint, board placement and routing;
- enclosure clearance and connector access;
- power and thermal assumptions;
- firmware driver/protocol/pin configuration;
- sourcing and BOM risk;
- validation procedures and accepted evidence;
- drawings, manufacturing output and release eligibility.

In fragmented workflows, those effects are discovered manually, late, or not at all.

Hardware Studio should make relationships explicit enough that the system can answer:

- What depends on this object?
- Which downstream evidence becomes stale if this changes?
- Which outputs must be regenerated?
- Which validation must be repeated?
- What is still unresolved?
- What evidence actually supports a release claim?

## Product graph vision

A component is a useful example of the intended connected model:

```text
Component instance
├── requirement / system role
├── architecture node and interfaces
├── electrical pins and schematic representation
├── footprint / pads / board placement / nets
├── physical package / keepout / clearance context
├── sourcing / lifecycle / alternatives
├── firmware mapping / driver / protocol
├── power / thermal assumptions
├── validation definitions and accepted runs
└── version / output / release state
```

The same principle should apply to boards, requirements, firmware modules, validation procedures, mechanical features, versions, and artifacts.

## Shared workbenches

### Project / Product

Purpose:

- product intent;
- requirements;
- architecture and interfaces;
- decisions and risks;
- next engineering action;
- connected lifecycle context.

The workbench should make the product understandable before users enter domain-specific editors.

### Electronics

Purpose:

- component definitions and product instances;
- schematic symbols and electrical pins;
- nets/connectivity;
- board/PCB realization;
- ERC/DRC and implementation evidence;
- BOM/manufacturing context.

The long-term target is real ECAD depth with canonical connectivity and independently qualified outputs, not simply a visual schematic/board editor.

### Mechanical

Purpose:

- sketch/layout intent;
- dimensions and constraints;
- parts/features/bodies;
- board/enclosure coordination;
- assemblies and mates;
- exact clearance/interference;
- drawings and exchange.

Current 2D/3D review foundations are stepping stones. The vision requires qualified exact geometry and a mature feature/constraint model.

### Firmware

Purpose:

- source/configuration;
- hardware mapping;
- state/behavior modeling;
- reproducible builds;
- device upload and serial workflows;
- build/device evidence tied to exact source/environment/device.

The browser should not pretend recorded metadata is locally executed proof. Machine operations belong behind hardened local tooling.

### Validation

Purpose:

- test definition;
- execution;
- measurements and observations;
- evidence and provenance;
- reviewer decisions;
- retest lineage;
- requirement coverage;
- release blocking.

The current **Define → Execute → Review** grammar is the intended interaction direction. The long-term vision adds durable, version-bound, trustworthy evidence and review infrastructure.

### Release

Purpose:

- readiness and blockers;
- editable workspaces and immutable versions;
- branch lineage and comparisons;
- merges/conflicts;
- outputs and preflight;
- release candidates;
- trusted approvals;
- immutable published releases and supersession.

U8 is currently converging this area structurally. The vision requires much more than revision cards, snapshots, generated ZIPs, or status toggles.

## One interaction grammar

The target interaction model is intentionally consistent across domains:

```text
TopBar
→ workbench tabs
→ contextual Project Drawer
→ central user job / engineering representation
→ contextual Inspector
→ bottom Problems / jobs / evidence / logs dock
→ compact status bar
```

A mature engineering application is complex, but complexity should come from the product and engineering problem—not from every domain inventing a different shell.

## Explicit context as a product principle

Hardware Studio should not silently choose engineering context merely because a record exists.

Examples:

- opening PCB should not invent an active board;
- opening Firmware Source should not silently choose the first file;
- opening Validation should not silently choose the first test/run;
- opening Release should not silently choose the first revision/artifact/candidate.

Explicit context makes automation, audit, review, and cross-domain impact safer.

## Intent-driven engineering operations

The UI and MCP should eventually share semantic domain operations such as:

- `create_requirement`;
- `add_component`;
- `connect_component_pins`;
- `create_board`;
- `place_footprint`;
- `route_net`;
- `run_drc`;
- `create_firmware_module`;
- `map_firmware_pin`;
- `build_firmware`;
- `create_validation_run`;
- `create_version`;
- `generate_output_package`;
- `create_release_candidate`.

These operations should be typed, reviewable, reversible where appropriate, policy-aware, and backed by the same project/repository model as the UI.

Mouse-coordinate automation is not a substitute for engineering semantics.

## AI and MCP direction

Hardware Studio is intended to work both as:

1. an MCP server exposing safe semantic engineering capabilities; and
2. an MCP host/client integrating with external engineering services and tools.

Potential integrations include ECAD/CAD tool APIs, PlatformIO/device tooling, supplier/component services, simulation systems, test equipment, and project/release infrastructure.

The product vision is **not unrestricted AI control**.

AI/MCP must not be allowed to silently invent:

- dimensions or geometry;
- component qualification;
- placements/routing evidence;
- validation evidence;
- equipment/calibration records;
- human reviewer identity/approval;
- manufacturing qualification;
- release approval.

The safest model is typed read → draft → reviewed apply → explicitly approved high-impact operation.

## Local-first direction

Local ownership remains a central goal.

The desired architecture supports:

- local project ownership;
- deterministic serialization/migrations;
- durable local repository/history;
- optional collaboration later;
- local bridge for machine/device operations;
- explicit approvals for high-impact operations;
- reproducible artifacts and release history without requiring a cloud account for core use.

Local-first does not mean browser-only `localStorage` forever. Shared repository/process architecture is still required.

## Truth and evidence hierarchy

The product should make trust explicit.

Useful categories include:

- canonical engineering state;
- derived state;
- approximation / screening result;
- draft/unqualified artifact;
- independently checked artifact;
- reviewed/accepted evidence;
- release-grade immutable evidence.

A generator succeeding is not verification. A visual 3D model is not automatically exact CAD. A clean approximate collision screen is not a physical-clearance certification. A status toggle is not trusted approval.

## What Hardware Studio is not yet

Hardware Studio is not currently:

- a replacement for Fusion, SolidWorks, KiCad, Altium, Onshape, FreeCAD, or PlatformIO;
- a fabrication-qualified ECAD system;
- a professional parametric CAD kernel/workflow;
- a stable production flashing/device-management environment;
- a release-grade validation/QMS system;
- a complete PLM/version/release platform;
- a qualified manufacturing-package generator;
- a production-ready autonomous engineering agent.

Current status is maintained in `CURRENT_STATUS.md`.

## Success definition

Hardware Studio succeeds when a team can take a bounded product from intent to a reviewed release while preserving the relationships, provenance, decisions, evidence, and change impact between engineering domains—without manually rebuilding that thread in spreadsheets and file names.

A successful system should:

- make change impact visible;
- preserve canonical identity across representations;
- expose unresolved engineering state instead of hiding it;
- distinguish approximation from authority;
- make validation/review evidence traceable;
- make generated outputs no more trustworthy than their source data and qualification;
- preserve version/release history;
- support safe semantic automation without surrendering engineering accountability.
