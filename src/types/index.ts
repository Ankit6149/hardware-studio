import { Node, Edge } from '@xyflow/react';
import type { BlueprintPack, BlueprintPackStatusType } from '../lib/blueprintSheetTypes';
import type { ElectronicComponentDefinition } from '../lib/components/componentLibrary';

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
  componentId?: string;
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

  // Phase 21 expansion
  stage?: 'EVT' | 'DVT' | 'PVT' | 'Factory QA';
  linkedRequirementIds?: string[];
  linkedComponentIds?: string[];
  linkedNetIds?: string[];
  linkedFirmwareModuleIds?: string[];
  evidence?: string;
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
  boardType: 'Main PCB' | 'Flex PCB' | 'Rigid PCB' | 'Rigid-Flex' | 'Daughterboard' | 'Charging Board' | 'Sensor Board' | 'Debug Board' | 'Rigid' | string;
  linkedProductArea?: string;
  purpose?: string;
  dimensionsMm?: string;
  layerCount?: number;
  substrate?: 'FR4' | 'Polyimide Flex' | 'Rigid-Flex' | 'Ceramic' | 'Other' | string;
  placement?: 'Internal' | 'Outer' | 'Dock' | 'Strap' | 'Ring Arc' | 'Unknown' | string;
  mountingNotes?: string;
  connectorNotes?: string;
  thermalNotes?: string;
  rfNotes?: string;
  status?: 'Concept' | 'Planned' | 'In Layout' | 'Reviewed' | 'Ready for ECAD' | 'Draft' | string;
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

export interface ProjectComponentPin {
  id: string;
  componentId: string;
  pinNumber: string;
  pinName: string;
  electricalType: string;
  netId?: string;
  netName?: string;
  noConnect?: boolean;
  required?: boolean;
}

export interface BoardComponent {
  id: string;
  boardId: string;
  circuitBlockId?: string;
  referenceDesignator: string;
  componentName: string;
  componentType: string;
  value: string;
  packageName: string;
  footprint: string;
  partNumber: string;
  quantity?: number;
  side?: 'Top' | 'Bottom' | 'Both' | 'Unknown';
  placementCriticality: 'Low' | 'Medium' | 'High' | 'RF Critical' | 'Thermal Critical';
  datasheetUrl?: string;
  supplier?: string;
  notes: string;
  placementX?: number;
  placementY?: number;
  rotationDeg?: number;
  lockedPlacement?: boolean;
  placementStatus?: 'Unplaced' | 'Placed' | 'Locked' | 'Needs Review' | 'Outside Board' | 'Missing Footprint' | 'Verified';

  // Phase 4 nested data models
  libraryId?: string;
  pins?: ProjectComponentPin[];
  architectureNodeId?: string;
  bomItemId?: string;
  manufacturer?: string;
  status?: 'Draft' | 'Selected' | 'Needs Review' | 'Verified' | 'Concept' | 'In Progress' | 'Complete';
  schematic?: {
    placed: boolean;
    x?: number;
    y?: number;
    rotation?: number;
    unit?: string;
    locked?: boolean;
  };
  pcb?: {
    placed: boolean;
    xMm?: number;
    yMm?: number;
    rotationDeg?: number;
    side: 'Top' | 'Bottom';
    locked: boolean;
    placementStatus: 'Unplaced' | 'Placed' | 'Locked' | 'Needs Review' | 'Outside Board' | 'Missing Footprint' | 'Verified';
  };
  packageDimensions?: { widthMm: number; heightMm: number; heightZMm: number };
}

export type ProjectElectronicComponent = BoardComponent;

export interface CustomComponentDefinition {
  id: string;
  name: string;
  category: string;
  manufacturer?: string;
  partNumber?: string;
  description?: string;
  datasheetUrl?: string;
  symbol?: {
    symbolType: string;
    pins: { pinNum: string; label: string; direction: string }[];
  };
  footprint?: {
    footprintName: string;
    widthMm: number;
    heightMm: number;
    padCount: number;
  };
  package3d?: {
    widthMm: number;
    heightMm: number;
    depthMm: number;
  };
  pins?: ProjectComponentPin[];
  electricalProperties?: Record<string, string | number>;
  mechanicalProperties?: Record<string, string | number>;
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

export interface MechanicalZone {
  id: string;
  name: string;
  zoneType: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  material: string;
  dimensionNote: string;
  linkedBoardId?: string;
  linkedComponentId?: string;
  notes: string;
  warnings?: string[];
}

export interface AssemblyLayer {
  id: string;
  name: string;
  order: number;
  layerType: string;
  material: string;
  fasteningMethod: string;
  inspectionNote: string;
  linkedObjects?: string[];
  notes: string;
}

export interface SchematicSymbol {
  id: string;
  circuitId?: string;
  componentId?: string;
  symbolType: string;
  referenceDesignator?: string;
  label?: string;
  x?: number;
  y?: number;
  pins?: { pinNum: string; label: string; direction: string; netId?: string }[];
  rotation?: number;
  notes?: string;
}

export interface SchematicConnection {
  id: string;
  sourceSymbolId: string;
  sourcePin?: string;
  targetSymbolId: string;
  targetPin?: string;
  netId?: string;
  label?: string;
  connectionType?: string;
}

export interface SchematicPinAnchor {
  type: 'pin';
  componentId: string;
  pinNumber: string;
}

export interface SchematicPointAnchor {
  type: 'junction' | 'label' | 'dangling';
  objectId?: string;
  x?: number;
  y?: number;
}

export interface SchematicWire {
  id: string;
  netId: string;
  netName: string;
  points: { x: number; y: number }[];
  sourcePinId?: string;
  targetPinId?: string;
  sourceAnchor?: SchematicPinAnchor | SchematicPointAnchor;
  targetAnchor?: SchematicPinAnchor | SchematicPointAnchor;
  junctionIds?: string[];
  status?: 'Connected' | 'Dangling' | 'Needs Review';
}


export interface MechanicalBody {
  id: string;
  name?: string;
  objectType?: string;
  xMm?: number;
  yMm?: number;
  zMm?: number;
  widthMm?: number;
  heightMm?: number;
  depthMm?: number;
  color?: string;
  transparent?: boolean;
  opacity?: number;
  sourceProfileId?: string;
  operation?: 'Extrude' | 'Box' | 'Cylinder';
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  dimensions?: { x: number; y: number; z: number };
  linkedMechanicalObjectIds?: string[];
  linkedBoardIds?: string[];
  linkedComponentIds?: string[];
}

export interface PcbLayer {
  id: string;
  boardId: string;
  name: string;
  type: 'Copper' | 'Prepreg' | 'Core' | 'Silkscreen' | 'SolderMask';
  order: number;
  copper?: boolean;
  thicknessUm?: number;
  visible?: boolean;
  colorLabel?: string;
}

export interface BoardOutline {
  id: string;
  boardId: string;
  points?: { x: number; y: number }[];
  width?: number;
  height?: number;
  units?: 'mm' | 'mil';
  cornerRadius?: number;
  notes?: string;
}

export interface CopperShape {
  id: string;
  boardId: string;
  layerId?: string;
  netId?: string;
  shapeType?: 'Polygon' | 'Rectangle' | 'Circle';
  points?: { x: number; y: number }[];
  width?: number;
  clearance?: number;
  notes?: string;
}

export type PCBAnchor =
  | { type: 'pad'; componentId: string; padNumber: string }
  | { type: 'via'; viaId: string }
  | { type: 'trace-end'; traceId: string; endpoint: 'start' | 'end' }
  | { type: 'dangling'; xMm: number; yMm: number };

export interface Trace {
  id: string;
  boardId: string;
  layerId?: string;
  netId?: string;
  netName?: string;
  points?: { x: number; y: number }[];
  width?: number;
  viaIds?: string[];
  sourceAnchor?: PCBAnchor;
  targetAnchor?: PCBAnchor;
  locked?: boolean;
  lengthEstimate?: number;
  impedanceNote?: string;
  status?: 'Draft' | 'Routed' | 'Needs Review' | 'Verified';
}

export interface PadNetAssignment {
  id: string;
  componentId: string;
  referenceDesignator: string;
  padName: string;
  netName: string;
}

export interface FirmwareConfiguration {
  environmentName: string;
  platform: string;
  board: string;
  framework: string;
  buildFlags: string[];
  libraryDependencies: string[];
  uploadPort?: string;
  monitorSpeed?: number;
}

export interface FirmwareSourceFile {
  id: string;
  path: string;
  name?: string;
  language: 'C' | 'C++' | 'INI' | 'JSON' | 'Markdown' | 'c' | 'cpp' | 'ini' | 'json' | 'markdown' | 'text';
  content: string;
  generated?: boolean;
  isGenerated?: boolean;
  dirty?: boolean;
  linkedModuleIds?: string[];
}

export interface ValidationRun {
  id: string;
  testId: string;
  runNumber?: number;
  testName?: string;
  timestamp?: string;
  status: 'Pass' | 'Fail' | 'Inconclusive' | 'Passed' | 'Failed' | 'In Progress' | 'Needs Review';
  measuredValue?: number | string;
  passCriteria?: string;
  stepResults?: any[];
  logs: string[];
  runBy?: string;
  operator?: string;
  environment?: string;
}

export type MCPProposal = Record<string, any>;
export type MCPAuditRecord = Record<string, any>;

export interface KeepoutZone {
  id: string;
  boardId: string;
  zoneName?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  xMm?: number;
  yMm?: number;
  widthMm?: number;
  heightMm?: number;
  restrictTraces?: boolean;
  restrictVias?: boolean;
  shape?: 'rect' | 'polygon';
  points?: { x: number; y: number }[];
  layerScope?: 'All' | 'Top' | 'Bottom';
  reason?: string;
  notes?: string;
}

export interface Via {
  id: string;
  boardId: string;
  layerId?: string;
  x?: number;
  y?: number;
  xMm?: number;
  yMm?: number;
  padDiameterMm?: number;
  drillDiameterMm?: number;
  netName?: string;
  drillDiameter?: number;
  outerDiameter?: number;
  netId?: string;
  fromLayer?: string;
  toLayer?: string;
}

export interface DrillHole {
  id: string;
  boardId: string;
  x?: number;
  y?: number;
  xMm?: number;
  yMm?: number;
  diameterMm?: number;
  plated?: boolean;
  holeType?: string;
  diameter?: number;
  purpose?: string;
}

export interface PcbRule {
  id: string;
  boardId: string;
  ruleType: string;
  value?: string;
  unit?: string;
  severity?: 'Info' | 'Warning' | 'Critical';
  description?: string;
}

export interface ReviewResult {
  id: string;
  category: string;
  severity: 'Info' | 'Warning' | 'Error' | 'Blocker';
  title: string;
  description: string;
  linkedObjectType: string;
  linkedObjectId: string;
  suggestedFix: string;
  autoFixAvailable?: boolean;
  status: 'Open' | 'Fixed' | 'Waived';
}

export interface ProductRevision {
  id: string;
  name: string;
  parentRevisionId?: string;
  branchName: string;
  createdAt: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  projectSnapshot?: any;
  status: 'Working' | 'Named Version' | 'Release Candidate' | 'Released' | 'Superseded';
  releaseArtifacts?: {
    blueprintPackVersion?: string;
    manufacturingPackageId?: string;
    approvalSignoff?: string;
  };
}

export interface Project {
  id: string;
  projectName: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  templateName?: string;
  version: string;
  schemaVersion?: number;
  productVersion?: string;
  revisions?: ProductRevision[];
  branches?: ProductRevision[];
  releaseCandidates?: ProductRevision[];
  releases?: ProductRevision[];
  activeBranch?: string;
  isFrozen?: boolean;
  activeView: string;
  nodes: CustomNode[];
  edges: CustomEdge[];
  bom: BOMItem[];
  testing: TestStage[];
  powerBudget: PowerBudgetItem[];
  pinMap: PinMapItem[];
  firmwareTasks: FirmwareTask[];
  batteryCapacityMah?: number;
  
  activeBoardId?: string;
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
  factoryPackageStatus?: 'Draft' | 'Generated' | 'Needs Review' | 'Verified' | 'Blocked';
  factoryReviewChecks?: Record<string, boolean>;
  factoryFiles?: {
    gerberZip?: FactoryFileStatus;
    drillFiles?: FactoryFileStatus;
    schematicPdf?: FactoryFileStatus;
    boardDrawing?: FactoryFileStatus;
    enclosureDrawing?: FactoryFileStatus;
    stepFile?: FactoryFileStatus;
    stlFile?: FactoryFileStatus;
    cplCsv?: FactoryFileStatus;
    bomCsv?: FactoryFileStatus;
    dfmReport?: FactoryFileStatus;
    dftReport?: FactoryFileStatus;
    firmwareHex?: FactoryFileStatus;
    flashingGuide?: FactoryFileStatus;
  };
  
  // V3 models
  productType?: string;
  targetUse?: string;
  mechanicalZones?: MechanicalZone[];
  assemblyLayers?: AssemblyLayer[];
  schematicSymbols?: SchematicSymbol[];
  schematicConnections?: SchematicConnection[];
  schematicWires?: SchematicWire[];
  pcbLayers?: PcbLayer[];
  copperShapes?: CopperShape[];
  traces?: Trace[];
  vias?: Via[];
  drillHoles?: DrillHole[];
  boardOutlines?: BoardOutline[];
  pcbRules?: PcbRule[];
  reviewResults?: ReviewResult[];
  exportHistory?: string[];
  padNetAssignments?: PadNetAssignment[];
  customComponentLibrary?: ElectronicComponentDefinition[];
  keepoutZones?: KeepoutZone[];

  // Shared Product Graph
  requirements?: ProductRequirement[];
  architectureNodes?: ProductArchitectureNode[];
  architectureConnections?: ProductArchitectureConnection[];
  mechanicalObjects?: MechanicalObject[];
  mechanicalDimensions?: MechanicalDimension[];
  mechanicalBodies?: MechanicalBody[];
  firmwareModules?: FirmwareModule[];
  firmwareStates?: FirmwareState[];
  firmwareTransitions?: FirmwareTransition[];
  firmwareConfiguration?: FirmwareConfiguration;
  firmwareSourceFiles?: FirmwareSourceFile[];
  firmwareBuildRecords?: any[];
  validationTests?: ValidationTest[];
  validationRuns?: ValidationRun[];
  mcpProposals?: any[];
  mcpAuditRecords?: any[];

  // Blueprint Generation System
  blueprintPack?: BlueprintPack;
  blueprintPackStatus?: BlueprintPackStatusType;
  blueprintPackGeneratedAt?: string;
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
  status: "Not Generated" | "Conceptual" | "Generated In App" | "Needs Final Review" | "Verified";
  notes?: string;
  source?: "Hardware Studio" | "KiCad" | "Altium" | "EasyEDA" | "Fusion" | "Onshape" | "SolidWorks" | "External";
  fileName?: string;
  lastUpdated?: string;
  key?: string;
  label?: string;
  generatedBy?: string;
  requiresReview?: boolean;
};

// ----------------------------------------------------
// SHARED PRODUCT GRAPH TYPINGS
// ----------------------------------------------------

export interface ProductRequirement {
  id: string;
  title: string;
  description: string;
  type: "Functional" | "Electrical" | "Mechanical" | "Firmware" | "Safety" | "Manufacturing" | "Validation";
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "Draft" | "Approved" | "Implemented" | "Verified";
  source?: string;
  acceptanceCriteria: string[];
  linkedArchitectureNodeIds: string[];
  linkedComponentIds: string[];
  linkedFirmwareModuleIds: string[];
  linkedTestIds: string[];
  risks: string[];
  notes?: string;
}

export interface ProductArchitectureNode {
  id: string;
  name: string;
  category: "Input" | "Processing" | "Power" | "Communication" | "Feedback" | "Mechanical" | "Firmware" | "Safety" | "Manufacturing";
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  linkedRequirementIds: string[];
  linkedCircuitIds: string[];
  linkedComponentIds: string[];
  linkedFirmwareModuleIds: string[];
  linkedTestIds: string[];
  status: "MVP" | "Later" | "Future";
}

export interface ProductArchitectureConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  name?: string;
  type: "Data" | "Power" | "Control" | "Mechanical" | "Wireless" | "Firmware" | "Safety";
  protocol?: string;
  voltage?: number;
  direction: "Forward" | "Bidirectional";
  notes?: string;
}

export interface MechanicalObject {
  id: string;
  name: string;
  type: "Outer Profile" | "Inner Profile" | "Board Zone" | "Battery Cavity" | "Connector Opening" | "Button Opening" | "Sensor Window" | "Mounting Point" | "Antenna Keepout" | "Thermal Zone" | "Seal Zone" | "Flex Bend Zone" | "Mechanical Keepout" | "Annotation";
  shape: "rect" | "circle" | "ellipse" | "polygon";
  xMm: number;
  yMm: number;
  widthMm?: number;
  heightMm?: number;
  depthMm?: number;
  radiusMm?: number;
  layer?: string;
  points?: { x: number; y: number }[];
  rotationDeg: number;
  material?: string;
  clearanceMm?: number;
  linkedBoardId?: string;
  linkedComponentIds?: string[];
  locked: boolean;
  visible: boolean;
  notes?: string;
}

export interface MechanicalDimension {
  id: string;
  name: string;
  from: { xMm: number; yMm: number };
  to: { xMm: number; yMm: number };
  valueMm: number;
  tolerancePlusMm?: number;
  toleranceMinusMm?: number;
  linkedObjectIds: string[];
  notes?: string;
}

export interface FirmwareModule {
  id: string;
  name: string;
  type: "Driver" | "Service" | "Communication" | "Power" | "Safety" | "Application" | "Test";
  description: string;
  linkedArchitectureNodeIds: string[];
  linkedComponentIds: string[];
  linkedPinIds: string[];
  linkedNetIds: string[];
  linkedTestIds: string[];
  dependencies: string[];
  sourceFiles?: (FirmwareSourceFile | string)[];
  status?: "Draft" | "Implemented" | "Needs Review" | "Verified";
}

export interface FirmwareState {
  id: string;
  name: string;
  type: "Initial" | "Normal" | "Power" | "Charging" | "Fault" | "Debug" | "Final";
  x: number;
  y: number;
  description?: string;
  entryActions: string[];
  exitActions: string[];
  linkedModuleIds: string[];
  linkedComponentIds: string[];
}

export interface FirmwareTransition {
  id: string;
  sourceStateId: string;
  targetStateId: string;
  event: string;
  condition?: string;
  action?: string;
  priority?: number;
}

export interface ValidationTestStep {
  stepNumber: number;
  instruction: string;
  expectedResult: string;
  completed: boolean;
}

export interface ValidationMeasurement {
  id: string;
  name: string;
  type: "Numeric" | "Boolean" | "Text" | "Visual Inspection";
  expectedValue?: number | string | boolean;
  actualValue?: number | string | boolean;
  unit?: string;
  tolerancePlus?: number;
  toleranceMinus?: number;
  minValue?: number;
  maxValue?: number;
  required: boolean;
  status: "Untested" | "Pass" | "Fail" | "Needs Review";
}

export interface ValidationEvidence {
  id: string;
  type: "Text" | "URL" | "Measurement" | "Photo Reference" | "File Reference";
  value: string;
  createdAt: string;
  notes?: string;
}

export interface ValidationTest {
  id: string;
  name: string;
  testName?: string;
  stage?: "EVT" | "DVT" | "PVT" | "Factory QA";
  category?: "Requirement" | "Mechanical" | "Electrical" | "Power" | "RF" | "Firmware" | "Thermal" | "Environmental" | "Manufacturing" | "DRC" | string;
  linkedRequirementIds: string[];
  linkedArchitectureNodeIds?: string[];
  linkedComponentIds?: string[];
  linkedNetIds?: string[];
  linkedFirmwareModuleIds?: string[];
  steps: ValidationTestStep[];
  measurements: ValidationMeasurement[];
  passCriteria: string[];
  status?: "Not Started" | "In Progress" | "Passed" | "Failed" | "Blocked" | "Untested" | string;
  evidence: ValidationEvidence[];
  resultNotes?: string;
}

export interface EngineeringCommand<TBefore = unknown, TAfter = unknown> {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  affectedDomains: string[];
  affectedObjectIds: string[];
  before: TBefore;
  after: TAfter;
}
