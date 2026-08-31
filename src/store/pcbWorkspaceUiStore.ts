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
  problemsRequestId: number;
  setActiveSection: (section: PcbDrawerSection) => void;
  setActiveLayer: (layerId: string) => void;
  setLayerVisibility: (visibility: Record<string, boolean>) => void;
  toggleLayerVisibility: (layerId: string) => void;
  requestProblems: () => void;
  reset: () => void;
}

const initialState = {
  activeSection: 'objects' as PcbDrawerSection,
  activeLayerId: 'top-copper',
  layerVisibility: { ...DEFAULT_PCB_LAYER_VISIBILITY },
  problemsRequestId: 0,
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
  requestProblems: () => set((state) => ({ problemsRequestId: state.problemsRequestId + 1 })),
  reset: () => set({
    activeSection: initialState.activeSection,
    activeLayerId: initialState.activeLayerId,
    layerVisibility: { ...DEFAULT_PCB_LAYER_VISIBILITY },
    problemsRequestId: 0,
  }),
}));

export function getPcbDrawerSectionForView(viewId: string): PcbDrawerSection | null {
  if (viewId === 'pcb-constraints') return 'rules';
  if (viewId === 'board-designer' || viewId === 'pcb-drc') return 'objects';
  return null;
}
