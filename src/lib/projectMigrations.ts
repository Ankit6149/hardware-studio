// projectMigrations.ts — Project import/export correctness and schema migrations
import { Project, BoardComponent } from '../types';
import { defaultComponents } from './components/componentLibrary';

export const CURRENT_SCHEMA_VERSION = 5;

const LEGACY_BOARD_SENTINELS = new Set(['board_0', 'board-main']);
const LEGACY_BLOCK_SENTINELS = new Set(['block_0']);

export function normalizeProjectComponent(bc: Record<string, unknown>): BoardComponent {
  const compId = (bc.id as string) || `cmp_${Date.now()}_${Math.random()}`;
  const preserved = bc as unknown as Partial<BoardComponent>;
  const libraryId = (bc.libraryId as string) || '';
  const sourceDefinition = defaultComponents.find((definition) => definition.libraryId === libraryId);

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
    placed: (bcSchematic?.placed as boolean) ?? false,
    x: (bcSchematic?.x as number) ?? 150,
    y: (bcSchematic?.y as number) ?? 150,
    rotation: (bcSchematic?.rotation as number) ?? 0,
    locked: (bcSchematic?.locked as boolean) ?? false,
  };

  // PCB coordinates are engineering facts. Preserve a valid zero coordinate,
  // but never turn a missing coordinate into 0 just to make downstream editors
  // easier to render. An unplaced component must remain geometrically unresolved.
  const pcbX = typeof bcPcb?.xMm === 'number'
    ? bcPcb.xMm
    : typeof bc.placementX === 'number'
      ? bc.placementX
      : undefined;
  const pcbY = typeof bcPcb?.yMm === 'number'
    ? bcPcb.yMm
    : typeof bc.placementY === 'number'
      ? bc.placementY
      : undefined;
  const hasPcbCoordinates = pcbX !== undefined && pcbY !== undefined;
  const requestedPlacementStatus = (
    (bcPcb?.placementStatus as BoardComponent['placementStatus'])
    || (bc.placementStatus as BoardComponent['placementStatus'])
  );
  const pcbPlaced = (bcPcb?.placed as boolean) ?? (requestedPlacementStatus === 'Placed' && hasPcbCoordinates);

  const pcb = {
    placed: pcbPlaced && hasPcbCoordinates,
    xMm: pcbX,
    yMm: pcbY,
    rotationDeg: (bcPcb?.rotationDeg as number) ?? (bc.rotationDeg as number) ?? 0,
    side: ((bcPcb?.side as string) || (bc.side as string) || 'Top') as 'Top' | 'Bottom',
    locked: (bcPcb?.locked as boolean) ?? (bc.lockedPlacement as boolean) ?? false,
    placementStatus: (
      requestedPlacementStatus
      || (hasPcbCoordinates ? 'Placed' : 'Unplaced')
    ),
  };

  return {
    // Preserve reviewed representation, sourcing, qualification, and provenance
    // fields that are not rewritten by migration. Canonical fields below win.
    ...preserved,
    id: compId,
    libraryId,
    referenceDesignator: (bc.referenceDesignator as string) || 'U1',
    componentName: (bc.componentName as string) || sourceDefinition?.name || '',
    componentType: (bc.componentType as string) || sourceDefinition?.category || '',
    value: (bc.value as string) || sourceDefinition?.value || '',
    packageName: (bc.packageName as string) || sourceDefinition?.packageName || '',
    footprint: (bc.footprint as string) || sourceDefinition?.footprintName || '',
    partNumber: (bc.partNumber as string) || sourceDefinition?.partNumber || '',
    manufacturer: (bc.manufacturer as string) || sourceDefinition?.manufacturer || '',
    pins,
    // Missing relationships remain explicitly unassigned. Runtime editors must
    // never infer a fake board/circuit-block identity from absence.
    boardId: (bc.boardId as string) || '',
    circuitBlockId: (bc.circuitBlockId as string) || undefined,
    bomItemId: (bc.bomItemId as string) || '',
    quantity: Number(bc.quantity) || sourceDefinition?.defaultQuantity || 1,
    schematic,
    pcb,
    status: (bc.status as BoardComponent['status']) || 'Draft',
    notes: (bc.notes as string) || sourceDefinition?.description || '',

    placementX: pcb.xMm,
    placementY: pcb.yMm,
    rotationDeg: pcb.rotationDeg,
    side: pcb.side,
    lockedPlacement: pcb.locked,
    placementStatus: pcb.placementStatus,
    supplier: (bc.supplier as string) || '',
    datasheetUrl: (bc.datasheetUrl as string) || sourceDefinition?.datasheetUrl || '',
    placementCriticality: (bc.placementCriticality as BoardComponent['placementCriticality']) || 'Low',
  };
}

export function syncLegacyPlacementFields(comp: BoardComponent): BoardComponent {
  const hasCoordinates = comp.placementX !== undefined && comp.placementY !== undefined;
  if (!comp.pcb) {
    comp.pcb = {
      placed: hasCoordinates && comp.placementStatus !== 'Unplaced',
      xMm: comp.placementX,
      yMm: comp.placementY,
      rotationDeg: comp.rotationDeg,
      side: comp.side === 'Bottom' ? 'Bottom' : 'Top',
      locked: !!comp.lockedPlacement,
      placementStatus: comp.placementStatus || (hasCoordinates ? 'Placed' : 'Unplaced'),
    };
  } else {
    comp.pcb.placed = hasCoordinates && comp.placementStatus !== 'Unplaced';
    comp.pcb.xMm = comp.placementX;
    comp.pcb.yMm = comp.placementY;
    comp.pcb.rotationDeg = comp.rotationDeg;
    comp.pcb.side = comp.side === 'Bottom' ? 'Bottom' : 'Top';
    comp.pcb.locked = !!comp.lockedPlacement;
    comp.pcb.placementStatus = comp.placementStatus || (hasCoordinates ? 'Placed' : 'Unplaced');
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

function resolveLegacyRelation(
  candidate: string | undefined,
  validIds: Set<string>,
  legacySentinels: Set<string>
): string | undefined {
  if (!candidate) return undefined;
  if (validIds.has(candidate)) return candidate;
  if (!legacySentinels.has(candidate)) return candidate;
  if (validIds.size !== 1) return undefined;
  return validIds.values().next().value;
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

  const boardIds = new Set((migrated.boards || []).map((board) => board.id).filter(Boolean));
  const blockIds = new Set((migrated.circuitBlocks || []).map((block) => block.id).filter(Boolean));

  migrated.boardComponents = (migrated.boardComponents as BoardComponent[]).map((component) => {
    const normalized = normalizeProjectComponent(component as unknown as Record<string, unknown>);
    return {
      ...normalized,
      boardId: resolveLegacyRelation(normalized.boardId, boardIds, LEGACY_BOARD_SENTINELS) || '',
      circuitBlockId: resolveLegacyRelation(normalized.circuitBlockId, blockIds, LEGACY_BLOCK_SENTINELS),
    };
  });

  migrated.schemaVersion = CURRENT_SCHEMA_VERSION;

  return migrated;
}
