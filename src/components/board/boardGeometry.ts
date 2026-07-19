// Board geometry helpers — pad positions, ratsnest, collision, coordinate transforms

import { Project, BoardComponent, BoardOutline, Trace, PadNetAssignment } from '../../types';
import { getFootprint, FootprintPad, FootprintPreset } from '../../lib/footprints';

// ─── Coordinate transform ─────────────────────────────────────────
export const mmToSvg = (mm: number, zoom: number): number => mm * zoom;
export const svgToMm = (px: number, zoom: number): number => px / zoom;

export const snapToGrid = (val: number, grid: number): number =>
  Math.round(val / grid) * grid;

// ─── Pad position helpers ──────────────────────────────────────────

export interface AbsolutePad {
  componentId: string;
  referenceDesignator: string;
  padName: string;
  x: number; // absolute mm
  y: number; // absolute mm
  width: number;
  height: number;
  netName?: string;
}

/** Rotate a point (px,py) around origin by `deg` degrees */
const rotatePoint = (px: number, py: number, deg: number): { x: number; y: number } => {
  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: px * cos - py * sin,
    y: px * sin + py * cos,
  };
};

/** Get absolute pad positions for a placed component */
export const getComponentPads = (
  comp: BoardComponent,
  footprint?: FootprintPreset
): AbsolutePad[] => {
  const fp = footprint || getFootprint(comp.footprint);
  if (!fp || !fp.pads) return [];
  const cx = comp.placementX ?? 0;
  const cy = comp.placementY ?? 0;
  const rot = comp.rotationDeg ?? 0;

  return fp.pads.map((pad: FootprintPad) => {
    const rotated = rotatePoint(pad.xMm, pad.yMm, rot);
    return {
      componentId: comp.id,
      referenceDesignator: comp.referenceDesignator,
      padName: pad.name,
      x: cx + rotated.x,
      y: cy + rotated.y,
      width: pad.widthMm,
      height: pad.heightMm,
    };
  });
};

/** Get all pads assigned to a given net */
export const getPadsForNet = (
  project: Project,
  netName: string
): AbsolutePad[] => {
  const components = project.boardComponents || [];
  const assignments = project.padNetAssignments || [];
  const nets = project.nets || [];

  const result: AbsolutePad[] = [];

  // From explicit pad-net assignments
  const netAssignments = assignments.filter(a => a.netName === netName);
  for (const asgn of netAssignments) {
    const comp = components.find(c => c.id === asgn.componentId);
    if (!comp) continue;
    const pads = getComponentPads(comp);
    const pad = pads.find(p => p.padName === asgn.padName);
    if (pad) {
      result.push({ ...pad, netName });
    }
  }

  // Also infer from nets source/target component + pin
  const matchingNets = nets.filter(n => n.netName === netName);
  for (const net of matchingNets) {
    // Source side
    if (net.sourceComponent && net.sourcePin) {
      const srcComp = components.find(
        c => c.referenceDesignator === net.sourceComponent || c.id === net.sourceComponent || c.componentName === net.sourceComponent
      );
      if (srcComp) {
        const pads = getComponentPads(srcComp);
        const pin = pads.find(p => p.padName === net.sourcePin);
        if (pin && !result.some(r => r.componentId === pin.componentId && r.padName === pin.padName)) {
          result.push({ ...pin, netName });
        }
      }
    }
    // Target side
    if (net.targetComponent && net.targetPin) {
      const tgtComp = components.find(
        c => c.referenceDesignator === net.targetComponent || c.id === net.targetComponent || c.componentName === net.targetComponent
      );
      if (tgtComp) {
        const pads = getComponentPads(tgtComp);
        const pin = pads.find(p => p.padName === net.targetPin);
        if (pin && !result.some(r => r.componentId === pin.componentId && r.padName === pin.padName)) {
          result.push({ ...pin, netName });
        }
      }
    }
  }

  return result;
};

/** Get the nearest pad to a given point within snapRadius mm */
export const getNearestPad = (
  point: { x: number; y: number },
  pads: AbsolutePad[],
  snapRadius: number = 1.0
): AbsolutePad | null => {
  let closest: AbsolutePad | null = null;
  let minDist = snapRadius;
  for (const pad of pads) {
    const dx = pad.x - point.x;
    const dy = pad.y - point.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < minDist) {
      minDist = dist;
      closest = pad;
    }
  }
  return closest;
};

// ─── Ratsnest ──────────────────────────────────────────────────────

class UnionFind {
  parent: Record<string, string> = {};
  
  find(id: string): string {
    if (!this.parent[id]) {
      this.parent[id] = id;
      return id;
    }
    let p = this.parent[id];
    while (p !== this.parent[p]) {
      this.parent[p] = this.parent[this.parent[p]];
      p = this.parent[p];
    }
    return p;
  }

  union(a: string, b: string) {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA !== rootB) {
      this.parent[rootA] = rootB;
    }
  }
}

export interface RatsnestLine {
  netName: string;
  x1: number; y1: number;
  x2: number; y2: number;
}

/** Compute ratsnest (unrouted connections) for all nets using Union-Find and Kruskal's MST */
export const getNetRatsnestLines = (project: Project): RatsnestLine[] => {
  const nets = project.nets || [];
  const traces = project.traces || [];
  const lines: RatsnestLine[] = [];

  const netNames = Array.from(new Set(nets.map(n => n.netName)));

  for (const netName of netNames) {
    const pads = getPadsForNet(project, netName);
    if (pads.length < 2) continue;

    // Filter traces assigned to this net
    const netTraces = traces.filter(t => t.netName === netName || t.netId === nets.find(n => n.netName === netName)?.id);

    // Initialize Union-Find
    const uf = new UnionFind();
    const padIds = pads.map(p => `${p.componentId}_${p.padName}`);
    
    // Connect elements if they are close (< 0.2mm)
    // 1. Pad to Pad distance check
    for (let i = 0; i < pads.length; i++) {
      for (let j = i + 1; j < pads.length; j++) {
        const dist = Math.hypot(pads[i].x - pads[j].x, pads[i].y - pads[j].y);
        if (dist < 0.2) {
          uf.union(padIds[i], padIds[j]);
        }
      }
    }

    // 2. Traces connection to Pads and other Traces
    const traceIds = netTraces.map((_, idx) => `trace_${idx}`);
    
    // Union Trace to Pads
    netTraces.forEach((trace, tIdx) => {
      const tId = traceIds[tIdx];
      const pts = trace.points;
      if (!pts || pts.length === 0) return;

      pads.forEach((pad, pIdx) => {
        const pId = padIds[pIdx];
        
        // Check if any point on the trace is near the pad (threshold 0.2mm)
        const isNear = pts.some(pt => Math.hypot(pt.x - pad.x, pt.y - pad.y) < 0.2);
        if (isNear) {
          uf.union(tId, pId);
        }
      });
    });

    // Union Trace to Trace (if they overlap/intersect within 0.2mm)
    for (let i = 0; i < netTraces.length; i++) {
      for (let j = i + 1; j < netTraces.length; j++) {
        const t1 = netTraces[i];
        const t2 = netTraces[j];
        if (!t1.points || !t2.points) continue;
        
        let connected = false;
        for (const p1 of t1.points) {
          for (const p2 of t2.points) {
            if (Math.hypot(p1.x - p2.x, p1.y - p2.y) < 0.2) {
              connected = true;
              break;
            }
          }
          if (connected) break;
        }

        if (connected) {
          uf.union(traceIds[i], traceIds[j]);
        }
      }
    }

    // Group pads by their root connected components
    const componentGroups: Record<string, typeof pads> = {};
    pads.forEach((pad, idx) => {
      const root = uf.find(padIds[idx]);
      if (!componentGroups[root]) {
        componentGroups[root] = [];
      }
      componentGroups[root].push(pad);
    });

    const groups = Object.values(componentGroups);
    if (groups.length < 2) {
      // Net is fully routed!
      continue;
    }

    // Build Kruskal's MST between disjoint pad components
    interface Edge {
      u: number; // group index A
      v: number; // group index B
      padA: typeof pads[0];
      padB: typeof pads[0];
      weight: number;
    }

    const edges: Edge[] = [];
    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        const gA = groups[i];
        const gB = groups[j];
        
        let minWeight = Infinity;
        let bestPair: [typeof pads[0], typeof pads[0]] | null = null;

        for (const pA of gA) {
          for (const pB of gB) {
            const dist = Math.hypot(pA.x - pB.x, pA.y - pB.y);
            if (dist < minWeight) {
              minWeight = dist;
              bestPair = [pA, pB];
            }
          }
        }

        if (bestPair) {
          edges.push({
            u: i,
            v: j,
            padA: bestPair[0],
            padB: bestPair[1],
            weight: minWeight
          });
        }
      }
    }

    // Sort edges by weight (distance)
    edges.sort((a, b) => a.weight - b.weight);

    // Union-Find over the group indices to build the MST
    const groupUf = new UnionFind();
    let edgeCount = 0;
    for (const edge of edges) {
      if (groupUf.find(String(edge.u)) !== groupUf.find(String(edge.v))) {
        groupUf.union(String(edge.u), String(edge.v));
        lines.push({
          netName,
          x1: edge.padA.x,
          y1: edge.padA.y,
          x2: edge.padB.x,
          y2: edge.padB.y
        });
        edgeCount++;
        if (edgeCount === groups.length - 1) break;
      }
    }
  }

  return lines;
};

// ─── Board outline helpers ─────────────────────────────────────────

/** Check if a point is inside a board outline polygon */
export const isPointInsideOutline = (
  point: { x: number; y: number },
  outline: BoardOutline
): boolean => {
  // Rectangular outline
  if (outline.width && outline.height && (!outline.points || outline.points.length === 0)) {
    return point.x >= 0 && point.x <= outline.width && point.y >= 0 && point.y <= outline.height;
  }
  // Polygon outline: ray casting
  const pts = outline.points || [];
  if (pts.length < 3) return true; // no valid outline, assume inside

  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i].x, yi = pts[i].y;
    const xj = pts[j].x, yj = pts[j].y;
    const intersect = ((yi > point.y) !== (yj > point.y)) &&
      (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

/** Get bounding box of a board outline */
export const getOutlineBounds = (outline: BoardOutline): { minX: number; minY: number; maxX: number; maxY: number } => {
  if (outline.width && outline.height && (!outline.points || outline.points.length === 0)) {
    return { minX: 0, minY: 0, maxX: outline.width, maxY: outline.height };
  }
  const pts = outline.points || [];
  if (pts.length === 0) return { minX: 0, minY: 0, maxX: 50, maxY: 30 };
  const xs = pts.map(p => p.x);
  const ys = pts.map(p => p.y);
  return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
};

// ─── Component bounding box / overlap ──────────────────────────────

export interface BBox {
  minX: number; minY: number;
  maxX: number; maxY: number;
}

export const getComponentBoundingBox = (comp: BoardComponent, footprint?: FootprintPreset): BBox => {
  const fp = footprint || getFootprint(comp.footprint);
  const cx = comp.placementX ?? 0;
  const cy = comp.placementY ?? 0;
  const hw = (fp.courtyardWidthMm || fp.bodyWidthMm) / 2;
  const hh = (fp.courtyardHeightMm || fp.bodyHeightMm) / 2;
  // For simplicity, use courtyard as AABB (ignore rotation for overlap check — close enough for DRC)
  const maxDim = Math.max(hw, hh);
  return {
    minX: cx - maxDim,
    minY: cy - maxDim,
    maxX: cx + maxDim,
    maxY: cy + maxDim,
  };
};

export const bboxesOverlap = (a: BBox, b: BBox): boolean => {
  return a.minX < b.maxX && a.maxX > b.minX && a.minY < b.maxY && a.maxY > b.minY;
};

export const componentsOverlap = (a: BoardComponent, b: BoardComponent): boolean => {
  if (a.side !== b.side && a.side !== 'Both' && b.side !== 'Both') return false;
  return bboxesOverlap(getComponentBoundingBox(a), getComponentBoundingBox(b));
};

// ─── Outline generators ────────────────────────────────────────────

export const generateRectangularOutline = (widthMm: number, heightMm: number, boardId: string): BoardOutline => ({
  id: `outline_rect_${Date.now()}`,
  boardId,
  width: widthMm,
  height: heightMm,
  points: [
    { x: 0, y: 0 },
    { x: widthMm, y: 0 },
    { x: widthMm, y: heightMm },
    { x: 0, y: heightMm },
  ],
  units: 'mm',
  notes: 'Rectangular board outline',
});

// ─── Auto-place heuristic ──────────────────────────────────────────

export const autoPlaceComponents = (
  components: BoardComponent[],
  outline: BoardOutline | undefined
): BoardComponent[] => {
  const bounds = outline ? getOutlineBounds(outline) : { minX: 0, minY: 0, maxX: 50, maxY: 30 };
  const boardW = bounds.maxX - bounds.minX;
  const boardH = bounds.maxY - bounds.minY;
  const centerX = bounds.minX + boardW / 2;
  const centerY = bounds.minY + boardH / 2;

  // Sort components by placement priority
  const sortOrder: Record<string, number> = {
    'MCU': 0, 'RF': 1, 'Power': 2, 'Charger': 3, 'Sensor': 4,
    'Haptic': 5, 'LED': 6, 'Protection': 7, 'Connector': 8, 'Debug': 9,
  };

  const sorted = [...components].sort((a, b) => {
    const oa = sortOrder[a.componentType] ?? 10;
    const ob = sortOrder[b.componentType] ?? 10;
    return oa - ob;
  });

  const placed: BoardComponent[] = [];
  let ring = 0;
  let angleStep = 0;
  let idx = 0;

  for (const comp of sorted) {
    if (comp.lockedPlacement && comp.placementX != null) {
      placed.push(comp);
      continue;
    }

    // Place MCU at center
    if (idx === 0) {
      placed.push({
        ...comp,
        placementX: centerX,
        placementY: centerY,
        placementStatus: 'Needs Review',
      });
    } else {
      // Concentric ring placement
      ring = Math.floor((idx - 1) / 6) + 1;
      angleStep = ((idx - 1) % 6) * (Math.PI * 2 / 6) + (ring * 0.3);
      const radius = Math.min(boardW, boardH) * 0.15 * ring;
      const px = centerX + Math.cos(angleStep) * radius;
      const py = centerY + Math.sin(angleStep) * radius;

      // Clamp inside board
      const clampedX = Math.max(bounds.minX + 3, Math.min(bounds.maxX - 3, px));
      const clampedY = Math.max(bounds.minY + 3, Math.min(bounds.maxY - 3, py));

      placed.push({
        ...comp,
        placementX: Math.round(clampedX * 4) / 4, // snap to 0.25mm
        placementY: Math.round(clampedY * 4) / 4,
        placementStatus: 'Needs Review',
      });
    }
    idx++;
  }

  return placed;
};

// ─── Rough autoroute ───────────────────────────────────────────────

export const roughAutorouteNet = (
  project: Project,
  netName: string,
  layerId: string,
  boardId: string
): Trace | null => {
  const pads = getPadsForNet(project, netName);
  if (pads.length < 2) return null;

  // Simple L-route: go horizontal then vertical from pad A to pad B
  const srcPad = pads[0];
  const tgtPad = pads[1];

  const midX = tgtPad.x;
  const midY = srcPad.y;

  const points = [
    { x: srcPad.x, y: srcPad.y },
    { x: midX, y: midY },
    { x: tgtPad.x, y: tgtPad.y },
  ];

  const dx = tgtPad.x - srcPad.x;
  const dy = tgtPad.y - srcPad.y;
  const length = Math.abs(dx) + Math.abs(dy);

  return {
    id: `trace_auto_${netName}_${Date.now()}`,
    boardId,
    layerId,
    netId: (project.nets || []).find(n => n.netName === netName)?.id,
    netName,
    points,
    width: netName.toLowerCase().includes('gnd') || netName.toLowerCase().includes('vbat') || netName.toLowerCase().includes('3v3') ? 0.3 : 0.15,
    status: 'Needs Review' as const,
    lengthEstimate: Math.round(length * 100) / 100,
  };
};

// ─── Pad-net assignment inference ──────────────────────────────────

export const inferPadNetAssignments = (project: Project): PadNetAssignment[] => {
  const nets = project.nets || [];
  const components = project.boardComponents || [];
  const existing = project.padNetAssignments || [];
  const result: PadNetAssignment[] = [...existing];

  for (const net of nets) {
    // Source pad
    if (net.sourceComponent && net.sourcePin) {
      const comp = components.find(
        c => c.referenceDesignator === net.sourceComponent || c.componentName === net.sourceComponent || c.id === net.sourceComponent
      );
      if (comp && !result.some(r => r.componentId === comp.id && r.padName === net.sourcePin && r.netName === net.netName)) {
        result.push({
          id: `pna_${comp.id}_${net.sourcePin}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          componentId: comp.id,
          referenceDesignator: comp.referenceDesignator,
          padName: net.sourcePin,
          netName: net.netName,
        });
      }
    }
    // Target pad
    if (net.targetComponent && net.targetPin) {
      const comp = components.find(
        c => c.referenceDesignator === net.targetComponent || c.componentName === net.targetComponent || c.id === net.targetComponent
      );
      if (comp && !result.some(r => r.componentId === comp.id && r.padName === net.targetPin && r.netName === net.netName)) {
        result.push({
          id: `pna_${comp.id}_${net.targetPin}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          componentId: comp.id,
          referenceDesignator: comp.referenceDesignator,
          padName: net.targetPin,
          netName: net.netName,
        });
      }
    }
  }

  return result;
};
