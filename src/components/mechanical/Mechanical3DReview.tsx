'use client';

import React from 'react';
import { BadgeCheck, CircuitBoard } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useStudioContextStore } from '../../store/studioContextStore';
import { EngineeringEditorBar, EngineeringStatusBar } from '../editor/EngineeringEditorShell';
import { UnifiedBoard3DView } from './UnifiedBoard3DView';

export const Mechanical3DReview: React.FC = () => {
  const boards = useProjectStore((state) => state.boards || []);
  const projectActiveBoardId = useProjectStore((state) => state.activeBoardId);
  const contextBoardId = useStudioContextStore((state) => state.activeBoardId);
  const selected = useStudioContextStore((state) => state.selected);
  const boardId = contextBoardId || projectActiveBoardId || null;
  const board = boards.find((candidate) => candidate.id === boardId);
  const selectedLabel = selected?.label || selected?.id || 'No canonical selection';

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden" aria-label="Mechanical 3D review representation">
      <EngineeringEditorBar
        domain="Mechanical"
        title="3D Review"
        meta={`${board?.name || 'Board context unresolved'} · evidence-backed visualization only`}
        actions={(
          <div className="inline-flex h-8 items-center gap-1.5 border border-sky-200 bg-sky-50 px-2.5 text-[9px] font-semibold text-sky-800" title="Three.js renders explicit recorded dimensions only. This is not a CAD kernel or verification evidence.">
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> Visualization only
          </div>
        )}
      />
      <div className="min-h-0 flex-1 overflow-hidden [&>section>header]:hidden">
        <UnifiedBoard3DView />
      </div>
      <EngineeringStatusBar
        left="3D Review is not CAD and never grants validation authority."
        center={`Selection · ${selectedLabel}`}
        right={board ? <span className="inline-flex items-center gap-1"><CircuitBoard className="h-3 w-3" aria-hidden="true" /> {board.name}</span> : 'board unresolved'}
      />
    </section>
  );
};
