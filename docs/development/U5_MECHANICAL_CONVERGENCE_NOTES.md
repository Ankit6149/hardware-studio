# U5 Mechanical convergence notes

This file records the bounded U5.1 implementation decisions while the broader Mechanical engine issues remain open.

## U5.1 shell contract

- Mechanical uses the shared Studio shell and one Project Drawer.
- Drawer owns Features, Dimensions, and Assembly context.
- Center remains the authoritative Mechanical viewport/work surface.
- Right Inspector edits the selected canonical mechanical object only.
- Bottom dock owns Mechanical findings.
- Panel state remains UI/session state outside the canonical project model.

## Truthfulness rules

- Opening Mechanical never auto-selects the first object.
- New geometry never receives fabricated starter dimensions.
- Tolerances are unresolved until explicitly entered.
- Assembly rows do not invent material or fastening method.
- PCB envelopes are synchronized only from explicit board/outline context.
- This slice does not claim a CAD kernel, parametric constraints, exact solids, or qualified manufacturing geometry.

## Follow-on U5 work

U5.2+ must continue through #16/#17 and related Mechanical issues for constrained sketches, real feature history, CAD-kernel solids, assembly constraints/interference, ECAD/MCAD change review, and qualified STEP/STL/drawing outputs.
