// Board-level Design Rule Check engine
// Produces ReviewResult[] from current project state

import { Project, ReviewResult } from '../types';
import { getFootprint } from './footprints';
import {
  componentsOverlap,
  isPointInsideOutline,
  getOutlineBounds,
  getPadsForNet,
} from '../components/board/boardGeometry';

let drcCounter = 0;
const drcId = (prefix: string = 'gen') => `drc_${prefix}_${++drcCounter}`;

export const runBoardDRC = (project: Project): ReviewResult[] => {
  drcCounter = 0;
  const results: ReviewResult[] = [];
  const boards = project.boards || [];
  const activeBoardId = project.activeBoardId || '';

  if (!activeBoardId) {
    results.push({
      id: drcId('board-context'),
      category: 'Board',
      severity: 'Blocker',
      title: boards.length > 0 ? 'No active board selected' : 'No board defined',
      description: boards.length > 0
        ? 'DRC needs an explicit board selection. Hardware Studio will not guess which board should be checked.'
        : 'DRC cannot run until a real PCB board has been defined for the project.',
      linkedObjectType: 'project',
      linkedObjectId: '',
      suggestedFix: boards.length > 0
        ? 'Select the board you want to check, then run DRC again.'
        : 'Create a board in Board settings, select it, then run DRC.',
      status: 'Open',
    });
    return results;
  }

  const activeBoard = boards.find((board) => board.id === activeBoardId);
  if (!activeBoard) {
    results.push({
      id: drcId('board-context'),
      category: 'Board',
      severity: 'Blocker',
      title: 'Active board reference is invalid',
      description: `The selected board ID “${activeBoardId}” does not exist in the project. DRC stopped instead of checking unrelated PCB data.`,
      linkedObjectType: 'project',
      linkedObjectId: '',
      suggestedFix: 'Select an existing board or repair the stale project board reference.',
      status: 'Open',
    });
    return results;
  }

  // Every physical entity is scoped to the explicitly selected real board.
  const components = (project.boardComponents || []).filter((component) => component.boardId === activeBoardId);
  const outlines = (project.boardOutlines || []).filter((outline) => outline.boardId === activeBoardId);
  const traces = (project.traces || []).filter((trace) => trace.boardId === activeBoardId);
  const vias = (project.vias || []).filter((via) => via.boardId === activeBoardId);
  const drillHoles = (project.drillHoles || []).filter((drill) => drill.boardId === activeBoardId);
  const keepoutZones = (project.keepoutZones || []).filter((zone) => zone.boardId === activeBoardId);

  const nets = project.nets || [];
  const pcbLayers = project.pcbLayers || [];
  const pcbRules = project.pcbRules || [];
  const primaryOutline = outlines[0];
  const scopedProject: Project = {
    ...project,
    activeBoardId,
    boardComponents: components,
    boardOutlines: outlines,
    traces,
    vias,
    drillHoles,
    keepoutZones,
  };

  const traceWidthRule = pcbRules.find((rule) => rule.ruleType === 'Trace Width')?.value;
  const minTraceWidth = traceWidthRule ? Number.parseFloat(traceWidthRule) : 0.1;

  // ── Board outline checks ─────────────────────────────────
  if (outlines.length === 0) {
    results.push({
      id: drcId(), category: 'Board', severity: 'Blocker',
      title: 'Missing board outline',
      description: `No board outline is defined for ${activeBoard.name}. Manufacturing files require an explicit board boundary.`,
      linkedObjectType: 'board', linkedObjectId: activeBoard.id,
      suggestedFix: 'Create a board outline in the Board Designer.',
      status: 'Open',
    });
  }

  if (primaryOutline) {
    const bounds = getOutlineBounds(primaryOutline);
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;
    if (width <= 0 || height <= 0) {
      results.push({
        id: drcId(), category: 'Board', severity: 'Error',
        title: 'Invalid board dimensions',
        description: `Board outline has zero or negative dimensions (${width.toFixed(1)}×${height.toFixed(1)}mm).`,
        linkedObjectType: 'outline', linkedObjectId: primaryOutline.id,
        suggestedFix: 'Resize the board outline to valid positive dimensions.',
        status: 'Open',
      });
    }
  }

  // ── Layer checks ─────────────────────────────────────────
  if (pcbLayers.length === 0) {
    results.push({
      id: drcId(), category: 'Layers', severity: 'Warning',
      title: 'No PCB layers defined',
      description: 'Layer stack is empty. At minimum, top and bottom copper layers are needed.',
      linkedObjectType: 'board', linkedObjectId: activeBoard.id,
      suggestedFix: 'Define the layer stack for this board before manufacturing review.',
      status: 'Open',
    });
  }

  // ── Component checks ─────────────────────────────────────
  const refdeses = new Set<string>();
  for (const component of components) {
    const footprint = getFootprint(component.footprint);
    if (!component.footprint || (footprint.name === 'CUSTOM_RECT' && component.footprint !== 'CUSTOM_RECT')) {
      results.push({
        id: drcId(), category: 'Component', severity: 'Warning',
        title: `Missing footprint: ${component.referenceDesignator}`,
        description: `Component ${component.componentName} (${component.referenceDesignator}) has no valid footprint assigned.`,
        linkedObjectType: 'component', linkedObjectId: component.id,
        suggestedFix: `Assign a footprint from the library to ${component.referenceDesignator}.`,
        status: 'Open',
      });
    }

    if (component.placementX == null || component.placementY == null) {
      results.push({
        id: drcId(), category: 'Component', severity: 'Warning',
        title: `Unplaced component: ${component.referenceDesignator}`,
        description: `${component.componentName} (${component.referenceDesignator}) has no board placement coordinates.`,
        linkedObjectType: 'component', linkedObjectId: component.id,
        suggestedFix: 'Place the component on the selected board.',
        status: 'Open',
      });
    }

    if (component.placementX != null && component.placementY != null && primaryOutline) {
      if (!isPointInsideOutline({ x: component.placementX, y: component.placementY }, primaryOutline)) {
        results.push({
          id: drcId(), category: 'Component', severity: 'Error',
          title: `Component outside board: ${component.referenceDesignator}`,
          description: `${component.referenceDesignator} center (${component.placementX.toFixed(1)}, ${component.placementY.toFixed(1)}) is outside the selected board outline.`,
          linkedObjectType: 'component', linkedObjectId: component.id,
          suggestedFix: 'Move the component inside the board boundary.',
          status: 'Open',
        });
      }
    }

    if (refdeses.has(component.referenceDesignator)) {
      results.push({
        id: drcId(), category: 'Component', severity: 'Error',
        title: `Duplicate reference designator: ${component.referenceDesignator}`,
        description: `Multiple components on this board share the reference designator ${component.referenceDesignator}.`,
        linkedObjectType: 'component', linkedObjectId: component.id,
        suggestedFix: 'Assign unique reference designators to each component.',
        status: 'Open',
      });
    }
    refdeses.add(component.referenceDesignator);

    if (component.side === 'Unknown') {
      results.push({
        id: drcId(), category: 'Component', severity: 'Info',
        title: `Unknown side: ${component.referenceDesignator}`,
        description: `${component.referenceDesignator} does not have a defined board side (Top/Bottom).`,
        linkedObjectType: 'component', linkedObjectId: component.id,
        suggestedFix: 'Set the component side to Top or Bottom.',
        status: 'Open',
      });
    }
  }

  for (let index = 0; index < components.length; index += 1) {
    for (let nextIndex = index + 1; nextIndex < components.length; nextIndex += 1) {
      const first = components[index];
      const second = components[nextIndex];
      if (first.placementX == null || second.placementX == null) continue;
      if (first.side !== second.side) continue;
      if (componentsOverlap(first, second)) {
        results.push({
          id: drcId('overlap'), category: 'Component', severity: 'Error',
          title: `Overlapping components: ${first.referenceDesignator} & ${second.referenceDesignator}`,
          description: `Courtyard areas of ${first.referenceDesignator} and ${second.referenceDesignator} overlap on the ${first.side} side.`,
          linkedObjectType: 'component', linkedObjectId: first.id,
          suggestedFix: 'Move one of the components to eliminate overlap.',
          status: 'Open',
        });
      }
    }
  }

  // ── Trace checks ─────────────────────────────────────────
  for (const trace of traces) {
    if (!trace.points || trace.points.length < 2) continue;

    if (trace.width != null && trace.width < minTraceWidth) {
      results.push({
        id: drcId(), category: 'Trace', severity: 'Warning',
        title: `Trace width below minimum: ${trace.netName || trace.id}`,
        description: `Trace width ${trace.width}mm is below minimum ${minTraceWidth}mm.`,
        linkedObjectType: 'trace', linkedObjectId: trace.id,
        suggestedFix: `Increase trace width to at least ${minTraceWidth}mm.`,
        status: 'Open',
      });
    }

    const isPowerNet = trace.netName
      && ['gnd', 'vbat', '3v3', 'vcc', 'vdd'].some((pattern) => trace.netName!.toLowerCase().includes(pattern));
    if (isPowerNet && trace.width != null && trace.width < 0.25) {
      results.push({
        id: drcId(), category: 'Trace', severity: 'Warning',
        title: `Power trace too thin: ${trace.netName}`,
        description: `Power net ${trace.netName} has trace width ${trace.width}mm. Consider ≥0.25mm for current capacity.`,
        linkedObjectType: 'trace', linkedObjectId: trace.id,
        suggestedFix: 'Widen the trace to ≥0.25mm for power nets.',
        status: 'Open',
      });
    }

    if (primaryOutline) {
      for (const point of trace.points) {
        if (!isPointInsideOutline(point, primaryOutline)) {
          results.push({
            id: drcId(), category: 'Trace', severity: 'Error',
            title: `Trace outside board: ${trace.netName || trace.id}`,
            description: `Trace point (${point.x.toFixed(1)}, ${point.y.toFixed(1)}) is outside the selected board outline.`,
            linkedObjectType: 'trace', linkedObjectId: trace.id,
            suggestedFix: 'Reroute the trace to stay within board boundaries.',
            status: 'Open',
          });
          break;
        }
      }
    }
  }

  // ── Unrouted nets ────────────────────────────────────────
  const netNames = new Set(nets.map((net) => net.netName));
  for (const netName of netNames) {
    const pads = getPadsForNet(scopedProject, netName);
    if (pads.length < 2) continue;
    const netTraces = traces.filter((trace) => trace.netName === netName);
    if (netTraces.length === 0) {
      results.push({
        id: drcId(), category: 'Routing', severity: 'Warning',
        title: `Unrouted net: ${netName}`,
        description: `Net ${netName} has ${pads.length} pads on ${activeBoard.name} but no traces.`,
        linkedObjectType: 'net', linkedObjectId: nets.find((net) => net.netName === netName)?.id || '',
        suggestedFix: `Route ${netName} on the selected board.`,
        status: 'Open',
      });
    }
  }

  if (nets.length > 0 && !nets.some((net) => net.netName.toLowerCase().includes('gnd'))) {
    results.push({
      id: drcId(), category: 'Routing', severity: 'Warning',
      title: 'Missing GND net',
      description: 'No ground net found in the design. Most circuits require a ground reference.',
      linkedObjectType: 'project', linkedObjectId: '',
      suggestedFix: 'Add a GND net connecting component ground pins.',
      status: 'Open',
    });
  }

  // ── Via checks ───────────────────────────────────────────
  for (const via of vias) {
    if (via.x != null && via.y != null && primaryOutline && !isPointInsideOutline({ x: via.x, y: via.y }, primaryOutline)) {
      results.push({
        id: drcId(), category: 'Via', severity: 'Error',
        title: 'Via outside board',
        description: `Via at (${via.x.toFixed(1)}, ${via.y.toFixed(1)}) is outside the selected board outline.`,
        linkedObjectType: 'via', linkedObjectId: via.id,
        suggestedFix: 'Move the via inside the board boundary.',
        status: 'Open',
      });
    }
    if (via.drillDiameter != null && via.drillDiameter < 0.15) {
      results.push({
        id: drcId(), category: 'Via', severity: 'Warning',
        title: 'Via drill too small',
        description: `Via drill diameter ${via.drillDiameter}mm may be below fab minimums.`,
        linkedObjectType: 'via', linkedObjectId: via.id,
        suggestedFix: 'Increase drill diameter to ≥0.2mm.',
        status: 'Open',
      });
    }
  }

  // ── Drill hole checks ────────────────────────────────────
  for (const drill of drillHoles) {
    if (drill.x != null && drill.y != null && primaryOutline) {
      if (!isPointInsideOutline({ x: drill.x, y: drill.y }, primaryOutline)) {
        results.push({
          id: drcId(), category: 'Drill', severity: 'Error',
          title: 'Drill hole outside board',
          description: `Drill at (${drill.x.toFixed(1)}, ${drill.y.toFixed(1)}) is outside the selected board outline.`,
          linkedObjectType: 'drill', linkedObjectId: drill.id,
          suggestedFix: 'Move the drill hole inside the board boundary.',
          status: 'Open',
        });
      }

      const bounds = getOutlineBounds(primaryOutline);
      const edgeDistance = Math.min(
        drill.x - bounds.minX,
        bounds.maxX - drill.x,
        drill.y - bounds.minY,
        bounds.maxY - drill.y,
      );
      if (edgeDistance < 0.5 && edgeDistance >= 0) {
        results.push({
          id: drcId(), category: 'Drill', severity: 'Warning',
          title: 'Drill hole too close to board edge',
          description: `Drill at (${drill.x.toFixed(1)}, ${drill.y.toFixed(1)}) is only ${edgeDistance.toFixed(2)}mm from board edge.`,
          linkedObjectType: 'drill', linkedObjectId: drill.id,
          suggestedFix: 'Move drill hole at least 0.5mm from the board edge.',
          status: 'Open',
        });
      }
    }
  }

  // ── Keepout zone violations ──────────────────────────────
  for (const zone of keepoutZones) {
    const minX = zone.x;
    const minY = zone.y;
    const maxX = zone.x + zone.width;
    const maxY = zone.y + zone.height;

    for (const component of components) {
      if (component.placementX == null || component.placementY == null) continue;
      if (component.placementX >= minX && component.placementX <= maxX
        && component.placementY >= minY && component.placementY <= maxY) {
        results.push({
          id: drcId(), category: 'Keepout', severity: 'Error',
          title: `Component in keepout: ${component.referenceDesignator}`,
          description: `${component.referenceDesignator} is placed inside keepout zone “${zone.reason}”.`,
          linkedObjectType: 'component', linkedObjectId: component.id,
          suggestedFix: `Move ${component.referenceDesignator} outside the ${zone.reason} keepout zone.`,
          status: 'Open',
        });
      }
    }

    for (const via of vias) {
      if (via.x != null && via.y != null
        && via.x >= minX && via.x <= maxX && via.y >= minY && via.y <= maxY) {
        results.push({
          id: drcId(), category: 'Keepout', severity: 'Error',
          title: 'Via in keepout zone',
          description: `Via at (${via.x.toFixed(1)}, ${via.y.toFixed(1)}) is inside keepout “${zone.reason}”.`,
          linkedObjectType: 'via', linkedObjectId: via.id,
          suggestedFix: 'Move the via outside the keepout zone.',
          status: 'Open',
        });
      }
    }
  }

  return results;
};
