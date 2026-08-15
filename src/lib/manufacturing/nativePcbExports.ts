import { BoardComponent, BoardOutline, Project, Via, DrillHole } from '../../types';
import { FOOTPRINT_LIBRARY } from '../footprints';
import {
  ManufacturingContextError,
  assertManufacturingContext,
} from './manufacturingContext';

const GERBER_SCALE = 1_000_000;
const MM_PER_MIL = 0.0254;

export class UnsupportedManufacturingExportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnsupportedManufacturingExportError';
  }
}

function csvCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '""';
  return `"${String(value).replace(/"/g, '""')}"`;
}

function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function positive(value: unknown): value is number {
  return finite(value) && value > 0;
}

function formatGerberCoordinate(valueMm: number): string {
  const scaled = Math.round(valueMm * GERBER_SCALE);
  const sign = scaled < 0 ? '-' : '';
  return `${sign}${Math.abs(scaled).toString().padStart(10, '0')}`;
}

function xy(xMm: number, yMm: number): string {
  return `X${formatGerberCoordinate(xMm)}Y${formatGerberCoordinate(yMm)}`;
}

function componentPlacement(component: BoardComponent): {
  xMm: number;
  yMm: number;
  rotationDeg: number;
  side: 'Top' | 'Bottom';
} {
  const xMm = finite(component.pcb?.xMm) ? component.pcb.xMm : component.placementX;
  const yMm = finite(component.pcb?.yMm) ? component.pcb.yMm : component.placementY;
  const rotationDeg = finite(component.pcb?.rotationDeg) ? component.pcb.rotationDeg : component.rotationDeg;
  const side = component.pcb?.side || component.side;

  if (!finite(xMm) || !finite(yMm) || !finite(rotationDeg) || (side !== 'Top' && side !== 'Bottom')) {
    throw new ManufacturingContextError([{
      code: 'UNPLACED_COMPONENT',
      objectId: component.id,
      message: `Component ${component.referenceDesignator || component.id} does not have complete physical placement data.`,
    }]);
  }
  return { xMm, yMm, rotationDeg, side };
}

function rotatePoint(x: number, y: number, rotationDeg: number): { x: number; y: number } {
  const radians = rotationDeg * Math.PI / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return {
    x: x * cos - y * sin,
    y: x * sin + y * cos,
  };
}

function padPolygon(component: BoardComponent, pad: { xMm: number; yMm: number; widthMm: number; heightMm: number }): { x: number; y: number }[] {
  const placement = componentPlacement(component);
  if (placement.side !== 'Top') {
    throw new UnsupportedManufacturingExportError(
      `Bottom-side footprint mirroring is not yet represented authoritatively for ${component.referenceDesignator || component.id}.`,
    );
  }

  const halfW = pad.widthMm / 2;
  const halfH = pad.heightMm / 2;
  const corners = [
    { x: pad.xMm - halfW, y: pad.yMm - halfH },
    { x: pad.xMm + halfW, y: pad.yMm - halfH },
    { x: pad.xMm + halfW, y: pad.yMm + halfH },
    { x: pad.xMm - halfW, y: pad.yMm + halfH },
  ];
  return corners.map((corner) => {
    const rotated = rotatePoint(corner.x, corner.y, placement.rotationDeg);
    return { x: placement.xMm + rotated.x, y: placement.yMm + rotated.y };
  });
}

function emitRegion(points: { x: number; y: number }[]): string {
  if (points.length < 3) return '';
  const first = points[0];
  let output = 'G36*\n';
  output += `${xy(first.x, first.y)}D02*\n`;
  for (let index = 1; index < points.length; index += 1) {
    output += `${xy(points[index].x, points[index].y)}D01*\n`;
  }
  output += `${xy(first.x, first.y)}D01*\n`;
  output += 'G37*\n';
  return output;
}

function apertureMap(values: number[], startCode = 10): Map<number, number> {
  const unique = [...new Set(values.map((value) => Number(value.toFixed(6))))].sort((a, b) => a - b);
  return new Map(unique.map((value, index) => [value, startCode + index]));
}

function gerberHeader(layerName: string): string {
  return [
    `G04 Hardware Studio draft ${layerName} - explicit project geometry only*`,
    'G04 NOT INDEPENDENTLY QUALIFIED. Review in an independent Gerber viewer and fab-house DFM before fabrication.*',
    '%FSLAX46Y46*%',
    '%MOMM*%',
    '%LPD*%',
    'G01*',
  ].join('\n') + '\n';
}

function selectedBoard(project: Project): { boardId: string; boardName: string } {
  const boards = project.boards || [];
  if (boards.length === 0) {
    throw new ManufacturingContextError([{ code: 'NO_BOARD', message: 'No real board exists for this export.' }]);
  }
  if (project.activeBoardId) {
    const board = boards.find((candidate) => candidate.id === project.activeBoardId);
    if (!board) {
      throw new ManufacturingContextError([{
        code: 'STALE_ACTIVE_BOARD',
        objectId: project.activeBoardId,
        message: `Active board ${project.activeBoardId} does not exist.`,
      }]);
    }
    return { boardId: board.id, boardName: board.name };
  }
  if (boards.length === 1) return { boardId: boards[0].id, boardName: boards[0].name };
  throw new ManufacturingContextError([{
    code: 'AMBIGUOUS_BOARD',
    message: 'Multiple boards exist and no active board is selected.',
  }]);
}

function outlinePoints(outline: BoardOutline): { x: number; y: number }[] {
  if (outline.points && outline.points.length >= 3) {
    const factor = outline.units === 'mil' ? MM_PER_MIL : 1;
    return outline.points.map((point) => ({ x: point.x * factor, y: point.y * factor }));
  }
  if (positive(outline.width) && positive(outline.height)) {
    const factor = outline.units === 'mil' ? MM_PER_MIL : 1;
    const width = outline.width * factor;
    const height = outline.height * factor;
    return [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: 0, y: height },
    ];
  }
  throw new UnsupportedManufacturingExportError('The selected board outline has no serializable physical geometry.');
}

function viaPosition(via: Via): { x: number; y: number; padDiameter: number; drillDiameter: number } {
  const x = finite(via.xMm) ? via.xMm : via.x;
  const y = finite(via.yMm) ? via.yMm : via.y;
  const padDiameter = finite(via.padDiameterMm) ? via.padDiameterMm : via.outerDiameter;
  const drillDiameter = finite(via.drillDiameterMm) ? via.drillDiameterMm : via.drillDiameter;
  if (!finite(x) || !finite(y) || !positive(padDiameter) || !positive(drillDiameter)) {
    throw new UnsupportedManufacturingExportError(`Via ${via.id} has incomplete physical geometry.`);
  }
  return { x, y, padDiameter, drillDiameter };
}

function drillPosition(drill: DrillHole): { x: number; y: number; diameter: number } {
  const x = finite(drill.xMm) ? drill.xMm : drill.x;
  const y = finite(drill.yMm) ? drill.yMm : drill.y;
  const diameter = finite(drill.diameterMm) ? drill.diameterMm : drill.diameter;
  if (!finite(x) || !finite(y) || !positive(diameter)) {
    throw new UnsupportedManufacturingExportError(`Drill ${drill.id} has incomplete physical geometry.`);
  }
  return { x, y, diameter };
}

function generateCopper(project: Project, side: 'Top' | 'Bottom'): string {
  const context = assertManufacturingContext(project);
  const bottomComponents = context.placedComponents.filter((component) => componentPlacement(component).side === 'Bottom');
  if (bottomComponents.length > 0) {
    throw new UnsupportedManufacturingExportError(
      'Manufacturing Gerber generation is blocked because bottom-side component footprint mirroring is not yet represented authoritatively.',
    );
  }
  const sideTraces = context.traces.filter((trace) => context.traceLayerSides[trace.id] === side);
  const traceWidths = sideTraces.map((trace) => trace.width as number);
  const viaDiameters = context.vias.map((via) => viaPosition(via).padDiameter);
  const traceApertures = apertureMap(traceWidths, 10);
  const viaApertures = apertureMap(viaDiameters, 10 + traceApertures.size);
  const regionAperture = 10 + traceApertures.size + viaApertures.size;

  let output = gerberHeader(`${side} Copper`);
  for (const [width, code] of traceApertures.entries()) {
    output += `%ADD${code}C,${width.toFixed(6)}*%\n`;
  }
  for (const [diameter, code] of viaApertures.entries()) {
    output += `%ADD${code}C,${diameter.toFixed(6)}*%\n`;
  }
  output += `%ADD${regionAperture}C,0.010000*%\n`;

  for (const trace of sideTraces) {
    const points = trace.points || [];
    const width = Number((trace.width as number).toFixed(6));
    const aperture = traceApertures.get(width);
    if (!aperture || points.length < 2) continue;
    output += `D${aperture}*\n`;
    output += `${xy(points[0].x, points[0].y)}D02*\n`;
    for (let index = 1; index < points.length; index += 1) {
      output += `${xy(points[index].x, points[index].y)}D01*\n`;
    }
  }

  if (side === 'Top') {
    output += `D${regionAperture}*\n`;
    for (const component of context.placedComponents) {
      const placement = componentPlacement(component);
      if (placement.side !== 'Top') continue;
      const footprint = FOOTPRINT_LIBRARY[component.footprint || ''];
      if (!footprint) continue;
      for (const pad of footprint.pads) {
        output += emitRegion(padPolygon(component, pad));
      }
    }
  }

  for (const via of context.vias) {
    const physical = viaPosition(via);
    const aperture = viaApertures.get(Number(physical.padDiameter.toFixed(6)));
    if (!aperture) continue;
    output += `D${aperture}*\n${xy(physical.x, physical.y)}D03*\n`;
  }

  output += 'M02*\n';
  return output;
}

export function generateNativeGerberCopperTop(project: Project): string {
  return generateCopper(project, 'Top');
}

export function generateNativeGerberCopperBottom(project: Project): string {
  return generateCopper(project, 'Bottom');
}

export function generateNativeGerberBoardOutline(project: Project): string {
  const context = assertManufacturingContext(project);
  const points = outlinePoints(context.outline);
  let output = gerberHeader('Board Outline / Profile');
  output += '%ADD10C,0.050000*%\nD10*\n';
  output += `${xy(points[0].x, points[0].y)}D02*\n`;
  for (let index = 1; index < points.length; index += 1) {
    output += `${xy(points[index].x, points[index].y)}D01*\n`;
  }
  output += `${xy(points[0].x, points[0].y)}D01*\nM02*\n`;
  return output;
}

function blockedGerber(kind: string): string {
  return [
    `G04 BLOCKED ${kind}: Hardware Studio does not yet hold the authoritative manufacturing rules required for this layer.*`,
    'G04 No fabrication geometry is emitted. This is intentionally not a usable manufacturing layer.*',
    '%FSLAX46Y46*%',
    '%MOMM*%',
    'M02*',
    '',
  ].join('\n');
}

export function generateNativeGerberTopSilkscreen(_project: Project): string {
  return blockedGerber('Top Silkscreen');
}

export function generateNativeGerberTopMask(_project: Project): string {
  return blockedGerber('Top Solder Mask');
}

export function generateNativeGerberBottomMask(_project: Project): string {
  return blockedGerber('Bottom Solder Mask');
}

export function generateNativeGerberTopPaste(_project: Project): string {
  return blockedGerber('Top Solder Paste');
}

export function generateNativeGerberBottomPaste(_project: Project): string {
  return blockedGerber('Bottom Solder Paste');
}

export function generateNativeExcellonDrills(project: Project): string {
  const context = assertManufacturingContext(project);
  const entries = [
    ...context.vias.map((via) => {
      const physical = viaPosition(via);
      return { id: via.id, x: physical.x, y: physical.y, diameter: physical.drillDiameter, plated: true };
    }),
    ...context.drillHoles.map((drill) => {
      const physical = drillPosition(drill);
      return { id: drill.id, x: physical.x, y: physical.y, diameter: physical.diameter, plated: drill.plated === true };
    }),
  ];

  const tools = apertureMap(entries.map((entry) => entry.diameter), 1);
  let output = '; Hardware Studio draft NC Drill - explicit project geometry only\n';
  output += '; NOT INDEPENDENTLY QUALIFIED. Verify drill origin, plating and tool table before fabrication.\n';
  output += 'M48\nMETRIC,TZ\n';
  for (const [diameter, code] of tools.entries()) {
    output += `T${String(code).padStart(2, '0')}C${diameter.toFixed(4)}\n`;
  }
  output += '%\nG90\n';
  for (const entry of entries) {
    const code = tools.get(Number(entry.diameter.toFixed(6)));
    if (!code) continue;
    output += `; ${entry.plated ? 'PTH' : 'NPTH'} ${entry.id}\n`;
    output += `T${String(code).padStart(2, '0')}\n`;
    output += `X${entry.x.toFixed(4)}Y${entry.y.toFixed(4)}\n`;
  }
  output += 'M30\n';
  return output;
}

export function generateNativeCplDraftCsv(project: Project): string {
  const context = assertManufacturingContext(project);
  const headers = ['Designator', 'Component Name', 'Footprint', 'Mid X (mm)', 'Mid Y (mm)', 'Rotation (deg)', 'Side', 'Board', 'Board ID', 'Qualification'];
  const rows = context.placedComponents.map((component) => {
    const placement = componentPlacement(component);
    return [
      csvCell(component.referenceDesignator),
      csvCell(component.componentName),
      csvCell(component.footprint),
      csvCell(placement.xMm),
      csvCell(placement.yMm),
      csvCell(placement.rotationDeg),
      csvCell(placement.side),
      csvCell(context.board.name),
      csvCell(context.boardId),
      csvCell('Draft - independent rotation/origin review required'),
    ].join(',');
  });
  return [
    '# Hardware Studio draft centroid / pick-and-place data.',
    '# Coordinates are canonical PCB millimetres; zero is preserved as a valid coordinate.',
    '# Independent origin, side and rotation verification is required before assembly.',
    headers.join(','),
    ...rows,
  ].join('\n');
}

export function exportBomCsv(project: Project): string {
  const { boardId, boardName } = selectedBoard(project);
  const components = (project.boardComponents || []).filter((component) => component.boardId === boardId);
  const headers = ['Reference Designator', 'Component Name', 'Value', 'Footprint', 'Package', 'Quantity', 'Manufacturer', 'Manufacturer Part Number', 'Board', 'Board ID'];
  const rows = components.map((component) => [
    csvCell(component.referenceDesignator),
    csvCell(component.componentName),
    csvCell(component.value || ''),
    csvCell(component.footprint || ''),
    csvCell(component.packageName || ''),
    csvCell(component.quantity ?? 1),
    csvCell(component.manufacturer || ''),
    csvCell(component.partNumber || ''),
    csvCell(boardName),
    csvCell(boardId),
  ].join(','));
  return [headers.join(','), ...rows].join('\n');
}

export function generateNativeNetlistJson(project: Project): string {
  const { boardId, boardName } = selectedBoard(project);
  const components = (project.boardComponents || []).filter((component) => component.boardId === boardId);
  const componentIds = new Set(components.map((component) => component.id));
  const referencedNetIds = new Set<string>();
  const referencedNetNames = new Set<string>();

  for (const component of components) {
    for (const pin of component.pins || []) {
      if (pin.netId) referencedNetIds.add(pin.netId);
      if (pin.netName) referencedNetNames.add(pin.netName);
    }
  }
  for (const trace of (project.traces || []).filter((trace) => trace.boardId === boardId)) {
    if (trace.netId) referencedNetIds.add(trace.netId);
    if (trace.netName) referencedNetNames.add(trace.netName);
  }
  for (const via of (project.vias || []).filter((via) => via.boardId === boardId)) {
    if (via.netId) referencedNetIds.add(via.netId);
    if (via.netName) referencedNetNames.add(via.netName);
  }

  const nets = (project.nets || []).filter((net) => referencedNetIds.has(net.id) || referencedNetNames.has(net.netName));
  const padAssignments = (project.padNetAssignments || []).filter((assignment) => componentIds.has(assignment.componentId));

  return JSON.stringify({
    format: 'Hardware Studio Board Netlist JSON v2',
    boardId,
    boardName,
    generatedAt: new Date().toISOString(),
    nets,
    padAssignments,
    disclaimer: 'Logical board-scoped connectivity draft. Independent ERC/DRC and interchange validation required.',
  }, null, 2);
}

export function generateNativeBoardLayoutJson(project: Project): string {
  const context = assertManufacturingContext(project);
  const componentIds = new Set(context.components.map((component) => component.id));
  return JSON.stringify({
    format: 'Hardware Studio Native Board Layout v2',
    generatedAt: new Date().toISOString(),
    projectName: project.projectName,
    projectVersion: project.version,
    board: context.board,
    boardOutline: context.outline,
    boardDimensions: context.dimensions,
    pcbLayers: (project.pcbLayers || []).filter((layer) => layer.boardId === context.boardId),
    boardComponents: context.components,
    traces: context.traces,
    vias: context.vias,
    drillHoles: context.drillHoles,
    keepoutZones: (project.keepoutZones || []).filter((zone) => zone.boardId === context.boardId),
    pcbRules: (project.pcbRules || []).filter((rule) => rule.boardId === context.boardId),
    padNetAssignments: (project.padNetAssignments || []).filter((assignment) => componentIds.has(assignment.componentId)),
    copperShapes: [],
    disclaimer: 'Canonical board-scoped layout data. Copper shapes are blocked by preflight until a lossless serializer exists.',
  }, null, 2);
}

export function exportHardwareStudioBoardJson(project: Project): string {
  return generateNativeBoardLayoutJson(project);
}
