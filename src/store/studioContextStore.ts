import { create } from 'zustand';

export type StudioContextEntity =
  | 'board'
  | 'component-definition'
  | 'component-instance'
  | 'net'
  | 'wire'
  | 'trace'
  | 'mechanical-object'
  | 'validation-item';

export interface StudioSelection {
  entity: StudioContextEntity;
  id: string;
  label?: string;
}

interface StudioContextState {
  activeBoardId: string | null;
  activeComponentDefinitionId: string | null;
  activeComponentId: string | null;
  activeNetName: string | null;
  selected: StudioSelection | null;
  originView: string | null;
  returnView: string | null;
  setActiveBoard: (boardId: string | null) => void;
  setActiveComponentDefinition: (definitionId: string | null) => void;
  setActiveComponent: (componentId: string | null) => void;
  setActiveNet: (netName: string | null) => void;
  select: (selection: StudioSelection | null) => void;
  beginHandoff: (originView: string, returnView?: string | null) => void;
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

  setActiveBoard: (activeBoardId) => set({
    activeBoardId,
    selected: activeBoardId ? { entity: 'board', id: activeBoardId } : null,
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
      ? { entity: 'component-instance', id: activeComponentId }
      : null,
  }),
  setActiveNet: (activeNetName) => set({
    activeNetName,
    selected: activeNetName ? { entity: 'net', id: activeNetName, label: activeNetName } : null,
  }),
  select: (selected) => set({ selected }),
  beginHandoff: (originView, returnView = originView) => set({ originView, returnView }),
  clearContext: () => set({
    activeBoardId: null,
    activeComponentDefinitionId: null,
    activeComponentId: null,
    activeNetName: null,
    selected: null,
    originView: null,
    returnView: null,
  }),
}));
