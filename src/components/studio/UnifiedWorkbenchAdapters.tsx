'use client';

import React, { useEffect, useRef } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useStudioContextStore, type MechanicalWorkbenchMode } from '../../store/studioContextStore';
import { ComponentLibraryWorkbench } from '../component-library/ComponentLibraryWorkbench';
import { EngineeringBoardWorkbench } from '../board/EngineeringBoardWorkbench';
import { EngineeringSchematicWorkbench } from '../schematic/EngineeringSchematicWorkbench';
import { EngineeringMechanicalWorkbench } from '../mechanical/EngineeringMechanicalWorkbench';
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

export const UnifiedSchematicWorkbench: React.FC = () => <EngineeringSchematicWorkbench />;

export const UnifiedBoardDesignerWorkbench: React.FC = () => <EngineeringBoardWorkbench />;

export const UnifiedMechanicalWorkbench: React.FC<{ defaultMode: MechanicalWorkbenchMode }> = ({ defaultMode }) => {
  const requestedMode = useStudioContextStore((state) => state.requestedMechanicalMode);
  const resolvedMode = requestedMode || defaultMode;

  if (resolvedMode === 'webgl-3d' || resolvedMode === '3d-preview') {
    return <UnifiedBoard3DView />;
  }

  return <EngineeringMechanicalWorkbench key={resolvedMode} initialMode={resolvedMode} />;
};
