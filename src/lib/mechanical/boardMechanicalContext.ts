import type { BoardOutline, MechanicalObject, Project } from '../../types';

export interface BoardMechanicalContext {
  boardId: string | null;
  boardName: string | null;
  outlineId: string | null;
  widthMm: number | null;
  heightMm: number | null;
  linkedObjectId: string | null;
  syncState: 'missing-board' | 'missing-outline' | 'not-synced' | 'synced' | 'stale';
  blockers: string[];
}

interface OutlineGeometry {
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  points?: { x: number; y: number }[];
}

function resolveBoard(project: Project, preferredBoardId?: string | null) {
  const boards = project.boards || [];
  const candidateId = preferredBoardId || project.activeBoardId;
  return (candidateId ? boards.find((board) => board.id === candidateId) : undefined) || boards[0] || null;
}

function toMillimeters(value: number, units: BoardOutline['units']) {
  return units === 'mil' ? value * 0.0254 : value;
}

function getOutlineGeometry(outline: BoardOutline): OutlineGeometry | null {
  const units = outline.units || 'mm';
  const convertedPoints = (outline.points || []).map((point) => ({
    x: toMillimeters(point.x, units),
    y: toMillimeters(point.y, units),
  }));

  if (convertedPoints.length >= 3) {
    const xs = convertedPoints.map((point) => point.x);
    const ys = convertedPoints.map((point) => point.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    if (Number.isFinite(minX) && Number.isFinite(maxX) && Number.isFinite(minY) && Number.isFinite(maxY) && maxX > minX && maxY > minY) {
      return {
        xMm: minX,
        yMm: minY,
        widthMm: maxX - minX,
        heightMm: maxY - minY,
        points: convertedPoints,
      };
    }
  }

  if (outline.width != null && outline.height != null && outline.width > 0 && outline.height > 0) {
    return {
      xMm: 0,
      yMm: 0,
      widthMm: toMillimeters(outline.width, units),
      heightMm: toMillimeters(outline.height, units),
    };
  }

  return null;
}

function nearlyEqual(left: number | undefined, right: number, tolerance = 0.001) {
  return left != null && Math.abs(left - right) <= tolerance;
}

export function buildMechanicalBoardEnvelope(
  project: Project,
  preferredBoardId?: string | null,
): Omit<MechanicalObject, 'id'> | null {
  const board = resolveBoard(project, preferredBoardId);
  if (!board) return null;
  const outline = (project.boardOutlines || []).find((candidate) => candidate.boardId === board.id);
  if (!outline) return null;
  const geometry = getOutlineGeometry(outline);
  if (!geometry) return null;

  const usePolygon = Boolean(geometry.points && geometry.points.length > 4);
  return {
    name: `${board.name} · PCB envelope`,
    type: 'Board Zone',
    shape: usePolygon ? 'polygon' : 'rect',
    xMm: geometry.xMm,
    yMm: geometry.yMm,
    widthMm: geometry.widthMm,
    heightMm: geometry.heightMm,
    points: usePolygon ? geometry.points : undefined,
    rotationDeg: 0,
    linkedBoardId: board.id,
    linkedComponentIds: (project.boardComponents || [])
      .filter((component) => component.boardId === board.id)
      .map((component) => component.id),
    locked: true,
    visible: true,
    notes: `Derived from authoritative board outline ${outline.id}. Re-sync after PCB outline changes; do not edit this object as independent board geometry.`,
  };
}

export function evaluateMechanicalBoardContext(
  project: Project,
  preferredBoardId?: string | null,
): BoardMechanicalContext {
  const board = resolveBoard(project, preferredBoardId);
  if (!board) {
    return {
      boardId: null,
      boardName: null,
      outlineId: null,
      widthMm: null,
      heightMm: null,
      linkedObjectId: null,
      syncState: 'missing-board',
      blockers: ['Define a real PCB before creating a board-linked enclosure envelope.'],
    };
  }

  const outline = (project.boardOutlines || []).find((candidate) => candidate.boardId === board.id);
  if (!outline) {
    return {
      boardId: board.id,
      boardName: board.name,
      outlineId: null,
      widthMm: null,
      heightMm: null,
      linkedObjectId: null,
      syncState: 'missing-outline',
      blockers: ['The selected board has no explicit outline. Mechanical will not infer one from a text dimension field.'],
    };
  }

  const geometry = getOutlineGeometry(outline);
  if (!geometry) {
    return {
      boardId: board.id,
      boardName: board.name,
      outlineId: outline.id,
      widthMm: null,
      heightMm: null,
      linkedObjectId: null,
      syncState: 'missing-outline',
      blockers: ['The selected board outline does not contain usable physical geometry.'],
    };
  }

  const linked = (project.mechanicalObjects || []).find(
    (object) => object.type === 'Board Zone' && object.linkedBoardId === board.id,
  );
  if (!linked) {
    return {
      boardId: board.id,
      boardName: board.name,
      outlineId: outline.id,
      widthMm: geometry.widthMm,
      heightMm: geometry.heightMm,
      linkedObjectId: null,
      syncState: 'not-synced',
      blockers: [],
    };
  }

  const inSync = nearlyEqual(linked.xMm, geometry.xMm)
    && nearlyEqual(linked.yMm, geometry.yMm)
    && nearlyEqual(linked.widthMm, geometry.widthMm)
    && nearlyEqual(linked.heightMm, geometry.heightMm)
    && linked.rotationDeg === 0;

  return {
    boardId: board.id,
    boardName: board.name,
    outlineId: outline.id,
    widthMm: geometry.widthMm,
    heightMm: geometry.heightMm,
    linkedObjectId: linked.id,
    syncState: inSync ? 'synced' : 'stale',
    blockers: [],
  };
}
