# Hardware Studio — Safety and Limitations

**Safety reconciliation:** 2026-09-02  
**Current master at reconciliation:** `79902f6fceb0087e7f446960e9c8059841ba4daa`

## Important notice

Hardware Studio is experimental engineering software under active recovery and development.

It is **not currently suitable as the sole authority** for fabrication, production release, certification, regulatory evidence, safety-critical decisions, or unattended production device operations.

A coherent workbench, passing repository tests, generated artifact, local calculation, recorded evidence reference, status badge, or agent assertion does not by itself establish engineering qualification.

## Do not use current output directly for

- PCB fabrication orders without independent CAM/DFM review;
- enclosure machining, mould tooling, production fixtures, or tolerance signoff without exact CAD/drawing review;
- medical devices;
- automotive/aerospace safety systems;
- industrial safety controls;
- mains-voltage/high-energy safety systems;
- battery-protection systems without qualified review;
- certified radio products;
- regulated consumer products;
- certification or regulatory submissions;
- trusted production release approval;
- unattended production firmware flashing;
- any safety-critical product decision without qualified domain review.

## Current trust model

Hardware Studio contains several classes of engineering information. They must not be visually or verbally conflated.

### Canonical project state

Intended design state stored in the project/repository model.

Canonical state can still be incomplete or wrong. “Canonical” means source-of-truth ownership inside Hardware Studio, not independent engineering certification.

### Derived result

A result calculated from canonical state, such as a local rule check or coverage result.

Derived results are only authoritative within the implemented algorithm and input quality.

### Approximation / screening

A lightweight calculation intended to reveal likely problems, not certify absence of problems.

Current Mechanical AABB collision/clearance screening is an example.

### Draft / unqualified output

A generated file/report/package that has not passed the independent checks, provenance, review and release policy required for qualification.

Most current manufacturing/output paths are in this category.

### Reviewed evidence

Evidence that a person reviewed or attached to a workflow.

Current browser-project evidence is not automatically durable, hashed, version-bound or release-grade.

### Release-grade evidence/artifact

The long-term target: immutable, attributable, exact-source-bound, independently checked where required, and tied to a trusted release policy.

Hardware Studio does not yet provide this class comprehensively.

## Why current engineering outputs are not authoritative

Important systems remain incomplete:

- canonical schema/repository/command/event architecture;
- professional ECAD connectivity/routing/rule depth;
- exact mechanical sketch/CAD/assembly authority;
- reproducible firmware filesystem/build/device/serial operations;
- durable validation provenance and trusted review;
- immutable version/branch/merge/release semantics;
- qualified drawings/manufacturing packages;
- independent interchange/parser/tool verification;
- role/policy/security infrastructure for release decisions.

Some current workflows use bounded local rules, approximations, external metadata, or draft generators. These limitations must remain visible.

## Electronics / PCB limitations

Current PCB and schematic foundations must not be interpreted as equivalent to mature ECAD verification.

Before fabrication, independently verify at minimum:

- schematic correctness;
- component values/ratings and manufacturer part numbers;
- power/ground strategy;
- protection circuits;
- pin mapping and net connectivity;
- footprint/pad geometry;
- board outline/stack/layers;
- clearances/creepage where applicable;
- routing/vias/zones/planes;
- ERC/DRC using a qualified tool and appropriate rules;
- Gerber/Excellon/CAM outputs;
- assembly/pick-and-place orientation;
- fab/assembly-house DFM.

Hardware Studio's implemented local DRC rules only prove what those specific rules and inputs can detect.

## Mechanical limitations

Current 3D views are review/visualization foundations, not a qualified CAD-kernel authority.

Current local Mechanical screening can detect approximate bounding-box conflicts when sufficient explicit geometry exists. It cannot prove exact physical clearance.

Before tooling or production, independently verify:

- exact part/assembly geometry;
- dimensions/tolerances/fits;
- datums and drawing intent;
- wall thickness/features;
- fastening/mates;
- connector/button/sensor access;
- material/process constraints;
- thermal expansion/deformation where relevant;
- exact interference and required clearances;
- manufacturing feasibility.

Missing package/model dimensions must not be treated as successful clearance.

## Firmware and device-operation limitations

The converged Firmware UI distinguishes source/evidence more clearly, but #18 remains open for the complete execution infrastructure.

A recorded build/device evidence entry can be external metadata; it is not proof that Hardware Studio actually compiled, flashed, queried, or monitored a device.

Before trusting firmware evidence, verify:

- exact source/configuration/dependency state;
- compiler/toolchain and environment;
- build command/result/logs;
- artifact checksum;
- target board/device identity;
- upload target/port;
- boot/recovery/watchdog behavior;
- runtime/hardware behavior;
- preserved calibration/configuration.

### Firmware upload risks

Uploading firmware can:

- overwrite known-good firmware;
- target the wrong device;
- erase calibration/configuration;
- leave hardware unresponsive;
- activate connected outputs/actuators unexpectedly;
- alter power/safety behavior.

High-impact device operations should eventually require scoped, short-lived approval tied to exact project/version, environment, target device, port, operation and expiry.

## Validation limitations

U7 structurally separated **Define → Execute → Review**, but #19 remains open for release-grade validation infrastructure.

Current execution authority is intentionally bounded:

### DRC validation

Automated verdicts derive from the implemented local DRC rules only. They do not certify all electrical/manufacturing rules.

### Firmware state-machine validation

Automated checks validate structural reachability/transition properties only. They do not prove compilation, timing, runtime correctness, hardware behavior, safety behavior or device compatibility.

### Mechanical validation

The local screen is approximate AABB-based review. A detected collision can legitimately block the local screen; a clean screen does **not** auto-prove exact clearance. Exact CAD/physical evidence and engineer review are required for stronger claims.

### Thermal validation

Hardware Studio currently has no internal thermal solver. Thermal verdicts require external simulation/lab evidence and reviewer attribution.

### Other manual/physical validation

An arbitrary text observation or measurement alone must not auto-pass a test. An explicit engineer verdict and appropriate evidence are required.

### Evidence limitations

Current run/evidence records are not yet guaranteed to provide all of:

- durable content hashes;
- exact product-version binding;
- immutable procedure version;
- DUT/sample identity;
- operator/environment identity;
- equipment and calibration traceability;
- uncertainty/statistical treatment;
- trusted role-aware reviewer signoff;
- tamper-evident audit;
- deterministic stale propagation.

Do not use current validation records as certification/QMS evidence without independent controls.

## Release/version limitations

U8 is currently converging Release UX. #20 remains open for the real version/release engine.

Current revision snapshots/status surfaces must not be described as equivalent to:

- content-addressed immutable versions;
- explicit branch ancestry;
- domain-aware comparison;
- true base/source/target merge with conflict resolution;
- repository-enforced freeze;
- trusted approval bound to exact candidate hash;
- immutable published release;
- controlled supersession/withdrawal.

A JSON snapshot is not automatically a professional version. A status toggle is not automatically a trusted approval.

## Drawings and manufacturing-package limitations

#21 remains open for qualified outputs.

Current or future generated files may include:

- PCB layer/fabrication drafts;
- drill data;
- BOM/CPL/netlist data;
- blueprint/drawing sheets;
- firmware packages;
- validation reports;
- factory-package ZIPs;
- release manifests.

Until qualified, they must remain clearly classified as draft/unqualified/needs review.

A successful generator process is not verification.

Professional output qualification requires the relevant combination of:

- exact canonical source data;
- explicit source version;
- generator/tool version;
- input/output hashes;
- units/origin/reference metadata;
- unsupported-construct reporting;
- independent parser/viewer checks;
- engineering review;
- DFM/interchange checks;
- trusted approval bound to exact manifest;
- immutable release integration.

## Local bridge risks

The local bridge can execute machine-level processes and therefore requires a stronger security boundary than ordinary browser state.

Required/target protections include:

- loopback-only binding;
- mandatory session authentication;
- strict origin allowlist;
- canonical workspace root;
- path containment validation;
- argument-array process spawning;
- no arbitrary shell endpoint;
- operation-scoped approvals;
- explicit target/device/port binding;
- operation logs;
- cancellation/recovery;
- durable project/version evidence linkage.

Do not expose the bridge to an untrusted/public network.

## MCP / AI risks

MCP and AI should never receive implicit authority to create engineering truth.

Recommended capability levels:

1. read-only inspection;
2. reversible draft proposal;
3. reviewed project mutation through typed commands;
4. explicitly approved high-impact machine/release action.

AI/MCP must not silently invent:

- dimensions/geometry;
- board placement/routing evidence;
- component qualification;
- firmware execution proof;
- validation evidence;
- equipment/calibration records;
- reviewer identity;
- manufacturing qualification;
- release approval.

Every meaningful applied mutation should eventually have an auditable source/actor/command/repository record.

## Data, privacy and durability

Hardware Studio follows a local-first direction, but current local/project infrastructure is still under recovery.

Users should not assume current development builds provide:

- encrypted-at-rest project storage;
- enterprise backup/recovery guarantees;
- hardened multi-user isolation;
- complete access-control policy;
- secure collaboration/cloud synchronization;
- tamper-evident audit across all domains;
- disaster recovery.

Do not place sensitive production IP in the development build without understanding the actual current storage/deployment environment.

## Required independent review before physical action

Depending on the product, independent review may include:

### Electrical

- schematic/ERC;
- component ratings/derating;
- power integrity/grounding;
- protection/safety;
- signal integrity/EMC where applicable;
- PCB DRC/CAM/DFM.

### Mechanical

- exact CAD;
- dimensions/tolerances/fits;
- materials/process;
- interference/clearance;
- thermal/environmental conditions;
- drawings/tooling review.

### Firmware

- reproducible build;
- target/device verification;
- runtime behavior;
- recovery/failsafe/watchdog;
- security and update process.

### Validation

- procedure/version;
- equipment/calibration;
- measurements/tolerances/uncertainty;
- evidence provenance;
- reviewer decision;
- retest/deviation history.

### Manufacturing / release

- exact version/source baseline;
- complete qualified output package;
- independent format checks;
- DFM/assembly review;
- trusted approvals;
- release manifest/checksums;
- applicable regulatory/certification process.

## Reporting a safety or security issue

When reporting a concern:

- describe the affected workflow and exact version/commit when possible;
- provide reproducible steps;
- explain possible consequences;
- distinguish observed behavior from speculation;
- do not publish active credentials, device secrets or private product data;
- clearly label safety/security relevance.

Do not describe a safety-sensitive workflow as verified unless the supporting evidence is reproducible and appropriate to the claim.

## Final rule

Hardware Studio should make uncertainty and missing evidence more visible, not less. When the system cannot support a strong engineering claim, the correct behavior is to say **unknown, approximate, draft, needs review, or blocked**—not to manufacture confidence.
