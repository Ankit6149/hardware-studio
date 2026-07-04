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
  FirmwareTask 
} from '../types';
import { templates } from '../data/templates';

interface ProjectState extends Project {
  selectedNodeId: string | null;
  projectsList: { id: string; projectName: string; description: string; updatedAt: string; templateName?: string }[];

  setSelectedNodeId: (id: string | null) => void;
  setProjectName: (name: string) => void;
  setProjectDescription: (desc: string) => void;
  setActiveView: (view: string) => void;

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

  // Project Actions
  saveActiveProject: () => void;
  saveProjectAsCopy: (name: string) => void;
  loadProject: (id: string) => void;
  deleteProject: (id: string) => void;
  loadProjectFromTemplate: (templateId: string) => void;
  resetProject: () => void;
  importProjectJSON: (json: any) => { success: boolean; error?: string };
  loadProjectFromLocalStorage: () => void;
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
    return allProjects[activeId];
  }
  const firstId = Object.keys(allProjects)[0];
  if (firstId && allProjects[firstId]) {
    return allProjects[firstId];
  }
  // Ultimate fallback
  const ringTemplate = templates.find(t => t.id === 'the-ring')?.project;
  return JSON.parse(JSON.stringify(ringTemplate || {
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
  }));
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
      batteryCapacityMah: state.batteryCapacityMah
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
        let volt = "3.3";
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
        let desc = node.data.description || "";
        let ac = node.data.requirements || "Verified compiler load.";

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
      const proj = saved[id];
      if (proj) {
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
        const copy = JSON.parse(JSON.stringify(targetTpl)) as Project;
        const newId = `project_template_${templateId}_${Date.now()}`;
        copy.id = newId;
        copy.projectName = `My ${copy.projectName}`;
        copy.createdAt = new Date().toISOString();
        copy.updatedAt = new Date().toISOString();

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

    importProjectJSON: (json) => {
      if (!json || typeof json !== 'object') {
        return { success: false, error: "Invalid JSON format." };
      }
      if (!json.projectName) {
        return { success: false, error: "Missing required 'projectName' property." };
      }

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
        edges: (json.edges || []).map((e: any) => ({
          ...e,
          id: e.id || `edge_${Math.random()}`,
          views: e.views || ["master"],
          label: e.label || ""
        })),
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
        batteryCapacityMah: Number(json.batteryCapacityMah) || 100
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
    }
  };
});
