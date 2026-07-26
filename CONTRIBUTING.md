# Contributing to Hardware Studio

Thank you for helping build Hardware Studio.

This project has a large long-term vision, but contributions should prioritize truthful, connected engineering behavior over feature count.

## Before contributing

Read:

- [Product Vision](docs/PRODUCT_VISION.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Current Status](docs/CURRENT_STATUS.md)
- [Roadmap](docs/ROADMAP.md)
- [Safety and Limitations](docs/SAFETY_AND_LIMITATIONS.md)

## Core contribution rule

A feature is not complete because:

- a TypeScript interface exists
- a helper function exists
- a test creates an object
- a UI tab or button exists
- an SDK dependency is installed
- documentation describes the intended behavior
- lint, typecheck, or build passes

A completed vertical slice should normally include:

1. domain model
2. production engine
3. command/store integration
4. production UI
5. persistence
6. undo/redo where applicable
7. cross-domain staleness or impact
8. automated tests using production code
9. documentation and current-status update

## Do not overstate completion

Do not use commit messages or documentation such as:

- complete professional implementation
- production ready
- fully integrated
- fabrication ready
- all gates pass

unless the real production workflow and evidence support the claim.

Use precise language:

- foundation
- partial implementation
- experimental
- needs review
- blocked
- verified in a specific workflow

## No browser automation dependency

Do not add:

- Playwright
- Puppeteer
- Cypress
- Selenium
- WebdriverIO
- Chromium test downloads

Use:

- Vitest
- React Testing Library where useful
- Zustand integration tests
- Node process tests
- MCP protocol tests
- deterministic geometry tests
- serializer tests
- manual development-build verification

## Development setup

```bash
npm install
npm run dev
```

Application routes:

```text
/          public landing page
/studio    experimental engineering workspace
```

Verification:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Dedicated MCP and bridge scripts should be added as those package boundaries mature.

## Architecture expectations

### One canonical product document

Do not create private duplicate domain state inside a component when it belongs in the project graph.

### Typed engineering commands

User and MCP mutations should share typed domain operations.

### Reversible changes

Pointer interactions should follow:

```text
begin
→ transient preview
→ commit once
→ persist
```

### Derived outputs

Changes to source engineering data should mark affected blueprints, manufacturing packages, validation results, or releases stale.

### Missing data

Do not silently invent authoritative engineering values.

For example, missing package dimensions should create a warning or blocker—not a successful collision result based on guessed geometry.

## Testing expectations

Tests must exercise production behavior.

Avoid tests that:

- manually create the final state and claim the UI created it
- redefine a simplified version of production logic inside the test
- check only that a value is defined
- accept an empty array as success
- instantiate an MCP class without testing the protocol
- inspect a disclaimer string as proof of live-data synchronization

Good tests assert exact state transitions and outputs.

Examples:

- exact pointer-down, committed, undo, and redo coordinates
- exact source and target schematic anchors after symbol rotation
- empty-space PCB route rejection through the production routing controller
- active-board output excluding every object from other boards
- missing package dimensions producing a blocker
- MCP draft causing no mutation before apply
- MCP apply changing the durable project through the command layer
- known SHA-256 fixture matching the generated digest

## Engineering safety

Never remove review warnings from generated manufacturing output merely to make the product appear more complete.

Manufacturing drafts must continue to require:

- independent engineering review
- Gerber/CAM viewer review
- fab-house DFM validation
- verified footprints and package geometry
- prototype testing

## Pull request structure

A focused pull request should include:

- problem statement
- affected domains
- production files changed
- user workflow
- persistence behavior
- undo/redo behavior
- tests
- known limitations
- screenshots or logs where helpful

## Suggested commit style

```text
feat(pcb): preserve structured route anchors
fix(bridge): bind approvals to upload target
refactor(commands): share pointer transaction controller
test(mcp): verify real stdio draft and apply workflow
docs(status): record remaining validation limitations
```

Avoid `complete`, `final`, or `production-ready` unless the scope is narrow and fully evidenced.

## Areas where help is valuable

- product-graph design
- schema migrations
- command and history architecture
- computational geometry
- schematic connectivity and ERC
- PCB graph routing and DRC
- 3D geometry synchronization
- PlatformIO and serial tooling
- validation execution and evidence models
- revision and release systems
- MCP safety and typed tools
- deterministic blueprint and manufacturing generators

## Questions and design discussions

For large architectural changes, open an issue or discussion before implementing a broad rewrite. Explain:

- the engineering problem
- the proposed domain model
- how it interacts with the canonical graph
- migration impact
- undo/redo behavior
- safety implications

Hardware Studio should grow through deep connected workflows, not another layer of disconnected feature shells.
