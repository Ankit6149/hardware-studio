'use client';

import React from 'react';
import { Boxes, Eye, EyeOff, Layers, Lock, Ruler, Unlock } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useStudioContextStore } from '../../store/studioContextStore';
import { useMechanicalWorkspaceUiStore, type MechanicalDrawerSection } from '../../store/mechanicalWorkspaceUiStore';

const sections: Array<{ id: MechanicalDrawerSection; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'features', label: 'Features', icon: Boxes },
  { id: 'dimensions', label: 'Dimensions', icon: Ruler },
  { id: 'assembly', label: 'Assembly', icon: Layers },
];

export const MechanicalProjectDrawer: React.FC = () => {
  const objects = useProjectStore((state) => state.mechanicalObjects || []);
  const dimensions = useProjectStore((state) => state.mechanicalDimensions || []);
  const assemblyLayers = useProjectStore((state) => state.assemblyLayers || []);
  const updateMechanicalObject = useProjectStore((state) => state.updateMechanicalObject);
  const selected = useStudioContextStore((state) => state.selected);
  const select = useStudioContextStore((state) => state.select);
  const drawerSection = useMechanicalWorkspaceUiStore((state) => state.drawerSection);
  const representation = useMechanicalWorkspaceUiStore((state) => state.representation);
  const setDrawerSection = useMechanicalWorkspaceUiStore((state) => state.setDrawerSection);
  const setRepresentation = useMechanicalWorkspaceUiStore((state) => state.setRepresentation);
  const setInspectorOpen = useMechanicalWorkspaceUiStore((state) => state.setInspectorOpen);

  const selectObject = (id: string, label: string, boardId?: string) => {
    select({ entity: 'mechanical-object', id, label, boardId: boardId || null });
    setInspectorOpen(true);
  };

  const openSection = (section: MechanicalDrawerSection) => {
    setDrawerSection(section);
    if (section === 'assembly') setRepresentation('assembly');
    else if (representation === 'assembly') setRepresentation('layout');
  };

  return (
    <aside
      className="z-20 flex h-full w-[216px] shrink-0 flex-col overflow-hidden border-r border-[#cfc9bd] bg-[#f7f3eb]"
      aria-label="Mechanical project drawer"
      data-studio-shell="project-drawer"
      data-workbench="mechanical"
    >
      <div className="shrink-0 border-b border-[#d8d1c5] px-3 py-2.5">
        <div className="text-[8px] font-semibold uppercase tracking-[0.13em] text-slate-400">Mechanical</div>
        <h2 className="mt-1 text-[12px] font-semibold text-slate-950">Product structure</h2>
      </div>

      <div className="grid shrink-0 grid-cols-3 border-b border-[#d8d1c5] bg-[#f1ece3]">
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => openSection(id)}
            aria-pressed={drawerSection === id}
            className={`flex min-h-11 flex-col items-center justify-center gap-1 border-r border-[#d8d1c5] text-[8px] font-semibold last:border-r-0 ${drawerSection === id ? 'bg-[#fbfaf6] text-slate-950' : 'text-slate-500 hover:bg-[#ece6dc]'}`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
        {drawerSection === 'features' && (
          <div className="space-y-0.5">
            {objects.map((object) => {
              const active = selected?.entity === 'mechanical-object' && selected.id === object.id;
              return (
                <div key={object.id} className={`flex items-center gap-1 ${active ? 'bg-slate-950 text-white' : 'hover:bg-[#ece6dc]'}`}>
                  <button
                    type="button"
                    onClick={() => updateMechanicalObject(object.id, { visible: !object.visible })}
                    className={`grid h-8 w-8 shrink-0 place-items-center ${active ? 'text-white/60' : 'text-slate-400'}`}
                    aria-label={object.visible ? `Hide ${object.name}` : `Show ${object.name}`}
                  >
                    {object.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </button>
                  <button type="button" onClick={() => selectObject(object.id, object.name, object.linkedBoardId)} className="min-w-0 flex-1 py-1.5 text-left">
                    <span className="block truncate text-[9px] font-semibold">{object.name}</span>
                    <span className={`block truncate text-[8px] ${active ? 'text-white/55' : 'text-slate-400'}`}>{object.type}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateMechanicalObject(object.id, { locked: !object.locked })}
                    className={`grid h-8 w-8 shrink-0 place-items-center ${active ? 'text-white/60' : 'text-slate-400'}`}
                    aria-label={object.locked ? `Unlock ${object.name}` : `Lock ${object.name}`}
                  >
                    {object.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                  </button>
                </div>
              );
            })}
            {objects.length === 0 && <p className="p-3 text-[9px] leading-4 text-slate-400">No physical features yet. Create geometry from the Mechanical toolbar with explicit dimensions.</p>}
          </div>
        )}

        {drawerSection === 'dimensions' && (
          <div className="space-y-1">
            {dimensions.map((dimension) => (
              <button
                key={dimension.id}
                type="button"
                onClick={() => {
                  const objectId = dimension.linkedObjectIds[0];
                  const object = objects.find((candidate) => candidate.id === objectId);
                  if (object) selectObject(object.id, object.name, object.linkedBoardId);
                }}
                className="w-full border border-slate-200 bg-[#fbfaf6] px-2 py-2 text-left hover:border-slate-400"
              >
                <span className="block truncate text-[9px] font-semibold text-slate-800">{dimension.name}</span>
                <span className="mt-0.5 block font-mono text-[8px] text-slate-500">{dimension.valueMm.toFixed(2)} mm</span>
              </button>
            ))}
            {dimensions.length === 0 && <p className="p-3 text-[9px] leading-4 text-slate-400">No captured dimensional evidence.</p>}
          </div>
        )}

        {drawerSection === 'assembly' && (
          <div className="space-y-1">
            {[...assemblyLayers].sort((a, b) => a.order - b.order).map((layer, index) => (
              <div key={layer.id} className="border border-slate-200 bg-[#fbfaf6] px-2 py-2">
                <div className="flex items-start gap-2">
                  <span className="font-mono text-[8px] text-slate-400">{String(index + 1).padStart(2, '0')}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[9px] font-semibold text-slate-800">{layer.name}</p>
                    <p className="mt-0.5 truncate text-[8px] text-slate-500">{layer.material || 'material unresolved'} · {layer.fasteningMethod || 'fastening unresolved'}</p>
                  </div>
                </div>
              </div>
            ))}
            {assemblyLayers.length === 0 && <p className="p-3 text-[9px] leading-4 text-slate-400">No assembly definition yet.</p>}
          </div>
        )}
      </div>
    </aside>
  );
};
