'use client';

import React from 'react';
import { useStudioContextStore, type MechanicalWorkbenchMode } from '../../store/studioContextStore';
import { ComponentLibraryWorkbench } from '../component-library/ComponentLibraryWorkbench';
import { EngineeringBoardWorkbench } from '../board/EngineeringBoardWorkbench';
import { EngineeringSchematicWorkbench } from '../schematic/EngineeringSchematicWorkbench';
import { EngineeringMechanicalWorkbench } from '../mechanical/EngineeringMechanicalWorkbench';
import { UnifiedBoard3DView } from '../mechanical/UnifiedBoard3DView';

export const UnifiedComponentLibraryWorkbench: React.FC = () => <ComponentLibraryWorkbench />;

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
