// componentLibrary.ts — Part of Phase 3 Real Component Library

export type ComponentPinDefinition = {
  number: string;
  name: string;
  electricalType:
    | "Power Input"
    | "Power Output"
    | "Ground"
    | "Input"
    | "Output"
    | "Bidirectional"
    | "Passive"
    | "Open Drain"
    | "Analog"
    | "Clock"
    | "RF"
    | "No Connect";
  required: boolean;
  defaultNetName?: string;
  voltage?: number;
  protocol?: string;
  notes?: string;
};

export type ElectronicComponentDefinition = {
  libraryId: string;
  name: string;
  category:
    | "MCU"
    | "Processor"
    | "Power"
    | "Regulator"
    | "Charger"
    | "Protection"
    | "Resistor"
    | "Capacitor"
    | "Inductor"
    | "Diode"
    | "LED"
    | "Transistor"
    | "MOSFET"
    | "Sensor"
    | "RF"
    | "Antenna"
    | "Connector"
    | "Button"
    | "Touch"
    | "Motor"
    | "Haptic"
    | "Memory"
    | "Debug"
    | "Test Point"
    | "Battery"
    | "Custom";
  description: string;
  manufacturer?: string;
  partNumber?: string;
  value?: string;
  packageName: string;
  footprintName: string;
  symbolName: string;

  electrical: {
    operatingVoltageMin?: number;
    operatingVoltageMax?: number;
    typicalVoltage?: number;
    currentTypicalMa?: number;
    currentMaxMa?: number;
    powerRatingW?: number;
    resistanceOhm?: number;
    capacitanceF?: number;
    inductanceH?: number;
    frequencyHz?: number;
    logicLevel?: number;
    notes?: string;
  };

  pins: ComponentPinDefinition[];
  tags: string[];
  defaultQuantity: number;
  datasheetUrl?: string;
  notes?: string;
};

export const defaultComponents: ElectronicComponentDefinition[] = [
  {
    libraryId: "mcu-generic",
    name: "Generic 8-bit MCU",
    category: "MCU",
    description: "Low-power generic 8-bit microcontroller, SOT-23-6",
    manufacturer: "Microchip",
    partNumber: "ATTINY10-TSHR",
    value: "ATTINY10",
    packageName: "SOT23_6",
    footprintName: "SOT23_6",
    symbolName: "MCU",
    electrical: { operatingVoltageMin: 1.8, operatingVoltageMax: 5.5, currentTypicalMa: 1 },
    pins: [
      { number: "1", name: "PB0", electricalType: "Bidirectional", required: false },
      { number: "2", name: "GND", electricalType: "Ground", required: true, defaultNetName: "GND" },
      { number: "3", name: "PB1", electricalType: "Bidirectional", required: false },
      { number: "4", name: "PB2", electricalType: "Bidirectional", required: false },
      { number: "5", name: "VCC", electricalType: "Power Input", required: true, defaultNetName: "3V3" },
      { number: "6", name: "PB3/RESET", electricalType: "Input", required: false }
    ],
    tags: ["mcu", "low-power", "tiny"],
    defaultQuantity: 1
  },
  {
    libraryId: "mcu-esp32c3",
    name: "ESP32-C3-MINI-1",
    category: "MCU",
    description: "Wi-Fi and Bluetooth LE RISC-V MCU module",
    manufacturer: "Espressif",
    partNumber: "ESP32-C3-MINI-1-N4",
    value: "ESP32-C3",
    packageName: "QFN_32",
    footprintName: "QFN_32",
    symbolName: "MCU",
    electrical: { operatingVoltageMin: 3.0, operatingVoltageMax: 3.6, currentTypicalMa: 80 },
    pins: [
      { number: "1", name: "GND", electricalType: "Ground", required: true, defaultNetName: "GND" },
      { number: "2", name: "GND", electricalType: "Ground", required: true, defaultNetName: "GND" },
      { number: "3", name: "3V3", electricalType: "Power Input", required: true, defaultNetName: "3V3" },
      { number: "4", name: "IO2", electricalType: "Bidirectional", required: false },
      { number: "5", name: "IO3", electricalType: "Bidirectional", required: false },
      { number: "6", name: "GND", electricalType: "Ground", required: true, defaultNetName: "GND" },
      { number: "7", name: "EN", electricalType: "Input", required: true },
      { number: "8", name: "GND", electricalType: "Ground", required: true, defaultNetName: "GND" },
      { number: "9", name: "IO4", electricalType: "Bidirectional", required: false },
      { number: "10", name: "IO5", electricalType: "Bidirectional", required: false },
      { number: "11", name: "IO6", electricalType: "Bidirectional", required: false },
      { number: "12", name: "IO7", electricalType: "Bidirectional", required: false },
      { number: "13", name: "IO8", electricalType: "Bidirectional", required: false },
      { number: "14", name: "IO9", electricalType: "Bidirectional", required: false },
      { number: "15", name: "GND", electricalType: "Ground", required: true, defaultNetName: "GND" },
      { number: "16", name: "GND", electricalType: "Ground", required: true, defaultNetName: "GND" },
      { number: "17", name: "IO10", electricalType: "Bidirectional", required: false },
      { number: "18", name: "GND", electricalType: "Ground", required: true, defaultNetName: "GND" },
      { number: "19", name: "IO18", electricalType: "Bidirectional", required: false },
      { number: "20", name: "IO19", electricalType: "Bidirectional", required: false },
      { number: "21", name: "GND", electricalType: "Ground", required: true, defaultNetName: "GND" },
      { number: "22", name: "RXD", electricalType: "Input", required: false },
      { number: "23", name: "TXD", electricalType: "Output", required: false },
      { number: "24", name: "GND", electricalType: "Ground", required: true, defaultNetName: "GND" },
      { number: "25", name: "IO20", electricalType: "Bidirectional", required: false },
      { number: "26", name: "IO21", electricalType: "Bidirectional", required: false },
      { number: "27", name: "GND", electricalType: "Ground", required: true, defaultNetName: "GND" },
      { number: "28", name: "ANT", electricalType: "RF", required: true, defaultNetName: "RF_ANT" },
      { number: "29", name: "GND", electricalType: "Ground", required: true, defaultNetName: "GND" },
      { number: "30", name: "GND", electricalType: "Ground", required: true, defaultNetName: "GND" },
      { number: "31", name: "GND", electricalType: "Ground", required: true, defaultNetName: "GND" },
      { number: "32", name: "GND", electricalType: "Ground", required: true, defaultNetName: "GND" }
    ],
    tags: ["mcu", "wifi", "ble", "esp32"],
    defaultQuantity: 1
  },
  {
    libraryId: "mcu-nrf52840",
    name: "nRF52840-QIAA",
    category: "MCU",
    description: "Multiprotocol Bluetooth 5.4, Thread, Zigbee SoC",
    manufacturer: "Nordic Semiconductor",
    partNumber: "nRF52840-QIAA-R",
    value: "nRF52840",
    packageName: "QFN_48",
    footprintName: "QFN_48",
    symbolName: "MCU",
    electrical: { operatingVoltageMin: 1.7, operatingVoltageMax: 5.5, currentTypicalMa: 5 },
    pins: [
      { number: "1", name: "DEC1", electricalType: "Passive", required: true },
      { number: "2", name: "P0.00/XL1", electricalType: "Bidirectional", required: false },
      { number: "3", name: "P0.01/XL2", electricalType: "Bidirectional", required: false },
      { number: "4", name: "P0.02/AIN0", electricalType: "Analog", required: false },
      { number: "5", name: "P0.03/AIN1", electricalType: "Analog", required: false },
      { number: "6", name: "P0.04/AIN2", electricalType: "Analog", required: false },
      { number: "7", name: "P0.05/AIN3", electricalType: "Analog", required: false },
      { number: "8", name: "P0.06", electricalType: "Bidirectional", required: false },
      { number: "9", name: "P0.07", electricalType: "Bidirectional", required: false },
      { number: "10", name: "P0.08", electricalType: "Bidirectional", required: false },
      { number: "11", name: "P0.09/NFC1", electricalType: "Bidirectional", required: false },
      { number: "12", name: "P0.10/NFC2", electricalType: "Bidirectional", required: false },
      { number: "13", name: "VDD", electricalType: "Power Input", required: true, defaultNetName: "3V3" },
      { number: "14", name: "PGND", electricalType: "Ground", required: true, defaultNetName: "GND" },
      { number: "15", name: "XC1", electricalType: "Clock", required: false },
      { number: "16", name: "XC2", electricalType: "Clock", required: false },
      { number: "17", name: "DEC2", electricalType: "Passive", required: true },
      { number: "18", name: "DEC3", electricalType: "Passive", required: true },
      { number: "19", name: "XOUT", electricalType: "Clock", required: false },
      { number: "20", name: "XIN", electricalType: "Clock", required: false },
      { number: "21", name: "ANT", electricalType: "RF", required: true, defaultNetName: "RF_ANT" },
      { number: "22", name: "VSS", electricalType: "Ground", required: true, defaultNetName: "GND" },
      { number: "23", name: "DEC4", electricalType: "Passive", required: true },
      { number: "24", name: "DCC", electricalType: "Power Output", required: false },
      { number: "25", name: "DEC4_LDO", electricalType: "Passive", required: false },
      { number: "26", name: "VDD_H", electricalType: "Power Input", required: false, defaultNetName: "VBAT" },
      { number: "27", name: "VBUS", electricalType: "Power Input", required: false, defaultNetName: "5V" },
      { number: "28", name: "SWDIO", electricalType: "Bidirectional", required: true, defaultNetName: "SWDIO" },
      { number: "29", name: "SWDCLK", electricalType: "Clock", required: true, defaultNetName: "SWCLK" },
      { number: "30", name: "RESET", electricalType: "Input", required: false, defaultNetName: "RESET" },
      { number: "31", name: "P0.11", electricalType: "Bidirectional", required: false },
      { number: "32", name: "P0.12", electricalType: "Bidirectional", required: false },
      { number: "33", name: "P0.13", electricalType: "Bidirectional", required: false },
      { number: "34", name: "P0.14", electricalType: "Bidirectional", required: false },
      { number: "35", name: "P0.15", electricalType: "Bidirectional", required: false },
      { number: "36", name: "P0.16", electricalType: "Bidirectional", required: false },
      { number: "37", name: "P0.17", electricalType: "Bidirectional", required: false },
      { number: "38", name: "P0.18", electricalType: "Bidirectional", required: false },
      { number: "39", name: "P0.19", electricalType: "Bidirectional", required: false },
      { number: "40", name: "P0.20", electricalType: "Bidirectional", required: false },
      { number: "41", name: "P0.21", electricalType: "Bidirectional", required: false },
      { number: "42", name: "P0.22", electricalType: "Bidirectional", required: false },
      { number: "43", name: "P0.23", electricalType: "Bidirectional", required: false },
      { number: "44", name: "P0.24", electricalType: "Bidirectional", required: false },
      { number: "45", name: "P0.25", electricalType: "Bidirectional", required: false },
      { number: "46", name: "P0.26", electricalType: "Bidirectional", required: false },
      { number: "47", name: "P0.27", electricalType: "Bidirectional", required: false },
      { number: "48", name: "VSS_EP", electricalType: "Ground", required: true, defaultNetName: "GND" }
    ],
    tags: ["mcu", "ble", "nrf52", "mesh"],
    defaultQuantity: 1
  },
  {
    libraryId: "ldo-ap2112",
    name: "AP2112K-3.3",
    category: "Regulator",
    description: "600mA Low Dropout Linear Regulator",
    manufacturer: "Diodes Inc",
    partNumber: "AP2112K-3.3TRG1",
    value: "3.3V LDO",
    packageName: "SOT23_5",
    footprintName: "SOT23_5",
    symbolName: "Regulator",
    electrical: { operatingVoltageMin: 3.6, operatingVoltageMax: 6.0, typicalVoltage: 3.3, currentMaxMa: 600 },
    pins: [
      { number: "1", name: "VIN", electricalType: "Power Input", required: true, defaultNetName: "VBAT" },
      { number: "2", name: "GND", electricalType: "Ground", required: true, defaultNetName: "GND" },
      { number: "3", name: "EN", electricalType: "Input", required: true, defaultNetName: "VBAT" },
      { number: "4", name: "BYP", electricalType: "Passive", required: false },
      { number: "5", name: "VOUT", electricalType: "Power Output", required: true, defaultNetName: "3V3" }
    ],
    tags: ["power", "ldo", "regulator", "3v3"],
    defaultQuantity: 1
  },
  {
    libraryId: "charger-mcp73831",
    name: "MCP73831T",
    category: "Charger",
    description: "Li-Ion/Li-Polymer Charge Management Controller",
    manufacturer: "Microchip",
    partNumber: "MCP73831T-2ACI/OT",
    value: "MCP73831",
    packageName: "SOT23_5",
    footprintName: "SOT23_5",
    symbolName: "Charger",
    electrical: { operatingVoltageMin: 3.75, operatingVoltageMax: 6.0, typicalVoltage: 5.0 },
    pins: [
      { number: "1", name: "STAT", electricalType: "Open Drain", required: false },
      { number: "2", name: "VSS", electricalType: "Ground", required: true, defaultNetName: "GND" },
      { number: "3", name: "VBAT", electricalType: "Power Output", required: true, defaultNetName: "VBAT" },
      { number: "4", name: "VDD", electricalType: "Power Input", required: true, defaultNetName: "5V" },
      { number: "5", name: "PROG", electricalType: "Analog", required: true }
    ],
    tags: ["charger", "battery", "power"],
    defaultQuantity: 1
  },
  {
    libraryId: "protection-dw01a",
    name: "DW01A",
    category: "Protection",
    description: "One-Cell Lithium-Ion Battery Protection IC",
    manufacturer: "Fortune Semiconductor",
    partNumber: "DW01A-G",
    value: "DW01A",
    packageName: "SOT23_6",
    footprintName: "SOT23_6",
    symbolName: "Protection",
    electrical: { operatingVoltageMin: 1.5, operatingVoltageMax: 6.0 },
    pins: [
      { number: "1", name: "OD", electricalType: "Output", required: true },
      { number: "2", name: "CS", electricalType: "Input", required: true },
      { number: "3", name: "OC", electricalType: "Output", required: true },
      { number: "4", name: "TD", electricalType: "Input", required: false },
      { number: "5", name: "VCC", electricalType: "Power Input", required: true, defaultNetName: "VBAT" },
      { number: "6", name: "GND", electricalType: "Ground", required: true, defaultNetName: "GND" }
    ],
    tags: ["protection", "battery", "safety"],
    defaultQuantity: 1
  },
  {
    libraryId: "mosfet-ao3400",
    name: "AO3400A",
    category: "MOSFET",
    description: "30V N-Channel MOSFET, SOT-23",
    manufacturer: "Alpha & Omega Semiconductor",
    partNumber: "AO3400A",
    value: "N-MOSFET",
    packageName: "SOT23",
    footprintName: "SOT23",
    symbolName: "MOSFET",
    electrical: { operatingVoltageMax: 30, currentMaxMa: 5800 },
    pins: [
      { number: "1", name: "G", electricalType: "Input", required: true },
      { number: "2", name: "S", electricalType: "Passive", required: true, defaultNetName: "GND" },
      { number: "3", name: "D", electricalType: "Passive", required: true }
    ],
    tags: ["mosfet", "transistor", "n-channel", "switch"],
    defaultQuantity: 1
  },
  {
    libraryId: "r-0603-generic",
    name: "Generic Resistor 0603",
    category: "Resistor",
    description: "Generic 0603 Thick Film Resistor",
    value: "10k",
    packageName: "R_0603",
    footprintName: "R_0603",
    symbolName: "resistor",
    electrical: { resistanceOhm: 10000, powerRatingW: 0.1 },
    pins: [
      { number: "1", name: "1", electricalType: "Passive", required: true },
      { number: "2", name: "2", electricalType: "Passive", required: true }
    ],
    tags: ["resistor", "passive", "0603"],
    defaultQuantity: 5
  },
  {
    libraryId: "c-0603-generic",
    name: "Generic Capacitor 0603",
    category: "Capacitor",
    description: "Generic 0603 Ceramic Capacitor",
    value: "100nF",
    packageName: "C_0603",
    footprintName: "C_0603",
    symbolName: "capacitor",
    electrical: { capacitanceF: 1e-7, typicalVoltage: 50 },
    pins: [
      { number: "1", name: "1", electricalType: "Passive", required: true },
      { number: "2", name: "2", electricalType: "Passive", required: true }
    ],
    tags: ["capacitor", "passive", "0603", "decoupling"],
    defaultQuantity: 5
  },
  {
    libraryId: "led-0603",
    name: "Generic LED 0603",
    category: "LED",
    description: "Generic 0603 Indicator LED",
    value: "Green",
    packageName: "LED_0603",
    footprintName: "LED_0603",
    symbolName: "LED",
    electrical: { operatingVoltageMin: 2.0, operatingVoltageMax: 2.2, currentTypicalMa: 20 },
    pins: [
      { number: "1", name: "A", electricalType: "Passive", required: true },
      { number: "2", name: "K", electricalType: "Passive", required: true, defaultNetName: "GND" }
    ],
    tags: ["led", "diode", "indicator", "0603"],
    defaultQuantity: 1
  },
  {
    libraryId: "diode-schottky",
    name: "B130-13-F Schottky Diode",
    category: "Diode",
    description: "Schottky Barrier Rectifier, 30V, 1A",
    manufacturer: "Diodes Inc",
    partNumber: "B130-13-F",
    value: "Schottky",
    packageName: "SOT23",
    footprintName: "SOT23",
    symbolName: "diode",
    electrical: { operatingVoltageMax: 30, typicalVoltage: 0.3 },
    pins: [
      { number: "1", name: "A", electricalType: "Passive", required: true },
      { number: "2", name: "K", electricalType: "Passive", required: true }
    ],
    tags: ["diode", "schottky", "rectifier", "protection"],
    defaultQuantity: 1
  },
  {
    libraryId: "haptic-drv2605",
    name: "DRV2605L",
    category: "Haptic",
    description: "LRA and ERM Haptic Driver with Built-In Library",
    manufacturer: "Texas Instruments",
    partNumber: "DRV2605LDGSR",
    value: "DRV2605L",
    packageName: "TSSOP_10",
    footprintName: "TSSOP_16",
    symbolName: "MCU",
    electrical: { operatingVoltageMin: 2.5, operatingVoltageMax: 5.5 },
    pins: [
      { number: "1", name: "REG", electricalType: "Passive", required: false },
      { number: "2", name: "EN", electricalType: "Input", required: true },
      { number: "3", name: "SDA", electricalType: "Bidirectional", required: true, defaultNetName: "I2C_SDA" },
      { number: "4", name: "SCL", electricalType: "Clock", required: true, defaultNetName: "I2C_SCL" },
      { number: "5", name: "OUT+", electricalType: "Output", required: true, defaultNetName: "HAPTIC_P" },
      { number: "6", name: "GND", electricalType: "Ground", required: true, defaultNetName: "GND" },
      { number: "7", name: "OUT-", electricalType: "Output", required: true, defaultNetName: "HAPTIC_N" },
      { number: "8", name: "VDD", electricalType: "Power Input", required: true, defaultNetName: "3V3" }
    ],
    tags: ["haptic", "driver", "i2c", "motor"],
    defaultQuantity: 1
  },
  {
    libraryId: "vibe-motor",
    name: "Vibration Motor ERM",
    category: "Motor",
    description: "Generic 0820 ERM pancake vibration motor",
    value: "ERM 3.0V",
    packageName: "MOTOR_PAD",
    footprintName: "MOTOR_PAD",
    symbolName: "motor",
    electrical: { operatingVoltageMin: 2.5, operatingVoltageMax: 3.5, currentTypicalMa: 80 },
    pins: [
      { number: "1", name: "+", electricalType: "Passive", required: true, defaultNetName: "HAPTIC_P" },
      { number: "2", name: "-", electricalType: "Passive", required: true, defaultNetName: "HAPTIC_N" }
    ],
    tags: ["motor", "haptic", "actuator"],
    defaultQuantity: 1
  },
  {
    libraryId: "touch-iqs263",
    name: "IQS263B",
    category: "Touch",
    description: "3 Channel Projected/Self Capacitive Touch Controller",
    manufacturer: "Azoteq",
    partNumber: "IQS263B0MSR",
    value: "IQS263B",
    packageName: "SOIC_14",
    footprintName: "SOIC_14",
    symbolName: "MCU",
    electrical: { operatingVoltageMin: 1.8, operatingVoltageMax: 3.6 },
    pins: [
      { number: "1", name: "VDD", electricalType: "Power Input", required: true, defaultNetName: "3V3" },
      { number: "2", name: "SCL", electricalType: "Clock", required: true, defaultNetName: "I2C_SCL" },
      { number: "3", name: "SDA", electricalType: "Bidirectional", required: true, defaultNetName: "I2C_SDA" },
      { number: "4", name: "RDY", electricalType: "Output", required: false },
      { number: "5", name: "CH0", electricalType: "Analog", required: true, defaultNetName: "TOUCH_CH0" },
      { number: "6", name: "CH1", electricalType: "Analog", required: true, defaultNetName: "TOUCH_CH1" },
      { number: "7", name: "CH2", electricalType: "Analog", required: true, defaultNetName: "TOUCH_CH2" },
      { number: "8", name: "POUT", electricalType: "Output", required: false },
      { number: "9", name: "GND", electricalType: "Ground", required: true, defaultNetName: "GND" }
    ],
    tags: ["touch", "capacitive", "sensor"],
    defaultQuantity: 1
  },
  {
    libraryId: "sensor-lis2dh12",
    name: "LIS2DH12TR",
    category: "Sensor",
    description: "Ultra-low-power high-performance 3-axis accelerometer",
    manufacturer: "STMicroelectronics",
    partNumber: "LIS2DH12TR",
    value: "Accelerometer",
    packageName: "LGA_12",
    footprintName: "LGA_12",
    symbolName: "sensor",
    electrical: { operatingVoltageMin: 1.71, operatingVoltageMax: 3.6, currentTypicalMa: 0.01 },
    pins: [
      { number: "1", name: "SCL", electricalType: "Clock", required: true, defaultNetName: "I2C_SCL" },
      { number: "2", name: "CS", electricalType: "Input", required: true, defaultNetName: "3V3" },
      { number: "3", name: "SA0/SDO", electricalType: "Bidirectional", required: false, defaultNetName: "GND" },
      { number: "4", name: "SDA", electricalType: "Bidirectional", required: true, defaultNetName: "I2C_SDA" },
      { number: "5", name: "INT1", electricalType: "Output", required: false },
      { number: "6", name: "GND", electricalType: "Ground", required: true, defaultNetName: "GND" },
      { number: "7", name: "GND", electricalType: "Ground", required: true, defaultNetName: "GND" },
      { number: "8", name: "GND", electricalType: "Ground", required: true, defaultNetName: "GND" },
      { number: "9", name: "VDD", electricalType: "Power Input", required: true, defaultNetName: "3V3" },
      { number: "10", name: "VDD_IO", electricalType: "Power Input", required: true, defaultNetName: "3V3" },
      { number: "11", name: "INT2", electricalType: "Output", required: false },
      { number: "12", name: "GND", electricalType: "Ground", required: true, defaultNetName: "GND" }
    ],
    tags: ["accelerometer", "sensor", "i2c", "low-power"],
    defaultQuantity: 1
  },
  {
    libraryId: "sensor-tmp117",
    name: "TMP117AIDRVT",
    category: "Sensor",
    description: "High-precision digital temperature sensor",
    manufacturer: "Texas Instruments",
    partNumber: "TMP117AIDRVT",
    value: "Temp Sensor",
    packageName: "DFN_6",
    footprintName: "DFN_6",
    symbolName: "sensor",
    electrical: { operatingVoltageMin: 1.8, operatingVoltageMax: 5.5, currentTypicalMa: 0.0035 },
    pins: [
      { number: "1", name: "SDA", electricalType: "Bidirectional", required: true, defaultNetName: "I2C_SDA" },
      { number: "2", name: "GND", electricalType: "Ground", required: true, defaultNetName: "GND" },
      { number: "3", name: "SCL", electricalType: "Clock", required: true, defaultNetName: "I2C_SCL" },
      { number: "4", name: "ADDR0", electricalType: "Input", required: true, defaultNetName: "GND" },
      { number: "5", name: "ALERT", electricalType: "Output", required: false },
      { number: "6", name: "V+", electricalType: "Power Input", required: true, defaultNetName: "3V3" }
    ],
    tags: ["temperature", "sensor", "i2c", "precision"],
    defaultQuantity: 1
  },
  {
    libraryId: "conn-usbc",
    name: "USB Type-C Connector 16-Pin",
    category: "Connector",
    description: "USB-C receptacle, USB 2.0 speeds, 16-Pin SMT",
    manufacturer: "Korean Hopt",
    partNumber: "TYPE-C-16PIN",
    value: "USB-C",
    packageName: "USB_C_RECEPTACLE",
    footprintName: "USB_C_RECEPTACLE",
    symbolName: "connector",
    electrical: { operatingVoltageMax: 20.0, currentMaxMa: 3000 },
    pins: [
      { number: "A1/B12", name: "GND", electricalType: "Ground", required: true, defaultNetName: "GND" },
      { number: "A4/B9", name: "VBUS", electricalType: "Power Output", required: true, defaultNetName: "5V" },
      { number: "A5", name: "CC1", electricalType: "Bidirectional", required: true },
      { number: "A6", name: "DP1", electricalType: "Bidirectional", required: false },
      { number: "A7", name: "DN1", electricalType: "Bidirectional", required: false },
      { number: "A8", name: "SBU1", electricalType: "Bidirectional", required: false },
      { number: "B1/A12", name: "GND", electricalType: "Ground", required: true, defaultNetName: "GND" },
      { number: "B4/A9", name: "VBUS", electricalType: "Power Output", required: true, defaultNetName: "5V" },
      { number: "B5", name: "CC2", electricalType: "Bidirectional", required: true },
      { number: "B6", name: "DP2", electricalType: "Bidirectional", required: false },
      { number: "B7", name: "DN2", electricalType: "Bidirectional", required: false },
      { number: "B8", name: "SBU2", electricalType: "Bidirectional", required: false },
      { number: "SH1", name: "SHIELD", electricalType: "Ground", required: false, defaultNetName: "GND" },
      { number: "SH2", name: "SHIELD", electricalType: "Ground", required: false, defaultNetName: "GND" },
      { number: "SH3", name: "SHIELD", electricalType: "Ground", required: false, defaultNetName: "GND" },
      { number: "SH4", name: "SHIELD", electricalType: "Ground", required: false, defaultNetName: "GND" }
    ],
    tags: ["connector", "usb", "usb-c", "power-input"],
    defaultQuantity: 1
  },
  {
    libraryId: "conn-jst-ph",
    name: "JST PH 2-Pin Connector",
    category: "Connector",
    description: "2.0mm pitch JST connector for Lithium Polymer batteries",
    manufacturer: "JST",
    partNumber: "B2B-PH-K-S",
    value: "JST-PH-2P",
    packageName: "JST_PH_2",
    footprintName: "JST_PH_2",
    symbolName: "connector",
    electrical: { operatingVoltageMax: 100.0, currentMaxMa: 2000 },
    pins: [
      { number: "1", name: "POS", electricalType: "Power Output", required: true, defaultNetName: "VBAT" },
      { number: "2", name: "NEG", electricalType: "Ground", required: true, defaultNetName: "GND" }
    ],
    tags: ["connector", "jst", "battery-input", "power"],
    defaultQuantity: 1
  },
  {
    libraryId: "test-pad",
    name: "Test Point Pad",
    category: "Test Point",
    description: "1.0mm SMD test point copper pad",
    value: "TP",
    packageName: "TEST_PAD",
    footprintName: "TEST_PAD",
    symbolName: "power symbol",
    electrical: {},
    pins: [
      { number: "1", name: "TP", electricalType: "Passive", required: true }
    ],
    tags: ["testpoint", "debug", "pad"],
    defaultQuantity: 4
  },
  {
    libraryId: "pogo-pad",
    name: "Pogo Pin Target Pad",
    category: "Test Point",
    description: "SMD target pad for pogo pins in programming fixtures",
    value: "POGO",
    packageName: "POGO_PAD",
    footprintName: "POGO_PAD",
    symbolName: "power symbol",
    electrical: {},
    pins: [
      { number: "1", name: "POGO", electricalType: "Passive", required: true }
    ],
    tags: ["pogo", "debug", "programming", "pad"],
    defaultQuantity: 6
  },
  {
    libraryId: "button-push",
    name: "Tactile Push Button SMD",
    category: "Button",
    description: "Miniature SMD tactile switch, 3x4mm",
    manufacturer: "C&K",
    partNumber: "PTS526",
    value: "Button",
    packageName: "TACTILE_SWITCH",
    footprintName: "TACTILE_SWITCH",
    symbolName: "button",
    electrical: { operatingVoltageMax: 12.0, currentMaxMa: 50 },
    pins: [
      { number: "1", name: "A1", electricalType: "Passive", required: true },
      { number: "2", name: "A2", electricalType: "Passive", required: true },
      { number: "3", name: "B1", electricalType: "Passive", required: false },
      { number: "4", name: "B2", electricalType: "Passive", required: false }
    ],
    tags: ["switch", "button", "tactile", "user-input"],
    defaultQuantity: 1
  },
  {
    libraryId: "antenna-chip",
    name: "2.4GHz Chip Antenna",
    category: "RF",
    description: "SMD Ceramic Chip Antenna for BLE/WiFi",
    manufacturer: "Johanson Technology",
    partNumber: "2450AT18A100E",
    value: "2.4G Antenna",
    packageName: "CHIP_ANTENNA",
    footprintName: "CHIP_ANTENNA",
    symbolName: "antenna",
    electrical: { frequencyHz: 2.45e9 },
    pins: [
      { number: "1", name: "FEED", electricalType: "RF", required: true, defaultNetName: "RF_ANT" },
      { number: "2", name: "NC", electricalType: "No Connect", required: false }
    ],
    tags: ["rf", "antenna", "ble", "wifi", "2.4g"],
    defaultQuantity: 1
  },
  {
    libraryId: "battery-pads",
    name: "Battery Solder Pads",
    category: "Battery",
    description: "Direct wire solder contact pads for battery connection",
    value: "BATTERY_P",
    packageName: "BATTERY_PAD",
    footprintName: "BATTERY_PAD",
    symbolName: "battery",
    electrical: { typicalVoltage: 3.7 },
    pins: [
      { number: "1", name: "VBAT", electricalType: "Power Output", required: true, defaultNetName: "VBAT" },
      { number: "2", name: "GND", electricalType: "Ground", required: true, defaultNetName: "GND" }
    ],
    tags: ["battery", "power", "pads"],
    defaultQuantity: 1
  },
  {
    libraryId: "generic-custom-ic",
    name: "Generic Custom IC 8-Pin",
    category: "Custom",
    description: "Generic 8-pin custom integrated circuit",
    value: "Custom IC",
    packageName: "SOIC_8",
    footprintName: "SOIC_8",
    symbolName: "MCU",
    electrical: {},
    pins: [
      { number: "1", name: "PIN1", electricalType: "Passive", required: false },
      { number: "2", name: "PIN2", electricalType: "Passive", required: false },
      { number: "3", name: "PIN3", electricalType: "Passive", required: false },
      { number: "4", name: "GND", electricalType: "Ground", required: false, defaultNetName: "GND" },
      { number: "5", name: "PIN5", electricalType: "Passive", required: false },
      { number: "6", name: "PIN6", electricalType: "Passive", required: false },
      { number: "7", name: "PIN7", electricalType: "Passive", required: false },
      { number: "8", name: "VCC", electricalType: "Power Input", required: false, defaultNetName: "3V3" }
    ],
    tags: ["custom", "ic", "soic8"],
    defaultQuantity: 1
  }
];
