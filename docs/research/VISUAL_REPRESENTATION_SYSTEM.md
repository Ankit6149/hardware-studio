# Hardware Studio visual representation system

Status: implemented first production vertical slice in `feature/visual-representation-system` for issue #60.

## Product decision

Hardware Studio must not use one visual language for every engineering concept.

A system function, firmware state, electrical symbol, PCB footprint, educational illustration, package envelope, exact CAD body, lightweight render mesh, and supplier photo are different representations with different responsibilities and trust levels. They can be linked to one identity, but one representation must never silently substitute for another.

The System Blueprint is a system-architecture editor. It is not a schematic editor, PCB editor, breadboard diagram, or mechanical CAD workbench.

## Representation contract

| Representation | Primary purpose | Engineering authority |
| --- | --- | --- |
| Architecture | Recognize a function/device and understand typed interfaces | Semantic system communication only |
| Schematic | Electrical connectivity, pins, units, fields, and ERC | Authoritative only when supplied by a reviewed component revision |
| Pictorial | Onboarding, identification, and educational wiring context | Educational only |
| Footprint | Pads, drills, mask/paste, courtyard, origin, and PCB placement | Authoritative only when supplied by a reviewed footprint revision |
| Package | Dimensions, height, tolerances, mounting, orientation, and keepouts | Authoritative only when exact selected-part package data exists |
| Lightweight 3D | Smooth visual inspection and recognition | Visualization only |
| Exact 3D | STEP/B-Rep solids, assembly transforms, and qualified interference | Authoritative only after CAD qualification |
| Photo | Recognition and sourcing reference | Never geometry or connectivity authority |

Every representation records status, trust, source, license, qualification text, and the narrow purpose for which it can be authoritative.

## Visual families in the first slice

The registry includes semantic handling for:

- resistor;
- capacitor;
- LED;
- push button and touch input;
- microcontroller/module;
- environmental, motion, and digital sensors;
- voltage regulator;
- battery;
- USB-C connector;
- motor/haptic actuator;
- display;
- programming/debug connector;
- protection device;
- enclosure;
- PCB assembly;
- firmware state;
- software service;
- validation activity;
- product/system boundary;
- safe generic functional fallback.

Existing Blueprint nodes are mapped deterministically from current names, categories, descriptions, candidate components, and tags. This avoids a destructive migration and avoids creating a parallel visual-only catalog.

## Architecture-editor behavior

- Semantic SVG glyphs replace uniform generic block visuals.
- Ports are typed as power, ground, data, control, analog, wireless, mechanical, thermal, or dependency.
- New connections inherit their visual language from the typed port: color, line pattern, arrow, and optional animation for wireless relationships.
- Node detail changes with zoom:
  - low zoom: compact silhouette and label;
  - medium zoom: family, status, and name;
  - normal zoom: purpose, candidate hardware, and typed interface summary.
- The library uses the same family resolver and visual glyphs as placed architecture nodes.
- Every node can open the representation inspector.
- Unknown concepts use a generic semantic function representation. They never receive invented schematic, footprint, package, or exact-CAD assets.

## Representation inspector

The inspector exposes all eight representations without collapsing trust boundaries.

It shows:

- current representation status and trust;
- source, license, and qualification;
- architecture ports and directions;
- educational and vector previews;
- explicit unresolved exact-package/CAD states;
- links to Learn, Component Library, Schematic, and PCB workbenches;
- low, balanced, and high visualization-quality profiles for lightweight 3D.

The inspector never claims that opening another workbench has selected or synchronized an exact component instance when that relationship does not yet exist.

## Lightweight 3D architecture

The first slice uses a procedural Three.js visualization source so it does not download unlicensed third-party models or pretend a generic family model is a manufacturer part.

The viewer:

- is lazy-loaded only when the user selects Lightweight 3D;
- requests a low-power WebGL context;
- has bounded pixel ratios for low, balanced, and high profiles;
- has no automatic rotation;
- has no continuous animation loop;
- renders only for initial display, resize, visibility return, and user orbit/zoom interaction;
- pauses while outside the viewport;
- disposes controls, observers, geometry, materials, renderer resources, and the WebGL context on close;
- labels the preview as visualization-only.

This viewer is not the CAD kernel and is excluded from dimensional, clearance, interference, mass, manufacturing, or release authority.

## Performance budgets for this slice

These are product budgets to verify as browser performance infrastructure matures in #10:

- Architecture glyph: inline SVG, no network request.
- Pictorial preview: inline SVG, no raster download.
- Blueprint node: no WebGL context and no image request.
- 3D module: not imported until its representation tab opens.
- 3D active render: event-driven, not a permanent requestAnimationFrame loop.
- Pixel ratio: 1.0 low, 1.35 balanced, 1.8 high, always capped below unrestricted device pixel ratio.
- One representation inspector opens one WebGL context at most.
- Closing the inspector releases the context and derived GPU resources.

## Source and licensing policy

The current visual assets are authored as repository SVG/procedural geometry and include no copied screenshots or random web images.

Future imports must record:

- source project/vendor;
- source URL or package identifier;
- license and redistribution terms;
- source version;
- content hash;
- units;
- coordinate system and orientation;
- mapping to component-definition revision;
- qualification status and reviewer.

Unclear licensing means the asset cannot ship.

## Open-source adapter direction

Future adapter work should qualify structured data rather than screen captures:

- KiCad symbols, footprints, fields, and STEP/VRML associations;
- LibrePCB symbol/component/package/device relationships and pin-to-pad mapping;
- manufacturer STEP and images only with explicit usage rights;
- `kicad-cli` or reviewed parsers for deterministic vector preview and round-trip checks;
- STEP-to-tessellation or glTF caches through #17 and #26.

## Known boundary after this slice

This implementation materially replaces the generic Blueprint visual grammar and establishes the production representation contracts. Issue #60 remains broader than this PR because exact selected-component revision linking, qualified imported symbol/footprint adapters, manufacturer assets, STEP qualification, deep object-level cross-probing, and browser visual/performance gates depend on #13, #15, #17, #26, and #10.

Those missing capabilities remain explicitly unresolved rather than represented as complete.
