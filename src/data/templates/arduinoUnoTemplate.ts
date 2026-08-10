import { Project } from '../../types';

export const arduinoUnoTemplate: Project = {
  id: 'proj_arduino_uno_system',
  projectName: 'Arduino Uno R3 Microcontroller Workstation',
  description: 'Production-ready Arduino Uno R3 development board featuring ATmega328P MCU, 16MHz crystal, USB-UART bridge, dual power rails (5V/3.3V), ICSP header, and standard DIP pin headers.',
  templateName: 'Arduino Uno R3',
  activeBoardId: 'board_arduino_uno',
  
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
      boardId: 'board_arduino_uno',
      points: [
        { x: 0, y: 0 },
        { x: 68.6, y: 0 },
        { x: 68.6, y: 53.4 },
        { x: 0, y: 53.4 }
      ],
      width: 68.6,
      height: 53.4,
      cutouts: []
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
      schematic: { placed: true, x: 280, y: 220, rotationDeg: 0 },
      pins: [
        { pinNumber: '1', pinName: 'RESET', electricalType: 'Input' },
        { pinNumber: '2', pinName: 'PD0/RX', electricalType: 'Bidirectional' },
        { pinNumber: '3', pinName: 'PD1/TX', electricalType: 'Bidirectional' },
        { pinNumber: '4', pinName: 'PD2/INT0', electricalType: 'Bidirectional' },
        { pinNumber: '5', pinName: 'PD3/PWM', electricalType: 'Bidirectional' },
        { pinNumber: '6', pinName: 'PD4', electricalType: 'Bidirectional' },
        { pinNumber: '7', pinName: 'VCC', electricalType: 'Power Input' },
        { pinNumber: '8', pinName: 'GND', electricalType: 'Ground' },
        { pinNumber: '9', pinName: 'PB6/XTAL1', electricalType: 'Clock' },
        { pinNumber: '10', pinName: 'PB7/XTAL2', electricalType: 'Clock' },
        { pinNumber: '11', pinName: 'PD5/PWM', electricalType: 'Bidirectional' },
        { pinNumber: '12', pinName: 'PD6/PWM', electricalType: 'Bidirectional' },
        { pinNumber: '13', pinName: 'PD7', electricalType: 'Bidirectional' },
        { pinNumber: '14', pinName: 'PB0', electricalType: 'Bidirectional' },
        { pinNumber: '15', pinName: 'PB1/PWM', electricalType: 'Bidirectional' },
        { pinNumber: '16', pinName: 'PB2/SS', electricalType: 'Bidirectional' },
        { pinNumber: '17', pinName: 'PB3/MOSI', electricalType: 'Bidirectional' },
        { pinNumber: '18', pinName: 'PB4/MISO', electricalType: 'Bidirectional' },
        { pinNumber: '19', pinName: 'PB5/SCK/LED', electricalType: 'Bidirectional' },
        { pinNumber: '20', pinName: 'AVCC', electricalType: 'Power Input' },
        { pinNumber: '21', pinName: 'AREF', electricalType: 'Analog' },
        { pinNumber: '22', pinName: 'GND', electricalType: 'Ground' },
        { pinNumber: '23', pinName: 'PC0/A0', electricalType: 'Analog' },
        { pinNumber: '24', pinName: 'PC1/A1', electricalType: 'Analog' },
        { pinNumber: '25', pinName: 'PC2/A2', electricalType: 'Analog' },
        { pinNumber: '26', pinName: 'PC3/A3', electricalType: 'Analog' },
        { pinNumber: '27', pinName: 'PC4/A4/SDA', electricalType: 'Analog' },
        { pinNumber: '28', pinName: 'PC5/A5/SCL', electricalType: 'Analog' }
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
      schematic: { placed: true, x: 120, y: 220, rotationDeg: 0 },
      pins: [
        { pinNumber: '1', pinName: 'XTAL1', electricalType: 'Clock' },
        { pinNumber: '2', pinName: 'XTAL2', electricalType: 'Clock' }
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
      schematic: { placed: true, x: 100, y: 100, rotationDeg: 0 },
      pins: [
        { pinNumber: '1', pinName: 'VBUS_5V', electricalType: 'Power Output' },
        { pinNumber: '2', pinName: 'D-', electricalType: 'Bidirectional' },
        { pinNumber: '3', pinName: 'D+', electricalType: 'Bidirectional' },
        { pinNumber: '4', pinName: 'GND', electricalType: 'Ground' }
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
      schematic: { placed: true, x: 500, y: 100, rotationDeg: 0 },
      pins: [
        { pinNumber: '1', pinName: 'GND', electricalType: 'Ground' },
        { pinNumber: '2', pinName: 'VOUT_5V', electricalType: 'Power Output' },
        { pinNumber: '3', pinName: 'VIN_DC', electricalType: 'Power Input' }
      ]
    },
    {
      id: 'cmp_header_digital',
      boardId: 'board_arduino_uno',
      circuitBlockId: 'block_headers',
      referenceDesignator: 'J2',
      componentName: '10-Pin Digital I/O Header (D8-D13, GND, AREF, SDA, SCL)',
      componentType: 'Connector',
      value: 'Header 1x10',
      packageName: 'HEADER_1X10',
      footprint: 'HEADER_1X10',
      partNumber: 'PIN-HEADER-2.54MM-1X10',
      quantity: 1,
      side: 'Top',
      placementX: 52,
      placementY: 2.5,
      rotationDeg: 0,
      placementStatus: 'Placed',
      placementCriticality: 'Medium',
      notes: 'Digital shield connector upper rail',
      packageDimensions: { widthMm: 25.4, heightMm: 2.54, heightZMm: 8.5 },
      pcb: { placed: true, xMm: 52, yMm: 2.5, rotationDeg: 0, side: 'Top', locked: false, placementStatus: 'Placed' },
      schematic: { placed: true, x: 680, y: 220, rotationDeg: 0 },
      pins: [
        { pinNumber: '1', pinName: 'SCL', electricalType: 'Bidirectional' },
        { pinNumber: '2', pinName: 'SDA', electricalType: 'Bidirectional' },
        { pinNumber: '3', pinName: 'AREF', electricalType: 'Analog' },
        { pinNumber: '4', pinName: 'GND', electricalType: 'Ground' },
        { pinNumber: '5', pinName: 'D13', electricalType: 'Bidirectional' },
        { pinNumber: '6', pinName: 'D12', electricalType: 'Bidirectional' },
        { pinNumber: '7', pinName: 'D11', electricalType: 'Bidirectional' },
        { pinNumber: '8', pinName: 'D10', electricalType: 'Bidirectional' },
        { pinNumber: '9', pinName: 'D9', electricalType: 'Bidirectional' },
        { pinNumber: '10', pinName: 'D8', electricalType: 'Bidirectional' }
      ]
    },
    {
      id: 'cmp_header_power',
      boardId: 'board_arduino_uno',
      circuitBlockId: 'block_headers',
      referenceDesignator: 'J3',
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
      schematic: { placed: true, x: 500, y: 350, rotationDeg: 0 },
      pins: [
        { pinNumber: '1', pinName: 'NC', electricalType: 'No Connect' },
        { pinNumber: '2', pinName: 'IOREF', electricalType: 'Power Output' },
        { pinNumber: '3', pinName: 'RESET', electricalType: 'Input' },
        { pinNumber: '4', pinName: '3V3', electricalType: 'Power Output' },
        { pinNumber: '5', pinName: '5V', electricalType: 'Power Output' },
        { pinNumber: '6', pinName: 'GND', electricalType: 'Ground' },
        { pinNumber: '7', pinName: 'GND', electricalType: 'Ground' },
        { pinNumber: '8', pinName: 'VIN', electricalType: 'Power Input' }
      ]
    }
  ],

  nets: [
    { id: 'net_5v', netName: '5V', color: '#ef4444', sourceComponent: 'U2', sourcePin: '2' },
    { id: 'net_gnd', netName: 'GND', color: '#0284c7', sourceComponent: 'J1', sourcePin: '4' },
    { id: 'net_3v3', netName: '3V3', color: '#f59e0b', sourceComponent: 'J3', sourcePin: '4' },
    { id: 'net_reset', netName: 'RESET', color: '#10b981', sourceComponent: 'U1', sourcePin: '1' },
    { id: 'net_xtal1', netName: 'XTAL1', color: '#8b5cf6', sourceComponent: 'U1', sourcePin: '9' },
    { id: 'net_xtal2', netName: 'XTAL2', color: '#8b5cf6', sourceComponent: 'U1', sourcePin: '10' }
  ],

  padNetAssignments: [
    { componentId: 'cmp_atmega328p', padName: '7', netName: '5V' },
    { componentId: 'cmp_atmega328p', padName: '8', netName: 'GND' },
    { componentId: 'cmp_atmega328p', padName: '22', netName: 'GND' },
    { componentId: 'cmp_atmega328p', padName: '1', netName: 'RESET' },
    { componentId: 'cmp_atmega328p', padName: '9', netName: 'XTAL1' },
    { componentId: 'cmp_atmega328p', padName: '10', netName: 'XTAL2' },
    { componentId: 'cmp_crystal_16mhz', padName: '1', netName: 'XTAL1' },
    { componentId: 'cmp_crystal_16mhz', padName: '2', netName: 'XTAL2' },
    { componentId: 'cmp_usb_b', padName: '1', netName: '5V' },
    { componentId: 'cmp_usb_b', padName: '4', netName: 'GND' },
    { componentId: 'cmp_ldo_5v', padName: '2', netName: '5V' },
    { componentId: 'cmp_ldo_5v', padName: '1', netName: 'GND' },
    { componentId: 'cmp_header_power', padName: '5', netName: '5V' },
    { componentId: 'cmp_header_power', padName: '6', netName: 'GND' }
  ],

  traces: [
    {
      id: 'trc_5v_main',
      netName: '5V',
      layer: 'Top',
      widthMm: 0.6,
      points: [
        { x: 9, y: 10 },
        { x: 18, y: 10 },
        { x: 18, y: 46 },
        { x: 35, y: 27 }
      ]
    },
    {
      id: 'trc_xtal1',
      netName: 'XTAL1',
      layer: 'Top',
      widthMm: 0.25,
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
      category: 'Processing',
      description: 'Microcontroller, crystal oscillator, decoupling capacitors, reset pullup.',
      status: 'Design',
      estimatedPowerMw: 50,
      inputVoltageRange: '5V +/- 5%',
      keyComponents: 'ATmega328P-PU, 16MHz HC49S Crystal, 22pF Capacitors',
      interfacesProvided: 'GPIO, SPI, I2C, UART, ADC',
      interfacesRequired: '5V VCC, GND',
      testPoints: 'TP_RESET, TP_16MHZ, TP_5V',
      notes: 'Standard Arduino Uno R3 pinout compatibility.'
    },
    {
      id: 'block_power',
      name: '5V / 3.3V Power Rail Block',
      category: 'Power',
      description: 'USB VBUS supply, LDO regulator, reverse protection diode, bulk capacitors.',
      status: 'Design',
      estimatedPowerMw: 15,
      inputVoltageRange: '7-12V DC or 5V USB',
      keyComponents: 'USB-B Jack, NCP1117-5.0 LDO, 47uF Tantalum Caps',
      interfacesProvided: '5V, 3V3, GND',
      interfacesRequired: 'USB VBUS / DC Barrel',
      testPoints: 'TP_5V, TP_3V3, TP_GND',
      notes: 'Includes auto-voltage selector switch.'
    }
  ],

  requirements: [
    {
      id: 'req_1',
      title: 'Standard Arduino Shield Mechanical Pinout',
      category: 'Mechanical',
      description: 'The main board dimensions must be 68.6mm x 53.4mm with standard header spacing for Arduino R3 shields.',
      priority: 'High',
      status: 'Approved'
    },
    {
      id: 'req_2',
      title: '16MHz Clock Execution & 5V Logic',
      category: 'Electrical',
      description: 'The ATmega328P core must run at 16MHz using an external quartz crystal with 5V logic IO levels.',
      priority: 'High',
      status: 'Approved'
    }
  ],

  pinMap: [
    {
      id: 'pin_d0',
      blockId: 'block_mcu',
      functionName: 'UART RX',
      pinNumber: '2',
      signalType: 'Digital',
      voltage: '5V',
      notes: 'ATmega328P Pin 2 (PD0)'
    },
    {
      id: 'pin_d1',
      blockId: 'block_mcu',
      functionName: 'UART TX',
      pinNumber: '3',
      signalType: 'Digital',
      voltage: '5V',
      notes: 'ATmega328P Pin 3 (PD1)'
    },
    {
      id: 'pin_a4',
      blockId: 'block_mcu',
      functionName: 'I2C SDA',
      pinNumber: '27',
      signalType: 'I2C',
      voltage: '5V',
      notes: 'ATmega328P Pin 27 (PC4)'
    },
    {
      id: 'pin_a5',
      blockId: 'block_mcu',
      functionName: 'I2C SCL',
      pinNumber: '28',
      signalType: 'I2C',
      voltage: '5V',
      notes: 'ATmega328P Pin 28 (PC5)'
    }
  ],

  powerBudget: [
    {
      id: 'pwr_mcu',
      blockId: 'block_mcu',
      railName: '5V',
      voltageV: 5.0,
      currentMa: 20,
      dutyCyclePercent: 100,
      notes: '16MHz execution current consumption'
    },
    {
      id: 'pwr_leds',
      blockId: 'block_power',
      railName: '5V',
      voltageV: 5.0,
      currentMa: 10,
      dutyCyclePercent: 100,
      notes: 'ON & L13 status LEDs'
    }
  ],

  assemblyLayers: [
    { id: 'asm_top_cover', name: 'Acrylic Clear Shield Top', order: 1, layerType: 'Casing', material: 'Acrylic', fasteningMethod: 'Standoff', notes: 'Thickness 3.0mm' },
    { id: 'asm_main_pcb', name: 'Arduino Uno R3 Main FR4 PCB', order: 2, layerType: 'PCB', material: 'FR4', fasteningMethod: 'Screw Thread', notes: 'Thickness 1.6mm' },
    { id: 'asm_bottom_plate', name: 'Insulation Base Plate', order: 3, layerType: 'Casing', material: 'Polycarbonate', fasteningMethod: 'Standoff', notes: 'Thickness 2.0mm' }
  ],

  firmwareTasks: [
    { id: 'fw_init', taskName: 'System Hardware Init & Clock Setup', priority: 1, periodicityMs: 0, stackSizeBytes: 512, notes: 'Set 16MHz clock prescaler & IO direction' },
    { id: 'fw_serial', taskName: 'UART Serial Telemetry (115200 baud)', priority: 2, periodicityMs: 100, stackSizeBytes: 1024, notes: 'Serial print debug status' }
  ],

  testing: [
    { id: 'tst_power_check', testName: '5V & 3.3V Power Rail Verification', category: 'Power', procedure: 'Measure voltage across 5V and GND headers using DMM.', expectedResult: '5.0V +/- 0.1V, 3.3V +/- 0.05V', status: 'Passed' },
    { id: 'tst_clock_check', testName: '16MHz Crystal Oscillator Oscillation Check', category: 'Functional', procedure: 'Probe XTAL1 pin with oscilloscope.', expectedResult: 'Clean 16.0MHz sine wave oscillation.', status: 'Passed' }
  ]
};
