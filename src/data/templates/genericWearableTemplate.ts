import { Project } from '../../types';

export const genericWearableTemplate: Project = {
  id: "generic-wearable",
  projectName: "Smart Watch / Wearable",
  description: "A standard smart wearable framework with an MCU, custom heart rate sensor, OLED display, and LDO regulator.",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  templateName: "Generic Wearable",
  version: "1.0",
  activeView: "master",
  nodes: [
    {
      id: "wearable-mcu",
      type: "blockNode",
      position: { x: 300, y: 150 },
      data: {
        name: "Nordic nRF52840 MCU",
        category: "Electronics",
        status: "MVP",
        description: "Main microcontroller with integrated BLE transceiver and ample GPIO lines.",
        purpose: "Orchestrates sensor collection, rendering graphics to display, and host communication.",
        requirements: "Bluetooth 5.0, SPI for display, I2C for heart rate sensor.",
        candidateComponents: "nRF52840-QIAA",
        risks: "Sourcing lead times, antenna matching on tiny circular board.",
        notes: "Main processing hub.",
        testingNotes: "Measure current draw during active BLE transmission.",
        views: ["master", "electronics", "power"],
        positions: {
          master: { x: 300, y: 150 },
          electronics: { x: 300, y: 150 },
          power: { x: 300, y: 150 }
        }
      }
    },
    {
      id: "wearable-display",
      type: "blockNode",
      position: { x: 520, y: 150 },
      data: {
        name: "0.96 inch OLED Display",
        category: "Interaction",
        status: "MVP",
        description: "Mono-color OLED screen displaying real-time metrics and alerts.",
        purpose: "Visual feedback interface for the user.",
        requirements: "SPI interface, low profile thickness (<1.5mm).",
        candidateComponents: "Solomon Systech SSD1306 OLED",
        risks: "Screen burn-in, high power consumption during full-on states.",
        notes: "Disable display quickly when user lowers wrist.",
        testingNotes: "Run screen pattern tests at maximum brightness.",
        views: ["master", "electronics", "outer"],
        positions: {
          master: { x: 520, y: 150 },
          electronics: { x: 520, y: 150 },
          outer: { x: 520, y: 150 }
        }
      }
    },
    {
      id: "wearable-sensor",
      type: "blockNode",
      position: { x: 100, y: 150 },
      data: {
        name: "PPG Heart Rate Sensor",
        category: "Electronics",
        status: "MVP",
        description: "Optical heart rate sensor with green LEDs and photo-detector.",
        purpose: "Measures blood flow fluctuations to calculate pulse rates.",
        requirements: "I2C interface, placed directly against skin.",
        candidateComponents: "Maxim Integrated MAX30102",
        risks: "Light leakage detuning readings, motion artifacts.",
        notes: "Requires window in mechanical bottom cover.",
        testingNotes: "Evaluate noise levels during finger tapping.",
        views: ["master", "electronics", "internal"],
        positions: {
          master: { x: 100, y: 150 },
          electronics: { x: 100, y: 150 },
          internal: { x: 100, y: 150 }
        }
      }
    },
    {
      id: "wearable-ldo",
      type: "blockNode",
      position: { x: 300, y: 320 },
      data: {
        name: "3.3V Low-Dropout Regulator",
        category: "Power",
        status: "MVP",
        description: "Regulates changing LiPo battery voltage (3.0-4.2V) down to stable 3.3V.",
        purpose: "Clean power rail generation.",
        requirements: "Low quiescent current (<1uA), drop-out voltage <150mV.",
        candidateComponents: "Microchip MCP1700T-3302E/TT",
        risks: "Quiescent draw in sleep states, efficiency losses.",
        notes: "Place decoupling caps close to input and output pins.",
        testingNotes: "Verify output voltage remains 3.3V down to 3.4V input.",
        views: ["master", "power"],
        positions: {
          master: { x: 300, y: 320 },
          power: { x: 300, y: 320 }
        }
      }
    }
  ],
  edges: [
    { id: "e-mcu-disp", source: "wearable-mcu", target: "wearable-display", views: ["master", "electronics"] },
    { id: "e-sens-mcu", source: "wearable-sensor", target: "wearable-mcu", views: ["master", "electronics"] },
    { id: "e-ldo-mcu", source: "wearable-ldo", target: "wearable-mcu", views: ["master", "power"] }
  ],
  bom: [
    {
      id: "b-mcu",
      blockName: "Nordic nRF52840 MCU",
      candidateComponent: "nRF52840-QIAA",
      partNumber: "nRF52840-QIAA-R",
      stage: "Prototype",
      quantity: 1,
      voltage: "3.3V",
      currentEstimate: "8mA active",
      interface: "SPI/I2C/GPIO",
      packageSize: "aQFN-73",
      dimensions: "7.0 x 7.0 mm",
      costEstimate: "3.40",
      supplier: "DigiKey",
      supplierUrl: "https://www.digikey.com",
      datasheetUrl: "https://infocenter.nordicsemi.com",
      status: "Not Started",
      risk: "aQFN packaging can be difficult to hand solder during proto stages.",
      alternative: "nRF52840 Module (Raytac)",
      notes: "Allows direct USB DFU firmware updates."
    }
  ],
  testing: [
    {
      id: "t-1",
      name: " wrist sensor mechanical compression",
      goal: "Ensure PPG sensor stays flush against skin for clean optical readings.",
      partsNeeded: "Wearable enclosure mockup, wristband, force sensor",
      steps: "1. Mount case on dummy wrist model\n2. Measure pressure force against bottom plate\n3. Verify green light leakage is sealed off.",
      passCriteria: "Sensor maintains flush contact under standard wristband tension.",
      risks: "PPG sensor fails to read pulse rate during movements.",
      status: "Not Started",
      notes: "Optimal contact force is 1-2 Newtons.",
      category: "Mechanical",
      linkedBlocks: ["wearable-sensor"],
      resultNotes: "",
      evidenceLink: ""
    }
  ],
  powerBudget: [
    {
      id: "pwr-mcu",
      blockName: "Nordic nRF52840 MCU",
      voltage: "3.3",
      activeCurrentMa: 7.5,
      sleepCurrentUa: 12.0,
      dutyCyclePercent: 5,
      quantity: 1,
      notes: "Active logic routing and BLE notifications."
    },
    {
      id: "pwr-display",
      blockName: "0.96 inch OLED Display",
      voltage: "3.3",
      activeCurrentMa: 22.0,
      sleepCurrentUa: 10.0,
      dutyCyclePercent: 2,
      quantity: 1,
      notes: "Drawn mostly when screen is lit up by wrist lift gesture."
    }
  ],
  pinMap: [
    {
      id: "pin-1",
      signalName: "SPI_SCK",
      connectedBlock: "wearable-display",
      mcuPin: "P0.13",
      direction: "Output",
      protocol: "SPI",
      voltage: "3.3V",
      notes: "OLED display serial clock line."
    },
    {
      id: "pin-2",
      signalName: "I2C_SDA",
      connectedBlock: "wearable-sensor",
      mcuPin: "P0.26",
      direction: "Bidirectional",
      protocol: "I2C",
      voltage: "3.3V",
      notes: "Bi-directional data line with external pull-up resistors."
    }
  ],
  firmwareTasks: [
    {
      id: "f-task-1",
      name: " wrist-detection algorithm driver",
      type: "Driver",
      linkedBlock: "wearable-sensor",
      priority: "MVP",
      status: "Not Started",
      description: "Implement simple accelerometer polling to detect wrist-raise events and power up OLED screen.",
      acceptanceCriteria: "Display lights up within 300ms of wrist rotation trigger.",
      notes: "Uses nRF52 low power threshold interrupts."
    }
  ],
  batteryCapacityMah: 150
};
