import { create } from 'zustand';
import { Project, CustomNode, CustomEdge, BOMItem, TestStage, NodeData } from '../types';
import { theRingTemplate } from '../data/templates/theRingTemplate';


interface ProjectState extends Project {
  selectedNodeId: string | null;
  setProjectName: (name: string) => void;
  setActiveView: (view: string) => void;
  setSelectedNodeId: (id: string | null) => void;
  
  // Node management
  addNode: (node: Omit<CustomNode, 'id'> & { id?: string }) => void;
  updateNode: (id: string, data: Partial<NodeData>) => void;
  deleteNode: (id: string) => void;
  updateNodePosition: (id: string, position: { x: number, y: number }) => void;
  setNodes: (nodes: CustomNode[]) => void;
  
  // Edge management
  addEdge: (edge: CustomEdge) => void;
  deleteEdge: (id: string) => void;
  setEdges: (edges: CustomEdge[]) => void;
  
  // BOM management
  addBOMItem: (item: Omit<BOMItem, 'id'>) => void;
  updateBOMItem: (id: string, data: Partial<BOMItem>) => void;
  deleteBOMItem: (id: string) => void;
  
  // Testing management
  addTestStage: (stage: Omit<TestStage, 'id'>) => void;
  updateTestStage: (id: string, data: Partial<TestStage>) => void;
  deleteTestStage: (id: string) => void;
  
  // Template actions
  resetProject: () => void;
  saveProjectToLocalStorage: () => void;
  loadProjectFromLocalStorage: () => void;
}

const LOCAL_STORAGE_KEY = 'hardware_studio_system_alpha_project';

const saveToStorage = (state: Project) => {
  if (typeof window === 'undefined') return;
  try {
    const data = {
      projectName: state.projectName,
      activeView: state.activeView,
      nodes: state.nodes,
      edges: state.edges,
      bom: state.bom,
      testing: state.testing
    };
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
};

const loadFromStorage = (): Project | null => {
  if (typeof window === 'undefined') return null;
  try {
    const dataStr = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!dataStr) return null;
    return JSON.parse(dataStr);
  } catch (e) {
    console.error("Failed to load from localStorage:", e);
    return null;
  }
};

const getInitialState = (): Project => {
  return JSON.parse(JSON.stringify(theRingTemplate)); // Deep copy template
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  ...getInitialState(),
  selectedNodeId: null,

  setProjectName: (projectName) => {
    set({ projectName });
    saveToStorage(get());
  },

  setActiveView: (activeView) => {
    set((state) => {
      // Sync node coordinates for the newly active view if stored in positions map
      const updatedNodes = state.nodes.map(node => {
        if (node.data?.positions?.[activeView]) {
          return {
            ...node,
            position: node.data.positions[activeView]
          };
        }
        return node;
      });
      
      const nextState = { ...state, activeView, nodes: updatedNodes };
      saveToStorage(nextState);
      return { activeView, nodes: updatedNodes };
    });
  },

  setSelectedNodeId: (selectedNodeId) => {
    set({ selectedNodeId });
  },

  addNode: (nodeData) => {
    set((state) => {
      const activeView = state.activeView;
      const id = nodeData.id || `node_${Date.now()}`;
      
      // Setup default positions map with the active view coordinate
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
          positions
        }
      };

      const nodes = [...state.nodes, newNode];
      const nextState = { ...state, nodes, selectedNodeId: id };
      saveToStorage(nextState);
      return { nodes, selectedNodeId: id };
    });
  },

  updateNode: (id, fields) => {
    set((state) => {
      const nodes = state.nodes.map(node => {
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
      const nextState = { ...state, nodes };
      saveToStorage(nextState);
      return { nodes };
    });
  },

  deleteNode: (id) => {
    set((state) => {
      // Remove node & associated edges
      const nodes = state.nodes.filter(n => n.id !== id);
      const edges = state.edges.filter(e => e.source !== id && e.target !== id);
      const selectedNodeId = state.selectedNodeId === id ? null : state.selectedNodeId;
      
      const nextState = { ...state, nodes, edges, selectedNodeId };
      saveToStorage(nextState);
      return { nodes, edges, selectedNodeId };
    });
  },

  updateNodePosition: (id, position) => {
    set((state) => {
      const activeView = state.activeView;
      const nodes = state.nodes.map(node => {
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
      const nextState = { ...state, nodes };
      saveToStorage(nextState);
      return { nodes };
    });
  },

  setNodes: (nodes) => {
    set((state) => {
      const nextState = { ...state, nodes };
      saveToStorage(nextState);
      return { nodes };
    });
  },

  addEdge: (edge) => {
    set((state) => {
      // Avoid duplicate edges
      const exists = state.edges.some(e => e.source === edge.source && e.target === edge.target && e.views?.includes(state.activeView));
      if (exists) return {};

      // Tag the edge with the active view so it appears under this view filter
      const newEdge: CustomEdge = {
        ...edge,
        id: edge.id || `edge_${Date.now()}`,
        // Add custom view tag if not present
        views: edge.views || [state.activeView]
      };

      const edges = [...state.edges, newEdge];
      const nextState = { ...state, edges };
      saveToStorage(nextState);
      return { edges };
    });
  },

  deleteEdge: (id) => {
    set((state) => {
      const edges = state.edges.filter(e => e.id !== id);
      const nextState = { ...state, edges };
      saveToStorage(nextState);
      return { edges };
    });
  },

  setEdges: (edges) => {
    set((state) => {
      const nextState = { ...state, edges };
      saveToStorage(nextState);
      return { edges };
    });
  },

  // BOM Management
  addBOMItem: (item) => {
    set((state) => {
      const id = `bom_${Date.now()}`;
      const newItem: BOMItem = { ...item, id };
      const bom = [...state.bom, newItem];
      const nextState = { ...state, bom };
      saveToStorage(nextState);
      return { bom };
    });
  },

  updateBOMItem: (id, fields) => {
    set((state) => {
      const bom = state.bom.map(b => b.id === id ? { ...b, ...fields } : b);
      const nextState = { ...state, bom };
      saveToStorage(nextState);
      return { bom };
    });
  },

  deleteBOMItem: (id) => {
    set((state) => {
      const bom = state.bom.filter(b => b.id !== id);
      const nextState = { ...state, bom };
      saveToStorage(nextState);
      return { bom };
    });
  },

  // Testing Management
  addTestStage: (stage) => {
    set((state) => {
      const id = `stage_${Date.now()}`;
      const newStage: TestStage = { ...stage, id };
      const testing = [...state.testing, newStage];
      const nextState = { ...state, testing };
      saveToStorage(nextState);
      return { testing };
    });
  },

  updateTestStage: (id, fields) => {
    set((state) => {
      const testing = state.testing.map(t => t.id === id ? { ...t, ...fields } : t);
      const nextState = { ...state, testing };
      saveToStorage(nextState);
      return { testing };
    });
  },

  deleteTestStage: (id) => {
    set((state) => {
      const testing = state.testing.filter(t => t.id !== id);
      const nextState = { ...state, testing };
      saveToStorage(nextState);
      return { testing };
    });
  },

  resetProject: () => {
    // Reset back to deep-copied The Ring template
    const freshTemplate = JSON.parse(JSON.stringify(theRingTemplate));
    set({
      ...freshTemplate,
      selectedNodeId: null
    });
    saveToStorage(freshTemplate);
  },

  saveProjectToLocalStorage: () => {
    saveToStorage(get());
  },

  loadProjectFromLocalStorage: () => {
    const loaded = loadFromStorage();
    if (loaded) {
      set({
        projectName: loaded.projectName,
        activeView: loaded.activeView,
        nodes: loaded.nodes,
        edges: loaded.edges,
        bom: loaded.bom,
        testing: loaded.testing,
        selectedNodeId: null
      });
    }
  }
}));
