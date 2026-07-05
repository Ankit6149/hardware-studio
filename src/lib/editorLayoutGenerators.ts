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

export const getInitialFactoryFiles = (): Record<string, FactoryFileStatus> => {
  return {
    gerberZip: { status: "Not Generated", notes: "Requires Gerber RS-274X export from KiCad/Altium", source: "KiCad" },
    drillFiles: { status: "Not Generated", notes: "Requires Excellon NC Drill files from KiCad/Altium", source: "KiCad" },
    schematicPdf: { status: "Not Generated", notes: "Requires Schematic PDF print from KiCad/Altium", source: "KiCad" },
    kicadProject: { status: "Not Generated", notes: "Altium or KiCad layout database source files", source: "KiCad" },
    altiumProject: { status: "Not Generated", notes: "Alternative source database if not KiCad", source: "Altium" },
    easyEdaProject: { status: "Not Generated", notes: "Alternative online ECAD source project", source: "EasyEDA" },
    stepFile: { status: "Not Generated", notes: "STEP physical assembly model of PCB & casing", source: "Fusion" },
    stlFile: { status: "Not Generated", notes: "STL 3D print model of casing outer shell", source: "Fusion" },
    cplCsv: { status: "Conceptual", notes: "Generated in Hardware Studio components placement editor", source: "Hardware Studio" },
    bomCsv: { status: "Conceptual", notes: "Generated in Hardware Studio BOM planner", source: "Hardware Studio" },
    dfmReport: { status: "Not Generated", notes: "Fabrication capability check from fab house", source: "External" },
    dftReport: { status: "Not Generated", notes: "Test probe point physical review report", source: "External" },
    firmwareHex: { status: "Not Generated", notes: "Compiled hex/bin binary to flash MCU", source: "External" },
    flashingGuide: { status: "Not Generated", notes: "Instruction document for flashing & board bring-up", source: "External" }
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

  const nodes = project.nodes || [];
  const edges = project.edges || [];
  const boards = project.boards || [];
  const boardComponents = project.boardComponents || [];
  const circuitBlocks = project.circuitBlocks || [];
  const nets = project.nets || [];
  const powerBudget = project.powerBudget || [];
  const pinMap = project.pinMap || [];
  const testing = project.testing || [];

  const isRing = project.projectName.toLowerCase().includes("ring") || project.templateName?.toLowerCase().includes("ring");

  // 1. PRODUCT ARCHITECTURE LAYOUT
  const categories = ["Input", "Processing", "Power", "Feedback", "Wireless", "Firmware", "Mechanical", "Integration"];
  nodes.filter(n => n.type !== 'boundaryNode').forEach((n, idx) => {
    const cat = n.data?.category || "Processing";
    const catIdx = categories.indexOf(cat);
    const colIdx = catIdx !== -1 ? catIdx : 1;
    
    // Group in columns
    const x = 50 + colIdx * 150;
    const y = 80 + (idx % 4) * 80;

    layouts.product!.push({
      id: `obj_p_${n.id}`,
      mode: "product",
      sourceType: "node",
      sourceId: n.id,
      label: n.data.name,
      kind: "block",
      x,
      y,
      width: 120,
      height: 48,
      layer: "Architecture",
      metadata: {
        category: cat,
        status: n.data.status,
        priority: n.data.priority || "Medium"
      }
    });
  });

  // Map edges to connections
  edges.forEach((e, idx) => {
    connections.push({
      id: `conn_p_${e.id || idx}`,
      mode: "product",
      sourceObjectId: `obj_p_${e.source}`,
      targetObjectId: `obj_p_${e.target}`,
      label: e.label || "link",
      kind: "signal"
    });
  });

  // Warnings for product layout
  const hasInput = nodes.some(n => n.data?.category?.toLowerCase() === 'input' || n.data?.name?.toLowerCase().includes('touch') || n.data?.name?.toLowerCase().includes('button'));
  const hasPowerNode = nodes.some(n => n.data?.category?.toLowerCase() === 'power' || n.id.includes('battery'));

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

  // 2. MECHANICAL LAYOUT
  if (isRing) {
    // Wearable Ring profile
    const ringItems = [
      { id: "outer_shell", name: "Outer Casing Shell", r: 80, stroke: "#0f172a", w: 10 },
      { id: "inner_shell", name: "Inner Sleeve Comfort", r: 60, stroke: "#334155", w: 5 },
      { id: "flex_pcb_arc", name: "Main Flex FPC Zone", r: 66, stroke: "#10b981", w: 2 },
      { id: "battery_pouch", name: "LiPo Battery Pouch", r: 65, stroke: "#f43f5e", w: 4, angle: 180 },
      { id: "haptic_cavity", name: "LRA Haptics Cavity", r: 52, stroke: "#eab308", w: 10, angle: 90 },
      { id: "charging_contacts", name: "Charge Pins Contacts", r: 76, stroke: "#eab308", w: 6, angle: 270 },
      { id: "antenna_keepout", name: "BLE Antenna Keepout", r: 66, stroke: "#6366f1", w: 8, angle: 0 }
    ];
    ringItems.forEach((item) => {
      layouts.mechanical!.push({
        id: `obj_m_${item.id}`,
        mode: "mechanical",
        sourceType: "mechanical-zone",
        label: item.name,
        kind: "circular-zone",
        x: 300,
        y: 200,
        width: item.r * 2,
        height: item.r * 2,
        layer: "Enclosure",
        metadata: {
          widthMm: item.w,
          angleDeg: item.angle || 0
        }
      });
    });
    
    // Dimension labels
    layouts.mechanical!.push({
      id: "obj_m_dim_id",
      mode: "mechanical",
      sourceType: "dimension",
      label: "ID: Ø 18.5 mm",
      kind: "label",
      x: 300,
      y: 135,
      width: 80,
      height: 20,
      layer: "Dimensions"
    });
    layouts.mechanical!.push({
      id: "obj_m_dim_od",
      mode: "mechanical",
      sourceType: "dimension",
      label: "OD: Ø 22.5 mm",
      kind: "label",
      x: 300,
      y: 75,
      width: 80,
      height: 20,
      layer: "Dimensions"
    });
  } else {
    // Rectangular mechanical box
    const mechBox = [
      { id: "outer_casing", name: "Outer Casing Enclosure", x: 100, y: 80, w: 320, h: 200, stroke: "#0f172a" },
      { id: "pcb_envelope", name: "Main PCBA Envelope", x: 120, y: 100, w: 280, h: 160, stroke: "#10b981" },
      { id: "battery_pocket", name: "LiPo Battery Pocket", x: 140, y: 120, w: 80, h: 80, stroke: "#f43f5e" },
      { id: "usb_port", name: "USB Charger Cutout", x: 90, y: 170, w: 20, h: 30, stroke: "#eab308" }
    ];
    mechBox.forEach((item) => {
      layouts.mechanical!.push({
        id: `obj_m_${item.id}`,
        mode: "mechanical",
        sourceType: "mechanical-zone",
        label: item.name,
        kind: "rectangular-zone",
        x: item.x,
        y: item.y,
        width: item.w,
        height: item.h,
        layer: "Enclosure"
      });
    });
  }

  // 3. EXPLODED ASSEMBLY LAYOUT
  const assemblySteps = [
    { id: "outer_casing", label: "01. Outer Protection Enclosure", step: 1, method: "SLA Resin / CNC Metal" },
    { id: "seal_gasket", label: "02. Adhesive Waterproof Gasket", step: 2, method: "UV Cure Adhesive" },
    { id: "pcba_core", label: "03. Main PCBA Core Assembly", step: 3, method: "Reflow Solder" },
    { id: "components_layer", label: "04. Placed SMT Components", step: 4, method: "SMD Solder" },
    { id: "battery_layer", label: "05. Lithium Ion Pouch Cell", step: 5, method: "Contact spring / Tape" },
    { id: "sensor_layer", label: "06. Haptics / Sensor Modules", step: 6, method: "Epoxy potting" },
    { id: "inner_sleeve", label: "07. Biocompatible Comfort Liner", step: 7, method: "Slid-fit Adhesive" },
    { id: "inspection_point", label: "08. Factory QA Test Point", step: 8, method: "Spring Probe Test jig" }
  ];

  assemblySteps.forEach((step, idx) => {
    layouts.assembly!.push({
      id: `obj_a_${step.id}`,
      mode: "assembly",
      sourceType: "assembly-layer",
      label: step.label,
      kind: "layer",
      x: 150,
      y: 50 + idx * 55,
      width: 350,
      height: 38,
      layer: "Assembly Steps",
      metadata: {
        stepNumber: step.step,
        method: step.method
      }
    });

    if (idx < assemblySteps.length - 1) {
      connections.push({
        id: `conn_a_${idx}`,
        mode: "assembly",
        sourceObjectId: `obj_a_${step.id}`,
        targetObjectId: `obj_a_${assemblySteps[idx + 1].id}`,
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
        substrate: b.substrate,
        layers: b.layerCount,
        dimensions: b.dimensionsMm
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
      // Deterministic auto-placement fallback positions if not already set
      const xVal = c.placementX || (120 + (idx % 5) * 80);
      const yVal = c.placementY || (100 + Math.floor(idx / 5) * 55);

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
        rotation: c.rotationDeg || 0,
        layer: c.side === 'Bottom' ? "Bottom SMT" : "Top SMT",
        metadata: {
          partName: c.componentName,
          footprint: c.footprint || c.packageName,
          criticality: c.placementCriticality
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
    const stage = t.category || "EVT";
    const colIdx = lanes.indexOf(stage.toUpperCase()) !== -1 ? lanes.indexOf(stage.toUpperCase()) : 0;

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
        criteria: t.passCriteria
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
  
  components.forEach((c, idx) => {
    if (c.lockedPlacement) return;

    const ref = c.referenceDesignator.toUpperCase();
    let x = 150;
    let y = 120;
    let rot = 0;

    if (ref.startsWith('U1') || ref.startsWith('MCU')) {
      // Processor center
      x = 220;
      y = 110;
    } else if (ref.startsWith('ANT') || c.placementCriticality === 'RF Critical') {
      // Antenna edge
      x = 350;
      y = 110;
    } else if (ref.startsWith('J') || ref.startsWith('POGO') || ref.startsWith('TP')) {
      // Connectors/pads edge
      x = 100 + (idx % 3) * 40;
      y = 65;
    } else if (ref.startsWith('U3') || ref.startsWith('U4') || ref.startsWith('Q') || ref.startsWith('D')) {
      // Power / charger near battery pogo
      x = 150;
      y = 160;
      rot = 90;
    } else {
      // Passives scatter near center
      x = 180 + (idx % 6) * 30;
      y = 90 + (idx % 2) * 25;
    }

    c.placementX = x;
    c.placementY = y;
    c.rotationDeg = rot;
  });

  return components;
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
  const nodes = project.nodes || [];

  nodes.filter(n => n.type !== 'boundaryNode').forEach(n => {
    const isInput = n.data?.category?.toLowerCase() === 'input' || n.data?.name?.toLowerCase().includes('touch');
    const isFeedback = n.data?.category?.toLowerCase() === 'feedback' || n.data?.name?.toLowerCase().includes('haptic') || n.data?.name?.toLowerCase().includes('led');
    const isRF = n.id.includes('rf') || n.id.includes('antenna') || n.data?.name?.toLowerCase().includes('wireless');

    if (isInput) {
      const exists = tasks.some(t => t.name.toLowerCase().includes('input') || t.name.toLowerCase().includes('debounce'));
      if (!exists) {
        tasks.push({
          id: `fw_task_auto_${Math.random()}_${Date.now()}`,
          name: `Input driver polling loop: ${n.data.name}`,
          type: "Driver",
          linkedBlock: n.id,
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
          name: `Feedback alert driver: ${n.data.name}`,
          type: "State",
          linkedBlock: n.id,
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
          linkedBlock: n.id,
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
  
  if (boards.some(b => b.substrate.toLowerCase().includes("flex"))) {
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
