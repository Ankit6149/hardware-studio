import { Project } from '../../types';

export const arduinoUnoTemplate: Project = {
  id: 'proj_arduino_uno_system',
  projectName: 'Arduino Uno R3 Microcontroller Workstation',
  description: 'Production-ready Arduino Uno R3 development board featuring ATmega328P MCU, 16MHz crystal, USB-UART bridge, dual power rails (5V/3.3V), ICSP header, and standard DIP pin headers.',
  templateName: 'Arduino Uno R3',
  activeBoardId: 'board_arduino_uno',
  createdAt: '2026-08-10T00:00:00.000Z',
  updatedAt: '2026-08-10T00:00:00.000Z',
  version: '1.0',
  activeView: 'board',
  bom: [],
  
  boards: [
    {
      id: 'board_arduino_uno',
      name: 'Arduino Uno R3 Main PCB',
      boardType: 'Main PCB',
      substrate: 'FR4',
      layerCount: 2,
      dimensionsMm: '68.6 x 53.4',
      placement: 'Internal',
      purpose: 'Main microcontroller execution and shield breakout board.',
      status: 'Ready',
      mountingNotes: '4x M3 mounting holes at (14, 2.5), (66, 7.6), (66, 35.5), (15.3, 50.8)',
      connectorNotes: 'USB Type-B connector, 2.1mm DC Barrel Jack, 14-pin digital header, 6-pin analog header, 8-pin power header',
      thermalNotes: '5V LDO linear regulator copper thermal pad pouring on bottom copper layer',
      rfNotes: '16MHz crystal ground guard ring routing'
    }
  ],

  boardOutlines: [
    {
      id: 'outline_uno',
      boardId: 'board_arduino_uno',
      points: [
        { x: 0, y: 0 },
        { x: 68.6, y: 0 },
        { x: 68.6, y: 53.4 },
        { x: 0, y: 53.4 }
      ],
      width: 68.6,
      height: 53.4
    }
  ],

  boardComponents: [
    {
      id: 'cmp_atmega328p',
      boardId: 'board_arduino_uno',
      circuitBlockId: 'block_mcu',
      referenceDesignator: 'U1',
      componentName: 'ATmega328P-PU 8-bit AVR MCU',
      componentType: 'MCU',
      value: 'ATmega328P',
      packageName: 'DIP-28',
      footprint: 'DIP28',
      partNumber: 'ATMEGA328P-PU',
      quantity: 1,
      side: 'Top',
      placementX: 35,
      placementY: 27,
      rotationDeg: 0,
      placementStatus: 'Placed',
      placementCriticality: 'High',
      notes: 'Socketed 28-pin DIP AVR Microcontroller',
      packageDimensions: { widthMm: 35.5, heightMm: 7.6, heightZMm: 4.5 },
      pcb: { placed: true, xMm: 35, yMm: 27, rotationDeg: 0, side: 'Top', locked: false, placementStatus: 'Placed' },
      schematic: { placed: true, x: 280, y: 220, rotation: 0 },
      pins: [
        { id: 'p1_1', componentId: 'cmp_atmega328p', pinNumber: '1', pinName: 'RESET', electricalType: 'Input' },
        { id: 'p1_2', componentId: 'cmp_atmega328p', pinNumber: '2', pinName: 'PD0/RX', electricalType: 'Bidirectional' },
        { id: 'p1_3', componentId: 'cmp_atmega328p', pinNumber: '3', pinName: 'PD1/TX', electricalType: 'Bidirectional' },
        { id: 'p1_7', componentId: 'cmp_atmega328p', pinNumber: '7', pinName: 'VCC', electricalType: 'Power Input' },
        { id: 'p1_8', componentId: 'cmp_atmega328p', pinNumber: '8', pinName: 'GND', electricalType: 'Ground' },
        { id: 'p1_9', componentId: 'cmp_atmega328p', pinNumber: '9', pinName: 'XTAL1', electricalType: 'Clock' },
        { id: 'p1_10', componentId: 'cmp_atmega328p', pinNumber: '10', pinName: 'XTAL2', electricalType: 'Clock' },
        { id: 'p1_22', componentId: 'cmp_atmega328p', pinNumber: '22', pinName: 'GND', electricalType: 'Ground' }
      ]
    },
    {
      id: 'cmp_crystal_16mhz',
      boardId: 'board_arduino_uno',
      circuitBlockId: 'block_mcu',
      referenceDesignator: 'Y1',
      componentName: '16MHz HC-49S Crystal Oscillator',
      componentType: 'Clock',
      value: '16.000MHz',
      packageName: 'HC49S',
      footprint: 'HC49S',
      partNumber: 'HC49S-16.000MHZ',
      quantity: 1,
      side: 'Top',
      placementX: 20,
      placementY: 38,
      rotationDeg: 0,
      placementStatus: 'Placed',
      placementCriticality: 'High',
      notes: '16MHz system clock crystal for ATmega328P',
      packageDimensions: { widthMm: 11.5, heightMm: 5.0, heightZMm: 3.5 },
      pcb: { placed: true, xMm: 20, yMm: 38, rotationDeg: 0, side: 'Top', locked: false, placementStatus: 'Placed' },
      schematic: { placed: true, x: 120, y: 220, rotation: 0 },
      pins: [
        { id: 'py_1', componentId: 'cmp_crystal_16mhz', pinNumber: '1', pinName: 'XTAL1', electricalType: 'Clock' },
        { id: 'py_2', componentId: 'cmp_crystal_16mhz', pinNumber: '2', pinName: 'XTAL2', electricalType: 'Clock' }
      ]
    },
    {
      id: 'cmp_usb_b',
      boardId: 'board_arduino_uno',
      circuitBlockId: 'block_power',
      referenceDesignator: 'J1',
      componentName: 'USB Type-B Through-Hole Connector',
      componentType: 'Connector',
      value: 'USB-B',
      packageName: 'USB_B_TH',
      footprint: 'USB_B',
      partNumber: 'USB-B-TH-RECEPTACLE',
      quantity: 1,
      side: 'Top',
      placementX: 9,
      placementY: 10,
      rotationDeg: 0,
      placementStatus: 'Placed',
      placementCriticality: 'High',
      notes: '5V USB power supply & serial programming port',
      packageDimensions: { widthMm: 12.0, heightMm: 16.0, heightZMm: 11.0 },
      pcb: { placed: true, xMm: 9, yMm: 10, rotationDeg: 0, side: 'Top', locked: false, placementStatus: 'Placed' },
      schematic: { placed: true, x: 100, y: 100, rotation: 0 },
      pins: [
        { id: 'pj1_1', componentId: 'cmp_usb_b', pinNumber: '1', pinName: 'VBUS_5V', electricalType: 'Power Output' },
        { id: 'pj1_2', componentId: 'cmp_usb_b', pinNumber: '2', pinName: 'D-', electricalType: 'Bidirectional' },
        { id: 'pj1_3', componentId: 'cmp_usb_b', pinNumber: '3', pinName: 'D+', electricalType: 'Bidirectional' },
        { id: 'pj1_4', componentId: 'cmp_usb_b', pinNumber: '4', pinName: 'GND', electricalType: 'Ground' }
      ]
    },
    {
      id: 'cmp_ldo_5v',
      boardId: 'board_arduino_uno',
      circuitBlockId: 'block_power',
      referenceDesignator: 'U2',
      componentName: 'NCP1117ST50T3G 5V 1A LDO Regulator',
      componentType: 'Regulator',
      value: '5V 1A',
      packageName: 'SOT-223',
      footprint: 'SOT223',
      partNumber: 'NCP1117ST50T3G',
      quantity: 1,
      side: 'Top',
      placementX: 18,
      placementY: 46,
      rotationDeg: 0,
      placementStatus: 'Placed',
      placementCriticality: 'Medium',
      notes: 'Regulates 7-12V DC barrel input to clean 5V rail',
      packageDimensions: { widthMm: 6.5, heightMm: 3.5, heightZMm: 1.8 },
      pcb: { placed: true, xMm: 18, yMm: 46, rotationDeg: 0, side: 'Top', locked: false, placementStatus: 'Placed' },
      schematic: { placed: true, x: 500, y: 100, rotation: 0 },
      pins: [
        { id: 'pu2_1', componentId: 'cmp_ldo_5v', pinNumber: '1', pinName: 'GND', electricalType: 'Ground' },
        { id: 'pu2_2', componentId: 'cmp_ldo_5v', pinNumber: '2', pinName: 'VOUT_5V', electricalType: 'Power Output' },
        { id: 'pu2_3', componentId: 'cmp_ldo_5v', pinNumber: '3', pinName: 'VIN_DC', electricalType: 'Power Input' }
      ]
    },
    {
      id: 'cmp_header_power',
      boardId: 'board_arduino_uno',
      circuitBlockId: 'block_headers',
      referenceDesignator: 'J2',
      componentName: '8-Pin Power Header (RESET, 3V3, 5V, GND, GND, VIN)',
      componentType: 'Connector',
      value: 'Header 1x8',
      packageName: 'HEADER_1X8',
      footprint: 'HEADER_1X8',
      partNumber: 'PIN-HEADER-2.54MM-1X8',
      quantity: 1,
      side: 'Top',
      placementX: 42,
      placementY: 50.8,
      rotationDeg: 0,
      placementStatus: 'Placed',
      placementCriticality: 'Medium',
      notes: 'Power & reset distribution shield connector',
      packageDimensions: { widthMm: 20.32, heightMm: 2.54, heightZMm: 8.5 },
      pcb: { placed: true, xMm: 42, yMm: 50.8, rotationDeg: 0, side: 'Top', locked: false, placementStatus: 'Placed' },
      schematic: { placed: true, x: 500, y: 350, rotation: 0 },
      pins: [
        { id: 'pj2_1', componentId: 'cmp_header_power', pinNumber: '1', pinName: 'NC', electricalType: 'No Connect' },
        { id: 'pj2_2', componentId: 'cmp_header_power', pinNumber: '2', pinName: 'IOREF', electricalType: 'Power Output' },
        { id: 'pj2_3', componentId: 'cmp_header_power', pinNumber: '3', pinName: 'RESET', electricalType: 'Input' },
        { id: 'pj2_4', componentId: 'cmp_header_power', pinNumber: '4', pinName: '3V3', electricalType: 'Power Output' },
        { id: 'pj2_5', componentId: 'cmp_header_power', pinNumber: '5', pinName: '5V', electricalType: 'Power Output' },
        { id: 'pj2_6', componentId: 'cmp_header_power', pinNumber: '6', pinName: 'GND', electricalType: 'Ground' },
        { id: 'pj2_7', componentId: 'cmp_header_power', pinNumber: '7', pinName: 'GND', electricalType: 'Ground' },
        { id: 'pj2_8', componentId: 'cmp_header_power', pinNumber: '8', pinName: 'VIN', electricalType: 'Power Input' }
      ]
    }
  ],

  nets: [
    { id: 'net_5v', netName: '5V', netType: 'Power', voltage: '5V', sourceComponent: 'U2', sourcePin: '2', targetComponent: 'U1', targetPin: '7', protocol: 'Power', currentEstimate: '500mA', impedanceRequirement: 'Low', notes: '5V main power rail' },
    { id: 'net_gnd', netName: 'GND', netType: 'Ground', voltage: '0V', sourceComponent: 'J1', sourcePin: '4', targetComponent: 'U1', targetPin: '8', protocol: 'Ground', currentEstimate: '500mA', impedanceRequirement: 'Low', notes: 'Ground return plane' },
    { id: 'net_3v3', netName: '3V3', netType: 'Power', voltage: '3.3V', sourceComponent: 'J2', sourcePin: '4', targetComponent: 'J2', targetPin: '4', protocol: 'Power', currentEstimate: '150mA', impedanceRequirement: 'Low', notes: 'Auxiliary 3.3V rail' },
    { id: 'net_reset', netName: 'RESET', netType: 'Signal', voltage: '5V', sourceComponent: 'U1', sourcePin: '1', targetComponent: 'J2', targetPin: '3', protocol: 'Digital', currentEstimate: '1mA', impedanceRequirement: 'Standard', notes: 'MCU Active-Low Reset' },
    { id: 'net_xtal1', netName: 'XTAL1', netType: 'Clock', voltage: '5V', sourceComponent: 'U1', sourcePin: '9', targetComponent: 'Y1', targetPin: '1', protocol: 'Clock', currentEstimate: '5mA', impedanceRequirement: '50 ohm', notes: '16MHz Crystal In' },
    { id: 'net_xtal2', netName: 'XTAL2', netType: 'Clock', voltage: '5V', sourceComponent: 'U1', sourcePin: '10', targetComponent: 'Y1', targetPin: '2', protocol: 'Clock', currentEstimate: '5mA', impedanceRequirement: '50 ohm', notes: '16MHz Crystal Out' }
  ],

  padNetAssignments: [
    { id: 'pna_1', referenceDesignator: 'U1', componentId: 'cmp_atmega328p', padName: '7', netName: '5V' },
    { id: 'pna_2', referenceDesignator: 'U1', componentId: 'cmp_atmega328p', padName: '8', netName: 'GND' },
    { id: 'pna_3', referenceDesignator: 'U1', componentId: 'cmp_atmega328p', padName: '22', netName: 'GND' },
    { id: 'pna_4', referenceDesignator: 'U1', componentId: 'cmp_atmega328p', padName: '1', netName: 'RESET' },
    { id: 'pna_5', referenceDesignator: 'U1', componentId: 'cmp_atmega328p', padName: '9', netName: 'XTAL1' },
    { id: 'pna_6', referenceDesignator: 'U1', componentId: 'cmp_atmega328p', padName: '10', netName: 'XTAL2' },
    { id: 'pna_7', referenceDesignator: 'Y1', componentId: 'cmp_crystal_16mhz', padName: '1', netName: 'XTAL1' },
    { id: 'pna_8', referenceDesignator: 'Y1', componentId: 'cmp_crystal_16mhz', padName: '2', netName: 'XTAL2' },
    { id: 'pna_9', referenceDesignator: 'J1', componentId: 'cmp_usb_b', padName: '1', netName: '5V' },
    { id: 'pna_10', referenceDesignator: 'J1', componentId: 'cmp_usb_b', padName: '4', netName: 'GND' },
    { id: 'pna_11', referenceDesignator: 'U2', componentId: 'cmp_ldo_5v', padName: '2', netName: '5V' },
    { id: 'pna_12', referenceDesignator: 'U2', componentId: 'cmp_ldo_5v', padName: '1', netName: 'GND' },
    { id: 'pna_13', referenceDesignator: 'J2', componentId: 'cmp_header_power', padName: '5', netName: '5V' },
    { id: 'pna_14', referenceDesignator: 'J2', componentId: 'cmp_header_power', padName: '6', netName: 'GND' }
  ],

  traces: [
    {
      id: 'trc_5v_main',
      boardId: 'board_arduino_uno',
      netName: '5V',
      layerId: 'top-copper',
      width: 0.6,
      points: [
        { x: 9, y: 10 },
        { x: 18, y: 10 },
        { x: 18, y: 46 },
        { x: 35, y: 27 }
      ]
    },
    {
      id: 'trc_xtal1',
      boardId: 'board_arduino_uno',
      netName: 'XTAL1',
      layerId: 'top-copper',
      width: 0.25,
      points: [
        { x: 20, y: 38 },
        { x: 28, y: 27 }
      ]
    }
  ],

  nodes: [
    {
      id: 'node_mcu',
      type: 'custom',
      position: { x: 250, y: 150 },
      data: {
        name: 'ATmega328P Microcontroller',
        category: 'Processor',
        description: 'Core 8-bit AVR RISC microcontroller operating at 16MHz clock.',
        purpose: 'Core MCU execution',
        requirements: 'req_2',
        candidateComponents: 'cmp_atmega328p',
        risks: 'None',
        notes: 'ATmega328P DIP28',
        testingNotes: 'Oscilloscope clock check',
        views: ['master', 'electronics'],
        status: 'Complete'
      }
    },
    {
      id: 'node_power',
      type: 'custom',
      position: { x: 50, y: 150 },
      data: {
        name: 'Dual Power Subsystem (5V/3V3)',
        category: 'Power',
        description: 'USB Type-B 5V VBUS and DC Barrel Jack with 5V NCP1117 LDO.',
        purpose: 'Provide regulated power',
        requirements: 'req_1',
        candidateComponents: 'cmp_ldo_5v',
        risks: 'None',
        notes: 'LDO thermal tab',
        testingNotes: '5V rail DMM check',
        views: ['master', 'power'],
        status: 'Complete'
      }
    },
    {
      id: 'node_headers',
      type: 'custom',
      position: { x: 480, y: 150 },
      data: {
        name: 'Arduino Shield Header Breakout',
        category: 'Interface',
        description: 'Standard 0.1" pitch pin headers for digital I/O, analog inputs, and power.',
        purpose: 'External expansion',
        requirements: 'req_1',
        candidateComponents: 'cmp_header_power',
        risks: 'None',
        notes: 'Header pinout',
        testingNotes: 'Continuity check',
        views: ['master', 'electronics'],
        status: 'Complete'
      }
    }
  ],

  edges: [
    { id: 'e1', source: 'node_power', target: 'node_mcu', label: '5V Regulated Power' },
    { id: 'e2', source: 'node_mcu', target: 'node_headers', label: 'GPIO / SPI / I2C / ADC' }
  ],

  circuitBlocks: [
    {
      id: 'block_mcu',
      name: 'ATmega328P Core Block',
      circuitType: 'MCU',
      boardId: 'board_arduino_uno',
      description: 'Microcontroller, crystal oscillator, decoupling capacitors, reset pullup.',
      requiredComponents: 'ATmega328P-PU, 16MHz HC49S Crystal',
      referenceDesignators: 'U1, Y1',
      powerNets: '5V, GND',
      signalNets: 'RESET, XTAL1, XTAL2',
      interfaceType: 'SPI, I2C, UART, GPIO',
      datasheetNotes: 'Standard 16MHz crystal setup.',
      designNotes: 'Decoupling 100nF near VCC pins.',
      risks: 'Low',
      status: 'Complete'
    },
    {
      id: 'block_power',
      name: '5V / 3.3V Power Rail Block',
      circuitType: 'Power',
      boardId: 'board_arduino_uno',
      description: 'USB VBUS supply, LDO regulator, reverse protection diode, bulk capacitors.',
      requiredComponents: 'USB-B Jack, NCP1117-5.0 LDO',
      referenceDesignators: 'J1, U2',
      powerNets: '5V, 3V3, GND',
      signalNets: 'VBUS',
      interfaceType: 'Power Rail',
      datasheetNotes: 'NCP1117 dropout voltage 1.1V.',
      designNotes: 'Includes thermal copper tab.',
      risks: 'Low',
      status: 'Complete'
    }
  ],

  requirements: [
    {
      id: 'req_1',
      title: 'Standard Arduino Shield Mechanical Pinout',
      description: 'The main board dimensions must be 68.6mm x 53.4mm with standard header spacing for Arduino R3 shields.',
      type: 'Mechanical',
      priority: 'High',
      status: 'Approved',
      acceptanceCriteria: ['Fits R3 shield headers', '68.6mm x 53.4mm outline'],
      linkedArchitectureNodeIds: ['node_headers'],
      linkedComponentIds: ['cmp_header_power'],
      linkedFirmwareModuleIds: [],
      linkedTestIds: ['tst_power_check'],
      risks: []
    },
    {
      id: 'req_2',
      title: '16MHz Clock Execution & 5V Logic',
      description: 'The ATmega328P core must run at 16MHz using an external quartz crystal with 5V logic IO levels.',
      type: 'Electrical',
      priority: 'High',
      status: 'Approved',
      acceptanceCriteria: ['16MHz clock sine wave', '5.0V VCC rail'],
      linkedArchitectureNodeIds: ['node_mcu'],
      linkedComponentIds: ['cmp_atmega328p', 'cmp_crystal_16mhz'],
      linkedFirmwareModuleIds: ['fw_init'],
      linkedTestIds: ['tst_clock_check'],
      risks: []
    }
  ],

  pinMap: [
    {
      id: 'pin_d0',
      signalName: 'UART RX',
      connectedBlock: 'block_mcu',
      mcuPin: '2',
      direction: 'Input',
      protocol: 'UART',
      voltage: '5V',
      notes: 'ATmega328P Pin 2 (PD0)'
    }
  ],

  powerBudget: [
    {
      id: 'pwr_mcu',
      blockName: 'ATmega328P Core Block',
      voltage: '5V',
      activeCurrentMa: 20,
      sleepCurrentUa: 50,
      dutyCyclePercent: 100,
      quantity: 1,
      notes: '16MHz execution current consumption'
    },
    {
      id: 'pwr_leds',
      blockName: 'Power Rail Block',
      voltage: '5V',
      activeCurrentMa: 10,
      sleepCurrentUa: 0,
      dutyCyclePercent: 100,
      quantity: 1,
      notes: 'ON & L13 status LEDs'
    }
  ],

  assemblyLayers: [
    { id: 'asm_top_cover', name: 'Acrylic Clear Shield Top', order: 1, layerType: 'Casing', material: 'Acrylic', fasteningMethod: 'Standoff', inspectionNote: 'Visual clear inspection', notes: 'Thickness 3.0mm' },
    { id: 'asm_main_pcb', name: 'Arduino Uno R3 Main FR4 PCB', order: 2, layerType: 'PCB', material: 'FR4', fasteningMethod: 'Screw Thread', inspectionNote: 'Check SMT alignment', notes: 'Thickness 1.6mm' },
    { id: 'asm_bottom_plate', name: 'Insulation Base Plate', order: 3, layerType: 'Casing', material: 'Polycarbonate', fasteningMethod: 'Standoff', inspectionNote: 'Check standoff torque', notes: 'Thickness 2.0mm' }
  ],

  firmwareTasks: [
    { id: 'fw_init', name: 'System Hardware Init & Clock Setup', type: 'Driver', linkedBlock: 'node_mcu', priority: 'MVP', status: 'Done', description: 'Set 16MHz clock prescaler', acceptanceCriteria: 'Registers configured', notes: 'IO direction set' },
    { id: 'fw_serial', name: 'UART Serial Telemetry (115200 baud)', type: 'Driver', linkedBlock: 'node_mcu', priority: 'MVP', status: 'Done', description: 'Configure UBRR0 register', acceptanceCriteria: 'Baud rate set', notes: 'Serial print debug status' }
  ],

  testing: [
    { id: 'tst_power_check', name: '5V & 3.3V Power Rail Verification', goal: 'Verify power rails', partsNeeded: 'DMM', steps: 'Measure headers', passCriteria: '5.0V +/- 0.1V', risks: 'None', status: 'Passed', notes: 'Passed' },
    { id: 'tst_clock_check', name: '16MHz Crystal Oscillator Oscillation Check', goal: 'Verify clock', partsNeeded: 'Oscilloscope', steps: 'Probe XTAL1', passCriteria: '16.0MHz sine wave', risks: 'None', status: 'Passed', notes: 'Passed' }
  ]
};
