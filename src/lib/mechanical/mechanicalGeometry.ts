import { MechanicalObject, Project } from '../../types';

export interface ViewState {
  offsetX: number;
  offsetY: number;
  scale: number;
}

export interface BoundingBox {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
  width: number;
  height: number;
}

/** Convert screen coordinates to mechanical mm */
export function screenToMechanicalMm(
  screenX: number,
  screenY: number,
  view: ViewState
): { xMm: number; yMm: number } {
  return {
    xMm: (screenX - view.offsetX) / view.scale,
    yMm: (screenY - view.offsetY) / view.scale
  };
}

/** Convert mechanical mm to screen coordinates */
export function mechanicalMmToScreen(
  xMm: number,
  yMm: number,
  view: ViewState
): { x: number; y: number } {
  return {
    x: xMm * view.scale + view.offsetX,
    y: yMm * view.scale + view.offsetY
  };
}

/** Snap a point to grid */
export function snapMechanicalPoint(
  point: { xMm: number; yMm: number },
  gridMm: number
): { xMm: number; yMm: number } {
  if (gridMm <= 0) return point;
  return {
    xMm: Math.round(point.xMm / gridMm) * gridMm,
    yMm: Math.round(point.yMm / gridMm) * gridMm
  };
}

/** Get bounding box for a mechanical object */
export function getMechanicalBoundingBox(obj: MechanicalObject): BoundingBox {
  if (obj.shape === 'circle' && obj.radiusMm) {
    const r = obj.radiusMm;
    return {
      xMin: obj.xMm - r,
      yMin: obj.yMm - r,
      xMax: obj.xMm + r,
      yMax: obj.yMm + r,
      width: r * 2,
      height: r * 2
    };
  }

  if (obj.shape === 'polygon' && obj.points && obj.points.length > 0) {
    let xMin = Infinity, yMin = Infinity, xMax = -Infinity, yMax = -Infinity;
    for (const p of obj.points) {
      const px = obj.xMm + p.x;
      const py = obj.yMm + p.y;
      if (px < xMin) xMin = px;
      if (py < yMin) yMin = py;
      if (px > xMax) xMax = px;
      if (py > yMax) yMax = py;
    }
    return { xMin, yMin, xMax, yMax, width: xMax - xMin, height: yMax - yMin };
  }

  // rect or ellipse
  const w = obj.widthMm || 0;
  const h = obj.heightMm || 0;
  return {
    xMin: obj.xMm,
    yMin: obj.yMm,
    xMax: obj.xMm + w,
    yMax: obj.yMm + h,
    width: w,
    height: h
  };
}

/** Check if two axis-aligned bounding boxes overlap */
function boxesOverlap(a: BoundingBox, b: BoundingBox): boolean {
  return a.xMin < b.xMax && a.xMax > b.xMin && a.yMin < b.yMax && a.yMax > b.yMin;
}

/** Check if two mechanical objects overlap using bounding boxes */
export function mechanicalObjectsOverlap(a: MechanicalObject, b: MechanicalObject): boolean {
  const bbA = getMechanicalBoundingBox(a);
  const bbB = getMechanicalBoundingBox(b);
  return boxesOverlap(bbA, bbB);
}

/** Check if inner object is fully contained within outer object */
export function isMechanicalObjectContained(
  inner: MechanicalObject,
  outer: MechanicalObject
): boolean {
  const bbInner = getMechanicalBoundingBox(inner);
  const bbOuter = getMechanicalBoundingBox(outer);
  return (
    bbInner.xMin >= bbOuter.xMin &&
    bbInner.yMin >= bbOuter.yMin &&
    bbInner.xMax <= bbOuter.xMax &&
    bbInner.yMax <= bbOuter.yMax
  );
}

/** Polygon vertex manipulation helpers */
export function movePolygonVertex(
  obj: MechanicalObject,
  vertexIndex: number,
  newPoint: { x: number; y: number }
): MechanicalObject {
  if (!obj.points || vertexIndex < 0 || vertexIndex >= obj.points.length) return obj;
  const updatedPoints = [...obj.points];
  updatedPoints[vertexIndex] = newPoint;
  return { ...obj, points: updatedPoints };
}

export function insertPolygonVertex(
  obj: MechanicalObject,
  afterIndex: number,
  newPoint: { x: number; y: number }
): MechanicalObject {
  const points = obj.points || [];
  const updatedPoints = [...points];
  const idx = Math.min(Math.max(0, afterIndex + 1), points.length);
  updatedPoints.splice(idx, 0, newPoint);
  return { ...obj, points: updatedPoints };
}

export function deletePolygonVertex(
  obj: MechanicalObject,
  vertexIndex: number
): MechanicalObject {
  if (!obj.points || obj.points.length <= 3 || vertexIndex < 0 || vertexIndex >= obj.points.length) return obj;
  const updatedPoints = obj.points.filter((_, i) => i !== vertexIndex);
  return { ...obj, points: updatedPoints };
}

/** Lightweight Geometric Constraint Solver */
export function applyLightweightConstraint(
  type: 'centre-align' | 'fixed-distance' | 'equal-width' | 'equal-height',
  target: MechanicalObject,
  reference: MechanicalObject,
  distanceMm: number = 10
): MechanicalObject {
  const refBbox = getMechanicalBoundingBox(reference);
  const tgtBbox = getMechanicalBoundingBox(target);

  switch (type) {
    case 'centre-align': {
      const refCenterX = refBbox.xMin + refBbox.width / 2;
      const refCenterY = refBbox.yMin + refBbox.height / 2;
      return {
        ...target,
        xMm: refCenterX - tgtBbox.width / 2,
        yMm: refCenterY - tgtBbox.height / 2
      };
    }
    case 'fixed-distance': {
      return {
        ...target,
        xMm: refBbox.xMax + distanceMm
      };
    }
    case 'equal-width': {
      return {
        ...target,
        widthMm: reference.widthMm || refBbox.width
      };
    }
    default:
      return target;
  }
}

export function minimumDistanceBetweenMechanicalObjects(a: MechanicalObject, b: MechanicalObject): number {
  const bbA = getMechanicalBoundingBox(a);
  const bbB = getMechanicalBoundingBox(b);
  const dx = Math.max(0, Math.max(bbA.xMin - bbB.xMax, bbB.xMin - bbA.xMax));
  const dy = Math.max(0, Math.max(bbA.yMin - bbB.yMax, bbB.yMin - bbA.yMax));
  return Math.sqrt(dx * dx + dy * dy);
}

export interface BoundingBox3D {
  xMin: number; xMax: number;
  yMin: number; yMax: number;
  zMin: number; zMax: number;
}

export interface CollisionPair {
  bodyA: string;
  bodyB: string;
  overlapX: number;
  overlapY: number;
  overlapZ: number;
  distanceMm: number;
}

export interface CollisionResult {
  hasCollision: boolean;
  collisions: CollisionPair[];
  minClearanceMm: number | null;
}

function finiteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function positiveNumber(value: unknown): value is number {
  return finiteNumber(value) && value > 0;
}

/**
 * Lightweight AABB interference screening.
 *
 * This is deliberately not a CAD-kernel clearance check. Only explicit recorded
 * coordinates and dimensions participate; missing engineering geometry stays
 * unresolved instead of being replaced with plausible-looking defaults.
 */
export function checkMechanicalInterference(project: Project): CollisionResult {
  const enclosures: { id: string; name: string; bbox: BoundingBox3D }[] = [];
  const internalBodies: { id: string; name: string; bbox: BoundingBox3D }[] = [];

  // 1. Explicit 3D mechanical bodies only. Flat fields and the newer
  // position/dimensions representation are both accepted when fully specified.
  (project.mechanicalBodies || []).forEach((body) => {
    const xMm = finiteNumber(body.xMm) ? body.xMm : body.position?.x;
    const yMm = finiteNumber(body.yMm) ? body.yMm : body.position?.y;
    const zMm = finiteNumber(body.zMm) ? body.zMm : body.position?.z;
    const widthMm = positiveNumber(body.widthMm) ? body.widthMm : body.dimensions?.x;
    const heightMm = positiveNumber(body.heightMm) ? body.heightMm : body.dimensions?.y;
    const depthMm = positiveNumber(body.depthMm) ? body.depthMm : body.dimensions?.z;

    if (!finiteNumber(xMm) || !finiteNumber(yMm) || !finiteNumber(zMm)
      || !positiveNumber(widthMm) || !positiveNumber(heightMm) || !positiveNumber(depthMm)) {
      return;
    }

    const item = {
      id: body.id,
      name: body.name || 'Mechanical Body',
      bbox: {
        xMin: xMm,
        xMax: xMm + widthMm,
        yMin: yMm,
        yMax: yMm + heightMm,
        zMin: zMm,
        zMax: zMm + depthMm
      }
    };
    if (body.objectType === 'Enclosure' || body.name?.toLowerCase().includes('enclosure')) {
      enclosures.push(item);
    } else {
      internalBodies.push(item);
    }
  });

  // 2. A 2D mechanical object participates only when explicit depth exists.
  // MechanicalObject currently has no Z transform, so the local screening plane is Z=0.
  (project.mechanicalObjects || []).forEach((obj) => {
    if (!positiveNumber(obj.depthMm)) return;
    const bbox2d = getMechanicalBoundingBox(obj);
    if (!positiveNumber(bbox2d.width) || !positiveNumber(bbox2d.height)) return;

    const item = {
      id: obj.id,
      name: obj.name || 'Mechanical Component',
      bbox: {
        xMin: bbox2d.xMin,
        xMax: bbox2d.xMax,
        yMin: bbox2d.yMin,
        yMax: bbox2d.yMax,
        zMin: 0,
        zMax: obj.depthMm
      }
    };
    if (obj.layer === 'Enclosure' || obj.type === 'Outer Profile') {
      enclosures.push(item);
    } else {
      internalBodies.push(item);
    }
  });

  // 3. Board components participate only when the selected board is a real project
  // board and the placement + package dimensions are explicit. There is no
  // synthetic board fallback and no invented component position/package geometry.
  const realBoardIds = new Set((project.boards || []).map((board) => board.id));
  const activeBoardId = project.activeBoardId && realBoardIds.has(project.activeBoardId)
    ? project.activeBoardId
    : null;

  if (activeBoardId) {
    (project.boardComponents || [])
      .filter((component) => component.boardId === activeBoardId && component.pcb?.placed === true)
      .forEach((component) => {
        const cx = component.pcb?.xMm;
        const cy = component.pcb?.yMm;
        const packageDim = component.packageDimensions;
        if (!finiteNumber(cx) || !finiteNumber(cy) || !packageDim
          || !positiveNumber(packageDim.widthMm)
          || !positiveNumber(packageDim.heightMm)
          || !positiveNumber(packageDim.heightZMm)) {
          return;
        }

        // The current lightweight representation uses the board plane as Z=0.
        // This is an approximate screening convention, not an assembly transform.
        internalBodies.push({
          id: component.id,
          name: `${component.referenceDesignator || 'Component'} (${component.componentName || 'Component'})`,
          bbox: {
            xMin: cx - packageDim.widthMm / 2,
            xMax: cx + packageDim.widthMm / 2,
            yMin: cy - packageDim.heightMm / 2,
            yMax: cy + packageDim.heightMm / 2,
            zMin: 0,
            zMax: packageDim.heightZMm
          }
        });
      });
  }

  const collisions: CollisionPair[] = [];
  let minClearanceMm: number | null = null;

  // A. Internal Object vs Internal Object Collisions (e.g. Component ↔ Battery, Component A ↔ Component B)
  for (let i = 0; i < internalBodies.length; i++) {
    for (let j = i + 1; j < internalBodies.length; j++) {
      const a = internalBodies[i].bbox;
      const b = internalBodies[j].bbox;

      const overlapX = Math.min(a.xMax, b.xMax) - Math.max(a.xMin, b.xMin);
      const overlapY = Math.min(a.yMax, b.yMax) - Math.max(a.yMin, b.yMin);
      const overlapZ = Math.min(a.zMax, b.zMax) - Math.max(a.zMin, b.zMin);

      if (overlapX > 0 && overlapY > 0 && overlapZ > 0) {
        collisions.push({
          bodyA: internalBodies[i].name,
          bodyB: internalBodies[j].name,
          overlapX: Math.round(overlapX * 100) / 100,
          overlapY: Math.round(overlapY * 100) / 100,
          overlapZ: Math.round(overlapZ * 100) / 100,
          distanceMm: 0
        });
        minClearanceMm = 0;
      } else {
        const dx = Math.max(0, Math.max(a.xMin - b.xMax, b.xMin - a.xMax));
        const dy = Math.max(0, Math.max(a.yMin - b.yMax, b.yMin - a.yMax));
        const dz = Math.max(0, Math.max(a.zMin - b.zMax, b.zMin - a.zMax));
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (minClearanceMm === null || dist < minClearanceMm) minClearanceMm = dist;
      }
    }
  }

  // B. Enclosure Boundary Protrusion Checks (Component/Battery extends OUTSIDE Enclosure)
  for (const enc of enclosures) {
    for (const body of internalBodies) {
      const a = body.bbox;
      const e = enc.bbox;

      if (a.xMin < e.xMin || a.xMax > e.xMax || a.yMin < e.yMin || a.yMax > e.yMax || a.zMax > e.zMax) {
        const pX = Math.max(0, e.xMin - a.xMin, a.xMax - e.xMax);
        const pY = Math.max(0, e.yMin - a.yMin, a.yMax - e.yMax);
        const pZ = Math.max(0, a.zMax - e.zMax);
        collisions.push({
          bodyA: body.name,
          bodyB: `${enc.name} (Boundary Protrusion)`,
          overlapX: Math.round(pX * 100) / 100,
          overlapY: Math.round(pY * 100) / 100,
          overlapZ: Math.round(pZ * 100) / 100,
          distanceMm: 0
        });
        minClearanceMm = 0;
      }
    }
  }

  return {
    hasCollision: collisions.length > 0,
    collisions,
    minClearanceMm: minClearanceMm === null ? null : Math.round(minClearanceMm * 100) / 100
  };
}

/** Parametric Screw Standoff Boss Geometry */
export interface ScrewBossParams {
  threadType: 'M2' | 'M2.5' | 'M3' | 'M4';
  outerRadiusMm: number;
  pilotHoleRadiusMm: number;
  heightMm: number;
  draftAngleDeg: number;
  ribCount: number;
}

export function computeScrewBossGeometry(
  threadType: 'M2' | 'M2.5' | 'M3' | 'M4' = 'M3',
  heightMm: number = 8.0
): ScrewBossParams {
  const specs: Record<string, { outerR: number; pilotR: number }> = {
    M2: { outerR: 2.2, pilotR: 0.9 },
    'M2.5': { outerR: 2.7, pilotR: 1.1 },
    M3: { outerR: 3.2, pilotR: 1.35 },
    M4: { outerR: 4.2, pilotR: 1.8 }
  };
  const spec = specs[threadType] || specs.M3;
  return {
    threadType,
    outerRadiusMm: spec.outerR,
    pilotHoleRadiusMm: spec.pilotR,
    heightMm,
    draftAngleDeg: 1.5,
    ribCount: 4
  };
}

/** Parametric Cantilever Snap-Fit Clip Geometry */
export interface SnapFitClipParams {
  beamLengthMm: number;
  beamWidthMm: number;
  beamThicknessMm: number;
  undercutDepthMm: number;
  insertionAngleDeg: number;
  retractionAngleDeg: number;
  maxDeflectionMm: number;
}

export function computeSnapFitClipGeometry(
  beamLengthMm: number = 10.0,
  beamWidthMm: number = 5.0
): SnapFitClipParams {
  const thickness = 1.5;
  const undercut = 0.8;
  const maxDeflection = (undercut * 1.2);
  return {
    beamLengthMm,
    beamWidthMm,
    beamThicknessMm: thickness,
    undercutDepthMm: undercut,
    insertionAngleDeg: 45,
    retractionAngleDeg: 45,
    maxDeflectionMm: Math.round(maxDeflection * 100) / 100
  };
}

/** Parametric Enclosure Wall & Corner Fillet Shell */
export interface EnclosureShellParams {
  outerWidthMm: number;
  outerHeightMm: number;
  outerDepthMm: number;
  wallThicknessMm: number;
  cornerFilletRadiusMm: number;
  innerWidthMm: number;
  innerHeightMm: number;
  innerDepthMm: number;
}

export function computeEnclosureShell(
  outerWidthMm: number = 100,
  outerHeightMm: number = 60,
  outerDepthMm: number = 25,
  wallThicknessMm: number = 2.0,
  cornerFilletRadiusMm: number = 3.0
): EnclosureShellParams {
  const innerWidthMm = Math.max(10, outerWidthMm - wallThicknessMm * 2);
  const innerHeightMm = Math.max(10, outerHeightMm - wallThicknessMm * 2);
  const innerDepthMm = Math.max(5, outerDepthMm - wallThicknessMm * 2);
  return {
    outerWidthMm,
    outerHeightMm,
    outerDepthMm,
    wallThicknessMm,
    cornerFilletRadiusMm,
    innerWidthMm,
    innerHeightMm,
    innerDepthMm
  };
}
