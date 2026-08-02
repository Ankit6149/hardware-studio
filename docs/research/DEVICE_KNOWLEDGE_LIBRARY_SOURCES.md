# Device knowledge library source notes

This document records the primary-source patterns used for Hardware Studio's beginner device knowledge foundation.

## Open-source library patterns adopted

- **KiCad** separates schematic symbols, PCB footprints, and footprint-linked 3D models. Hardware Studio keeps educational device concepts separate from manufacturer-specific component definitions and explicitly links related representations.
- **LibrePCB** separates reusable components, physical packages, and devices that map component signals to package pads. Hardware Studio mirrors this by teaching both the functional concept and the physical and connection implications instead of collapsing everything into one card.
- **Zephyr devicetree bindings** add structured semantic metadata to hardware descriptions, including buses, properties, descriptions, and examples. Hardware Studio uses typed protocols, prerequisites, connection steps, and validation guidance rather than unstructured prose.
- **Arduino learning documentation** demonstrates beginner electronics through small, concrete connection and validation steps. Hardware Studio entries therefore include practical next actions and common mistakes.

## Qualification policy

The starter entries are generic educational guidance. They do not replace a manufacturer datasheet, reference design, qualified library asset, electrical review, or safety review. Exact voltage, current, pinout, polarity, package, thermal, protection, and layout requirements must come from the selected manufacturer part and its current documentation.

## Primary references

- KiCad documentation: symbol, footprint, datasheet, description, footprint browser, and 3D model relationships.
- LibrePCB documentation: component, package, device, pinout mapping, categories, and library conventions.
- Zephyr documentation: devicetree hardware descriptions and typed bindings.
- Arduino documentation: beginner electronics examples and connection-oriented learning.
