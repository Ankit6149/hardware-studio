# Hardware Studio Master Product Research and Build Blueprint

**Research baseline:** `f686a93633f9e1b64939a9cf85bf21ad0537f060`  
**Prepared:** 2026-07-28  
**Status:** Authoritative research and backlog-decomposition baseline. This is not a claim that the product is implemented or production-ready.

---

## 1. Executive summary

Hardware Studio can become an all-in-one hardware-product environment, including real parametric 3D models, system architecture, component intelligence, schematic capture, PCB layout, firmware, validation, manufacturing handoff, cloud collaboration, and AI-assisted engineering.

The phrase **all in one** must describe one connected user experience and one digital thread, not one frontend bundle or one home-grown engineering engine.

The application should allow a product team to move through:

```text
Need or opportunity
  → product requirements
  → system architecture and interfaces
  → component and sourcing decisions
  → schematic and electrical analysis
  → PCB and manufacturing constraints
  → mechanical part and enclosure design
  → exact 3D assembly and ECAD/MCAD coordination
  → firmware and physical devices
  → simulation and validation
  → engineering change and review
  → manufacturing handoff and NPI evidence
  → immutable release
```

Every domain must remain connected through one canonical product graph, one identity model, one command system, one version history, one evidence model, and one approval/audit system.

Hardware Studio should initially differentiate through the connected lifecycle and user experience rather than attempting immediate feature parity with every specialist tool. Mature engineering engines should be used through qualified adapters where building an equivalent engine would delay the product without adding unique value.

The central product thesis is:

> Hardware Studio is a connected hardware-product operating environment that preserves the digital thread from intent to design, validation, manufacturing handoff, and release. It progressively supplies native workbenches while orchestrating qualified CAD, EDA, firmware, simulation, test, sourcing, and manufacturing adapters.

---

## 2. Product boundaries

### 2.1 What Hardware Studio should own

Hardware Studio should own the shared systems that specialist engineering applications usually fragment:

- product, organization, workspace, user, role, and permission identity;
- requirements, architecture, interfaces, risks, hazards, assumptions, and decisions;
- canonical product structure and product graph;
- component-definition governance and representation completeness;
- cross-domain identity between logical, electrical, PCB, mechanical, firmware, validation, and manufacturing objects;
- typed engineering commands and transactions;
- dependency-aware stale propagation and impact analysis;
- comments, tasks, findings, reviews, and approvals;
- versions, workspaces, branches, comparisons, merges, release candidates, and releases;
- artifact lineage, provenance, evidence class, qualification state, and checksums;
- project-wide search, cross-probing, command navigation, and activity history;
- safe MCP and AI proposal workflows;
- job orchestration, local-machine capabilities, and cloud collaboration;
- a unified information architecture and consistent interaction model.

### 2.2 What Hardware Studio should not claim immediately

Hardware Studio should not initially claim full replacement for:

- enterprise CAD platforms such as NX, Creo, CATIA, or SOLIDWORKS;
- complete ECAD suites such as Allegro X, Xpedition, Altium Designer, or KiCad;
- advanced multiphysics systems such as Ansys or COMSOL;
- enterprise PLM suites such as Teamcenter or Windchill;
- complete test-executive systems such as NI TestStand;
- full manufacturing execution systems;
- safety, compliance, or fabrication qualification without independent evidence.

### 2.3 Native-versus-adapter rule

A domain capability should be native when it is central to the product’s differentiation, must work across every product domain, or requires interaction patterns not available through external tools.

A capability should initially use a qualified adapter when:

- a mature open or accessible engine already exists;
- independent comparison is necessary for trust;
- the domain requires years of specialist algorithm work;
- file, CLI, API, or SDK integration can preserve the digital thread;
- Hardware Studio can add value through orchestration, context, review, and traceability.

Initial adapter candidates include:

- KiCad and `kicad-cli` for ECAD interchange, ERC, DRC, and output comparison;
- Open CASCADE Technology for exact B-Rep modeling and STEP exchange;
- PlatformIO for embedded project configuration, builds, uploads, monitoring, and tests;
- ngspice for circuit simulation;
- OpenTAP for extensible automated test execution;
- supplier and component-data services for availability and lifecycle intelligence;
- external thermal, SI/PI, structural, and manufacturing-analysis tools where qualified.

---

## 3. Target users and roles

The product must be designed around real jobs rather than a feature sidebar.

### 3.1 Founder or product engineer

Needs to:

- turn an idea into structured requirements and architecture;
- compare product approaches and component choices;
- understand cost, power, size, risk, schedule, and feasibility;
- coordinate specialists without losing context;
- view readiness and blockers truthfully;
- approve changes and releases appropriate to their role.

### 3.2 Systems engineer

Needs to:

- manage stakeholder needs, system requirements, interfaces, functions, logical and physical architecture;
- allocate requirements and verification methods;
- analyze traceability, coverage, risks, hazards, variants, and impact;
- create controlled baselines and reviews.

### 3.3 Electrical engineer

Needs to:

- select qualified components;
- author architecture, schematic, electrical rules, simulations, power trees, and interfaces;
- synchronize component, PCB, firmware, mechanical, sourcing, and validation representations;
- review ERC, model completeness, changes, and alternate components.

### 3.4 PCB designer

Needs to:

- configure exact board stackups, rules, origins, layers, materials, constraints, and manufacturer profiles;
- place footprints and route authoritative topology;
- manage zones, vias, differential pairs, length constraints, impedance requirements, keepouts, and DRC;
- prepare independently validated manufacturing outputs.

### 3.5 Mechanical engineer or industrial designer

Needs to:

- create constrained sketches and parametric features;
- manage parts, bodies, assemblies, mates, configurations, materials, and drawings;
- coordinate exact PCB and component geometry;
- inspect clearances, interference, mass properties, tolerances, and revisions.

### 3.6 Firmware engineer

Needs to:

- use real filesystem projects and reproducible environments;
- map code to exact boards, pins, peripherals, addresses, buses, clocks, interrupts, and devices;
- build, test, debug, upload, monitor, and capture artifacts and logs;
- understand hardware changes and stale mappings.

### 3.7 Validation or test engineer

Needs to:

- author controlled test specifications and procedures;
- configure DUTs, instruments, fixtures, measurements, limits, parameters, equipment, and evidence requirements;
- execute tests, handle failures, review results, compare retests, and maintain immutable lineage.

### 3.8 Manufacturing or NPI engineer

Needs to:

- review packages, BOMs, sourcing, process capabilities, work instructions, inspections, defects, deviations, and rework;
- trace builds, lots, serialized units, measurements, images, tests, and process history;
- feed production findings into controlled product changes and validation.

### 3.9 Supplier, contract manufacturer, or reviewer

Needs restricted access to:

- controlled packages and exact released versions;
- comments, questions, approvals, capability feedback, DFM findings, quotes, and evidence uploads;
- only the product and artifacts authorized for that relationship.

### 3.10 Administrator and security owner

Needs to manage:

- organizations, teams, projects, roles, policies, service identities, integrations, MCP clients, local agents, retention, exports, audit, and revocation.

### 3.11 Operator or technician

Needs a simplified execution experience for:

- work instructions;
- test execution;
- device identification;
- measurements and evidence;
- pass, fail, deviation, and escalation;
- no unrestricted design-editing controls.

---

## 4. Product lifecycle and digital-thread model

Hardware Studio must distinguish lifecycle views that are often incorrectly collapsed into one project JSON document.

### 4.1 Product lifecycle stages

1. **Discover** — opportunity, user need, stakeholder input, feasibility, prior art, and initial assumptions.
2. **Define** — requirements, acceptance criteria, system context, architecture, interfaces, risks, and verification strategy.
3. **Design** — components, schematic, PCB, mechanical parts, assemblies, firmware, sourcing, and product structure.
4. **Analyze** — simulation, engineering estimates, tolerance, interference, power, thermal, SI/PI, and other analyses.
5. **Validate** — test specifications, physical or virtual test runs, evidence, failures, reviews, and retests.
6. **Prepare** — drawings, documentation, BOM, manufacturing data, firmware artifacts, work instructions, and supplier packages.
7. **Release** — controlled candidate, reviews, approvals, immutable artifacts, effectivity, and publication.
8. **Build** — NPI build, lots, units, stations, inspections, process results, deviations, and rework.
9. **Observe** — production quality, field feedback, returns, reliability, defects, and improvement proposals.

### 4.2 Product views

Hardware Studio needs explicit related views:

- **as-required** — approved requirements and acceptance criteria;
- **as-designed** — current or released engineering definition;
- **as-planned** — intended manufacturing and test process;
- **as-built** — the actual lot/unit configuration, material genealogy, firmware, process, and deviations;
- **as-tested** — the exact device/sample, test specification, environment, equipment, measurements, results, and evidence;
- **as-maintained** — service, repair, replacement, firmware, and field state where later supported.

### 4.3 Core controlled records

The canonical product model should include at least:

- organization, team, project, workspace, branch, version, candidate, and release;
- need, requirement, constraint, assumption, risk, hazard, decision, verification method, and review;
- product item, part, assembly, document, software item, firmware item, BOM line, and configuration;
- function, logical component, physical component, interface, port, exchange, scenario, and allocation;
- component definition, manufacturer part, supplier offer, symbol, footprint, package, 3D model, simulation model, and project instance;
- schematic sheet, symbol instance, pin, net, bus, label, junction, rule, finding, and waiver;
- board, stackup, layer, footprint instance, pad, route segment, via, zone, keepout, rule, finding, and output recipe;
- sketch, entity, constraint, parameter, profile, feature, body, part, assembly instance, mate, material, drawing, and model artifact;
- firmware workspace, environment, source revision, dependency, hardware mapping, build, binary, device, upload, debug, and monitor session;
- analysis definition, model assignment, input set, solver, run, result, artifact, assumption, warning, and review;
- validation specification, procedure, DUT/sample, fixture, instrument, calibration, run, step result, measurement, evidence, failure, review, and retest;
- manufacturing package, supplier/factory capability, quote/request, build, lot, unit, route, station, instruction, inspection, defect, deviation, and rework;
- command, event, proposal, approval, audit record, job, artifact, relation, comment, task, notification, and search index record.

---

## 5. Domain research and product implications

## 5.1 Requirements and systems engineering

### Benchmark applications

- IBM Engineering DOORS Next
- Jama Connect
- Siemens Polarion
- CATIA Cameo Systems Modeler
- Capella and Arcadia
- Valispace and Altium Requirements Portal

### Professional patterns

Requirements-management platforms treat requirements as governed work items with type, hierarchy, rationale, source, priority, owner, status, verification, version, permissions, review, and change history. They support document, tree, table, matrix, diagram, and trace views.

Systems-engineering platforms additionally model:

- system context and external actors;
- use cases and scenarios;
- functions and functional chains;
- logical and physical architectures;
- interfaces, ports, exchanges, and allocations;
- variants and configurations;
- quantitative constraints and system budgets;
- verification and validation relationships.

### Hardware Studio product requirements

Hardware Studio needs:

- typed requirement classes rather than one generic row;
- reusable requirement sets and controlled baselines;
- hierarchical document and tree authoring;
- trace matrices and missing-link analysis;
- architecture diagrams backed by typed objects;
- interface-control records;
- risk, hazard, assumption, and decision registers;
- numeric requirements using typed units and calculations;
- review, comment, approval, and electronic-signature workflows;
- ReqIF import/export with staged mapping and loss reports;
- impact analysis from requirement change to affected parts, nets, firmware, tests, drawings, and releases.

### V1 boundary

Native:

- requirements, architecture, interfaces, risks, decisions, traceability, reviews, and versioning.

Adapter/interchange:

- ReqIF first;
- SysML interoperability later after the canonical object model is stable.

---

## 5.2 Product lifecycle, BOM, change, and quality

### Benchmark applications

- PTC Windchill
- Siemens Teamcenter
- Arena PLM/QMS
- Duro PLM
- OpenBOM

### Professional patterns

PLM systems manage the product record beyond CAD files. They distinguish product items, design parts, purchased parts, documents, software, firmware, configured structures, BOMs, suppliers, quality records, changes, and releases.

Engineering-change workflows include:

- change request;
- problem statement and justification;
- affected objects and current versions;
- proposed and resulting objects;
- impact on cost, inventory, tooling, firmware, validation, manufacturing, and compliance;
- reviewers and approvers;
- implementation plan and effectivity;
- resulting release and audit.

### Hardware Studio product requirements

Hardware Studio needs:

- one canonical item and product-structure model;
- eBOM, mBOM, configured BOM, flattened BOM, and as-built relationships;
- approved manufacturer and supplier-part lists;
- lifecycle states with role-bound transitions;
- formal engineering-change records;
- deviations, waivers, non-conformance, corrective action, and rework records;
- comparison between revisions and configured products;
- released-object immutability and supersession;
- supplier/manufacturer access to controlled packages rather than live unrestricted projects.

### V1 boundary

Native:

- items, parts, product structures, eBOM, changes, versions, review, release, and controlled sharing.

Later:

- full QMS, CAPA, service BOM, advanced effectivity, and enterprise ERP/MES depth.

---

## 5.3 Electronic architecture and AI-assisted design

### Benchmark applications

- Flux
- CELUS Design Platform
- Circuit Mind
- Altium Designer and Requirements Portal
- Cadence OrCAD X and Allegro X
- Siemens Xpedition

### Verified benchmark patterns

Flux places AI inside the project context and exposes schematic, PCB, library, inspector, simulation, collaboration, permissions, and automated version history in one browser experience. Its AI can understand schematic connectivity, component information, datasheets, and BOM context, then propose or perform changes with user approval.

Enterprise ECAD platforms add strong library governance, constraint systems, design reuse, analysis, collaboration, and manufacturing integration.

### Hardware Studio product requirements

Create a dedicated electronic-architecture layer containing:

- functional blocks and electronic subsystems;
- power sources, rails, loads, modes, and duty cycles;
- interfaces, protocols, bandwidth, voltage, current, direction, timing, and isolation;
- safety and protection requirements;
- environmental and mechanical dependencies;
- component-selection constraints;
- reference designs and reusable modules;
- allocation from system functions to circuits, components, firmware, and tests.

AI must:

- use exact project/version context;
- cite project objects, datasheets, simulations, and external sources;
- expose assumptions and missing information;
- generate typed reviewable proposals;
- never invent verified dimensions, availability, measurements, approvals, or test evidence.

---

## 5.4 Component intelligence and libraries

### Benchmark applications

- SnapMagic/SnapEDA
- Ultra Librarian
- Octopart
- SiliconExpert
- EasyEDA/LCSC integrations

### Professional patterns

A professional component record combines:

- manufacturer and part identity;
- electrical specifications and lifecycle;
- schematic symbol units and pin semantics;
- footprint, pads, courtyard, assembly, paste, mask, and origin conventions;
- exact or qualified package geometry and 3D model;
- simulation and IBIS/SPICE models where applicable;
- compliance and environmental data;
- supplier offers, stock, price, lead time, MOQ, and timestamp;
- alternates, qualification, and form-fit-function comparison;
- version, source, ownership, verification, deprecation, and update history.

### Hardware Studio product requirements

Build a versioned component-definition service with:

- controlled libraries and namespaces;
- symbol editor and validation;
- footprint and pad-stack editor;
- package and 3D alignment workflow;
- model-completeness and qualification states;
- datasheet and source provenance;
- manufacturer/supplier normalization;
- lifecycle, compliance, sourcing, risk, and alternate intelligence;
- project-instance synchronization and update review;
- explicit provisional data that cannot satisfy qualified checks.

---

## 5.5 Schematic capture, connectivity, ERC, and circuit simulation

### Benchmark applications

- KiCad
- Altium Designer
- Cadence OrCAD X
- Siemens Xpedition
- Flux
- EasyEDA Pro
- ngspice

### Verified benchmark patterns

KiCad’s schematic editor integrates drawing, footprint assignment, library management, and transfer to the PCB editor. It supports hierarchical schematics and `kicad-cli` can execute schematic ERC and exports. Flux combines project-context AI, library, inspector, schematic, simulation, and cloud synchronization.

### Authoritative model

The electrical source of truth must be a connectivity graph, not visual polylines. It includes:

- sheets and hierarchy;
- symbols, units, pins, and pin electrical types;
- ports, labels, buses, bus entries, and hierarchical interfaces;
- junctions, no-connect markers, power symbols, and net aliases;
- net classes and electrical constraints;
- connectivity from symbol pin to board pad;
- model assignments, simulation sources, probes, and conditions;
- findings, waivers, reviewers, and rule provenance.

### Hardware Studio product requirements

- multi-sheet hierarchy and reusable circuit modules;
- object tree, library browser, contextual inspector, findings panel, search, cross-probe, and rule manager;
- deterministic annotation and reference designators;
- robust wire editing and topology updates;
- ERC based on typed pin/connectivity rules;
- explicit model completeness for simulation;
- version-bound SPICE netlists and immutable simulation results;
- KiCad interchange and independent ERC comparison.

---

## 5.6 PCB layout, constraints, analysis, and manufacturing preparation

### Benchmark applications

- KiCad PCB Editor
- Altium Designer
- Cadence Allegro X
- Siemens Xpedition
- EasyEDA Pro
- Siemens Valor/PCBflow

### Verified benchmark patterns

KiCad’s PCB editor integrates placement, routing, footprint libraries, schematic synchronization, and DRC. Its CLI can run DRC and export fabrication and 3D data. Flux keeps PCB synchronized with schematic and simulation, with an object tree, project rules, selected-object rules, and AI context.

### Authoritative model

A board document requires:

- stable board identity and coordinate system;
- board outline and regions;
- stackup, layers, materials, thickness, copper weight, dielectric data, finish, and fabrication profile;
- footprints, pads, holes, vias, routes, arcs, zones, keepouts, dimensions, text, graphics, test points, and fiducials;
- nets, net classes, topology, connectivity, return-path and layer-transition information;
- physical, electrical, SI/PI, mechanical, thermal, reliability, test, and manufacturing constraints;
- variants and do-not-fit states;
- findings, waivers, rule source, and independent validation results.

### Hardware Studio workbench modes

1. Board setup and manufacturer profile.
2. Stackup and material editor.
3. Schematic synchronization and change review.
4. Component placement and rooms/regions.
5. Interactive routing and topology tools.
6. Planes, zones, pours, thermals, and keepouts.
7. Constraint/rule manager.
8. DRC and findings navigation.
9. Electrical and manufacturability analysis.
10. Output recipes, preview, comparison, and package release.

### Interchange and qualification

Support should be staged:

- KiCad project import/export and `kicad-cli` validation;
- Gerber X2, Excellon, BOM, position/CPL, IPC-D-356, drawings, and reports;
- IPC-2581 and ODB++ evaluation for intelligent manufacturing transfer;
- independent parser and viewer validation;
- manufacturer capability profiles and DFM reports;
- no fabrication-ready status from manual checkboxes alone.

---

## 5.7 Mechanical sketching, CAD, assemblies, drawings, and ECAD/MCAD

### Benchmark applications

- Onshape
- Autodesk Fusion
- FreeCAD
- PTC Creo
- Siemens NX/Designcenter
- SOLIDWORKS/xDesign
- Open CASCADE Technology

### Verified benchmark patterns

Onshape separates mutable workspaces from immutable versions and supports branches and explicit merge history. Professional CAD systems distinguish sketches, parameters, features, bodies, parts, assemblies, mates, configurations, drawings, and associative changes. Open CASCADE provides topological modeling algorithms and STEP read/write capabilities suitable for a CAD-kernel layer.

### Real 3D architecture

```text
Typed parameters and units
  → sketch entities and persistent constraints
  → solved profiles
  → parametric feature history
  → exact B-Rep bodies through CAD kernel
  → part and assembly instances
  → tessellation cache
  → Three.js viewport
  → drawings, analysis, and STEP/STL outputs
```

Three.js is responsible for:

- rendering;
- camera and standard views;
- picking and selection;
- visual highlighting;
- exploded and section views;
- annotations, measurements, comments, and collaboration presence.

The CAD kernel is responsible for:

- exact topology and geometry;
- sketch/profile operations;
- extrusion, cut, revolve, sweep, loft, hole, pattern, shell, fillet, chamfer, and boolean operations as supported;
- regeneration and feature failure diagnostics;
- exact mass properties, intersections, clearances, and interference;
- B-Rep persistence and STEP exchange;
- tessellation generation.

### Required object model

- document and modeling workspace;
- parameter and expression;
- sketch plane and datum/reference;
- line, arc, circle, ellipse, spline, construction geometry, and imported geometry;
- persistent geometric and dimensional constraint;
- solved profile and profile diagnostic;
- feature and dependency graph;
- body, part, material, appearance, and configuration;
- assembly instance, transform, mate, joint, interference, and exploded state;
- drawing sheet, view, section, detail, dimension, tolerance, note, and revision.

### ECAD/MCAD coordination

- stable board origin and coordinate system;
- exact board outline, holes, thickness, component transforms, keepouts, and height envelopes;
- component STEP/package model qualification;
- enclosure openings, mounting, clearances, flex regions, and mechanical constraints;
- change sets and review between electrical and mechanical domains;
- STEP and supported neutral-data exchange with semantic comparison.

---

## 5.8 Analysis and simulation

### Benchmark applications

- ngspice
- Ansys Electronics, SIwave, Icepak, and Mechanical
- COMSOL Multiphysics
- SimScale
- integrated Fusion, Creo, and NX analysis workflows

### Shared analysis model

Every analysis should record:

- definition and purpose;
- exact project, workspace, and version;
- selected source entities;
- input completeness;
- material and model assignments;
- boundary and initial conditions;
- parameter set and sweep;
- solver/adapter and version;
- execution environment and input hashes;
- progress, cancellation, logs, convergence, warnings, and unsupported constructs;
- immutable results, plots, tables, artifacts, and comparison;
- assumptions, reviewer, evidence classification, and stale status.

### Initial native or qualified analysis scope

- SPICE DC, AC, and transient analysis through ngspice;
- product power tree, operating modes, energy, efficiency, and battery estimates;
- PCB voltage-drop, current, temperature-rise, and documented rule calculations;
- exact mechanical interference and clearance;
- tolerance stack analysis;
- mass and center-of-mass from exact geometry and materials;
- basic thermal-network estimates;
- imported external-solver results with explicit provenance.

Simulation results must never be silently treated as physical validation.

---

## 5.9 Firmware, devices, debugging, and virtual hardware

### Benchmark applications

- PlatformIO
- STM32CubeIDE, CubeMX, CubeProgrammer, and CubeMonitor
- Zephyr
- ESP-IDF
- Wokwi

### Verified benchmark patterns

PlatformIO uses a real filesystem project with a root `platformio.ini`. It supports multiple environments, build configurations, build, upload, monitoring, debugging, and CI workflows. A reproducible build depends on exact project configuration, dependencies, source revision, environment, tool versions, logs, and artifacts.

### Hardware Studio product requirements

- filesystem-backed project tree;
- source, headers, libraries, configuration, scripts, generated files, and assets;
- environment and dependency management;
- editor, diagnostics, search, navigation, diff, terminal, build, test, upload, debug, and serial monitor;
- exact hardware mapping to component, pin, peripheral, alternate function, bus, address, interrupt, clock, DMA, voltage domain, and direction;
- mapping conflict detection and cross-probe to schematic/PCB;
- board/device registry and capability discovery;
- approval-bound flash, erase, reset, fuse/configuration, and destructive operations;
- durable operation IDs, logs, cancellation, retry, artifacts, and audit;
- distinction between simulator, emulator, HIL, and physical-device evidence.

### Local execution boundary

A desktop shell or secure local agent should handle:

- filesystem access;
- PlatformIO and vendor CLI processes;
- serial, debug, and device access;
- local CAD/EDA/simulation executables;
- instrument adapters;
- large file conversion and preview generation.

The browser must not directly receive arbitrary shell or filesystem capabilities.

---

## 5.10 Validation, test automation, reliability, and evidence

### Benchmark applications

- NI TestStand
- OpenTAP
- Polarion QA
- Jama test management
- Zephyr Twister
- Instrumental

### Verified benchmark patterns

OpenTAP’s model includes test plans, test steps, DUTs, instruments, resources, plugins, and result listeners. NI TestStand separates sequence development, execution, debugging, process models, reports, and parallel or batch testing. Instrumental emphasizes a serialized manufacturing data record connecting images, test results, and process history for every unit.

### Required object model

- validation strategy and requirement coverage;
- specification and procedure version;
- step, parameter, precondition, expected result, and failure handling;
- DUT, sample, lot, unit, fixture, instrument, equipment, and calibration;
- execution environment and operator;
- run and step state;
- measurement, units, limits, tolerance, uncertainty, and calculation;
- log, image, video, file, waveform, artifact, and evidence hash;
- finding, defect, deviation, waiver, review, sign-off, and retest;
- relation to exact product version, firmware build, device serial, and manufacturing state.

### Workbench modes

1. Validation planning and requirement coverage.
2. Test specification and procedure authoring.
3. Equipment, fixture, and DUT configuration.
4. Engineering execution mode.
5. Restricted operator mode.
6. Live measurements, logs, and evidence capture.
7. Failure triage and deviation workflow.
8. Review and immutable sign-off.
9. Retest and comparison.
10. Analytics, reliability, and production-quality views.

---

## 5.11 Manufacturing handoff, NPI, and as-built traceability

### Benchmark applications

- Siemens Valor and PCBflow
- MacroFab
- Instrumental
- Siemens Opcenter
- Tulip
- contract-manufacturer portals

### Product boundary

Manufacturing handoff, NPI, and MES are separate systems.

Hardware Studio’s early scope should include:

- output-package definition and validation;
- BOM normalization and sourcing review;
- manufacturer/factory capability profiles;
- quote/request packages and communication;
- build, lot, and serialized-unit records;
- process route and station plan;
- digital work-instruction references;
- inspection and test evidence;
- defect, non-conformance, deviation, and rework;
- as-built genealogy and firmware identity;
- feedback from production evidence to controlled product change.

A complete MES replacement is a later or integration-driven objective.

### Manufacturing package truthfulness

A package must be bound to an exact immutable version and record:

- source objects and hashes;
- export recipe and adapter version;
- units, origins, rotations, layer mappings, and coordinate systems;
- component and alternate decisions;
- drawings and assembly documentation;
- firmware and programming instructions;
- validation and qualification state;
- independent parser/viewer/DFM results;
- unsupported or lossy constructs;
- reviewer and release approval.

---

## 5.12 Interchange and standards

### Initial standards and formats

- ReqIF for requirements;
- KiCad project and library formats plus CLI validation;
- SPICE netlists and model libraries;
- IPC-2581, ODB++, Gerber X2, Excellon, IPC-D-356, BOM, and position/CPL;
- STEP for exact mechanical/product exchange;
- STL for mesh manufacturing with explicit loss of parametric/topological data;
- GLTF/GLB for visualization;
- DXF/SVG/PDF for supported sketch and drawing exchange;
- PlatformIO project configuration and filesystem structure;
- xUnit/JUnit-like automation records plus domain-specific test evidence.

### Common adapter contract

Every adapter must provide:

- capability and supported-version declaration;
- license and runtime requirements;
- security and permission requirements;
- import scan and staged preview;
- units, coordinates, origins, rotations, and conventions;
- deterministic mapping and source/destination identity;
- unsupported, lossy, provisional, and conflict reports;
- transaction through canonical commands;
- progress, cancellation, logs, retries, and artifacts;
- provenance, actor, tool version, and hashes;
- semantic round-trip comparison;
- independently verified fixtures.

---

## 6. All-in-one technical architecture

Hardware Studio should feel like one application while using several runtime layers.

## 6.1 Web application

Responsibilities:

- product and engineering workspaces;
- editors, inspectors, trees, findings, reviews, and dashboards;
- collaboration, comments, tasks, search, AI, and approvals;
- lightweight local cache and offline command queue;
- visualization and interaction with generated geometry or analysis results;
- no unrestricted local-shell or device capabilities.

## 6.2 Desktop shell or local engineering agent

Responsibilities:

- filesystem-backed projects;
- CAD kernel and geometry conversion;
- KiCad, PlatformIO, ngspice, OpenTAP, and future adapter execution;
- device, serial, debug, and instrument access;
- large import/export and preview jobs;
- local-model inference where configured;
- capability discovery, pairing, updates, health, logs, and revocation.

Security requirements:

- loopback or authenticated local transport;
- explicit pairing and device identity;
- operation-specific capability permissions;
- payload-bound, user-approved high-impact actions;
- workspace-root containment;
- executable and argument allowlists;
- operation logs, cancellation, expiry, and audit;
- no arbitrary shell endpoint.

## 6.3 Cloud platform

Responsibilities are split into independent services or modules rather than one generic backend issue.

### Identity and tenancy

- user identities and sessions;
- organizations, teams, invitations, service identities, and local agents;
- projects, workspaces, memberships, roles, groups, and permissions;
- MFA-ready controls, session revocation, and trusted approvals.

### Canonical repository

- PostgreSQL-backed canonical engineering metadata;
- product graph and indexed relationships;
- typed command and event log;
- optimistic concurrency;
- versions, branches, merges, and release records;
- repository contracts shared with local storage.

### Artifact platform

- S3-compatible object storage;
- resumable uploads;
- content hashes and deduplication without cross-tenant leakage;
- artifact metadata, provenance, preview, retention, quarantine, and signed access;
- CAD, simulation, evidence, firmware, drawing, and release-package objects.

### Durable jobs

- CAD regeneration;
- tessellation and previews;
- ERC/DRC;
- simulation;
- firmware builds;
- imports/exports;
- indexing;
- evidence processing;
- release packaging;
- cancellation, retries, idempotency, heartbeats, logs, progress, and version binding.

Temporal or a comparable durable workflow system should be evaluated because engineering operations can survive process crashes, infrastructure failure, and long execution times.

### Collaboration

- presence and selections;
- comments, reviews, mentions, notifications, and activity;
- selected collaborative text or tables;
- typed engineering commands for topology and controlled state;
- no whole-project generic CRDT as the engineering source of truth.

### Search

- exact identifier and part-number search;
- structured attribute filters;
- full-text documents and comments;
- relationship/path queries;
- evidence and artifact metadata;
- permission-scoped semantic retrieval;
- command palette and cross-probe.

Start with PostgreSQL indexing and full-text search. Evaluate OpenSearch only when scale and hybrid retrieval justify the operational cost.

### Audit and observability

- trusted actor/client/session identity;
- read/write/approval/device/release audit where required;
- OpenTelemetry traces, metrics, and logs;
- correlation IDs across browser, API, jobs, local agent, adapters, and artifacts;
- domain SLOs and operational alerts;
- privacy-safe diagnostics and support bundles.

### Recovery and operations

- backups and point-in-time restore;
- recovery drills;
- preview and development database branches;
- schema migrations and compatibility windows;
- environment separation;
- secrets, rate limits, feature flags, quotas, and deployment automation;
- data export, retention, deletion, and account/project closure.

### Technology evaluation direction

- PostgreSQL as the canonical relational and relationship store;
- Supabase as an early candidate for Auth, RLS, Storage, and Realtime evaluation;
- Neon-style database branching and point-in-time recovery for environments and recovery workflows;
- S3-compatible object storage for large artifacts;
- Temporal or comparable durable execution for engineering jobs;
- OpenTelemetry for vendor-neutral observability;
- Liveblocks/Yjs only where their collaboration semantics fit.

No provider decision is final until an ADR compares cost, portability, security, local-first operation, limits, and migration risk.

---

## 7. Canonical data and command architecture

## 7.1 Domain schema principles

- deterministic opaque IDs with explicit entity types;
- typed units and quantities;
- explicit ownership by organization, project, workspace, branch/version, board/part/assembly, and domain;
- no duplicate flat and nested representations of the same authoritative property;
- no optional “everything object” as the entire domain model;
- validated references and integrity constraints;
- explicit lifecycle and qualification states;
- schema versions and tested migrations;
- derived caches excluded from authoritative source data;
- provisional/fallback data separately classified and barred from qualified outputs.

## 7.2 Repository contract

The UI, local storage, cloud API, MCP, adapters, jobs, and tests should use one repository interface providing:

- load/query by project, workspace, version, entity, and relation;
- begin, validate, commit, and rollback transaction;
- typed command application;
- optimistic concurrency and conflict response;
- event and audit append;
- version and branch operations;
- artifact registration;
- subscriptions or invalidation events;
- backup/export and restore/import;
- migration and integrity diagnostics.

## 7.3 Typed command system

Every engineering mutation should use a typed semantic command containing:

- command type and schema version;
- actor, client, project, workspace, and base revision;
- exact payload;
- preconditions and permissions;
- expected affected domains;
- validation result;
- impact and stale set;
- transaction/event result;
- inverse/revert metadata where safe;
- audit and resulting version relation.

Examples:

- `CreateRequirement`
- `AllocateRequirement`
- `ApproveRequirementBaseline`
- `CreateComponentDefinitionRevision`
- `PlaceSchematicSymbol`
- `ConnectPins`
- `SynchronizeBoardFromSchematic`
- `PlaceFootprint`
- `RouteNetSegment`
- `CreateSketch`
- `AddSketchConstraint`
- `CreateExtrudeFeature`
- `UpdateFirmwareHardwareMapping`
- `StartValidationRun`
- `RecordMeasurement`
- `CreateEngineeringChange`
- `CreateReleaseCandidate`

Arbitrary root-level project patches must not be accepted by UI, MCP, AI, importers, or jobs.

## 7.4 Dependency and stale propagation

Relations should express dependency semantics such as:

- satisfies;
- verifies;
- allocated-to;
- represented-by;
- instantiated-from;
- connected-to;
- placed-as;
- modeled-by;
- built-from;
- tested-by;
- generated-from;
- supersedes;
- affected-by-change;
- approved-by.

A committed command should calculate a deterministic impact set and mark only affected derived outputs, analyses, builds, drawings, tests, candidates, and releases stale.

---

## 8. Information architecture and navigation

The current feature-list sidebar should be replaced only after workflow prototypes validate the model.

## 8.1 Navigation dimensions

### Product structure

- product;
- subsystem;
- item/part/assembly;
- board and circuit;
- firmware target;
- test article;
- build, lot, and serialized unit.

### Lifecycle

- Define
- Design
- Analyze
- Validate
- Prepare
- Release
- Build
- Observe

### Discipline

- Systems
- Components
- Electronics
- PCB
- Mechanical
- Firmware
- Analysis
- Validation
- Manufacturing

### Workspace state

- working workspace;
- branch;
- named immutable version;
- comparison;
- release candidate;
- release.

### Work queue

- assigned tasks;
- findings;
- stale outputs;
- reviews;
- approvals;
- conflicts;
- failed or blocked jobs;
- expiring data and sourcing risk.

## 8.2 Proposed shell regions

1. **Top context bar** — organization, project, workspace/version, sync/save, qualification, release state, and global actions.
2. **Lifecycle navigation** — Define, Design, Analyze, Validate, Prepare, Release, Build, Observe.
3. **Product/domain tree** — structure and objects appropriate to the active mode.
4. **Central editor** — context-sensitive workbench.
5. **Inspector** — properties, parameters, constraints, relations, representations, and provenance.
6. **Findings/review panel** — rules, issues, comments, tasks, approvals, and impact.
7. **AI/coprocessor panel** — exact context, sources, plan, proposals, and review.
8. **Bottom execution panel** — jobs, logs, terminal, serial, measurements, plots, or console where relevant.
9. **Global search and command palette** — object, identifier, relation, file, evidence, action, and navigation search.
10. **Cross-probe state** — selection and highlighting across requirement, schematic, PCB, 3D, firmware, validation, and release views.

## 8.3 Navigation rules

- every visible destination corresponds to a distinct user job and data model;
- no multiple navigation labels rendering the same generic component;
- every object has a stable route/deep link;
- browser back/forward and shareable links preserve project, workspace, view, object, panel, and comparison context;
- navigation never mutates the engineering project;
- every workbench shares save, command, selection, finding, review, and job patterns;
- operator and reviewer modes expose only necessary actions.

---

## 9. AI and MCP architecture

AI and MCP are capabilities over the product platform, not separate sources of truth.

### 9.1 Read workflow

AI should query structured repository services for:

- selected object and current project/version context;
- requirement, component, net, feature, file, test, artifact, and relation facts;
- findings, stale outputs, blockers, changes, and evidence;
- external component/datasheet/standards information with source and freshness.

### 9.2 Write workflow

```text
Understand intent
  → explain current context and missing facts
  → create ordered plan
  → generate typed command proposal
  → calculate deterministic diff and impact
  → user reviews assumptions, risk, and commands
  → trusted approval where required
  → transaction commit
  → run checks
  → record command, audit, outputs, and version
```

### 9.3 Safety boundaries

AI cannot create or falsify:

- trusted approval;
- reviewer identity;
- physical measurement;
- validation pass;
- DFM qualification;
- component availability or lifecycle fact without source/freshness;
- exact package/model dimensions without qualified data;
- device output that did not occur;
- release signature.

MCP tools must operate on the live authorized repository and typed commands. They must never shallow-merge arbitrary project patches or trust caller-supplied approval booleans.

---

## 10. Security and trust model

### 10.1 Security boundaries

- browser client;
- API and cloud repository;
- background workers;
- object storage;
- local engineering agent;
- external adapter executable;
- MCP or AI client;
- collaborator, supplier, or manufacturer;
- physical device or instrument.

### 10.2 Required controls

- authentication, MFA-ready sessions, revocation, and service identities;
- project/workspace/object authorization;
- least privilege and role separation;
- row/object/artifact access enforcement outside the UI;
- operation-specific approvals bound to actor, project, payload hash, capability, target, and expiry;
- secure local-agent pairing and capability revocation;
- executable, path, origin, and network allowlists;
- tenant isolation and identifier-guessing protection;
- signed URLs and content validation for artifacts;
- secrets management and redaction;
- audit trails for permission, approval, device, release, and sensitive artifact actions;
- rate limits and abuse protection;
- prompt-injection isolation for untrusted documents and external content;
- dependency, supply-chain, and update security;
- backup, restore, and incident response.

---

## 11. Non-functional requirements

The product must define measurable quality budgets before major implementation.

### Reliability

- no silent loss of canonical engineering data;
- transactional mutations;
- crash-safe local and cloud writes;
- job retries and idempotency;
- tested backup and restore;
- corruption detection and read-only recovery.

### Performance

Define reference-size budgets for:

- requirements and graph relations;
- schematic symbols/nets/sheets;
- PCB footprints/routes/zones/layers;
- CAD features, bodies, assembly instances, and tessellation;
- firmware files and logs;
- validation runs and evidence;
- artifacts and simultaneous collaborators.

Workbenches should use virtualization, selectors, workers, incremental indexes, and derived caches rather than broad whole-project subscriptions.

### Accessibility

- keyboard navigation and command workflows;
- WCAG-aligned contrast and focus;
- non-color-only findings;
- screen-reader semantics for tables/forms/work queues;
- reduced motion;
- scalable typography without overflow;
- accessible alternatives for canvas-only interactions where practical.

### Compatibility

- supported browser and desktop environments;
- versioned adapter and format support;
- project and schema migration policy;
- offline/local-only and cloud/shared behavior;
- clean-machine reproducibility.

### Truthfulness

Status vocabulary must distinguish:

- concept;
- provisional;
- foundation;
- partial;
- implemented;
- verified;
- independently qualified;
- released;
- unsupported;
- stale;
- blocked.

No generated file, green badge, manual checkbox, unit test, or demo can by itself imply engineering qualification.

---

## 12. Delivery phases and exit gates

## Phase 0 — Research, constitution, and reference product

Deliver:

- domain taxonomy;
- personas and permissions;
- benchmark teardowns;
- native-versus-adapter matrix;
- V1 user and reference product;
- product journeys;
- information architecture specification;
- truthfulness and qualification policy;
- architecture-decision backlog.

Exit gate:

- the product boundary is approved and every visible V1 workflow maps to a real object model and acceptance journey.

## Phase 1 — Canonical foundation

Deliver:

- normalized schema, IDs, units, statuses, ownership, and migrations;
- repository abstraction;
- durable local storage;
- typed commands, transactions, undo/revert, and impact;
- routes, shell, error boundaries, recovery, design system, and test infrastructure.

Exit gate:

- a reference project can be created, changed only through commands, saved, closed, reopened, migrated, backed up, restored, corrupted safely, and tested without data loss.

## Phase 2 — Cloud platform foundation

Deliver:

- Auth and sessions;
- organizations, teams, projects, workspaces, and permissions;
- PostgreSQL repository;
- artifact storage and uploads;
- jobs;
- realtime activity and comments;
- search;
- audit and approvals;
- observability, backups, deployment, and offline sync.

Exit gate:

- local and cloud repositories pass the same contracts, tenant isolation is proven, and a project synchronizes safely across authorized clients.

## Phase 3 — Product graph and components

Deliver:

- requirements, architecture, product structure, traceability, change, and stale propagation;
- component-definition and sourcing platform;
- review and version workflows.

Exit gate:

- one component or requirement change produces a deterministic cross-domain impact and review set.

## Phase 4 — Electrical vertical slice

Deliver:

- electronic architecture;
- authoritative schematic;
- component/symbol/footprint synchronization;
- PCB setup, placement, routing, rules, DRC, and outputs;
- KiCad round-trip and independent validation.

Exit gate:

- the reference product moves from component definitions through routed PCB and qualified outputs without manual JSON edits or board leakage.

## Phase 5 — Mechanical and real 3D

Deliver:

- sketcher and constraint solver;
- CAD-kernel adapter;
- feature history;
- parts, assemblies, mates, exact interference;
- ECAD/MCAD coordination;
- drawings and STEP/STL outputs.

Exit gate:

- the reference enclosure and assembly regenerate parametrically, use exact board/component geometry, and open correctly in an independent CAD tool/parser.

## Phase 6 — Firmware and devices

Deliver:

- filesystem project;
- hardware mapping;
- PlatformIO environment/build/upload/test;
- device registry, serial, logs, approval, and evidence.

Exit gate:

- exact source/environment builds, a supported device flashes after trusted approval, serial output is captured, and artifacts link to the product version.

## Phase 7 — Analysis, validation, and release

Deliver:

- analysis framework and initial adapters;
- validation authoring/execution/evidence/retest;
- change, versions, branches, comparisons, merges;
- release candidate and immutable artifacts;
- manufacturing package and NPI records.

Exit gate:

- a controlled change marks affected outputs stale, affected tests rerun, and an independently reviewed release package is reproduced from exact inputs.

## Phase 8 — AI, MCP, collaboration depth, and expansion

Deliver:

- live MCP repository and command tools;
- AI explain-plan-propose-review workflows;
- additional adapters, analyses, supplier/manufacturer integration, and advanced collaboration.

Exit gate:

- AI/MCP can perform a grounded proposal against the live reference product, the user reviews and applies it, and the operation appears in impact, audit, version, and undo/revert history.

---

## 13. Professional issue-decomposition rules

Every implementation issue created from this blueprint must contain:

1. Parent epic and dependencies.
2. Current problem and why it is a root cause.
3. User outcome and product behavior.
4. Domain objects and contracts affected.
5. UX and interaction states.
6. Data, migration, API, job, and artifact requirements.
7. Security, permission, approval, and audit requirements.
8. Failure, retry, cancellation, recovery, and conflict behavior.
9. Performance and accessibility requirements.
10. Automated and manual tests.
11. Explicit non-goals.
12. Completion guard preventing premature closure.

An issue must not close because:

- a type exists;
- a UI tab or button exists;
- a helper function exists;
- an isolated unit test passes;
- a file can be downloaded;
- a third-party executable was invoked once;
- documentation says the feature is complete.

Completion requires production UI, canonical repository integration, commands, persistence, error handling, security, tests, documentation, and evidence appropriate to the issue.

---

## 14. Official research references

### Connected ECAD and AI

- Flux AI-assisted hardware design: https://docs.flux.ai/tutorials/ai-for-hardware-design
- Flux Copilot: https://docs.flux.ai/reference/copilot
- Flux schematic editor: https://docs.flux.ai/reference/reference-schematic-editor
- Flux PCB editor: https://docs.flux.ai/reference/reference-pcb-editor
- Flux product/project model: https://docs.flux.ai/flux/Introduction/what-is-flux---draft-

### KiCad

- KiCad schematic editor: https://docs.kicad.org/9.0/en/eeschema/eeschema.html
- KiCad PCB editor: https://docs.kicad.org/master/en/pcbnew/pcbnew.html
- KiCad CLI: https://docs.kicad.org/10.0/en/cli/cli.html

### CAD and versioning

- Onshape versions and branches: https://cad.onshape.com/help/Content/Document/versions_and_history.htm
- Open CASCADE modeling algorithms: https://dev.opencascade.org/doc/occt-7.3.0/overview/html/occt_user_guides__modeling_algos.html
- Open CASCADE STEP translator: https://dev.opencascade.org/doc/overview/html/occt_user_guides__step.html

### Firmware

- PlatformIO project configuration: https://docs.platformio.org/en/latest/projectconf/
- PlatformIO run command: https://docs.platformio.org/en/latest/core/userguide/cmd_run.html
- PlatformIO project configuration inspection: https://docs.platformio.org/en/stable/core/userguide/project/cmd_config.html
- PlatformIO CI: https://docs.platformio.org/en/stable/core/userguide/cmd_ci.html

### Automated test and manufacturing evidence

- OpenTAP overview: https://doc.opentap.io/Developer%20Guide/What%20is%20OpenTAP/Readme.html
- OpenTAP resources: https://doc.opentap.io/Developer%20Guide/Resources/Readme.html
- OpenTAP result listeners: https://doc.opentap.io/Developer%20Guide/Result%20Listener/Readme.html
- NI TestStand overview: https://www.ni.com/teststand/whatis/
- NI TestStand sequence editor: https://www.ni.com/docs/en-US/bundle/teststand/page/teststand-sequence-editor.html/
- Instrumental product and traceability: https://instrumental.com/product/

### Cloud platform

- Supabase Auth: https://supabase.com/docs/guides/auth
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Storage: https://supabase.com/docs/guides/storage
- Supabase Realtime authorization: https://supabase.com/docs/guides/realtime/authorization
- Neon branching: https://neon.com/docs/guides/branching-intro
- Temporal durable execution: https://docs.temporal.io/
- OpenTelemetry: https://opentelemetry.io/docs/

### Existing broader source index

See `docs/research/HARDWARE_STUDIO_DOMAIN_TOOL_LANDSCAPE.md` for the wider requirements, PLM, component, simulation, manufacturing, standards, collaboration, and infrastructure tool list.

---

## 15. Final decision statement

The complete all-in-one vision is technically possible, including real working 3D models and connected engineering domains. It is only achievable if Hardware Studio is rebuilt as a platform of authoritative domain models and modular engines behind one product experience.

The execution priority is not to add more visible tabs. It is to establish product truth, canonical identity, durable repositories, typed commands, artifacts, jobs, permissions, and one independently qualified reference-product journey. Every later editor and integration must consume those foundations rather than creating another parallel model.
