import { Project } from '../../types';

export const bleButtonTemplate: Project = {
  id: "ble-button",
  projectName: "BLE Button Smart Clicker",
  description: "A compact single-button wireless beacon using a coin-cell battery and Nordic nRF52805 MCU.",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  templateName: "BLE Button Device",
  version: "1.0",
  activeView: "master",
  nodes: [
    {
      id: "mcu-node",
      type: "blockNode",
      position: { x: 300, y: 150 },
      data: {
        name: "nRF52805 BLE MCU",
        category: "Electronics",
        status: "MVP",
        description: "Ultra-small WLCSP BLE microcontroller hosting the firmware control loop.",
        purpose: "Handles button debounce, controls LED feedback, and sends BLE keycodes.",
        requirements: "Bluetooth 5.2 stack, GPIO interface, runs directly on 3V coin cell.",
        candidateComponents: "Nordic Semiconductor nRF52805-CAAA",
        risks: "Soldering pitch of WLCSP (0.4mm), requires high quality PCB fab.",
        notes: "Keep RF trace short and matched to 50 ohms.",
        testingNotes: "Verify BLE advertising throughput.",
        views: ["master", "electronics", "power"],
        positions: {
          master: { x: 300, y: 150 },
          electronics: { x: 300, y: 150 },
          power: { x: 300, y: 150 }
        }
      }
    },
    {
      id: "button-node",
      type: "blockNode",
      position: { x: 100, y: 150 },
      data: {
        name: "Tactile Button Switch",
        category: "Interaction",
        status: "MVP",
        description: "Standard SMD tactile push switch for user trigger input.",
        purpose: "Detects user clicks to wake up MCU and send commands.",
        requirements: "Sharp click actuation, high lifespan (>100k cycles).",
        candidateComponents: "C&K PTS815 or Panasonic EVP-AY",
        risks: "Solder strain or mechanical failure under heavy clicks.",
        notes: "Configured with weak internal pull-up on MCU side.",
        testingNotes: "Debounce test using scope.",
        views: ["master", "electronics", "outer"],
        positions: {
          master: { x: 100, y: 150 },
          electronics: { x: 100, y: 150 },
          outer: { x: 100, y: 150 }
        }
      }
    },
    {
      id: "led-node",
      type: "blockNode",
      position: { x: 500, y: 150 },
      data: {
        name: "Status Indicator LED",
        category: "Interaction",
        status: "MVP",
        description: "SMD LED displaying connectivity status and feedback confirmations.",
        purpose: "Flashes red/green to indicate connection status or keypress validation.",
        requirements: "High efficiency, visible through casing window.",
        candidateComponents: "Lite-On LTST-C190 or Kingbright 0603 LED",
        risks: "Current draw can drain coin cell rapidly if left active.",
        notes: "Controlled via PWM/GPIO with standard limiting resistor.",
        testingNotes: "Verify lumen output through case plastic.",
        views: ["master", "electronics", "outer"],
        positions: {
          master: { x: 500, y: 150 },
          electronics: { x: 500, y: 150 },
          outer: { x: 500, y: 150 }
        }
      }
    },
    {
      id: "battery-node",
      type: "blockNode",
      position: { x: 300, y: 320 },
      data: {
        name: "CR2032 Coin Cell Battery",
        category: "Power",
        status: "MVP",
        description: "Lithium metal 3.0V coin battery for completely mobile power.",
        purpose: "Provides direct operating current to BLE MCU and LED.",
        requirements: "Standard 20mm battery holder, nominal capacity 220mAh.",
        candidateComponents: "Panasonic CR2032 cell + Keystone 1058 holder",
        risks: "High current leakage if MCU fails to enter deep sleep.",
        notes: "No voltage regulator; connected directly to VDD line.",
        testingNotes: "Measure sleep state quiescent current draw.",
        views: ["master", "power"],
        positions: {
          master: { x: 300, y: 320 },
          power: { x: 300, y: 320 }
        }
      }
    }
  ],
  edges: [
    { id: "edge-btn-mcu", source: "button-node", target: "mcu-node", views: ["master", "electronics"] },
    { id: "edge-mcu-led", source: "mcu-node", target: "led-node", views: ["master", "electronics"] },
    { id: "edge-bat-mcu", source: "battery-node", target: "mcu-node", views: ["master", "power"] }
  ],
  bom: [
    {
      id: "bom-1",
      blockName: "nRF52805 BLE MCU",
      candidateComponent: "Nordic nRF52805-CAAA",
      partNumber: "nRF52805-CAAA-R",
      stage: "Prototype",
      quantity: 1,
      voltage: "3.0V",
      currentEstimate: "5mA active",
      interface: "SPI/I2C/GPIO",
      packageSize: "WLCSP-28",
      dimensions: "2.5 x 2.4 mm",
      costEstimate: "1.80",
      supplier: "DigiKey",
      supplierUrl: "https://www.digikey.com",
      datasheetUrl: "https://infocenter.nordicsemi.com",
      status: "Not Started",
      risk: "Difficulty soldering WLCSP during prototype stage.",
      alternative: "nRF52832 QFN",
      notes: "Requires a 4-layer PCB design for proper grounding."
    },
    {
      id: "bom-2",
      blockName: "Tactile Button Switch",
      candidateComponent: "C&K PTS815",
      partNumber: "PTS815 SJM 250 SMTR LFS",
      stage: "Prototype",
      quantity: 1,
      voltage: "3.0V",
      currentEstimate: "0.1mA active",
      interface: "GPIO Input",
      packageSize: "SMD 4.2x3.2mm",
      dimensions: "4.2 x 3.2 x 2.5 mm",
      costEstimate: "0.25",
      supplier: "Mouser",
      supplierUrl: "https://www.mouser.com",
      datasheetUrl: "https://www.ckswitches.com",
      status: "Sourced",
      risk: "Dust entry if not IP67 rated.",
      alternative: "Panasonic EVP-AY",
      notes: "High click feedback helps user verify action."
    }
  ],
  testing: [
    {
      id: "test-1",
      name: "Debounce Validation",
      goal: "Ensure button presses trigger single digital events without hardware noise rings.",
      partsNeeded: "nRF52805 board, oscilloscope",
      steps: "1. Capture button pin waveform on scope\n2. Verify switch noise settles within 5ms\n3. Adjust firmware debounce timer accordingly.",
      passCriteria: "Zero multi-trigger counts observed on 50 consecutive button presses.",
      risks: "False double clicks registered in game/beacon payloads.",
      status: "Not Started",
      notes: "Internal pullup value is 13k ohms.",
      category: "Electrical",
      linkedBlocks: ["button-node"],
      resultNotes: "",
      evidenceLink: ""
    }
  ],
  powerBudget: [
    {
      id: "pwr-mcu",
      blockName: "nRF52805 BLE MCU",
      voltage: "3.0",
      activeCurrentMa: 5.2,
      sleepCurrentUa: 3.1,
      dutyCyclePercent: 0.8,
      quantity: 1,
      notes: "Active when transmitting advertising payload. Enters deep sleep otherwise."
    },
    {
      id: "pwr-led",
      blockName: "Status Indicator LED",
      voltage: "3.0",
      activeCurrentMa: 2.5,
      sleepCurrentUa: 0,
      dutyCyclePercent: 0.1,
      quantity: 1,
      notes: "Short flashes during click events. Sinks current directly from GPIO pin."
    }
  ],
  pinMap: [
    {
      id: "pin-1",
      signalName: "BUTTON_INPUT",
      connectedBlock: "button-node",
      mcuPin: "P0.04",
      direction: "Input",
      protocol: "GPIO",
      voltage: "3.0V",
      notes: "Configured with hardware pull-up, active-low signal."
    },
    {
      id: "pin-2",
      signalName: "LED_PWM",
      connectedBlock: "led-node",
      mcuPin: "P0.05",
      direction: "Output",
      protocol: "PWM",
      voltage: "3.0V",
      notes: "Current limited to 2mA in output driver configuration."
    }
  ],
  firmwareTasks: [
    {
      id: "fw-task-1",
      name: "Boot sequence and Clock Initialization",
      type: "State",
      linkedBlock: "mcu-node",
      priority: "MVP",
      status: "Not Started",
      description: "Initialize the external 32.768 kHz crystal oscillator and setup low power clock dividers.",
      acceptanceCriteria: "Stable low frequency clock verified by BLE stack initialization callback.",
      notes: "Crucial for BLE timing accuracy in sleep states."
    },
    {
      id: "fw-task-2",
      name: "Button Debounce and GPIO Wakeup Handler",
      type: "Driver",
      linkedBlock: "button-node",
      priority: "MVP",
      status: "Not Started",
      description: "Configure nRF GPIOTE module to trigger sense interrupt on falling edge and wake up from system OFF mode.",
      acceptanceCriteria: "Device enters deep sleep and wakes up instantly on button press.",
      notes: "Firmware should enter sleep after 5 seconds of button inactivity."
    }
  ],
  batteryCapacityMah: 220
};
