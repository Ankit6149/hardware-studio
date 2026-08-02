// projectMigrations.ts — Phase 23 Project Import/Export Correctness and Schema Migrations
import { Project, BoardComponent } from '../types';

export const CURRENT_SCHEMA_VERSION = 4;

export function normalizeProjectComponent(bc: Record<string, unknown>): BoardComponent {
  const compId = (bc.id as string) || `cmp_${Date.now()}_${Math.random()}`;

  // Accept canonical project-pin fields and reusable library-definition fields.
  // Every downstream editor must receive the same BoardComponentPin shape.
  const rawPins = (bc.pins as Record<string, unknown>[]) || [];
  const pins = rawPins.map((pin, index) => {
    const pinNumber = String(pin.pinNumber ?? pin.number ?? index + 1);
    const pinName = String(pin.pinName ?? pin.name ?? `PIN${pinNumber}`);
    return {
      id: (pin.id as string) || `pin_${compId}_${pinNumber}`,
      componentId: compId,
      pinNumber,
      pinName,
      electricalType: (pin.electricalType as string) || 'Passive',
      netId: (pin.netId as string) || undefined,
      netName: (pin.netName as string) || '',
      noConnect: !!pin.noConnect,
      required: !!pin.required,
      voltage: typeof pin.voltage === 'number' ? pin.voltage : undefined,
      protocol: (pin.protocol as string) || undefined,
      notes: (pin.notes as string) || undefined,
    };
  });

  const bcSchematic = bc.schematic as Record<string, unknown> | undefined;
  const bcPcb = bc.pcb as Record<string, unknown> | undefined;

  const schematic = {
    placed: (bcSchematic?.placed as boolean) ?? (bc.placementX != null),
    x: (bcSchematic?.x as number) ?? (bc.placementX as number) ?? 150,
    y: (bcSchematic?.y as number) ?? (bc.placementY as number) ?? 150,
    rotation: (bcSchematic?.rotation as number) ?? (bc.rotationDeg as number) ?? 0,
    locked: (bcSchematic?.locked as boolean) ?? false,
  };

  const pcb = {
    placed: (bcPcb?.placed as boolean) ?? (bc.placementX != null),
    xMm: (bcPcb?.xMm as number) ?? (bc.placementX as number) ?? 0,
    yMm: (bcPcb?.yMm as number) ?? (bc.placementY as number) ?? 0,
    rotationDeg: (bcPcb?.rotationDeg as number) ?? (bc.rotationDeg as number) ?? 0,
    side: ((bcPcb?.side as string) || (bc.side as string) || 'Top') as 'Top' | 'Bottom',
    locked: (bcPcb?.locked as boolean) ?? (bc.lockedPlacement as boolean) ?? false,
    placementStatus: ((bcPcb?.placementStatus as BoardComponent['placementStatus']) || (bc.placementStatus as BoardComponent['placementStatus']) || (bc.placementX != null ? 'Placed' : 'Unplaced')),
  };

  return {
    id: compId,
    libraryId: (bc.libraryId as string) || '',
    referenceDesignator: (bc.referenceDesignator as string) || 'U1',
    componentName: (bc.componentName as string) || '',
    componentType: (bc.componentType as string) || '',
    value: (bc.value as string) || '',
    packageName: (bc.packageName as string) || '',
    footprint: (bc.footprint as string) || '',
    partNumber: (bc.partNumber as string) || '',
    pins,
    boardId: (bc.boardId as string) || 'board_0',
    circuitBlockId: (bc.circuitBlockId as string) || 'block_0',
    bomItemId: (bc.bomItemId as string) || '',
    quantity: Number(bc.quantity) || 1,
    schematic,
    pcb,
    status: (bc.status as BoardComponent['status']) || 'Draft',
    notes: (bc.notes as string) || '',

    placementX: pcb.xMm,
    placementY: pcb.yMm,
    rotationDeg: pcb.rotationDeg,
    side: pcb.side,
    lockedPlacement: pcb.locked,
    placementStatus: pcb.placementStatus,
    supplier: (bc.supplier as string) || '',
    datasheetUrl: (bc.datasheetUrl as string) || '',
    placementCriticality: (bc.placementCriticality as BoardComponent['placementCriticality']) || 'Low'
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
      placementStatus: (comp.placementStatus || (comp.placementX != null ? 'Placed' : 'Unplaced')),
    };
  } else {
    comp.pcb.placed = comp.placementX != null;
    comp.pcb.xMm = comp.placementX;
    comp.pcb.yMm = comp.placementY;
    comp.pcb.rotationDeg = comp.rotationDeg;
    comp.pcb.side = comp.side === 'Bottom' ? 'Bottom' : 'Top';
    comp.pcb.locked = !!comp.lockedPlacement;
    comp.pcb.placementStatus = (comp.placementStatus || (comp.placementX != null ? 'Placed' : 'Unplaced'));
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
    comp.placementStatus = comp.pcb.placementStatus;
  }
  return comp;
}

export function migrateProjectSchema(project: unknown): Project {
  const migrated = JSON.parse(JSON.stringify(project || {})) as Project & Record<string, unknown>;

  if (!migrated.schemaVersion) {
    migrated.schemaVersion = 1;
  }

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

  migrated.boardComponents = (migrated.boardComponents as BoardComponent[]).map((component) => {
    return normalizeProjectComponent(component as unknown as Record<string, unknown>);
  });

  migrated.schemaVersion = CURRENT_SCHEMA_VERSION;

  return migrated;
}
