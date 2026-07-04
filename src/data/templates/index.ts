import { Project } from '../../types';
import { theRingTemplate } from './theRingTemplate';
import { genericWearableTemplate } from './genericWearableTemplate';
import { bleButtonTemplate } from './bleButtonTemplate';
import { iotSensorTemplate } from './iotSensorTemplate';
import { emptyTemplate } from './emptyTemplate';

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  includes: {
    blueprint: boolean;
    bom: boolean;
    tests: boolean;
    power: boolean;
    pins: boolean;
  };
  project: Project;
}

export const templates: TemplateMetadata[] = [
  {
    id: "the-ring",
    name: "The Ring",
    description: "System Alpha's signature wearable device. Advanced wearable design mapping tactile input, MCU, battery management, flex FPC routing, and companion software integrations.",
    difficulty: "Advanced",
    includes: { blueprint: true, bom: true, tests: true, power: true, pins: true },
    project: theRingTemplate
  },
  {
    id: "generic-wearable",
    name: "Generic Wearable",
    description: "A standard circular smartwatch/smartband framework using an nRF52840 MCU, PPG heart rate sensor, and OLED display.",
    difficulty: "Intermediate",
    includes: { blueprint: true, bom: true, tests: true, power: true, pins: true },
    project: genericWearableTemplate
  },
  {
    id: "ble-button",
    name: "BLE Button Device",
    description: "A low-power single button beacon device running directly on a CR2032 coin cell battery. Ideal beginner hardware concept.",
    difficulty: "Beginner",
    includes: { blueprint: true, bom: true, tests: true, power: true, pins: true },
    project: bleButtonTemplate
  },
  {
    id: "iot-sensor",
    name: "IoT Sensor Node",
    description: "An environmental telemetry monitor utilizing ESP32 WiFi module, DHT22 sensor, and buck switching regulators. Planned for battery power.",
    difficulty: "Intermediate",
    includes: { blueprint: true, bom: true, tests: true, power: true, pins: true },
    project: iotSensorTemplate
  },
  {
    id: "empty-project",
    name: "Empty Hardware Project",
    description: "Start with a clean slate. Create your own custom blocks, layout casing details, BOM entries, and testing procedures from scratch.",
    difficulty: "Beginner",
    includes: { blueprint: false, bom: false, tests: false, power: false, pins: false },
    project: emptyTemplate
  }
];

export const getTemplateById = (id: string): Project | undefined => {
  return templates.find(t => t.id === id)?.project;
};
