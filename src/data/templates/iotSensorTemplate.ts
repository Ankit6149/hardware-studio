import { Project } from '../../types';

export const iotSensorTemplate: Project = {
  id: "iot-sensor",
  projectName: "IoT Weather Station Node",
  description: "An environmental logging node with ESP32, temperature/humidity sensor, battery charger, and low power buck converter.",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  templateName: "IoT Sensor Node",
  version: "1.0",
  activeView: "master",
  nodes: [
    {
      id: "iot-mcu",
      type: "blockNode",
      position: { x: 300, y: 150 },
      data: {
        name: "ESP32-WROOM MCU Module",
        category: "Electronics",
        status: "MVP",
        description: "Powerful MCU with integrated Wi-Fi and Bluetooth connectivity, ideal for telemetry reporting.",
        purpose: "Orchestrates sensor collection, connects to local AP, and pushes telemetry over HTTP/MQTT.",
        requirements: "Wi-Fi coverage, 3.3V power supply (up to 240mA peak).",
        candidateComponents: "Espressif ESP32-WROOM-32E",
        risks: "High current consumption during WiFi connection startup.",
        notes: "Must place sufficient bulk capacitors to prevent brownouts.",
        testingNotes: "Measure transient current peaks during WiFi connect loop.",
        views: ["master", "electronics", "power"],
        positions: {
          master: { x: 300, y: 150 },
          electronics: { x: 300, y: 150 },
          power: { x: 300, y: 150 }
        }
      }
    },
    {
      id: "iot-sensor",
      type: "blockNode",
      position: { x: 100, y: 150 },
      data: {
        name: "DHT22 Temp/Humidity Sensor",
        category: "Electronics",
        status: "MVP",
        description: "Capacitive humidity and temperature sensor with calibrated digital output signal.",
        purpose: "Measures ambient environmental conditions.",
        requirements: "GPIO line with 1-wire interface protocol, pull-up resistor.",
        candidateComponents: "Aosong DHT22 / AM2302",
        risks: "Accuracy detuning under direct sun exposure, condensation on grid.",
        notes: "Place sensor in vented casing area.",
        testingNotes: "Verify reading accuracy against reference thermometer.",
        views: ["master", "electronics", "outer"],
        positions: {
          master: { x: 100, y: 150 },
          electronics: { x: 100, y: 150 },
          outer: { x: 100, y: 150 }
        }
      }
    },
    {
      id: "iot-buck",
      type: "blockNode",
      position: { x: 300, y: 320 },
      data: {
        name: "3.3V Step-Down Buck Converter",
        category: "Power",
        status: "MVP",
        description: "Efficient buck switching regulator converting battery voltages down to 3.3V.",
        purpose: "Supplies regulated operating power efficiently, minimizing heat.",
        requirements: "Input voltage 3.6V-5.5V, output 3.3V at up to 500mA.",
        candidateComponents: "Diodes Inc AP63203",
        risks: "High frequency switching noise detuning Wi-Fi antenna performance.",
        notes: "Keep inductor layout tight to contain EMF noise.",
        testingNotes: "Check ripple voltage under 300mA dummy load.",
        views: ["master", "power"],
        positions: {
          master: { x: 300, y: 320 },
          power: { x: 300, y: 320 }
        }
      }
    }
  ],
  edges: [
    { id: "e-sens-esp", source: "iot-sensor", target: "iot-mcu", views: ["master", "electronics"] },
    { id: "e-buck-esp", source: "iot-buck", target: "iot-mcu", views: ["master", "power"] }
  ],
  bom: [
    {
      id: "b-esp32",
      blockName: "ESP32-WROOM MCU Module",
      candidateComponent: "Espressif ESP32-WROOM-32E",
      partNumber: "ESP32-WROOM-32E-N4",
      stage: "Prototype",
      quantity: 1,
      voltage: "3.3V",
      currentEstimate: "120mA active",
      interface: "GPIO/WiFi",
      packageSize: "SMD module",
      dimensions: "18.0 x 25.5 mm",
      costEstimate: "2.80",
      supplier: "DigiKey",
      supplierUrl: "https://www.digikey.com",
      datasheetUrl: "https://www.espressif.com",
      status: "Not Started",
      risk: "Heavy power peaks may trigger brownout triggers.",
      alternative: "ESP32-C3-WROOM",
      notes: "Pre-certified module cuts down on RF regulatory test costs."
    }
  ],
  testing: [
    {
      id: "t-1",
      name: "Wifi connection power spike check",
      goal: "Measure brownout safety margins under active RF connection.",
      partsNeeded: "ESP32 PCB, power analyzer",
      steps: "1. Force ESP32 to connect to local AP in loop\n2. Monitor 3.3V rail dips on oscilloscope\n3. Confirm drop stays above 3.0V.",
      passCriteria: "Min rail voltage remains above 3.12V during WiFi startup burst.",
      risks: "ESP32 enters continuous bootloop state.",
      status: "Not Started",
      notes: "Requires 100uF bypass capacitor on 3.3V rail.",
      category: "Electrical",
      linkedBlocks: ["iot-mcu"],
      resultNotes: "",
      evidenceLink: ""
    }
  ],
  powerBudget: [
    {
      id: "pwr-mcu",
      blockName: "ESP32-WROOM MCU Module",
      voltage: "3.3",
      activeCurrentMa: 150.0,
      sleepCurrentUa: 15.0,
      dutyCyclePercent: 1.5,
      quantity: 1,
      notes: "Wakes up for 2 seconds every 2 minutes to report sensor readings over Wifi."
    },
    {
      id: "pwr-sensor",
      blockName: "DHT22 Temp/Humidity Sensor",
      voltage: "3.3",
      activeCurrentMa: 1.5,
      sleepCurrentUa: 40.0,
      dutyCyclePercent: 2,
      quantity: 1,
      notes: "Reads temperature data once before transmission."
    }
  ],
  pinMap: [
    {
      id: "pin-1",
      signalName: "DHT_DATA",
      connectedBlock: "iot-sensor",
      mcuPin: "GPIO_15",
      direction: "Bidirectional",
      protocol: "GPIO",
      voltage: "3.3V",
      notes: "1-wire digital signal line. Requires external 4.7k pull-up resistor."
    }
  ],
  firmwareTasks: [
    {
      id: "f-task-1",
      name: "WiFi telemetry MQTT publish client",
      type: "Integration",
      linkedBlock: "iot-mcu",
      priority: "MVP",
      status: "Not Started",
      description: "Initialize WiFi stack, connect to AP, connect to MQTT broker, publish payload, disconnect and enter deep sleep.",
      acceptanceCriteria: "Log confirmation from target MQTT broker showing telemetry packet arrived.",
      notes: "Must implement fallback retry timeouts to prevent battery drain on weak WiFi."
    }
  ],
  batteryCapacityMah: 1000
};
