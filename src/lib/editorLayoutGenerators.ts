import {
  Project,
  EditorConnection,
  BoardComponent, 
  NetItem, 
  PinMapItem, 
  FirmwareTask, 
  TestStage, 
  ManufacturingChecklistItem, 
  BoardItem, 
  FactoryFileStatus 
} from '../types';
import { applyCanonicalPcbPlacement, resolvePcbPlacement } from './pcb/pcbPlacementAuthority';
import { resolveArchitectureProjection } from './product/architectureAuthority';
import { resolveValidationAuthority } from './validation/validationAuthority';
import { resolveMechanicalAuthority } from './mechanical/mechanicalAuthority';

export const getInitialFactoryFiles = (project?: Project): Record<string, FactoryFileStatus> => {
  const hasBom = project && project.bom && project.bom.length > 0;
  const hasComponents = project && project.boardComponents && project.boardComponents.length > 0;
  const hasFw = project && project.firmwareTasks && project.firmwareTasks.length > 0;

  return {
    gerberZip: { status: "Not Generated", notes: "Requires Gerber RS-274X copper artwork layers export.", source: "KiCad" },
    drillFiles: { status: "Not Generated", notes: "Requires Excellon NC drill coordinate hole list.", source: "KiCad" },
    schematicPdf: { status: "Not Generated", notes: "Requires Schematic drawing PDF print sheets.", source: "KiCad" },
    boardDrawing: { status: "Conceptual", notes: "Draft board dimensions and physical outline layout.", source: "Hardware Studio" },
    enclosureDrawing: { status: "Not Generated", notes: "Requires MCAD mechanical casing dimension views.", source: "Fusion" },
    stepFile: { status: "Not Generated", notes: "Requires 3D STEP overall physical assembly model.", source: "Fusion" },
    stlFile: { status: "Not Generated", notes: "Requires 3D STL outer casing mesh model.", source: "Fusion" },
    cplCsv: { status: hasComponents ? "Generated In App" : "Conceptual", notes: "Conceptual placement coordinate CSV list.", source: "Hardware Studio" },
    bomCsv: { status: hasBom ? "Generated In App" : "Conceptual", notes: "Bill of materials parts procurement CSV list.", source: "Hardware Studio" },
    dfmReport: { status: "Not Generated", notes: "Requires Design for Manufacturing verification report.", source: "External" },
    dftReport: { status: "Not Generated", notes: "Requires Design for Testability analysis review.", source: "External" },
    firmwareHex: { status: "Not Generated", notes: "Requires compiled Hex/Binary hex code to flash micro.", source: "External" },
    flashingGuide: { status: hasFw ? "Generated In App" : "Not Generated", notes: "MCU firmware flashing guide instructions sheet.", source: "Hardware Studio" }
  };
};

export const generateEditorLayouts = (project: Project): { 
  layouts: NonNullable<Project['editorLayouts']>, 
  connections: EditorConnection[] 
} => {
  const layouts: NonNullable<Project['editorLayouts']> = {
    product: [],
    mechanical: [],
    assembly: [],
    board: [],
    components: [],
    circuits: [],
    nets: [],
    power: [],
    pins: [],
    firmware: [],
    testing: [],
    handoff: []
  };
  const connections: EditorConnection[] = [];

  const architecture = resolveArchitectureProjection(project);
  const nodes = architecture.nodes;
  const edges = architecture.connections;
  const boards = project.boards || [];
  const boardComponents = project.boardComponents || [];
  const circuitBlocks = project.circuitBlocks || [];
  const nets = project.nets || [];
  const powerBudget = project.powerBudget || [];
  const pinMap = project.pinMap || [];
  const validation = resolveValidationAuthority(project);
  const testing = validation.tests;
  const mechanical = resolveMechanicalAuthority(project);

  // 1. PRODUCT ARCHITECTURE LAYOUT
  const categories = ["Input", "Processing", "Power", "Communication", "Wireless", "Feedback", "Mechanical", "Firmware", "Safety", "Manufacturing", "Integration"];
  nodes.forEach((node, idx) => {
    const cat = node.category || "Unresolved";
    const catIdx = categories.indexOf(cat);
    const colIdx = catIdx !== -1 ? catIdx : 1;

    // This generic editor layout is a display projection. Canonical architecture
    // identity and semantics stay in architectureNodes/architectureConnections.
    const x = 50 + colIdx * 150;
    const y = 80 + (idx % 4) * 80;

    layouts.product!.push({
      id: `obj_p_${node.id}`,
      mode: "product",
      sourceType: "node",
      sourceId: node.id,
      label: node.name,
      kind: "block",
      x,
      y,
      width: 120,
      height: 48,
      layer: "Architecture",
      metadata: {
        category: cat,
        status: node.status,
        authoritySource: architecture.source,
      }
    });
  });

  // Map edges to connections
  edges.forEach((connection, idx) => {
    connections.push({
      id: `conn_p_${connection.id || idx}`,
      mode: "product",
      sourceObjectId: `obj_p_${connection.sourceNodeId}`,
      targetObjectId: `obj_p_${connection.targetNodeId}`,
      label: connection.name || "link",
      kind: "signal"
    });
  });

  // Warnings for product layout
  const hasInput = nodes.some((node) => (
    node.category.toLowerCase() === 'input'
    || node.name.toLowerCase().includes('touch')
    || node.name.toLowerCase().includes('button')
  ));
  const hasPowerNode = nodes.some((node) => (
    node.category.toLowerCase() === 'power'
    || node.name.toLowerCase().includes('battery')
    || node.id.toLowerCase().includes('battery')
  ));

  if (!hasInput) {
    layouts.product!.push({
      id: "warning_p_input",
      mode: "product",
      sourceType: "warning",
      label: "WARNING: No User Input subsystem (e.g. Button, Touch) detected.",
      kind: "stamp",
      x: 100,
      y: 400,
      width: 320,
      height: 30,
      layer: "Errors"
    });
  }
  if (!hasPowerNode) {
    layouts.product!.push({
      id: "warning_p_power",
      mode: "product",
      sourceType: "warning",
      label: "WARNING: No Power subsystem (e.g. Battery, LDO) detected.",
      kind: "stamp",
      x: 450,
      y: 400,
      width: 320,
      height: 30,
      layer: "Errors"
    });
  }

  // 2. MECHANICAL LAYOUT PROJECTION
  // This canvas is a view over explicit engineering geometry. It never creates
  // product-specific demo geometry or substitutes UI coordinates for CAD truth.
  const mechanicalDisplayScale = 4;
  mechanical.objects.forEach((object) => {
    const widthMm = object.shape === 'circle'
      ? (object.radiusMm || 0) * 2
      : object.widthMm || 0;
    const heightMm = object.shape === 'circle'
      ? (object.radiusMm || 0) * 2
      : object.heightMm || 0;

    layouts.mechanical!.push({
      id: `obj_m_${object.id}`,
      mode: "mechanical",
      sourceType: "mechanical-zone",
      sourceId: object.id,
      label: object.name,
      kind: object.shape === 'circle' ? "circular-zone" : "rectangular-zone",
      x: 80 + object.xMm * mechanicalDisplayScale,
      y: 60 + object.yMm * mechanicalDisplayScale,
      width: Math.max(24, widthMm * mechanicalDisplayScale),
      height: Math.max(24, heightMm * mechanicalDisplayScale),
      rotation: object.rotationDeg,
      layer: object.layer || "Mechanical",
      locked: object.locked,
      visible: object.visible,
      metadata: {
        authoritySource: "canonical",
        engineeringType: object.type,
        displayProjectionOnly: true,
      }
    });
  });

  mechanical.dimensions.forEach((dimension) => {
    const midpointX = (dimension.from.xMm + dimension.to.xMm) / 2;
    const midpointY = (dimension.from.yMm + dimension.to.yMm) / 2;
    layouts.mechanical!.push({
      id: `obj_m_dim_${dimension.id}`,
      mode: "mechanical",
      sourceType: "dimension",
      sourceId: dimension.id,
      label: `${dimension.name}: ${dimension.valueMm} mm`,
      kind: "label",
      x: 80 + midpointX * mechanicalDisplayScale,
      y: 60 + midpointY * mechanicalDisplayScale,
      width: 120,
      height: 24,
      layer: "Dimensions",
      metadata: {
        authoritySource: "canonical",
        valueMm: dimension.valueMm,
        displayProjectionOnly: true,
      }
    });
  });

  // 3. ASSEMBLY LAYOUT PROJECTION
  const assemblyLayers = [...mechanical.assemblyLayers].sort((a, b) => a.order - b.order);
  assemblyLayers.forEach((layer, index) => {
    layouts.assembly!.push({
      id: `obj_a_${layer.id}`,
      mode: "assembly",
      sourceType: "assembly-layer",
      sourceId: layer.id,
      label: `${String(layer.order).padStart(2, '0')}. ${layer.name}`,
      kind: "layer",
      x: 150,
      y: 50 + index * 55,
      width: 350,
      height: 38,
      layer: "Assembly Steps",
      metadata: {
        stepNumber: layer.order,
        material: layer.material,
        method: layer.fasteningMethod,
        authoritySource: "canonical",
      }
    });

    if (index < assemblyLayers.length - 1) {
      connections.push({
        id: `conn_a_${layer.id}_${assemblyLayers[index + 1].id}`,
        mode: "assembly",
        sourceObjectId: `obj_a_${layer.id}`,
        targetObjectId: `obj_a_${assemblyLayers[index + 1].id}`,
        label: "next step",
        kind: "assembly"
      });
    }
  });

  // 4. BOARD LAYOUT
  boards.forEach((b, idx) => {
    const x = 80 + idx * 260;
    const y = 80;
    
    layouts.board!.push({
      id: `obj_b_${b.id}`,
      mode: "board",
      sourceType: "board",
      sourceId: b.id,
      label: b.name,
      kind: "outline",
      x,
      y,
      width: 220,
      height: 120,
      layer: "Board outlines",
      metadata: {
        type: b.boardType,
        substrate: b.substrate || 'FR4',
        layers: b.layerCount || 2,
        dimensions: b.dimensionsMm || ''
      }
    });

    // Add mounting hole visual elements
    layouts.board!.push({
      id: `obj_b_hole_${b.id}_1`,
      mode: "board",
      sourceType: "mechanical-zone",
      label: "Mounting Hole Ø 2.0mm",
      kind: "hole",
      x: x + 15,
      y: y + 15,
      width: 15,
      height: 15,
      layer: "Drills"
    });
    layouts.board!.push({
      id: `obj_b_hole_${b.id}_2`,
      mode: "board",
      sourceType: "mechanical-zone",
      label: "Mounting Hole Ø 2.0mm",
      kind: "hole",
      x: x + 205,
      y: y + 105,
      width: 15,
      height: 15,
      layer: "Drills"
    });
  });

  // 5. COMPONENT PLACEMENT LAYOUT
  if (boards.length > 0) {
    const mainBoard = boards[0];
    layouts.components!.push({
      id: `obj_c_outline_${mainBoard.id}`,
      mode: "components",
      sourceType: "board",
      sourceId: mainBoard.id,
      label: `${mainBoard.name} Edge Bounds`,
      kind: "outline",
      x: 80,
      y: 60,
      width: 440,
      height: 200,
      layer: "PCB Outlines"
    });

    boardComponents.forEach((c, idx) => {
      const placement = resolvePcbPlacement(c);
      // Generic editor layout coordinates are only a display projection. If no
      // engineering placement exists, use deterministic UI coordinates without
      // writing them back into PCB geometry.
      const xVal = placement.placed && placement.xMm !== undefined
        ? placement.xMm
        : 120 + (idx % 5) * 80;
      const yVal = placement.placed && placement.yMm !== undefined
        ? placement.yMm
        : 100 + Math.floor(idx / 5) * 55;

      layouts.components!.push({
        id: `obj_c_${c.id}`,
        mode: "components",
        sourceType: "component",
        sourceId: c.id,
        label: c.referenceDesignator,
        kind: c.componentType,
        x: xVal,
        y: yVal,
        width: c.referenceDesignator.startsWith('U') ? 44 : 24,
        height: c.referenceDesignator.startsWith('U') ? 30 : 16,
        rotation: placement.rotationDeg,
        layer: placement.side === 'Bottom' ? "Bottom SMT" : "Top SMT",
        metadata: {
          partName: c.componentName,
          footprint: c.footprint || c.packageName || 'STD',
          criticality: c.placementCriticality || 'Low'
        }
      });
    });
  }

  // 6. CIRCUIT SCHEMATIC PREP LAYOUT
  circuitBlocks.forEach((cb, idx) => {
    // Generate schematic nodes clustered by circuit block
    const xBase = 50 + (idx % 3) * 220;
    const yBase = 50 + Math.floor(idx / 3) * 160;

    layouts.circuits!.push({
      id: `obj_cb_${cb.id}`,
      mode: "circuits",
      sourceType: "circuit",
      sourceId: cb.id,
      label: cb.name,
      kind: "block",
      x: xBase,
      y: yBase,
      width: 180,
      height: 120,
      layer: "Circuit Modules",
      metadata: {
        circuitType: cb.circuitType,
        designators: cb.referenceDesignators,
        powerNets: cb.powerNets,
        signalNets: cb.signalNets
      }
    });
  });

  // 7. NET LIST ROUTING LAYOUT
  const railYMap: Record<string, number> = {
    "3V3": 40,
    "VBAT": 80,
    "VBUS": 120,
    "GND": 320
  };

  // Draw power rail lines
  Object.entries(railYMap).forEach(([rail, y]) => {
    layouts.nets!.push({
      id: `obj_n_rail_${rail}`,
      mode: "nets",
      sourceType: "annotation",
      label: `${rail} BUS LINE`,
      kind: "bus",
      x: 50,
      y,
      width: 500,
      height: 6,
      layer: "Power Rails"
    });
  });

  nets.forEach((n, idx) => {
    const x = 90 + idx * 75;
    const isGnd = n.netName.toUpperCase() === 'GND' || n.netType === 'Ground';
    const isPwr = n.netType === 'Power';
    
    layouts.nets!.push({
      id: `obj_n_node_${n.id}`,
      mode: "nets",
      sourceType: "net",
      sourceId: n.id,
      label: n.netName,
      kind: "pin",
      x,
      y: 170,
      width: 55,
      height: 32,
      layer: "Signal Nets",
      metadata: {
        voltage: n.voltage,
        type: n.netType,
        source: n.sourceComponent,
        target: n.targetComponent
      }
    });

    // Draw lines to buses or components
    if (isGnd) {
      connections.push({
        id: `conn_n_gnd_${n.id}`,
        mode: "nets",
        sourceObjectId: `obj_n_node_${n.id}`,
        targetObjectId: `obj_n_rail_GND`,
        kind: "ground",
        label: "return"
      });
    } else if (isPwr && railYMap[n.netName.toUpperCase()]) {
      connections.push({
        id: `conn_n_pwr_${n.id}`,
        mode: "nets",
        sourceObjectId: `obj_n_node_${n.id}`,
        targetObjectId: `obj_n_rail_${n.netName.toUpperCase()}`,
        kind: "power",
        label: n.voltage
      });
    }
  });

  // 8. POWER TREE LAYOUT
  layouts.power!.push({
    id: "obj_pw_batt",
    mode: "power",
    sourceType: "power",
    label: `LiPo Battery cell (${project.batteryCapacityMah || 18}mAh)`,
    kind: "source",
    x: 40,
    y: 120,
    width: 100,
    height: 48,
    layer: "Power tree"
  });

  layouts.power!.push({
    id: "obj_pw_charger",
    mode: "power",
    sourceType: "circuit",
    label: "BMS Charger PMIC",
    kind: "regulator",
    x: 180,
    y: 120,
    width: 90,
    height: 44,
    layer: "Power tree"
  });
  connections.push({
    id: "conn_pw_1",
    mode: "power",
    sourceObjectId: "obj_pw_batt",
    targetObjectId: "obj_pw_charger",
    kind: "power"
  });

  layouts.power!.push({
    id: "obj_pw_ldo",
    mode: "power",
    sourceType: "circuit",
    label: "3.3V Regulator LDO",
    kind: "regulator",
    x: 310,
    y: 120,
    width: 90,
    height: 44,
    layer: "Power tree"
  });
  connections.push({
    id: "conn_pw_2",
    mode: "power",
    sourceObjectId: "obj_pw_charger",
    targetObjectId: "obj_pw_ldo",
    kind: "power"
  });

  powerBudget.forEach((p, idx) => {
    const y = 30 + idx * 60;
    layouts.power!.push({
      id: `obj_pw_load_${p.id}`,
      mode: "power",
      sourceType: "power",
      sourceId: p.id,
      label: p.blockName,
      kind: "load",
      x: 450,
      y,
      width: 130,
      height: 40,
      layer: "Load blocks",
      metadata: {
        activeCurrent: `${p.activeCurrentMa}mA`,
        dutyPercent: `${p.dutyCyclePercent}%`
      }
    });

    connections.push({
      id: `conn_pw_load_${p.id}`,
      mode: "power",
      sourceObjectId: "obj_pw_ldo",
      targetObjectId: `obj_pw_load_${p.id}`,
      kind: "power"
    });
  });

  // 9. PIN MAP LAYOUT
  layouts.pins!.push({
    id: "obj_pin_mcu",
    mode: "pins",
    sourceType: "node",
    label: "ESP32 Controller chip",
    kind: "mcu",
    x: 230,
    y: 80,
    width: 140,
    height: 120,
    layer: "MCU"
  });

  pinMap.forEach((p, idx) => {
    const leftSide = idx < Math.ceil(pinMap.length / 2);
    const x = leftSide ? 60 : 410;
    const y = 40 + (idx % 6) * 44;

    layouts.pins!.push({
      id: `obj_pin_item_${p.id}`,
      mode: "pins",
      sourceType: "pin",
      sourceId: p.id,
      label: `${p.mcuPin}: ${p.signalName}`,
      kind: "pin-terminal",
      x,
      y,
      width: 130,
      height: 30,
      layer: "MCU Pinout",
      metadata: {
        direction: p.direction,
        protocol: p.protocol,
        block: p.connectedBlock
      }
    });

    connections.push({
      id: `conn_pin_${p.id}`,
      mode: "pins",
      sourceObjectId: "obj_pin_mcu",
      targetObjectId: `obj_pin_item_${p.id}`,
      kind: "signal"
    });
  });

  // 10. FIRMWARE FLOW LAYOUT
  const defaultStates = [
    { id: "boot", name: "Boot Init", type: "State" },
    { id: "hw_init", name: "Hardware driver Init", type: "Driver" },
    { id: "sleep", name: "Power Sleep Mode", type: "Power" },
    { id: "sensor_poll", name: "Sensor Polling", type: "Driver" },
    { id: "ble_dispatch", name: "BLE communication", type: "BLE" },
    { id: "feedback", name: "Feedback alert engine", type: "State" },
    { id: "fault_handler", name: "Critical Safety trap", type: "Safety" }
  ];

  defaultStates.forEach((state, idx) => {
    layouts.firmware!.push({
      id: `obj_f_state_${state.id}`,
      mode: "firmware",
      sourceType: "firmware",
      label: state.name,
      kind: state.type,
      x: 100 + (idx % 4) * 135,
      y: 60 + Math.floor(idx / 4) * 100,
      width: 100,
      height: 44,
      layer: "Firmware State loops",
      metadata: {
        stateType: state.type
      }
    });

    if (idx < defaultStates.length - 1) {
      connections.push({
        id: `conn_f_${idx}`,
        mode: "firmware",
        sourceObjectId: `obj_f_state_${state.id}`,
        targetObjectId: `obj_f_state_${defaultStates[idx + 1].id}`,
        kind: "firmware"
      });
    }
  });

  // 11. TESTING TIMELINE LAYOUT
  const lanes = ["EVT", "DVT", "PVT", "QA"];
  lanes.forEach((lane, idx) => {
    layouts.testing!.push({
      id: `obj_t_lane_${lane}`,
      mode: "testing",
      sourceType: "annotation",
      label: `${lane} GATE VALIDATION`,
      kind: "lane",
      x: 30 + idx * 140,
      y: 40,
      width: 130,
      height: 360,
      layer: "Timeline swimlanes"
    });
  });

  testing.forEach((t, idx) => {
    const stage = t.stage || t.category || "EVT";
    const normalizedStage = stage === 'Factory QA' ? 'QA' : stage.toUpperCase();
    const colIdx = lanes.indexOf(normalizedStage) !== -1 ? lanes.indexOf(normalizedStage) : 0;

    layouts.testing!.push({
      id: `obj_t_test_${t.id}`,
      mode: "testing",
      sourceType: "test",
      sourceId: t.id,
      label: t.name,
      kind: "card",
      x: 40 + colIdx * 140,
      y: 80 + (idx % 4) * 75,
      width: 110,
      height: 52,
      layer: "Test Cards",
      metadata: {
        status: t.status,
        criteria: t.passCriteria.join('; '),
        authoritySource: t.source
      }
    });
  });

  const localCanMoveToEcad = boards.length > 0 && circuitBlocks.length > 0 && boardComponents.length > 0 && nets.length > 0;
  const localCanMoveToPrototype = localCanMoveToEcad && testing.length > 0;
  const localCanMoveToFactoryHandoff = localCanMoveToPrototype && project.manufacturingChecklist && project.manufacturingChecklist.length > 0 && project.manufacturingChecklist.every(m => m.status === 'Done');

  const handoffGates = [
    { id: "gate_ecad", label: "01. ECAD Pre-Layout Gate", status: localCanMoveToEcad ? "PASSED" : "LOCKED" },
    { id: "gate_proto", label: "02. Prototype Release Gate", status: localCanMoveToPrototype ? "PASSED" : "LOCKED" },
    { id: "gate_factory", label: "03. Factory Handoff Ready Gate", status: localCanMoveToFactoryHandoff ? "PASSED" : "LOCKED" }
  ];

  handoffGates.forEach((gate, idx) => {
    layouts.handoff!.push({
      id: `obj_h_${gate.id}`,
      mode: "handoff",
      sourceType: "checklist",
      label: gate.label,
      kind: "gate-card",
      x: 50 + idx * 180,
      y: 60,
      width: 160,
      height: 80,
      layer: "Readiness Gates",
      metadata: {
        gatingStatus: gate.status
      }
    });
  });

  // Add required factory files status cards in Handoff Layout
  const fFiles = project.factoryFiles || getInitialFactoryFiles();
  Object.entries(fFiles).slice(0, 8).forEach(([key, value], idx) => {
    const x = 50 + (idx % 4) * 135;
    const y = 180 + Math.floor(idx / 4) * 85;

    layouts.handoff!.push({
      id: `obj_h_file_${key}`,
      mode: "handoff",
      sourceType: "factory-file",
      sourceId: key,
      label: `${key.replace(/([A-Z])/g, ' $1')}`,
      kind: "file-card",
      x,
      y,
      width: 120,
      height: 55,
      layer: "Factory Release Pack",
      metadata: {
        fileStatus: value.status,
        sourceCAD: value.source || "KiCad"
      }
    });
  });

  return { layouts, connections };
};

export const autoPlaceComponents = (project: Project): BoardComponent[] => {
  const components = [...(project.boardComponents || [])];

  return components.map((component, idx) => {
    const currentPlacement = resolvePcbPlacement(component);
    if (currentPlacement.locked) return component;

    const ref = component.referenceDesignator.toUpperCase();
    let xMm = 150;
    let yMm = 120;
    let rotationDeg = 0;

    if (ref.startsWith('U1') || ref.startsWith('MCU')) {
      xMm = 220;
      yMm = 110;
    } else if (ref.startsWith('ANT') || component.placementCriticality === 'RF Critical') {
      xMm = 350;
      yMm = 110;
    } else if (ref.startsWith('J') || ref.startsWith('POGO') || ref.startsWith('TP')) {
      xMm = 100 + (idx % 3) * 40;
      yMm = 65;
    } else if (ref.startsWith('U3') || ref.startsWith('U4') || ref.startsWith('Q') || ref.startsWith('D')) {
      xMm = 150;
      yMm = 160;
      rotationDeg = 90;
    } else {
      xMm = 180 + (idx % 6) * 30;
      yMm = 90 + (idx % 2) * 25;
    }

    return applyCanonicalPcbPlacement(component, {
      placed: true,
      xMm,
      yMm,
      rotationDeg,
      side: currentPlacement.side,
      locked: false,
      placementStatus: 'Needs Review',
    });
  });
};

export const autoCreateNetsFromPinMap = (project: Project): NetItem[] => {
  const nets = [...(project.nets || [])];
  const pinMap = project.pinMap || [];

  pinMap.forEach(p => {
    const isGround = p.direction === 'Ground' || p.protocol === 'Ground';
    const isPower = p.direction === 'Power' || p.protocol === 'Power';
    
    const targetNetName = isGround ? "GND" : isPower ? p.voltage || "3V3" : p.signalName.toUpperCase();

    // Check if net already exists
    const exists = nets.some(n => n.netName.toUpperCase() === targetNetName.toUpperCase() && n.sourcePin === p.mcuPin);
    const isRF = p.signalName.toUpperCase().includes('RF') || p.signalName.toUpperCase().includes('ANT');
    if (!exists && p.mcuPin && p.mcuPin !== 'TBD') {
      nets.push({
        id: `net_auto_${Math.random()}_${Date.now()}`,
        netName: targetNetName,
        netType: isGround ? 'Ground' : isPower ? 'Power' : 'Signal',
        voltage: isGround ? '0V' : p.voltage || '3.3V',
        sourceComponent: 'U1',
        sourcePin: p.mcuPin,
        targetComponent: p.connectedBlock || 'TBD',
        targetPin: 'Pin 1',
        protocol: p.protocol || 'GPIO',
        currentEstimate: isPower ? '45mA' : '0.1mA',
        impedanceRequirement: isRF ? '50 ohm microstrip matching' : 'Standard routing tracks',
        notes: `Auto-generated trace net from microcontroller port: ${p.mcuPin} mapping.`
      });
    }
  });

  return nets;
};

export const autoCreatePinMapFromCircuits = (project: Project): PinMapItem[] => {
  const pinMap = [...(project.pinMap || [])];
  const circuits = project.circuitBlocks || [];

  circuits.forEach(c => {
    if (c.circuitType === 'MCU') return;
    
    // Parse signal nets comma-separated
    const nets = (c.signalNets || '').split(',').map(s => s.trim()).filter(Boolean);
    nets.forEach((net, idx) => {
      const exists = pinMap.some(p => p.signalName.toUpperCase() === net.toUpperCase());
      if (!exists) {
        let pin = `GPIO_${1 + idx + Math.floor(Math.random() * 8)}`;
        let protocol: PinMapItem['protocol'] = 'GPIO';
        let direction: PinMapItem['direction'] = 'Bidirectional';

        if (c.circuitType === 'Haptic') {
          protocol = 'PWM';
          direction = 'Output';
          pin = 'GPIO_5';
        } else if (c.circuitType === 'Sensor') {
          protocol = 'I2C';
          pin = idx === 0 ? 'GPIO_1 (SDA)' : 'GPIO_2 (SCL)';
        } else if (c.circuitType === 'RF') {
          protocol = 'GPIO';
          pin = 'RF_ANT';
        }

        pinMap.push({
          id: `pin_auto_${Math.random()}_${Date.now()}`,
          signalName: net,
          connectedBlock: c.name,
          mcuPin: pin,
          direction,
          protocol,
          voltage: '3.3V',
          notes: `Auto-generated pinout port mapping linked to functional ${c.name} schematic.`
        });
      }
    });
  });

  return pinMap;
};

export const autoCreateFirmwareTasksFromHardware = (project: Project): FirmwareTask[] => {
  const tasks = [...(project.firmwareTasks || [])];
  const architecture = resolveArchitectureProjection(project);

  architecture.nodes.forEach((node) => {
    const normalizedName = node.name.toLowerCase();
    const normalizedCategory = node.category.toLowerCase();
    const isInput = normalizedCategory === 'input' || normalizedName.includes('touch');
    const isFeedback = normalizedCategory === 'feedback' || normalizedName.includes('haptic') || normalizedName.includes('led');
    const isRF = node.id.toLowerCase().includes('rf') || node.id.toLowerCase().includes('antenna') || normalizedName.includes('wireless');

    if (isInput) {
      const exists = tasks.some(t => t.name.toLowerCase().includes('input') || t.name.toLowerCase().includes('debounce'));
      if (!exists) {
        tasks.push({
          id: `fw_task_auto_${Math.random()}_${Date.now()}`,
          name: `Input driver polling loop: ${node.name}`,
          type: "Driver",
          linkedBlock: node.id,
          priority: "MVP",
          status: "Not Started",
          description: "Initialize hardware interrupt timers and configure debouncing algorithm for raw signal filters.",
          acceptanceCriteria: "Filters clicks under 35ms. Dispatches input hold event states.",
          notes: "Tied to CPU GPIO ports."
        });
      }
    }

    if (isFeedback) {
      const exists = tasks.some(t => t.name.toLowerCase().includes('feedback') || t.name.toLowerCase().includes('haptic') || t.name.toLowerCase().includes('driver'));
      if (!exists) {
        tasks.push({
          id: `fw_task_auto_${Math.random()}_${Date.now()}`,
          name: `Feedback alert driver: ${node.name}`,
          type: "State",
          linkedBlock: node.id,
          priority: "MVP",
          status: "Not Started",
          description: "Write PWM pulse registers generator to control coin motor vibration levels.",
          acceptanceCriteria: "Generates distinct click, double-click, and long-vibe warning sequences.",
          notes: "Verify flyback diode returns match."
        });
      }
    }

    if (isRF) {
      const exists = tasks.some(t => t.name.toLowerCase().includes('ble') || t.name.toLowerCase().includes('wireless') || t.name.toLowerCase().includes('advertise'));
      if (!exists) {
        tasks.push({
          id: `fw_task_auto_${Math.random()}_${Date.now()}`,
          name: "BLE GATT Service advertising advertise loop",
          type: "BLE",
          linkedBlock: node.id,
          priority: "MVP",
          status: "Not Started",
          description: "Initialize BLE stack, set UUID custom profiles, and publish button event updates.",
          acceptanceCriteria: "Advertising packets broadcast immediately upon wakeup. Low sleep currents.",
          notes: "Configure TX output registers."
        });
      }
    }
  });

  return tasks;
};

export const autoCreateTestsFromHardware = (project: Project): TestStage[] => {
  const tests = [...(project.testing || [])];
  const boards = project.boards || [];
  const power = project.powerBudget || [];

  if (boards.length > 0) {
    const exists = tests.some(t => t.name.toLowerCase().includes('bring-up') || t.name.toLowerCase().includes('power regulation'));
    if (!exists) {
      tests.push({
        id: `test_stage_auto_${Math.random()}_${Date.now()}`,
        name: "Stage 1: Board Power Bring-Up Verification",
        goal: "Confirm LDO steps raw battery voltage down to stable 3.3V digital rail without hot spots.",
        partsNeeded: "Assembled PCB board, digital multimeter, adjustable lab bench power supply, thermal camera.",
        steps: "Apply 3.7V current-limited input to battery pads. Measure voltage output at 3V3 test points. Record heat patterns.",
        passCriteria: "Voltage measures 3.30V +/- 0.05V. Total leakage current under 150uA standby.",
        risks: "Soldering short circuits, thermal meltdown of LDO controller.",
        status: "Not Started",
        notes: "First active board review gate step.",
        category: "EVT",
        linkedBlocks: [boards[0].id]
      });
    }
  }

  if (power.length > 0) {
    const exists = tests.some(t => t.name.toLowerCase().includes('leakage') || t.name.toLowerCase().includes('battery discharge'));
    if (!exists) {
      tests.push({
        id: `test_stage_auto_${Math.random()}_${Date.now()}`,
        name: "Stage 2: Standby Sleep Current Leakage Audit",
        goal: "Prove device reaches low micro-amp sleep states to satisfy standby specs.",
        partsNeeded: "PCB board, current logger micro-ammeter, battery cell.",
        steps: "Flash low power driver code. Measure baseline sleep current draw at V_IN terminal paths.",
        passCriteria: "Total sleep mode current draw measures under 40 uA average.",
        risks: "Floating GPIO pins, high regulator quiescent currents.",
        status: "Not Started",
        notes: "Crucial for wearable rings cells.",
        category: "EVT"
      });
    }
  }

  return tests;
};

export const autoCreateHandoffChecklist = (project: Project): ManufacturingChecklistItem[] => {
  const checklist = [...(project.manufacturingChecklist || [])];
  const boards = project.boards || [];

  const addIfUnique = (itemStr: string, cat: ManufacturingChecklistItem['category'], notes: string) => {
    if (!checklist.some(m => m.item.toLowerCase() === itemStr.toLowerCase())) {
      checklist.push({
        id: `mfg_check_auto_${Math.random()}_${Date.now()}`,
        category: cat,
        item: itemStr,
        status: "Not Started",
        ownerNotes: notes
      });
    }
  };

  addIfUnique("Verify schematic footprints match actual manufacturer supplier part numbers", "Schematic", "Cross reference selected BOM parts on DigiKey.");
  addIfUnique("Run board ERC rules checker and tie all unused logical gate pins explicitly", "Schematic", "Ensure no floating input gates.");
  addIfUnique("Run DRC matching flex PCB fabrication tolerance capabilities (4mil limits)", "PCB Layout", "Flex layout rules clearance.");
  
  if (boards.some(b => b.substrate?.toLowerCase().includes("flex"))) {
    addIfUnique("Audit bend radius keepout voids to shield traces from fatigue fractures", "PCB Layout", "No solder joints within bend line boundaries.");
  }

  addIfUnique("Generate Centroid CPL file coordinate maps for surface-mount SMT pick-and-place", "Assembly", "Verify component origin orientation angles.");
  addIfUnique("Configure SWD debug spring probe needle coordinate mappings to test jig pins", "Testing", "Verify spring pogo pin coordinates align.");
  
  return checklist;
};

export const fixMissingDimensionsWithPlaceholder = (project: Project): BoardItem[] => {
  const boards = [...(project.boards || [])];
  const isRing = project.projectName.toLowerCase().includes("ring") || project.templateName?.toLowerCase().includes("ring");

  boards.forEach(b => {
    if (!b.dimensionsMm || b.dimensionsMm.trim() === "" || b.dimensionsMm.toLowerCase().includes("required") || b.dimensionsMm === "0 x 0") {
      b.dimensionsMm = isRing ? "18.5 x 7.8 x 0.15" : "45.0 x 30.0 x 1.6";
      b.mountingNotes = b.mountingNotes || "Auto-fixed dimensions to default placeholder values.";
    }
  });

  return boards;
};

export const addRequiredFactoryFileChecklist = (project: Project): NonNullable<Project['factoryFiles']> => {
  const current = project.factoryFiles || getInitialFactoryFiles();
  return { ...current };
};
