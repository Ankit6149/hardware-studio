# Hardware Studio - V5 QA Verification Checklist

This checklist documents the quality assurance and verification protocols used to test the local-first Hardware Studio Factory Package Builder.

---

## 1. Footprint Presets Library Verification (`src/lib/footprints.ts`)
- [x] Defined 18 footprint presets (R_0603, C_0805, SOT23, SOIC_8, QFN_32, POGO_PAD, etc.).
- [x] Verified body sizes, pad dimensions, pin counts, and courtyard offsets for each package.
- [x] Enabled default custom rectangle fallback (`CUSTOM_RECT`) for unrecognized footprint packages.

---

## 2. Hardened Design Review Engine (`src/lib/designReview.ts`)
- [x] **ERC Schematic Verification**:
  - Missing power/GND rails.
  - SMT LEDs lacking current-limiting resistors.
  - I2C lines pull-up resistor missing warning.
  - Haptic drivers lacking flyback clamp protection.
  - MCU SWD programming/debug test points checks.
  - RF microstrip impedance notes coverage.
  - PMIC reverse polarity input protection.
- [x] **DRC PCB Verification**:
  - Missing outlines or physical dimensions.
  - Placed components colliding / overlapping.
  - Placed footprints, vias, and drill holes inside board boundary checks.
  - Minimum trace widths and thin power lanes.
- [x] **Factory Verification**:
  - Unchecked items in package checklist.
  - Draft vs verified package release states.

---

## 3. Advanced Gerber & Excellon Exporters (`src/lib/nativeExports.ts`)
- [x] **Outline Gerber**: Draws outline lines based on outline points or dimensions to a separate mechanical edge layer.
- [x] **Top Silkscreen**: Outputs component bounding boxes and reference designator text.
- [x] **Top/Bottom Solder Mask**: Flashes solder mask void clearances.
- [x] **Excellon NC Drills**: Emits tool list headers grouped by drill hole diameter, metric units, coordinate lines, and standard `M30` terminations.
- [x] **Disclaimers Phrasing**: Removed altium/kicad/solidworks naming dependencies. Labeled all drafts: *"Generated In App — Needs Engineering Review"*.

---

## 4. Factory Package Builder View (`src/components/FactoryPackageBuilder.tsx`)
- [x] Displays package release status badge.
- [x] Renders checklist interface with 10 manual verification tick elements.
- [x] Renders list of 11 in-app generated files and 7 missing factory stencils.
- [x] Integrates action buttons to compile drafts, verify package release status, or reset checks.

---

## 5. Export Center Reorganization (`src/components/ExportCenter.tsx`)
- [x] Structured center into 6 distinct categories:
  1. Project Backup
  2. Blueprint Documents
  3. Native Editor Data
  4. Manufacturing Draft Files
  5. Review & Readiness
  6. Firmware
- [x] Placed disclaimers explicitly near downloads: *"Generated In App — Needs Engineering Review"*.

---

> Verified by Antigravity IDE Agent
