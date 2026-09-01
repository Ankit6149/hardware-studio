import { create } from 'zustand';

export type FirmwareRepresentation = 'modules' | 'behavior' | 'hardware-map' | 'source';
export type FirmwareDrawerSection = 'modules' | 'files' | 'hardware-map' | 'environment';
export type FirmwareDockTab = 'problems' | 'build-evidence' | 'device-evidence';

interface FirmwareWorkspaceUiState {
  representation: FirmwareRepresentation;
  drawerSection: FirmwareDrawerSection;
  selectedModuleId: string | null;
  selectedFileId: string | null;
  inspectorOpen: boolean;
  dockOpen: boolean;
  dockTab: FirmwareDockTab;
  setRepresentation: (representation: FirmwareRepresentation) => void;
  setDrawerSection: (drawerSection: FirmwareDrawerSection) => void;
  setSelectedModuleId: (selectedModuleId: string | null) => void;
  setSelectedFileId: (selectedFileId: string | null) => void;
  setInspectorOpen: (inspectorOpen: boolean) => void;
  setDockOpen: (dockOpen: boolean) => void;
  setDockTab: (dockTab: FirmwareDockTab) => void;
  openDock: (dockTab: FirmwareDockTab) => void;
}

export const useFirmwareWorkspaceUiStore = create<FirmwareWorkspaceUiState>((set) => ({
  representation: 'modules',
  drawerSection: 'modules',
  selectedModuleId: null,
  selectedFileId: null,
  inspectorOpen: false,
  dockOpen: false,
  dockTab: 'problems',
  setRepresentation: (representation) => set({ representation }),
  setDrawerSection: (drawerSection) => set({ drawerSection }),
  setSelectedModuleId: (selectedModuleId) => set({ selectedModuleId }),
  setSelectedFileId: (selectedFileId) => set({ selectedFileId }),
  setInspectorOpen: (inspectorOpen) => set({ inspectorOpen }),
  setDockOpen: (dockOpen) => set({ dockOpen }),
  setDockTab: (dockTab) => set({ dockTab }),
  openDock: (dockTab) => set({ dockOpen: true, dockTab }),
}));
