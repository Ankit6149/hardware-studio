import { create } from 'zustand';

export type ValidationWorkspaceView = 'define' | 'execute' | 'review' | 'coverage' | 'factory-qa';
export type ValidationDrawerSection = 'tests' | 'coverage' | 'factory-qa' | 'runs';

interface ValidationWorkspaceUiState {
  view: ValidationWorkspaceView;
  drawerSection: ValidationDrawerSection;
  selectedTestId: string | null;
  selectedRunId: string | null;
  inspectorOpen: boolean;
  bottomDockOpen: boolean;
  setView: (view: ValidationWorkspaceView) => void;
  setDrawerSection: (section: ValidationDrawerSection) => void;
  setSelectedTestId: (id: string | null) => void;
  setSelectedRunId: (id: string | null) => void;
  setInspectorOpen: (open: boolean) => void;
  setBottomDockOpen: (open: boolean) => void;
  resetTransientSelection: () => void;
}

export const useValidationWorkspaceUiStore = create<ValidationWorkspaceUiState>((set) => ({
  view: 'define',
  drawerSection: 'tests',
  selectedTestId: null,
  selectedRunId: null,
  inspectorOpen: true,
  bottomDockOpen: false,
  setView: (view) => set({ view }),
  setDrawerSection: (drawerSection) => set({ drawerSection }),
  setSelectedTestId: (selectedTestId) => set({ selectedTestId, selectedRunId: null }),
  setSelectedRunId: (selectedRunId) => set({ selectedRunId }),
  setInspectorOpen: (inspectorOpen) => set({ inspectorOpen }),
  setBottomDockOpen: (bottomDockOpen) => set({ bottomDockOpen }),
  resetTransientSelection: () => set({ selectedTestId: null, selectedRunId: null, bottomDockOpen: false }),
}));
