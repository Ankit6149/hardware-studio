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

/** Minimum axis-aligned distance between two objects (0 if overlapping) */
export function minimumDistanceBetweenMechanicalObjects(
  a: MechanicalObject,
  b: MechanicalObject
): number {
  const bbA = getMechanicalBoundingBox(a);
  const bbB = getMechanicalBoundingBox(b);

  const dx = Math.max(0, Math.max(bbA.xMin - bbB.xMax, bbB.xMin - bbA.xMax));
  const dy = Math.max(0, Math.max(bbA.yMin - bbB.yMax, bbB.yMin - bbA.yMax));

  return Math.sqrt(dx * dx + dy * dy);
}
