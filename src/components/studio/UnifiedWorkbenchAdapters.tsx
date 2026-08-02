'use client';

import React, { useEffect, useRef } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useStudioContextStore, type MechanicalWorkbenchMode } from '../../store/studioContextStore';
import { ComponentLibraryWorkbench } from '../component-library/ComponentLibraryWorkbench';
import { BoardDesigner } from '../board/BoardDesigner';
import { UnifiedSchematicEditor } from '../schematic/UnifiedSchematicEditor';
import { MechanicalStudio } from '../mechanical/MechanicalStudio';
import { UnifiedBoard3DView } from '../mechanical/UnifiedBoard3DView';

export const UnifiedComponentLibraryWorkbench: React.FC = () => {
  const boardComponents = useProjectStore((state) => state.boardComponents || []);
  const previousIds = useRef(new Set(boardComponents.map((component) => component.id)));
  const setActiveBoard = useStudioContextStore((state) => state.setActiveBoard);
  const setActiveComponentDefinition = useStudioContextStore((state) => state.setActiveComponentDefinition);
  const setActiveComponent = useStudioContextStore((state) => state.setActiveComponent);

  useEffect(() => {
    const previous = previousIds.current;
    const added = boardComponents.find((component) => !previous.has(component.id));
    previousIds.current = new Set(boardComponents.map((component) => component.id));
    if (!added) return;
    setActiveBoard(added.boardId || null);
    setActiveComponentDefinition(added.libraryId || null);
    setActiveComponent(added.id);
  }, [boardComponents, setActiveBoard, setActiveComponent, setActiveComponentDefinition]);

  return <ComponentLibraryWorkbench />;
};

export const UnifiedSchematicWorkbench: React.FC = () => {
  const activeComponentId = useStudioContextStore((state) => state.activeComponentId);
  const activeBoardId = useStudioContextStore((state) => state.activeBoardId);
  const activeNetName = useStudioContextStore((state) => state.activeNetName);
  const boardComponents = useProjectStore((state) => state.boardComponents || []);
  const placeComponentOnSchematic = useProjectStore((state) => state.placeComponentOnSchematic);
  const setActiveComponentDefinition = useStudioContextStore((state) => state.setActiveComponentDefinition);
  const setActiveComponent = useStudioContextStore((state) => state.setActiveComponent);

  useEffect(() => {
    const selected = boardComponents.find((component) => component.id === activeComponentId)
      || boardComponents.find((component) => !activeBoardId || component.boardId === activeBoardId);
    if (!selected) return;
    if (!activeComponentId) setActiveComponent(selected.id);
    if (selected.libraryId) setActiveComponentDefinition(selected.libraryId);
    if (selected.schematic?.placed) return;

    const boardPeers = boardComponents.filter((component) => component.boardId === selected.boardId && component.schematic?.placed);
    const column = boardPeers.length % 4;
    const row = Math.floor(boardPeers.length / 4);
    placeComponentOnSchematic(selected.id, 140 + column * 180, 140 + row * 140);
  }, [activeBoardId, activeComponentId, boardComponents, placeComponentOnSchematic, setActiveComponent, setActiveComponentDefinition]);

  return <UnifiedSchematicEditor key={`${activeBoardId || ''}:${activeComponentId || ''}:${activeNetName || ''}`} />;
};

export const UnifiedBoardDesignerWorkbench: React.FC = () => {
  const activeBoardId = useStudioContextStore((state) => state.activeBoardId);
  const activeComponentId = useStudioContextStore((state) => state.activeComponentId);
  const activeNetName = useStudioContextStore((state) => state.activeNetName);
  return <BoardDesigner key={`${activeBoardId || ''}:${activeComponentId || ''}:${activeNetName || ''}`} />;
};

export const UnifiedMechanicalWorkbench: React.FC<{ defaultMode: MechanicalWorkbenchMode }> = ({ defaultMode }) => {
  const requestedMode = useStudioContextStore((state) => state.requestedMechanicalMode);
  const resolvedMode = requestedMode || defaultMode;
  if (resolvedMode === 'webgl-3d') return <UnifiedBoard3DView />;
  return <MechanicalStudio key={resolvedMode} initialMode={resolvedMode} />;
};
