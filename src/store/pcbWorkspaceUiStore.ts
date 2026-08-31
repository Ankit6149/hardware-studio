import { create } from 'zustand';

export type PcbDrawerSection = 'objects' | 'nets' | 'layers' | 'rules' | 'stackup';

export interface PcbEditorLayerDefinition {
  id: string;
  label: string;
  routable: boolean;
}

export const PCB_EDITOR_LAYERS: readonly PcbEditorLayerDefinition[] = [
  { id: 'top-copper', label: 'Top copper', routable: true },
  { id: 'bottom-copper', label: 'Bottom copper', routable: true },
  { id: 'silkscreen', label: 'Silkscreen', routable: false },
  { id: 'drill', label: 'Drill / vias', routable: false },
  { id: 'keepouts', label: 'Keepouts', routable: false },
  { id: 'ratsnest', label: 'Ratsnest', routable: false },
] as const;

export const DEFAULT_PCB_LAYER_VISIBILITY: Readonly<Record<string, boolean>> = {
  'top-copper': true,
  'bottom-copper': true,
  silkscreen: true,
  mask: true,
  paste: false,
  drill: true,
  keepouts: true,
  ratsnest: true,
  drc: true,
};

interface PcbWorkspaceUiState {
  activeSection: PcbDrawerSection;
  activeLayerId: string;
  layerVisibility: Record<string, boolean>;
  inspectorOpen: boolean;
  problemsOpen: boolean;
  setActiveSection: (section: PcbDrawerSection) => void;
  setActiveLayer: (layerId: string) => void;
  setLayerVisibility: (visibility: Record<string, boolean>) => void;
  toggleLayerVisibility: (layerId: string) => void;
  setInspectorOpen: (open: boolean) => void;
  setProblemsOpen: (open: boolean) => void;
  reset: () => void;
}

const initialState = {
  activeSection: 'objects' as PcbDrawerSection,
  activeLayerId: 'top-copper',
  layerVisibility: { ...DEFAULT_PCB_LAYER_VISIBILITY },
  inspectorOpen: false,
  problemsOpen: false,
};

export const usePcbWorkspaceUiStore = create<PcbWorkspaceUiState>((set) => ({
  ...initialState,
  setActiveSection: (activeSection) => set({ activeSection }),
  setActiveLayer: (activeLayerId) => set({ activeLayerId }),
  setLayerVisibility: (layerVisibility) => set({ layerVisibility: { ...layerVisibility } }),
  toggleLayerVisibility: (layerId) => set((state) => ({
    layerVisibility: {
      ...state.layerVisibility,
      [layerId]: state.layerVisibility[layerId] === false,
    },
  })),
  setInspectorOpen: (inspectorOpen) => set({ inspectorOpen }),
  setProblemsOpen: (problemsOpen) => set({ problemsOpen }),
  reset: () => set({
    activeSection: initialState.activeSection,
    activeLayerId: initialState.activeLayerId,
    layerVisibility: { ...DEFAULT_PCB_LAYER_VISIBILITY },
    inspectorOpen: initialState.inspectorOpen,
    problemsOpen: initialState.problemsOpen,
  }),
}));

export function getPcbDrawerSectionForView(viewId: string): PcbDrawerSection | null {
  if (viewId === 'pcb-constraints') return 'rules';
  if (viewId === 'board-designer' || viewId === 'pcb-drc') return 'objects';
  return null;
}
