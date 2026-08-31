'use client';

import React from 'react';
import { Boxes, Layers3, Ruler } from 'lucide-react';
import {
  useMechanicalWorkspaceUiStore,
  type MechanicalRepresentation,
} from '../../store/mechanicalWorkspaceUiStore';

const representations: Array<{
  id: MechanicalRepresentation;
  label: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'layout', label: '2D Layout', detail: 'Authoring', icon: Ruler },
  { id: 'review-3d', label: '3D Review', detail: 'Visualization', icon: Layers3 },
  { id: 'assembly', label: 'Assembly', detail: 'Physical stack', icon: Boxes },
];

export const MechanicalRepresentationTabs: React.FC = () => {
  const representation = useMechanicalWorkspaceUiStore((state) => state.representation);
  const setRepresentation = useMechanicalWorkspaceUiStore((state) => state.setRepresentation);

  return (
    <div
      className="flex h-9 shrink-0 items-stretch border-b border-[#cfc9bd] bg-[#efeae1]"
      role="tablist"
      aria-label="Mechanical representations"
      data-mechanical-representation-tabs
    >
      <div className="flex shrink-0 items-center border-r border-[#d7d0c4] px-3 text-[8px] font-semibold uppercase tracking-[0.13em] text-slate-400">
        Representation
      </div>
      {representations.map(({ id, label, detail, icon: Icon }) => {
        const active = representation === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setRepresentation(id)}
            className={`relative flex min-w-[118px] items-center gap-2 border-r border-[#d7d0c4] px-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400/70 ${active ? 'bg-[#fbfaf6] text-slate-950' : 'text-slate-500 hover:bg-[#e7e1d7] hover:text-slate-900'}`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="min-w-0">
              <span className="block text-[10px] font-semibold">{label}</span>
              <span className="block text-[8px] text-slate-400">{detail}</span>
            </span>
            {active && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-slate-950" aria-hidden="true" />}
          </button>
        );
      })}
      <div className="min-w-0 flex-1" />
      <div className="flex shrink-0 items-center px-3 text-[8px] text-slate-400">
        3D review never grants CAD or validation authority.
      </div>
    </div>
  );
};
