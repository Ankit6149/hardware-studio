import { Project, ReviewResult } from '../types';

export const runDesignReview = (project: Project): ReviewResult[] => {
  const results: ReviewResult[] = [];

  const nodes = project.nodes || [];
  const edges = project.edges || [];
  const boards = project.boards || [];
  const components = project.boardComponents || [];
  const circuits = project.circuitBlocks || [];
  const nets = project.nets || [];
  const pins = project.pinMap || [];
  const power = project.powerBudget || [];
  const firmware = project.firmwareTasks || [];
  const testing = project.testing || [];
  const checklist = project.manufacturingChecklist || [];
  const factoryFiles = project.factoryFiles || {};
  const mechanicalZones = project.mechanicalZones || [];
  const assemblyLayers = project.assemblyLayers || [];
  const traces = project.traces || [];
  const vias = project.vias || [];
  const rules = project.pcbRules || [];
  const drillHoles = project.drillHoles || [];
  const boardOutlines = project.boardOutlines || [];

  const isRing = project.projectName?.toLowerCase().includes("ring") || project.templateName?.toLowerCase().includes("ring");

  // ----------------------------------------------------
  // 1. ARCHITECTURE CHECKS
  // ----------------------------------------------------
  const hasInput = nodes.some(n => 
    n.data?.category?.toLowerCase() === 'input' || 
    n.data?.name?.toLowerCase().includes('touch') || 
    n.data?.name?.toLowerCase().includes('button')
  );
  if (!hasInput) {
    results.push({
      id: "rev_arch_input",
      category: "Architecture",
      severity: "Warning",
      title: "Missing Primary Input Block",
      description: "Architecture diagrams do not define a primary user interaction node (e.g. touch button, sensor).",
      linkedObjectType: "node",
      linkedObjectId: "architecture",
      suggestedFix: "Add a touch sensor or button block to the input stage.",
      status: "Open",
      autoFixAvailable: true
    });
  }

  const hasPowerNode = nodes.some(n => 
    n.data?.category?.toLowerCase() === 'power' || 
    n.data?.name?.toLowerCase().includes('battery') ||
    n.data?.name?.toLowerCase().includes('charger')
  );
  if (!hasPowerNode) {
    results.push({
      id: "rev_arch_power",
      category: "Architecture",
      severity: "Error",
      title: "No Power Subsystem Mapped",
      description: "No battery, regulator, or charging block detected in the system architecture graph.",
      linkedObjectType: "node",
      linkedObjectId: "architecture",
      suggestedFix: "Add a LiPo battery or PMIC battery charger circuit block.",
      status: "Open",
      autoFixAvailable: true
    });
  }

  const hasFeedback = nodes.some(n => 
    n.data?.category?.toLowerCase() === 'feedback' || 
    n.data?.name?.toLowerCase().includes('haptic') || 
    n.data?.name?.toLowerCase().includes('led')
  );
  if (!hasFeedback) {
    results.push({
      id: "rev_arch_feedback",
      category: "Architecture",
      severity: "Warning",
      title: "Missing Feedback Output Channel",
      description: "No haptic vibration feedback or status LED indicator mapped in the feedback architecture column.",
      linkedObjectType: "node",
      linkedObjectId: "architecture",
      suggestedFix: "Add an LED or haptic motor indicator node.",
      status: "Open",
      autoFixAvailable: true
    });
  }

  if (edges.length === 0 && nodes.length > 0) {
    results.push({
      id: "rev_arch_edges",
      category: "Architecture",
      severity: "Warning",
      title: "Disconnected Architecture Blocks",
      description: "Multiple architecture blocks exist but no signal/power routing connections have been drafted.",
      linkedObjectType: "node",
      linkedObjectId: "architecture",
      suggestedFix: "Connect the power regulator block to the microcontroller block.",
      status: "Open",
      autoFixAvailable: true
    });
  }

  // ----------------------------------------------------
  // 2. MECHANICAL CHECKS
  // ----------------------------------------------------
  if (isRing) {
    const sealZone = mechanicalZones.some(z => z.zoneType.toLowerCase().includes("seal") || z.name.toLowerCase().includes("seal") || z.name.toLowerCase().includes("potting"));
    if (!sealZone) {
      results.push({
        id: "rev_mech_seal",
        category: "Mechanical",
        severity: "Error",
        title: "No Waterproof Seal Zone Drafted",
        description: "Wearable electronic rings require epoxy potting or gasket seal zones to prevent moisture ingress.",
        linkedObjectType: "mechanical-zone",
        linkedObjectId: "enclosure",
        suggestedFix: "Create a waterproof epoxy seal zone in the mechanical layer panel.",
        status: "Open",
        autoFixAvailable: true
      });
    }

    const battPocket = mechanicalZones.some(z => z.name.toLowerCase().includes("battery") || z.zoneType.toLowerCase().includes("battery"));
    if (!battPocket) {
      results.push({
        id: "rev_mech_batt_pocket",
        category: "Mechanical",
        severity: "Error",
        title: "No Battery Casing Pocket",
        description: "Mechanical layout lacks a dedicated battery slot or protective keepout zone.",
        linkedObjectType: "mechanical-zone",
        linkedObjectId: "enclosure",
        suggestedFix: "Configure a battery pouch mechanical zone.",
        status: "Open",
        autoFixAvailable: true
      });
    }

    const antKeepout = mechanicalZones.some(z => z.name.toLowerCase().includes("antenna") || z.zoneType.toLowerCase().includes("keepout"));
    if (!antKeepout) {
      results.push({
        id: "rev_mech_antenna",
        category: "Mechanical",
        severity: "Warning",
        title: "Missing RF Antenna Keepout Zone",
        description: "Radio transmission (BLE) requires clear zone bounds without metal structures around the antenna.",
        linkedObjectType: "mechanical-zone",
        linkedObjectId: "enclosure",
        suggestedFix: "Add a 2.4GHz BLE chip antenna metal keepout zone.",
        status: "Open",
        autoFixAvailable: true
      });
    }
  }

  mechanicalZones.forEach(z => {
    if (!z.material || z.material.toLowerCase().includes("select") || z.material.trim() === "") {
      results.push({
        id: `rev_mech_mat_${z.id}`,
        category: "Mechanical",
        severity: "Warning",
        title: `Material Unconfigured: ${z.name}`,
        description: "Enclosure zone lacks a designated substrate or structure material (e.g. polycarbonate, titanium, resin).",
        linkedObjectType: "mechanical-zone",
        linkedObjectId: z.id,
        suggestedFix: "Assign biocompatible polymer or titanium alloy material in inspector.",
        status: "Open"
      });
    }
    if (!z.dimensionNote || z.dimensionNote.toLowerCase().includes("tbd") || z.dimensionNote.trim() === "") {
      results.push({
        id: `rev_mech_dim_${z.id}`,
        category: "Mechanical",
        severity: "Warning",
        title: `Missing Dimensions: ${z.name}`,
        description: "No physical size dimension notes configured for this mechanical zone.",
        linkedObjectType: "mechanical-zone",
        linkedObjectId: z.id,
        suggestedFix: "Enter a dimension value (e.g., 'Ø 18.5 mm' or '45 x 30 mm') in the inspector.",
        status: "Open",
        autoFixAvailable: true
      });
    }
  });

  // ----------------------------------------------------
  // 3. ASSEMBLY CHECKS
  // ----------------------------------------------------
  if (assemblyLayers.length === 0) {
    results.push({
      id: "rev_assembly_empty",
      category: "Assembly",
      severity: "Warning",
      title: "Assembly Stack is Empty",
      description: "No exploded assembly structure layer sequence has been defined for the builder flow.",
      linkedObjectType: "assembly-layer",
      linkedObjectId: "assembly",
      suggestedFix: "Initialize the default assembly stack layers template.",
      status: "Open",
      autoFixAvailable: true
    });
  } else {
    const hasFastening = assemblyLayers.some(l => l.fasteningMethod && l.fasteningMethod.trim() !== "" && l.fasteningMethod !== "TBD");
    if (!hasFastening) {
      results.push({
        id: "rev_assembly_fasten",
        category: "Assembly",
        severity: "Warning",
        title: "Missing Fastening Methods",
        description: "Assembly stack layers do not configure structural fasten methods (screws, adhesives, ultrasonic welds).",
        linkedObjectType: "assembly-layer",
        linkedObjectId: "assembly",
        suggestedFix: "Set fastening method to biocompatible cyanoacrylate or heat staking.",
        status: "Open"
      });
    }
    const hasQaStep = assemblyLayers.some(l => l.layerType?.toLowerCase() === 'inspection' || l.name.toLowerCase().includes("qa") || l.name.toLowerCase().includes("test"));
    if (!hasQaStep) {
      results.push({
        id: "rev_assembly_qa",
        category: "Assembly",
        severity: "Warning",
        title: "No In-Circuit QA Checkpoint",
        description: "Manufacturing sequence lacks a clear post-soldering electrical QA diagnostic checkpoint.",
        linkedObjectType: "assembly-layer",
        linkedObjectId: "assembly",
        suggestedFix: "Add a factory programming and pogo probe jig checkpoint stage.",
        status: "Open",
        autoFixAvailable: true
      });
    }
  }

  // ----------------------------------------------------
  // 4. SCHEMATIC ERC CHECKS
  // ----------------------------------------------------
  // Check for duplicate reference designators
  const refdesMap: Record<string, number> = {};
  components.forEach(c => {
    if (c.referenceDesignator) {
      refdesMap[c.referenceDesignator] = (refdesMap[c.referenceDesignator] || 0) + 1;
    }
  });
  Object.entries(refdesMap).forEach(([ref, count]) => {
    if (count > 1) {
      results.push({
        id: `rev_erc_dup_${ref}`,
        category: "Schematic ERC",
        severity: "Error",
        title: `Duplicate Reference Designator [${ref}]`,
        description: `Reference designator '${ref}' is assigned to ${count} component placement footprints.`,
        linkedObjectType: "component",
        linkedObjectId: ref,
        suggestedFix: "Renumber designator tags uniquely.",
        status: "Open"
      });
    }
  });

  // Check Ground Net returns
  const hasGndNet = nets.some(n => n.netName.toUpperCase() === 'GND' || n.netType === 'Ground');
  if (!hasGndNet) {
    results.push({
      id: "rev_erc_gnd",
      category: "Schematic ERC",
      severity: "Error",
      title: "Missing System Ground (GND) Net",
      description: "No ground reference return net exists. High frequency signals require solid GND reference bounds.",
      linkedObjectType: "net",
      linkedObjectId: "nets",
      suggestedFix: "Create a common GND net return path.",
      status: "Open",
      autoFixAvailable: true
    });
  }

  // Check I2C pullups
  const hasI2C = nets.some(n => n.netName.toUpperCase().includes("SDA") || n.netName.toUpperCase().includes("SCL"));
  if (hasI2C) {
    const hasPullups = components.some(c => 
      c.componentType?.toLowerCase() === 'resistor' && 
      (c.notes?.toLowerCase().includes("pullup") || c.notes?.toLowerCase().includes("pull-up") || c.value === "4.7k" || c.value === "10k")
    );
    if (!hasPullups) {
      results.push({
        id: "rev_erc_i2c_pullups",
        category: "Schematic ERC",
        severity: "Warning",
        title: "I2C Interface Missing Pull-Ups",
        description: "Open-drain communication lines (SDA/SCL) require pull-up resistors (typical 4.7kΩ) to VCC.",
        linkedObjectType: "net",
        linkedObjectId: "i2c",
        suggestedFix: "Place 4.7kΩ pull-up resistors connected to 3.3V rail.",
        status: "Open",
        autoFixAvailable: true
      });
    }
  }

  // Check LEDs current limiter
  const hasLeds = components.some(c => c.componentType?.toLowerCase() === 'led' || c.referenceDesignator.toUpperCase().startsWith("D_LED") || c.referenceDesignator.toUpperCase().startsWith("LED"));
  if (hasLeds) {
    const hasResistors = components.some(c => 
      c.componentType?.toLowerCase() === 'resistor' && 
      (c.notes?.toLowerCase().includes("limiter") || c.notes?.toLowerCase().includes("led") || c.value === "220" || c.value === "330" || c.value === "1k")
    );
    if (!hasResistors) {
      results.push({
        id: "rev_erc_led_resistor",
        category: "Schematic ERC",
        severity: "Warning",
        title: "LED Missing Current-Limiting Resistor",
        description: "Direct connection of status LEDs to IO pins or power rails without current limit resistors will damage the LED.",
        linkedObjectType: "component",
        linkedObjectId: "led",
        suggestedFix: "Place a 330Ω series current-limiting resistor.",
        status: "Open",
        autoFixAvailable: true
      });
    }
  }

  // Check motor protection flyback
  const hasMotor = components.some(c => 
    c.componentType?.toLowerCase() === 'motor' || 
    c.componentName?.toLowerCase().includes("motor") || 
    c.componentName?.toLowerCase().includes("haptic")
  );
  if (hasMotor) {
    const hasDiode = components.some(c => 
      c.componentType?.toLowerCase() === 'diode' && 
      (c.notes?.toLowerCase().includes("flyback") || c.notes?.toLowerCase().includes("clamp") || c.notes?.toLowerCase().includes("motor"))
    );
    if (!hasDiode) {
      results.push({
        id: "rev_erc_motor_protection",
        category: "Schematic ERC",
        severity: "Warning",
        title: "Haptic Driver Lacks Flyback Protection",
        description: "Inductive motor coils generate voltage spikes at shut-off. A flyback diode is required to protect the driver PMIC.",
        linkedObjectType: "component",
        linkedObjectId: "motor",
        suggestedFix: "Place a Schottky clamping flyback diode in parallel with the motor terminal.",
        status: "Open",
        autoFixAvailable: true
      });
    }
  }

  // MCU missing core connections
  const hasMcu = components.some(c => 
    c.referenceDesignator.toUpperCase().startsWith("U1") || 
    c.componentName?.toLowerCase().includes("esp32") || 
    c.componentName?.toLowerCase().includes("nrf52")
  );
  if (hasMcu) {
    const hasDebug = pins.some(p => p.protocol?.toUpperCase() === 'SWD' || p.protocol?.toUpperCase() === 'UART' || p.signalName?.toLowerCase().includes("debug"));
    if (!hasDebug) {
      results.push({
        id: "rev_erc_mcu_debug",
        category: "Schematic ERC",
        severity: "Warning",
        title: "MCU Debug Ports Unmapped",
        description: "No UART, SWD, or JTAG debug programming lines routed to accessible test pads.",
        linkedObjectType: "pin",
        linkedObjectId: "mcu",
        suggestedFix: "Map SWDIO and SWCLK programming lines to PCB test pads.",
        status: "Open",
        autoFixAvailable: true
      });
    }
  }

  // ----------------------------------------------------
  // 5. PCB DRC CHECKS
  // ----------------------------------------------------
  boards.forEach(board => {
    // Check dimensions
    if (!board.dimensionsMm || board.dimensionsMm.toLowerCase().includes("required") || board.dimensionsMm === "0 x 0") {
      results.push({
        id: `rev_drc_dim_${board.id}`,
        category: "PCB DRC",
        severity: "Error",
        title: `Board Lacks Dimensions: ${board.name}`,
        description: "The PCB substrate outline lacks defined physical height/width dimensions.",
        linkedObjectType: "board",
        linkedObjectId: board.id,
        suggestedFix: "Assign placeholder board sizing (e.g. 50 x 15 mm).",
        status: "Open",
        autoFixAvailable: true
      });
    }

    // Check layer counts
    if (board.layerCount < 2) {
      results.push({
        id: `rev_drc_layers_${board.id}`,
        category: "PCB DRC",
        severity: "Warning",
        title: `Single-layer Board Stack: ${board.name}`,
        description: "Board layer count is set to 1. Complex electronic layouts require at least 2 layers for signal routing cross-overs.",
        linkedObjectType: "board",
        linkedObjectId: board.id,
        suggestedFix: "Increase substrate routing layers count to 2 or 4.",
        status: "Open"
      });
    }
  });

  // Check component placements inside board boundaries
  components.forEach(c => {
    if (c.placementX !== undefined && c.placementY !== undefined) {
      const outOfBounds = c.placementX < 50 || c.placementX > 550 || c.placementY < 40 || c.placementY > 400;
      if (outOfBounds && !c.referenceDesignator.toUpperCase().startsWith("J")) {
        results.push({
          id: `rev_drc_bound_${c.id}`,
          category: "PCB DRC",
          severity: "Error",
          title: `Footprint Outside Board Bounds: ${c.referenceDesignator}`,
          description: `SMT footprint package [${c.referenceDesignator}] coordinates fall outside the physical board outline boundaries.`,
          linkedObjectType: "component",
          linkedObjectId: c.id,
          suggestedFix: "Drag the component inside the green PCB board boundary outline.",
          status: "Open"
        });
      }
    }
  });

  // Check trace widths against rule constraints
  const defaultMinWidthMm = 0.152; // 6mil
  traces.forEach(t => {
    if (t.width !== undefined && t.width < defaultMinWidthMm) {
      results.push({
        id: `rev_drc_trace_${t.id}`,
        category: "PCB DRC",
        severity: "Error",
        title: `Trace Width Violation: ${t.id}`,
        description: `Copper route width (${t.width}mm) is below the minimum DFM clearance threshold (${defaultMinWidthMm}mm / 6mil).`,
        linkedObjectType: "trace",
        linkedObjectId: t.id,
        suggestedFix: "Increase trace segment width to 0.20mm (8mil) in inspector.",
        status: "Open"
      });
    }
  });

  // ----------------------------------------------------
  // 6. ROUTING CHECKS
  // ----------------------------------------------------
  const routedNets = new Set(traces.map(t => t.netId).filter(Boolean));
  nets.forEach(n => {
    if (!routedNets.has(n.id)) {
      results.push({
        id: `rev_route_unrouted_${n.id}`,
        category: "Routing",
        severity: "Warning",
        title: `Unrouted Net Connection: ${n.netName}`,
        description: `Signal net [${n.netName}] connecting ${n.sourceComponent} to ${n.targetComponent} is unrouted on the board.`,
        linkedObjectType: "net",
        linkedObjectId: n.id,
        suggestedFix: "Draw a copper connection path trace or click auto-route simple nets.",
        status: "Open",
        autoFixAvailable: true
      });
    }
  });

  // ----------------------------------------------------
  // 7. BOM CHECKS
  // ----------------------------------------------------
  components.forEach(c => {
    if (!c.footprint || c.footprint.trim() === "" || c.footprint.toLowerCase().includes("select")) {
      results.push({
        id: `rev_bom_footprint_${c.id}`,
        category: "BOM",
        severity: "Error",
        title: `Missing Footprint: ${c.referenceDesignator}`,
        description: `Physical package footprint is not defined for component [${c.referenceDesignator}].`,
        linkedObjectType: "component",
        linkedObjectId: c.id,
        suggestedFix: "Assign SMT package preset footprint (e.g. C_0603, QFN_32) in panel.",
        status: "Open",
        autoFixAvailable: true
      });
    }
    if (!c.partNumber || c.partNumber.trim() === "" || c.partNumber.toLowerCase().includes("required") || c.partNumber.toLowerCase().includes("tbd")) {
      results.push({
        id: `rev_bom_part_${c.id}`,
        category: "BOM",
        severity: "Warning",
        title: `Unresolved Manufacturer Part Number: ${c.referenceDesignator}`,
        description: `Component [${c.referenceDesignator}] lacks a valid distributor SKU or manufacturer part number.`,
        linkedObjectType: "component",
        linkedObjectId: c.id,
        suggestedFix: "Enter ordering part number (e.g., GRM188R71E104KA01D) in the inspector.",
        status: "Open"
      });
    }
  });

  // ----------------------------------------------------
  // 8. POWER CHECKS
  // ----------------------------------------------------
  const capacity = project.batteryCapacityMah || 0;
  if (capacity <= 0) {
    results.push({
      id: "rev_pwr_capacity",
      category: "Power Budget",
      severity: "Warning",
      title: "Battery Capacity Configured at Zero",
      description: "Battery cell capacity (batteryCapacityMah) is zero or unconfigured. Wearable runtime estimates cannot compile.",
      linkedObjectType: "power",
      linkedObjectId: "power",
      suggestedFix: "Configure battery cell capacity to a non-zero value (e.g. 18mAh).",
      status: "Open"
    });
  }

  // ----------------------------------------------------
  // 9. FIRMWARE CHECKS
  // ----------------------------------------------------
  if (firmware.length === 0) {
    results.push({
      id: "rev_fw_empty",
      category: "Firmware Plan",
      severity: "Warning",
      title: "Firmware Task Tree is Empty",
      description: "No microcontroller driver code routines or event loop handlers have been configured.",
      linkedObjectType: "firmware",
      linkedObjectId: "firmware",
      suggestedFix: "Populate firmware task skeleton tree from peripherals map.",
      status: "Open",
      autoFixAvailable: true
    });
  } else {
    firmware.forEach(t => {
      if (t.status === 'Blocked') {
        results.push({
          id: `rev_fw_blocked_${t.id}`,
          category: "Firmware Plan",
          severity: "Warning",
          title: `Firmware Task Blocked: ${t.name}`,
          description: `Firmware execution driver [${t.name}] is currently blocked by pending hardware bring-up dependencies.`,
          linkedObjectType: "firmware",
          linkedObjectId: t.id,
          suggestedFix: "Resolve related hardware dependencies in bring-up tests.",
          status: "Open"
        });
      }
    });
  }

  // ----------------------------------------------------
  // 10. TESTING CHECKS
  // ----------------------------------------------------
  if (testing.length === 0) {
    results.push({
      id: "rev_test_empty",
      category: "Testing Plan",
      severity: "Warning",
      title: "No Test Protocols Defined",
      description: "The project lacks formal validation protocols for EVT board bring-up or DVT wearable fit-checks.",
      linkedObjectType: "test",
      linkedObjectId: "testing",
      suggestedFix: "Populate verification test plan stages.",
      status: "Open",
      autoFixAvailable: true
    });
  }

  // ----------------------------------------------------
  // 11. MANUFACTURING CHECKLIST
  // ----------------------------------------------------
  const pendingChecklist = checklist.filter(c => c.status !== 'Done');
  if (pendingChecklist.length > 0) {
    results.push({
      id: "rev_checklist_pending",
      category: "Manufacturing Checklist",
      severity: "Warning",
      title: `Pending DFM Checklist Items (${pendingChecklist.length})`,
      description: "Multiple design for manufacturing assembly gates have not yet been marked completed.",
      linkedObjectType: "checklist",
      linkedObjectId: "checklist",
      suggestedFix: "Audit the manufacturing checklist steps and mark completed.",
      status: "Open"
    });
  }

  // ----------------------------------------------------
  // 12. FACTORY FILES PACKAGE
  // ----------------------------------------------------
  const fileKeys = ["gerberZip", "drillFiles", "cplCsv", "bomCsv"];
  fileKeys.forEach(key => {
    const fStatus = factoryFiles[key as keyof typeof factoryFiles];
    if (!fStatus || fStatus.status === 'Not Generated') {
      results.push({
        id: `rev_factory_missing_${key}`,
        category: "Factory Package",
        severity: "Blocker",
        title: `Missing Fabrication Release File: ${key.replace(/([A-Z])/g, ' $1')}`,
        description: `Fabrication file ${key} is not generated or uploaded. Enclosure cannot print and boards cannot mill.`,
        linkedObjectType: "factory-file",
        linkedObjectId: key,
        suggestedFix: "Generate fabrication package drafts in Export Center or upload external archives.",
        status: "Open",
        autoFixAvailable: true
      });
    } else if (fStatus.status === 'Generated In App' || fStatus.status === 'Needs Final Review') {
      results.push({
        id: `rev_factory_review_${key}`,
        category: "Factory Package",
        severity: "Warning",
        title: `Review Required: ${key.replace(/([A-Z])/g, ' $1')}`,
        description: "Generated draft files require manual fabrication checks and verified status toggle.",
        linkedObjectType: "factory-file",
        linkedObjectId: key,
        suggestedFix: "Inspect files and mark status as verified in the inspector.",
        status: "Open"
      });
    }
  });

  // Schematic Power Net Check
  const hasPowerNet = nets.some(n => n.netName.toUpperCase().includes("VCC") || n.netName.toUpperCase().includes("VDD") || n.netName.toUpperCase().includes("3V3") || n.netName.toUpperCase().includes("VBAT") || n.netType === 'Power');
  if (!hasPowerNet) {
    results.push({
      id: "rev_erc_power_net",
      category: "Schematic ERC",
      severity: "Error",
      title: "Missing Primary Power Net",
      description: "No dedicated power rail (VCC, VDD, 3V3, or VBAT) is defined in the project nets.",
      linkedObjectType: "net",
      linkedObjectId: "nets",
      suggestedFix: "Define a 3.3V or battery voltage net connected to the active PMIC/MCU pins.",
      status: "Open"
    });
  }

  // RF Net Impedance checks
  nets.forEach(n => {
    if ((n.netType === 'RF' || n.netName.toUpperCase().includes("RF") || n.netName.toUpperCase().includes("ANT")) && 
        (!n.impedanceRequirement || n.impedanceRequirement.trim() === "" || n.impedanceRequirement.toLowerCase().includes("tbd"))) {
      results.push({
        id: `rev_erc_rf_imp_${n.id}`,
        category: "Schematic ERC",
        severity: "Warning",
        title: `RF Net Missing Impedance Spec: ${n.netName}`,
        description: `High-frequency RF net [${n.netName}] requires controlled transmission line impedance (typically 50Ω).`,
        linkedObjectType: "net",
        linkedObjectId: n.id,
        suggestedFix: "Specify '50 Ohm microstrip controlled impedance' in net rules.",
        status: "Open"
      });
    }
  });

  // Charger PMIC input reverse protection check
  const hasCharger = circuits.some(c => c.circuitType === 'Charger' || c.name.toLowerCase().includes("charger") || c.name.toLowerCase().includes("pmic"));
  if (hasCharger) {
    const hasFuseOrDiode = components.some(c => 
      c.componentType?.toLowerCase() === 'diode' || 
      c.componentType?.toLowerCase() === 'fuse' ||
      (c.notes && (c.notes.toLowerCase().includes("protect") || c.notes.toLowerCase().includes("reverse")))
    );
    if (!hasFuseOrDiode) {
      results.push({
        id: "rev_erc_charger_protection",
        category: "Schematic ERC",
        severity: "Warning",
        title: "Charger PMIC Lacks Input Protection",
        description: "USB charger inputs lack transient TVS diodes or reverse polarity protection components.",
        linkedObjectType: "circuit",
        linkedObjectId: "charger",
        suggestedFix: "Place a TVS diode on the VBUS pin of the USB connector.",
        status: "Open"
      });
    }
  }

  // Circuit blocks missing required components check
  circuits.forEach(cb => {
    const blockComps = components.filter(c => c.circuitBlockId === cb.id);
    if (blockComps.length === 0) {
      results.push({
        id: `rev_erc_block_empty_${cb.id}`,
        category: "Schematic ERC",
        severity: "Warning",
        title: `Empty Circuit Block: ${cb.name}`,
        description: `Circuit block [${cb.name}] is mapped but has 0 associated BOM component footprints assigned.`,
        linkedObjectType: "circuit",
        linkedObjectId: cb.id,
        suggestedFix: "Assign components to this circuit block using references designators list.",
        status: "Open"
      });
    }
  });

  // Board outlines exists check
  if (boardOutlines.length === 0) {
    results.push({
      id: "rev_drc_outline_missing",
      category: "PCB DRC",
      severity: "Error",
      title: "Missing Board Outline Geometry",
      description: "No physical layout contour shape boardOutlines are defined for fabrication routing.",
      linkedObjectType: "board",
      linkedObjectId: "outline",
      suggestedFix: "Define circular concentric or rectangular board bounds in the outline model.",
      status: "Open"
    });
  }

  // Component placements missing XY / unknown side check
  components.forEach(c => {
    if (c.placementX === undefined || c.placementY === undefined || c.placementX === 0 || c.placementY === 0) {
      results.push({
        id: `rev_drc_placement_missing_${c.id}`,
        category: "PCB DRC",
        severity: "Error",
        title: `Component Not Placed: ${c.referenceDesignator}`,
        description: `SMT component [${c.referenceDesignator}] is defined in the BOM but lacks physical board coordinates.`,
        linkedObjectType: "component",
        linkedObjectId: c.id,
        suggestedFix: "Open the Blueprint Editor to drag/place the footprint or click Auto-place.",
        status: "Open",
        autoFixAvailable: true
      });
    }
    if (!c.side || c.side === 'Unknown') {
      results.push({
        id: `rev_drc_side_unknown_${c.id}`,
        category: "PCB DRC",
        severity: "Warning",
        title: `Unknown Solder Side: ${c.referenceDesignator}`,
        description: `Mounting side is not designated ('Top' or 'Bottom') for component [${c.referenceDesignator}].`,
        linkedObjectType: "component",
        linkedObjectId: c.id,
        suggestedFix: "Select Top or Bottom layer placement side in Properties Inspector.",
        status: "Open"
      });
    }
  });

  // Component overlapping check (using 15px proximity threshold)
  for (let i = 0; i < components.length; i++) {
    for (let j = i + 1; j < components.length; j++) {
      const c1 = components[i];
      const c2 = components[j];
      if (c1.placementX !== undefined && c1.placementY !== undefined && 
          c2.placementX !== undefined && c2.placementY !== undefined &&
          c1.placementX !== 0 && c1.placementY !== 0 &&
          c2.placementX !== 0 && c2.placementY !== 0) {
        const dx = c1.placementX - c2.placementX;
        const dy = c1.placementY - c2.placementY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 15) {
          results.push({
            id: `rev_drc_overlap_${c1.id}_${c2.id}`,
            category: "PCB DRC",
            severity: "Error",
            title: `Component Collision: ${c1.referenceDesignator} & ${c2.referenceDesignator}`,
            description: `Layout collision detected. Footprints of ${c1.referenceDesignator} and ${c2.referenceDesignator} are overlapping.`,
            linkedObjectType: "component",
            linkedObjectId: c1.id,
            suggestedFix: "Reposition components on the canvas to maintain spacing clearance.",
            status: "Open"
          });
        }
      }
    }
  }

  // Trace / Via / Drill out of bounds checks
  traces.forEach(t => {
    if (t.points) {
      t.points.forEach((pt, idx) => {
        if (pt.x < 40 || pt.x > 760 || pt.y < 40 || pt.y > 560) {
          results.push({
            id: `rev_drc_trace_oob_${t.id}_${idx}`,
            category: "PCB DRC",
            severity: "Error",
            title: `Trace Segment Out of Bounds: ${t.id}`,
            description: `Routing segment index ${idx} falls outside the maximum outline grid safety zones.`,
            linkedObjectType: "trace",
            linkedObjectId: t.id,
            suggestedFix: "Reroute trace segments inside board outlines.",
            status: "Open"
          });
        }
      });
    }
  });

  vias.forEach(v => {
    if (v.x !== undefined && v.y !== undefined) {
      if (v.x < 40 || v.x > 760 || v.y < 40 || v.y > 560) {
        results.push({
          id: `rev_drc_via_oob_${v.id}`,
          category: "PCB DRC",
          severity: "Error",
          title: `Via Out of Bounds: ${v.id}`,
          description: `Plated via at (${v.x}, ${v.y}) falls outside the layout substrate bounds.`,
          linkedObjectType: "via",
          linkedObjectId: v.id,
          suggestedFix: "Shift via pad into board contour bounds.",
          status: "Open"
        });
      }
    }
  });

  drillHoles.forEach(dh => {
    if (dh.x !== undefined && dh.y !== undefined) {
      if (dh.x < 40 || dh.x > 760 || dh.y < 40 || dh.y > 560) {
        results.push({
          id: `rev_drc_drill_oob_${dh.id}`,
          category: "PCB DRC",
          severity: "Error",
          title: `Drill Hole Out of Bounds: ${dh.id}`,
          description: `Drill hole at (${dh.x}, ${dh.y}) falls outside the substrate bounds.`,
          linkedObjectType: "drill-hole",
          linkedObjectId: dh.id,
          suggestedFix: "Reposition drill coordinate within outlines.",
          status: "Open"
        });
      }
    }
  });

  // Power net trace width checks
  traces.forEach(t => {
    const isPowerNet = nets.some(n => n.id === t.netId && (n.netType === 'Power' || n.netName.toUpperCase().includes("VCC") || n.netName.toUpperCase().includes("3V3") || n.netName.toUpperCase().includes("VBAT")));
    if (isPowerNet && t.width !== undefined && t.width < 0.25) {
      results.push({
        id: `rev_drc_power_thin_${t.id}`,
        category: "PCB DRC",
        severity: "Warning",
        title: `Thin Power Net Trace Width: ${t.id}`,
        description: `Power trace width (${t.width}mm) is thin (requires minimum 0.25mm / 10mil for heat dissipation).`,
        linkedObjectType: "trace",
        linkedObjectId: t.id,
        suggestedFix: "Increase power net trace width to 0.3mm in the properties panel.",
        status: "Open"
      });
    }
  });

  // Factory Package Checklist & Verification reviews
  const reviewChecks = project.factoryReviewChecks || {};
  const requiredChecks = [
    "gerber_viewer", "board_dims", "pad_positions", "drill_align", 
    "rotations", "bom_quantities", "cpl_rotations", "dfm_run", "drc_erc", "verified"
  ];
  const allChecked = requiredChecks.every(k => reviewChecks[k] === true);
  
  if (!allChecked) {
    results.push({
      id: "rev_factory_dfm_checklist",
      category: "Factory Package",
      severity: "Warning",
      title: "Design for Manufacturing Checks Incomplete",
      description: "Multiple checkpoints in the Factory Package Builder review checklist have not been signed off.",
      linkedObjectType: "checklist",
      linkedObjectId: "factory-package",
      suggestedFix: "Open Factory Package Builder and sign off all 10 review checkpoints.",
      status: "Open"
    });
  }

  if (project.factoryPackageStatus !== 'Verified') {
    results.push({
      id: "rev_factory_unverified",
      category: "Factory Package",
      severity: "Warning",
      title: "Factory Release Package Unverified",
      description: "The generated manufacturing package is marked Draft or Needs Review. Final release approval is required.",
      linkedObjectType: "checklist",
      linkedObjectId: "factory-package",
      suggestedFix: "Validate fabrication checklist and set package release state to Verified.",
      status: "Open"
    });
  }

  return results;
};
