import { create } from 'zustand';

export type StudioContextEntity =
  | 'board'
  | 'component-definition'
  | 'component-instance'
  | 'component-pin'
  | 'pcb-pad'
  | 'net'
  | 'wire'
  | 'trace'
  | 'via'
  | 'mechanical-object'
  | 'validation-item';

export type MechanicalWorkbenchMode = 'canvas' | 'assembly' | '3d-preview' | 'webgl-3d';

export interface StudioSelection {
  entity: StudioContextEntity;
  id: string;
  label?: string;
  /** Parent context only. These IDs continue to point at existing project truth. */
  boardId?: string | null;
  componentId?: string | null;
  netName?: string | null;
}

interface StudioContextState {
  activeBoardId: string | null;
  activeComponentDefinitionId: string | null;
  activeComponentId: string | null;
  activeNetName: string | null;
  selected: StudioSelection | null;
  originView: string | null;
  returnView: string | null;
  requestedMechanicalMode: MechanicalWorkbenchMode | null;
  setActiveBoard: (boardId: string | null) => void;
  setActiveComponentDefinition: (definitionId: string | null) => void;
  setActiveComponent: (componentId: string | null) => void;
  setActiveNet: (netName: string | null) => void;
  select: (selection: StudioSelection | null) => void;
  beginHandoff: (originView: string, returnView?: string | null) => void;
  requestMechanicalMode: (mode: MechanicalWorkbenchMode | null) => void;
  clearContext: () => void;
}

export const useStudioContextStore = create<StudioContextState>((set) => ({
  activeBoardId: null,
  activeComponentDefinitionId: null,
  activeComponentId: null,
  activeNetName: null,
  selected: null,
  originView: null,
  returnView: null,
  requestedMechanicalMode: null,

  setActiveBoard: (activeBoardId) => set({
    activeBoardId,
    selected: activeBoardId ? { entity: 'board', id: activeBoardId, boardId: activeBoardId } : null,
  }),
  setActiveComponentDefinition: (activeComponentDefinitionId) => set({
    activeComponentDefinitionId,
    selected: activeComponentDefinitionId
      ? { entity: 'component-definition', id: activeComponentDefinitionId }
      : null,
  }),
  setActiveComponent: (activeComponentId) => set({
    activeComponentId,
    selected: activeComponentId
      ? { entity: 'component-instance', id: activeComponentId, componentId: activeComponentId }
      : null,
  }),
  setActiveNet: (activeNetName) => set({
    activeNetName,
    selected: activeNetName ? { entity: 'net', id: activeNetName, label: activeNetName, netName: activeNetName } : null,
  }),
  select: (selected) => set((state) => ({
    selected,
    activeBoardId: selected?.boardId !== undefined ? selected.boardId : state.activeBoardId,
    activeComponentId: selected?.componentId !== undefined ? selected.componentId : state.activeComponentId,
    activeNetName: selected?.netName !== undefined ? selected.netName : state.activeNetName,
  })),
  beginHandoff: (originView, returnView = originView) => set({ originView, returnView }),
  requestMechanicalMode: (requestedMechanicalMode) => set({ requestedMechanicalMode }),
  clearContext: () => set({
    activeBoardId: null,
    activeComponentDefinitionId: null,
    activeComponentId: null,
    activeNetName: null,
    selected: null,
    originView: null,
    returnView: null,
    requestedMechanicalMode: null,
  }),
}));
