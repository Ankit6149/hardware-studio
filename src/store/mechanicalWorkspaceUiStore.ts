import { create } from 'zustand';

export type MechanicalDrawerSection = 'features' | 'dimensions' | 'assembly';

interface MechanicalWorkspaceUiState {
  drawerSection: MechanicalDrawerSection;
  inspectorOpen: boolean;
  problemsOpen: boolean;
  panMode: boolean;
  setDrawerSection: (drawerSection: MechanicalDrawerSection) => void;
  setInspectorOpen: (inspectorOpen: boolean) => void;
  setProblemsOpen: (problemsOpen: boolean) => void;
  setPanMode: (panMode: boolean) => void;
}

export const useMechanicalWorkspaceUiStore = create<MechanicalWorkspaceUiState>((set) => ({
  drawerSection: 'features',
  inspectorOpen: false,
  problemsOpen: false,
  panMode: false,
  setDrawerSection: (drawerSection) => set({ drawerSection }),
  setInspectorOpen: (inspectorOpen) => set({ inspectorOpen }),
  setProblemsOpen: (problemsOpen) => set({ problemsOpen }),
  setPanMode: (panMode) => set({ panMode }),
}));
