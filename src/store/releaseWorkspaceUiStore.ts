import { create } from 'zustand';

export type ReleaseDrawerSection = 'readiness' | 'snapshots' | 'outputs' | 'drawings' | 'factory';
export type ReleaseSelectionKind = 'snapshot' | 'candidate' | 'release';

interface ReleaseWorkspaceUiState {
  drawerSection: ReleaseDrawerSection;
  selectedKind: ReleaseSelectionKind | null;
  selectedRecordId: string | null;
  inspectorOpen: boolean;
  bottomDockOpen: boolean;
  setDrawerSection: (section: ReleaseDrawerSection) => void;
  selectRecord: (kind: ReleaseSelectionKind, id: string) => void;
  clearSelection: () => void;
  setInspectorOpen: (open: boolean) => void;
  setBottomDockOpen: (open: boolean) => void;
}

export const useReleaseWorkspaceUiStore = create<ReleaseWorkspaceUiState>((set) => ({
  drawerSection: 'readiness',
  selectedKind: null,
  selectedRecordId: null,
  inspectorOpen: true,
  bottomDockOpen: false,
  setDrawerSection: (drawerSection) => set({ drawerSection }),
  selectRecord: (selectedKind, selectedRecordId) => set({ selectedKind, selectedRecordId, inspectorOpen: true }),
  clearSelection: () => set({ selectedKind: null, selectedRecordId: null }),
  setInspectorOpen: (inspectorOpen) => set({ inspectorOpen }),
  setBottomDockOpen: (bottomDockOpen) => set({ bottomDockOpen }),
}));
