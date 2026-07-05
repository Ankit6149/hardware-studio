import { Node, Edge } from '@xyflow/react';

export type NodeData = {
  name: string;
  category: string;
  status: 'MVP' | 'Later' | 'Future' | 'External' | 'Risk' | 'Complete';
  description: string;
  purpose: string;
  requirements: string;
  candidateComponents: string;
  risks: string;
  notes: string;
  testingNotes: string;
  views: string[]; // e.g. ["master", "electronics", "power", "firmware", "system-alpha", "internal", "outer", "pin-map", "power-budget", "firmware-plan", "readiness"]
  positions?: Record<string, { x: number; y: number }>;
  
  // Feature 5 Expansion
  mitigation?: string;
  openQuestions?: string;
  electricalNotes?: string;
  mechanicalNotes?: string;
  firmwareNotes?: string;
  tags?: string[];
  datasheetUrl?: string;
  supplierUrl?: string;
  priority?: 'High' | 'Medium' | 'Low';
};

export type CustomNode = Node<NodeData>;

export type CustomEdge = Edge & {
  views?: string[];
  label?: string; // Feature 3: Edge label editing
};

export interface BOMItem {
  id: string;
  blockName: string;
  candidateComponent: string;
  partNumber?: string;
  stage: 'Prototype' | 'EVT' | 'DVT' | 'PVT' | 'Production' | 'Future';
  quantity?: number;
  voltage?: string;
  currentEstimate?: string;
  interface?: string;
  packageSize?: string;
  dimensions?: string;
  costEstimate?: string;
  supplier?: string;
  supplierUrl?: string;
  datasheetUrl?: string;
  status: 'Not Started' | 'Sourced' | 'Ordered' | 'Received' | 'Tested' | 'Rejected';
  risk?: string;
  alternative?: string;
  notes?: string;
  sizeNotes?: string;
}

export interface TestStage {
  id: string;
  name: string;
  goal: string;
  partsNeeded: string;
  steps: string;
  passCriteria: string;
  risks: string;
  status: 'Not Started' | 'In Progress' | 'Passed' | 'Failed' | 'Blocked';
  notes: string;
  
  // Feature 10 Expansion
  category?: string;
  linkedBlocks?: string[];
  resultNotes?: string;
  evidenceLink?: string;
  order?: number;
}

export interface PowerBudgetItem {
  id: string;
  blockName: string;
  voltage: string;
  activeCurrentMa: number;
  sleepCurrentUa: number;
  dutyCyclePercent: number; // 0 - 100
  quantity: number;
  notes: string;
}

export interface PinMapItem {
  id: string;
  signalName: string;
  connectedBlock: string;
  mcuPin: string;
  direction: 'Input' | 'Output' | 'Bidirectional' | 'Power' | 'Ground';
  protocol: 'GPIO' | 'I2C' | 'SPI' | 'UART' | 'PWM' | 'ADC' | 'Touch' | 'Power' | 'Ground';
  voltage: string;
  notes: string;
}

export interface FirmwareTask {
  id: string;
  name: string;
  type: 'State' | 'Driver' | 'BLE' | 'Power' | 'Safety' | 'Test' | 'Integration';
  linkedBlock: string; // Node ID
  priority: 'MVP' | 'Later' | 'Future';
  status: 'Not Started' | 'In Progress' | 'Done' | 'Blocked';
  description: string;
  acceptanceCriteria: string;
  notes: string;
}

export interface BoardItem {
  id: string;
  name: string;
  boardType: 'Main PCB' | 'Flex PCB' | 'Rigid PCB' | 'Rigid-Flex' | 'Daughterboard' | 'Charging Board' | 'Sensor Board' | 'Debug Board';
  linkedProductArea?: string;
  purpose: string;
  dimensionsMm: string;
  layerCount: number;
  substrate: 'FR4' | 'Polyimide Flex' | 'Rigid-Flex' | 'Ceramic' | 'Other';
  placement: 'Internal' | 'Outer' | 'Dock' | 'Strap' | 'Ring Arc' | 'Unknown';
  mountingNotes: string;
  connectorNotes: string;
  thermalNotes: string;
  rfNotes: string;
  status: 'Concept' | 'Planned' | 'In Layout' | 'Reviewed' | 'Ready for ECAD';
}

export interface CircuitBlock {
  id: string;
  name: string;
  circuitType: 'MCU' | 'Power' | 'Charger' | 'Sensor' | 'Haptic' | 'LED' | 'RF' | 'Debug' | 'Protection' | 'Connector' | 'Passive Network';
  boardId: string;
  linkedBlueprintBlock?: string;
  description: string;
  requiredComponents: string;
  referenceDesignators: string;
  powerNets: string;
  signalNets: string;
  interfaceType: string;
  datasheetNotes: string;
  designNotes: string;
  risks: string;
  status: 'Concept' | 'In Progress' | 'Complete' | 'Needs Review';
}

export interface BoardComponent {
  id: string;
  boardId: string;
  circuitBlockId: string;
  referenceDesignator: string;
  componentName: string;
  componentType: string;
  value: string;
  packageName: string;
  footprint: string;
  partNumber: string;
  quantity: number;
  side: 'Top' | 'Bottom' | 'Both' | 'Unknown';
  placementCriticality: 'Low' | 'Medium' | 'High' | 'RF Critical' | 'Thermal Critical';
  datasheetUrl?: string;
  supplier?: string;
  notes: string;
  placementX?: number;
  placementY?: number;
  rotationDeg?: number;
  lockedPlacement?: boolean;
}

export interface NetItem {
  id: string;
  netName: string;
  netType: 'Power' | 'Ground' | 'Signal' | 'Clock' | 'RF' | 'Differential' | 'Analog' | 'Digital' | 'Programming';
  voltage: string;
  sourceComponent: string;
  sourcePin: string;
  targetComponent: string;
  targetPin: string;
  protocol: string;
  currentEstimate: string;
  impedanceRequirement: string;
  notes: string;
}

export interface PCBConstraint {
  id: string;
  boardId: string;
  constraintType: 'Board Outline' | 'Layer Stack' | 'Trace Width' | 'Clearance' | 'Via' | 'RF Keepout' | 'Antenna' | 'Battery' | 'Thermal' | 'Flex Bend' | 'Mounting' | 'Test Point' | 'Connector' | 'Silkscreen';
  value: string;
  unit: string;
  description: string;
  severity: 'Info' | 'Warning' | 'Critical';
}

export interface ManufacturingChecklistItem {
  id: string;
  category: 'Schematic' | 'PCB Layout' | 'BOM' | 'Assembly' | 'Testing' | 'Compliance' | 'Mechanical' | 'Export';
  item: string;
  status: 'Not Started' | 'In Progress' | 'Done' | 'Blocked';
  ownerNotes: string;
  blockingReason?: string;
}

export interface Project {
  id: string;
  projectName: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  templateName?: string;
  version: string;
  activeView: string;
  nodes: CustomNode[];
  edges: CustomEdge[];
  bom: BOMItem[];
  testing: TestStage[];
  powerBudget: PowerBudgetItem[];
  pinMap: PinMapItem[];
  firmwareTasks: FirmwareTask[];
  batteryCapacityMah?: number;
  
  // Board Studio extensions
  boards?: BoardItem[];
  circuitBlocks?: CircuitBlock[];
  boardComponents?: BoardComponent[];
  nets?: NetItem[];
  pcbConstraints?: PCBConstraint[];
  manufacturingChecklist?: ManufacturingChecklistItem[];
  editorLayouts?: {
    product?: EditorObject[];
    mechanical?: EditorObject[];
    assembly?: EditorObject[];
    board?: EditorObject[];
    components?: EditorObject[];
    circuits?: EditorObject[];
    nets?: EditorObject[];
    power?: EditorObject[];
    pins?: EditorObject[];
    firmware?: EditorObject[];
    testing?: EditorObject[];
    handoff?: EditorObject[];
  };
  editorConnections?: EditorConnection[];
  factoryFiles?: {
    gerberZip?: FactoryFileStatus;
    drillFiles?: FactoryFileStatus;
    schematicPdf?: FactoryFileStatus;
    kicadProject?: FactoryFileStatus;
    altiumProject?: FactoryFileStatus;
    easyEdaProject?: FactoryFileStatus;
    stepFile?: FactoryFileStatus;
    stlFile?: FactoryFileStatus;
    cplCsv?: FactoryFileStatus;
    bomCsv?: FactoryFileStatus;
    dfmReport?: FactoryFileStatus;
    dftReport?: FactoryFileStatus;
    firmwareHex?: FactoryFileStatus;
    flashingGuide?: FactoryFileStatus;
  };
}

export type EditorMode =
  | "product"
  | "mechanical"
  | "assembly"
  | "board"
  | "components"
  | "circuits"
  | "nets"
  | "power"
  | "pins"
  | "firmware"
  | "testing"
  | "handoff";

export type EditorObject = {
  id: string;
  mode: EditorMode;
  sourceType:
    | "node"
    | "board"
    | "component"
    | "circuit"
    | "net"
    | "power"
    | "pin"
    | "firmware"
    | "test"
    | "checklist"
    | "mechanical-zone"
    | "assembly-layer"
    | "factory-file"
    | "annotation"
    | "dimension"
    | "warning";
  sourceId?: string;
  label: string;
  kind: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  layer?: string;
  locked?: boolean;
  visible?: boolean;
  zIndex?: number;
  style?: {
    stroke?: string;
    fill?: string;
    lineStyle?: "solid" | "dashed" | "dotted";
  };
  metadata?: Record<string, string | number | boolean | null>;
};

export type EditorConnection = {
  id: string;
  mode: EditorMode;
  sourceObjectId: string;
  targetObjectId: string;
  label?: string;
  kind?: "signal" | "power" | "ground" | "mechanical" | "assembly" | "firmware" | "test" | "handoff";
  netId?: string;
  style?: Record<string, string>;
};

export type FactoryFileStatus = {
  status: "Not Generated" | "Conceptual" | "Needs External Tool" | "Uploaded" | "Verified";
  notes?: string;
  source?: "Hardware Studio" | "KiCad" | "Altium" | "EasyEDA" | "Fusion" | "Onshape" | "SolidWorks" | "External";
  fileName?: string;
  lastUpdated?: string;
};


