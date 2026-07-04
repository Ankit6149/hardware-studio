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
  batteryCapacityMah?: number; // Feature 7: battery capacity input
}

