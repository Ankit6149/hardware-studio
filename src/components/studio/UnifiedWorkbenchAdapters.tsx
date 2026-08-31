'use client';

import React, { useEffect } from 'react';
import { useStudioContextStore, type MechanicalWorkbenchMode } from '../../store/studioContextStore';
import {
  useMechanicalWorkspaceUiStore,
  type MechanicalRepresentation,
} from '../../store/mechanicalWorkspaceUiStore';
import { ComponentLibraryWorkbench } from '../component-library/ComponentLibraryWorkbench';
import { EngineeringBoardWorkbench } from '../board/EngineeringBoardWorkbench';
import { EngineeringSchematicWorkbench } from '../schematic/EngineeringSchematicWorkbench';
import { EngineeringMechanicalWorkbench } from '../mechanical/EngineeringMechanicalWorkbench';
import { Mechanical3DReview } from '../mechanical/Mechanical3DReview';
import { MechanicalRepresentationTabs } from '../mechanical/MechanicalRepresentationTabs';

export const UnifiedComponentLibraryWorkbench: React.FC = () => <ComponentLibraryWorkbench />;

export const UnifiedSchematicWorkbench: React.FC = () => <EngineeringSchematicWorkbench />;

export const UnifiedBoardDesignerWorkbench: React.FC = () => <EngineeringBoardWorkbench />;

export function mechanicalRepresentationForLegacyMode(mode: MechanicalWorkbenchMode): MechanicalRepresentation {
  if (mode === 'assembly') return 'assembly';
  if (mode === 'webgl-3d' || mode === '3d-preview') return 'review-3d';
  return 'layout';
}

export const UnifiedMechanicalWorkbench: React.FC<{ defaultMode: MechanicalWorkbenchMode }> = ({ defaultMode }) => {
  const requestedMode = useStudioContextStore((state) => state.requestedMechanicalMode);
  const requestMechanicalMode = useStudioContextStore((state) => state.requestMechanicalMode);
  const representation = useMechanicalWorkspaceUiStore((state) => state.representation);
  const setRepresentation = useMechanicalWorkspaceUiStore((state) => state.setRepresentation);

  useEffect(() => {
    const incomingMode = requestedMode || defaultMode;
    setRepresentation(mechanicalRepresentationForLegacyMode(incomingMode));
    if (requestedMode) requestMechanicalMode(null);
  }, [defaultMode, requestMechanicalMode, requestedMode, setRepresentation]);

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden" data-workbench="mechanical" data-mechanical-representation={representation}>
      <MechanicalRepresentationTabs />
      <div className="min-h-0 flex-1 overflow-hidden">
        {representation === 'review-3d' && <Mechanical3DReview />}
        {representation === 'assembly' && <EngineeringMechanicalWorkbench initialMode="assembly" />}
        {representation === 'layout' && <EngineeringMechanicalWorkbench initialMode="canvas" />}
      </div>
    </section>
  );
};
