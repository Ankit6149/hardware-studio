# Hardware Studio Domain and Tool Landscape Research

**Status:** Research pass 1 — active, not a final backlog  
**Purpose:** Establish the real hardware-product-development landscape before changing navigation, UI, platform architecture, or creating additional implementation issues.

## 1. Why this research exists

The earlier recovery audit correctly identified serious repository defects, but its issues were still too broad. It treated areas such as backend, collaboration, simulation, manufacturing, component intelligence, and release management as large feature epics rather than separate product systems.

Hardware Studio spans several professional disciplines. Each discipline has its own source-of-truth objects, editors, review workflows, state machines, outputs, interchange formats, safety boundaries, and specialist tools. A professional product architecture cannot be produced by listing feature names under a sidebar.

No additional implementation backlog should be created until this research establishes:

1. the disciplines Hardware Studio intends to serve;
2. the professional tools used in each discipline;
3. the objects and workflows those tools treat as authoritative;
4. the boundaries between native Hardware Studio capabilities and integrations;
5. the shared product graph and lifecycle that connect all disciplines;
6. the information architecture, navigation, and workspace model;
7. the cloud platform and local-machine architecture;
8. the first complete reference-product workflow.

## 2. Preliminary product position

Hardware Studio should not initially claim to replace every mature CAD, EDA, CAE, PLM, firmware, test, and manufacturing tool.

The strongest credible position is:

> A connected hardware-product operating environment that preserves the digital thread from intent to design, validation, manufacturing handoff, and release, while progressively providing native workbenches and qualified adapters to established engineering tools.

This means Hardware Studio should own these capabilities early:

- canonical product graph and engineering identity;
- requirements, architecture, interfaces, risks, decisions, and traceability;
- product-wide change impact and stale propagation;
- component-definition and representation governance;
- workspaces, typed commands, reviews, versions, branches, comparisons, approvals, and releases;
- cross-domain search, navigation, comments, tasks, evidence, and audit;
- safe AI/MCP proposal workflows;
- orchestration of qualified CAD, EDA, firmware, simulation, test, and manufacturing adapters.

It may provide native schematic, PCB, sketch, CAD, firmware, validation, and output workbenches, but each becomes authoritative only after its domain model and independent qualification are complete.

## 3. Domain map and benchmark tools

### 3.1 Product intent, requirements, and systems engineering

**Professional references**

- IBM Engineering DOORS Next
- Jama Connect
- Siemens Polarion
- CATIA Cameo Systems Modeler / SysML
- Capella / Arcadia
- Altium Requirements Portal / Valispace

**What these tools establish**

- requirements are governed objects, not text rows;
- relationships such as derives, satisfies, verifies, refines, allocates, depends-on, and conflicts-with are typed;
- requirements can be organized as documents, tables, trees, matrices, diagrams, variants, and baselines;
- reviews, signatures, permissions, history, reuse, and ReqIF exchange are first-class;
- system architecture includes functions, logical components, physical components, interfaces, exchanges, scenarios, allocations, parameters, and verification links;
- engineering values such as mass, power, temperature, cost, and performance can participate in calculated constraints and requirement verification.

**Hardware Studio implications**

- separate needs, stakeholder requirements, system requirements, subsystem requirements, design constraints, acceptance criteria, assumptions, risks, hazards, decisions, verification methods, and evidence;
- implement typed architecture and interface objects rather than a generic node canvas;
- provide trace matrices, coverage, gap analysis, change impact, variants, baselines, review workflows, and ReqIF interchange;
- support numeric requirements backed by typed units and calculated design values.

### 3.2 Product lifecycle, product data, BOM, change, and quality management

**Professional references**

- PTC Windchill
- Siemens Teamcenter
- Arena PLM/QMS
- Duro PLM
- OpenBOM

**What these tools establish**

- the product record is larger than CAD files;
- items, parts, documents, software, firmware, BOMs, approved manufacturers, approved vendors, quality records, changes, and releases have distinct lifecycles;
- eBOM, mBOM, service BOM, configured BOM, flattened BOM, and as-built structures are related but not identical;
- engineering changes use requests/notices/orders, affected objects, resulting objects, reviewers, effectivity, implementation actions, approvals, and audit;
- released data is immutable and is superseded rather than silently overwritten;
- supplier and manufacturing collaboration require controlled snapshots and permissions.

**Hardware Studio implications**

- model product structures independently from editor canvas objects;
- distinguish part, component definition, design instance, BOM line, supplier part, purchased item, assembly, software item, firmware artifact, and manufactured unit;
- add formal change-control objects and workflows;
- maintain as-designed, as-planned, as-built, and as-tested product views;
- separate release lifecycle from normal editing history.

### 3.3 Electronic system architecture and AI-assisted circuit design

**Professional references**

- Flux
- CELUS Design Platform
- Circuit Mind
- Altium Requirements Portal and Designer
- Cadence Allegro X / OrCAD X
- Siemens Xpedition

**What these tools establish**

- functional blocks and interfaces can bridge product architecture and detailed electronics;
- AI is most useful when grounded in component data, connectivity, constraints, simulations, and datasheets;
- AI changes must be proposals or approved actions, not arbitrary JSON mutation;
- architecture resolution should produce reviewable components, BOM, interconnections, assumptions, and output files;
- serious electrical tools remain constraint-driven and use shared design/library data.

**Hardware Studio implications**

- create a distinct electronic architecture layer before schematic detail;
- represent power rails, logical interfaces, protocols, operating modes, signal classes, bandwidth, voltage, current, timing, safety, and isolation constraints;
- AI must cite source data and route changes through deterministic commands and checks;
- early AI scope should focus on explanation, requirement decomposition, component comparison, known reference circuits, rule findings, and proposal generation.

### 3.4 Component intelligence, libraries, sourcing, compliance, and lifecycle

**Professional references**

- SnapMagic / SnapEDA
- Ultra Librarian
- Octopart
- SiliconExpert
- EasyEDA/LCSC
- Cadence component integrations

**What these tools establish**

- a placeable device is a governed combination of symbol, pins, footprint, pad stack, package, 3D model, attributes, documents, simulation models, and sourcing identity;
- library records need revision, verification status, provenance, standards, ownership, deprecation, and update review;
- sourcing requires manufacturer identity, supplier offers, inventory, pricing, lifecycle, compliance, risk, alternates, and timestamped provenance;
- form-fit-function replacement is not the same as text similarity.

**Hardware Studio implications**

- build a versioned component-definition service, not a hard-coded array;
- separate manufacturer part, supplier offer, symbol unit, footprint revision, package model, simulation model, and project instance;
- never substitute unknown package dimensions or footprints in authoritative checks;
- support library update review and product-wide alternate impact.

### 3.5 Schematic capture, electrical connectivity, simulation, and review

**Professional references**

- KiCad
- Altium Designer
- Cadence OrCAD X / Allegro X
- Siemens Xpedition
- Flux
- EasyEDA Pro
- ngspice

**What these tools establish**

- the electrical source of truth is connectivity and typed electrical semantics, not visual wires alone;
- hierarchical sheets, ports, buses, labels, junctions, multi-unit parts, power symbols, net classes, annotation, no-connect markers, variants, and cross-probing are essential;
- schematic and PCB remain synchronized through structured change review;
- ERC and simulation need component/pin models and explicit rule/model completeness;
- serious tools provide object trees, inspectors, rule managers, findings navigation, and design comparisons.

**Hardware Studio implications**

- rebuild schematic around one canonical net/connectivity graph;
- create dedicated hierarchy, object tree, properties, rule, finding, search, and cross-probe panels;
- add simulation as version-bound analysis artifacts, not a chart widget;
- qualify electrical interoperability using KiCad and SPICE reference fixtures.

### 3.6 PCB layout, constraints, analysis, and manufacturing preparation

**Professional references**

- KiCad PCB Editor
- Altium Designer
- Cadence Allegro X
- Siemens Xpedition
- EasyEDA Pro
- Siemens Valor / PCBflow / CAM tools

**What these tools establish**

- PCB design is an explicit board document with stackup, layers, materials, rules, footprints, pads, nets, routing topology, zones, vias, keepouts, dimensions, variants, and fabrication metadata;
- enterprise tools are constraint-driven across physical, electrical, signal-integrity, power-integrity, mechanical, reliability, and manufacturing requirements;
- multi-board and ECAD/MCAD workflows require stable coordinate systems and controlled synchronization;
- DFM is not a final checkbox: it can use actual fabricator/assembler capability profiles;
- manufacturing transfer uses intelligent product models and independent CAM/DFM verification.

**Hardware Studio implications**

- separate board setup, stackup, placement, routing, rule management, analysis, review, and output preparation into real workflows;
- enforce strict board ownership on every entity and command;
- maintain stable topology from schematic pin to pad, via, segment, zone, and returned connectivity;
- support manufacturer capability profiles and preflight rules;
- treat IPC-2581 and ODB++ as important intelligent exchange targets in addition to Gerber/Excellon.

### 3.7 Mechanical concept, parametric CAD, assemblies, drawings, and ECAD/MCAD

**Professional references**

- Onshape
- Autodesk Fusion
- FreeCAD
- PTC Creo
- Siemens Designcenter/NX
- SOLIDWORKS and browser xDesign
- Open CASCADE Technology

**What these tools establish**

- exact CAD uses topology and a modeling kernel, not rendered boxes;
- sketches, constraints, parameters, features, bodies, parts, assemblies, mates, configurations, drawings, and manufacturing information are distinct objects;
- upstream changes regenerate dependent features and associative drawings;
- professional CAD exposes feature trees, model trees, selection filters, standard views, sectioning, measurement, failure diagnostics, and revision context;
- cloud CAD can use editable workspaces, immutable versions, branches, comparisons, merges, release candidates, and contextual comments;
- ECAD/MCAD coordination requires stable board, hole, keepout, component, enclosure, origin, and change identities.

**Hardware Studio implications**

- Three.js remains the viewport renderer only;
- adopt a reviewed B-Rep CAD kernel adapter, preferably Open CASCADE-based;
- build sketch and feature history before promising parametric modeling;
- explicitly distinguish exact solids, imported meshes, provisional envelope geometry, and visualization placeholders;
- create dedicated part, assembly, drawing, and ECAD/MCAD coordination modes.

### 3.8 Engineering analysis and multiphysics

**Professional references**

- ngspice
- Ansys Electronics / Icepak / SIwave
- COMSOL Multiphysics
- SimScale
- integrated Fusion/Creo/NX simulation workflows

**What these tools establish**

- analysis is a versioned workflow with input completeness, model assignment, boundary conditions, solver configuration, run state, convergence, results, plots, assumptions, warnings, and comparison;
- different analyses need different solvers and data contracts;
- simulation results do not automatically become physical validation evidence;
- thermal, SI/PI, electromagnetic, structural, flow, tolerance, and circuit analyses have separate validity limits.

**Hardware Studio implications**

- build an analysis definition/run/artifact/review framework before individual solvers;
- start with qualified adapters and a small native set: SPICE, power tree, tolerance stack, exact interference, and documented engineering estimates;
- show assumptions and model completeness beside every result;
- preserve immutable historical runs and stale them when inputs change.

### 3.9 Embedded firmware, configuration, build, debug, and virtual hardware

**Professional references**

- PlatformIO
- STM32CubeIDE / CubeMX / CubeProgrammer / CubeMonitor
- Zephyr
- ESP-IDF and vendor SDKs
- Wokwi

**What these tools establish**

- firmware exists as a real filesystem project with environments, dependencies, toolchains, source trees, boards, frameworks, build flags, artifacts, device identities, uploads, debugging, monitoring, and tests;
- hardware mapping needs exact pins, alternate functions, peripherals, buses, addresses, interrupts, clocks, DMA, voltage domains, and conflict checks;
- virtual simulation, emulation, hardware-in-the-loop, and real-device results are different evidence classes;
- reproducibility requires source revision, dependency lock, environment, compiler/tool versions, build logs, and artifact hashes.

**Hardware Studio implications**

- browser text records cannot be the firmware source of truth;
- use a filesystem-backed workspace through desktop/local bridge boundaries;
- make PlatformIO a first qualified adapter;
- provide device registry, approved flash/erase, serial sessions, operation history, and captured evidence;
- later support simulation adapters such as Wokwi without presenting them as physical-device validation.

### 3.10 Validation, test automation, lab data, and reliability

**Professional references**

- NI TestStand
- OpenTAP
- Polarion QA
- Jama test management
- Zephyr Twister
- Instrumental manufacturing data platform

**What these tools establish**

- test plans contain ordered steps, DUTs, instruments, fixtures, parameters, limits, measurements, result listeners, attachments, operators, environments, and execution policies;
- test specifications and test executions are separate versioned records;
- results need durable storage, provenance, immutable review, retest lineage, and links to exact product/build/device versions;
- manufacturing and NPI analysis needs per-unit serial traceability across images, measurements, functional tests, assembly stages, defects, rework, and returns;
- operator mode differs from engineering-authoring mode.

**Hardware Studio implications**

- create test authoring, execution, operator, review, analytics, and evidence workflows as separate modes;
- model DUT, sample, lot, fixture, equipment, calibration, procedure, run, step result, measurement, evidence, failure, deviation, waiver, review, and retest;
- support plugin/adapters for instruments and result listeners;
- distinguish EVT, DVT, PVT, reliability, compliance, factory QA, and production tests.

### 3.11 Manufacturing handoff, NPI, DFM, MES, and as-built traceability

**Professional references**

- Siemens Valor / PCBflow
- MacroFab
- Instrumental
- Siemens Opcenter
- Tulip
- established contract-manufacturer portals

**What these tools establish**

- manufacturing intake begins by parsing and validating design packages, normalizing BOMs, resolving sourcing, and applying actual process capabilities;
- NPI requires builds, lots, units, stations, process routes, inspections, failures, deviations, rework, and feedback into design;
- MES tracks what was actually built, with genealogy from incoming lots through personnel, equipment, process, tests, exceptions, and shipping;
- digital work instructions, operator guidance, non-conformance, CAPA, and production controls are different systems from CAD;
- serialized unit data enables failure analysis and field/recall traceability.

**Hardware Studio implications**

- do not call a ZIP generator a manufacturing system;
- model manufacturing package, quote/request, supplier/factory capability, build, lot, unit, route, station, work instruction, inspection, non-conformance, deviation, rework, and as-built genealogy separately;
- early scope should be manufacturing handoff and NPI evidence, not a full MES replacement;
- preserve closed-loop feedback from factory findings to product changes and retests.

### 3.12 Interchange, standards, and independent qualification

**Important formats and standards**

- ReqIF for requirements exchange
- SysML / future SysML v2 for system models
- KiCad formats and CLI for open ECAD qualification
- IPC-2581 and ODB++ for intelligent PCB design-to-manufacturing exchange
- Gerber X2, Excellon, IPC-D-356, BOM, CPL/position and assembly documentation
- STEP AP242-class workflows for exact CAD/product/manufacturing information
- STL and GLTF/GLB as mesh/visualization formats with explicit limits
- DXF/SVG/PDF for supported sketch/drawing exchange
- PlatformIO project structure and manifests for firmware
- xUnit/JUnit-like results plus domain-specific evidence adapters for automated tests

**Hardware Studio implications**

- every adapter needs capability declaration, import staging, mapping preview, diagnostics, unsupported/loss report, transaction, provenance, version, and round-trip qualification;
- “another tool opened the file” is not sufficient—semantic comparison is required;
- unsupported constructs must remain visible rather than being silently discarded.

### 3.13 Collaboration, versioning, review, search, and AI

**Professional references**

- Onshape
- Flux
- Altium 365
- Polarion/Jama/Arena
- Liveblocks/Yjs as infrastructure references
- OpenSearch for structured + semantic retrieval

**What these tools establish**

- presence, cursors, shared text, contextual comments, review threads, mentions, notifications, and engineering state changes are different data streams;
- CRDTs are appropriate for some collaborative text/presence use cases, but engineering topology, releases, approvals, and device actions still need typed transactional commands;
- search must combine exact identifiers and attributes with full-text and semantic retrieval while enforcing project permissions;
- AI needs exact project/version context, structured tools, citations, proposal review, permission boundaries, and stale-context warnings.

**Hardware Studio implications**

- do not synchronize the complete engineering project as one generic CRDT document;
- use presence/comments/shared text where suitable and typed commands for canonical engineering mutations;
- build object-level search and command navigation before relying on AI chat;
- attach comments and AI proposals to stable object/version identities.

### 3.14 Cloud platform, local-first storage, and machine operations

A cloud database is only one layer. Hardware Studio needs separate systems for:

1. identity and sessions;
2. organizations, teams, projects, workspaces, roles, and permissions;
3. canonical relational metadata and product graph;
4. command/event log and optimistic concurrency;
5. engineering versions, branches, comparisons, merges, and release manifests;
6. object/blob storage for CAD, evidence, builds, simulations, and outputs;
7. upload sessions, checksums, malware/content validation, retention, and signed access;
8. background engineering jobs with progress, cancellation, retries, idempotency, and durable execution;
9. realtime presence, comments, notifications, and selected collaborative content;
10. offline queue, sync, conflict detection, and recovery;
11. search indexes and permission-scoped retrieval;
12. audit, approval, electronic-signature and high-impact action records;
13. local bridge/desktop agent installation, pairing, capability discovery, updates, health, logs, and revocation;
14. observability using traces, metrics, logs, correlation IDs, and release context;
15. backups, point-in-time restore, disaster recovery, data export, and deletion;
16. environment separation, schema migration, preview databases, feature flags, secrets, rate limits, and deployment automation.

**Preliminary technology direction to evaluate, not yet a final decision**

- PostgreSQL for canonical relational data, graph relationships, command metadata, permissions, and search-friendly structured records;
- Supabase or a custom service over Postgres for early Auth/RLS/Storage/Realtime evaluation;
- Neon-style database branches for isolated development/preview environments and recovery workflows;
- S3-compatible object storage for large immutable artifacts rather than storing files inside project JSON;
- Temporal or a comparable durable workflow system for CAD regeneration, DRC, simulation, build, import/export, evidence processing, and release-package jobs;
- OpenTelemetry for traces, metrics, and logs;
- OpenSearch only when Postgres search is no longer sufficient and hybrid/semantic retrieval is justified;
- Liveblocks/Yjs only for the collaboration surfaces they fit, not as the authoritative engineering database.

## 4. Root causes missing from the earlier issue set

The new research reveals additional root causes that must be addressed before a professional backlog is written:

1. No agreed domain taxonomy or product boundary.
2. No distinction between authoring, analysis, validation, release, manufacturing handoff, and manufacturing execution.
3. No authoritative object model per discipline.
4. No as-designed, as-planned, as-built, and as-tested views.
5. No formal engineering change process.
6. No roles/personas and workflow-specific permissions.
7. No artifact lineage, provenance, qualification, and evidence-class model.
8. No supplier/factory capability or process-profile model.
9. No clear native-versus-adapter strategy.
10. No plugin/adapter SDK or capability negotiation.
11. No import staging and reconciliation architecture.
12. No application-wide job system for expensive engineering operations.
13. No object/blob lifecycle separate from project metadata.
14. No collaboration semantics deciding where CRDT, commands, locks, reviews, and branches apply.
15. No search architecture for identifiers, attributes, documents, geometry metadata, evidence, and semantic retrieval.
16. No local desktop/bridge product lifecycle: install, pair, update, revoke, diagnose, and recover.
17. No production observability, SLO, backup, restore, or disaster-recovery architecture.
18. No explicit performance budgets for large schematics, boards, assemblies, graphs, evidence sets, or simultaneous users.
19. No reference-product acceptance model spanning design and physical evidence.
20. No navigation based on stable engineering objects, lifecycle, and user intent.

## 5. Information architecture direction to research next

The current sidebar groups feature names. A professional shell should instead combine several navigation dimensions:

- **Product structure:** product, subsystem, assembly, board, circuit, firmware target, test article.
- **Lifecycle:** define, design, analyze, validate, prepare, release, build, observe.
- **Discipline:** systems, electronics, PCB, mechanical, firmware, test, manufacturing.
- **Workspace/version:** branch, named version, candidate, release, comparison.
- **Object context:** selected requirement/component/net/feature/file/test/unit and all linked representations.
- **Work queue:** findings, stale items, reviews, approvals, failed jobs, conflicts, assigned work.

Likely shell regions to validate through app teardowns:

1. project/workspace/version switcher;
2. global lifecycle navigation;
3. product structure and domain tree;
4. central context-sensitive editor;
5. properties/constraints/relations inspector;
6. findings/tasks/reviews/activity panel;
7. AI/copilot panel grounded in current context;
8. bottom jobs/logs/measurements/console area where appropriate;
9. cross-probe/search/command palette;
10. persistent save, sync, branch, qualification, and stale-state indicators.

The final navigation must not contain ten destinations that render the same component. Each visible destination must correspond to a distinct job, data model, and completion state.

## 6. Research process before new issues

### Pass A — Tool landscape

For every domain, record leading enterprise, accessible/cloud, open-source, AI-native, and manufacturing/test tools.

### Pass B — Workflow teardowns

For each selected benchmark, document:

- users and roles;
- project/document hierarchy;
- navigation model;
- authoritative objects;
- creation/edit/review/release workflows;
- inspectors, trees, rules, findings, search, and command patterns;
- collaboration/version behavior;
- imports, exports, APIs, and integrations;
- compute/local-machine requirements;
- limitations and anti-patterns;
- lessons applicable to Hardware Studio.

### Pass C — Hardware Studio product constitution

Decide:

- V1 user and reference product;
- native capabilities;
- qualified adapters;
- later capabilities;
- explicit non-goals;
- truthfulness/qualification labels;
- supported project scale;
- local-only and cloud/shared modes.

### Pass D — Canonical journeys and information architecture

Map the complete journeys before drawing navigation:

- idea to requirements and architecture;
- component selection to schematic and PCB;
- enclosure/assembly and ECAD/MCAD coordination;
- firmware mapping, build, device and logs;
- analysis and validation;
- change, branch, review and release;
- manufacturing handoff and NPI feedback;
- AI/MCP proposal and approval.

### Pass E — Platform architecture

Write separate ADRs for domain schema, repository, commands, versions, CAD kernel, electrical topology, job system, cloud database, object storage, collaboration, search, bridge, security, observability, and deployment.

### Pass F — Granular backlog

Only after the above, replace broad epics with small trackable issues. Each issue must have one primary outcome, dependencies, contracts, migrations, UX states, failure/recovery behavior, security requirements, acceptance tests, and evidence.

A future backend program will therefore be dozens of issues, not one “build backend” issue.

## 7. Immediate next research sequence

1. Complete deep teardown of Flux, KiCad, Altium, Cadence, Xpedition, EasyEDA, CELUS, and Circuit Mind.
2. Complete deep teardown of Onshape, Fusion, FreeCAD, Creo, Designcenter/NX, SOLIDWORKS/xDesign, and Open CASCADE architecture.
3. Complete requirements/MBSE/PLM teardown of Jama, DOORS, Polarion, Cameo, Capella, Valispace, Windchill, Teamcenter, Arena, Duro, and OpenBOM.
4. Complete firmware/test teardown of PlatformIO, STM32Cube, Zephyr, Wokwi, TestStand, OpenTAP, and Instrumental.
5. Complete manufacturing/DFM/MES teardown of Valor/PCBflow, MacroFab, Opcenter, Tulip, and contract-manufacturer workflows.
6. Produce the Hardware Studio object taxonomy and lifecycle map.
7. Produce UI/navigation alternatives grounded in the benchmark workflows.
8. Produce the cloud/local platform architecture and granular backlog decomposition.
9. Incorporate every additional reference supplied by the product owner before finalizing the backlog.

## 8. Research source index — official starting points

- Flux documentation: https://docs.flux.ai/
- KiCad: https://www.kicad.org/
- Altium documentation: https://www.altium.com/documentation/
- Cadence PCB design: https://www.cadence.com/en_US/home/tools/pcb-design-and-analysis.html
- Siemens Xpedition: https://www.siemens.com/en-us/products/pcb/xpedition/
- EasyEDA Pro documentation: https://prodocs.easyeda.com/
- CELUS: https://www.celus.io/
- Circuit Mind: https://www.circuitmind.io/
- Onshape documentation: https://cad.onshape.com/help/
- Autodesk Fusion: https://www.autodesk.com/products/fusion-360/
- FreeCAD: https://www.freecad.org/
- PTC Creo: https://www.ptc.com/en/products/creo
- Siemens Designcenter/NX: https://www.siemens.com/en-us/products/cad-cam-software/
- Open CASCADE: https://dev.opencascade.org/
- Jama Connect: https://www.jamasoftware.com/platform/jama-connect/
- IBM DOORS Next: https://www.ibm.com/products/requirements-management
- Siemens Polarion: https://www.siemens.com/en-us/products/polarion/
- Capella/Arcadia: https://mbse-capella.org/
- CATIA No Magic/Cameo: https://www.3ds.com/products/catia/no-magic
- Valispace/Requirements Portal: https://www.valispace.com/
- PTC Windchill: https://www.ptc.com/en/products/windchill
- Arena: https://www.arenasolutions.com/
- Duro: https://www.durolabs.co/
- OpenBOM: https://www.openbom.com/
- SnapMagic: https://www.snapmagic.com/
- Ultra Librarian: https://www.ultralibrarian.com/
- Octopart: https://octopart.com/
- SiliconExpert: https://www.siliconexpert.com/
- PlatformIO: https://platformio.org/
- STM32 tools: https://www.st.com/content/st_com/en/stm32-mcu-developer-zone/software-development-tools.html
- Zephyr: https://www.zephyrproject.org/
- Wokwi: https://wokwi.com/
- ngspice: https://ngspice.sourceforge.io/
- OpenTAP: https://opentap.io/
- NI TestStand: https://www.ni.com/en/shop/electronic-test-instrumentation/application-software-for-electronic-test-and-instrumentation-category/what-is-teststand.html
- Instrumental: https://instrumental.com/
- Siemens Valor: https://www.siemens.com/en-us/products/pcb/valor/
- MacroFab: https://www.macrofab.com/platform
- Siemens Opcenter: https://www.siemens.com/en-us/products/opcenter/
- Tulip: https://www.tulip.co/
- ReqIF: https://www.omg.org/reqif/
- IPC-2581: https://www.ipc2581.com/
- ODB++: https://odbplusplus.com/
- Supabase documentation: https://supabase.com/docs
- Neon documentation: https://neon.com/docs
- Temporal documentation: https://docs.temporal.io/
- OpenTelemetry: https://opentelemetry.io/docs/
- Liveblocks: https://liveblocks.io/docs
- Yjs: https://docs.yjs.dev/
- OpenSearch: https://docs.opensearch.org/

---

This file is intentionally research-first. It must be updated with deeper workflow teardowns and product-owner references before it is converted into UI specifications or implementation issues.
