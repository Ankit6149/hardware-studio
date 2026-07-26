# Safety and Limitations

## Important notice

Hardware Studio is experimental software under active development.

It is not currently suitable for direct production, fabrication, certification, or safety-critical engineering decisions.

## Do not use current output directly for

- PCB fabrication orders
- enclosure machining or mould tooling
- medical devices
- automotive safety systems
- aerospace systems
- industrial safety controls
- mains-voltage products
- battery-protection systems
- certified radio products
- regulated consumer products
- production firmware flashing

## Why the current outputs are not authoritative

Several engineering systems remain partial, including:

- electrical connectivity
- PCB routing and DRC
- multi-board isolation
- mechanical dimensions and constraints
- package and board geometry
- collision and clearance calculations
- firmware operation history
- validation evidence and tolerances
- release eligibility
- manufacturing export completeness

Some current workflows may use approximations, fallback values, or incomplete dependency tracking.

## Manufacturing drafts

Generated files may include planning versions of:

- Gerber copper layers
- board outlines
- drill files
- BOM files
- CPL files
- netlists
- blueprint sheets
- release manifests

These files must remain labelled as:

- Generated In App
- Draft
- Needs Independent Review
- Needs Gerber Viewer Review
- Needs Fab-House DFM Validation

A generated file is not a verified file.

## Required independent review

Before any prototype or production action, obtain appropriate review for:

### Electrical

- schematic correctness
- component ratings
- pin mappings
- power integrity
- grounding
- signal integrity where applicable
- protection circuits
- ERC and DRC

### Mechanical

- dimensions
- tolerances
- material selection
- wall thickness
- fastening
- clearances
- thermal expansion
- ingress protection where applicable

### Firmware

- target environment
- board and framework configuration
- build output
- upload target
- boot and recovery behavior
- safety and watchdog logic

### Manufacturing

- Gerber viewer inspection
- drill alignment
- solder-mask and paste layers
- component rotations
- BOM manufacturer part numbers
- CPL coordinates and side
- fab-house DFM
- assembly-house review

### Validation

- test procedure
- equipment calibration
- measurement units
- tolerances
- evidence
- reviewer decision
- retest history

## Local bridge risks

The local bridge can execute machine-level operations such as PlatformIO commands.

Safe operation requires:

- loopback-only binding
- mandatory session authentication
- strict path containment
- argument-array process execution
- no arbitrary shell endpoint
- explicit approvals for high-impact operations
- correct device and port selection
- operation logs
- cancellation support

Do not expose the bridge to a public network.

## Firmware upload risks

Uploading firmware can:

- overwrite working firmware
- target the wrong device
- leave hardware unresponsive
- affect connected actuators or power systems
- erase calibration or configuration

Firmware upload should require a scoped, short-lived approval tied to:

- project
- environment
- target device
- serial port
- operation
- expiry

## MCP risks

MCP tools should not provide unrestricted access to project or machine operations.

Recommended permission levels:

1. read-only inspection
2. reversible draft proposals
3. approved project mutations
4. explicitly approved machine or release actions

Every mutation should create an audit record.

## Data and privacy

The project follows a local-first direction, but the current browser implementation may use localStorage and development-only process boundaries.

Users should not assume:

- encrypted storage
- multi-user isolation
- secure collaboration
- backup guarantees
- cloud synchronization
- enterprise access controls

Do not store sensitive production IP in the development build without understanding the current storage implementation.

## Reporting a safety issue

When reporting a safety or security concern:

- describe the affected workflow
- include reproducible steps
- explain possible consequences
- avoid publishing active credentials or private product data
- clearly label the issue as security or safety relevant

Do not describe a safety-sensitive workflow as verified unless the evidence is available and reproducible.
