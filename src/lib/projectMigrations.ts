// projectMigrations.ts — Phase 23 Project Import/Export Correctness and Schema Migrations
import { Project, BoardComponent } from '../types';

export const CURRENT_SCHEMA_VERSION = 4;

export function normalizeProjectComponent(bc: any): BoardComponent {
  const compId = bc.id || `cmp_${Date.now()}_${Math.random()}`;

  // Pins normalization
  const pins = (bc.pins || []).map((p: any) => ({
    id: p.id || `pin_${compId}_${p.pinNumber}`,
    componentId: compId,
    pinNumber: String(p.pinNumber),
    pinName: p.pinName || `PIN${p.pinNumber}`,
    electricalType: p.electricalType || 'Passive',
    netId: p.netId || undefined,
    netName: p.netName || '',
    noConnect: !!p.noConnect,
    required: !!p.required
  }));

  // Schematic placement initialization
  const schematic = {
    placed: bc.schematic?.placed ?? (bc.placementX != null),
    x: bc.schematic?.x ?? bc.placementX ?? 150,
    y: bc.schematic?.y ?? bc.placementY ?? 150,
    rotation: bc.schematic?.rotation ?? bc.rotationDeg ?? 0,
    locked: bc.schematic?.locked ?? false,
  };

  // PCB placement initialization
  const pcb = {
    placed: bc.pcb?.placed ?? (bc.placementX != null),
    xMm: bc.pcb?.xMm ?? bc.placementX ?? 0,
    yMm: bc.pcb?.yMm ?? bc.placementY ?? 0,
    rotationDeg: bc.pcb?.rotationDeg ?? bc.rotationDeg ?? 0,
    side: (bc.pcb?.side || bc.side || "Top") as 'Top' | 'Bottom',
    locked: bc.pcb?.locked ?? bc.lockedPlacement ?? false,
    placementStatus: (bc.pcb?.placementStatus || bc.placementStatus || (bc.placementX != null ? "Placed" : "Unplaced")) as any,
  };

  return {
    id: compId,
    libraryId: bc.libraryId || "",
    referenceDesignator: bc.referenceDesignator || "U1",
    componentName: bc.componentName || "",
    componentType: bc.componentType || "",
    value: bc.value || "",
    packageName: bc.packageName || "",
    footprint: bc.footprint || "",
    partNumber: bc.partNumber || "",
    pins,
    boardId: bc.boardId || "board_0",
    circuitBlockId: bc.circuitBlockId || "block_0",
    bomItemId: bc.bomItemId || "",
    quantity: Number(bc.quantity) || 1,
    schematic,
    pcb,
    status: bc.status || "Draft",
    notes: bc.notes || "",
    
    // Synchronize flat fields
    placementX: pcb.xMm,
    placementY: pcb.yMm,
    rotationDeg: pcb.rotationDeg,
    side: pcb.side,
    lockedPlacement: pcb.locked,
    placementStatus: pcb.placementStatus,
    supplier: bc.supplier || "",
    datasheetUrl: bc.datasheetUrl || "",
    placementCriticality: bc.placementCriticality || "Low"
  };
}

export function syncLegacyPlacementFields(comp: BoardComponent): BoardComponent {
  if (!comp.pcb) {
    comp.pcb = {
      placed: comp.placementX != null,
      xMm: comp.placementX,
      yMm: comp.placementY,
      rotationDeg: comp.rotationDeg,
      side: comp.side === 'Bottom' ? 'Bottom' : 'Top',
      locked: !!comp.lockedPlacement,
      placementStatus: (comp.placementStatus || (comp.placementX != null ? 'Placed' : 'Unplaced')) as any,
    };
  } else {
    comp.pcb.placed = comp.placementX != null;
    comp.pcb.xMm = comp.placementX;
    comp.pcb.yMm = comp.placementY;
    comp.pcb.rotationDeg = comp.rotationDeg;
    comp.pcb.side = comp.side === 'Bottom' ? 'Bottom' : 'Top';
    comp.pcb.locked = !!comp.lockedPlacement;
    comp.pcb.placementStatus = (comp.placementStatus || (comp.placementX != null ? 'Placed' : 'Unplaced')) as any;
  }
  return comp;
}

export function syncNestedPcbFields(comp: BoardComponent): BoardComponent {
  if (comp.pcb) {
    comp.placementX = comp.pcb.xMm;
    comp.placementY = comp.pcb.yMm;
    comp.rotationDeg = comp.pcb.rotationDeg;
    comp.side = comp.pcb.side;
    comp.lockedPlacement = comp.pcb.locked;
    comp.placementStatus = comp.pcb.placementStatus as any;
  }
  return comp;
}

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
  if (!migrated.requirements) migrated.requirements = [];
  if (!migrated.architectureNodes) migrated.architectureNodes = [];
  if (!migrated.mechanicalObjects) migrated.mechanicalObjects = [];
  if (!migrated.firmwareModules) migrated.firmwareModules = [];
  if (!migrated.validationTests) migrated.validationTests = [];

  // Migrate boardComponents pins, pcb & schematic objects if missing
  migrated.boardComponents = (migrated.boardComponents as BoardComponent[]).map((c) => {
    return normalizeProjectComponent(c);
  });

  // Make sure version is bumped
  migrated.schemaVersion = CURRENT_SCHEMA_VERSION;

  return migrated;
}
