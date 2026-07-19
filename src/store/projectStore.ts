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
  SchematicWire
} from '../types';
import { templates } from '../data/templates';
import {
  generateEditorLayouts,
  autoPlaceComponents,
  autoCreateNetsFromPinMap,
  autoCreatePinMapFromCircuits,
  autoCreateFirmwareTasksFromHardware,
  autoCreateTestsFromHardware,
  autoCreateHandoffChecklist,
  fixMissingDimensionsWithPlaceholder,
  getInitialFactoryFiles
} from '../lib/editorLayoutGenerators';
import { ElectronicComponentDefinition } from '../lib/components/componentLibrary';
import { runDesignReview } from '../lib/designReview';
import { generateBlueprintPack as generateBlueprintPackFn } from '../lib/blueprintGenerator';
import { 
  migrateProjectSchema,
  normalizeProjectComponent,
  syncLegacyPlacementFields,
  syncNestedPcbFields
} from '../lib/projectMigrations';

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
  generateBOMFromMVP: () => void;

  // Testing management
  addTestStage: (stage: Omit<TestStage, 'id'> & { id?: string }) => string;
  updateTestStage: (id: string, data: Partial<TestStage>) => void;
  deleteTestStage: (id: string) => void;
  duplicateTestStage: (id: string) => void;
  reorderTestStages: (stages: TestStage[]) => void;
  generateTestsFromMVP: () => void;

  // Power budget management
  addPowerItem: (item: Omit<PowerBudgetItem, 'id'>) => void;
  updatePowerItem: (id: string, data: Partial<PowerBudgetItem>) => void;
  deletePowerItem: (id: string) => void;
  setBatteryCapacity: (mah: number) => void;
  generatePowerFromBlueprint: () => void;

  // Pin map management
  addPinItem: (item: Omit<PinMapItem, 'id'>) => void;
  updatePinItem: (id: string, data: Partial<PinMapItem>) => void;
  deletePinItem: (id: string) => void;
  generatePinMapFromBlueprint: () => void;

  // Firmware task management
  addFirmwareTask: (task: Omit<FirmwareTask, 'id'>) => void;
  updateFirmwareTask: (id: string, data: Partial<FirmwareTask>) => void;
  deleteFirmwareTask: (id: string) => void;
  generateFirmwareTasksFromBlueprint: () => void;

  // Board Studio management
  addBoard: (item: Omit<BoardItem, 'id'>) => BoardItem;
  updateBoard: (id: string, data: Partial<BoardItem>) => void;
  deleteBoard: (id: string) => void;

  addCircuitBlock: (item: Omit<CircuitBlock, 'id'>) => void;
  updateCircuitBlock: (id: string, data: Partial<CircuitBlock>) => void;
  deleteCircuitBlock: (id: string) => void;

  addBoardComponent: (item: Omit<BoardComponent, 'id'> & { id?: string }) => void;
  updateBoardComponent: (id: string, data: Partial<BoardComponent>) => void;
  deleteBoardComponent: (id: string) => void;

  addNet: (item: Omit<NetItem, 'id'>) => void;
  updateNet: (id: string, data: Partial<NetItem>) => void;
  deleteNet: (id: string) => void;

  addPCBConstraint: (item: Omit<PCBConstraint, 'id'>) => void;
  updatePCBConstraint: (id: string, data: Partial<PCBConstraint>) => void;
  deletePCBConstraint: (id: string) => void;

  addChecklistItem: (item: Omit<ManufacturingChecklistItem, 'id'>) => void;
  updateChecklistItem: (id: string, data: Partial<ManufacturingChecklistItem>) => void;
  deleteChecklistItem: (id: string) => void;

  generateBoardPlanFromProduct: () => void;
  generateCircuitsFromBlueprint: () => void;
  generateBoardComponentsFromBOM: () => void;
  generateNetsFromPinMap: () => void;
  generatePCBConstraintsFromBoard: () => void;
  generateManufacturingChecklist: () => void;
  generateFullProductPlan: () => { success: boolean; summary: string };

  // Project Actions
  saveActiveProject: () => void;
  saveProjectAsCopy: (name: string) => void;
  loadProject: (id: string) => void;
  deleteProject: (id: string) => void;
  loadProjectFromTemplate: (templateId: string) => void;
  resetProject: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  importProjectJSON: (json: any) => { success: boolean; error?: string };
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
  autoPlaceComponents: () => void;
  autoCreateNetsFromPinMap: () => void;
  autoCreatePinMapFromCircuits: () => void;
  autoCreateFirmwareTasksFromHardware: () => void;
  autoCreateTestsFromHardware: () => void;
  autoCreateHandoffChecklist: () => void;
  fixMissingDimensionsWithPlaceholder: () => void;
  addRequiredFactoryFileChecklist: () => void;
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
}

const PROJECTS_KEY = 'hardware_studio_projects_v1';
const ACTIVE_ID_KEY = 'hardware_studio_active_project_id_v1';
const OLD_KEY = 'hardware_studio_system_alpha_project';

// Helpers to load/save list of projects from local storage
const getSavedProjects = (): Record<string, Project> => {
  if (typeof window === 'undefined') return {};
  try {
    const savedStr = window.localStorage.getItem(PROJECTS_KEY);
    if (savedStr) {
      return JSON.parse(savedStr);
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
      window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(initialProjects));
      window.localStorage.setItem(ACTIVE_ID_KEY, initial.id);
      return initialProjects;
    }
  } catch (e) {
    console.error("Failed to load projects from storage:", e);
  }
  return {};
};

const getActiveId = (): string => {
  if (typeof window === 'undefined') return 'the-ring';
  return window.localStorage.getItem(ACTIVE_ID_KEY) || 'the-ring';
};

const saveProjectsToStorage = (projects: Record<string, Project>, activeId: string) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    window.localStorage.setItem(ACTIVE_ID_KEY, activeId);
  } catch (e) {
    console.error("Failed to save projects to storage:", e);
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
      activeBoardId: state.activeBoardId || 'board-main'
    };
  };

  const persistChange = (updatedState: Partial<ProjectState>) => {
    const currentState = { ...get(), ...updatedState };
    const cleanProject = getCleanProjectData(currentState as ProjectState);
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
    activeBoardId: initialProject.activeBoardId || 'board-main',

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

    generateBOMFromMVP: () => {
      const mvpNodes = get().nodes.filter(n => n.type === 'blockNode' && n.data?.status === 'MVP');
      const bom = [...get().bom];
      
      mvpNodes.forEach(node => {
        const compName = node.data.candidateComponents || "";
        if (!compName) return;

        // Avoid duplicate by blockName
        const exists = bom.some(item => item.blockName.toLowerCase() === node.data.name.toLowerCase());
        if (!exists) {
          bom.push({
            id: `bom_${Math.random()}_${Date.now()}`,
            blockName: node.data.name,
            candidateComponent: compName,
            partNumber: "",
            stage: "Prototype",
            quantity: 1,
            voltage: "",
            currentEstimate: "",
            interface: "",
            packageSize: "",
            dimensions: "",
            costEstimate: "0.00",
            supplier: "",
            supplierUrl: node.data.supplierUrl || "",
            datasheetUrl: node.data.datasheetUrl || "",
            status: "Not Started",
            risk: node.data.risks || "",
            alternative: "",
            notes: node.data.notes || ""
          });
        }
      });
      
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

    generateTestsFromMVP: () => {
      const mvpNodes = get().nodes.filter(n => n.type === 'blockNode' && n.data?.status === 'MVP');
      const testing = [...get().testing];

      mvpNodes.forEach(node => {
        const nameLower = node.data.name.toLowerCase();
        let testName = "";
        let testGoal = "";
        let testSteps = "";
        let passCriteria = "";
        let testCat = "General";

        if (nameLower.includes("button") || nameLower.includes("touch")) {
          testName = `${node.data.name} Debounce Test`;
          testGoal = "Ensure hardware clicks register exactly once in firmware.";
          testSteps = "1. Connect logic analyzer to input pin.\n2. Click button 50 times at variable speeds.\n3. Verify no noise spikes register.";
          passCriteria = "Zero false triggers, max bounce duration < 10ms.";
          testCat = "Interaction";
        } else if (nameLower.includes("haptic") || nameLower.includes("vibrat")) {
          testName = `${node.data.name} Pulse Validation`;
          testGoal = "Check vibration pattern strength and pulse latency.";
          testSteps = "1. Trigger vibration patterns over BLE.\n2. Verify duty cycle transitions.\n3. Measure mechanical chassis buzz.";
          passCriteria = " Buzz is distinct and latency is under 15ms.";
          testCat = "Interaction";
        } else if (nameLower.includes("mcu") || nameLower.includes("controller")) {
          testName = `${node.data.name} Standby Current Test`;
          testGoal = "Measure power draw in MCU low power deep sleep.";
          testSteps = "1. Connect power profiler to VDD line.\n2. Trigger deep sleep via debug serial.\n3. Measure average current draw.";
          passCriteria = "Average deep sleep current is below 15uA.";
          testCat = "Power";
        } else if (nameLower.includes("battery") || nameLower.includes("power")) {
          testName = `${node.data.name} Load Discharge Test`;
          testGoal = "Map battery discharge cycle under continuous operations.";
          testSteps = "1. Power device with active BLE beacon.\n2. Log battery voltage decline.\n3. Check shutdown cut-off threshold.";
          passCriteria = "Device functions for expected runtime hours, clean cutoff at 3.0V.";
          testCat = "Power";
        } else if (nameLower.includes("casing") || nameLower.includes("shell") || nameLower.includes("mechanical")) {
          testName = `${node.data.name} Drop Survivability`;
          testGoal = "Check mechanical casing integrity and structural bonds.";
          testSteps = "1. Drop casing from 1.5m onto concrete.\n2. Repeat 10 times at multiple angles.\n3. Verify zero splits or circuit releases.";
          passCriteria = "Casing remains fully locked, zero fractures.";
          testCat = "Mechanical";
        }

        if (testName) {
          // Avoid duplicate by name
          const exists = testing.some(t => t.name.toLowerCase() === testName.toLowerCase());
          if (!exists) {
            testing.push({
              id: `stage_gen_${Math.random()}_${Date.now()}`,
              name: testName,
              goal: testGoal,
              partsNeeded: "Prototype Unit, Test Instruments",
              steps: testSteps,
              passCriteria,
              risks: node.data.risks || "",
              status: "Not Started",
              notes: node.data.notes || "",
              category: testCat,
              linkedBlocks: [node.id],
              resultNotes: "",
              evidenceLink: "",
              order: testing.length
            });
          }
        }
      });

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

    generatePowerFromBlueprint: () => {
      const activeNodes = get().nodes.filter(n => n.type === 'blockNode' && (n.data?.category === 'Electronics' || n.data?.category === 'Power' || n.data?.category === 'Interaction'));
      const powerBudget = [...get().powerBudget];

      activeNodes.forEach(node => {
        const nameLower = node.data.name.toLowerCase();
        const volt = "3.3";
        let activeI = 1.0;
        let sleepI = 5.0;

        if (nameLower.includes("mcu") || nameLower.includes("controller")) {
          activeI = 15.0;
          sleepI = 15.0;
        } else if (nameLower.includes("haptic") || nameLower.includes("vibrat")) {
          activeI = 80.0;
          sleepI = 0.0;
        } else if (nameLower.includes("led")) {
          activeI = 5.0;
          sleepI = 0.0;
        } else if (nameLower.includes("sensor") || nameLower.includes("imu")) {
          activeI = 2.0;
          sleepI = 2.0;
        } else if (nameLower.includes("battery") || nameLower.includes("ldo") || nameLower.includes("casing") || nameLower.includes("window")) {
          return; // Skip passive nodes
        }

        const exists = powerBudget.some(p => p.blockName.toLowerCase() === node.data.name.toLowerCase());
        if (!exists) {
          powerBudget.push({
            id: `pwr_gen_${Math.random()}_${Date.now()}`,
            blockName: node.data.name,
            voltage: volt,
            activeCurrentMa: activeI,
            sleepCurrentUa: sleepI,
            dutyCyclePercent: 1.0,
            quantity: 1,
            notes: node.data.purpose || "Generated from blueprint block."
          });
        }
      });

      persistChange({ powerBudget });
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

    generatePinMapFromBlueprint: () => {
      const activeNodes = get().nodes.filter(n => n.type === 'blockNode');
      const pinMap = [...get().pinMap];

      activeNodes.forEach(node => {
        const nameLower = node.data.name.toLowerCase();
        let sig = "";
        let dir: 'Input' | 'Output' | 'Bidirectional' | 'Power' | 'Ground' = 'Input';
        let prot: 'GPIO' | 'I2C' | 'SPI' | 'UART' | 'PWM' | 'ADC' | 'Touch' | 'Power' | 'Ground' = 'GPIO';

        if (nameLower.includes("touch") || nameLower.includes("button")) {
          sig = `${node.data.name.replace(/\s+/g, '_').toUpperCase()}_SIG`;
          dir = 'Input';
          prot = nameLower.includes("touch") ? 'Touch' : 'GPIO';
        } else if (nameLower.includes("haptic") || nameLower.includes("vibrat")) {
          sig = `HAPTIC_PWM`;
          dir = 'Output';
          prot = 'PWM';
        } else if (nameLower.includes("led")) {
          sig = `LED_GPIO`;
          dir = 'Output';
          prot = 'GPIO';
        } else if (nameLower.includes("imu") || nameLower.includes("sensor")) {
          sig = `SENSOR_SCL_SDA`;
          dir = 'Bidirectional';
          prot = 'I2C';
        } else if (nameLower.includes("uart") || nameLower.includes("debug")) {
          sig = `UART_TX_RX`;
          dir = 'Bidirectional';
          prot = 'UART';
        } else {
          return; // Skip if it doesn't clearly match active signals
        }

        const exists = pinMap.some(p => p.connectedBlock.toLowerCase() === node.data.name.toLowerCase());
        if (!exists) {
          pinMap.push({
            id: `pin_gen_${Math.random()}_${Date.now()}`,
            signalName: sig,
            connectedBlock: node.data.name,
            mcuPin: "",
            direction: dir,
            protocol: prot,
            voltage: "3.3V",
            notes: node.data.purpose || "Generated from blueprint."
          });
        }
      });

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

    generateFirmwareTasksFromBlueprint: () => {
      const activeNodes = get().nodes.filter(n => n.type === 'blockNode' && (n.data?.category === 'Firmware' || n.data?.category === 'Electronics' || n.data?.category === 'Interaction'));
      const firmwareTasks = [...get().firmwareTasks];

      activeNodes.forEach(node => {
        const nameLower = node.data.name.toLowerCase();
        let tName = "";
        let tType: 'State' | 'Driver' | 'BLE' | 'Power' | 'Safety' | 'Test' | 'Integration' = 'Driver';
        const desc = node.data.description || "";
        const ac = node.data.requirements || "Verified compiler load.";

        if (nameLower.includes("state") || nameLower.includes("loop")) {
          tName = `${node.data.name} Logic Loop`;
          tType = 'State';
        } else if (nameLower.includes("ble") || nameLower.includes("wireless") || nameLower.includes("advertising")) {
          tName = `${node.data.name} Radio Driver`;
          tType = 'BLE';
        } else if (nameLower.includes("power") || nameLower.includes("sleep")) {
          tName = `${node.data.name} Power Rule`;
          tType = 'Power';
        } else if (nameLower.includes("button") || nameLower.includes("touch") || nameLower.includes("haptic") || nameLower.includes("led") || nameLower.includes("sensor")) {
          tName = `${node.data.name} Driver Interface`;
          tType = 'Driver';
        } else {
          return;
        }

        const exists = firmwareTasks.some(f => f.name.toLowerCase() === tName.toLowerCase());
        if (!exists) {
          firmwareTasks.push({
            id: `fw_task_gen_${Math.random()}_${Date.now()}`,
            name: tName,
            type: tType,
            linkedBlock: node.id,
            priority: "MVP",
            status: "Not Started",
            description: desc,
            acceptanceCriteria: ac,
            notes: node.data.notes || ""
          });
        }
      });

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
        // Safe check and default arrays to prevent crashes on legacy loads
        set({
          id: proj.id,
          projectName: proj.projectName,
          description: proj.description || "",
          createdAt: proj.createdAt || new Date().toISOString(),
          updatedAt: proj.updatedAt || new Date().toISOString(),
          templateName: proj.templateName,
          version: proj.version || "1.0",
          activeView: proj.activeView || "master",
          nodes: proj.nodes || [],
          edges: proj.edges || [],
          bom: proj.bom || [],
          testing: proj.testing || [],
          powerBudget: proj.powerBudget || [],
          pinMap: proj.pinMap || [],
          firmwareTasks: proj.firmwareTasks || [],
          batteryCapacityMah: proj.batteryCapacityMah || 100,
          boards: proj.boards || [],
          circuitBlocks: proj.circuitBlocks || [],
          boardComponents: proj.boardComponents || [],
          nets: proj.nets || [],
          pcbConstraints: proj.pcbConstraints || [],
          manufacturingChecklist: proj.manufacturingChecklist || [],
          mechanicalZones: proj.mechanicalZones || [],
          assemblyLayers: proj.assemblyLayers || [],
          schematicSymbols: proj.schematicSymbols || [],
          schematicConnections: proj.schematicConnections || [],
          schematicWires: proj.schematicWires || [],
          pcbLayers: proj.pcbLayers || [],
          copperShapes: proj.copperShapes || [],
          traces: proj.traces || [],
          vias: proj.vias || [],
          drillHoles: proj.drillHoles || [],
          boardOutlines: proj.boardOutlines || [],
          pcbRules: proj.pcbRules || [],
          padNetAssignments: proj.padNetAssignments || [],
          keepoutZones: proj.keepoutZones || [],
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
          selectedNodeId: null
        });
      }
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    importProjectJSON: (rawJson: any) => {
      if (!rawJson || typeof rawJson !== 'object') {
        return { success: false, error: "Invalid JSON format." };
      }
      if (!rawJson.projectName) {
        return { success: false, error: "Missing required 'projectName' property." };
      }

      const json = migrateProjectSchema(rawJson);
      const importedId = json.id || `project_import_${Date.now()}`;
      
      // Parse with fallback safety gates (Feature 13)
      const parsedProject: Project = {
        id: importedId,
        projectName: json.projectName,
        description: json.description || "",
        createdAt: json.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        templateName: json.templateName || "Imported Project",
        version: json.version || "1.0",
        activeView: json.activeView || "master",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nodes: (json.nodes || []).map((n: any) => ({
          ...n,
          id: n.id || `node_${Math.random()}`,
          type: n.type || 'blockNode',
          position: n.position || { x: 100, y: 100 },
          data: {
            ...n.data,
            name: n.data?.name || "Unspecified Block",
            category: n.data?.category || "Interaction",
            status: n.data?.status || "MVP",
            description: n.data?.description || "",
            purpose: n.data?.purpose || "",
            requirements: n.data?.requirements || "",
            candidateComponents: n.data?.candidateComponents || "",
            risks: n.data?.risks || "",
            notes: n.data?.notes || "",
            testingNotes: n.data?.testingNotes || "",
            views: n.data?.views || ["master"],
            mitigation: n.data?.mitigation || "",
            openQuestions: n.data?.openQuestions || "",
            electricalNotes: n.data?.electricalNotes || "",
            mechanicalNotes: n.data?.mechanicalNotes || "",
            firmwareNotes: n.data?.firmwareNotes || "",
            tags: n.data?.tags || [],
            datasheetUrl: n.data?.datasheetUrl || "",
            supplierUrl: n.data?.supplierUrl || "",
            priority: n.data?.priority || "Medium"
          }
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        edges: (json.edges || []).map((e: any) => ({
          ...e,
          id: e.id || `edge_${Math.random()}`,
          views: e.views || ["master"],
          label: e.label || ""
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        bom: (json.bom || []).map((b: any) => ({
          id: b.id || `bom_${Math.random()}`,
          blockName: b.blockName || "",
          candidateComponent: b.candidateComponent || "",
          partNumber: b.partNumber || "",
          stage: b.stage || "Prototype",
          quantity: typeof b.quantity === 'number' ? b.quantity : 1,
          voltage: b.voltage || "",
          currentEstimate: b.currentEstimate || "",
          interface: b.interface || "",
          packageSize: b.packageSize || "",
          dimensions: b.dimensions || "",
          costEstimate: b.costEstimate || "0.00",
          supplier: b.supplier || "",
          supplierUrl: b.supplierUrl || "",
          datasheetUrl: b.datasheetUrl || "",
          status: b.status || "Not Started",
          risk: b.risk || "",
          alternative: b.alternative || "",
          notes: b.notes || ""
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        testing: (json.testing || []).map((t: any) => ({
          id: t.id || `stage_${Math.random()}`,
          name: t.name || "",
          goal: t.goal || "",
          partsNeeded: t.partsNeeded || "",
          steps: t.steps || "",
          passCriteria: t.passCriteria || "",
          risks: t.risks || "",
          status: t.status || "Not Started",
          notes: t.notes || "",
          category: t.category || "General",
          linkedBlocks: t.linkedBlocks || [],
          resultNotes: t.resultNotes || "",
          evidenceLink: t.evidenceLink || "",
          order: t.order || 0
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        powerBudget: (json.powerBudget || []).map((p: any) => ({
          id: p.id || `pwr_${Math.random()}`,
          blockName: p.blockName || "",
          voltage: p.voltage || "",
          activeCurrentMa: Number(p.activeCurrentMa) || 0,
          sleepCurrentUa: Number(p.sleepCurrentUa) || 0,
          dutyCyclePercent: Number(p.dutyCyclePercent) || 0,
          quantity: Number(p.quantity) || 1,
          notes: p.notes || ""
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pinMap: (json.pinMap || []).map((p: any) => ({
          id: p.id || `pin_${Math.random()}`,
          signalName: p.signalName || "",
          connectedBlock: p.connectedBlock || "",
          mcuPin: p.mcuPin || "",
          direction: p.direction || "Input",
          protocol: p.protocol || "GPIO",
          voltage: p.voltage || "",
          notes: p.notes || ""
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        firmwareTasks: (json.firmwareTasks || []).map((f: any) => ({
          id: f.id || `fw_task_${Math.random()}`,
          name: f.name || "",
          type: f.type || "Driver",
          linkedBlock: f.linkedBlock || "",
          priority: f.priority || "MVP",
          status: f.status || "Not Started",
          description: f.description || "",
          acceptanceCriteria: f.acceptanceCriteria || "",
          notes: f.notes || ""
        })),
        batteryCapacityMah: Number(json.batteryCapacityMah) || 100,
        // Board Studio extensions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        boards: (json.boards || []).map((b: any) => ({
          id: b.id || `board_${Math.random()}`,
          name: b.name || "Main PCB",
          boardType: b.boardType || "Main PCB",
          linkedProductArea: b.linkedProductArea || "",
          purpose: b.purpose || "",
          dimensionsMm: b.dimensionsMm || "10 x 10",
          layerCount: Number(b.layerCount) || 2,
          substrate: b.substrate || "FR4",
          placement: b.placement || "Internal",
          mountingNotes: b.mountingNotes || "",
          connectorNotes: b.connectorNotes || "",
          thermalNotes: b.thermalNotes || "",
          rfNotes: b.rfNotes || "",
          status: b.status || "Concept"
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        circuitBlocks: (json.circuitBlocks || []).map((cb: any) => ({
          id: cb.id || `circuit_${Math.random()}`,
          name: cb.name || "",
          circuitType: cb.circuitType || "MCU",
          boardId: cb.boardId || "",
          linkedBlueprintBlock: cb.linkedBlueprintBlock || "",
          description: cb.description || "",
          requiredComponents: cb.requiredComponents || "",
          referenceDesignators: cb.referenceDesignators || "",
          powerNets: cb.powerNets || "",
          signalNets: cb.signalNets || "",
          interfaceType: cb.interfaceType || "",
          datasheetNotes: cb.datasheetNotes || "",
          designNotes: cb.designNotes || "",
          risks: cb.risks || "",
          status: cb.status || "Concept"
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        boardComponents: (json.boardComponents || []).map((bc: any) => normalizeProjectComponent(bc)),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nets: (json.nets || []).map((n: any) => ({
          id: n.id || `net_${Math.random()}`,
          netName: n.netName || "",
          netType: n.netType || "Signal",
          voltage: n.voltage || "",
          sourceComponent: n.sourceComponent || "",
          sourcePin: n.sourcePin || "",
          targetComponent: n.targetComponent || "",
          targetPin: n.targetPin || "",
          protocol: n.protocol || "",
          currentEstimate: n.currentEstimate || "",
          impedanceRequirement: n.impedanceRequirement || "",
          notes: n.notes || ""
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pcbConstraints: (json.pcbConstraints || []).map((c: any) => ({
          id: c.id || `const_${Math.random()}`,
          boardId: c.boardId || "",
          constraintType: c.constraintType || "Board Outline",
          value: c.value || "",
          unit: c.unit || "",
          description: c.description || "",
          severity: c.severity || "Info"
        })),
        manufacturingChecklist: (json.manufacturingChecklist || []).map((mc: { id?: string; category?: string; item?: string; status?: string; ownerNotes?: string; blockingReason?: string }) => ({
          id: mc.id || `mfg_${Math.random()}`,
          category: (mc.category || "Schematic") as ManufacturingChecklistItem['category'],
          item: mc.item || "",
          status: (mc.status || "Not Started") as ManufacturingChecklistItem['status'],
          ownerNotes: mc.ownerNotes || "",
          blockingReason: mc.blockingReason || ""
        })),
        editorLayouts: json.editorLayouts || {},
        editorConnections: json.editorConnections || [],
        factoryFiles: json.factoryFiles || {},
        productType: json.productType || "Wearable Device",
        targetUse: json.targetUse || "Early-stage Prototype",
        mechanicalZones: json.mechanicalZones || [],
        assemblyLayers: json.assemblyLayers || [],
        schematicSymbols: json.schematicSymbols || [],
        schematicConnections: json.schematicConnections || [],
        schematicWires: json.schematicWires || [],
        pcbLayers: json.pcbLayers || [],
        copperShapes: json.copperShapes || [],
        traces: json.traces || [],
        vias: json.vias || [],
        drillHoles: json.drillHoles || [],
        boardOutlines: json.boardOutlines || [],
        pcbRules: json.pcbRules || [],
        reviewResults: json.reviewResults || [],
        exportHistory: json.exportHistory || [],
        factoryPackageStatus: json.factoryPackageStatus || "Draft",
        factoryReviewChecks: json.factoryReviewChecks || {},
        padNetAssignments: json.padNetAssignments || [],
        keepoutZones: json.keepoutZones || [],
        customComponentLibrary: json.customComponentLibrary || [],
        blueprintPack: json.blueprintPack || undefined,
        blueprintPackStatus: json.blueprintPackStatus || "Stale"
      };

      const saved = getSavedProjects();
      saved[importedId] = parsedProject;
      saveProjectsToStorage(saved, importedId);

      set({
        ...parsedProject,
        selectedNodeId: null,
        projectsList: syncProjectsList(saved)
      });

      return { success: true };
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
      const newItem: BoardItem = { ...item, id };
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
      persistChange({ boards });
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
      const id = item.id || `cmp_${Date.now()}_${Math.random()}`;
      const newItem: BoardComponent = { ...item, id };
      const boardComponents = [...(get().boardComponents || []), newItem];
      persistChange({ boardComponents });
    },

    updateBoardComponent: (id, fields) => {
      const boardComponents = (get().boardComponents || []).map(bc => bc.id === id ? { ...bc, ...fields } : bc);
      persistChange({ boardComponents });
    },

    deleteBoardComponent: (id) => {
      const boardComponents = (get().boardComponents || []).filter(bc => bc.id !== id);
      persistChange({ boardComponents });
    },

    addNet: (item) => {
      const id = `net_${Date.now()}_${Math.random()}`;
      const newItem: NetItem = { ...item, id };
      const nets = [...(get().nets || []), newItem];
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

    generateBoardPlanFromProduct: () => {
      const name = get().projectName.toLowerCase();
      const template = get().templateName?.toLowerCase() || "";
      const boards = [...(get().boards || [])];

      const addIfUnique = (item: Omit<BoardItem, 'id'>) => {
        if (!boards.some(b => b.name.toLowerCase() === item.name.toLowerCase())) {
          boards.push({
            ...item,
            id: `board_gen_${Math.random()}_${Date.now()}`
          });
        }
      };

      if (name.includes("ring") || template.includes("ring") || template.includes("the-ring")) {
        addIfUnique({
          name: "Main Curved Flex PCB",
          boardType: "Flex PCB",
          linkedProductArea: "Inner Housing",
          purpose: "Hosts core MCU, IMU sensor, touch electrode connections, and haptics",
          dimensionsMm: "18.5 x 6.5 x 0.15",
          layerCount: 2,
          substrate: "Polyimide Flex",
          placement: "Ring Arc",
          mountingNotes: "Adhesively laminated to inner support titanium structure.",
          connectorNotes: "ZIF interface connector for programming bridge.",
          thermalNotes: "Locate thermal vias adjacent to active regulator gates.",
          rfNotes: "Ensure ground trace keepouts near antenna traces.",
          status: "Concept"
        });
        addIfUnique({
          name: "Charging Contact Board",
          boardType: "Rigid PCB",
          linkedProductArea: "Lower Housing Outer",
          purpose: "Hosts outer battery contact charging nodes and ESD transient protect filters",
          dimensionsMm: "6.0 x 4.0 x 0.8",
          layerCount: 2,
          substrate: "FR4",
          placement: "Internal",
          mountingNotes: "Fitted inside epoxy moisture sealing slots.",
          connectorNotes: "Spring contact pins connecting to main Flex PCB.",
          thermalNotes: "Requires isolation buffer from heat sources.",
          rfNotes: "No RF shielding active on this daughterboard.",
          status: "Concept"
        });
        addIfUnique({
          name: "Debug/Test Pogo Pad Region",
          boardType: "Debug Board",
          linkedProductArea: "Internal Frame",
          purpose: "SWD trace points used for post-assembly testing",
          dimensionsMm: "8.0 x 3.0 x 0.8",
          layerCount: 2,
          substrate: "FR4",
          placement: "Internal",
          mountingNotes: "Placed along structural divider edge.",
          connectorNotes: "Temporary bed-of-nails contact pads.",
          thermalNotes: "No active power loads routed here.",
          rfNotes: "Keep SWD clock trace separated from BLE antenna.",
          status: "Concept"
        });
      } else if (name.includes("button") || template.includes("button") || template.includes("ble-button")) {
        addIfUnique({
          name: "Main Button Beacon PCB",
          boardType: "Rigid PCB",
          linkedProductArea: "Keyfob Casing",
          purpose: "Hosts CR2032 battery retainer, tactile push button, BLE beacon transmitter chip, and debug header pads.",
          dimensionsMm: "22.5 x 22.5 x 1.0",
          layerCount: 2,
          substrate: "FR4",
          placement: "Internal",
          mountingNotes: "Snaps directly into casing plastic alignment rails.",
          connectorNotes: "Direct battery clips, debugging pogo-pins.",
          thermalNotes: "Minimal thermal load, LDO regulator remains sleep-powered.",
          rfNotes: "Keepout window for printed PCB trace antenna.",
          status: "Concept"
        });
      } else if (name.includes("sensor") || template.includes("sensor") || template.includes("iot-sensor")) {
        addIfUnique({
          name: "Main Telemetry PCB",
          boardType: "Main PCB",
          linkedProductArea: "Weatherproof Enclosure",
          purpose: "Core telemetry routing. Hosts ESP32 microcontroller, solar charge controller, and flash buffer memory.",
          dimensionsMm: "55.0 x 35.0 x 1.6",
          layerCount: 4,
          substrate: "FR4",
          placement: "Internal",
          mountingNotes: "Four M3 mechanical brass standoffs.",
          connectorNotes: "Terminal blocks for analog input sensor feeds.",
          thermalNotes: "Exposed pad copper pour for regulator cooling.",
          rfNotes: "Ensure ground trace keepouts near antenna traces.",
          status: "Concept"
        });
        addIfUnique({
          name: "Solar Charging Shield",
          boardType: "Charging Board",
          linkedProductArea: "Enclosure Top Lid",
          purpose: "Hosts solar input voltage filters, overvoltage clamping diodes, and status charging indicator LEDs.",
          dimensionsMm: "40.0 x 30.0 x 1.6",
          layerCount: 2,
          substrate: "FR4",
          placement: "Dock",
          mountingNotes: "Mounts to top cover lid using rubber vibration isolator gaskets.",
          connectorNotes: "Two-pin JST connector for lithium battery pack.",
          thermalNotes: "Keep heat sinks isolated from temperature sensor nodes.",
          rfNotes: "No RF shielding active on this board.",
          status: "Concept"
        });
      } else if (name.includes("wearable") || template.includes("wearable") || template.includes("generic-wearable")) {
        addIfUnique({
          name: "Main Watch circular PCB",
          boardType: "Rigid PCB",
          linkedProductArea: "Watch Casing Internal",
          purpose: "Circular board outline hosting watch MCU, SPI flash, accelerometer, and AMOLED screen connector.",
          dimensionsMm: "32.0 x 32.0 x 1.2",
          layerCount: 4,
          substrate: "FR4",
          placement: "Internal",
          mountingNotes: "Press fit with custom circular elastomer bracket.",
          connectorNotes: "FPC ribbon cable interface for display and sensor.",
          thermalNotes: "Thermal vias to back of board watch casing heatsink.",
          rfNotes: "BLE matched trace to custom PCB frame antenna.",
          status: "Concept"
        });
        addIfUnique({
          name: "PPG Heart Rate Sensor Flex",
          boardType: "Flex PCB",
          linkedProductArea: "Casing Back Glass",
          purpose: "Optical green LED and photodiode routing for finger/wrist heart rate telemetry.",
          dimensionsMm: "12.0 x 10.0 x 0.15",
          layerCount: 2,
          substrate: "Polyimide Flex",
          placement: "Strap",
          mountingNotes: "Bonded with thermal tape to sensor glass windows.",
          connectorNotes: "ZIF connector bridge to main circular PCB.",
          thermalNotes: "Thermistor zone isolated from LED heat spikes.",
          rfNotes: "No active radio units routed on flex tail.",
          status: "Concept"
        });
      } else {
        addIfUnique({
          name: "Main Electronics Board",
          boardType: "Main PCB",
          linkedProductArea: "Core Casing",
          purpose: "Main system control board.",
          dimensionsMm: "45.0 x 30.0 x 1.6",
          layerCount: 4,
          substrate: "FR4",
          placement: "Internal",
          mountingNotes: "Four M2 screw mounting points.",
          connectorNotes: "USB-C charging connector.",
          thermalNotes: "Copper pour planes for grounding heatsinks.",
          rfNotes: "RF microstrip path with 50-ohm target impedance.",
          status: "Concept"
        });
      }

      persistChange({ boards });
    },

    generateCircuitsFromBlueprint: () => {
      const boards = get().boards || [];
      if (boards.length === 0) return;
      const mainBoardId = boards[0].id;
      const circuitBlocks = [...(get().circuitBlocks || [])];

      const addIfUnique = (item: Omit<CircuitBlock, 'id'>) => {
        if (!circuitBlocks.some(cb => cb.name.toLowerCase() === item.name.toLowerCase())) {
          circuitBlocks.push({
            ...item,
            id: `circuit_gen_${Math.random()}_${Date.now()}`
          });
        }
      };

      addIfUnique({
        name: "MCU Circuit",
        circuitType: "MCU",
        boardId: mainBoardId,
        description: "ESP32-C3 microcontroller core processor with decoupling caps and crystal oscillator.",
        requiredComponents: "ESP32-C3-MINI-1, 40MHz Crystal, 100nF Cap (x4), 10uF Cap (x1)",
        referenceDesignators: "U1, Y1, C1, C2, C3, C4, C5",
        powerNets: "3V3, GND",
        signalNets: "SWD_CLK, SWD_IO, TOUCH_INT, HAPTIC_PWM",
        interfaceType: "SWD, GPIO, I2C, SPI",
        datasheetNotes: "Follow decoupling layout guidelines adjacent to power pins.",
        designNotes: "Single-ended trace routing matching 3.3V voltage constraints.",
        risks: "Decoupling trace distance must be under 1.5mm to minimize inductance.",
        status: "Concept"
      });

      addIfUnique({
        name: "Power Regulation",
        circuitType: "Power",
        boardId: mainBoardId,
        description: "3.3V low dropout linear voltage regulator.",
        requiredComponents: "AP2112K-3.3TRG1 LDO, 1uF Cap (x2)",
        referenceDesignators: "U2, C6, C7",
        powerNets: "VBAT, 3V3, GND",
        signalNets: "None",
        interfaceType: "Direct Power Output",
        datasheetNotes: "Output capacitor must have low ESR.",
        designNotes: "Trace width must support up to 300mA current draws.",
        risks: "Thermal dissipation. Keep ground plane copper heatsink adjacent.",
        status: "Concept"
      });

      addIfUnique({
        name: "Charger & Protection",
        circuitType: "Charger",
        boardId: mainBoardId,
        description: "LiPo battery charger controller and protection circuit.",
        requiredComponents: "MCP73831-2ATI/OT Charger, AP9101C BMS, MOSFET Gate",
        referenceDesignators: "U3, U4, Q1, R1, C8",
        powerNets: "VBUS, VBAT, GND",
        signalNets: "CHARGE_STAT",
        interfaceType: "Analog Input, GPIO Status",
        datasheetNotes: "Program charge resistor sets constant current.",
        designNotes: "Keep charging trace isolated from sensitive RF signals.",
        risks: "Over-current protection triggers. ESD protection mandatory on charge pads.",
        status: "Concept"
      });

      addIfUnique({
        name: "Haptic Driver",
        circuitType: "Haptic",
        boardId: mainBoardId,
        description: "Low power vibration driver circuit.",
        requiredComponents: "DRV2605LDGSR Driver, 1uF Cap (x1), Flyback Diode",
        referenceDesignators: "U5, D1, C9",
        powerNets: "VBAT, 3V3, GND",
        signalNets: "HAPTIC_PWM, HAPTIC_EN",
        interfaceType: "PWM, I2C Control",
        datasheetNotes: "Inductive flyback protection diode required.",
        designNotes: "Place filter cap near driver power terminals.",
        risks: "Vibration noise on sensor traces. Route traces with guard rings.",
        status: "Concept"
      });

      addIfUnique({
        name: "Touch Input",
        circuitType: "Sensor",
        boardId: mainBoardId,
        description: "Capacitive touch sensing controller.",
        requiredComponents: "I2C Touch IC, Series Resistors (x2)",
        referenceDesignators: "U6, R2, R3",
        powerNets: "3V3, GND",
        signalNets: "TOUCH_SDA, TOUCH_SCL, TOUCH_INT",
        interfaceType: "I2C, Interrupt",
        datasheetNotes: "Shield electrodes with ground copper grid.",
        designNotes: "Trace capacitance must be matched to prevent sensitivity losses.",
        risks: "Water drop touch triggers. Software calibration maps mandatory.",
        status: "Concept"
      });

      addIfUnique({
        name: "BLE/RF Antenna",
        circuitType: "RF",
        boardId: mainBoardId,
        description: "Bluetooth Low Energy RF antenna matching network.",
        requiredComponents: "2.4GHz Chip Antenna, Inductors (x2), Capacitors (x2)",
        referenceDesignators: "ANT1, L1, L2, C10, C11",
        powerNets: "GND",
        signalNets: "RF_ANT_IN",
        interfaceType: "RF Single Ended",
        datasheetNotes: "Requires keepout region under the chip antenna footprint.",
        designNotes: "Route matching microstrip trace to exactly 50-ohm characteristic impedance.",
        risks: "Antenna mismatch losses. Flex bending changes antenna matching values.",
        status: "Concept"
      });

      addIfUnique({
        name: "Debug & Programming",
        circuitType: "Debug",
        boardId: mainBoardId,
        description: "SWD programming header connection pads.",
        requiredComponents: "Pogo Pad Test Point (x4)",
        referenceDesignators: "TP1, TP2, TP3, TP4",
        powerNets: "3V3, GND",
        signalNets: "SWD_CLK, SWD_IO",
        interfaceType: "SWD interface",
        datasheetNotes: "Gold plating required for contact longevity.",
        designNotes: "Space debug pads 1.27mm center-to-center.",
        risks: "Corrosion and shorting risks if contacts are exposed to moisture.",
        status: "Concept"
      });

      persistChange({ circuitBlocks });
    },

    generateBoardComponentsFromBOM: () => {
      const boards = get().boards || [];
      if (boards.length === 0) return;
      const mainBoardId = boards[0].id;
      const circuitBlocks = get().circuitBlocks || [];
      const boardComponents = [...(get().boardComponents || [])];

      const addIfUnique = (item: Omit<BoardComponent, 'id'>) => {
        if (!boardComponents.some(bc => bc.referenceDesignator.toLowerCase() === item.referenceDesignator.toLowerCase())) {
          boardComponents.push({
            ...item,
            id: `cmp_gen_${Math.random()}_${Date.now()}`
          });
        }
      };

      get().bom.forEach((bomItem, idx) => {
        const nameLower = bomItem.blockName.toLowerCase();
        let ref = `U${idx + 1}`;
        let side: 'Top' | 'Bottom' | 'Both' | 'Unknown' = 'Top';
        let criticality: 'Low' | 'Medium' | 'High' | 'RF Critical' | 'Thermal Critical' = 'Medium';
        let blockId = "";

        if (nameLower.includes("mcu") || nameLower.includes("controller") || nameLower.includes("soc")) {
          ref = `U1`;
          criticality = 'High';
          blockId = circuitBlocks.find(cb => cb.circuitType === 'MCU')?.id || "";
        } else if (nameLower.includes("regulator") || nameLower.includes("ldo")) {
          ref = `U2`;
          criticality = 'Thermal Critical';
          blockId = circuitBlocks.find(cb => cb.circuitType === 'Power')?.id || "";
        } else if (nameLower.includes("charger")) {
          ref = `U3`;
          criticality = 'Thermal Critical';
          blockId = circuitBlocks.find(cb => cb.circuitType === 'Charger')?.id || "";
        } else if (nameLower.includes("haptic") || nameLower.includes("motor")) {
          ref = `M1`;
          criticality = 'Medium';
          blockId = circuitBlocks.find(cb => cb.circuitType === 'Haptic')?.id || "";
        } else if (nameLower.includes("antenna") || nameLower.includes("ble") || nameLower.includes("radio")) {
          ref = `ANT1`;
          criticality = 'RF Critical';
          blockId = circuitBlocks.find(cb => cb.circuitType === 'RF')?.id || "";
        } else if (nameLower.includes("battery") || nameLower.includes("cell")) {
          ref = `BT1`;
          side = 'Bottom';
          criticality = 'High';
        } else if (nameLower.includes("led")) {
          ref = `D2`;
          criticality = 'Low';
        } else {
          ref = `U_BOM_${idx + 1}`;
        }

        addIfUnique({
          boardId: mainBoardId,
          circuitBlockId: blockId,
          referenceDesignator: ref,
          componentName: bomItem.candidateComponent || "Passive Component",
          componentType: bomItem.blockName,
          value: bomItem.voltage || "N/A",
          packageName: bomItem.packageSize || "0402",
          footprint: bomItem.dimensions || "0402",
          partNumber: bomItem.partNumber || "TBD",
          quantity: bomItem.quantity || 1,
          side,
          placementCriticality: criticality,
          datasheetUrl: bomItem.datasheetUrl,
          supplier: bomItem.supplier || "Digikey",
          notes: bomItem.notes || "Auto-mapped component from BOM registry."
        });
      });

      persistChange({ boardComponents });
    },

    generateNetsFromPinMap: () => {
      const nets = [...(get().nets || [])];

      const addIfUnique = (item: Omit<NetItem, 'id'>) => {
        if (!nets.some(n => n.netName.toLowerCase() === item.netName.toLowerCase())) {
          nets.push({
            ...item,
            id: `net_gen_${Math.random()}_${Date.now()}`
          });
        }
      };

      // Always seed power nets
      addIfUnique({
        netName: "GND",
        netType: "Ground",
        voltage: "0V",
        sourceComponent: "BT1",
        sourcePin: "BAT_GND",
        targetComponent: "U1",
        targetPin: "GND",
        protocol: "Power Plane",
        currentEstimate: "150mA",
        impedanceRequirement: "Min ground loop inductance",
        notes: "Primary ground return path net."
      });

      addIfUnique({
        netName: "3V3",
        netType: "Power",
        voltage: "3.3V",
        sourceComponent: "U2",
        sourcePin: "OUT_3V3",
        targetComponent: "U1",
        targetPin: "VDD_3V3",
        protocol: "Power Trace",
        currentEstimate: "80mA",
        impedanceRequirement: "Low ESR feed",
        notes: "Main regulated digital power net."
      });

      addIfUnique({
        netName: "VBAT",
        netType: "Power",
        voltage: "3.7V",
        sourceComponent: "BT1",
        sourcePin: "BAT_POS",
        targetComponent: "U2",
        targetPin: "IN_VIN",
        protocol: "Power Trace",
        currentEstimate: "120mA",
        impedanceRequirement: "Thick Trace width",
        notes: "Battery raw power net."
      });

      get().pinMap.forEach(p => {
        let type: 'Power' | 'Ground' | 'Signal' | 'Clock' | 'RF' | 'Differential' | 'Analog' | 'Digital' | 'Programming' = 'Signal';
        if (p.protocol === 'Power') type = 'Power';
        else if (p.protocol === 'Ground') type = 'Ground';
        else if (p.protocol === 'Touch') type = 'Analog';
        else if (p.protocol === 'UART') type = 'Programming';

        addIfUnique({
          netName: p.signalName,
          netType: type,
          voltage: p.voltage || "3.3V",
          sourceComponent: "U1",
          sourcePin: p.mcuPin || "FLOAT",
          targetComponent: p.connectedBlock,
          targetPin: "1",
          protocol: p.protocol,
          currentEstimate: "50uA",
          impedanceRequirement: p.protocol === 'Touch' ? "Guard traces keepout shielding" : "General 50-ohm single ended",
          notes: p.notes || "Logical signal trace."
        });
      });

      persistChange({ nets });
    },

    generatePCBConstraintsFromBoard: () => {
      const boards = get().boards || [];
      if (boards.length === 0) return;
      const mainBoard = boards[0];
      const pcbConstraints = [...(get().pcbConstraints || [])];

      const addIfUnique = (item: Omit<PCBConstraint, 'id'>) => {
        if (!pcbConstraints.some(c => c.boardId === item.boardId && c.constraintType === item.constraintType && c.value === item.value)) {
          pcbConstraints.push({
            ...item,
            id: `const_gen_${Math.random()}_${Date.now()}`
          });
        }
      };

      if (mainBoard.substrate === 'Polyimide Flex') {
        addIfUnique({
          boardId: mainBoard.id,
          constraintType: "Flex Bend",
          value: "1.5",
          unit: "mm",
          description: "Minimum dynamic bend radius constraints inside housing loop.",
          severity: "Critical"
        });
        addIfUnique({
          boardId: mainBoard.id,
          constraintType: "Trace Width",
          value: "4",
          unit: "mil",
          description: "Minimum trace width for signal lines on Polyimide flex.",
          severity: "Warning"
        });
        addIfUnique({
          boardId: mainBoard.id,
          constraintType: "Clearance",
          value: "4",
          unit: "mil",
          description: "Minimum clearance distance between separate conductive traces.",
          severity: "Critical"
        });
        addIfUnique({
          boardId: mainBoard.id,
          constraintType: "Antenna",
          value: "5.0",
          unit: "mm",
          description: "Keepout window with zero copper ground fill adjacent to BLE chip antenna.",
          severity: "Critical"
        });
        addIfUnique({
          boardId: mainBoard.id,
          constraintType: "Test Point",
          value: "0.8",
          unit: "mm",
          description: "SWD debug test point diameter minimum for spring probe contact.",
          severity: "Info"
        });
      } else {
        addIfUnique({
          boardId: mainBoard.id,
          constraintType: "Board Outline",
          value: mainBoard.dimensionsMm,
          unit: "mm",
          description: "Board geometry outline size constraint bounds.",
          severity: "Info"
        });
        addIfUnique({
          boardId: mainBoard.id,
          constraintType: "Trace Width",
          value: "6",
          unit: "mil",
          description: "Default signal line minimum copper width.",
          severity: "Info"
        });
        addIfUnique({
          boardId: mainBoard.id,
          constraintType: "Clearance",
          value: "6",
          unit: "mil",
          description: "Default minimum signal clearance spacing rules.",
          severity: "Info"
        });
        addIfUnique({
          boardId: mainBoard.id,
          constraintType: "Via",
          value: "0.3 / 0.6",
          unit: "mm",
          description: "Drill hole size and annular ring pad width dimensions.",
          severity: "Info"
        });
      }

      persistChange({ pcbConstraints });
    },

    generateManufacturingChecklist: () => {
      const manufacturingChecklist = [...(get().manufacturingChecklist || [])];

      const addIfUnique = (item: Omit<ManufacturingChecklistItem, 'id'>) => {
        if (!manufacturingChecklist.some(m => m.item.toLowerCase() === item.item.toLowerCase())) {
          manufacturingChecklist.push({
            ...item,
            id: `mfg_chk_gen_${Math.random()}_${Date.now()}`
          });
        }
      };

      addIfUnique({
        category: "Schematic",
        item: "Run Electrical Rules Check (ERC) with zero active error listings",
        status: "Not Started",
        ownerNotes: "Ensure floating pins are explicitly set to no-connect."
      });

      addIfUnique({
        category: "Schematic",
        item: "Verify component footprint mappings are compatible with selected supplier manufacturer part numbers",
        status: "Not Started",
        ownerNotes: "Check dual-pack logic gate pin assignments."
      });

      addIfUnique({
        category: "PCB Layout",
        item: "Run Design Rules Check (DRC) to ensure trace alignment matches manufacturing capabilities",
        status: "Not Started",
        ownerNotes: "Set clearances to 4mil matching flex board factory."
      });

      addIfUnique({
        category: "PCB Layout",
        item: "Verify copper keepout regions are active below BLE transceiver antenna trace",
        status: "Not Started",
        ownerNotes: "Clear all ground pour planes inside 5mm antenna boundary."
      });

      addIfUnique({
        category: "PCB Layout",
        item: "Confirm bend region clearance for polyimide flex tracks to protect traces against fractures",
        status: "Not Started",
        ownerNotes: "No component solder pads placed within 1.5mm of bend line."
      });

      addIfUnique({
        category: "BOM",
        item: "Confirm procurement pricing and active distributor stock counts match required quantities",
        status: "Not Started",
        ownerNotes: "Verify MCU packaging availability."
      });

      addIfUnique({
        category: "Assembly",
        item: "Generate Centroid CPL component coordinate pick-and-place files",
        status: "Not Started",
        ownerNotes: "Check coordinate origin matches layout center."
      });

      addIfUnique({
        category: "Testing",
        item: "Map debug pogo pad positions to test bed frame constraints",
        status: "Not Started",
        ownerNotes: "Align SWD pads to 1.27mm probe needles spacing."
      });

      addIfUnique({
        category: "Compliance",
        item: "Prepare Bluetooth emissions testing protocol documentation for FCC compliance audit",
        status: "Not Started",
        ownerNotes: "Set firmware test register script to continuous Tx carrier wave output."
      });

      persistChange({ manufacturingChecklist });
    },

    generateFullProductPlan: () => {
      const before = {
        bom: get().bom.length,
        power: get().powerBudget.length,
        pins: get().pinMap.length,
        firmware: get().firmwareTasks.length,
        testing: get().testing.length,
        boards: (get().boards || []).length,
        circuits: (get().circuitBlocks || []).length,
        components: (get().boardComponents || []).length,
        nets: (get().nets || []).length,
        constraints: (get().pcbConstraints || []).length,
        checklist: (get().manufacturingChecklist || []).length
      };

      // Run all generators
      get().generateBOMFromMVP();
      get().generatePowerFromBlueprint();
      get().generatePinMapFromBlueprint();
      get().generateFirmwareTasksFromBlueprint();
      get().generateTestsFromMVP();
      get().generateBoardPlanFromProduct();
      get().generateCircuitsFromBlueprint();
      get().generateBoardComponentsFromBOM();
      get().generateNetsFromPinMap();
      get().generatePCBConstraintsFromBoard();
      get().generateManufacturingChecklist();

      const after = {
        bom: get().bom.length,
        power: get().powerBudget.length,
        pins: get().pinMap.length,
        firmware: get().firmwareTasks.length,
        testing: get().testing.length,
        boards: (get().boards || []).length,
        circuits: (get().circuitBlocks || []).length,
        components: (get().boardComponents || []).length,
        nets: (get().nets || []).length,
        constraints: (get().pcbConstraints || []).length,
        checklist: (get().manufacturingChecklist || []).length
      };

      const added = {
        bom: after.bom - before.bom,
        power: after.power - before.power,
        pins: after.pins - before.pins,
        firmware: after.firmware - before.firmware,
        testing: after.testing - before.testing,
        boards: after.boards - before.boards,
        circuits: after.circuits - before.circuits,
        components: after.components - before.components,
        nets: after.nets - before.nets,
        constraints: after.constraints - before.constraints,
        checklist: after.checklist - before.checklist
      };

      const summaryParts = [
        added.bom > 0 && `${added.bom} BOM items`,
        added.power > 0 && `${added.power} power budget rows`,
        added.pins > 0 && `${added.pins} pin mappings`,
        added.firmware > 0 && `${added.firmware} firmware tasks`,
        added.testing > 0 && `${added.testing} test stages`,
        added.boards > 0 && `${added.boards} boards`,
        added.circuits > 0 && `${added.circuits} circuits`,
        added.components > 0 && `${added.components} board components`,
        added.nets > 0 && `${added.nets} net items`,
        added.constraints > 0 && `${added.constraints} PCB constraints`,
        added.checklist > 0 && `${added.checklist} checklist items`
      ].filter(Boolean);

      const summaryStr = summaryParts.length > 0
        ? `Added: ${summaryParts.join(', ')}.`
        : "No new items added. Your project plan is already fully up to date.";

      return {
        success: true,
        summary: summaryStr
      };
    },

    updateEditorObjectPosition: (mode, id, x, y) => {
      const layouts = { ...(get().editorLayouts || {}) };
      const modeObjects = layouts[mode] || [];
      const updated = modeObjects.map(obj => obj.id === id ? { ...obj, x, y } : obj);
      layouts[mode] = updated;
      
      let boardComponents = get().boardComponents || [];
      const targetObj = modeObjects.find(o => o.id === id);
      if (mode === 'components' && targetObj && targetObj.sourceType === 'component' && targetObj.sourceId) {
        boardComponents = boardComponents.map(bc => bc.id === targetObj.sourceId ? { ...bc, placementX: x, placementY: y } : bc);
      }

      persistChange({ editorLayouts: layouts, boardComponents });
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

      let boardComponents = get().boardComponents || [];
      const targetObj = modeObjects.find(o => o.id === id);
      if (mode === 'components' && targetObj && targetObj.sourceType === 'component' && targetObj.sourceId) {
        boardComponents = boardComponents.map(bc => bc.id === targetObj.sourceId ? { ...bc, rotationDeg: rotation } : bc);
      }

      persistChange({ editorLayouts: layouts, boardComponents });
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

    autoPlaceComponents: () => {
      const project = getCleanProjectData(get());
      const placed = autoPlaceComponents(project);
      persistChange({ boardComponents: placed });
      get().generateEditorLayouts();
    },

    autoCreateNetsFromPinMap: () => {
      const project = getCleanProjectData(get());
      const nets = autoCreateNetsFromPinMap(project);
      persistChange({ nets });
      get().generateEditorLayouts();
    },

    autoCreatePinMapFromCircuits: () => {
      const project = getCleanProjectData(get());
      const pinMap = autoCreatePinMapFromCircuits(project);
      persistChange({ pinMap });
      get().generateEditorLayouts();
    },

    autoCreateFirmwareTasksFromHardware: () => {
      const project = getCleanProjectData(get());
      const firmwareTasks = autoCreateFirmwareTasksFromHardware(project);
      persistChange({ firmwareTasks });
      get().generateEditorLayouts();
    },

    autoCreateTestsFromHardware: () => {
      const project = getCleanProjectData(get());
      const testing = autoCreateTestsFromHardware(project);
      persistChange({ testing });
      get().generateEditorLayouts();
    },

    autoCreateHandoffChecklist: () => {
      const project = getCleanProjectData(get());
      const checklist = autoCreateHandoffChecklist(project);
      persistChange({ manufacturingChecklist: checklist });
      get().generateEditorLayouts();
    },

    fixMissingDimensionsWithPlaceholder: () => {
      const project = getCleanProjectData(get());
      const boards = fixMissingDimensionsWithPlaceholder(project);
      persistChange({ boards });
      get().generateEditorLayouts();
    },

    addRequiredFactoryFileChecklist: () => {
      const factoryFiles = get().factoryFiles || getInitialFactoryFiles(get());
      persistChange({ factoryFiles });
      get().generateEditorLayouts();
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
      const components = [...(get().boardComponents || [])];
      const nextIdx = components.length + 1;
      
      const r1: BoardComponent = {
        id: `cmp_r_pull1_${Date.now()}`,
        boardId: "board_main",
        circuitBlockId: "circuit_mcu",
        referenceDesignator: `R${nextIdx}`,
        componentName: "Resistor 10kΩ 0603",
        componentType: "Resistor",
        value: "10k",
        packageName: "R_0603",
        footprint: "R_0603",
        partNumber: "RC0603FR-0710KL",
        quantity: 1,
        side: "Top",
        placementCriticality: "Medium",
        placementX: 200,
        placementY: 90,
        notes: "I2C SDA pullup"
      };

      const r2: BoardComponent = {
        id: `cmp_r_pull2_${Date.now()}`,
        boardId: "board_main",
        circuitBlockId: "circuit_mcu",
        referenceDesignator: `R${nextIdx + 1}`,
        componentName: "Resistor 10kΩ 0603",
        componentType: "Resistor",
        value: "10k",
        packageName: "R_0603",
        footprint: "R_0603",
        partNumber: "RC0603FR-0710KL",
        quantity: 1,
        side: "Top",
        placementCriticality: "Medium",
        placementX: 200,
        placementY: 100,
        notes: "I2C SCL pullup"
      };

      persistChange({ boardComponents: [...components, r1, r2] });
      get().generateEditorLayouts();
      get().runFullDesignReview();
    },

    addFlybackDiode: () => {
      const components = [...(get().boardComponents || [])];
      const nextIdx = components.length + 1;
      
      const d: BoardComponent = {
        id: `cmp_d_fly_${Date.now()}`,
        boardId: "board_main",
        circuitBlockId: "circuit_haptic",
        referenceDesignator: `D${nextIdx}`,
        componentName: "Schottky Diode SOD123",
        componentType: "Diode",
        value: "Schottky",
        packageName: "SOD123",
        footprint: "SOD123",
        partNumber: "B130-13-F",
        quantity: 1,
        side: "Top",
        placementCriticality: "High",
        placementX: 180,
        placementY: 160,
        notes: "Motor flyback clamp protection"
      };

      persistChange({ boardComponents: [...components, d] });
      get().generateEditorLayouts();
      get().runFullDesignReview();
    },

    addDebugTestPad: () => {
      const components = [...(get().boardComponents || [])];
      const nextIdx = components.length + 1;
      
      const tp1: BoardComponent = {
        id: `cmp_tp_swdio_${Date.now()}`,
        boardId: "board_main",
        circuitBlockId: "circuit_debug",
        referenceDesignator: `TP${nextIdx}`,
        componentName: "Programming Pad SWDIO",
        componentType: "Connector",
        value: "SWDIO",
        packageName: "TEST_PAD",
        footprint: "TEST_PAD",
        partNumber: "TP_1MM_ROUND",
        quantity: 1,
        side: "Bottom",
        placementCriticality: "High",
        placementX: 280,
        placementY: 50,
        notes: "MCU SWDIO target interface point"
      };

      const tp2: BoardComponent = {
        id: `cmp_tp_swclk_${Date.now()}`,
        boardId: "board_main",
        circuitBlockId: "circuit_debug",
        referenceDesignator: `TP${nextIdx + 1}`,
        componentName: "Programming Pad SWCLK",
        componentType: "Connector",
        value: "SWCLK",
        packageName: "TEST_PAD",
        footprint: "TEST_PAD",
        partNumber: "TP_1MM_ROUND",
        quantity: 1,
        side: "Bottom",
        placementCriticality: "High",
        placementX: 280,
        placementY: 60,
        notes: "MCU SWCLK target interface point"
      };

      persistChange({ boardComponents: [...components, tp1, tp2] });
      get().generateEditorLayouts();
      get().runFullDesignReview();
    },
    addProjectComponentFromLibrary: (libComp, boardId, circuitBlockId) => {
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
        blockName: circuitBlockId || 'Block',
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
        datasheetUrl: '',
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
        pins: libComp.pins || [],
        boardId: boardId || get().activeBoardId || 'board-main',
        circuitBlockId: circuitBlockId || '',
        bomItemId: bomId,
        quantity: libComp.defaultQuantity || 1,
        schematic: { placed: false, x: 150, y: 150, rotation: 0, locked: false },
        pcb: { placed: false, xMm: 0, yMm: 0, rotationDeg: 0, side: 'Top' as const, locked: false, placementStatus: 'Unplaced' as const },
        status: 'Selected' as const,
        notes: libComp.description || ''
      };

      const newComp = normalizeProjectComponent(rawComp);
      
      const updatedComponents = [...components, newComp];
      const updatedBom = [...(get().bom || []), bomItem];
      
      persistChange({
        boardComponents: updatedComponents,
        bom: updatedBom
      });

      return newComp;
    },

    updateProjectComponent: (id, data) => {
      const components = get().boardComponents || [];
      const index = components.findIndex(c => c.id === id);
      if (index === -1) return;

      const current = components[index];
      let updated = { ...current, ...data };
      
      // Keep legacy and nested fields synchronized
      if (data.pcb) {
        updated.pcb = { ...current.pcb, ...data.pcb };
        updated = syncNestedPcbFields(updated);
      } else if (data.placementX !== undefined || data.placementY !== undefined || data.rotationDeg !== undefined || data.side !== undefined || data.lockedPlacement !== undefined || data.placementStatus !== undefined) {
        updated = syncLegacyPlacementFields(updated);
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
        
        // Remove schematic wires connected to this component's pins
        const updatedWires = (get().schematicWires || []).filter(w => 
          w.sourceComponentId !== componentId && w.targetComponentId !== componentId
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
            return {
              ...c,
              pcb: updatedPcb,
              placementX: undefined,
              placementY: undefined,
              rotationDeg: 0,
              side: 'Top',
              lockedPlacement: false,
              placementStatus: 'Unplaced'
            };
          }
          return c;
        });

        // Filter traces terminating on this component's pads
        const updatedTraces = (get().traces || []).filter(t => {
          const matchesSource = t.sourceAnchor?.componentId === componentId;
          const matchesTarget = t.targetAnchor?.componentId === componentId;
          return !(matchesSource || matchesTarget);
        });

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
        const updatedWires = (get().schematicWires || []).filter(w => 
          w.sourceComponentId !== componentId && w.targetComponentId !== componentId
        );

        // Remove pad-net assignments
        const updatedAssignments = (get().padNetAssignments || []).filter(a => a.componentId !== componentId);

        // Remove linked traces
        const updatedTraces = (get().traces || []).filter(t => {
          const matchesSource = t.sourceAnchor?.componentId === componentId;
          const matchesTarget = t.targetAnchor?.componentId === componentId;
          return !(matchesSource || matchesTarget);
        });

        persistChange({
          boardComponents: updatedComponents,
          bom: updatedBom,
          schematicWires: updatedWires,
          padNetAssignments: updatedAssignments,
          traces: updatedTraces
        });

        // Clean up empty nets
        const activeNetIds = new Set(updatedAssignments.map(a => a.netId));
        const updatedNets = (get().nets || []).filter(n => activeNetIds.has(n.id) || n.netName === 'GND' || n.netName === '3V3' || n.netName === '5V');
        
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
          return {
            ...c,
            pcb: updatedPcb,
            placementX: x,
            placementY: y,
            rotationDeg: updatedPcb.rotationDeg,
            side: updatedPcb.side,
            lockedPlacement: updatedPcb.locked,
            placementStatus: 'Placed'
          };
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
        ...data
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
          newAssignments.push({
            id: `assignment_${Date.now()}_${Math.random()}`,
            componentId: compId,
            padName: pinNum,
            netId: net.id,
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

      // Create schematic wire
      const wireId = `wire_${Date.now()}_${Math.random()}`;
      const wire: SchematicWire = {
        id: wireId,
        sourceComponentId,
        sourcePinNumber,
        targetComponentId,
        targetPinNumber,
        netId: net.id,
        netName: net.netName,
        points: points || [],
        status: 'Draft'
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
        assignments: newAssignments.filter(a => a.netId === net.id)
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

      const updatedWires = (get().schematicWires || []).filter(w => 
        !(w.sourceComponentId === componentId && w.sourcePinNumber === pinNumber) &&
        !(w.targetComponentId === componentId && w.targetPinNumber === pinNumber)
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

      const updatedAssignments = (get().padNetAssignments || []).filter(a => a.netId !== net.id);
      const updatedWires = (get().schematicWires || []).filter(w => w.netId !== net.id);
      const updatedTraces = (get().traces || []).filter(t => t.netId !== net.id);
      const updatedNets = (get().nets || []).filter(n => n.id !== net.id);

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
    }
  };
});
