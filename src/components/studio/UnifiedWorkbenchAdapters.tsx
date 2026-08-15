'use client';

import React, { useEffect, useRef } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useStudioContextStore, type MechanicalWorkbenchMode } from '../../store/studioContextStore';
import { ComponentLibraryWorkbench } from '../component-library/ComponentLibraryWorkbench';
import { BoardDesigner } from '../board/BoardDesigner';
import { UnifiedSchematicEditor } from '../schematic/UnifiedSchematicEditor';
import { MechanicalStudio } from '../mechanical/MechanicalStudio';
import { MechanicalDecisionBar } from '../mechanical/MechanicalDecisionBar';
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
  const activeBoardId = useStudioContextStore((state) => state.activeBoardId);
  const activeComponentId = useStudioContextStore((state) => state.activeComponentId);
  const activeNetName = useStudioContextStore((state) => state.activeNetName);

  // Opening an editor must never mutate engineering state. Components are placed
  // only from an explicit Place action inside the schematic workspace.
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

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50" aria-label="Mechanical decision workspace">
      <MechanicalDecisionBar currentMode={resolvedMode} />
      <div className="min-h-0 flex-1 overflow-hidden">
        {resolvedMode === 'webgl-3d'
          ? <UnifiedBoard3DView />
          : <MechanicalStudio key={resolvedMode} initialMode={resolvedMode} />}
      </div>
    </section>
  );
};