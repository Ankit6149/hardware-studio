import {
  BoardComponent,
  BoardItem,
  BoardOutline,
  DrillHole,
  Project,
  Trace,
  Via,
} from '../../types';
import { FOOTPRINT_LIBRARY } from '../footprints';

export type ManufacturingBlockerCode =
  | 'NO_BOARD'
  | 'STALE_ACTIVE_BOARD'
  | 'AMBIGUOUS_BOARD'
  | 'MULTI_BOARD_EXPORT_UNSUPPORTED'
  | 'MISSING_BOARD_GEOMETRY'
  | 'UNASSIGNED_COMPONENT'
  | 'ORPHAN_BOARD_ENTITY'
  | 'UNPLACED_COMPONENT'
  | 'INVALID_COMPONENT_SIDE'
  | 'INVALID_COMPONENT_ROTATION'
  | 'MISSING_FOOTPRINT'
  | 'INVALID_TRACE_GEOMETRY'
  | 'INVALID_TRACE_WIDTH'
  | 'INVALID_TRACE_LAYER'
  | 'INVALID_VIA_GEOMETRY'
  | 'INVALID_VIA_DIAMETERS'
  | 'INVALID_DRILL_GEOMETRY'
  | 'INVALID_DRILL_DIAMETER'
  | 'UNSERIALIZED_COPPER_SHAPE';

export interface ManufacturingBlocker {
  code: ManufacturingBlockerCode;
  message: string;
  objectId?: string;
}

export interface BoardDimensionsMm {
  widthMm: number;
  heightMm: number;
}

export type ManufacturingCopperSide = 'Top' | 'Bottom';

export interface ManufacturingBoardContext {
  board: BoardItem;
  boardId: string;
  dimensions?: BoardDimensionsMm;
  outline: BoardOutline;
  components: BoardComponent[];
  placedComponents: BoardComponent[];
  traces: Trace[];
  vias: Via[];
  drillHoles: DrillHole[];
  traceLayerSides: Record<string, ManufacturingCopperSide>;
}

export interface ManufacturingContextEvaluation {
  ready: boolean;
  blockers: ManufacturingBlocker[];
  context?: ManufacturingBoardContext;
}

export class ManufacturingContextError extends Error {
  readonly blockers: ManufacturingBlocker[];

  constructor(blockers: ManufacturingBlocker[]) {
    super(blockers.map((blocker) => blocker.message).join(' '));
    this.name = 'ManufacturingContextError';
    this.blockers = blockers;
  }
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isPositiveNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value > 0;
}

function isFinitePoint(point: { x: number; y: number }): boolean {
  return isFiniteNumber(point.x) && isFiniteNumber(point.y);
}

export function parseBoardDimensionsMm(dimensionsMm?: string): BoardDimensionsMm | undefined {
  if (!dimensionsMm?.trim()) return undefined;

  const match = dimensionsMm
    .trim()
    .match(/^\s*(\d+(?:\.\d+)?)\s*(?:x|×)\s*(\d+(?:\.\d+)?)\s*(?:mm)?\s*$/i);
  if (!match) return undefined;

  const widthMm = Number(match[1]);
  const heightMm = Number(match[2]);
  if (!isPositiveNumber(widthMm) || !isPositiveNumber(heightMm)) return undefined;
  return { widthMm, heightMm };
}

function isUsableOutline(outline: BoardOutline): boolean {
  const hasPolygon = Boolean(
    outline.points
    && outline.points.length >= 3
    && outline.points.every(isFinitePoint),
  );
  const hasExplicitSize = isPositiveNumber(outline.width) && isPositiveNumber(outline.height);
  return hasPolygon || hasExplicitSize;
}

function resolveBoard(project: Project): { board?: BoardItem; blocker?: ManufacturingBlocker } {
  const boards = project.boards || [];
  if (boards.length === 0) {
    return {
      blocker: {
        code: 'NO_BOARD',
        message: 'Manufacturing output is blocked because the project has no real board.',
      },
    };
  }

  if (project.activeBoardId) {
    const activeBoard = boards.find((board) => board.id === project.activeBoardId);
    if (!activeBoard) {
      return {
        blocker: {
          code: 'STALE_ACTIVE_BOARD',
          message: `Manufacturing output is blocked because active board ${project.activeBoardId} does not exist.`,
          objectId: project.activeBoardId,
        },
      };
    }
    return { board: activeBoard };
  }

  if (boards.length === 1) return { board: boards[0] };

  return {
    blocker: {
      code: 'AMBIGUOUS_BOARD',
      message: 'Manufacturing output is blocked because multiple boards exist and no active board is selected.',
    },
  };
}

function getPlacement(component: BoardComponent): {
  xMm?: number;
  yMm?: number;
  rotationDeg?: number;
  side?: string;
  placed: boolean;
} {
  const xMm = isFiniteNumber(component.pcb?.xMm) ? component.pcb.xMm : component.placementX;
  const yMm = isFiniteNumber(component.pcb?.yMm) ? component.pcb.yMm : component.placementY;
  const rotationDeg = isFiniteNumber(component.pcb?.rotationDeg) ? component.pcb.rotationDeg : component.rotationDeg;
  const side = component.pcb?.side || component.side;
  const hasCoordinates = isFiniteNumber(xMm) && isFiniteNumber(yMm);
  const explicitlyUnplaced = component.pcb?.placementStatus === 'Unplaced'
    || component.placementStatus === 'Unplaced'
    || component.pcb?.placed === false;

  return {
    xMm: hasCoordinates ? xMm : undefined,
    yMm: hasCoordinates ? yMm : undefined,
    rotationDeg: isFiniteNumber(rotationDeg) ? rotationDeg : undefined,
    side,
    placed: hasCoordinates && !explicitlyUnplaced,
  };
}

function resolveTraceLayerSide(project: Project, boardId: string, layerId?: string): ManufacturingCopperSide | undefined {
  if (!layerId?.trim()) return undefined;

  const candidates = [
    layerId,
    (project.pcbLayers || []).find((layer) => layer.boardId === boardId && layer.id === layerId)?.name,
  ].filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    const normalized = candidate.trim().toLowerCase();
    if (normalized.includes('top') || normalized === 'f.cu' || normalized === 'f-cu' || normalized.includes('front')) {
      return 'Top';
    }
    if (normalized.includes('bottom') || normalized === 'b.cu' || normalized === 'b-cu' || normalized.includes('back')) {
      return 'Bottom';
    }
  }
  return undefined;
}

function viaCoordinates(via: Via): { xMm?: number; yMm?: number } {
  const xMm = isFiniteNumber(via.xMm) ? via.xMm : via.x;
  const yMm = isFiniteNumber(via.yMm) ? via.yMm : via.y;
  return {
    xMm: isFiniteNumber(xMm) ? xMm : undefined,
    yMm: isFiniteNumber(yMm) ? yMm : undefined,
  };
}

function drillCoordinates(drill: DrillHole): { xMm?: number; yMm?: number } {
  const xMm = isFiniteNumber(drill.xMm) ? drill.xMm : drill.x;
  const yMm = isFiniteNumber(drill.yMm) ? drill.yMm : drill.y;
  return {
    xMm: isFiniteNumber(xMm) ? xMm : undefined,
    yMm: isFiniteNumber(yMm) ? yMm : undefined,
  };
}

export function evaluateManufacturingContext(project: Project): ManufacturingContextEvaluation {
  const blockers: ManufacturingBlocker[] = [];
  const boardResolution = resolveBoard(project);
  if (!boardResolution.board) {
    if (boardResolution.blocker) blockers.push(boardResolution.blocker);
    return { ready: false, blockers };
  }

  const board = boardResolution.board;
  const boardId = board.id;
  const boards = project.boards || [];
  const boardIds = new Set(boards.map((candidate) => candidate.id));

  // The current legacy serializers still contain cross-board/global assumptions.
  // Until they are replaced, fail closed instead of creating a mixed-board package.
  if (boards.length > 1) {
    blockers.push({
      code: 'MULTI_BOARD_EXPORT_UNSUPPORTED',
      objectId: boardId,
      message: 'Manufacturing package generation is blocked for multi-board projects until every serializer is board-isolated.',
    });
  }

  const dimensions = parseBoardDimensionsMm(board.dimensionsMm);
  const outline = (project.boardOutlines || []).find(
    (candidate) => candidate.boardId === boardId && isUsableOutline(candidate),
  );

  if (!outline) {
    blockers.push({
      code: 'MISSING_BOARD_GEOMETRY',
      objectId: boardId,
      message: `Manufacturing output is blocked because ${board.name} has no explicit board outline. Dimensions alone do not define a fabrication contour.`,
    });
  }

  const boardBoundEntities = [
    ...(project.boardComponents || []).map((entity) => ({ id: entity.id, boardId: entity.boardId, label: entity.referenceDesignator || entity.componentName || entity.id })),
    ...(project.traces || []).map((entity) => ({ id: entity.id, boardId: entity.boardId, label: `trace ${entity.id}` })),
    ...(project.vias || []).map((entity) => ({ id: entity.id, boardId: entity.boardId, label: `via ${entity.id}` })),
    ...(project.drillHoles || []).map((entity) => ({ id: entity.id, boardId: entity.boardId, label: `drill ${entity.id}` })),
    ...(project.boardOutlines || []).map((entity) => ({ id: entity.id, boardId: entity.boardId, label: `outline ${entity.id}` })),
  ];

  boardBoundEntities
    .filter((entity) => entity.boardId && !boardIds.has(entity.boardId))
    .forEach((entity) => blockers.push({
      code: 'ORPHAN_BOARD_ENTITY',
      objectId: entity.id,
      message: `Manufacturing output is blocked because ${entity.label} references missing board ${entity.boardId}.`,
    }));

  const allComponents = project.boardComponents || [];
  allComponents
    .filter((component) => !component.boardId)
    .forEach((component) => blockers.push({
      code: 'UNASSIGNED_COMPONENT',
      objectId: component.id,
      message: `Manufacturing output is blocked because ${component.referenceDesignator || component.componentName || component.id} is not assigned to a board.`,
    }));

  const components = allComponents.filter((component) => component.boardId === boardId);
  const placedComponents: BoardComponent[] = [];

  components.forEach((component) => {
    const placement = getPlacement(component);
    const label = component.referenceDesignator || component.componentName || component.id;

    if (!placement.placed) {
      blockers.push({
        code: 'UNPLACED_COMPONENT',
        objectId: component.id,
        message: `Manufacturing output is blocked because ${label} has no approved PCB placement.`,
      });
    } else {
      placedComponents.push(component);
    }

    if (placement.side !== 'Top' && placement.side !== 'Bottom') {
      blockers.push({
        code: 'INVALID_COMPONENT_SIDE',
        objectId: component.id,
        message: `Manufacturing output is blocked because ${label} has no explicit Top/Bottom board side.`,
      });
    }

    if (!isFiniteNumber(placement.rotationDeg)) {
      blockers.push({
        code: 'INVALID_COMPONENT_ROTATION',
        objectId: component.id,
        message: `Manufacturing output is blocked because ${label} has no finite placement rotation.`,
      });
    }

    if (!component.footprint || !FOOTPRINT_LIBRARY[component.footprint]) {
      blockers.push({
        code: 'MISSING_FOOTPRINT',
        objectId: component.id,
        message: `Manufacturing output is blocked because ${label} does not have a supported physical footprint.`,
      });
    }
  });

  const traces = (project.traces || []).filter((trace) => trace.boardId === boardId);
  const traceLayerSides: Record<string, ManufacturingCopperSide> = {};
  traces.forEach((trace) => {
    if (!trace.points || trace.points.length < 2 || !trace.points.every(isFinitePoint)) {
      blockers.push({
        code: 'INVALID_TRACE_GEOMETRY',
        objectId: trace.id,
        message: `Manufacturing output is blocked because trace ${trace.id} has unresolved route geometry.`,
      });
    }
    if (!isPositiveNumber(trace.width)) {
      blockers.push({
        code: 'INVALID_TRACE_WIDTH',
        objectId: trace.id,
        message: `Manufacturing output is blocked because trace ${trace.id} has no positive physical width.`,
      });
    }
    const side = resolveTraceLayerSide(project, boardId, trace.layerId);
    if (!side) {
      blockers.push({
        code: 'INVALID_TRACE_LAYER',
        objectId: trace.id,
        message: `Manufacturing output is blocked because trace ${trace.id} is not assigned to a resolvable top/bottom copper layer.`,
      });
    } else {
      traceLayerSides[trace.id] = side;
    }
  });

  const vias = (project.vias || []).filter((via) => via.boardId === boardId);
  vias.forEach((via) => {
    const coordinates = viaCoordinates(via);
    if (!isFiniteNumber(coordinates.xMm) || !isFiniteNumber(coordinates.yMm)) {
      blockers.push({
        code: 'INVALID_VIA_GEOMETRY',
        objectId: via.id,
        message: `Manufacturing output is blocked because via ${via.id} has unresolved coordinates.`,
      });
    }

    const drillDiameter = isFiniteNumber(via.drillDiameterMm) ? via.drillDiameterMm : via.drillDiameter;
    const padDiameter = isFiniteNumber(via.padDiameterMm) ? via.padDiameterMm : via.outerDiameter;
    if (!isPositiveNumber(drillDiameter) || !isPositiveNumber(padDiameter) || padDiameter <= drillDiameter) {
      blockers.push({
        code: 'INVALID_VIA_DIAMETERS',
        objectId: via.id,
        message: `Manufacturing output is blocked because via ${via.id} needs explicit positive pad/drill diameters with pad diameter greater than drill diameter.`,
      });
    }
  });

  const drillHoles = (project.drillHoles || []).filter((drill) => drill.boardId === boardId);
  drillHoles.forEach((drill) => {
    const coordinates = drillCoordinates(drill);
    if (!isFiniteNumber(coordinates.xMm) || !isFiniteNumber(coordinates.yMm)) {
      blockers.push({
        code: 'INVALID_DRILL_GEOMETRY',
        objectId: drill.id,
        message: `Manufacturing output is blocked because drill ${drill.id} has unresolved coordinates.`,
      });
    }

    const diameter = isFiniteNumber(drill.diameterMm) ? drill.diameterMm : drill.diameter;
    if (!isPositiveNumber(diameter)) {
      blockers.push({
        code: 'INVALID_DRILL_DIAMETER',
        objectId: drill.id,
        message: `Manufacturing output is blocked because drill ${drill.id} has no positive physical diameter.`,
      });
    }
  });

  const copperShapes = (project.copperShapes || []).filter((shape) => shape.boardId === boardId);
  if (copperShapes.length > 0) {
    blockers.push({
      code: 'UNSERIALIZED_COPPER_SHAPE',
      objectId: copperShapes[0].id,
      message: 'Manufacturing output is blocked because copper pours/shapes exist but the current native serializer does not yet preserve them.',
    });
  }

  const context = outline ? {
    board,
    boardId,
    dimensions,
    outline,
    components,
    placedComponents,
    traces,
    vias,
    drillHoles,
    traceLayerSides,
  } satisfies ManufacturingBoardContext : undefined;

  return {
    ready: blockers.length === 0 && Boolean(context),
    blockers,
    context,
  };
}

export function assertManufacturingContext(project: Project): ManufacturingBoardContext {
  const evaluation = evaluateManufacturingContext(project);
  if (!evaluation.ready || !evaluation.context) {
    throw new ManufacturingContextError(evaluation.blockers);
  }
  return evaluation.context;
}
