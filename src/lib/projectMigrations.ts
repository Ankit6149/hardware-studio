// projectMigrations.ts — Phase 23 Project Import/Export Correctness and Schema Migrations
import { Project, BoardComponent } from '../types';

export const CURRENT_SCHEMA_VERSION = 4;

export function migrateProjectSchema(project: unknown): Project {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const migrated = JSON.parse(JSON.stringify(project || {})) as Project & Record<string, any>;

  if (!migrated.schemaVersion) {
    migrated.schemaVersion = 1;
  }

  // Ensure arrays are initialized
  if (!migrated.boards) migrated.boards = [];
  if (!migrated.circuitBlocks) migrated.circuitBlocks = [];
  if (!migrated.boardComponents) migrated.boardComponents = [];
  if (!migrated.nets) migrated.nets = [];
  if (!migrated.pcbConstraints) migrated.pcbConstraints = [];
  if (!migrated.manufacturingChecklist) migrated.manufacturingChecklist = [];
  if (!migrated.mechanicalZones) migrated.mechanicalZones = [];
  if (!migrated.assemblyLayers) migrated.assemblyLayers = [];
  if (!migrated.schematicSymbols) migrated.schematicSymbols = [];
  if (!migrated.schematicConnections) migrated.schematicConnections = [];
  if (!migrated.schematicWires) migrated.schematicWires = [];
  if (!migrated.pcbLayers) migrated.pcbLayers = [];
  if (!migrated.copperShapes) migrated.copperShapes = [];
  if (!migrated.traces) migrated.traces = [];
  if (!migrated.vias) migrated.vias = [];
  if (!migrated.drillHoles) migrated.drillHoles = [];
  if (!migrated.boardOutlines) migrated.boardOutlines = [];
  if (!migrated.pcbRules) migrated.pcbRules = [];
  if (!migrated.padNetAssignments) migrated.padNetAssignments = [];
  if (!migrated.keepoutZones) migrated.keepoutZones = [];
  if (!migrated.testing) migrated.testing = [];

  // Migrate boardComponents pins, pcb & schematic objects if missing
  migrated.boardComponents = (migrated.boardComponents as BoardComponent[]).map((c) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = { ...c } as BoardComponent & Record<string, any>;

    // Initialize pins from generic packages if missing
    if (!updated.pins || updated.pins.length === 0) {
      const pinCount = updated.packageName.toLowerCase().includes('qfn_32') ? 32 :
                       updated.packageName.toLowerCase().includes('qfn_48') ? 48 :
                       updated.packageName.toLowerCase().includes('soic_8') ? 8 :
                       updated.packageName.toLowerCase().includes('soic_14') ? 14 : 2;
      const generatedPins = [];
      for (let i = 1; i <= pinCount; i++) {
        generatedPins.push({
          id: `pin_${updated.id}_${i}`,
          componentId: updated.id,
          pinNumber: String(i),
          pinName: `PIN${i}`,
          electricalType: 'Passive',
          netName: ''
        });
      }
      updated.pins = generatedPins;
    }

    // Populate schematic placement if missing
    if (!updated.schematic) {
      updated.schematic = {
        placed: updated.placementX != null,
        x: updated.placementX || 100,
        y: updated.placementY || 100,
        rotation: updated.rotationDeg || 0
      };
    }

    // Populate pcb placement if missing
    if (!updated.pcb) {
      updated.pcb = {
        placed: updated.placementX != null,
        xMm: updated.placementX || 0,
        yMm: updated.placementY || 0,
        rotationDeg: updated.rotationDeg || 0,
        side: updated.side === 'Bottom' ? 'Bottom' : 'Top',
        locked: !!updated.lockedPlacement,
        placementStatus: updated.placementStatus || (updated.placementX != null ? 'Placed' : 'Unplaced')
      };
    }

    // Ensure flat fields are synchronized for backward compatibility
    if (updated.placementX == null && updated.pcb?.xMm != null) updated.placementX = updated.pcb.xMm;
    if (updated.placementY == null && updated.pcb?.yMm != null) updated.placementY = updated.pcb.yMm;
    if (updated.rotationDeg == null && updated.pcb?.rotationDeg != null) updated.rotationDeg = updated.pcb.rotationDeg;
    if (updated.lockedPlacement == null && updated.pcb?.locked != null) updated.lockedPlacement = updated.pcb.locked;
    if (!updated.side && updated.pcb?.side) updated.side = updated.pcb.side;
    if (!updated.placementStatus && updated.pcb?.placementStatus) updated.placementStatus = updated.pcb.placementStatus;

    return updated;
  });

  // Make sure version is bumped
  migrated.schemaVersion = CURRENT_SCHEMA_VERSION;

  return migrated;
}
