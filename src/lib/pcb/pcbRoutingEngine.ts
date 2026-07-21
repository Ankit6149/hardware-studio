// pcbRoutingEngine.ts — Production PCB Routing Engine
import { BoardComponent, Trace, Via, NetItem, PadNetAssignment, Project } from '../../types';
import { getComponentPads, getNearestPad } from '../../components/board/boardGeometry';

export type PCBAnchorType = 'pad' | 'via' | 'trace-end' | 'dangling';

export interface PCBAnchor {
  type: PCBAnchorType;
  componentId?: string;
  padName?: string;
  viaId?: string;
  traceId?: string;
  endpoint?: 'start' | 'end';
  xMm: number;
  yMm: number;
  netName?: string;
  layer?: string;
}

export interface RouteSession {
  boardId: string;
  netName: string;
  layerId: string;
  startAnchor: PCBAnchor;
  currentPoints: { x: number; y: number }[];
  isRouting: boolean;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  targetAnchor?: PCBAnchor;
}

/** Resolve an anchor at given coordinates */
export function resolvePCBAnchor(
  point: { x: number; y: number },
  boardComponents: BoardComponent[],
  padNetAssignments: PadNetAssignment[],
  vias: Via[],
  traces: Trace[],
  activeBoardId: string,
  layerId: string,
  toleranceMm: number = 1.5
): PCBAnchor | null {
  // 1. Check pads on active board
  const activeComps = (boardComponents || []).filter(c => (c.boardId || 'board-main') === activeBoardId);
  const allPads = activeComps.flatMap(comp => {
    if (comp.placementX == null || comp.placementY == null) return [];
    return getComponentPads(comp).map(p => ({
      ...p,
      componentId: comp.id,
      netName: (padNetAssignments || []).find(a => (a.componentId === comp.id || a.componentId === comp.referenceDesignator) && a.padName === p.padName)?.netName || ''
    }));
  });

  const nearestPad = getNearestPad(point, allPads, toleranceMm);
  if (nearestPad) {
    return {
      type: 'pad',
      componentId: (nearestPad as any).componentId,
      padName: nearestPad.padName,
      xMm: nearestPad.x,
      yMm: nearestPad.y,
      netName: nearestPad.netName,
      layer: layerId,
    };
  }

  // 2. Check vias on active board
  const activeVias = (vias || []).filter(v => (v.boardId || 'board-main') === activeBoardId);
  for (const via of activeVias) {
    if (via.x != null && via.y != null) {
      const dist = Math.hypot(point.x - via.x, point.y - via.y);
      if (dist <= (via.outerDiameter || 0.6) / 2 + toleranceMm) {
        return {
          type: 'via',
          viaId: via.id,
          xMm: via.x,
          yMm: via.y,
          netName: via.netId || '',
          layer: layerId,
        };
      }
    }
  }

  // 3. Check trace endpoints on active board
  const activeTraces = (traces || []).filter(t => (t.boardId || 'board-main') === activeBoardId && (t.layerId || 'top-copper') === layerId);
  for (const trace of activeTraces) {
    const pts = trace.points || [];
    if (pts.length >= 2) {
      const startPt = pts[0];
      const endPt = pts[pts.length - 1];

      const startDist = Math.hypot(point.x - startPt.x, point.y - startPt.y);
      if (startDist <= (trace.width || 0.25) / 2 + toleranceMm) {
        return {
          type: 'trace-end',
          traceId: trace.id,
          endpoint: 'start',
          xMm: startPt.x,
          yMm: startPt.y,
          netName: trace.netId || '',
          layer: trace.layerId || 'top-copper',
        };
      }
      const endDist = Math.hypot(point.x - endPt.x, point.y - endPt.y);
      if (endDist <= (trace.width || 0.25) / 2 + toleranceMm) {
        return {
          type: 'trace-end',
          traceId: trace.id,
          endpoint: 'end',
          xMm: endPt.x,
          yMm: endPt.y,
          netName: trace.netId || '',
          layer: trace.layerId || 'top-copper',
        };
      }
    }
  }

  return null;
}

/** Validate whether a route can start from an anchor */
export function validateRouteStartAnchor(
  anchor: PCBAnchor | null,
  requestedNetName?: string
): ValidationResult {
  if (!anchor) {
    return {
      valid: false,
      error: 'Cannot start route in empty space. Click on a pad, via, or trace endpoint.'
    };
  }

  const anchorNet = anchor.netName;
  if (!anchorNet) {
    return {
      valid: false,
      error: `Selected anchor (${anchor.type}) is not assigned to any net.`
    };
  }

  if (requestedNetName && anchorNet !== requestedNetName) {
    return {
      valid: false,
      error: `Net mismatch: Anchor belongs to net '${anchorNet}', but selected net is '${requestedNetName}'.`
    };
  }

  return { valid: true, targetAnchor: anchor };
}

/** Validate whether a route can finish at a target anchor */
export function validateRouteFinishAnchor(
  startNetName: string,
  targetAnchor: PCBAnchor | null
): ValidationResult {
  if (!targetAnchor) {
    return {
      valid: false,
      error: 'Normal routing cannot finish in empty space. Use "Finish as Dangling Draft" to place a draft trace.'
    };
  }

  if (!targetAnchor.netName) {
    return {
      valid: false,
      error: `Target ${targetAnchor.type} is unassigned.`
    };
  }

  if (targetAnchor.netName !== startNetName) {
    return {
      valid: false,
      error: `Wrong Net Connection Rejected! Target belongs to net '${targetAnchor.netName}', but active route is '${startNetName}'.`
    };
  }

  return { valid: true, targetAnchor };
}

/** Begin a routing session from an anchor */
export function beginRouteFromAnchor(
  anchor: PCBAnchor,
  boardId: string,
  layerId: string
): RouteSession {
  return {
    boardId,
    netName: anchor.netName || '',
    layerId,
    startAnchor: anchor,
    currentPoints: [{ x: anchor.xMm, y: anchor.yMm }],
    isRouting: true
  };
}

/** Compute net connectivity graph for active board */
export function computeNetConnectivity(project: Project, boardId: string): Record<string, boolean> {
  const boardComps = (project.boardComponents || []).filter(c => (c.boardId || 'board-main') === boardId);
  const boardTraces = (project.traces || []).filter(t => (t.boardId || 'board-main') === boardId);
  const padAssignments = project.padNetAssignments || [];
  const nets = project.nets || [];

  const connectivityMap: Record<string, boolean> = {};

  for (const net of nets) {
    const netName = net.netName;
    const assignedPads = boardComps.flatMap(comp => {
      const pads = getComponentPads(comp);
      return pads.filter(p => {
        const assign = padAssignments.find(a => (a.componentId === comp.id || a.componentId === comp.referenceDesignator) && a.padName === p.padName);
        return assign && assign.netName === netName;
      }).map(p => ({ compId: comp.id, padName: p.padName, x: p.x, y: p.y }));
    });

    if (assignedPads.length <= 1) {
      connectivityMap[netName] = assignedPads.length === 1;
      continue;
    }

    const netTraces = boardTraces.filter(t => t.netId === netName || t.netName === netName);
    if (netTraces.length === 0) {
      connectivityMap[netName] = false;
      continue;
    }

    const padConnected = new Set<number>();
    assignedPads.forEach((pad, idx) => {
      const connectedToAnyTrace = netTraces.some(t => {
        const pts = t.points || [];
        if (pts.length < 2) return false;
        const startPt = pts[0];
        const endPt = pts[pts.length - 1];
        const dStart = Math.hypot(startPt.x - pad.x, startPt.y - pad.y);
        const dEnd = Math.hypot(endPt.x - pad.x, endPt.y - pad.y);
        return dStart < 1.0 || dEnd < 1.0;
      });
      if (connectedToAnyTrace) padConnected.add(idx);
    });

    connectivityMap[netName] = padConnected.size === assignedPads.length;
  }

  return connectivityMap;
}
