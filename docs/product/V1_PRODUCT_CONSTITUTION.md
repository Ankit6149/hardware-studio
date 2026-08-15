# Hardware Studio V1 Product Constitution

**Status:** Active V1 scope authority  
**Adopted:** August 15, 2026  
**Applies to:** product scope, workbench claims, engineering trust, issue sequencing, UI/navigation decisions, adapters, validation, and release language

This document answers one question before more screens or engines are added: **what complete product are we actually trying to finish first?**

It is intentionally narrower than the long-term Hardware Studio vision. The long-term goal remains a unified environment for physical-product engineering. V1 proves that idea with one bounded product class and one connected lifecycle rather than shallow coverage of every professional CAD/EDA/PLM capability.

## 1. Primary V1 user

The primary V1 user is a **solo product engineer or small multidisciplinary hardware team (roughly 1–5 people)** building a small embedded electronic product.

The product should be usable by someone who can reason about hardware but does not want to manually maintain disconnected requirements documents, component spreadsheets, schematic/PCB context, firmware notes, validation evidence, and release files.

V1 is not designed first for enterprise PLM administrators, high-end mechanical CAD specialists, semiconductor design teams, safety-certified product organizations, or high-volume factory operators.

### Primary job

> Take a bounded embedded-product idea from requirements through electrical design, enclosure/assembly context, firmware, validation, and a reviewed release package while keeping the same product objects connected and traceable.

## 2. Reference product

V1 is proven against one reference product: a **USB-C powered desktop environmental status node**.

The reference product contains:

- one programmable MCU/module;
- USB-C 5 V input;
- input protection and 3.3 V regulation;
- one I2C environmental sensor;
- one user button;
- one RGB/status LED and optional buzzer/haptic output;
- programming/debug connector;
- a custom two-layer PCB;
- mounting holes and board outline;
- a small enclosure with USB opening, sensor ventilation, button/light opening, mounting features, and PCB clearances;
- firmware with boot, self-check, idle, sample, alert, and fault states;
- measurable requirements and validation tests;
- BOM, placement, PCB outputs, enclosure output, firmware build evidence, validation evidence, and one immutable candidate/release package.

This product is deliberately complex enough to exercise the whole environment but small enough that one authoritative implementation can be finished and tested end to end.

## 3. V1 lifecycle

The product must support this connected journey without relying on fake data or unrelated fallback screens:

1. Define product intent, measurable requirements, risks, and interfaces.
2. Build system architecture and allocate requirements to real product objects.
3. Select/create components with symbol, footprint, package, sourcing, and representation state.
4. Create the schematic using canonical component and net identity.
5. Move the same components/nets into a board context and complete PCB placement/routing/DRC foundations.
6. Define board outline, mounting, enclosure geometry/clearances, and assembly context.
7. Map firmware to hardware, build source/state-machine configuration, and record build/device evidence through approved local tooling.
8. Define validation tests, execute them, attach measurements/evidence, record failures/retests, and trace results to requirements.
9. Generate reviewed outputs from explicit real engineering state only.
10. Create an immutable candidate/release record with exact artifacts, hashes, blockers, approvals, and lineage.

A screen existing for each step is not success. **The same objects must remain connected across the journey.**

## 4. V1 capability boundary

| Domain | V1 classification | V1 decision |
|---|---|---|
| Requirements / product architecture | Native authoritative | Structured requirements, interfaces, risks, architecture objects, trace links, impact/stale state. Not full SysML/enterprise MBSE. |
| Product structure / BOM / change | Native bounded | Product parts/components/BOM, revisions and traceable engineering changes required for the reference product. Not enterprise PLM/QMS. |
| Component library | Native authoritative foundation | Canonical component identity with linked schematic, footprint, package/3D, sourcing and provenance representations. Missing representations stay unresolved. |
| Schematic | Native V1 | Real component pins, nets, wiring, connectivity, selection/cross-probe and bounded ERC. No claim of Altium/KiCad feature parity. |
| PCB | Native V1 foundation | Real board identity, placements, traces/vias/layers/outlines, bounded DRC and outputs for the reference two-layer board. No guessed board/placement data. |
| KiCad interoperability | Qualified adapter target | Use import/export/independent checks where practical; KiCad remains an external qualification reference rather than something to copy visually. |
| Mechanical 2D / enclosure | Native bounded | Board/enclosure dimensions, mounting, openings, clearances, simple constrained geometry required by the reference product. |
| Exact CAD / STEP solids | Adapter/kernel-backed V1 boundary | Exact-solid authority requires a qualified CAD/kernel path. Three.js is visualization only. Advanced surfacing and enterprise CAD are later. |
| 3D visualization | Native visualization | Lightweight assembly/representation view, explicit trust state, on-demand rendering. Never substitutes for exact CAD. |
| Firmware | Native workspace + qualified local adapter | Source/state/configuration/hardware mapping in Hardware Studio; real build/upload/serial operations through approved local tooling such as PlatformIO. |
| Simulation | Limited / adapter-led | Only simulations that have explicit models and qualified engines. No broad “simulation complete” claim. |
| Validation | Native authoritative | Test specifications, runs, measurements, evidence, failures, retests and requirement coverage for the reference product. |
| Manufacturing outputs | Native draft/qualified boundary | Generate only from explicit real board/component geometry and identities. Outputs remain blocked from “verified” until independent checks pass. |
| NPI / MES / factory execution | Later | Handoff metadata may exist, but full lots, stations, genealogy, operator execution and MES are not V1. |
| Version / candidate / release | Native bounded | Exact immutable versions/candidates/releases, artifact hashes, stale/blocker rules and supersession for the reference workflow. |
| Collaboration / organizations | Later after local reference flow | V1 architecture must not block it, but real-time multi-user collaboration is not allowed to delay the first complete local workflow. |
| MCP / AI | Read/propose-first V1 | Read live project context, explain, plan and propose typed changes. Human approval remains required for high-impact writes. AI/MCP never creates engineering truth by guessing. |

## 5. Explicit non-goals for V1

The following are not allowed to expand V1 scope:

- replacing SolidWorks, Fusion, Onshape, KiCad, Altium, Creo, NX, Teamcenter, Windchill, TestStand or a MES;
- advanced surfacing, sheet metal, complex assemblies, generative CAD or full drawing standards;
- multilayer/high-speed/RF PCB qualification beyond the reference-product needs;
- safety-certified, medical, automotive, mains-powered, aerospace or regulated-product release claims;
- enterprise PLM, ERP, supplier portals, configured manufacturing BOMs, effectivity, CAPA or full QMS;
- arbitrary AI-generated dimensions, footprints, placements, test evidence or release approvals;
- real-time collaboration before the local canonical repository/command/version model is trustworthy;
- adding more top-level workbench destinations simply because a professional benchmark tool has them.

## 6. Engineering truth rules

These are hard product invariants.

1. **Unknown stays unknown.** Missing dimensions, placements, identities, models, evidence or ownership must not be replaced with convenient values.
2. **No synthetic identity.** Runtime code must not silently create `board-main`, `board_main`, `board_0`, `block_0`, or equivalent fallback ownership.
3. **Zero is valid data.** Coordinate 0 must not be interpreted as “missing.”
4. **UI layout is not engineering geometry.** Canvas pixels, card positions, generic rectangles and visual previews cannot become manufacturing coordinates or CAD truth.
5. **Three.js is not the CAD kernel.** It may render qualified geometry or clearly marked provisional envelopes only.
6. **One canonical object, many representations.** Architecture icon, schematic symbol, footprint, package geometry, 3D model and educational image must link to one component identity, not create parallel components.
7. **Board-bound data is board-isolated.** Components, traces, vias, drills, outlines, keepouts, rules and exports must belong to a real board and must never leak between boards.
8. **Generated is not verified.** A file existing does not make it fabrication-ready, validated or released.
9. **A user action must be explainable and reversible where safe.** Engineering writes move toward typed commands, explicit impact and auditable history.
10. **No duplicate production engine.** Improve, migrate or replace the authoritative path; do not keep old and new implementations side by side indefinitely.

## 7. Qualification vocabulary

Use these terms consistently in UI, docs, issues and release language.

- **Absent** — no production implementation.
- **Prototype** — useful experiment or UI/engine exists, but it is not a trusted workflow.
- **Connected foundation** — production path exists and shares canonical state with adjacent stages, but qualification gaps remain.
- **Implemented** — the bounded production behavior exists and passes its native acceptance tests.
- **Verified** — implemented behavior has recorded production-workflow evidence and persistence/reload checks.
- **Independently qualified** — output/behavior has also passed an independent tool/parser/engine or controlled hardware check appropriate to the domain.
- **Released** — immutable approved version with exact artifacts, hashes, evidence and no unresolved release blockers.
- **Stale** — previously valid derived data whose upstream dependency changed.
- **Blocked** — cannot truthfully continue until missing/invalid upstream state is resolved.
- **Unsupported** — intentionally outside the declared product boundary.

`Generated`, `rendered`, `test passed`, `agent verified`, `screen exists`, and `looks correct` are not qualification states.

## 8. Supported V1 scale

The first production target is deliberately modest:

- 1 project actively open at a time;
- 1–5 engineering users as the design target, with the first complete workflow optimized for one local author;
- 1–3 boards per project, with the reference product using one board;
- reference PCB: two layers, tens to low hundreds of components/nets rather than enterprise board scale;
- one small enclosure/assembly with bounded part count;
- firmware project suitable for an MCU-class embedded application;
- validation program with tens to low hundreds of tests/evidence records;
- desktop/laptop web workspace as the primary UI; secure local agent/desktop boundary where filesystem/device/process access is required.

Performance claims beyond these bounds require measured fixtures before they become product commitments.

## 9. Repository-surface disposition rule

Existing code is evaluated by whether it helps the reference lifecycle.

- **Keep** when it is the authoritative production path and respects the truth rules.
- **Consolidate** when multiple surfaces represent the same job or object.
- **Migrate** when useful behavior exists on a legacy model that must move to the canonical one.
- **Hide** when the capability is planned but currently misrepresents product readiness.
- **Delete** when generated, dead, duplicate or obsolete code adds ambiguity without unique value.

Tests do not preserve a dead engine merely because they currently exercise it.

## 10. Completion gates

A V1 domain is not complete until all applicable gates pass:

1. bounded user decision/job is defined;
2. canonical objects and ownership are defined;
3. real UI uses the authoritative production engine;
4. no fake data or identity is required for the happy path;
5. persistence/reload preserves exact state;
6. undo/revert/impact behavior is correct where applicable;
7. cross-domain links update or become stale deterministically;
8. automated tests exercise the production path;
9. the reference-product journey exercises the behavior end to end;
10. safety/qualification language matches evidence;
11. CI and deployment pass;
12. old duplicate production path is removed or explicitly migration-only.

## 11. Immediate sequencing rule

Until the reference lifecycle is trustworthy, work should follow this order:

1. product/schema/identity/storage/command truthfulness;
2. shell/context consolidation;
3. one complete electronics vertical slice: component → schematic → PCB → BOM → representations;
4. bounded enclosure/assembly integration;
5. firmware/device evidence;
6. validation/retest evidence;
7. truthful manufacturing/release boundary;
8. only then broaden collaboration, MCP/AI writes, simulation breadth, enterprise lifecycle and additional editors.

This order may be refined by evidence, but broad feature expansion must not bypass foundation failures.

## 12. Definition of V1 success

V1 succeeds when a new project can build the reference environmental status node from requirements to an immutable reviewed release **without invented engineering facts, duplicate object identity, hidden board leakage, disconnected workbench state, or misleading readiness claims**.

The long-term vision can remain much larger. V1 earns the right to expand by making this one connected product lifecycle real first.
