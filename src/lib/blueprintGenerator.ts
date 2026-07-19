// ============================================================
// Blueprint Generator — Hardware Studio Blueprint Generation System
// Generates a full 16-sheet BlueprintPack from live project data.
// ============================================================

import { Project } from '../types';
import { calculateReadinessScore } from './readinessScore';
import { runDesignReview } from './designReview';
import type {
  BlueprintPack,
  BlueprintSheet,
  BlueprintDrawing,
  BlueprintDrawingObject,
  BlueprintDrawingConnection,
  BlueprintDimension,
  BlueprintWarning,
  BlueprintTable,
  BlueprintSourceRef,
  BlueprintPackSummary,
  BlueprintSheetStatus,
} from './blueprintSheetTypes';

// ---- Helpers ----

let _warnId = 0;
const warnId = () => `bpw_${++_warnId}`;
const objId = () => `bpo_${++_warnId}`;
const connId = () => `bpc_${++_warnId}`;
const dimId = () => `bpd_${++_warnId}`;
const tblId = () => `bpt_${++_warnId}`;

function emptyDrawing(vb = "0 0 800 500"): BlueprintDrawing {
  return { viewBox: vb, grid: true, objects: [], connections: [], dimensions: [], callouts: [] };
}

function sheetStatus(hasData: boolean, warnings: BlueprintWarning[]): BlueprintSheetStatus {
  if (!hasData) return "Missing Data";
  if (warnings.some(w => w.severity === "Blocker" || w.severity === "Error")) return "Draft";
  return "Generated In App";
}

// ============================================================
// SHEET 1 — Product Architecture Blueprint
// ============================================================
function generateProductArchitectureSheet(p: Project, reviewResults: ReturnType<typeof runDesignReview>): BlueprintSheet {
  const nodes = p.nodes || [];
  const edges = p.edges || [];
  const warnings: BlueprintWarning[] = [];
  const sources: BlueprintSourceRef[] = nodes.map(n => ({ type: "node", id: n.id, label: n.data?.name || n.id }));

  // Drawing objects from nodes
  const drawObjs: BlueprintDrawingObject[] = nodes.map((n, i) => ({
    id: objId(), type: "block" as const, label: n.data?.name || "Node",
    x: 50 + (i % 4) * 180, y: 50 + Math.floor(i / 4) * 120, width: 160, height: 80,
    sourceType: "node", sourceId: n.id,
    metadata: { category: n.data?.category || "", status: n.data?.status || "", description: (n.data?.description || "").slice(0, 60) }
  }));

  // Drawing connections from edges
  const drawConns: BlueprintDrawingConnection[] = edges.map(e => ({
    id: connId(), sourceId: drawObjs.find(o => o.sourceId === e.source)?.id || "",
    targetId: drawObjs.find(o => o.sourceId === e.target)?.id || "",
    label: typeof e.label === 'string' ? e.label : undefined, type: "signal" as const
  })).filter(c => c.sourceId && c.targetId);

  // Warnings
  if (!nodes.some(n => n.data?.category?.toLowerCase().includes("input") || n.data?.name?.toLowerCase().includes("touch") || n.data?.name?.toLowerCase().includes("button")))
    warnings.push({ id: warnId(), sheetId: "sh-1", severity: "Warning", title: "No Input Node", message: "Architecture has no primary user interaction input node.", sourceType: "architecture" });
  if (!nodes.some(n => n.data?.category?.toLowerCase().includes("power") || n.id.toLowerCase().includes("battery")))
    warnings.push({ id: warnId(), sheetId: "sh-1", severity: "Warning", title: "No Power Node", message: "Architecture has no power supply or charging source node.", sourceType: "architecture" });
  if (!nodes.some(n => n.data?.category?.toLowerCase().includes("firmware") || n.data?.category?.toLowerCase().includes("software")))
    warnings.push({ id: warnId(), sheetId: "sh-1", severity: "Warning", title: "No Firmware Node", message: "Architecture has no firmware/control processing node.", sourceType: "architecture" });
  if (nodes.length === 0)
    warnings.push({ id: warnId(), sheetId: "sh-1", severity: "Blocker", title: "Empty Architecture", message: "No subsystem nodes defined. Generate Product Plan first.", sourceType: "architecture" });

  // Architecture review warnings
  reviewResults.filter(r => r.category === "Architecture").forEach(r => {
    warnings.push({ id: warnId(), sheetId: "sh-1", severity: r.severity, title: r.title, message: r.description, sourceType: r.linkedObjectType, sourceId: r.linkedObjectId });
  });

  // Tables
  const subsystemTable: BlueprintTable = {
    id: tblId(), title: "Subsystem Inventory",
    columns: ["Block", "Category", "Status", "Description"],
    rows: nodes.map(n => [n.data?.name || "", n.data?.category || "", n.data?.status || "", (n.data?.description || "").slice(0, 80)])
  };

  const drawing: BlueprintDrawing = { viewBox: "0 0 800 500", grid: true, objects: drawObjs, connections: drawConns, dimensions: [], callouts: [] };

  return {
    id: "sh-1", sheetNo: "01", title: "Product Architecture Blueprint", category: "product",
    status: sheetStatus(nodes.length > 0, warnings), sourceObjects: sources, drawing,
    tables: [subsystemTable], notes: [`${nodes.length} subsystem nodes mapped.`, `${edges.length} connections established.`],
    warnings, disclaimer: "Generated architecture diagram. Final system review required."
  };
}

// ============================================================
// SHEET 2 — Product Requirements Blueprint
// ============================================================
function generateProductRequirementsSheet(p: Project): BlueprintSheet {
  const nodes = p.nodes || [];
  const warnings: BlueprintWarning[] = [];
  const sources: BlueprintSourceRef[] = [{ type: "project", id: p.id, label: p.projectName }];

  const reqRows: string[][] = [];
  nodes.forEach(n => {
    if (n.data?.requirements) reqRows.push([n.data.name, n.data.requirements, n.data.priority || "Medium", n.data.status || "MVP", n.data.testingNotes || "—"]);
  });

  if (reqRows.length === 0) warnings.push({ id: warnId(), sheetId: "sh-2", severity: "Warning", title: "No Requirements", message: "No nodes have requirements fields populated." });

  const nodesWithoutReqs = nodes.filter(n => !n.data?.requirements);
  if (nodesWithoutReqs.length > 0) warnings.push({ id: warnId(), sheetId: "sh-2", severity: "Info", title: "Missing Requirements", message: `${nodesWithoutReqs.length} nodes lack requirements fields.` });

  const nodesWithRisks = nodes.filter(n => n.data?.risks);
  if (nodesWithRisks.length === 0 && nodes.length > 0) warnings.push({ id: warnId(), sheetId: "sh-2", severity: "Warning", title: "No Risk Analysis", message: "No nodes have risk fields populated." });

  const drawObjs: BlueprintDrawingObject[] = [
    { id: objId(), type: "annotation", label: p.projectName, x: 50, y: 30, width: 300, height: 40, metadata: { description: p.description || "" } },
    { id: objId(), type: "annotation", label: `Template: ${p.templateName || "Custom"}`, x: 50, y: 80, width: 200, height: 30 },
    { id: objId(), type: "annotation", label: `Version: ${p.version}`, x: 260, y: 80, width: 120, height: 30 },
  ];

  const reqTable: BlueprintTable = { id: tblId(), title: "Requirements Matrix", columns: ["Block", "Requirement", "Priority", "Status", "Test Coverage"], rows: reqRows };
  const riskTable: BlueprintTable = {
    id: tblId(), title: "Risk Register", columns: ["Block", "Risk", "Mitigation", "Priority"],
    rows: nodes.filter(n => n.data?.risks).map(n => [n.data.name, n.data.risks || "", n.data?.mitigation || "—", n.data?.priority || "—"])
  };

  return {
    id: "sh-2", sheetNo: "02", title: "Product Requirements Blueprint", category: "product",
    status: sheetStatus(reqRows.length > 0, warnings), sourceObjects: sources,
    drawing: { ...emptyDrawing(), objects: drawObjs }, tables: [reqTable, riskTable],
    notes: [`${reqRows.length} requirements captured.`, `${nodesWithRisks.length} risks identified.`],
    warnings, disclaimer: "Generated requirements summary. Final review required."
  };
}

// ============================================================
// SHEET 3 — Mechanical / Enclosure Blueprint
// ============================================================
function generateMechanicalSheet(p: Project): BlueprintSheet {
  const zones = p.mechanicalZones || [];
  const boards = p.boards || [];
  const outlines = p.boardOutlines || [];
  const warnings: BlueprintWarning[] = [];
  const sources: BlueprintSourceRef[] = zones.map(z => ({ type: "mechanical-zone", id: z.id, label: z.name }));
  const isRing = p.projectName?.toLowerCase().includes("ring") || p.templateName?.toLowerCase().includes("ring");

  const drawObjs: BlueprintDrawingObject[] = zones.map((z, i) => ({
    id: objId(), type: "zone" as const, label: z.name,
    x: z.x ?? (50 + (i % 3) * 240), y: z.y ?? (50 + Math.floor(i / 3) * 130), width: z.width ?? 220, height: z.height ?? 100,
    sourceType: "mechanical-zone", sourceId: z.id,
    metadata: { material: z.material || "", zoneType: z.zoneType || "", dimensionNote: z.dimensionNote || "" }
  }));

  const dims: BlueprintDimension[] = [];
  outlines.forEach(ol => {
    if (ol.width && ol.height) {
      dims.push({ id: dimId(), label: `${ol.width}×${ol.height} ${ol.units || "mm"}`, from: { x: 50, y: 450 }, to: { x: 50 + (ol.width * 5), y: 450 }, unit: ol.units || "mm" });
    }
  });

  if (zones.length === 0) warnings.push({ id: warnId(), sheetId: "sh-3", severity: "Warning", title: "No Mechanical Zones", message: "No mechanical zones defined. Generate Product Plan to seed zones." });
  if (isRing) {
    if (!zones.some(z => z.zoneType?.toLowerCase().includes("seal") || z.name?.toLowerCase().includes("seal")))
      warnings.push({ id: warnId(), sheetId: "sh-3", severity: "Warning", title: "No Seal Zone", message: "Wearable ring lacks waterproof seal/potting zone." });
    if (!zones.some(z => z.name?.toLowerCase().includes("antenna") || z.zoneType?.toLowerCase().includes("antenna")))
      warnings.push({ id: warnId(), sheetId: "sh-3", severity: "Warning", title: "No Antenna Keepout", message: "RF wearable missing antenna keepout zone." });
  }

  const zoneTable: BlueprintTable = {
    id: tblId(), title: "Mechanical Zones", columns: ["Zone", "Type", "Material", "Dimensions", "Notes"],
    rows: zones.map(z => [z.name, z.zoneType || "", z.material || "", z.dimensionNote || "", z.notes || ""])
  };

  return {
    id: "sh-3", sheetNo: "03", title: "Mechanical / Enclosure Blueprint", category: "mechanical",
    status: sheetStatus(zones.length > 0, warnings), sourceObjects: sources,
    drawing: { viewBox: "0 0 800 500", grid: true, objects: drawObjs, connections: [], dimensions: dims, callouts: [] },
    tables: [zoneTable], notes: [`${zones.length} mechanical zones.`, `${boards.length} boards referenced.`],
    warnings, disclaimer: "Generated mechanical layout drawing. Final geometry review required before enclosure fabrication."
  };
}

// ============================================================
// SHEET 4 — Assembly / Exploded Stack Blueprint
// ============================================================
function generateAssemblySheet(p: Project): BlueprintSheet {
  const layers = (p.assemblyLayers || []).sort((a, b) => a.order - b.order);
  const warnings: BlueprintWarning[] = [];
  const sources: BlueprintSourceRef[] = layers.map(l => ({ type: "assembly-layer", id: l.id, label: l.name }));

  const drawObjs: BlueprintDrawingObject[] = layers.map((l, i) => ({
    id: objId(), type: "zone" as const, label: `${l.order}. ${l.name}`,
    x: 200, y: 30 + i * 55, width: 400, height: 45,
    sourceType: "assembly-layer", sourceId: l.id,
    metadata: { material: l.material || "", fasteningMethod: l.fasteningMethod || "", layerType: l.layerType || "" }
  }));

  // Vertical assembly connections
  const drawConns: BlueprintDrawingConnection[] = [];
  for (let i = 0; i < drawObjs.length - 1; i++) {
    drawConns.push({ id: connId(), sourceId: drawObjs[i].id, targetId: drawObjs[i + 1].id, type: "assembly" });
  }

  if (layers.length === 0) warnings.push({ id: warnId(), sheetId: "sh-4", severity: "Warning", title: "No Assembly Layers", message: "No assembly layers defined." });
  if (layers.length > 0 && !layers.some(l => l.fasteningMethod)) warnings.push({ id: warnId(), sheetId: "sh-4", severity: "Warning", title: "Missing Fastening", message: "No layers have fastening methods specified." });
  if (layers.length > 0 && !layers.some(l => l.inspectionNote)) warnings.push({ id: warnId(), sheetId: "sh-4", severity: "Info", title: "No QA Checkpoints", message: "No assembly layers have inspection notes." });

  const assemblyTable: BlueprintTable = {
    id: tblId(), title: "Assembly Stack", columns: ["Order", "Layer", "Type", "Material", "Fastening", "Inspection"],
    rows: layers.map(l => [String(l.order), l.name, l.layerType || "", l.material || "", l.fasteningMethod || "", l.inspectionNote || ""])
  };

  return {
    id: "sh-4", sheetNo: "04", title: "Assembly / Exploded Stack Blueprint", category: "assembly",
    status: sheetStatus(layers.length > 0, warnings), sourceObjects: sources,
    drawing: { viewBox: "0 0 800 500", grid: true, objects: drawObjs, connections: drawConns, dimensions: [], callouts: [] },
    tables: [assemblyTable], notes: [`${layers.length} assembly layers.`],
    warnings, disclaimer: "Generated assembly stack diagram. Verify fastening methods and tolerances."
  };
}

// ============================================================
// SHEET 5 — Electronics Architecture Blueprint
// ============================================================
function generateElectronicsArchSheet(p: Project): BlueprintSheet {
  const boards = p.boards || [];
  const circuits = p.circuitBlocks || [];
  const components = p.boardComponents || [];
  const nets = p.nets || [];
  const power = p.powerBudget || [];
  const warnings: BlueprintWarning[] = [];
  const sources: BlueprintSourceRef[] = [
    ...boards.map(b => ({ type: "board", id: b.id, label: b.name })),
    ...circuits.map(c => ({ type: "circuit", id: c.id, label: c.name }))
  ];

  const drawObjs: BlueprintDrawingObject[] = circuits.map((c, i) => ({
    id: objId(), type: "block" as const, label: c.name,
    x: 50 + (i % 4) * 190, y: 60 + Math.floor(i / 4) * 120, width: 170, height: 90,
    sourceType: "circuit", sourceId: c.id,
    metadata: { circuitType: c.circuitType, boardId: c.boardId, status: c.status, components: c.requiredComponents?.slice(0, 40) || "" }
  }));

  // Connections from net data
  const drawConns: BlueprintDrawingConnection[] = [];
  nets.forEach(n => {
    const srcObj = drawObjs.find(o => o.metadata?.circuitType === "MCU" || o.label?.toLowerCase().includes(n.sourceComponent?.toLowerCase()));
    const tgtObj = drawObjs.find(o => o.label?.toLowerCase().includes(n.targetComponent?.toLowerCase()));
    if (srcObj && tgtObj && srcObj.id !== tgtObj.id) {
      drawConns.push({ id: connId(), sourceId: srcObj.id, targetId: tgtObj.id, label: n.netName, type: n.netType === "Power" ? "power" : n.netType === "Ground" ? "ground" : "signal" });
    }
  });

  if (circuits.length === 0) warnings.push({ id: warnId(), sheetId: "sh-5", severity: "Warning", title: "No Circuit Blocks", message: "No circuit blocks defined." });
  if (boards.length === 0) warnings.push({ id: warnId(), sheetId: "sh-5", severity: "Warning", title: "No Boards", message: "No PCB boards defined." });
  circuits.forEach(c => {
    if (!components.some(comp => comp.circuitBlockId === c.id))
      warnings.push({ id: warnId(), sheetId: "sh-5", severity: "Info", title: `${c.name} No Components`, message: `Circuit block "${c.name}" has no linked components.`, sourceType: "circuit", sourceId: c.id });
  });

  const circuitTable: BlueprintTable = {
    id: tblId(), title: "Circuit Blocks", columns: ["Circuit", "Type", "Board", "Components", "Status"],
    rows: circuits.map(c => [c.name, c.circuitType, boards.find(b => b.id === c.boardId)?.name || c.boardId, c.requiredComponents?.slice(0, 40) || "", c.status])
  };
  const powerNetsTable: BlueprintTable = {
    id: tblId(), title: "Power Rails", columns: ["Block", "Voltage", "Active mA", "Sleep µA", "Duty %"],
    rows: power.map(pb => [pb.blockName, pb.voltage, String(pb.activeCurrentMa), String(pb.sleepCurrentUa), String(pb.dutyCyclePercent)])
  };

  return {
    id: "sh-5", sheetNo: "05", title: "Electronics Architecture Blueprint", category: "electronics",
    status: sheetStatus(circuits.length > 0 || boards.length > 0, warnings), sourceObjects: sources,
    drawing: { viewBox: "0 0 800 500", grid: true, objects: drawObjs, connections: drawConns, dimensions: [], callouts: [] },
    tables: [circuitTable, powerNetsTable], notes: [`${circuits.length} circuit blocks.`, `${components.length} components.`, `${nets.length} nets.`],
    warnings, disclaimer: "Generated electronics architecture diagram. Final circuit review required."
  };
}

// ============================================================
// SHEET 6 — Schematic Blueprint
// ============================================================
function generateSchematicSheet(p: Project, reviewResults: ReturnType<typeof runDesignReview>): BlueprintSheet {
  const components = (p.boardComponents || []).filter(c => c.schematic?.placed === true);
  const wires = p.schematicWires || [];
  const warnings: BlueprintWarning[] = [];
  const sources: BlueprintSourceRef[] = components.map(c => ({ type: "component", id: c.id, label: c.referenceDesignator }));

  // Convert components to blueprint drawing objects
  const drawObjs: BlueprintDrawingObject[] = components.map(c => ({
    id: objId(),
    type: "schematic-symbol" as const,
    label: c.referenceDesignator,
    x: c.schematic?.x || 150,
    y: c.schematic?.y || 150,
    width: 60,
    height: 40,
    rotation: c.schematic?.rotation,
    sourceType: "component",
    sourceId: c.id,
    metadata: { symbolType: c.componentType, value: c.value || c.componentName, pinCount: c.pins?.length || 0 }
  }));

  // Convert schematic wires to drawing connections
  const drawConns: BlueprintDrawingConnection[] = wires.map(w => {
    const srcCompId = w.sourcePinId?.split('_')[0] || '';
    const tgtCompId = w.targetPinId?.split('_')[0] || '';
    
    return {
      id: connId(),
      sourceId: drawObjs.find(o => o.sourceId === srcCompId)?.id || "",
      targetId: drawObjs.find(o => o.sourceId === tgtCompId)?.id || "",
      label: w.netName,
      type: (w.netName?.toUpperCase() === 'GND' ? 'ground' : (w.netName?.toUpperCase() === '3V3' || w.netName?.toUpperCase() === '5V') ? 'power' : 'signal') as 'ground' | 'power' | 'signal'
    };
  }).filter(c => c.sourceId && c.targetId);

  // Map ERC review results
  reviewResults.filter(r => r.category.includes("ERC") || r.category.includes("Schematic")).forEach(r => {
    warnings.push({ id: warnId(), sheetId: "sh-6", severity: r.severity, title: r.title, message: r.description, sourceType: r.linkedObjectType, sourceId: r.linkedObjectId });
  });

  const symbolTable: BlueprintTable = {
    id: tblId(), title: "Placed Schematic Components", columns: ["Designator", "Type", "Value", "Pins", "Footprint"],
    rows: components.map(c => [c.referenceDesignator, c.componentType, c.value || "—", String(c.pins?.length || 0), c.footprint])
  };

  return {
    id: "sh-6", sheetNo: "06", title: "Schematic Blueprint", category: "schematic",
    status: sheetStatus(components.length > 0, warnings), sourceObjects: sources,
    drawing: { viewBox: "0 0 800 600", grid: true, objects: drawObjs, connections: drawConns, dimensions: [], callouts: [] },
    tables: [symbolTable], notes: [`${components.length} symbols.`, `${wires.length} wires.`],
    warnings, disclaimer: "Generated schematic blueprint from live product workspace. Final engineering review required."
  };
}

// ============================================================
// SHEET 7 — PCB Board Layout Blueprint
// ============================================================
function generatePCBLayoutSheet(p: Project, reviewResults: ReturnType<typeof runDesignReview>): BlueprintSheet {
  const activeBoardId = p.activeBoardId || 'board-main';
  const boards = (p.boards || []).filter(b => b.id === activeBoardId);
  const outlines = (p.boardOutlines || []).filter(o => o.boardId === activeBoardId);
  const layers = p.pcbLayers || [];
  const traces = (p.traces || []).filter(t => t.boardId === activeBoardId);
  const vias = (p.vias || []).filter(v => v.boardId === activeBoardId);
  const drills = (p.drillHoles || []).filter(d => d.boardId === activeBoardId);
  const warnings: BlueprintWarning[] = [];
  const sources: BlueprintSourceRef[] = boards.map(b => ({ type: "board", id: b.id, label: b.name }));

  const drawObjs: BlueprintDrawingObject[] = [];

  const outline = outlines[0];
  const boardW = outline?.width || 50;
  const boardH = outline?.height || 12;
  const scale = Math.min(450 / boardW, 250 / boardH);
  const startX = 400 - (boardW * scale) / 2;
  const startY = 250 - (boardH * scale) / 2;

  if (boards.length > 0) {
    drawObjs.push({
      id: objId(), type: "board", label: boards[0].name,
      x: startX, y: startY, width: boardW * scale, height: boardH * scale,
      sourceType: "board", sourceId: boards[0].id,
      metadata: { boardType: boards[0].boardType, dimensions: boards[0].dimensionsMm || "", layers: boards[0].layerCount, substrate: boards[0].substrate, status: boards[0].status }
    });
  }

  vias.forEach(v => {
    if (v.x != null && v.y != null) {
      drawObjs.push({
        id: objId(), type: "via", label: "",
        x: startX + v.x * scale - 2, y: startY + v.y * scale - 2,
        width: 4, height: 4, sourceType: "via", sourceId: v.id
      });
    }
  });

  drills.forEach(d => {
    if (d.x != null && d.y != null) {
      drawObjs.push({
        id: objId(), type: "via", label: "",
        x: startX + d.x * scale - 3, y: startY + d.y * scale - 3,
        width: 6, height: 6, sourceType: "drill", sourceId: d.id
      });
    }
  });

  const dims: BlueprintDimension[] = [];
  if (outline) {
    dims.push({
      id: dimId(), label: `${boardW} mm`,
      from: { x: startX, y: startY + boardH * scale + 15 },
      to: { x: startX + boardW * scale, y: startY + boardH * scale + 15 },
      unit: "mm"
    });
    dims.push({
      id: dimId(), label: `${boardH} mm`,
      from: { x: startX - 15, y: startY },
      to: { x: startX - 15, y: startY + boardH * scale },
      unit: "mm"
    });
  }

  if (boards.length === 0) warnings.push({ id: warnId(), sheetId: "sh-7", severity: "Blocker", title: "No Boards", message: "No PCB boards defined." });
  reviewResults.filter(r => r.category.includes("DRC") || r.category.includes("PCB")).forEach(r => {
    warnings.push({ id: warnId(), sheetId: "sh-7", severity: r.severity, title: r.title, message: r.description, sourceType: r.linkedObjectType, sourceId: r.linkedObjectId });
  });

  const boardTable: BlueprintTable = {
    id: tblId(), title: "Board Specifications", columns: ["Board", "Type", "Dimensions", "Layers", "Substrate", "Status"],
    rows: boards.map(b => [b.name, b.boardType, b.dimensionsMm || "—", String(b.layerCount), b.substrate, b.status])
  };
  const layerTable: BlueprintTable = {
    id: tblId(), title: "PCB Layer Stack", columns: ["Layer", "Type", "Order", "Copper", "Thickness µm"],
    rows: layers.map(l => [l.name, l.type, String(l.order), l.copper ? "Yes" : "No", String(l.thicknessUm ?? "—")])
  };

  return {
    id: "sh-7", sheetNo: "07", title: "PCB Board Layout Blueprint", category: "pcb",
    status: sheetStatus(boards.length > 0, warnings), sourceObjects: sources,
    drawing: { viewBox: "0 0 800 500", grid: true, objects: drawObjs, connections: [], dimensions: dims, callouts: [] },
    tables: [boardTable, layerTable], notes: [`${boards.length} boards.`, `${traces.length} traces.`, `${vias.length} vias.`, `${drills.length} drill holes.`],
    warnings, disclaimer: "Generated PCB layout blueprint. Final DRC review required."
  };
}

// ============================================================
// SHEET 8 — Component Placement Blueprint
// ============================================================
import { getFootprint as getFpPreset } from './footprints';

function generateComponentPlacementSheet(p: Project): BlueprintSheet {
  const activeBoardId = p.activeBoardId || 'board-main';
  const components = (p.boardComponents || []).filter(c => c.boardId === activeBoardId);
  const boards = (p.boards || []).filter(b => b.id === activeBoardId);
  const outlines = (p.boardOutlines || []).filter(o => o.boardId === activeBoardId);
  const warnings: BlueprintWarning[] = [];
  const sources: BlueprintSourceRef[] = components.map(c => ({ type: "component", id: c.id, label: c.referenceDesignator || c.componentName }));

  const drawObjs: BlueprintDrawingObject[] = [];

  const outline = outlines[0];
  const boardW = outline?.width || 50;
  const boardH = outline?.height || 12;
  const scale = Math.min(450 / boardW, 250 / boardH);
  const startX = 400 - (boardW * scale) / 2;
  const startY = 250 - (boardH * scale) / 2;

  // Board outline background
  if (boards.length > 0) {
    drawObjs.push({
      id: objId(), type: "board", label: boards[0].name,
      x: startX, y: startY, width: boardW * scale, height: boardH * scale,
      sourceType: "board", sourceId: boards[0].id
    });
  }

  components.forEach(c => {
    if (c.placementX != null && c.placementY != null) {
      const fp = getFpPreset(c.footprint);
      const w = fp.bodyWidthMm || 3;
      const h = fp.bodyHeightMm || 2;
      drawObjs.push({
        id: objId(), type: "component", label: c.referenceDesignator || c.componentName,
        x: startX + (c.placementX - w / 2) * scale,
        y: startY + (c.placementY - h / 2) * scale,
        width: w * scale, height: h * scale,
        rotation: c.rotationDeg, sourceType: "component", sourceId: c.id,
        metadata: { footprint: c.footprint || "", value: c.value || "", side: c.side, packageName: c.packageName || "" }
      });
    }
  });

  if (components.length === 0) warnings.push({ id: warnId(), sheetId: "sh-8", severity: "Warning", title: "No Components", message: "No board components defined." });
  const unplaced = components.filter(c => c.placementX == null || c.placementY == null);
  if (unplaced.length > 0) warnings.push({ id: warnId(), sheetId: "sh-8", severity: "Warning", title: `${unplaced.length} Unplaced`, message: `${unplaced.length} components lack placement coordinates.` });

  const placementTable: BlueprintTable = {
    id: tblId(), title: "Component Placement", columns: ["RefDes", "Component", "Footprint", "X", "Y", "Rotation", "Side", "Status"],
    rows: components.map(c => [c.referenceDesignator, c.componentName, c.footprint || "—", String(c.placementX ?? "—"), String(c.placementY ?? "—"), String(c.rotationDeg ?? 0), c.side, c.placementX != null ? "Placed" : "Unplaced"])
  };

  return {
    id: "sh-8", sheetNo: "08", title: "Component Placement Blueprint", category: "pcb",
    status: sheetStatus(components.length > 0, warnings), sourceObjects: sources,
    drawing: { viewBox: "0 0 800 500", grid: true, objects: drawObjs, connections: [], dimensions: [], callouts: [] },
    tables: [placementTable], notes: [`${components.length} components.`, `${unplaced.length} unplaced.`],
    warnings, disclaimer: "Generated component placement blueprint. Verify footprints and positions."
  };
}

// ============================================================
// SHEET 9 — Routing / Net Blueprint
// ============================================================
function generateRoutingSheet(p: Project): BlueprintSheet {
  const activeBoardId = p.activeBoardId || 'board-main';
  const nets = p.nets || [];
  const traces = (p.traces || []).filter(t => t.boardId === activeBoardId);
  const vias = (p.vias || []).filter(v => v.boardId === activeBoardId);
  const outlines = (p.boardOutlines || []).filter(o => o.boardId === activeBoardId);
  const boards = (p.boards || []).filter(b => b.id === activeBoardId);
  const warnings: BlueprintWarning[] = [];
  const sources: BlueprintSourceRef[] = nets.map(n => ({ type: "net", id: n.id, label: n.netName }));

  const drawObjs: BlueprintDrawingObject[] = [];

  const outline = outlines[0];
  const boardW = outline?.width || 50;
  const boardH = outline?.height || 12;
  const scale = Math.min(450 / boardW, 250 / boardH);
  const startX = 400 - (boardW * scale) / 2;
  const startY = 250 - (boardH * scale) / 2;

  // Board outline background
  if (boards.length > 0) {
    drawObjs.push({
      id: objId(), type: "board", label: boards[0].name,
      x: startX, y: startY, width: boardW * scale, height: boardH * scale,
      sourceType: "board", sourceId: boards[0].id
    });
  }

  // Draw traces as rotated segments
  traces.forEach(t => {
    if (t.points && t.points.length > 1) {
      for (let i = 0; i < t.points.length - 1; i++) {
        const pt1 = t.points[i];
        const pt2 = t.points[i + 1];
        const cx = (pt1.x + pt2.x) / 2;
        const cy = (pt1.y + pt2.y) / 2;
        const dist = Math.hypot(pt2.x - pt1.x, pt2.y - pt1.y);
        const angle = Math.atan2(pt2.y - pt1.y, pt2.x - pt1.x) * 180 / Math.PI;

        drawObjs.push({
          id: objId(), type: "trace", label: "",
          x: startX + cx * scale - (dist * scale) / 2,
          y: startY + cy * scale - 1,
          width: dist * scale, height: 2,
          rotation: angle, sourceType: "trace", sourceId: t.id
        });
      }
    }
  });

  // Draw vias
  vias.forEach(v => {
    if (v.x != null && v.y != null) {
      drawObjs.push({
        id: objId(), type: "via", label: "",
        x: startX + v.x * scale - 2, y: startY + v.y * scale - 2,
        width: 4, height: 4, sourceType: "via", sourceId: v.id
      });
    }
  });

  const hasGND = nets.some(n => n.netName.toUpperCase() === "GND" || n.netType === "Ground");
  if (!hasGND && nets.length > 0) warnings.push({ id: warnId(), sheetId: "sh-9", severity: "Error", title: "Missing GND", message: "No GND net defined." });
  if (nets.length === 0) warnings.push({ id: warnId(), sheetId: "sh-9", severity: "Warning", title: "No Nets", message: "No nets defined." });
  const unrouted = nets.filter(n => !traces.some(t => t.netName === n.netName || t.netId === n.id));
  if (unrouted.length > 0) warnings.push({ id: warnId(), sheetId: "sh-9", severity: "Info", title: `${unrouted.length} Unrouted`, message: `${unrouted.length} nets lack routed traces.` });

  const netTable: BlueprintTable = {
    id: tblId(), title: "Net List", columns: ["Net", "Type", "Voltage", "Source", "Target", "Protocol", "Routed"],
    rows: nets.map(n => [n.netName, n.netType, n.voltage || "—", n.sourceComponent, n.targetComponent, n.protocol || "—", traces.some(t => t.netName === n.netName || t.netId === n.id) ? "Yes" : "No"])
  };

  return {
    id: "sh-9", sheetNo: "09", title: "Routing / Net Blueprint", category: "pcb",
    status: sheetStatus(nets.length > 0, warnings), sourceObjects: sources,
    drawing: { viewBox: "0 0 800 500", grid: true, objects: drawObjs, connections: [], dimensions: [], callouts: [] },
    tables: [netTable], notes: [`${nets.length} nets.`, `${traces.length} traces.`, `${vias.length} vias.`],
    warnings, disclaimer: "Generated routing blueprint. Verify impedance and clearance."
  };
}

// ============================================================
// SHEET 10 — Power Tree Blueprint
// ============================================================
function generatePowerTreeSheet(p: Project): BlueprintSheet {
  const power = p.powerBudget || [];
  const batteryMah = p.batteryCapacityMah;
  const warnings: BlueprintWarning[] = [];
  const sources: BlueprintSourceRef[] = power.map(pb => ({ type: "power", id: pb.id, label: pb.blockName }));

  // Battery at top, then rails, then loads
  const drawObjs: BlueprintDrawingObject[] = [];
  if (batteryMah) {
    drawObjs.push({ id: objId(), type: "block", label: `Battery ${batteryMah}mAh`, x: 300, y: 20, width: 200, height: 50, metadata: { capacity: batteryMah } });
  }
  power.forEach((pb, i) => {
    drawObjs.push({
      id: objId(), type: "block", label: pb.blockName,
      x: 50 + (i % 3) * 250, y: 120 + Math.floor(i / 3) * 90, width: 220, height: 60,
      sourceType: "power", sourceId: pb.id,
      metadata: { voltage: pb.voltage, activeMa: pb.activeCurrentMa, sleepUa: pb.sleepCurrentUa, dutyCycle: pb.dutyCyclePercent }
    });
  });

  // Connections from battery to loads
  const drawConns: BlueprintDrawingConnection[] = [];
  if (drawObjs.length > 1 && batteryMah) {
    for (let i = 1; i < drawObjs.length; i++) {
      drawConns.push({ id: connId(), sourceId: drawObjs[0].id, targetId: drawObjs[i].id, type: "power", label: drawObjs[i].metadata?.voltage as string || "" });
    }
  }

  // Calculate runtime
  let totalAvgMa = 0;
  power.forEach(pb => { totalAvgMa += (pb.activeCurrentMa * pb.dutyCyclePercent / 100 + pb.sleepCurrentUa / 1000 * (100 - pb.dutyCyclePercent) / 100) * pb.quantity; });
  const runtimeHrs = batteryMah && totalAvgMa > 0 ? (batteryMah / totalAvgMa).toFixed(1) : "—";

  if (!batteryMah) warnings.push({ id: warnId(), sheetId: "sh-10", severity: "Warning", title: "No Battery Capacity", message: "Battery capacity not specified." });
  if (power.length === 0) warnings.push({ id: warnId(), sheetId: "sh-10", severity: "Warning", title: "No Power Budget", message: "No power budget entries defined." });
  if (typeof runtimeHrs === "string" && runtimeHrs !== "—" && parseFloat(runtimeHrs) < 1) warnings.push({ id: warnId(), sheetId: "sh-10", severity: "Warning", title: "Low Runtime", message: `Estimated runtime is only ${runtimeHrs} hours.` });

  const powerTable: BlueprintTable = {
    id: tblId(), title: "Power Budget", columns: ["Block", "Voltage", "Active mA", "Sleep µA", "Duty %", "Qty", "Notes"],
    rows: power.map(pb => [pb.blockName, pb.voltage, String(pb.activeCurrentMa), String(pb.sleepCurrentUa), String(pb.dutyCyclePercent), String(pb.quantity), pb.notes || ""])
  };

  return {
    id: "sh-10", sheetNo: "10", title: "Power Tree Blueprint", category: "electronics",
    status: sheetStatus(power.length > 0, warnings), sourceObjects: sources,
    drawing: { viewBox: "0 0 800 500", grid: true, objects: drawObjs, connections: drawConns, dimensions: [], callouts: [] },
    tables: [powerTable], notes: [`${power.length} power blocks.`, `Battery: ${batteryMah ?? "—"} mAh.`, `Estimated runtime: ${runtimeHrs} hrs.`, `Total avg current: ${totalAvgMa.toFixed(2)} mA.`],
    warnings, disclaimer: "Generated power tree diagram. Verify voltage regulation and current limits."
  };
}

// ============================================================
// SHEET 11 — Pin Map / MCU Interface Blueprint
// ============================================================
function generatePinMapSheet(p: Project): BlueprintSheet {
  const pins = p.pinMap || [];
  const firmwareTasks = p.firmwareTasks || [];
  const warnings: BlueprintWarning[] = [];
  const sources: BlueprintSourceRef[] = pins.map(pm => ({ type: "pin", id: pm.id, label: pm.signalName }));

  // MCU block in center, pins around it
  const drawObjs: BlueprintDrawingObject[] = [];
  drawObjs.push({ id: objId(), type: "block", label: "MCU", x: 300, y: 150, width: 200, height: 200, metadata: { type: "mcu" } });

  pins.forEach((pm, i) => {
    const side = i % 4;
    const offset = Math.floor(i / 4) * 30;
    let px = 0, py = 0;
    if (side === 0) { px = 50; py = 160 + offset; }       // left
    else if (side === 1) { px = 560; py = 160 + offset; }  // right
    else if (side === 2) { px = 310 + offset * 2; py: py = 80; }  // top
    else { px = 310 + offset * 2; py = 400; }              // bottom

    drawObjs.push({
      id: objId(), type: "pin", label: `${pm.mcuPin}: ${pm.signalName}`,
      x: px, y: py, width: 140, height: 24,
      sourceType: "pin", sourceId: pm.id,
      metadata: { direction: pm.direction, protocol: pm.protocol, voltage: pm.voltage, connectedBlock: pm.connectedBlock }
    });
  });

  // Connect pins to MCU
  const mcuObj = drawObjs[0];
  const drawConns: BlueprintDrawingConnection[] = drawObjs.slice(1).map(pinObj => ({
    id: connId(), sourceId: pinObj.id, targetId: mcuObj.id,
    label: (pinObj.metadata?.protocol as string) || "", type: "signal" as const
  }));

  if (pins.length === 0) warnings.push({ id: warnId(), sheetId: "sh-11", severity: "Warning", title: "No Pin Map", message: "No MCU pin assignments defined." });
  const duplicatePins = pins.filter((p1, i) => pins.findIndex(p2 => p2.mcuPin === p1.mcuPin) !== i);
  if (duplicatePins.length > 0) warnings.push({ id: warnId(), sheetId: "sh-11", severity: "Error", title: "Duplicate Pins", message: `${duplicatePins.length} duplicate pin assignments found.` });

  // Check firmware coverage
  pins.forEach(pm => {
    if (!firmwareTasks.some(ft => ft.linkedBlock === pm.connectedBlock))
      warnings.push({ id: warnId(), sheetId: "sh-11", severity: "Info", title: `${pm.signalName} No Firmware`, message: `Signal "${pm.signalName}" has no linked firmware task.`, sourceType: "pin", sourceId: pm.id });
  });

  const pinTable: BlueprintTable = {
    id: tblId(), title: "MCU Pin Assignment", columns: ["Signal", "MCU Pin", "Direction", "Protocol", "Voltage", "Connected Block", "Firmware Task"],
    rows: pins.map(pm => [pm.signalName, pm.mcuPin, pm.direction, pm.protocol, pm.voltage, pm.connectedBlock, firmwareTasks.find(ft => ft.linkedBlock === pm.connectedBlock)?.name || "—"])
  };

  return {
    id: "sh-11", sheetNo: "11", title: "Pin Map / MCU Interface Blueprint", category: "electronics",
    status: sheetStatus(pins.length > 0, warnings), sourceObjects: sources,
    drawing: { viewBox: "0 0 800 500", grid: true, objects: drawObjs, connections: drawConns, dimensions: [], callouts: [] },
    tables: [pinTable], notes: [`${pins.length} pin assignments.`],
    warnings, disclaimer: "Generated pin map blueprint. Verify pin assignments against MCU datasheet."
  };
}

// ============================================================
// SHEET 12 — Firmware Architecture Blueprint
// ============================================================
function generateFirmwareArchSheet(p: Project): BlueprintSheet {
  const tasks = p.firmwareTasks || [];
  const pins = p.pinMap || [];
  const warnings: BlueprintWarning[] = [];
  const sources: BlueprintSourceRef[] = tasks.map(t => ({ type: "firmware", id: t.id, label: t.name }));

  const drawObjs: BlueprintDrawingObject[] = tasks.map((t, i) => ({
    id: objId(), type: "block" as const, label: t.name,
    x: 50 + (i % 3) * 250, y: 50 + Math.floor(i / 3) * 100, width: 220, height: 70,
    sourceType: "firmware", sourceId: t.id,
    metadata: { type: t.type, priority: t.priority, status: t.status, linkedBlock: t.linkedBlock }
  }));

  if (tasks.length === 0) warnings.push({ id: warnId(), sheetId: "sh-12", severity: "Warning", title: "No Firmware Tasks", message: "No firmware tasks defined." });
  if (!tasks.some(t => t.type === "Safety")) warnings.push({ id: warnId(), sheetId: "sh-12", severity: "Warning", title: "No Safety Task", message: "No safety/fault handling firmware task defined." });
  if (!tasks.some(t => t.type === "Power")) warnings.push({ id: warnId(), sheetId: "sh-12", severity: "Info", title: "No Power Task", message: "No low-power/sleep firmware task for battery product." });
  tasks.forEach(t => {
    if (!t.acceptanceCriteria) warnings.push({ id: warnId(), sheetId: "sh-12", severity: "Info", title: `${t.name} No Criteria`, message: `Task "${t.name}" lacks acceptance criteria.`, sourceType: "firmware", sourceId: t.id });
  });

  const taskTable: BlueprintTable = {
    id: tblId(), title: "Firmware Tasks", columns: ["Task", "Type", "Linked Block", "Priority", "Status", "Acceptance Criteria"],
    rows: tasks.map(t => [t.name, t.type, t.linkedBlock, t.priority, t.status, (t.acceptanceCriteria || "—").slice(0, 60)])
  };

  return {
    id: "sh-12", sheetNo: "12", title: "Firmware Architecture Blueprint", category: "firmware",
    status: sheetStatus(tasks.length > 0, warnings), sourceObjects: sources,
    drawing: { viewBox: "0 0 800 500", grid: true, objects: drawObjs, connections: [], dimensions: [], callouts: [] },
    tables: [taskTable], notes: [`${tasks.length} firmware tasks.`, `${pins.length} hardware signals mapped.`],
    warnings, disclaimer: "Generated firmware architecture blueprint. Final code review required."
  };
}

// ============================================================
// SHEET 13 — Firmware State Machine Blueprint
// ============================================================
function generateFirmwareStateMachineSheet(p: Project): BlueprintSheet {
  const tasks = p.firmwareTasks || [];
  const warnings: BlueprintWarning[] = [];

  // Generate standard firmware states
  const states = [
    { name: "Boot", desc: "Power-on initialization" },
    { name: "Init", desc: "Peripheral and stack setup" },
    { name: "Idle", desc: "Waiting for input events" },
    { name: "Sleep", desc: "Deep sleep / low power" },
    { name: "Input Detection", desc: "Touch/button event processing" },
    { name: "Command Dispatch", desc: "Gesture decode and action routing" },
    { name: "BLE / Communication", desc: "Wireless data exchange" },
    { name: "Feedback", desc: "Haptic/LED user feedback" },
    { name: "Charging", desc: "Battery charge management" },
    { name: "Fault / Safe Mode", desc: "Error handling and recovery" },
    { name: "Debug", desc: "Programming and diagnostics" },
  ];

  const drawObjs: BlueprintDrawingObject[] = states.map((s, i) => ({
    id: objId(), type: "state" as const, label: s.name,
    x: 50 + (i % 4) * 190, y: 50 + Math.floor(i / 4) * 140, width: 170, height: 80,
    metadata: { description: s.desc }
  }));

  // Standard transitions
  const transitions = [
    { from: "Boot", to: "Init", label: "power_on" },
    { from: "Init", to: "Idle", label: "ready" },
    { from: "Idle", to: "Sleep", label: "timeout" },
    { from: "Sleep", to: "Idle", label: "wake" },
    { from: "Idle", to: "Input Detection", label: "touch/press" },
    { from: "Input Detection", to: "Command Dispatch", label: "gesture_decoded" },
    { from: "Command Dispatch", to: "BLE / Communication", label: "send_command" },
    { from: "Command Dispatch", to: "Feedback", label: "confirm_action" },
    { from: "BLE / Communication", to: "Idle", label: "tx_complete" },
    { from: "Feedback", to: "Idle", label: "feedback_done" },
    { from: "Idle", to: "Charging", label: "charger_detected" },
    { from: "Charging", to: "Idle", label: "charge_complete" },
    { from: "Idle", to: "Debug", label: "debug_connected" },
    { from: "Debug", to: "Idle", label: "debug_disconnected" },
  ];

  const drawConns: BlueprintDrawingConnection[] = transitions.map(t => ({
    id: connId(),
    sourceId: drawObjs.find(o => o.label === t.from)?.id || "",
    targetId: drawObjs.find(o => o.label === t.to)?.id || "",
    label: t.label, type: "firmware" as const
  })).filter(c => c.sourceId && c.targetId);

  // Add fault transitions
  drawObjs.forEach(obj => {
    if (obj.label !== "Fault / Safe Mode" && obj.label !== "Boot") {
      const faultObj = drawObjs.find(o => o.label === "Fault / Safe Mode");
      if (faultObj) {
        drawConns.push({ id: connId(), sourceId: obj.id, targetId: faultObj.id, label: "error", type: "firmware" });
      }
    }
  });

  if (!tasks.some(t => t.type === "Safety")) warnings.push({ id: warnId(), sheetId: "sh-13", severity: "Warning", title: "No Fault Handler", message: "No firmware task handles fault/safe mode." });
  if (!tasks.some(t => t.type === "Power" || t.name.toLowerCase().includes("sleep"))) warnings.push({ id: warnId(), sheetId: "sh-13", severity: "Warning", title: "No Sleep Handler", message: "No firmware sleep/wake task defined." });

  const stateTable: BlueprintTable = {
    id: tblId(), title: "State Machine", columns: ["State", "Description", "Linked Task"],
    rows: states.map(s => [s.name, s.desc, tasks.find(t => t.name.toLowerCase().includes(s.name.toLowerCase().split(" ")[0]))?.name || "—"])
  };
  const transitionTable: BlueprintTable = {
    id: tblId(), title: "State Transitions", columns: ["From", "Event", "To"],
    rows: transitions.map(t => [t.from, t.label, t.to])
  };

  return {
    id: "sh-13", sheetNo: "13", title: "Firmware State Machine Blueprint", category: "firmware",
    status: sheetStatus(true, warnings), sourceObjects: tasks.map(t => ({ type: "firmware", id: t.id, label: t.name })),
    drawing: { viewBox: "0 0 800 500", grid: true, objects: drawObjs, connections: drawConns, dimensions: [], callouts: [] },
    tables: [stateTable, transitionTable], notes: [`${states.length} states.`, `${transitions.length} transitions.`],
    warnings, disclaimer: "Generated firmware state machine. Verify against actual firmware implementation."
  };
}

// ============================================================
// SHEET 14 — Testing / Validation Blueprint
// ============================================================
function generateTestingSheet(p: Project): BlueprintSheet {
  const tests = p.testing || [];
  const checklist = p.manufacturingChecklist || [];
  const warnings: BlueprintWarning[] = [];
  const sources: BlueprintSourceRef[] = tests.map(t => ({ type: "test", id: t.id, label: t.name }));

  // Group tests by category/stage
  const stages = ["EVT", "DVT", "PVT", "Factory QA"];
  const drawObjs: BlueprintDrawingObject[] = [];

  stages.forEach((stage, si) => {
    drawObjs.push({ id: objId(), type: "annotation", label: stage, x: si * 190 + 20, y: 20, width: 170, height: 30, metadata: { stageLabel: true } });
    const stageTests = tests.filter(t => t.category?.toUpperCase() === stage.toUpperCase().replace(" ", "_") || (si === 0 && !t.category));
    stageTests.forEach((t, ti) => {
      drawObjs.push({
        id: objId(), type: "test-card", label: t.name,
        x: si * 190 + 20, y: 60 + ti * 55, width: 170, height: 45,
        sourceType: "test", sourceId: t.id,
        metadata: { status: t.status, passCriteria: (t.passCriteria || "").slice(0, 40), category: t.category || "" }
      });
    });
  });

  if (tests.length === 0) warnings.push({ id: warnId(), sheetId: "sh-14", severity: "Warning", title: "No Tests", message: "No testing stages defined." });
  const failed = tests.filter(t => t.status === "Failed");
  if (failed.length > 0) warnings.push({ id: warnId(), sheetId: "sh-14", severity: "Error", title: `${failed.length} Failed`, message: `${failed.length} tests have failed.` });
  const blocked = tests.filter(t => t.status === "Blocked");
  if (blocked.length > 0) warnings.push({ id: warnId(), sheetId: "sh-14", severity: "Warning", title: `${blocked.length} Blocked`, message: `${blocked.length} tests are blocked.` });

  const testTable: BlueprintTable = {
    id: tblId(), title: "Test Plan", columns: ["Test", "Category", "Goal", "Pass Criteria", "Status", "Evidence"],
    rows: tests.map(t => [t.name, t.category || "—", (t.goal || "").slice(0, 40), (t.passCriteria || "").slice(0, 40), t.status, t.evidenceLink || "—"])
  };

  return {
    id: "sh-14", sheetNo: "14", title: "Testing / Validation Blueprint", category: "testing",
    status: sheetStatus(tests.length > 0, warnings), sourceObjects: sources,
    drawing: { viewBox: "0 0 800 500", grid: true, objects: drawObjs, connections: [], dimensions: [], callouts: [] },
    tables: [testTable], notes: [`${tests.length} tests.`, `${failed.length} failed.`, `${blocked.length} blocked.`, `${checklist.length} checklist items.`],
    warnings, disclaimer: "Generated testing blueprint. Verify test results and evidence."
  };
}

// ============================================================
// SHEET 15 — Manufacturing / Factory Package Blueprint
// ============================================================
function generateManufacturingSheet(p: Project): BlueprintSheet {
  const ff = p.factoryFiles || {};
  const status = p.factoryPackageStatus || "Draft";
  const checks = p.factoryReviewChecks || {};
  const checklist = p.manufacturingChecklist || [];
  const warnings: BlueprintWarning[] = [];

  const fileEntries = Object.entries(ff);
  const drawObjs: BlueprintDrawingObject[] = fileEntries.map(([key, val], i) => ({
    id: objId(), type: "factory-file" as const, label: val?.label || key,
    x: 50 + (i % 4) * 190, y: 50 + Math.floor(i / 4) * 70, width: 170, height: 55,
    sourceType: "factory-file", sourceId: key,
    metadata: { status: val?.status || "Not Generated", source: val?.source || "", fileName: val?.fileName || "" }
  }));

  const generated = fileEntries.filter(([, v]) => v && v.status !== "Not Generated").length;
  const notGenerated = fileEntries.filter(([, v]) => !v || v.status === "Not Generated").length;
  const verified = fileEntries.filter(([, v]) => v && v.status === "Verified").length;

  if (notGenerated > 0) warnings.push({ id: warnId(), sheetId: "sh-15", severity: "Warning", title: `${notGenerated} Not Generated`, message: `${notGenerated} factory files have not been generated.` });
  if (status === "Draft") warnings.push({ id: warnId(), sheetId: "sh-15", severity: "Info", title: "Package Draft", message: "Factory package is in Draft status." });
  const checkedCount = Object.values(checks).filter(Boolean).length;
  if (checkedCount < 10 && status !== "Draft") warnings.push({ id: warnId(), sheetId: "sh-15", severity: "Warning", title: "Review Incomplete", message: `${10 - checkedCount} checklist items not verified.` });

  const fileTable: BlueprintTable = {
    id: tblId(), title: "Factory Files", columns: ["File", "Status", "Source", "Needs Review"],
    rows: fileEntries.map(([key, val]) => [val?.label || key, val?.status || "Not Generated", val?.source || "—", val?.requiresReview ? "Yes" : "No"])
  };
  const checklistTable: BlueprintTable = {
    id: tblId(), title: "Manufacturing Checklist", columns: ["Category", "Item", "Status", "Notes"],
    rows: checklist.map(c => [c.category, c.item, c.status, c.ownerNotes || ""])
  };

  return {
    id: "sh-15", sheetNo: "15", title: "Manufacturing / Factory Package Blueprint", category: "manufacturing",
    status: sheetStatus(fileEntries.length > 0, warnings), sourceObjects: fileEntries.map(([k]) => ({ type: "factory-file", id: k, label: k })),
    drawing: { viewBox: "0 0 800 400", grid: true, objects: drawObjs, connections: [], dimensions: [], callouts: [] },
    tables: [fileTable, checklistTable],
    notes: [`Package Status: ${status}`, `${generated} generated.`, `${verified} verified.`, `${notGenerated} not generated.`, `Review: ${checkedCount}/10 items checked.`],
    warnings, disclaimer: "Generated manufacturing files require final engineering review, independent Gerber viewer review, and fab-house DFM validation before production."
  };
}

// ============================================================
// SHEET 16 — Release Readiness / Missing Files Blueprint
// ============================================================
function generateReadinessSheet(p: Project, reviewResults: ReturnType<typeof runDesignReview>): BlueprintSheet {
  const report = calculateReadinessScore(p);
  const ff = p.factoryFiles || {};
  const warnings: BlueprintWarning[] = [];

  // Readiness gates
  const gates = [
    { name: "Planning Ready", pass: report.isPlanningReady },
    { name: "Blueprint Pack Ready", pass: report.isBlueprintPackReady },
    { name: "Editor Layout Ready", pass: report.isEditorLayoutReady },
    { name: "Schematic Draft Ready", pass: report.isSchematicDraftReady },
    { name: "PCB Layout Draft Ready", pass: report.isPcbLayoutDraftReady },
    { name: "Routing Draft Ready", pass: report.isRoutingDraftReady },
    { name: "Prototype Prep Ready", pass: report.canMoveToPrototype },
    { name: "Factory Review Ready", pass: report.canMoveToFactoryHandoff },
    { name: "Fabrication Review Required", pass: report.canMoveToFactoryHandoff && !report.canMoveToFabrication },
    { name: "Direct Fabrication Ready", pass: report.canMoveToFabrication },
  ];

  const drawObjs: BlueprintDrawingObject[] = gates.map((g, i) => ({
    id: objId(), type: "block" as const, label: `${g.pass ? "✓" : "✗"} ${g.name}`,
    x: 50, y: 30 + i * 45, width: 350, height: 35,
    metadata: { pass: g.pass, gateIndex: i + 1 }
  }));

  // Missing files
  const missingFiles = Object.entries(ff).filter(([, v]) => !v || v.status === "Not Generated").map(([k]) => k);
  missingFiles.forEach((f, i) => {
    drawObjs.push({ id: objId(), type: "warning", label: `Missing: ${f}`, x: 450, y: 30 + i * 35, width: 300, height: 28, metadata: { fileKey: f } });
  });

  const blockers = reviewResults.filter(r => r.severity === "Blocker");
  const errors = reviewResults.filter(r => r.severity === "Error");
  if (blockers.length > 0) warnings.push({ id: warnId(), sheetId: "sh-16", severity: "Blocker", title: `${blockers.length} Blockers`, message: `${blockers.length} design review blockers must be resolved.` });
  if (errors.length > 0) warnings.push({ id: warnId(), sheetId: "sh-16", severity: "Error", title: `${errors.length} Errors`, message: `${errors.length} design review errors found.` });
  if (!report.canMoveToFabrication) warnings.push({ id: warnId(), sheetId: "sh-16", severity: "Warning", title: "Not Fab Ready", message: "Direct fabrication readiness not achieved." });

  const gateTable: BlueprintTable = {
    id: tblId(), title: "Readiness Gates", columns: ["Gate", "Status", "Required Condition"],
    rows: gates.map(g => [g.name, g.pass ? "PASS" : "FAIL", g.pass ? "Met" : "Action required"])
  };
  const issueTable: BlueprintTable = {
    id: tblId(), title: "Open Issues", columns: ["Severity", "Title", "Description", "Category"],
    rows: reviewResults.filter(r => r.severity === "Blocker" || r.severity === "Error").slice(0, 15).map(r => [r.severity, r.title, r.description.slice(0, 60), r.category])
  };

  return {
    id: "sh-16", sheetNo: "16", title: "Release Readiness / Missing Files Blueprint", category: "readiness",
    status: sheetStatus(true, warnings), sourceObjects: [{ type: "readiness", id: "report", label: `Score: ${report.overallScore}%` }],
    drawing: { viewBox: "0 0 800 500", grid: true, objects: drawObjs, connections: [], dimensions: [], callouts: [] },
    tables: [gateTable, issueTable],
    notes: [`Overall Score: ${report.overallScore}%`, `${blockers.length} blockers.`, `${errors.length} errors.`, `${missingFiles.length} missing files.`, `Fabrication Ready: ${report.canMoveToFabrication ? "YES" : "NO"}`],
    warnings, disclaimer: "Release readiness summary. All blockers must be resolved before fabrication."
  };
}

// ============================================================
// MAIN GENERATOR
// ============================================================
export function generateBlueprintPack(project: Project): BlueprintPack {
  _warnId = 0; // Reset ID counter

  const reviewResults = runDesignReview(project);

  const sheets: BlueprintSheet[] = [
    generateProductArchitectureSheet(project, reviewResults),
    generateProductRequirementsSheet(project),
    generateMechanicalSheet(project),
    generateAssemblySheet(project),
    generateElectronicsArchSheet(project),
    generateSchematicSheet(project, reviewResults),
    generatePCBLayoutSheet(project, reviewResults),
    generateComponentPlacementSheet(project),
    generateRoutingSheet(project),
    generatePowerTreeSheet(project),
    generatePinMapSheet(project),
    generateFirmwareArchSheet(project),
    generateFirmwareStateMachineSheet(project),
    generateTestingSheet(project),
    generateManufacturingSheet(project),
    generateReadinessSheet(project, reviewResults),
  ];

  const allWarnings: BlueprintWarning[] = sheets.flatMap(s => s.warnings);

  const summary: BlueprintPackSummary = {
    totalSheets: sheets.length,
    generatedSheets: sheets.filter(s => s.status !== "Missing Data").length,
    missingDataSheets: sheets.filter(s => s.status === "Missing Data").length,
    warnings: allWarnings.filter(w => w.severity === "Warning").length,
    errors: allWarnings.filter(w => w.severity === "Error").length,
    blockers: allWarnings.filter(w => w.severity === "Blocker").length,
  };

  return {
    id: `bp_${project.id}_${Date.now()}`,
    projectName: project.projectName,
    templateName: project.templateName,
    generatedAt: new Date().toISOString(),
    revision: project.version || "1.0",
    status: summary.blockers > 0 ? "Draft" : "Generated In App",
    sheets,
    warnings: allWarnings,
    summary,
  };
}
