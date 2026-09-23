import { create } from 'zustand';
import { 
  Project, 
  CustomNode, 
  CustomEdge, 
  BOMItem, 
  TestStage, 
  NodeData, 
  PowerBudgetItem, 
  PinMapItem, 
  FirmwareTask,
  BoardItem,
  CircuitBlock,
  BoardComponent,
  NetItem,
  PCBConstraint,
  ManufacturingChecklistItem,
  EditorMode,
  EditorObject,
  EditorConnection,
  FactoryFileStatus,
  MechanicalZone,
  AssemblyLayer,
  SchematicSymbol,
  SchematicConnection,
  Trace,
  Via,
  DrillHole,
  PcbRule,
  KeepoutZone,
  PadNetAssignment,
  SchematicWire,
  ProductRequirement,
  ProductArchitectureNode,
  ProductArchitectureConnection,
  MechanicalObject,
  MechanicalDimension,
  FirmwareModule,
  FirmwareState,
  FirmwareTransition,
  ValidationTest
} from '../types';
import { templates } from '../data/templates';
import {
  generateEditorLayouts,
  getInitialFactoryFiles
} from '../lib/editorLayoutGenerators';
import { ElectronicComponentDefinition } from '../lib/components/componentLibrary';
import { runDesignReview } from '../lib/designReview';
import { generateBlueprintPack as generateBlueprintPackFn } from '../lib/blueprintGenerator';
import {
  migrateProjectSchema,
  normalizeProjectComponent,
} from '../lib/projectMigrations';
import {
  applyCanonicalPcbPlacement,
  stripLegacyPcbPlacementPatch,
  type PcbPlacementPatch,
} from '../lib/pcb/pcbPlacementAuthority';
import {
  projectPatchFromLegacyArchitectureApplyPlan,
  type LegacyArchitectureAdoptionApplyPlan,
} from '../lib/product/legacyArchitectureAdoptionApply';
import {
  projectPatchFromArchitectureReconciliationPlan,
  type ArchitectureReconciliationApplyPlan,
} from '../lib/product/legacyArchitectureReconciliationApply';
import {
  fingerprintLegacyArchitectureReconciliation,
  previewLegacyArchitectureReconciliation,
} from '../lib/product/legacyArchitectureReconciliation';
import {
  projectPatchFromLegacyValidationApplyPlan,
  type LegacyValidationAdoptionApplyPlan,
} from '../lib/validation/legacyValidationAdoptionApply';
import {
  projectPatchFromValidationReconciliationPlan,
  type ValidationReconciliationApplyPlan,
} from '../lib/validation/legacyValidationReconciliationApply';
import {
  fingerprintLegacyValidationReconciliation,
  previewLegacyValidationReconciliation,
} from '../lib/validation/legacyValidationReconciliation';
import {
  serializeProject,
  deserializeProject,
  validateProjectIntegrity
} from '../lib/projectSerialization';

export function normalizeNetName(name: string): string {
  const trimmed = name.trim();
  const up = trimmed.toUpperCase();
  if (up === 'GND' || up === 'GROUND') return 'GND';
  if (up === '3V3' || up === '3.3V') return '3V3';
  if (up === '5V') return '5V';
  if (up === 'VBAT' || up === 'BAT') return 'VBAT';
  return trimmed; // Preserve custom signal case consistently
}

interface ProjectState extends Project {
  selectedNodeId: string | null;
  projectsList: { id: string; projectName: string; description: string; updatedAt: string; templateName?: string }[];
  activeBoardId: string;

  exportProjectJSON: () => string;
  importProjectJSON: (rawInput: string | object) => { success: boolean; issues: unknown[] };

  setSelectedNodeId: (id: string | null) => void;
  setProjectName: (name: string) => void;
  setProjectDescription: (desc: string) => void;
  setActiveView: (view: string) => void;
  setActiveBoard: (id: string) => void;

  // Node management
  addNode: (node: Omit<CustomNode, 'id'> & { id?: string }) => void;
  updateNode: (id: string, data: Partial<NodeData>) => void;
  deleteNode: (id: string) => void;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
  setNodes: (nodes: CustomNode[]) => void;

  // Edge management
  addEdge: (edge: CustomEdge) => void;
  deleteEdge: (id: string) => void;
  setEdges: (edges: CustomEdge[]) => void;
  updateEdgeLabel: (id: string, label: string) => void;

  // BOM management
  addBOMItem: (item: Omit<BOMItem, 'id'>) => void;
  updateBOMItem: (id: string, data: Partial<BOMItem>) => void;
  deleteBOMItem: (id: string) => void;

  // Testing management
  addTestStage: (stage: Omit<TestStage, 'id'> & { id?: string }) => string;
  updateTestStage: (id: string, data: Partial<TestStage>) => void;
  deleteTestStage: (id: string) => void;
  duplicateTestStage: (id: string) => void;
  reorderTestStages: (stages: TestStage[]) => void;

  // Power budget management
  addPowerItem: (item: Omit<PowerBudgetItem, 'id'>) => void;
  updatePowerItem: (id: string, data: Partial<PowerBudgetItem>) => void;
  deletePowerItem: (id: string) => void;
  setBatteryCapacity: (mah: number) => void;

  // Pin map management
  addPinItem: (item: Omit<PinMapItem, 'id'>) => void;
  updatePinItem: (id: string, data: Partial<PinMapItem>) => void;
  deletePinItem: (id: string) => void;

  // Firmware task management
  addFirmwareTask: (task: Omit<FirmwareTask, 'id'>) => void;
  updateFirmwareTask: (id: string, data: Partial<FirmwareTask>) => void;
  deleteFirmwareTask: (id: string) => void;

  // Board Studio management
  addBoard: (item: Partial<Omit<BoardItem, 'id'>> & { name: string }) => BoardItem;
  updateBoard: (id: string, data: Partial<BoardItem>) => void;
  deleteBoard: (id: string) => void;

  addCircuitBlock: (item: Omit<CircuitBlock, 'id'>) => void;
  updateCircuitBlock: (id: string, data: Partial<CircuitBlock>) => void;
  deleteCircuitBlock: (id: string) => void;

  addBoardComponent: (item: Partial<Omit<BoardComponent, 'id'>> & { id?: string }) => void;
  updateBoardComponent: (id: string, data: Partial<BoardComponent>) => void;
  updatePCBPlacement: (componentId: string, placement: PcbPlacementPatch & { boardId?: string }) => void;
  deleteBoardComponent: (id: string) => void;

  addNet: (item: Partial<Omit<NetItem, 'id'>> & { netName: string }) => void;
  updateNet: (id: string, data: Partial<NetItem>) => void;
  deleteNet: (id: string) => void;

  addPCBConstraint: (item: Omit<PCBConstraint, 'id'>) => void;
  updatePCBConstraint: (id: string, data: Partial<PCBConstraint>) => void;
  deletePCBConstraint: (id: string) => void;

  addChecklistItem: (item: Omit<ManufacturingChecklistItem, 'id'>) => void;
  updateChecklistItem: (id: string, data: Partial<ManufacturingChecklistItem>) => void;
  deleteChecklistItem: (id: string) => void;


  // Project Actions
  saveActiveProject: () => void;
  saveProjectAsCopy: (name: string) => void;
  loadProject: (id: string) => void;
  deleteProject: (id: string) => void;
  loadProjectFromTemplate: (templateId: string) => void;
  resetProject: () => void;
  loadProjectFromLocalStorage: () => void;

  // Editor & Factory Handoff Actions
  updateEditorObjectPosition: (mode: EditorMode, id: string, x: number, y: number) => void;
  updateEditorObjectSize: (mode: EditorMode, id: string, width: number, height: number) => void;
  updateEditorObjectRotation: (mode: EditorMode, id: string, rotation: number) => void;
  updateEditorObjectMetadata: (mode: EditorMode, id: string, metadata: Record<string, string | number | boolean | null>) => void;
  addEditorObject: (mode: EditorMode, obj: Omit<EditorObject, 'id' | 'mode'> & { id?: string }) => void;
  deleteEditorObject: (mode: EditorMode, id: string) => void;
  duplicateEditorObject: (mode: EditorMode, id: string) => void;
  updateEditorConnection: (id: string, connection: Partial<EditorConnection>) => void;
  addEditorConnection: (connection: Omit<EditorConnection, 'id'>) => void;
  deleteEditorConnection: (id: string) => void;
  generateEditorLayouts: () => void;
  resetEditorLayout: (mode: EditorMode) => void;
  updateFactoryFileStatus: (fileKey: string, status?: FactoryFileStatus['status'], notes?: string, source?: FactoryFileStatus['source'], fileName?: string) => void;
  setFactoryPackageStatus: (status: 'Draft' | 'Generated' | 'Needs Review' | 'Verified' | 'Blocked') => void;
  setFactoryReviewCheck: (key: string, checked: boolean) => void;
  resetFactoryReview: () => void;

  addMechanicalZone: (item: Omit<MechanicalZone, 'id'>) => void;
  updateMechanicalZone: (id: string, data: Partial<MechanicalZone>) => void;
  deleteMechanicalZone: (id: string) => void;

  addAssemblyLayer: (item: Omit<AssemblyLayer, 'id'>) => void;
  updateAssemblyLayer: (id: string, data: Partial<AssemblyLayer>) => void;
  deleteAssemblyLayer: (id: string) => void;

  addSchematicSymbol: (item: Omit<SchematicSymbol, 'id'>) => void;
  updateSchematicSymbol: (id: string, data: Partial<SchematicSymbol>) => void;
  deleteSchematicSymbol: (id: string) => void;

  addSchematicConnection: (item: Omit<SchematicConnection, 'id'>) => void;
  updateSchematicConnection: (id: string, data: Partial<SchematicConnection>) => void;
  deleteSchematicConnection: (id: string) => void;

  addTrace: (item: Omit<Trace, 'id'>) => void;
  updateTrace: (id: string, data: Partial<Trace>) => void;
  deleteTrace: (id: string) => void;

  addVia: (item: Omit<Via, 'id'>) => void;
  updateVia: (id: string, data: Partial<Via>) => void;
  deleteVia: (id: string) => void;

  addDrillHole: (item: Omit<DrillHole, 'id'>) => void;
  updateDrillHole: (id: string, data: Partial<DrillHole>) => void;
  deleteDrillHole: (id: string) => void;

  addPcbRule: (item: Omit<PcbRule, 'id'>) => void;
  updatePcbRule: (id: string, data: Partial<PcbRule>) => void;
  deletePcbRule: (id: string) => void;

  addKeepoutZone: (item: Omit<KeepoutZone, 'id'> & { id?: string }) => void;
  updateKeepoutZone: (id: string, data: Partial<KeepoutZone>) => void;
  deleteKeepoutZone: (id: string) => void;

  addPadNetAssignment: (item: Omit<PadNetAssignment, 'id'> & { id?: string }) => void;
  deletePadNetAssignment: (id: string) => void;
  setPadNetAssignments: (items: PadNetAssignment[]) => void;

  runFullDesignReview: () => void;

  // Blueprint Pack Actions
  generateBlueprintPack: () => { sheetCount: number; warnings: number; blockers: number };
  clearBlueprintPack: () => void;
  markBlueprintPackStale: () => void;
  markBlueprintPackVerified: () => void;
  
  addGndNet: () => void;
  addVbatNet: () => void;
  add3v3Net: () => void;
  addI2cPullupResistor: () => void;
  addFlybackDiode: () => void;
  addDebugTestPad: () => void;
  updateProjectState: (patch: Partial<Project>) => void;

  // Vertical Slice Canonical Actions
  customComponentLibrary?: ElectronicComponentDefinition[];
  addProjectComponentFromLibrary: (libComp: ElectronicComponentDefinition, boardId?: string, circuitBlockId?: string) => BoardComponent;
  updateProjectComponent: (id: string, data: Partial<BoardComponent>) => void;
  deleteProjectComponent: (componentId: string, scope: 'schematic-only' | 'pcb-only' | 'entire-product') => void;
  placeComponentOnSchematic: (id: string, x: number, y: number) => void;
  unplaceComponentFromSchematic: (id: string) => void;
  placeComponentOnBoard: (id: string, x: number, y: number, side?: 'Top' | 'Bottom') => void;
  unplaceComponentFromBoard: (id: string) => void;
  createNet: (item: Omit<NetItem, 'id'> & { id?: string }) => NetItem;
  getOrCreateNet: (name: string, data?: Partial<NetItem>) => NetItem;
  connectComponentPins: (sourceComponentId: string, sourcePinNumber: string, targetComponentId: string, targetPinNumber: string, netName?: string, points?: {x:number, y:number}[]) => { wire: SchematicWire; net: NetItem; assignments: PadNetAssignment[] };
  disconnectComponentPin: (componentId: string, pinNumber: string) => void;
  deleteNetSafely: (netName: string) => void;
  addCustomComponentDefinition: (def: ElectronicComponentDefinition) => void;
  updateCustomComponentDefinition: (id: string, def: Partial<ElectronicComponentDefinition>) => void;
  deleteCustomComponentDefinition: (id: string) => void;
  duplicateComponentDefinition: (id: string) => void;
  markDerivedArtifactsStale: (reason: string) => void;

  // Shared Product Graph CRUD
  addRequirement: (req: Omit<ProductRequirement, 'id'>) => void;
  updateRequirement: (id: string, data: Partial<ProductRequirement>) => void;
  deleteRequirement: (id: string) => void;

  addArchitectureNode: (node: Omit<ProductArchitectureNode, 'id'>) => void;
  updateArchitectureNode: (id: string, data: Partial<ProductArchitectureNode>) => void;
  deleteArchitectureNode: (id: string) => void;

  addArchitectureConnection: (conn: Omit<ProductArchitectureConnection, 'id'>) => void;
  updateArchitectureConnection: (id: string, data: Partial<ProductArchitectureConnection>) => void;
  deleteArchitectureConnection: (id: string) => void;
  applyLegacyArchitectureAdoptionPlan: (
    plan: LegacyArchitectureAdoptionApplyPlan,
  ) => { success: boolean; reason?: string };
  applyLegacyArchitectureReconciliationPlan: (
    plan: ArchitectureReconciliationApplyPlan,
  ) => Promise<{ success: boolean; reason?: string }>;

  addMechanicalObject: (obj: Omit<MechanicalObject, 'id'> & { id?: string }) => void;
  updateMechanicalObject: (id: string, data: Partial<MechanicalObject>) => void;
  deleteMechanicalObject: (id: string) => void;

  addMechanicalDimension: (dim: Omit<MechanicalDimension, 'id'>) => void;
  updateMechanicalDimension: (id: string, data: Partial<MechanicalDimension>) => void;
  deleteMechanicalDimension: (id: string) => void;

  addFirmwareModule: (mod: Omit<FirmwareModule, 'id'>) => void;
  updateFirmwareModule: (id: string, data: Partial<FirmwareModule>) => void;
  deleteFirmwareModule: (id: string) => void;

  addFirmwareState: (state: Omit<FirmwareState, 'id'>) => void;
  updateFirmwareState: (id: string, data: Partial<FirmwareState>) => void;
  deleteFirmwareState: (id: string) => void;

  addFirmwareTransition: (trans: Omit<FirmwareTransition, 'id'>) => void;
  updateFirmwareTransition: (id: string, data: Partial<FirmwareTransition>) => void;
  deleteFirmwareTransition: (id: string) => void;

  addValidationTest: (test: Omit<ValidationTest, 'id'>) => void;
  updateValidationTest: (id: string, data: Partial<ValidationTest>) => void;
  deleteValidationTest: (id: string) => void;
  applyLegacyValidationAdoptionPlan: (
    plan: LegacyValidationAdoptionApplyPlan,
  ) => { success: boolean; reason?: string };
  applyLegacyValidationReconciliationPlan: (
    plan: ValidationReconciliationApplyPlan,
  ) => Promise<{ success: boolean; reason?: string }>;

  // Command History System
  activeTransaction?: { type: string; description: string; beforeSnapshot: Partial<Project> } | null;
  beginCommand: (type: string, description: string) => void;
  updateTransientPreview: (patch: Partial<Project>) => void;
  commitCommand: (finalPatch?: Partial<Project>) => void;
  cancelCommand: () => void;
  executeProjectCommand: (type: string, description: string, applyChange: () => void) => void;
  undoProjectCommand: () => void;
  redoProjectCommand: () => void;
  pastCommands: { type: string; description: string; snapshot: string }[];
  futureCommands: { type: string; description: string; snapshot: string }[];
}

const PROJECTS_KEY = 'hardware_studio_projects_v1';
const ACTIVE_ID_KEY = 'hardware_studio_active_project_id_v1';
const OLD_KEY = 'hardware_studio_legacy_project';

const inMemoryProjectsStore: Record<string, Project> = {};
let inMemoryActiveId: string = 'the-ring';

// Helpers to load/save list of projects from local storage
const getSavedProjects = (): Record<string, Project> => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const savedStr = window.localStorage.getItem(PROJECTS_KEY);
      if (savedStr) {
        const parsed = JSON.parse(savedStr);
        Object.assign(inMemoryProjectsStore, parsed);
        return parsed;
      }
      
      // Check old single-project localStorage key for backwards compatibility
      const oldStr = window.localStorage.getItem(OLD_KEY);
      if (oldStr) {
        const oldObj = JSON.parse(oldStr);
        const ringTpl = templates.find(t => t.id === 'the-ring')?.project;
        const converted: Project = {
          id: 'project_default',
          projectName: oldObj.projectName || 'The Ring',
          description: 'Imported from your previous workspace session.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          templateName: 'The Ring',
          version: '1.0',
          activeView: oldObj.activeView || 'master',
          nodes: oldObj.nodes || ringTpl?.nodes || [],
          edges: oldObj.edges || ringTpl?.edges || [],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          bom: (oldObj.bom || []).map((b: any) => ({
            id: b.id || `bom_${Math.random()}`,
            blockName: b.blockName || '',
            candidateComponent: b.candidateComponent || '',
            partNumber: b.partNumber || '',
            stage: b.stage || 'Prototype',
            quantity: typeof b.quantity === 'number' ? b.quantity : 1,
            voltage: b.voltage || '',
            currentEstimate: b.currentEstimate || '',
            interface: b.interface || '',
            packageSize: b.packageSize || '',
            dimensions: b.dimensions || '',
            costEstimate: b.costEstimate || '0.00',
            supplier: b.supplier || '',
            supplierUrl: b.supplierUrl || '',
            datasheetUrl: b.datasheetUrl || '',
            status: b.status || 'Not Started',
            risk: b.risk || '',
            alternative: b.alternative || '',
            notes: b.notes || ''
          })),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          testing: (oldObj.testing || []).map((t: any) => ({
            id: t.id || `stage_${Math.random()}`,
            name: t.name || '',
            goal: t.goal || '',
            partsNeeded: t.partsNeeded || '',
            steps: t.steps || '',
            passCriteria: t.passCriteria || '',
            risks: t.risks || '',
            status: t.status || 'Not Started',
            notes: t.notes || '',
            category: t.category || 'General',
            linkedBlocks: t.linkedBlocks || [],
            resultNotes: t.resultNotes || '',
            evidenceLink: t.evidenceLink || '',
            order: t.order || 0
          })),
          powerBudget: ringTpl?.powerBudget || [],
          pinMap: ringTpl?.pinMap || [],
          firmwareTasks: ringTpl?.firmwareTasks || [],
          batteryCapacityMah: oldObj.batteryCapacityMah || 18
        };
        
        const newProjects = { 'project_default': converted };
        inMemoryProjectsStore['project_default'] = converted;
        window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(newProjects));
        window.localStorage.setItem(ACTIVE_ID_KEY, 'project_default');
        // Clean up old key to avoid repeated migration
        window.localStorage.removeItem(OLD_KEY);
        return newProjects;
      }

      // Default to 'The Ring' template if nothing exists
      const ringTemplate = templates.find(t => t.id === 'the-ring')?.project;
      if (ringTemplate) {
        const initial = JSON.parse(JSON.stringify(ringTemplate)) as Project;
        
        // Pre-generate CAD layout coordinates and initial manufacturing status checks
        const { layouts, connections } = generateEditorLayouts(initial);
        initial.editorLayouts = layouts;
        initial.editorConnections = connections;
        initial.factoryFiles = getInitialFactoryFiles(initial);

        const initialProjects = { [initial.id]: initial };
        inMemoryProjectsStore[initial.id] = initial;
        window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(initialProjects));
        window.localStorage.setItem(ACTIVE_ID_KEY, initial.id);
        return initialProjects;
      }
    } catch (e) {
      console.error("Failed to load projects from storage:", e);
    }
  }
  return inMemoryProjectsStore;
};

const getActiveId = (): string => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(ACTIVE_ID_KEY) || inMemoryActiveId;
  }
  return inMemoryActiveId;
};

const saveProjectsToStorage = (projects: Record<string, Project>, activeId: string) => {
  Object.assign(inMemoryProjectsStore, projects);
  inMemoryActiveId = activeId;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
      window.localStorage.setItem(ACTIVE_ID_KEY, activeId);
    } catch (e) {
      console.error("Failed to save projects to storage:", e);
    }
  }
};

// Initial template load
const getInitialActiveProject = (): Project => {
  const allProjects = getSavedProjects();
  const activeId = getActiveId();
  if (allProjects[activeId]) {
    return migrateProjectSchema(allProjects[activeId]);
  }
  const firstId = Object.keys(allProjects)[0];
  if (firstId && allProjects[firstId]) {
    return migrateProjectSchema(allProjects[firstId]);
  }
  // Ultimate fallback
  const ringTemplate = templates.find(t => t.id === 'the-ring')?.project;
  return migrateProjectSchema(JSON.parse(JSON.stringify(ringTemplate || {
    id: "empty-project",
    projectName: "New Hardware Project",
    description: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: "1.0",
    activeView: "master",
    nodes: [],
    edges: [],
    bom: [],
    testing: [],
    powerBudget: [],
    pinMap: [],
    firmwareTasks: []
  })));
};

export const useProjectStore = create<ProjectState>((set, get) => {
  const initialProject = getInitialActiveProject();

  const syncProjectsList = (projects: Record<string, Project>) => {
    return Object.values(projects).map(p => ({
      id: p.id,
      projectName: p.projectName,
      description: p.description,
      updatedAt: p.updatedAt,
      templateName: p.templateName
    })).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  };

  const resolveTargetBoard = (state: Pick<ProjectState, 'boards' | 'activeBoardId'>): BoardItem | undefined => {
    const boards = state.boards || [];
    if (state.activeBoardId) {
      return boards.find(board => board.id === state.activeBoardId);
    }
    return boards.length === 1 ? boards[0] : undefined;
  };

  const withUnplacedPcb = (
    component: BoardComponent,
    side: 'Top' | 'Bottom' = 'Top',
  ): BoardComponent => applyCanonicalPcbPlacement(component, {
    placed: false,
    xMm: undefined,
    yMm: undefined,
    rotationDeg: 0,
    side,
    locked: false,
    placementStatus: 'Unplaced',
  });

  const getCleanProjectData = (state: ProjectState): Project => {
    return {
      id: state.id,
      projectName: state.projectName,
      description: state.description,
      createdAt: state.createdAt,
      updatedAt: new Date().toISOString(),
      templateName: state.templateName,
      version: state.version,
      activeView: state.activeView,
      nodes: state.nodes,
      edges: state.edges,
      bom: state.bom,
      testing: state.testing,
      powerBudget: state.powerBudget,
      pinMap: state.pinMap,
      firmwareTasks: state.firmwareTasks,
      batteryCapacityMah: state.batteryCapacityMah,
      
      // Board Studio fields
      boards: state.boards || [],
      circuitBlocks: state.circuitBlocks || [],
      boardComponents: state.boardComponents || [],
      nets: state.nets || [],
      pcbConstraints: state.pcbConstraints || [],
      manufacturingChecklist: state.manufacturingChecklist || [],
      editorLayouts: state.editorLayouts || {},
      editorConnections: state.editorConnections || [],
      factoryFiles: state.factoryFiles || {},

      // V3 models
      productType: state.productType || "",
      targetUse: state.targetUse || "",
      mechanicalZones: state.mechanicalZones || [],
      assemblyLayers: state.assemblyLayers || [],
      schematicSymbols: state.schematicSymbols || [],
      schematicConnections: state.schematicConnections || [],
      pcbLayers: state.pcbLayers || [],
      copperShapes: state.copperShapes || [],
      traces: state.traces || [],
      vias: state.vias || [],
      drillHoles: state.drillHoles || [],
      boardOutlines: state.boardOutlines || [],
      pcbRules: state.pcbRules || [],
      reviewResults: state.reviewResults || [],
      exportHistory: state.exportHistory || [],
      padNetAssignments: state.padNetAssignments || [],
      keepoutZones: state.keepoutZones || [],
      schematicWires: state.schematicWires || [],
      customComponentLibrary: state.customComponentLibrary || [],
      blueprintPack: state.blueprintPack || undefined,
      blueprintPackStatus: state.blueprintPackStatus || 'Stale',
      activeBoardId: state.activeBoardId || '',
      requirements: state.requirements || [],
      architectureNodes: state.architectureNodes || [],
      architectureConnections: state.architectureConnections || [],
      architectureReconciliationSuppressions: state.architectureReconciliationSuppressions || [],
      mechanicalObjects: state.mechanicalObjects || [],
      mechanicalDimensions: state.mechanicalDimensions || [],
      mechanicalBodies: state.mechanicalBodies || [],
      firmwareModules: state.firmwareModules || [],
      firmwareStates: state.firmwareStates || [],
      firmwareTransitions: state.firmwareTransitions || [],
      firmwareConfiguration: state.firmwareConfiguration || undefined,
      firmwareSourceFiles: state.firmwareSourceFiles || [],
      firmwareBuildRecords: state.firmwareBuildRecords || [],
      validationTests: state.validationTests || [],
      validationRuns: state.validationRuns || [],
      validationReconciliationSuppressions: state.validationReconciliationSuppressions || [],
      revisions: state.revisions || [],
      branches: state.branches || [],
      releaseCandidates: state.releaseCandidates || [],
      releases: state.releases || [],
      activeBranch: state.activeBranch || 'main',
      mcpProposals: state.mcpProposals || [],
      mcpAuditRecords: state.mcpAuditRecords || []
    };
  };

  const persistChange = (changes: Partial<ProjectState>) => {
    if (get().isFrozen) {
      throw new Error("Cannot modify an immutable frozen release. Create a new branch or revision to continue edits.");
    }
    const updatedState = { ...get(), ...changes };
    const cleanProject = getCleanProjectData(updatedState as ProjectState);
    const saved = getSavedProjects();
    saved[cleanProject.id] = cleanProject;
    saveProjectsToStorage(saved, cleanProject.id);
    
    set({
      ...updatedState,
      updatedAt: cleanProject.updatedAt,
      projectsList: syncProjectsList(saved)
    });
  };

  return {
    ...initialProject,
    boards: initialProject.boards || [],
    circuitBlocks: initialProject.circuitBlocks || [],
    boardComponents: initialProject.boardComponents || [],
    nets: initialProject.nets || [],
    pcbConstraints: initialProject.pcbConstraints || [],
    manufacturingChecklist: initialProject.manufacturingChecklist || [],
    editorLayouts: initialProject.editorLayouts || {},
    editorConnections: initialProject.editorConnections || [],
    factoryFiles: initialProject.factoryFiles || {},

    // V3 initial values
    productType: initialProject.productType || "Wearable Device",
    targetUse: initialProject.targetUse || "Early-stage Prototype",
    mechanicalZones: initialProject.mechanicalZones || [],
    assemblyLayers: initialProject.assemblyLayers || [],
    schematicSymbols: initialProject.schematicSymbols || [],
    schematicConnections: initialProject.schematicConnections || [],
    pcbLayers: initialProject.pcbLayers || [],
    copperShapes: initialProject.copperShapes || [],
    traces: initialProject.traces || [],
    vias: initialProject.vias || [],
    drillHoles: initialProject.drillHoles || [],
    boardOutlines: initialProject.boardOutlines || [],
    pcbRules: initialProject.pcbRules || [],
    reviewResults: initialProject.reviewResults || [],
    exportHistory: initialProject.exportHistory || [],
    factoryPackageStatus: initialProject.factoryPackageStatus || "Draft",
    factoryReviewChecks: initialProject.factoryReviewChecks || {},
    padNetAssignments: initialProject.padNetAssignments || [],
    keepoutZones: initialProject.keepoutZones || [],
    customComponentLibrary: initialProject.customComponentLibrary || [],
    blueprintPack: initialProject.blueprintPack || undefined,
    blueprintPackStatus: initialProject.blueprintPackStatus || 'Stale',
    activeBoardId: initialProject.activeBoardId || '',

    requirements: initialProject.requirements || [],
    architectureNodes: initialProject.architectureNodes || [],
    architectureConnections: initialProject.architectureConnections || [],
    architectureReconciliationSuppressions: initialProject.architectureReconciliationSuppressions || [],
    mechanicalObjects: initialProject.mechanicalObjects || [],
    firmwareModules: initialProject.firmwareModules || [],
    firmwareSourceFiles: initialProject.firmwareSourceFiles || [],
    firmwareBuildRecords: initialProject.firmwareBuildRecords || [],
    validationTests: initialProject.validationTests || [],
    validationRuns: initialProject.validationRuns || [],
    validationReconciliationSuppressions: initialProject.validationReconciliationSuppressions || [],
    revisions: initialProject.revisions || [],
    branches: initialProject.branches || [],
    releaseCandidates: initialProject.releaseCandidates || [],
    releases: initialProject.releases || [],
    pastCommands: [],
    futureCommands: [],

    selectedNodeId: null,
    projectsList: [],

    setSelectedNodeId: (selectedNodeId) => {
      set({ selectedNodeId });
    },

    setProjectName: (projectName) => {
      persistChange({ projectName });
    },

    setProjectDescription: (description) => {
      persistChange({ description });
    },

    setActiveView: (activeView) => {
      // Sync node coordinates for the newly active view if stored in positions map
      const updatedNodes = get().nodes.map(node => {
        if (node.data?.positions?.[activeView]) {
          return {
            ...node,
            position: node.data.positions[activeView]
          };
        }
        return node;
      });
      persistChange({ activeView, nodes: updatedNodes });
    },

    setActiveBoard: (boardId) => {
      if (boardId && !(get().boards || []).some(board => board.id === boardId)) return;
      persistChange({ activeBoardId: boardId });
    },

    // Node management
    addNode: (nodeData) => {
      const activeView = get().activeView;
      const id = nodeData.id || `node_${Date.now()}`;
      
      const nodePos = nodeData.position || { x: 100, y: 100 };
      const currentPositions = nodeData.data?.positions || {};
      const positions = {
        ...currentPositions,
        [activeView]: nodePos
      };

      const newNode: CustomNode = {
        id,
        type: nodeData.type || 'blockNode',
        position: nodePos,
        width: nodeData.width,
        height: nodeData.height,
        data: {
          name: nodeData.data?.name || "New Block",
          category: nodeData.data?.category || "Interaction",
          status: nodeData.data?.status || "MVP",
          description: nodeData.data?.description || "",
          purpose: nodeData.data?.purpose || "",
          requirements: nodeData.data?.requirements || "",
          candidateComponents: nodeData.data?.candidateComponents || "",
          risks: nodeData.data?.risks || "",
          notes: nodeData.data?.notes || "",
          testingNotes: nodeData.data?.testingNotes || "",
          views: nodeData.data?.views || [activeView],
          positions,
          mitigation: nodeData.data?.mitigation || "",
          openQuestions: nodeData.data?.openQuestions || "",
          electricalNotes: nodeData.data?.electricalNotes || "",
          mechanicalNotes: nodeData.data?.mechanicalNotes || "",
          firmwareNotes: nodeData.data?.firmwareNotes || "",
          tags: nodeData.data?.tags || [],
          datasheetUrl: nodeData.data?.datasheetUrl || "",
          supplierUrl: nodeData.data?.supplierUrl || "",
          priority: nodeData.data?.priority || "Medium"
        }
      };

      const nodes = [...get().nodes, newNode];
      persistChange({ nodes, selectedNodeId: id });
    },

    updateNode: (id, fields) => {
      const nodes = get().nodes.map(node => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...fields
            }
          };
        }
        return node;
      });
      persistChange({ nodes });
    },

    deleteNode: (id) => {
      const nodes = get().nodes.filter(n => n.id !== id);
      const edges = get().edges.filter(e => e.source !== id && e.target !== id);
      const selectedNodeId = get().selectedNodeId === id ? null : get().selectedNodeId;
      
      persistChange({ nodes, edges, selectedNodeId });
    },

    updateNodePosition: (id, position) => {
      const activeView = get().activeView;
      const nodes = get().nodes.map(node => {
        if (node.id === id) {
          const currentPositions = node.data?.positions || {};
          const positions = {
            ...currentPositions,
            [activeView]: position
          };
          return {
            ...node,
            position,
            data: {
              ...node.data,
              positions
            }
          };
        }
        return node;
      });
      persistChange({ nodes });
    },

    setNodes: (nodes) => {
      persistChange({ nodes });
    },

    // Edge management
    addEdge: (edge) => {
      const exists = get().edges.some(e => e.source === edge.source && e.target === edge.target && e.views?.includes(get().activeView));
      if (exists) return;

      const newEdge: CustomEdge = {
        ...edge,
        id: edge.id || `edge_${Date.now()}`,
        views: edge.views || [get().activeView],
        label: edge.label || ""
      };

      const edges = [...get().edges, newEdge];
      persistChange({ edges });
    },

    deleteEdge: (id) => {
      const edges = get().edges.filter(e => e.id !== id);
      persistChange({ edges });
    },

    setEdges: (edges) => {
      persistChange({ edges });
    },

    updateEdgeLabel: (id, label) => {
      const edges = get().edges.map(e => e.id === id ? { ...e, label } : e);
      persistChange({ edges });
    },

    // BOM Management
    addBOMItem: (item) => {
      const id = `bom_${Date.now()}`;
      const newItem: BOMItem = {
        ...item,
        id,
        partNumber: item.partNumber || '',
        quantity: item.quantity || 1,
        voltage: item.voltage || '',
        currentEstimate: item.currentEstimate || '',
        packageSize: item.packageSize || '',
        dimensions: item.dimensions || '',
        supplierUrl: item.supplierUrl || '',
        datasheetUrl: item.datasheetUrl || '',
        notes: item.notes || ''
      };
      const bom = [...get().bom, newItem];
      persistChange({ bom });
    },

    updateBOMItem: (id, fields) => {
      const bom = get().bom.map(b => b.id === id ? { ...b, ...fields } : b);
      persistChange({ bom });
    },

    deleteBOMItem: (id) => {
      const bom = get().bom.filter(b => b.id !== id);
      persistChange({ bom });
    },

    // Testing Management
    addTestStage: (stage) => {
      const id = stage.id || `stage_${Date.now()}`;
      const newStage: TestStage = {
        ...stage,
        id,
        category: stage.category || 'General',
        linkedBlocks: stage.linkedBlocks || [],
        resultNotes: stage.resultNotes || '',
        evidenceLink: stage.evidenceLink || '',
        order: stage.order ?? get().testing.length
      };
      const testing = [...get().testing, newStage];
      persistChange({ testing });
      return id;
    },

    updateTestStage: (id, fields) => {
      const testing = get().testing.map(t => t.id === id ? { ...t, ...fields } : t);
      persistChange({ testing });
    },

    deleteTestStage: (id) => {
      const testing = get().testing.filter(t => t.id !== id);
      persistChange({ testing });
    },

    duplicateTestStage: (id) => {
      const target = get().testing.find(t => t.id === id);
      if (!target) return;
      const newId = `stage_dup_${Date.now()}`;
      const copy: TestStage = {
        ...target,
        id: newId,
        name: `${target.name} (Copy)`,
        order: get().testing.length
      };
      const testing = [...get().testing, copy];
      persistChange({ testing });
    },

    reorderTestStages: (testing) => {
      persistChange({ testing });
    },

    // Power Budget Management
    addPowerItem: (item) => {
      const id = `pwr_${Date.now()}`;
      const newItem: PowerBudgetItem = { ...item, id };
      const powerBudget = [...get().powerBudget, newItem];
      persistChange({ powerBudget });
    },

    updatePowerItem: (id, fields) => {
      const powerBudget = get().powerBudget.map(p => p.id === id ? { ...p, ...fields } : p);
      persistChange({ powerBudget });
    },

    deletePowerItem: (id) => {
      const powerBudget = get().powerBudget.filter(p => p.id !== id);
      persistChange({ powerBudget });
    },

    setBatteryCapacity: (batteryCapacityMah) => {
      persistChange({ batteryCapacityMah });
    },

    // Pin Map Management
    addPinItem: (item) => {
      const id = `pin_${Date.now()}`;
      const newItem: PinMapItem = { ...item, id };
      const pinMap = [...get().pinMap, newItem];
      persistChange({ pinMap });
    },

    updatePinItem: (id, fields) => {
      const pinMap = get().pinMap.map(p => p.id === id ? { ...p, ...fields } : p);
      persistChange({ pinMap });
    },

    deletePinItem: (id) => {
      const pinMap = get().pinMap.filter(p => p.id !== id);
      persistChange({ pinMap });
    },

    // Firmware Task Management
    addFirmwareTask: (task) => {
      const id = `fw_task_${Date.now()}`;
      const newTask: FirmwareTask = { ...task, id };
      const firmwareTasks = [...get().firmwareTasks, newTask];
      persistChange({ firmwareTasks });
    },

    updateFirmwareTask: (id, fields) => {
      const firmwareTasks = get().firmwareTasks.map(f => f.id === id ? { ...f, ...fields } : f);
      persistChange({ firmwareTasks });
    },

    deleteFirmwareTask: (id) => {
      const firmwareTasks = get().firmwareTasks.filter(f => f.id !== id);
      persistChange({ firmwareTasks });
    },

    // Project Actions
    saveActiveProject: () => {
      const cleanProject = getCleanProjectData(get());
      const saved = getSavedProjects();
      saved[cleanProject.id] = cleanProject;
      saveProjectsToStorage(saved, cleanProject.id);
      set({ projectsList: syncProjectsList(saved) });
    },

    saveProjectAsCopy: (newName) => {
      const cleanProject = getCleanProjectData(get());
      const newId = `project_copy_${Date.now()}`;
      
      const copied: Project = {
        ...cleanProject,
        id: newId,
        projectName: newName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const saved = getSavedProjects();
      saved[newId] = copied;
      saveProjectsToStorage(saved, newId);
      
      set({
        ...copied,
        selectedNodeId: null,
        projectsList: syncProjectsList(saved)
      });
    },

    loadProject: (id) => {
      const saved = getSavedProjects();
      const rawProj = saved[id];
      if (rawProj) {
        const proj = migrateProjectSchema(rawProj);
        set({
          ...proj,
          activeBoardId: proj.activeBoardId || '',
          selectedNodeId: null,
          projectsList: syncProjectsList(saved)
        });
        saveProjectsToStorage(saved, id);
      }
    },

    deleteProject: (id) => {
      const saved = getSavedProjects();
      
      // Don't delete if it is the only project
      if (Object.keys(saved).length <= 1) {
        return;
      }

      delete saved[id];
      
      // If deleted active project, switch to the first remaining one
      const activeId = getActiveId();
      let nextActiveId = activeId;
      if (activeId === id) {
        nextActiveId = Object.keys(saved)[0];
      }

      saveProjectsToStorage(saved, nextActiveId);
      
      set({ projectsList: syncProjectsList(saved) });
      get().loadProject(nextActiveId);
    },

    loadProjectFromTemplate: (templateId) => {
      const targetTpl = templates.find(t => t.id === templateId)?.project;
      if (targetTpl) {
        const copyRaw = JSON.parse(JSON.stringify(targetTpl)) as Project;
        const copy = migrateProjectSchema(copyRaw);
        const newId = `project_template_${templateId}_${Date.now()}`;
        copy.id = newId;
        copy.projectName = `My ${copy.projectName}`;
        copy.createdAt = new Date().toISOString();
        copy.updatedAt = new Date().toISOString();

        // Pre-generate CAD layout coordinates and initial manufacturing status checks
        const { layouts, connections } = generateEditorLayouts(copy);
        copy.editorLayouts = layouts;
        copy.editorConnections = connections;
        copy.factoryFiles = getInitialFactoryFiles(copy);

        const saved = getSavedProjects();
        saved[newId] = copy;
        saveProjectsToStorage(saved, newId);

        set({
          ...copy,
          activeBoardId: copy.activeBoardId || '',
          selectedNodeId: null,
          projectsList: syncProjectsList(saved)
        });
      }
    },

    resetProject: () => {
      const tplName = get().templateName;
      let targetTpl = templates.find(t => t.name === tplName)?.project;
      if (!targetTpl) {
        // Fallback to empty project template
        targetTpl = templates.find(t => t.id === 'empty-project')?.project;
      }
      
      if (targetTpl) {
        const fresh = JSON.parse(JSON.stringify(targetTpl)) as Project;
        // Retain original project ID and name
        fresh.id = get().id;
        fresh.projectName = get().projectName;
        fresh.description = get().description;
        fresh.createdAt = get().createdAt;
        fresh.updatedAt = new Date().toISOString();

        persistChange({
          ...fresh,
          activeBoardId: fresh.activeBoardId || '',
          selectedNodeId: null
        });
      }
    },

    loadProjectFromLocalStorage: () => {
      const allProjects = getSavedProjects();
      const activeId = getActiveId();
      set({ projectsList: syncProjectsList(allProjects) });
      if (allProjects[activeId]) {
        get().loadProject(activeId);
      } else {
        const first = Object.keys(allProjects)[0];
        if (first) get().loadProject(first);
      }
    },

    // Board Studio Actions
    addBoard: (item) => {
      const id = `board_${Date.now()}_${Math.random()}`;
      const newItem: BoardItem = {
        name: item.name,
        boardType: item.boardType || 'Unknown',
        purpose: item.purpose || '',
        dimensionsMm: item.dimensionsMm || undefined,
        layerCount: item.layerCount,
        substrate: item.substrate || undefined,
        placement: item.placement || 'Unknown',
        mountingNotes: item.mountingNotes || '',
        connectorNotes: item.connectorNotes || '',
        thermalNotes: item.thermalNotes || '',
        rfNotes: item.rfNotes || '',
        status: item.status || 'Concept',
        id
      };
      const boards = [...(get().boards || []), newItem];
      persistChange({ boards });
      return newItem;
    },

    updateBoard: (id, fields) => {
      const boards = (get().boards || []).map(b => b.id === id ? { ...b, ...fields } : b);
      persistChange({ boards });
    },

    deleteBoard: (id) => {
      const boards = (get().boards || []).filter(b => b.id !== id);
      const activeBoardId = get().activeBoardId === id ? '' : get().activeBoardId;
      persistChange({ boards, activeBoardId });
    },

    addCircuitBlock: (item) => {
      const id = `circuit_${Date.now()}_${Math.random()}`;
      const newItem: CircuitBlock = { ...item, id };
      const circuitBlocks = [...(get().circuitBlocks || []), newItem];
      persistChange({ circuitBlocks });
    },

    updateCircuitBlock: (id, fields) => {
      const circuitBlocks = (get().circuitBlocks || []).map(cb => cb.id === id ? { ...cb, ...fields } : cb);
      persistChange({ circuitBlocks });
    },

    deleteCircuitBlock: (id) => {
      const circuitBlocks = (get().circuitBlocks || []).filter(cb => cb.id !== id);
      persistChange({ circuitBlocks });
    },

    addBoardComponent: (item) => {
      const id = item.id || `comp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const cleanItem = stripLegacyPcbPlacementPatch(item);
      const baseComp: BoardComponent = {
        boardId: item.boardId || get().activeBoardId || '',
        referenceDesignator: 'U1',
        componentName: 'Component',
        componentType: 'General',
        footprint: 'SOIC-8',
        packageName: 'SOIC-8',
        placementCriticality: 'Medium',
        value: '',
        partNumber: '',
        notes: '',
        quantity: 1,
        pcb: {
          placed: false,
          xMm: undefined,
          yMm: undefined,
          rotationDeg: 0,
          side: 'Top',
          locked: false,
          placementStatus: 'Unplaced',
        },
        ...cleanItem,
        id
      };
      const newComp = applyCanonicalPcbPlacement(baseComp, item.pcb || {});
      const boardComponents = [...(get().boardComponents || []), newComp];
      persistChange({ boardComponents });
      get().markDerivedArtifactsStale(`Add board component ${newComp.referenceDesignator}`);
    },

    updateBoardComponent: (id, data) => {
      const cleanData = stripLegacyPcbPlacementPatch(data);
      const boardComponents = (get().boardComponents || []).map((component) => {
        if (component.id !== id) return component;
        const { pcb, ...nonPlacementData } = cleanData;
        const updated = { ...component, ...nonPlacementData };
        return pcb ? applyCanonicalPcbPlacement(updated, pcb) : updated;
      });
      persistChange({ boardComponents });
      get().markDerivedArtifactsStale(`Update component ${id}`);
    },

    updatePCBPlacement: (componentId, placement) => {
      const state = get();
      const currentComp = (state.boardComponents || []).find(c => c.id === componentId);
      if (!currentComp) return;

      const { boardId, ...placementPatch } = placement;
      const componentWithOwnership = boardId !== undefined
        ? { ...currentComp, boardId }
        : currentComp;
      const updatedComp = applyCanonicalPcbPlacement(componentWithOwnership, placementPatch);
      const canonicalPlacement = updatedComp.pcb!;
      const boardComponents = (state.boardComponents || []).map(
        (component) => component.id === componentId ? updatedComp : component,
      );

      let mechanicalObjects = state.mechanicalObjects;
      const linkedMechId = currentComp.mechanicalObjectId || currentComp.linkedMechanicalObjectId;
      if (
        linkedMechId
        && mechanicalObjects
        && canonicalPlacement.xMm !== undefined
        && canonicalPlacement.yMm !== undefined
      ) {
        mechanicalObjects = mechanicalObjects.map((object) => (
          object.id === linkedMechId
            ? { ...object, xMm: canonicalPlacement.xMm!, yMm: canonicalPlacement.yMm! }
            : object
        ));
      }

      persistChange({
        boardComponents,
        mechanicalObjects
      });

      get().markDerivedArtifactsStale(`Update PCB placement for ${currentComp.referenceDesignator}`);
    },

    deleteBoardComponent: (id) => {
      const boardComponents = (get().boardComponents || []).filter(bc => bc.id !== id);
      persistChange({ boardComponents });
      get().markDerivedArtifactsStale(`Delete board component ${id}`);
    },

    addNet: (item) => {
      const id = `net_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const newNet: NetItem = {
        netType: 'Signal',
        voltage: '3.3V',
        currentEstimate: '10mA',
        sourceComponent: '',
        sourcePin: '',
        targetComponent: '',
        targetPin: '',
        impedanceRequirement: '50 Ohm',
        notes: '',
        protocol: 'GPIO',
        ...item,
        id
      };
      const nets = [...(get().nets || []), newNet];
      persistChange({ nets });
    },

    updateNet: (id, fields) => {
      const nets = (get().nets || []).map(n => n.id === id ? { ...n, ...fields } : n);
      persistChange({ nets });
    },

    deleteNet: (id) => {
      const nets = (get().nets || []).filter(n => n.id !== id);
      persistChange({ nets });
    },

    addPCBConstraint: (item) => {
      const id = `const_${Date.now()}_${Math.random()}`;
      const newItem: PCBConstraint = { ...item, id };
      const pcbConstraints = [...(get().pcbConstraints || []), newItem];
      persistChange({ pcbConstraints });
    },

    updatePCBConstraint: (id, fields) => {
      const pcbConstraints = (get().pcbConstraints || []).map(c => c.id === id ? { ...c, ...fields } : c);
      persistChange({ pcbConstraints });
    },

    deletePCBConstraint: (id) => {
      const pcbConstraints = (get().pcbConstraints || []).filter(c => c.id !== id);
      persistChange({ pcbConstraints });
    },

    addChecklistItem: (item) => {
      const id = `chk_${Date.now()}_${Math.random()}`;
      const newItem: ManufacturingChecklistItem = { ...item, id };
      const manufacturingChecklist = [...(get().manufacturingChecklist || []), newItem];
      persistChange({ manufacturingChecklist });
    },

    updateChecklistItem: (id, fields) => {
      const manufacturingChecklist = (get().manufacturingChecklist || []).map(mc => mc.id === id ? { ...mc, ...fields } : mc);
      persistChange({ manufacturingChecklist });
    },

    deleteChecklistItem: (id) => {
      const manufacturingChecklist = (get().manufacturingChecklist || []).filter(mc => mc.id !== id);
      persistChange({ manufacturingChecklist });
    },

    updateEditorObjectPosition: (mode, id, x, y) => {
      const layouts = { ...(get().editorLayouts || {}) };
      const modeObjects = layouts[mode] || [];
      layouts[mode] = modeObjects.map(obj => obj.id === id ? { ...obj, x, y } : obj);

      // Editor layout coordinates are a display projection. They must never
      // mutate PCB engineering placement; PCB changes go through updatePCBPlacement.
      persistChange({ editorLayouts: layouts });
    },

    updateEditorObjectSize: (mode, id, width, height) => {
      const layouts = { ...(get().editorLayouts || {}) };
      const modeObjects = layouts[mode] || [];
      layouts[mode] = modeObjects.map(obj => obj.id === id ? { ...obj, width, height } : obj);
      persistChange({ editorLayouts: layouts });
    },

    updateEditorObjectRotation: (mode, id, rotation) => {
      const layouts = { ...(get().editorLayouts || {}) };
      const modeObjects = layouts[mode] || [];
      layouts[mode] = modeObjects.map(obj => obj.id === id ? { ...obj, rotation } : obj);

      // Display rotation is not PCB engineering rotation.
      persistChange({ editorLayouts: layouts });
    },

    updateEditorObjectMetadata: (mode, id, metadata) => {
      const layouts = { ...(get().editorLayouts || {}) };
      const modeObjects = layouts[mode] || [];
      layouts[mode] = modeObjects.map(obj => obj.id === id ? { ...obj, metadata: { ...(obj.metadata || {}), ...metadata } } : obj);
      persistChange({ editorLayouts: layouts });
    },

    addEditorObject: (mode, obj) => {
      const layouts = { ...(get().editorLayouts || {}) };
      const modeObjects = layouts[mode] || [];
      const newObj: EditorObject = {
        ...obj,
        id: obj.id || `obj_${mode}_${Date.now()}`,
        mode
      };
      layouts[mode] = [...modeObjects, newObj];
      persistChange({ editorLayouts: layouts });
    },

    deleteEditorObject: (mode, id) => {
      const layouts = { ...(get().editorLayouts || {}) };
      const modeObjects = layouts[mode] || [];
      layouts[mode] = modeObjects.filter(obj => obj.id !== id);
      
      const connections = (get().editorConnections || []).filter(c => c.sourceObjectId !== id && c.targetObjectId !== id);

      persistChange({ editorLayouts: layouts, editorConnections: connections });
    },

    duplicateEditorObject: (mode, id) => {
      const layouts = { ...(get().editorLayouts || {}) };
      const modeObjects = layouts[mode] || [];
      const target = modeObjects.find(obj => obj.id === id);
      if (!target) return;

      const dup: EditorObject = {
        ...target,
        id: `obj_${mode}_dup_${Date.now()}`,
        label: `${target.label} (Copy)`,
        x: target.x + 20,
        y: target.y + 20
      };
      layouts[mode] = [...modeObjects, dup];
      persistChange({ editorLayouts: layouts });
    },

    updateEditorConnection: (id, conn) => {
      const connections = (get().editorConnections || []).map(c => c.id === id ? { ...c, ...conn } : c);
      persistChange({ editorConnections: connections });
    },

    addEditorConnection: (conn) => {
      const connections = [...(get().editorConnections || [])];
      const newConn: EditorConnection = {
        ...conn,
        id: `conn_${conn.mode}_${Date.now()}`
      };
      connections.push(newConn);
      persistChange({ editorConnections: connections });
    },

    deleteEditorConnection: (id) => {
      const connections = (get().editorConnections || []).filter(c => c.id !== id);
      persistChange({ editorConnections: connections });
    },

    generateEditorLayouts: () => {
      const project = getCleanProjectData(get());
      const { layouts, connections } = generateEditorLayouts(project);
      
      const existingLayouts = get().editorLayouts || {};
      const mergedLayouts: typeof layouts = {};

      Object.keys(layouts).forEach(key => {
        const mode = key as EditorMode;
        const newModeObjs = layouts[mode] || [];
        const oldModeObjs = existingLayouts[mode] || [];

        mergedLayouts[mode] = newModeObjs.map(newObj => {
          const matched = oldModeObjs.find(oldObj => oldObj.id === newObj.id);
          if (matched) {
            return {
              ...newObj,
              x: matched.x,
              y: matched.y,
              width: matched.width,
              height: matched.height,
              rotation: matched.rotation,
              locked: matched.locked,
              visible: matched.visible
            };
          }
          return newObj;
        });
      });

      persistChange({ 
        editorLayouts: mergedLayouts, 
        editorConnections: connections,
        factoryFiles: get().factoryFiles || getInitialFactoryFiles(project)
      });
    },

    resetEditorLayout: (mode) => {
      const project = getCleanProjectData(get());
      const { layouts, connections } = generateEditorLayouts(project);
      
      const currentLayouts = { ...(get().editorLayouts || {}) };
      currentLayouts[mode] = layouts[mode] || [];

      const currentConns = (get().editorConnections || []).filter(c => c.mode !== mode);
      const modeConns = connections.filter(c => c.mode === mode);

      persistChange({ 
        editorLayouts: currentLayouts, 
        editorConnections: [...currentConns, ...modeConns] 
      });
    },

    updateFactoryFileStatus: (fileKey, status, notes, source, fileName) => {
      const factoryFiles: Record<string, FactoryFileStatus | undefined> = { ...(get().factoryFiles || getInitialFactoryFiles(get())) };
      const current = factoryFiles[fileKey] || { status: "Not Generated" };
      factoryFiles[fileKey] = {
        ...current,
        status: status !== undefined ? status : current.status,
        notes: notes !== undefined ? notes : current.notes,
        source: source !== undefined ? source : current.source,
        fileName: fileName !== undefined ? fileName : current.fileName,
        lastUpdated: new Date().toLocaleDateString()
      };
      persistChange({ factoryFiles });
      get().generateEditorLayouts();
    },

    setFactoryPackageStatus: (status) => {
      persistChange({ factoryPackageStatus: status });
    },
    setFactoryReviewCheck: (key, checked) => {
      const checks = { ...(get().factoryReviewChecks || {}) };
      checks[key] = checked;
      persistChange({ factoryReviewChecks: checks });
    },
    resetFactoryReview: () => {
      persistChange({
        factoryReviewChecks: {},
        factoryPackageStatus: "Draft"
      });
    },

    addMechanicalZone: (item) => {
      const id = `zone_${Date.now()}_${Math.random()}`;
      const zones = [...(get().mechanicalZones || []), { ...item, id }];
      persistChange({ mechanicalZones: zones });
    },
    updateMechanicalZone: (id, fields) => {
      const zones = (get().mechanicalZones || []).map(z => z.id === id ? { ...z, ...fields } : z);
      persistChange({ mechanicalZones: zones });
    },
    deleteMechanicalZone: (id) => {
      const zones = (get().mechanicalZones || []).filter(z => z.id !== id);
      persistChange({ mechanicalZones: zones });
    },

    addAssemblyLayer: (item) => {
      const id = `layer_${Date.now()}_${Math.random()}`;
      const layers = [...(get().assemblyLayers || []), { ...item, id }];
      persistChange({ assemblyLayers: layers });
    },
    updateAssemblyLayer: (id, fields) => {
      const layers = (get().assemblyLayers || []).map(l => l.id === id ? { ...l, ...fields } : l);
      persistChange({ assemblyLayers: layers });
    },
    deleteAssemblyLayer: (id) => {
      const layers = (get().assemblyLayers || []).filter(l => l.id !== id);
      persistChange({ assemblyLayers: layers });
    },

    addSchematicSymbol: (item) => {
      const id = `sym_${Date.now()}_${Math.random()}`;
      const symbols = [...(get().schematicSymbols || []), { ...item, id }];
      persistChange({ schematicSymbols: symbols });
    },
    updateSchematicSymbol: (id, fields) => {
      const symbols = (get().schematicSymbols || []).map(s => s.id === id ? { ...s, ...fields } : s);
      persistChange({ schematicSymbols: symbols });
    },
    deleteSchematicSymbol: (id) => {
      const symbols = (get().schematicSymbols || []).filter(s => s.id !== id);
      persistChange({ schematicSymbols: symbols });
    },

    addSchematicConnection: (item) => {
      const id = `conn_sch_${Date.now()}_${Math.random()}`;
      const conns = [...(get().schematicConnections || []), { ...item, id }];
      persistChange({ schematicConnections: conns });
    },
    updateSchematicConnection: (id, fields) => {
      const conns = (get().schematicConnections || []).map(c => c.id === id ? { ...c, ...fields } : c);
      persistChange({ schematicConnections: conns });
    },
    deleteSchematicConnection: (id) => {
      const conns = (get().schematicConnections || []).filter(c => c.id !== id);
      persistChange({ schematicConnections: conns });
    },

    addTrace: (item) => {
      const id = `trace_${Date.now()}_${Math.random()}`;
      const traces = [...(get().traces || []), { ...item, id }];
      persistChange({ traces });
    },
    updateTrace: (id, fields) => {
      const traces = (get().traces || []).map(t => t.id === id ? { ...t, ...fields } : t);
      persistChange({ traces });
    },
    deleteTrace: (id) => {
      const traces = (get().traces || []).filter(t => t.id !== id);
      persistChange({ traces });
    },

    addVia: (item) => {
      const id = `via_${Date.now()}_${Math.random()}`;
      const vias = [...(get().vias || []), { ...item, id }];
      persistChange({ vias });
    },
    updateVia: (id, fields) => {
      const vias = (get().vias || []).map(v => v.id === id ? { ...v, ...fields } : v);
      persistChange({ vias });
    },
    deleteVia: (id) => {
      const vias = (get().vias || []).filter(v => v.id !== id);
      persistChange({ vias });
    },

    addDrillHole: (item) => {
      const id = `drill_${Date.now()}_${Math.random()}`;
      const holes = [...(get().drillHoles || []), { ...item, id }];
      persistChange({ drillHoles: holes });
    },
    updateDrillHole: (id, fields) => {
      const holes = (get().drillHoles || []).map(h => h.id === id ? { ...h, ...fields } : h);
      persistChange({ drillHoles: holes });
    },
    deleteDrillHole: (id) => {
      const holes = (get().drillHoles || []).filter(h => h.id !== id);
      persistChange({ drillHoles: holes });
    },

    addPcbRule: (item) => {
      const id = `rule_${Date.now()}_${Math.random()}`;
      const pcbRules = [...(get().pcbRules || []), { ...item, id }];
      persistChange({ pcbRules });
    },
    updatePcbRule: (id, fields) => {
      const pcbRules = (get().pcbRules || []).map(r => r.id === id ? { ...r, ...fields } : r);
      persistChange({ pcbRules });
    },
    deletePcbRule: (id) => {
      const pcbRules = (get().pcbRules || []).filter(r => r.id !== id);
      persistChange({ pcbRules });
    },

    addKeepoutZone: (item) => {
      const id = item.id || `keepout_${Date.now()}_${Math.random()}`;
      const zones = [...(get().keepoutZones || []), { ...item, id }];
      persistChange({ keepoutZones: zones });
    },
    updateKeepoutZone: (id, fields) => {
      const zones = (get().keepoutZones || []).map(z => z.id === id ? { ...z, ...fields } : z);
      persistChange({ keepoutZones: zones });
    },
    deleteKeepoutZone: (id) => {
      const zones = (get().keepoutZones || []).filter(z => z.id !== id);
      persistChange({ keepoutZones: zones });
    },

    addPadNetAssignment: (item) => {
      const id = item.id || `pna_${Date.now()}_${Math.random()}`;
      const items = [...(get().padNetAssignments || []), { ...item, id }];
      persistChange({ padNetAssignments: items });
    },
    deletePadNetAssignment: (id) => {
      const items = (get().padNetAssignments || []).filter(a => a.id !== id);
      persistChange({ padNetAssignments: items });
    },
    setPadNetAssignments: (items) => {
      persistChange({ padNetAssignments: items });
    },

    runFullDesignReview: () => {
      const project = getCleanProjectData(get());
      const reviewResults = runDesignReview(project);
      persistChange({ reviewResults });
    },

    // Blueprint Pack Actions
    generateBlueprintPack: () => {
      const project = getCleanProjectData(get());
      const pack = generateBlueprintPackFn(project);
      persistChange({
        blueprintPack: pack,
        blueprintPackStatus: pack.summary.blockers > 0 ? 'Generated' : 'Generated',
        blueprintPackGeneratedAt: pack.generatedAt,
      });
      return {
        sheetCount: pack.summary.totalSheets,
        warnings: pack.summary.warnings,
        blockers: pack.summary.blockers,
      };
    },

    clearBlueprintPack: () => {
      persistChange({
        blueprintPack: undefined,
        blueprintPackStatus: 'Not Generated',
        blueprintPackGeneratedAt: undefined,
      });
    },

    markBlueprintPackStale: () => {
      if (get().blueprintPack) {
        persistChange({ blueprintPackStatus: 'Stale' });
      }
    },

    markBlueprintPackVerified: () => {
      if (get().blueprintPack) {
        persistChange({ blueprintPackStatus: 'Verified' });
      }
    },

    addGndNet: () => {
      const nets = [...(get().nets || [])];
      if (!nets.some(n => n.netName.toUpperCase() === 'GND')) {
        nets.push({
          id: `net_gnd_${Date.now()}`,
          netName: "GND",
          netType: "Ground",
          voltage: "0V",
          sourceComponent: "BATT_CONN",
          sourcePin: "PIN_2",
          targetComponent: "U1_MCU",
          targetPin: "GND",
          protocol: "Ground reference",
          currentEstimate: "120mA",
          impedanceRequirement: "None",
          notes: "Auto-generated return ground path"
        });
        persistChange({ nets });
        get().runFullDesignReview();
      }
    },

    addVbatNet: () => {
      const nets = [...(get().nets || [])];
      if (!nets.some(n => n.netName.toUpperCase() === 'VBAT')) {
        nets.push({
          id: `net_vbat_${Date.now()}`,
          netName: "VBAT",
          netType: "Power",
          voltage: "3.7V",
          sourceComponent: "BATT_CONN",
          sourcePin: "PIN_1",
          targetComponent: "U2_CHARGER",
          targetPin: "VBAT",
          protocol: "Battery load path",
          currentEstimate: "150mA",
          impedanceRequirement: "None",
          notes: "Auto-generated primary cell rail"
        });
        persistChange({ nets });
        get().runFullDesignReview();
      }
    },

    add3v3Net: () => {
      const nets = [...(get().nets || [])];
      if (!nets.some(n => n.netName.toUpperCase() === '3V3')) {
        nets.push({
          id: `net_3v3_${Date.now()}`,
          netName: "3V3",
          netType: "Power",
          voltage: "3.3V",
          sourceComponent: "U3_LDO",
          sourcePin: "VOUT",
          targetComponent: "U1_MCU",
          targetPin: "VDD",
          protocol: "MCU regulated supply",
          currentEstimate: "80mA",
          impedanceRequirement: "None",
          notes: "Auto-generated regulated logic rail"
        });
        persistChange({ nets });
        get().runFullDesignReview();
      }
    },

    addI2cPullupResistor: () => {
      const targetBoard = resolveTargetBoard(get());
      if (!targetBoard) return;
      const components = [...(get().boardComponents || [])];
      const nextIdx = components.length + 1;
      const circuitBlockId = (get().circuitBlocks || []).find(block => block.boardId === targetBoard.id && block.circuitType === 'MCU')?.id;
      
      const r1 = withUnplacedPcb({
        id: `cmp_r_pull1_${Date.now()}`,
        boardId: targetBoard.id,
        circuitBlockId,
        referenceDesignator: `R${nextIdx}`,
        componentName: "Resistor 10kΩ 0603",
        componentType: "Resistor",
        value: "10k",
        packageName: "R_0603",
        footprint: "R_0603",
        partNumber: "RC0603FR-0710KL",
        quantity: 1,
        placementCriticality: "Medium",
        notes: "I2C SDA pullup"
      }, 'Top');

      const r2 = withUnplacedPcb({
        id: `cmp_r_pull2_${Date.now()}`,
        boardId: targetBoard.id,
        circuitBlockId,
        referenceDesignator: `R${nextIdx + 1}`,
        componentName: "Resistor 10kΩ 0603",
        componentType: "Resistor",
        value: "10k",
        packageName: "R_0603",
        footprint: "R_0603",
        partNumber: "RC0603FR-0710KL",
        quantity: 1,
        placementCriticality: "Medium",
        notes: "I2C SCL pullup"
      }, 'Top');

      persistChange({ boardComponents: [...components, r1, r2] });
      get().generateEditorLayouts();
      get().runFullDesignReview();
    },

    addFlybackDiode: () => {
      const targetBoard = resolveTargetBoard(get());
      if (!targetBoard) return;
      const components = [...(get().boardComponents || [])];
      const nextIdx = components.length + 1;
      const circuitBlockId = (get().circuitBlocks || []).find(block => block.boardId === targetBoard.id && block.circuitType === 'Haptic')?.id;
      
      const diode = withUnplacedPcb({
        id: `cmp_d_fly_${Date.now()}`,
        boardId: targetBoard.id,
        circuitBlockId,
        referenceDesignator: `D${nextIdx}`,
        componentName: "Schottky Diode SOD123",
        componentType: "Diode",
        value: "Schottky",
        packageName: "SOD123",
        footprint: "SOD123",
        partNumber: "B130-13-F",
        quantity: 1,
        placementCriticality: "High",
        notes: "Motor flyback clamp protection"
      }, 'Top');

      persistChange({ boardComponents: [...components, diode] });
      get().generateEditorLayouts();
      get().runFullDesignReview();
    },

    addDebugTestPad: () => {
      const targetBoard = resolveTargetBoard(get());
      if (!targetBoard) return;
      const components = [...(get().boardComponents || [])];
      const nextIdx = components.length + 1;
      const circuitBlockId = (get().circuitBlocks || []).find(block => block.boardId === targetBoard.id && block.circuitType === 'Debug')?.id;
      
      const tp1 = withUnplacedPcb({
        id: `cmp_tp_swdio_${Date.now()}`,
        boardId: targetBoard.id,
        circuitBlockId,
        referenceDesignator: `TP${nextIdx}`,
        componentName: "Programming Pad SWDIO",
        componentType: "Connector",
        value: "SWDIO",
        packageName: "TEST_PAD",
        footprint: "TEST_PAD",
        partNumber: "TP_1MM_ROUND",
        quantity: 1,
        placementCriticality: "High",
        notes: "MCU SWDIO target interface point"
      }, 'Bottom');

      const tp2 = withUnplacedPcb({
        id: `cmp_tp_swclk_${Date.now()}`,
        boardId: targetBoard.id,
        circuitBlockId,
        referenceDesignator: `TP${nextIdx + 1}`,
        componentName: "Programming Pad SWCLK",
        componentType: "Connector",
        value: "SWCLK",
        packageName: "TEST_PAD",
        footprint: "TEST_PAD",
        partNumber: "TP_1MM_ROUND",
        quantity: 1,
        placementCriticality: "High",
        notes: "MCU SWCLK target interface point"
      }, 'Bottom');

      persistChange({ boardComponents: [...components, tp1, tp2] });
      get().generateEditorLayouts();
      get().runFullDesignReview();
    },

    addProjectComponentFromLibrary: (libComp, boardId, circuitBlockId) => {
      const targetBoardId = boardId || get().activeBoardId;
      const targetBoard = (get().boards || []).find(board => board.id === targetBoardId);
      if (!targetBoard) {
        throw new Error('A real project board must be selected before adding a component from the library.');
      }

      const targetBlock = circuitBlockId
        ? (get().circuitBlocks || []).find(block => block.id === circuitBlockId && block.boardId === targetBoard.id)
        : undefined;
      if (circuitBlockId && !targetBlock) {
        throw new Error('The selected circuit block does not belong to the target board.');
      }

      const components = get().boardComponents || [];
      const prefix = libComp.category === 'Resistor' ? 'R' :
                     libComp.category === 'Capacitor' ? 'C' :
                     libComp.category === 'Inductor' ? 'L' :
                     libComp.category === 'Diode' ? 'D' :
                     libComp.category === 'LED' ? 'LED' :
                     libComp.category === 'Transistor' || libComp.category === 'MOSFET' ? 'Q' :
                     libComp.category === 'Sensor' ? 'SEN' :
                     libComp.category === 'Connector' ? 'J' :
                     libComp.category === 'Button' || libComp.category === 'Touch' ? 'SW' :
                     libComp.category === 'Regulator' || libComp.category === 'Charger' ? 'U' :
                     libComp.category === 'MCU' || libComp.category === 'Processor' ? 'U' : 'U';
      
      let index = 1;
      while (components.some(c => c.referenceDesignator === `${prefix}${index}`)) {
        index++;
      }
      const refDes = `${prefix}${index}`;
      const compId = `cmp_${libComp.libraryId}_${Date.now()}_${Math.random()}`;

      // Create new BOM item
      const bomId = `bom_${Date.now()}_${Math.random()}`;
      const bomItem: BOMItem = {
        id: bomId,
        componentId: compId,
        blockName: targetBlock?.name || 'Unassigned',
        candidateComponent: libComp.name,
        partNumber: libComp.partNumber || '',
        stage: 'Prototype',
        quantity: libComp.defaultQuantity || 1,
        voltage: libComp.electrical?.typicalVoltage ? `${libComp.electrical.typicalVoltage}V` : '',
        currentEstimate: '',
        interface: '',
        packageSize: libComp.packageName,
        dimensions: '',
        costEstimate: '0.00',
        supplier: libComp.manufacturer || 'Generic',
        supplierUrl: '',
        datasheetUrl: libComp.datasheetUrl || '',
        status: 'Not Started',
        risk: '',
        alternative: '',
        notes: libComp.description || ''
      };

      const rawComp = {
        id: compId,
        libraryId: libComp.libraryId,
        referenceDesignator: refDes,
        componentName: libComp.name,
        componentType: libComp.category,
        value: libComp.value || '',
        packageName: libComp.packageName,
        footprint: libComp.footprintName,
        partNumber: libComp.partNumber || '',
        manufacturer: libComp.manufacturer || '',
        datasheetUrl: libComp.datasheetUrl || '',
        pins: libComp.pins || [],
        boardId: targetBoard.id,
        circuitBlockId: targetBlock?.id,
        bomItemId: bomId,
        quantity: libComp.defaultQuantity || 1,
        schematic: { placed: false, x: 150, y: 150, rotation: 0, locked: false },
        pcb: { placed: false, xMm: undefined, yMm: undefined, rotationDeg: 0, side: 'Top' as const, locked: false, placementStatus: 'Unplaced' as const },
        status: 'Selected' as const,
        notes: libComp.description || ''
      };

      const newComp = normalizeProjectComponent(rawComp);
      
      const updatedComponents = [...components, newComp];
      const updatedBom = [...(get().bom || []), bomItem];
      
      persistChange({
        boardComponents: updatedComponents,
        bom: updatedBom,
        activeBoardId: targetBoard.id
      });

      return newComp;
    },

    updateProjectComponent: (id, data) => {
      const components = get().boardComponents || [];
      const index = components.findIndex(c => c.id === id);
      if (index === -1) return;

      const current = components[index];
      const cleanData = stripLegacyPcbPlacementPatch(data);
      const { pcb, ...nonPlacementData } = cleanData;
      let updated = { ...current, ...nonPlacementData };

      if (pcb) {
        updated = applyCanonicalPcbPlacement(updated, pcb);
      }

      const updatedComponents = [...components];
      updatedComponents[index] = updated;

      // Update linked BOM item
      let updatedBom = get().bom || [];
      if (updated.bomItemId) {
        updatedBom = updatedBom.map(b => {
          if (b.id === updated.bomItemId) {
            return {
              ...b,
              partNumber: updated.partNumber || b.partNumber,
              candidateComponent: updated.componentName || b.candidateComponent,
              quantity: updated.quantity || b.quantity,
              packageSize: updated.packageName || b.packageSize,
              supplier: updated.manufacturer || b.supplier
            };
          }
          return b;
        });
      }

      persistChange({
        boardComponents: updatedComponents,
        bom: updatedBom
      });
    },

    deleteProjectComponent: (componentId, scope) => {
      const components = get().boardComponents || [];
      const comp = components.find(c => c.id === componentId);
      if (!comp) return;

      if (scope === 'schematic-only') {
        const updatedComponents = components.map(c => {
          if (c.id === componentId) {
            return {
              ...c,
              schematic: { ...c.schematic, placed: false }
            };
          }
          return c;
        });
        
        const compPrefix = `${componentId}_`;
        const updatedWires = (get().schematicWires || []).filter(w => 
          !w.sourcePinId?.startsWith(compPrefix) && !w.targetPinId?.startsWith(compPrefix)
        );

        persistChange({
          boardComponents: updatedComponents,
          schematicWires: updatedWires
        });
        get().markDerivedArtifactsStale('Schematic component unplaced');
      } 
      else if (scope === 'pcb-only') {
        const updatedComponents = components.map(c => {
          if (c.id === componentId) {
            const updatedPcb = {
              placed: false,
              xMm: undefined,
              yMm: undefined,
              rotationDeg: 0,
              side: 'Top' as const,
              locked: false,
              placementStatus: 'Unplaced' as const
            };
            return applyCanonicalPcbPlacement(c, updatedPcb);
          }
          return c;
        });

        const assignedNets = (get().padNetAssignments || [])
          .filter(a => a.componentId === componentId)
          .map(a => a.netName);
        const updatedTraces = (get().traces || []).filter(t => !assignedNets.includes(t.netName || ''));

        persistChange({
          boardComponents: updatedComponents,
          traces: updatedTraces
        });
        get().markDerivedArtifactsStale('PCB component unplaced');
      } 
      else if (scope === 'entire-product') {
        // Remove component
        const updatedComponents = components.filter(c => c.id !== componentId);

        // Remove BOM item
        const updatedBom = (get().bom || []).filter(b => b.id !== comp.bomItemId && b.componentId !== componentId);

        // Remove wires
        const compPrefix = `${componentId}_`;
        const updatedWires = (get().schematicWires || []).filter(w => 
          !w.sourcePinId?.startsWith(compPrefix) && !w.targetPinId?.startsWith(compPrefix)
        );

        // Remove pad-net assignments
        const assignedNets = (get().padNetAssignments || [])
          .filter(a => a.componentId === componentId)
          .map(a => a.netName);
        const updatedAssignments = (get().padNetAssignments || []).filter(a => a.componentId !== componentId);

        // Remove linked traces
        const updatedTraces = (get().traces || []).filter(t => !assignedNets.includes(t.netName || ''));

        persistChange({
          boardComponents: updatedComponents,
          bom: updatedBom,
          schematicWires: updatedWires,
          padNetAssignments: updatedAssignments,
          traces: updatedTraces
        });

        // Clean up empty nets
        const activeNetNames = new Set(updatedAssignments.map(a => a.netName));
        const updatedNets = (get().nets || []).filter(n => activeNetNames.has(n.netName) || n.netName === 'GND' || n.netName === '3V3' || n.netName === '5V' || n.netName === 'VBAT');
        
        persistChange({ nets: updatedNets });
        get().markDerivedArtifactsStale('Component completely deleted');
      }
    },

    placeComponentOnSchematic: (id, x, y) => {
      const components = get().boardComponents || [];
      const updated = components.map(c => {
        if (c.id === id) {
          return {
            ...c,
            schematic: {
              placed: true,
              x,
              y,
              rotation: c.schematic?.rotation || 0,
              locked: c.schematic?.locked || false
            }
          };
        }
        return c;
      });
      persistChange({ boardComponents: updated });
      get().markDerivedArtifactsStale('Component placed on schematic');
    },

    unplaceComponentFromSchematic: (id) => {
      get().deleteProjectComponent(id, 'schematic-only');
    },

    placeComponentOnBoard: (id, x, y, side) => {
      const components = get().boardComponents || [];
      const updated = components.map(c => {
        if (c.id === id) {
          const updatedPcb = {
            placed: true,
            xMm: x,
            yMm: y,
            rotationDeg: c.pcb?.rotationDeg || 0,
            side: side || c.pcb?.side || 'Top',
            locked: c.pcb?.locked || false,
            placementStatus: 'Placed' as const
          };
          return applyCanonicalPcbPlacement(c, updatedPcb);
        }
        return c;
      });
      persistChange({ boardComponents: updated });
      get().markDerivedArtifactsStale('Component placed on PCB');
    },

    unplaceComponentFromBoard: (id) => {
      get().deleteProjectComponent(id, 'pcb-only');
    },

    createNet: (item) => {
      const id = item.id || `net_${Date.now()}_${Math.random()}`;
      const newItem: NetItem = {
        id,
        netName: item.netName,
        netType: item.netType || 'Signal',
        voltage: item.voltage || '',
        sourceComponent: item.sourceComponent || '',
        sourcePin: item.sourcePin || '',
        targetComponent: item.targetComponent || '',
        targetPin: item.targetPin || '',
        protocol: item.protocol || 'General',
        currentEstimate: item.currentEstimate || '',
        impedanceRequirement: item.impedanceRequirement || '',
        notes: item.notes || ''
      };
      const nets = [...(get().nets || []), newItem];
      persistChange({ nets });
      return newItem;
    },

    getOrCreateNet: (name, data) => {
      const normalized = normalizeNetName(name);
      const nets = get().nets || [];
      const found = nets.find(n => normalizeNetName(n.netName) === normalized);
      if (found) return found;

      return get().createNet({
        netName: normalized,
        netType: (normalized === 'GND' || normalized === '3V3' || normalized === '5V' || normalized === 'VBAT') ? 'Power' : 'Signal',
        voltage: normalized === '3V3' ? '3.3V' : normalized === '5V' ? '5V' : '',
        sourceComponent: data?.sourceComponent || '',
        sourcePin: data?.sourcePin || '',
        targetComponent: data?.targetComponent || '',
        targetPin: data?.targetPin || '',
        protocol: data?.protocol || '',
        currentEstimate: data?.currentEstimate || '',
        impedanceRequirement: data?.impedanceRequirement || '',
        notes: data?.notes || ''
      });
    },

    connectComponentPins: (sourceComponentId, sourcePinNumber, targetComponentId, targetPinNumber, netName, points) => {
      const activeNetName = netName || `NET_${Date.now()}`;
      const net = get().getOrCreateNet(activeNetName);

      // Create pad net assignments
      const assignments = get().padNetAssignments || [];
      const newAssignments: PadNetAssignment[] = [...assignments];

      const addAssignmentUnique = (compId: string, pinNum: string) => {
        const exists = newAssignments.some(a => a.componentId === compId && a.padName === pinNum);
        if (!exists) {
          const comp = (get().boardComponents || []).find(c => c.id === compId);
          const refDes = comp ? comp.referenceDesignator : '';
          newAssignments.push({
            id: `assignment_${Date.now()}_${Math.random()}`,
            componentId: compId,
            referenceDesignator: refDes,
            padName: pinNum,
            netName: net.netName
          });
        }
      };

      addAssignmentUnique(sourceComponentId, sourcePinNumber);
      addAssignmentUnique(targetComponentId, targetPinNumber);

      // Update component pins list
      const updatedComponents = (get().boardComponents || []).map(c => {
        if (c.id === sourceComponentId || c.id === targetComponentId) {
          const pinNum = c.id === sourceComponentId ? sourcePinNumber : targetPinNumber;
          const updatedPins = (c.pins || []).map(p => {
            if (p.pinNumber === pinNum) {
              return { ...p, netId: net.id, netName: net.netName };
            }
            return p;
          });
          return { ...c, pins: updatedPins };
        }
        return c;
      });

      // Create schematic wire with structured anchors
      const wireId = `wire_${Date.now()}_${Math.random()}`;
      const wire: SchematicWire = {
        id: wireId,
        netId: net.id || `net_${Date.now()}`,
        netName: net.netName,
        points: points || [],
        sourcePinId: `${sourceComponentId}_${sourcePinNumber}`,
        targetPinId: `${targetComponentId}_${targetPinNumber}`,
        sourceAnchor: { type: 'pin', componentId: sourceComponentId, pinNumber: String(sourcePinNumber) },
        targetAnchor: { type: 'pin', componentId: targetComponentId, pinNumber: String(targetPinNumber) },
        status: 'Connected'
      };

      const updatedWires = [...(get().schematicWires || []), wire];

      persistChange({
        boardComponents: updatedComponents,
        schematicWires: updatedWires,
        padNetAssignments: newAssignments
      });

      get().markDerivedArtifactsStale('Pins connected via wire');

      return {
        wire,
        net,
        assignments: newAssignments.filter(a => a.netName === net.netName)
      };
    },

    disconnectComponentPin: (componentId, pinNumber) => {
      const updatedComponents = (get().boardComponents || []).map(c => {
        if (c.id === componentId) {
          const updatedPins = (c.pins || []).map(p => {
            if (p.pinNumber === pinNumber) {
              return { ...p, netId: undefined, netName: '' };
            }
            return p;
          });
          return { ...c, pins: updatedPins };
        }
        return c;
      });

      const updatedAssignments = (get().padNetAssignments || []).filter(a => 
        !(a.componentId === componentId && a.padName === pinNumber)
      );

      const pinId = `${componentId}_${pinNumber}`;
      const updatedWires = (get().schematicWires || []).filter(w => 
        w.sourcePinId !== pinId && w.targetPinId !== pinId
      );

      persistChange({
        boardComponents: updatedComponents,
        padNetAssignments: updatedAssignments,
        schematicWires: updatedWires
      });

      get().markDerivedArtifactsStale('Pin disconnected');
    },

    deleteNetSafely: (netName) => {
      const net = (get().nets || []).find(n => n.netName === netName);
      if (!net) return;

      const updatedComponents = (get().boardComponents || []).map(c => {
        const updatedPins = (c.pins || []).map(p => {
          if (p.netId === net.id || p.netName === netName) {
            return { ...p, netId: undefined, netName: '' };
          }
          return p;
        });
        return { ...c, pins: updatedPins };
      });

      const updatedAssignments = (get().padNetAssignments || []).filter(a => a.netName !== net.netName);
      const updatedWires = (get().schematicWires || []).filter(w => w.netId !== net.id && w.netName !== net.netName);
      const updatedTraces = (get().traces || []).filter(t => t.netId !== net.id && t.netName !== net.netName);
      const updatedNets = (get().nets || []).filter(n => n.id !== net.id && n.netName !== net.netName);

      persistChange({
        boardComponents: updatedComponents,
        padNetAssignments: updatedAssignments,
        schematicWires: updatedWires,
        traces: updatedTraces,
        nets: updatedNets
      });

      get().markDerivedArtifactsStale('Net safely deleted');
    },

    addCustomComponentDefinition: (def) => {
      const list = get().customComponentLibrary || [];
      const updated = [...list, def];
      persistChange({ customComponentLibrary: updated });
    },

    updateCustomComponentDefinition: (id, def) => {
      const list = get().customComponentLibrary || [];
      const updated = list.map(x => x.libraryId === id ? { ...x, ...def } as ElectronicComponentDefinition : x);
      persistChange({ customComponentLibrary: updated });
    },

    deleteCustomComponentDefinition: (id) => {
      const list = get().customComponentLibrary || [];
      const updated = list.filter(x => x.libraryId !== id);
      persistChange({ customComponentLibrary: updated });
    },

    duplicateComponentDefinition: (id) => {
      const list = get().customComponentLibrary || [];
      const found = list.find(x => x.libraryId === id);
      if (found) {
        const copy: ElectronicComponentDefinition = {
          ...found,
          libraryId: `${found.libraryId}-copy-${Date.now()}`,
          name: `${found.name} Copy`
        };
        persistChange({ customComponentLibrary: [...list, copy] });
      }
    },

    markDerivedArtifactsStale: (reason) => {
      console.log(`[Stale Trigger] ${reason}`);
      set({
        blueprintPackStatus: 'Stale',
        factoryPackageStatus: 'Needs Review'
      });
    },

    updateProjectState: (patch) => {
      persistChange(patch);
    },

    // ----------------------------------------------------
    // Shared Product Graph CRUD
    // ----------------------------------------------------
    addRequirement: (req) => {
      const id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const list = get().requirements || [];
      persistChange({ requirements: [...list, { ...req, id }] });
    },

    updateRequirement: (id, data) => {
      const list = get().requirements || [];
      const updated = list.map(r => r.id === id ? { ...r, ...data } : r);
      persistChange({ requirements: updated });
    },

    deleteRequirement: (id) => {
      const list = get().requirements || [];
      const updated = list.filter(r => r.id !== id);
      persistChange({ requirements: updated });
    },

    addArchitectureNode: (node) => {
      const id = `arch_node_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const list = get().architectureNodes || [];
      persistChange({ architectureNodes: [...list, { ...node, id }] });
    },

    updateArchitectureNode: (id, data) => {
      const list = get().architectureNodes || [];
      const updated = list.map(n => n.id === id ? { ...n, ...data } : n);
      persistChange({ architectureNodes: updated });
    },

    deleteArchitectureNode: (id) => {
      const list = get().architectureNodes || [];
      const updated = list.filter(n => n.id !== id);
      persistChange({ architectureNodes: updated });
    },

    addMechanicalObject: (obj) => {
      const id = obj.id || `mech_obj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const list = get().mechanicalObjects || [];
      persistChange({ mechanicalObjects: [...list, { ...obj, id }] });
    },

    updateMechanicalObject: (id, data) => {
      const list = get().mechanicalObjects || [];
      const updated = list.map(o => o.id === id ? { ...o, ...data } : o);
      persistChange({ mechanicalObjects: updated });
    },

    deleteMechanicalObject: (id) => {
      const list = get().mechanicalObjects || [];
      const updated = list.filter(o => o.id !== id);
      persistChange({ mechanicalObjects: updated });
    },

    addFirmwareModule: (mod) => {
      const id = `fw_mod_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const list = get().firmwareModules || [];
      persistChange({ firmwareModules: [...list, { ...mod, id }] });
    },

    updateFirmwareModule: (id, data) => {
      const list = get().firmwareModules || [];
      const updated = list.map(m => m.id === id ? { ...m, ...data } : m);
      persistChange({ firmwareModules: updated });
    },

    deleteFirmwareModule: (id) => {
      const list = get().firmwareModules || [];
      const updated = list.filter(m => m.id !== id);
      persistChange({ firmwareModules: updated });
    },

    addValidationTest: (test) => {
      const id = `val_test_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const list = get().validationTests || [];
      persistChange({ validationTests: [...list, { ...test, id }] });
    },

    updateValidationTest: (id, data) => {
      const list = get().validationTests || [];
      const updated = list.map(t => t.id === id ? { ...t, ...data } : t);
      persistChange({ validationTests: updated });
    },

    deleteValidationTest: (id) => {
      const list = get().validationTests || [];
      const updated = list.filter(t => t.id !== id);
      persistChange({ validationTests: updated });
    },

    applyLegacyValidationAdoptionPlan: (plan) => {
      const state = get();

      if (!plan.canApply) {
        return { success: false, reason: 'Validation adoption plan is not fully resolved and cannot be applied.' };
      }
      if (plan.projectId !== state.id) {
        return { success: false, reason: 'Validation adoption plan belongs to a different project.' };
      }
      if (plan.sourceRevision !== state.version) {
        return { success: false, reason: 'Project revision changed after validation review. Regenerate the preview and plan.' };
      }
      if ((state.validationTests || []).length > 0) {
        return { success: false, reason: 'Canonical validation already exists. Reconciliation is required.' };
      }

      const patch = projectPatchFromLegacyValidationApplyPlan(plan);
      get().executeProjectCommand(
        'ADOPT_LEGACY_VALIDATION',
        `Adopt reviewed legacy validation (${plan.adoptionSessionId})`,
        () => {
          persistChange(patch);
        },
      );

      return { success: true };
    },

    applyLegacyValidationReconciliationPlan: async (plan) => {
      const state = get();

      if (!plan.canApply) {
        return { success: false, reason: 'Validation reconciliation plan is not fully resolved and cannot be applied.' };
      }
      if (plan.projectId !== state.id) {
        return { success: false, reason: 'Validation reconciliation plan belongs to a different project.' };
      }

      const currentPreview = await previewLegacyValidationReconciliation(state as ProjectState);
      const currentFingerprint = await fingerprintLegacyValidationReconciliation(currentPreview);
      if (currentFingerprint !== plan.previewFingerprint) {
        return {
          success: false,
          reason: 'Validation reconciliation preview is stale because source or canonical validation changed after review.',
        };
      }

      const patch = projectPatchFromValidationReconciliationPlan(plan);
      get().executeProjectCommand(
        'RECONCILE_LEGACY_VALIDATION',
        `Apply reviewed legacy validation reconciliation (${plan.previewFingerprint.slice(0, 18)})`,
        () => {
          persistChange(patch);
        },
      );

      return { success: true };
    },

    // Architecture Connections
    addArchitectureConnection: (conn) => {
      const id = `arch_conn_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const list = get().architectureConnections || [];
      persistChange({ architectureConnections: [...list, { ...conn, id }] });
    },

    updateArchitectureConnection: (id, data) => {
      const list = get().architectureConnections || [];
      const updated = list.map(c => c.id === id ? { ...c, ...data } : c);
      persistChange({ architectureConnections: updated });
    },

    deleteArchitectureConnection: (id) => {
      const list = get().architectureConnections || [];
      const updated = list.filter(c => c.id !== id);
      persistChange({ architectureConnections: updated });
    },

    applyLegacyArchitectureAdoptionPlan: (plan) => {
      const state = get();

      if (!plan.canApply) {
        return { success: false, reason: 'Adoption plan is not fully resolved and cannot be applied.' };
      }
      if (plan.projectId !== state.id) {
        return { success: false, reason: 'Adoption plan belongs to a different project.' };
      }
      if (plan.sourceRevision !== state.version) {
        return { success: false, reason: 'Project revision changed after adoption review. Regenerate the preview and plan.' };
      }
      if ((state.architectureNodes || []).length > 0 || (state.architectureConnections || []).length > 0) {
        return { success: false, reason: 'Canonical architecture already exists. Reconciliation is required.' };
      }

      const patch = projectPatchFromLegacyArchitectureApplyPlan(plan);
      get().executeProjectCommand(
        'ADOPT_LEGACY_ARCHITECTURE',
        `Adopt reviewed legacy architecture (${plan.adoptionSessionId})`,
        () => {
          persistChange(patch);
        },
      );

      return { success: true };
    },

    applyLegacyArchitectureReconciliationPlan: async (plan) => {
      const state = get();

      if (!plan.canApply) {
        return { success: false, reason: 'Reconciliation plan is not fully resolved and cannot be applied.' };
      }
      if (plan.projectId !== state.id) {
        return { success: false, reason: 'Reconciliation plan belongs to a different project.' };
      }

      const currentPreview = await previewLegacyArchitectureReconciliation(state as ProjectState);
      const currentFingerprint = await fingerprintLegacyArchitectureReconciliation(currentPreview);
      if (currentFingerprint !== plan.previewFingerprint) {
        return {
          success: false,
          reason: 'Reconciliation preview is stale because source or canonical architecture changed after review.',
        };
      }

      const patch = projectPatchFromArchitectureReconciliationPlan(plan);
      get().executeProjectCommand(
        'RECONCILE_LEGACY_ARCHITECTURE',
        `Apply reviewed legacy architecture reconciliation (${plan.previewFingerprint.slice(0, 18)})`,
        () => {
          persistChange(patch);
        },
      );

      return { success: true };
    },

    // Mechanical Dimensions
    addMechanicalDimension: (dim) => {
      const id = `mech_dim_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const list = get().mechanicalDimensions || [];
      persistChange({ mechanicalDimensions: [...list, { ...dim, id }] });
    },

    updateMechanicalDimension: (id, data) => {
      const list = get().mechanicalDimensions || [];
      const updated = list.map(d => d.id === id ? { ...d, ...data } : d);
      persistChange({ mechanicalDimensions: updated });
    },

    deleteMechanicalDimension: (id) => {
      const list = get().mechanicalDimensions || [];
      const updated = list.filter(d => d.id !== id);
      persistChange({ mechanicalDimensions: updated });
    },

    // Firmware States
    addFirmwareState: (state) => {
      const id = `fw_state_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const list = get().firmwareStates || [];
      persistChange({ firmwareStates: [...list, { ...state, id }] });
    },

    updateFirmwareState: (id, data) => {
      const list = get().firmwareStates || [];
      const updated = list.map(s => s.id === id ? { ...s, ...data } : s);
      persistChange({ firmwareStates: updated });
    },

    deleteFirmwareState: (id) => {
      const list = get().firmwareStates || [];
      const updated = list.filter(s => s.id !== id);
      persistChange({ firmwareStates: updated });
      // Also remove transitions referencing this state
      const transitions = get().firmwareTransitions || [];
      const cleanedTransitions = transitions.filter(
        t => t.sourceStateId !== id && t.targetStateId !== id
      );
      persistChange({ firmwareTransitions: cleanedTransitions });
    },

    // Firmware Transitions
    addFirmwareTransition: (trans) => {
      const id = `fw_trans_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const list = get().firmwareTransitions || [];
      persistChange({ firmwareTransitions: [...list, { ...trans, id }] });
    },

    updateFirmwareTransition: (id, data) => {
      const list = get().firmwareTransitions || [];
      const updated = list.map(t => t.id === id ? { ...t, ...data } : t);
      persistChange({ firmwareTransitions: updated });
    },

    deleteFirmwareTransition: (id) => {
      const list = get().firmwareTransitions || [];
      const updated = list.filter(t => t.id !== id);
      persistChange({ firmwareTransitions: updated });
    },

    // ----------------------------------------------------
    // Command History & Pointer Transaction System
    // ----------------------------------------------------
    activeTransaction: null,

    beginCommand: (type: string, description: string) => {
      const snapshotKeys: (keyof Project)[] = [
        'nodes', 'edges', 'bom', 'testing', 'powerBudget', 'pinMap', 'firmwareTasks',
        'boards', 'circuitBlocks', 'boardComponents', 'nets', 'pcbConstraints',
        'mechanicalZones', 'assemblyLayers', 'schematicSymbols', 'schematicConnections',
        'schematicWires', 'pcbLayers', 'copperShapes', 'traces', 'vias', 'drillHoles',
        'boardOutlines', 'pcbRules', 'reviewResults', 'padNetAssignments', 'keepoutZones',
        'requirements', 'architectureNodes', 'architectureConnections', 'architectureReconciliationSuppressions', 'mechanicalObjects', 'mechanicalDimensions',
        'mechanicalBodies', 'firmwareModules', 'firmwareStates', 'firmwareTransitions', 'validationTests', 'validationReconciliationSuppressions'
      ];

      const state = get();
      const beforeSnapshot: Partial<Project> = {};
      snapshotKeys.forEach(k => {
        if (state[k] !== undefined) {
          beforeSnapshot[k] = JSON.parse(JSON.stringify(state[k]));
        }
      });

      set({
        activeTransaction: {
          type,
          description,
          beforeSnapshot
        }
      });
    },

    updateTransientPreview: (patch: Partial<Project>) => {
      set(patch);
    },

    commitCommand: (finalPatch?: Partial<Project>) => {
      const tx = get().activeTransaction;
      if (finalPatch) {
        set(finalPatch);
      }
      
      const snapshotKeys: (keyof Project)[] = [
        'nodes', 'edges', 'bom', 'testing', 'powerBudget', 'pinMap', 'firmwareTasks',
        'boards', 'circuitBlocks', 'boardComponents', 'nets', 'pcbConstraints',
        'mechanicalZones', 'assemblyLayers', 'schematicSymbols', 'schematicConnections',
        'schematicWires', 'pcbLayers', 'copperShapes', 'traces', 'vias', 'drillHoles',
        'boardOutlines', 'pcbRules', 'reviewResults', 'padNetAssignments', 'keepoutZones',
        'requirements', 'architectureNodes', 'architectureConnections', 'architectureReconciliationSuppressions', 'mechanicalObjects', 'mechanicalDimensions',
        'mechanicalBodies', 'firmwareModules', 'firmwareStates', 'firmwareTransitions', 'validationTests', 'validationReconciliationSuppressions'
      ];

      const updatedState = get();
      const afterSnapshot: Partial<Project> = {};
      snapshotKeys.forEach(k => {
        if (updatedState[k] !== undefined) {
          afterSnapshot[k] = JSON.parse(JSON.stringify(updatedState[k]));
        }
      });

      const beforeSnapshot = tx?.beforeSnapshot || {};
      const type = tx?.type || 'USER_ACTION';
      const description = tx?.description || 'User interaction';

      const newPast = [
        ...(get().pastCommands || []),
        {
          type,
          description,
          snapshot: JSON.stringify({ before: beforeSnapshot, after: afterSnapshot })
        }
      ];

      set({ activeTransaction: null });
      persistChange({
        pastCommands: newPast,
        futureCommands: []
      });

      get().markDerivedArtifactsStale(description);
    },

    cancelCommand: () => {
      const tx = get().activeTransaction;
      if (tx && tx.beforeSnapshot) {
        set({
          ...tx.beforeSnapshot,
          activeTransaction: null
        });
      } else {
        set({ activeTransaction: null });
      }
    },

    executeProjectCommand: (type, description, applyChange) => {
      const snapshotKeys: (keyof Project)[] = [
        'nodes', 'edges', 'bom', 'testing', 'powerBudget', 'pinMap', 'firmwareTasks',
        'boards', 'circuitBlocks', 'boardComponents', 'nets', 'pcbConstraints',
        'mechanicalZones', 'assemblyLayers', 'schematicSymbols', 'schematicConnections',
        'schematicWires', 'pcbLayers', 'copperShapes', 'traces', 'vias', 'drillHoles',
        'boardOutlines', 'pcbRules', 'reviewResults', 'padNetAssignments', 'keepoutZones',
        'requirements', 'architectureNodes', 'architectureConnections', 'architectureReconciliationSuppressions', 'mechanicalObjects', 'mechanicalDimensions',
        'mechanicalBodies', 'firmwareModules', 'firmwareStates', 'firmwareTransitions', 'validationTests', 'validationReconciliationSuppressions'
      ];

      const state = get();
      const beforeSnapshot: Partial<Project> = {};
      snapshotKeys.forEach(k => {
        if (state[k] !== undefined) {
          beforeSnapshot[k] = JSON.parse(JSON.stringify(state[k]));
        }
      });

      applyChange();

      const updatedState = get();
      const afterSnapshot: Partial<Project> = {};
      snapshotKeys.forEach(k => {
        if (updatedState[k] !== undefined) {
          afterSnapshot[k] = JSON.parse(JSON.stringify(updatedState[k]));
        }
      });

      const newPast = [
        ...(get().pastCommands || []),
        {
          type,
          description,
          snapshot: JSON.stringify({ before: beforeSnapshot, after: afterSnapshot })
        }
      ];

      persistChange({
        pastCommands: newPast,
        futureCommands: []
      });

      get().markDerivedArtifactsStale(description);
    },

    undoProjectCommand: () => {
      const past = get().pastCommands || [];
      if (past.length === 0) return;

      const lastCmd = past[past.length - 1];
      const newPast = past.slice(0, -1);
      const { before } = JSON.parse(lastCmd.snapshot);

      persistChange({
        ...before,
        pastCommands: newPast,
        futureCommands: [
          ...(get().futureCommands || []),
          lastCmd
        ]
      });

      get().markDerivedArtifactsStale(`Undo: ${lastCmd.description}`);
    },

    redoProjectCommand: () => {
      const future = get().futureCommands || [];
      if (future.length === 0) return;

      const nextCmd = future[future.length - 1];
      const newFuture = future.slice(0, -1);
      const { after } = JSON.parse(nextCmd.snapshot);

      persistChange({
        ...after,
        pastCommands: [
          ...(get().pastCommands || []),
          nextCmd
        ],
        futureCommands: newFuture
      });

      get().markDerivedArtifactsStale(`Redo: ${nextCmd.description}`);
    },

    exportProjectJSON: () => {
      const cleanData = getCleanProjectData(get() as ProjectState);
      return serializeProject(cleanData);
    },

    importProjectJSON: (rawInput: string | object) => {
      const jsonString = typeof rawInput === 'string' ? rawInput : JSON.stringify(rawInput);
      const deserialized = deserializeProject(jsonString);
      const migrated = migrateProjectSchema(deserialized);
      const issues = validateProjectIntegrity(migrated);

      const cleanProject = getCleanProjectData({
        ...get(),
        ...migrated,
        activeBoardId: migrated.activeBoardId || ''
      } as ProjectState);
      const saved = getSavedProjects();
      saved[cleanProject.id] = cleanProject;
      saveProjectsToStorage(saved, cleanProject.id);

      set({
        ...cleanProject,
        projectsList: syncProjectsList(saved)
      });

      return { success: issues.filter(i => i.severity === 'Error').length === 0, issues };
    }
  };
});
