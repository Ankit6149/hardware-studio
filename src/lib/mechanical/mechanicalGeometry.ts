import { MechanicalObject } from '../../types';

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
  minClearanceMm: number;
}

/** Check 3D Spatial Interference between all internal bodies, components, battery, and enclosure boundaries */
export function checkMechanicalInterference(project: any): CollisionResult {
  const enclosures: { id: string; name: string; bbox: BoundingBox3D }[] = [];
  const internalBodies: { id: string; name: string; bbox: BoundingBox3D }[] = [];

  // 1. Separate Enclosure Shells vs Internal Bodies
  (project.mechanicalBodies || []).forEach((b: any) => {
    const w = b.widthMm || 100;
    const h = b.heightMm || 60;
    const d = b.depthMm || 20;
    const item = {
      id: b.id || 'body_enc',
      name: b.name || 'Enclosure Shell',
      bbox: {
        xMin: b.xMm || 0,
        xMax: (b.xMm || 0) + w,
        yMin: b.yMm || 0,
        yMax: (b.yMm || 0) + h,
        zMin: b.zMm || 0,
        zMax: (b.zMm || 0) + d
      }
    };
    if (b.objectType === 'Enclosure' || b.name?.toLowerCase().includes('enclosure')) {
      enclosures.push(item);
    } else {
      internalBodies.push(item);
    }
  });

  // 2. Mechanical Objects
  (project.mechanicalObjects || []).forEach((obj: any) => {
    const bbox2d = getMechanicalBoundingBox(obj);
    const zDepth = obj.depthMm || (obj.layer === 'Enclosure' ? 25 : obj.layer === 'Battery' ? 10 : 5);
    const zBase = obj.layer === 'Battery' ? 2 : 0;
    const item = {
      id: obj.id,
      name: obj.name || 'Mechanical Component',
      bbox: {
        xMin: bbox2d.xMin,
        xMax: bbox2d.xMax,
        yMin: bbox2d.yMin,
        yMax: bbox2d.yMax,
        zMin: zBase,
        zMax: zBase + zDepth
      }
    };
    if (obj.layer === 'Enclosure' || obj.type === 'Outer Profile') {
      enclosures.push(item);
    } else {
      internalBodies.push(item);
    }
  });

  // 3. Placed Board Components with Package Dimensions
  const activeBoardId = project.activeBoardId || 'board_main';
  (project.boardComponents || [])
    .filter((c: any) => c.boardId === activeBoardId && c.pcb?.placed !== false)
    .forEach((c: any) => {
      const cx = c.pcb?.xMm ?? c.placementX ?? 0;
      const cy = c.pcb?.yMm ?? c.placementY ?? 0;
      const packageDim = c.packageDimensions || { widthMm: 8, heightMm: 8, heightZMm: 3 };
      const compW = packageDim.widthMm || 8;
      const compH = packageDim.heightMm || 8;
      const compZ = packageDim.heightZMm || 3;
      const pcbZBase = 5;

      internalBodies.push({
        id: c.id,
        name: `${c.referenceDesignator || 'U'} (${c.componentName || 'Component'})`,
        bbox: {
          xMin: cx - compW / 2,
          xMax: cx + compW / 2,
          yMin: cy - compH / 2,
          yMax: cy + compH / 2,
          zMin: pcbZBase,
          zMax: pcbZBase + compZ
        }
      });
    });

  const collisions: CollisionPair[] = [];
  let minClearanceMm = Infinity;

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
        if (dist < minClearanceMm) minClearanceMm = dist;
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

  if (minClearanceMm === Infinity) minClearanceMm = 5.0;

  return {
    hasCollision: collisions.length > 0,
    collisions,
    minClearanceMm: Math.round(minClearanceMm * 100) / 100
  };
}
