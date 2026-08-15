// pcbRoutingEngine.ts — Production PCB Routing Engine
import { BoardComponent, Trace, Via, PadNetAssignment, Project } from '../../types';
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

/** Resolve an anchor at given coordinates for one real board. */
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
  if (!activeBoardId) return null;

  // 1. Check pads on the active board. Unassigned entities do not silently
  // become members of a synthetic board.
  const activeComps = (boardComponents || []).filter((component) => component.boardId === activeBoardId);
  const allPads = activeComps.flatMap((component) => {
    if (component.placementX == null || component.placementY == null) return [];
    return getComponentPads(component).map((pad) => ({
      ...pad,
      componentId: component.id,
      netName: (padNetAssignments || []).find(
        (assignment) =>
          (assignment.componentId === component.id || assignment.componentId === component.referenceDesignator)
          && assignment.padName === pad.padName
      )?.netName || '',
    }));
  });

  const nearestPad = getNearestPad(point, allPads, toleranceMm);
  if (nearestPad) {
    return {
      type: 'pad',
      componentId: nearestPad.componentId,
      padName: nearestPad.padName,
      xMm: nearestPad.x,
      yMm: nearestPad.y,
      netName: nearestPad.netName,
      layer: layerId,
    };
  }

  // 2. Check vias on the active board.
  const activeVias = (vias || []).filter((via) => via.boardId === activeBoardId);
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

  // 3. Check trace endpoints on the active board.
  const activeTraces = (traces || []).filter(
    (trace) => trace.boardId === activeBoardId && (trace.layerId || 'top-copper') === layerId
  );
  for (const trace of activeTraces) {
    const points = trace.points || [];
    if (points.length >= 2) {
      const startPoint = points[0];
      const endPoint = points[points.length - 1];

      const startDist = Math.hypot(point.x - startPoint.x, point.y - startPoint.y);
      if (startDist <= (trace.width || 0.25) / 2 + toleranceMm) {
        return {
          type: 'trace-end',
          traceId: trace.id,
          endpoint: 'start',
          xMm: startPoint.x,
          yMm: startPoint.y,
          netName: trace.netId || '',
          layer: trace.layerId || 'top-copper',
        };
      }

      const endDist = Math.hypot(point.x - endPoint.x, point.y - endPoint.y);
      if (endDist <= (trace.width || 0.25) / 2 + toleranceMm) {
        return {
          type: 'trace-end',
          traceId: trace.id,
          endpoint: 'end',
          xMm: endPoint.x,
          yMm: endPoint.y,
          netName: trace.netId || '',
          layer: trace.layerId || 'top-copper',
        };
      }
    }
  }

  return null;
}

/** Validate whether a route can start from an anchor. */
export function validateRouteStartAnchor(
  anchor: PCBAnchor | null,
  requestedNetName?: string
): ValidationResult {
  if (!anchor) {
    return {
      valid: false,
      error: 'Cannot start route in empty space. Click on a pad, via, or trace endpoint.',
    };
  }

  const anchorNet = anchor.netName;
  if (!anchorNet) {
    return {
      valid: false,
      error: `Selected anchor (${anchor.type}) is not assigned to any net.`,
    };
  }

  if (requestedNetName && anchorNet !== requestedNetName) {
    return {
      valid: false,
      error: `Net mismatch: Anchor belongs to net '${anchorNet}', but selected net is '${requestedNetName}'.`,
    };
  }

  return { valid: true, targetAnchor: anchor };
}

/** Validate whether a route can finish at a target anchor. */
export function validateRouteFinishAnchor(
  startNetName: string,
  targetAnchor: PCBAnchor | null
): ValidationResult {
  if (!targetAnchor) {
    return {
      valid: false,
      error: 'Normal routing cannot finish in empty space. Use "Finish as Dangling Draft" to place a draft trace.',
    };
  }

  if (!targetAnchor.netName) {
    return {
      valid: false,
      error: `Target ${targetAnchor.type} is unassigned.`,
    };
  }

  if (targetAnchor.netName !== startNetName) {
    return {
      valid: false,
      error: `Wrong Net Connection Rejected! Target belongs to net '${targetAnchor.netName}', but active route is '${startNetName}'.`,
    };
  }

  return { valid: true, targetAnchor };
}

/** Begin a routing session from an anchor. */
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
    isRouting: true,
  };
}

/** Compute net connectivity graph for one real board. */
export function computeNetConnectivity(project: Project, boardId: string): Record<string, boolean> {
  if (!boardId) return {};

  const boardComps = (project.boardComponents || []).filter((component) => component.boardId === boardId);
  const boardTraces = (project.traces || []).filter((trace) => trace.boardId === boardId);
  const padAssignments = project.padNetAssignments || [];
  const nets = project.nets || [];

  const connectivityMap: Record<string, boolean> = {};

  for (const net of nets) {
    const netName = net.netName;
    const assignedPads = boardComps.flatMap((component) => {
      const pads = getComponentPads(component);
      return pads
        .filter((pad) => {
          const assignment = padAssignments.find(
            (candidate) =>
              (candidate.componentId === component.id || candidate.componentId === component.referenceDesignator)
              && candidate.padName === pad.padName
          );
          return assignment && assignment.netName === netName;
        })
        .map((pad) => ({ compId: component.id, padName: pad.padName, x: pad.x, y: pad.y }));
    });

    if (assignedPads.length <= 1) {
      connectivityMap[netName] = assignedPads.length === 1;
      continue;
    }

    const netTraces = boardTraces.filter((trace) => trace.netId === netName || trace.netName === netName);
    if (netTraces.length === 0) {
      connectivityMap[netName] = false;
      continue;
    }

    const padConnected = new Set<number>();
    assignedPads.forEach((pad, index) => {
      const connectedToAnyTrace = netTraces.some((trace) => {
        const points = trace.points || [];
        if (points.length < 2) return false;
        const startPoint = points[0];
        const endPoint = points[points.length - 1];
        const startDistance = Math.hypot(startPoint.x - pad.x, startPoint.y - pad.y);
        const endDistance = Math.hypot(endPoint.x - pad.x, endPoint.y - pad.y);
        return startDistance < 1.0 || endDistance < 1.0;
      });
      if (connectedToAnyTrace) padConnected.add(index);
    });

    connectivityMap[netName] = padConnected.size === assignedPads.length;
  }

  return connectivityMap;
}
