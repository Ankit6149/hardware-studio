# Hardware Studio MCP Tool Reference

The V1 MCP surface is intentionally narrow: read the connected product lifecycle, create reversible proposals, and apply only after host-side human approval. It does not pretend to be a full autonomous CAD/EDA operator.

## Read tools

- `get_product_summary` — Current project identity and counts. Missing hardware remains missing; no fallback board is invented.
- `get_requirements` — Canonical product requirements.
- `get_architecture` — Product architecture nodes and connections.
- `get_mechanical_layout` — Mechanical objects, bodies, zones, and assembly layers.
- `get_components` — Canonical component instances and BOM linkage.
- `get_schematic` — Nets, schematic wires/symbols, and pad/net assignments.
- `get_pcb_status` — Active board identity, routing counts, and DRC evidence.
- `get_firmware_evidence` — Firmware modules, behavior/state machine, configuration, source files, and recorded build evidence.
- `get_validation_status` — Validation definitions plus append-only run/retest history.
- `get_change_queue` — Pending/applied/rejected proposals, current host-approval state, and audit count.

## Reversible collaboration tools

### `draft_requirement`
Creates a pending requirement proposal. It does **not** add a requirement to canonical project state until the host records human approval and `apply_draft` succeeds.

Supported proposal fields include title, description, requirement type, priority, acceptance criteria, and proposer identity.

### `apply_draft`
Consumes a previously recorded **host-side** approval and applies the proposal. The MCP caller cannot authorize itself by passing `userApproved`, `approved`, or a similar argument.

For requirement proposals, the result is a canonical `ProductRequirement` with proposal/reviewer provenance. Generic engineering proposals are restricted to safe metadata; structural project arrays cannot be replaced through a generic patch.

### `reject_engineering_change`
Marks a pending proposal rejected without changing engineering state.

## Host-only approval API

`HardwareStudioMCPServer.approveProposal(proposalId, reviewerIdentity)` is deliberately **not** an MCP tool. The embedding Hardware Studio UI/host calls it after a human reviews the proposed change. The approval is consumed when the proposal is applied and is not silently restored after server restart.

## Resources

- `hardware-studio://product/current`
- `hardware-studio://product/graph`
- `hardware-studio://requirements`
- `hardware-studio://mechanical`
- `hardware-studio://schematic`
- `hardware-studio://pcb`
- `hardware-studio://firmware`
- `hardware-studio://validation`
- `hardware-studio://changes`
- `hardware-studio://revisions`
- `hardware-studio://releases`
- `hardware-studio://audit`

## Not exposed as autonomous MCP mutations

Direct component deletion, release publication, fabrication approval, firmware build/flash claims, broad project-array replacement, and unrestricted CAD/EDA mutations are not normal V1 MCP tools. Those operations require domain-specific product actions and evidence/approval boundaries before they can safely be widened.
