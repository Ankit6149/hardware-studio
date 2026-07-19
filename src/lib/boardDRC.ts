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
  const activeBoardId = project.activeBoardId || 'board-main';
  const boards = project.boards || [];
  
  // Filter design elements by activeBoardId
  const components = (project.boardComponents || []).filter(c => c.boardId === activeBoardId);
  const outlines = (project.boardOutlines || []).filter(o => o.boardId === activeBoardId);
  const traces = (project.traces || []).filter(t => t.boardId === activeBoardId);
  const vias = (project.vias || []).filter(v => v.boardId === activeBoardId);
  const drillHoles = (project.drillHoles || []).filter(d => d.boardId === activeBoardId);
  const keepoutZones = (project.keepoutZones || []).filter(k => k.boardId === activeBoardId);
  
  const nets = project.nets || [];
  const pcbLayers = project.pcbLayers || [];
  const pcbRules = project.pcbRules || [];

  // Get primary board outline
  const primaryOutline = outlines[0] || (project.boardOutlines || [])[0];
  const minTraceWidth = pcbRules.find(r => r.ruleType === 'Trace Width')?.value
    ? parseFloat(pcbRules.find(r => r.ruleType === 'Trace Width')!.value!)
    : 0.1;

  // ── Board outline checks ─────────────────────────────────
  if (boards.length > 0 && outlines.length === 0) {
    results.push({
      id: drcId(), category: 'Board', severity: 'Blocker',
      title: 'Missing board outline',
      description: 'No board outline is defined. Manufacturing files require a board boundary.',
      linkedObjectType: 'board', linkedObjectId: boards[0]?.id || '',
      suggestedFix: 'Create a board outline in the Board Designer.',
      status: 'Open',
    });
  }

  if (primaryOutline) {
    const bounds = getOutlineBounds(primaryOutline);
    const w = bounds.maxX - bounds.minX;
    const h = bounds.maxY - bounds.minY;
    if (w <= 0 || h <= 0) {
      results.push({
        id: drcId(), category: 'Board', severity: 'Error',
        title: 'Invalid board dimensions',
        description: `Board outline has zero or negative dimensions (${w.toFixed(1)}×${h.toFixed(1)}mm).`,
        linkedObjectType: 'outline', linkedObjectId: primaryOutline.id,
        suggestedFix: 'Resize the board outline to valid positive dimensions.',
        status: 'Open',
      });
    }
  }

  // ── Layer checks ─────────────────────────────────────────
  if (boards.length > 0 && pcbLayers.length === 0) {
    results.push({
      id: drcId(), category: 'Layers', severity: 'Warning',
      title: 'No PCB layers defined',
      description: 'Layer stack is empty. At minimum, top and bottom copper layers are needed.',
      linkedObjectType: 'board', linkedObjectId: boards[0]?.id || '',
      suggestedFix: 'Generate the product plan to auto-create PCB layers.',
      status: 'Open',
    });
  }

  // ── Component checks ─────────────────────────────────────
  const refdeses = new Set<string>();
  for (const comp of components) {
    // Missing footprint
    const fp = getFootprint(comp.footprint);
    if (!comp.footprint || (fp.name === 'CUSTOM_RECT' && comp.footprint !== 'CUSTOM_RECT')) {
      results.push({
        id: drcId(), category: 'Component', severity: 'Warning',
        title: `Missing footprint: ${comp.referenceDesignator}`,
        description: `Component ${comp.componentName} (${comp.referenceDesignator}) has no valid footprint assigned.`,
        linkedObjectType: 'component', linkedObjectId: comp.id,
        suggestedFix: `Assign a footprint from the library to ${comp.referenceDesignator}.`,
        status: 'Open',
      });
    }

    // Unplaced
    if (comp.placementX == null || comp.placementY == null) {
      results.push({
        id: drcId(), category: 'Component', severity: 'Warning',
        title: `Unplaced component: ${comp.referenceDesignator}`,
        description: `${comp.componentName} (${comp.referenceDesignator}) has no board placement coordinates.`,
        linkedObjectType: 'component', linkedObjectId: comp.id,
        suggestedFix: 'Place the component on the board or use Auto Place.',
        status: 'Open',
      });
    }

    // Outside board
    if (comp.placementX != null && comp.placementY != null && primaryOutline) {
      if (!isPointInsideOutline({ x: comp.placementX, y: comp.placementY }, primaryOutline)) {
        results.push({
          id: drcId(), category: 'Component', severity: 'Error',
          title: `Component outside board: ${comp.referenceDesignator}`,
          description: `${comp.referenceDesignator} center (${comp.placementX?.toFixed(1)}, ${comp.placementY?.toFixed(1)}) is outside the board outline.`,
          linkedObjectType: 'component', linkedObjectId: comp.id,
          suggestedFix: 'Move the component inside the board boundary.',
          status: 'Open',
        });
      }
    }

    // Duplicate refdes
    if (refdeses.has(comp.referenceDesignator)) {
      results.push({
        id: drcId(), category: 'Component', severity: 'Error',
        title: `Duplicate reference designator: ${comp.referenceDesignator}`,
        description: `Multiple components share the reference designator ${comp.referenceDesignator}.`,
        linkedObjectType: 'component', linkedObjectId: comp.id,
        suggestedFix: 'Assign unique reference designators to each component.',
        status: 'Open',
      });
    }
    refdeses.add(comp.referenceDesignator);

    // Unknown side
    if (comp.side === 'Unknown') {
      results.push({
        id: drcId(), category: 'Component', severity: 'Info',
        title: `Unknown side: ${comp.referenceDesignator}`,
        description: `${comp.referenceDesignator} does not have a defined board side (Top/Bottom).`,
        linkedObjectType: 'component', linkedObjectId: comp.id,
        suggestedFix: 'Set the component side to Top or Bottom.',
        status: 'Open',
      });
    }
  }

  // Overlapping components (only if on the same side)
  for (let i = 0; i < components.length; i++) {
    for (let j = i + 1; j < components.length; j++) {
      const a = components[i];
      const b = components[j];
      if (a.placementX == null || b.placementX == null) continue;
      if (a.side !== b.side) continue; // Components on opposite sides do not overlap
      if (componentsOverlap(a, b)) {
        results.push({
          id: drcId('overlap'), category: 'Component', severity: 'Error',
          title: `Overlapping components: ${a.referenceDesignator} & ${b.referenceDesignator}`,
          description: `Courtyard areas of ${a.referenceDesignator} and ${b.referenceDesignator} overlap on the ${a.side} side.`,
          linkedObjectType: 'component', linkedObjectId: a.id,
          suggestedFix: 'Move one of the components to eliminate overlap.',
          status: 'Open',
        });
      }
    }
  }

  // ── Trace checks ─────────────────────────────────────────
  for (const trace of traces) {
    if (!trace.points || trace.points.length < 2) continue;

    // Width below rule
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

    // Power trace too thin
    const isPowerNet = trace.netName && ['gnd', 'vbat', '3v3', 'vcc', 'vdd'].some(p => trace.netName!.toLowerCase().includes(p));
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

    // Trace outside board
    if (primaryOutline) {
      for (const pt of trace.points) {
        if (!isPointInsideOutline(pt, primaryOutline)) {
          results.push({
            id: drcId(), category: 'Trace', severity: 'Error',
            title: `Trace outside board: ${trace.netName || trace.id}`,
            description: `Trace point (${pt.x.toFixed(1)}, ${pt.y.toFixed(1)}) is outside the board outline.`,
            linkedObjectType: 'trace', linkedObjectId: trace.id,
            suggestedFix: 'Reroute the trace to stay within board boundaries.',
            status: 'Open',
          });
          break; // one warning per trace
        }
      }
    }
  }

  // ── Unrouted nets ────────────────────────────────────────
  const netNames = new Set(nets.map(n => n.netName));
  for (const netName of netNames) {
    const pads = getPadsForNet(project, netName);
    if (pads.length < 2) continue;
    const netTraces = traces.filter(t => t.netName === netName);
    if (netTraces.length === 0) {
      results.push({
        id: drcId(), category: 'Routing', severity: 'Warning',
        title: `Unrouted net: ${netName}`,
        description: `Net ${netName} has ${pads.length} pads but no traces.`,
        linkedObjectType: 'net', linkedObjectId: nets.find(n => n.netName === netName)?.id || '',
        suggestedFix: `Route ${netName} using the Route Trace tool or Rough Autoroute.`,
        status: 'Open',
      });
    }
  }

  // Check for missing GND net
  if (nets.length > 0 && !nets.some(n => n.netName.toLowerCase().includes('gnd'))) {
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
    if (via.x != null && via.y != null && primaryOutline) {
      if (!isPointInsideOutline({ x: via.x, y: via.y }, primaryOutline)) {
        results.push({
          id: drcId(), category: 'Via', severity: 'Error',
          title: 'Via outside board',
          description: `Via at (${via.x?.toFixed(1)}, ${via.y?.toFixed(1)}) is outside the board outline.`,
          linkedObjectType: 'via', linkedObjectId: via.id,
          suggestedFix: 'Move the via inside the board boundary.',
          status: 'Open',
        });
      }
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
          description: `Drill at (${drill.x?.toFixed(1)}, ${drill.y?.toFixed(1)}) is outside the board outline.`,
          linkedObjectType: 'drill', linkedObjectId: drill.id,
          suggestedFix: 'Move the drill hole inside the board boundary.',
          status: 'Open',
        });
      }

      // Too close to edge
      if (primaryOutline) {
        const bounds = getOutlineBounds(primaryOutline);
        const edgeDist = Math.min(
          (drill.x ?? 0) - bounds.minX,
          bounds.maxX - (drill.x ?? 0),
          (drill.y ?? 0) - bounds.minY,
          bounds.maxY - (drill.y ?? 0)
        );
        if (edgeDist < 0.5 && edgeDist >= 0) {
          results.push({
            id: drcId(), category: 'Drill', severity: 'Warning',
            title: 'Drill hole too close to board edge',
            description: `Drill at (${drill.x?.toFixed(1)}, ${drill.y?.toFixed(1)}) is only ${edgeDist.toFixed(2)}mm from board edge.`,
            linkedObjectType: 'drill', linkedObjectId: drill.id,
            suggestedFix: 'Move drill hole at least 0.5mm from the board edge.',
            status: 'Open',
          });
        }
      }
    }
  }

  // ── Keepout zone violations ──────────────────────────────
  for (const zone of keepoutZones) {
    const zMinX = zone.x;
    const zMinY = zone.y;
    const zMaxX = zone.x + zone.width;
    const zMaxY = zone.y + zone.height;

    // Components inside keepout
    for (const comp of components) {
      if (comp.placementX == null || comp.placementY == null) continue;
      if (comp.placementX >= zMinX && comp.placementX <= zMaxX &&
          comp.placementY >= zMinY && comp.placementY <= zMaxY) {
        results.push({
          id: drcId(), category: 'Keepout', severity: 'Error',
          title: `Component in keepout: ${comp.referenceDesignator}`,
          description: `${comp.referenceDesignator} is placed inside keepout zone "${zone.reason}".`,
          linkedObjectType: 'component', linkedObjectId: comp.id,
          suggestedFix: `Move ${comp.referenceDesignator} outside the ${zone.reason} keepout zone.`,
          status: 'Open',
        });
      }
    }

    // Vias inside keepout
    for (const via of vias) {
      if (via.x != null && via.y != null) {
        if (via.x >= zMinX && via.x <= zMaxX && via.y >= zMinY && via.y <= zMaxY) {
          results.push({
            id: drcId(), category: 'Keepout', severity: 'Error',
            title: `Via in keepout zone`,
            description: `Via at (${via.x.toFixed(1)}, ${via.y.toFixed(1)}) is inside keepout "${zone.reason}".`,
            linkedObjectType: 'via', linkedObjectId: via.id,
            suggestedFix: 'Move the via outside the keepout zone.',
            status: 'Open',
          });
        }
      }
    }
  }

  return results;
};
