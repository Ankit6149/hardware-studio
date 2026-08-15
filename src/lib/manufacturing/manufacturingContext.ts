import { BoardComponent, BoardItem, BoardOutline, Project } from '../../types';
import { FOOTPRINT_LIBRARY } from '../footprints';

export type ManufacturingBlockerCode =
  | 'NO_BOARD'
  | 'STALE_ACTIVE_BOARD'
  | 'AMBIGUOUS_BOARD'
  | 'MULTI_BOARD_EXPORT_UNSUPPORTED'
  | 'MISSING_BOARD_GEOMETRY'
  | 'UNASSIGNED_COMPONENT'
  | 'UNPLACED_COMPONENT'
  | 'MISSING_FOOTPRINT';

export interface ManufacturingBlocker {
  code: ManufacturingBlockerCode;
  message: string;
  objectId?: string;
}

export interface BoardDimensionsMm {
  widthMm: number;
  heightMm: number;
}

export interface ManufacturingBoardContext {
  board: BoardItem;
  boardId: string;
  dimensions?: BoardDimensionsMm;
  outline?: BoardOutline;
  components: BoardComponent[];
  placedComponents: BoardComponent[];
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

export function parseBoardDimensionsMm(dimensionsMm?: string): BoardDimensionsMm | undefined {
  if (!dimensionsMm?.trim()) return undefined;

  const match = dimensionsMm
    .trim()
    .match(/^\s*(\d+(?:\.\d+)?)\s*(?:x|×)\s*(\d+(?:\.\d+)?)\s*(?:mm)?\s*$/i);
  if (!match) return undefined;

  const widthMm = Number(match[1]);
  const heightMm = Number(match[2]);
  if (!Number.isFinite(widthMm) || !Number.isFinite(heightMm) || widthMm <= 0 || heightMm <= 0) {
    return undefined;
  }
  return { widthMm, heightMm };
}

function isUsableOutline(outline: BoardOutline): boolean {
  const hasPolygon = Boolean(
    outline.points
    && outline.points.length >= 3
    && outline.points.every((point) => isFiniteNumber(point.x) && isFiniteNumber(point.y)),
  );
  const hasExplicitSize = isFiniteNumber(outline.width)
    && isFiniteNumber(outline.height)
    && outline.width > 0
    && outline.height > 0;
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

function getPlacement(component: BoardComponent): { xMm?: number; yMm?: number; placed: boolean } {
  const xMm = isFiniteNumber(component.pcb?.xMm) ? component.pcb.xMm : component.placementX;
  const yMm = isFiniteNumber(component.pcb?.yMm) ? component.pcb.yMm : component.placementY;
  const hasCoordinates = isFiniteNumber(xMm) && isFiniteNumber(yMm);
  const explicitlyUnplaced = component.pcb?.placementStatus === 'Unplaced'
    || component.placementStatus === 'Unplaced'
    || component.pcb?.placed === false;

  return {
    xMm: hasCoordinates ? xMm : undefined,
    yMm: hasCoordinates ? yMm : undefined,
    placed: hasCoordinates && !explicitlyUnplaced,
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

  // The current legacy serializers still contain cross-board/global assumptions.
  // Until those are replaced, a multi-board project must fail closed rather than
  // silently package geometry/components from the wrong board.
  if ((project.boards || []).length > 1) {
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

  if (!outline && !dimensions) {
    blockers.push({
      code: 'MISSING_BOARD_GEOMETRY',
      objectId: boardId,
      message: `Manufacturing output is blocked because ${board.name} has neither a real outline nor valid dimensions.`,
    });
  }

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
    if (!placement.placed) {
      blockers.push({
        code: 'UNPLACED_COMPONENT',
        objectId: component.id,
        message: `Manufacturing output is blocked because ${component.referenceDesignator || component.componentName || component.id} has no approved PCB placement.`,
      });
    } else {
      placedComponents.push(component);
    }

    if (!component.footprint || !FOOTPRINT_LIBRARY[component.footprint]) {
      blockers.push({
        code: 'MISSING_FOOTPRINT',
        objectId: component.id,
        message: `Manufacturing output is blocked because ${component.referenceDesignator || component.componentName || component.id} does not have a supported physical footprint.`,
      });
    }
  });

  const context: ManufacturingBoardContext = {
    board,
    boardId,
    dimensions,
    outline,
    components,
    placedComponents,
  };

  return {
    ready: blockers.length === 0,
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
