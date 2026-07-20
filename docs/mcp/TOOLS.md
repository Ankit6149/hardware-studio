# Hardware Studio MCP Tool Reference

## Read Tools
- `get_current_product` — Returns current project metadata (name, version, view).
- `get_product_graph` — Returns requirement implementation & test coverage matrix.
- `get_requirements` — Returns list of product requirements.
- `get_components` — Returns board components and placements.
- `get_boards` — Returns list of PCB boards and stackups.
- `get_firmware_modules` — Returns firmware modules and state machines.
- `get_validation_tests` — Returns validation plan and test run measurements.

## Reversible Draft Tools
- `draft_requirement` — Proposes a new requirement draft.
- `draft_architecture_node` — Proposes a new architecture block.
- `draft_pcb_placement` — Proposes a component placement shift.
- `apply_draft` — Applies a reviewed draft proposal ID to active project state.

## High-Impact Approval Tools
- `create_release` — Promotes candidate to immutable release (requires signoff approval).
- `build_firmware` — Triggers PlatformIO firmware build.
