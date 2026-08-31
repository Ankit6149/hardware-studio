'use client';

import React, { useState } from 'react';
import {
  Boxes,
  CircuitBoard,
  Eye,
  EyeOff,
  Layers3,
  ListTree,
  Network,
  Plus,
  Ruler,
  TableProperties,
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useStudioContextStore } from '../../store/studioContextStore';
import {
  PCB_EDITOR_LAYERS,
  type PcbDrawerSection,
  usePcbWorkspaceUiStore,
} from '../../store/pcbWorkspaceUiStore';

const drawerSections: readonly { id: PcbDrawerSection; label: string; icon: typeof Boxes }[] = [
  { id: 'objects', label: 'Objects', icon: Boxes },
  { id: 'nets', label: 'Nets', icon: Network },
  { id: 'layers', label: 'Layers', icon: Layers3 },
  { id: 'rules', label: 'Rules', icon: Ruler },
  { id: 'stackup', label: 'Stackup', icon: ListTree },
] as const;

export const PcbProjectDrawer: React.FC = () => {
  const boards = useProjectStore((state) => state.boards || []);
  const projectActiveBoardId = useProjectStore((state) => state.activeBoardId);
  const boardComponents = useProjectStore((state) => state.boardComponents || []);
  const nets = useProjectStore((state) => state.nets || []);
  const traces = useProjectStore((state) => state.traces || []);
  const padNetAssignments = useProjectStore((state) => state.padNetAssignments || []);
  const pcbRules = useProjectStore((state) => state.pcbRules || []);
  const pcbLayers = useProjectStore((state) => state.pcbLayers || []);
  const addPcbRule = useProjectStore((state) => state.addPcbRule);
  const updatePcbRule = useProjectStore((state) => state.updatePcbRule);
  const setActiveView = useProjectStore((state) => state.setActiveView);

  const contextBoardId = useStudioContextStore((state) => state.activeBoardId);
  const activeComponentId = useStudioContextStore((state) => state.activeComponentId);
  const activeNetName = useStudioContextStore((state) => state.activeNetName);
  const select = useStudioContextStore((state) => state.select);

  const activeSection = usePcbWorkspaceUiStore((state) => state.activeSection);
  const activeLayerId = usePcbWorkspaceUiStore((state) => state.activeLayerId);
  const layerVisibility = usePcbWorkspaceUiStore((state) => state.layerVisibility);
  const setActiveSection = usePcbWorkspaceUiStore((state) => state.setActiveSection);
  const setActiveLayer = usePcbWorkspaceUiStore((state) => state.setActiveLayer);
  const toggleLayerVisibility = usePcbWorkspaceUiStore((state) => state.toggleLayerVisibility);
  const setInspectorOpen = usePcbWorkspaceUiStore((state) => state.setInspectorOpen);

  const [newRuleType, setNewRuleType] = useState('');
  const [newRuleValue, setNewRuleValue] = useState('');
  const [newRuleUnit, setNewRuleUnit] = useState('mm');

  const activeBoardId = [contextBoardId, projectActiveBoardId]
    .find((candidate): candidate is string => Boolean(candidate && boards.some((board) => board.id === candidate))) || null;
  const activeBoard = boards.find((board) => board.id === activeBoardId) || null;
  const boardObjects = activeBoardId
    ? boardComponents.filter((component) => component.boardId === activeBoardId)
    : [];
  const boardTraces = activeBoardId
    ? traces.filter((trace) => trace.boardId === activeBoardId)
    : [];
  const boardRules = activeBoardId
    ? pcbRules.filter((rule) => rule.boardId === activeBoardId)
    : [];
  const stackupLayers = activeBoardId
    ? pcbLayers.filter((layer) => layer.boardId === activeBoardId).slice().sort((a, b) => a.order - b.order)
    : [];

  const componentIds = new Set(boardObjects.map((component) => component.id));
  const referenceDesignators = new Set(boardObjects.map((component) => component.referenceDesignator));
  const netRows = activeBoardId
    ? nets
      .map((net) => {
        const padCount = padNetAssignments.filter((assignment) => (
          assignment.netName === net.netName
          && (componentIds.has(assignment.componentId) || referenceDesignators.has(assignment.referenceDesignator))
        )).length;
        const traceCount = boardTraces.filter((trace) => trace.netName === net.netName || trace.netId === net.id).length;
        return { ...net, padCount, traceCount };
      })
      .filter((net) => net.padCount > 0 || net.traceCount > 0)
    : [];

  const selectComponent = (componentId: string) => {
    const component = boardObjects.find((candidate) => candidate.id === componentId);
    if (!component || !activeBoardId) return;
    select({
      entity: 'component-instance',
      id: component.id,
      label: component.referenceDesignator,
      boardId: activeBoardId,
      componentId: component.id,
    });
    setInspectorOpen(true);
  };

  const selectNet = (netName: string) => {
    if (!activeBoardId) return;
    select({
      entity: 'net',
      id: netName,
      label: netName,
      boardId: activeBoardId,
      netName,
    });
    setInspectorOpen(false);
  };

  const createRule = (event: React.FormEvent) => {
    event.preventDefault();
    const ruleType = newRuleType.trim();
    const value = newRuleValue.trim();
    const unit = newRuleUnit.trim();
    if (!activeBoardId || !ruleType || !value) return;
    addPcbRule({
      boardId: activeBoardId,
      ruleType,
      value,
      unit: unit || undefined,
      severity: 'Warning',
      description: 'Explicit PCB rule created from the PCB Project Drawer.',
    });
    setNewRuleType('');
    setNewRuleValue('');
  };

  return (
    <aside
      className="z-20 flex h-full w-[228px] shrink-0 flex-col overflow-hidden border-r border-[#cfc9bd] bg-[#f7f3eb]"
      aria-label="PCB project drawer"
      data-studio-shell="project-drawer"
      data-pcb-drawer="integrated"
    >
      <div className="shrink-0 border-b border-[#d8d1c5] px-2.5 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <CircuitBoard className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold text-slate-950">{activeBoard?.name || 'PCB'}</p>
            <p className="truncate text-[8px] text-slate-400">{activeBoard ? `${boardObjects.length} objects · ${boardTraces.length} traces` : 'No explicit board selected'}</p>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1">
          <button type="button" onClick={() => setActiveView('board-settings')} className="h-7 border border-[#d8d1c5] bg-[#fbfaf6] text-[8px] font-semibold text-slate-600 hover:bg-white hover:text-slate-950">Board setup</button>
          <button type="button" onClick={() => setActiveView('bom')} className="h-7 border border-[#d8d1c5] bg-[#fbfaf6] text-[8px] font-semibold text-slate-600 hover:bg-white hover:text-slate-950">BOM</button>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-5 border-b border-[#d8d1c5] bg-[#f0ece3] p-1" role="tablist" aria-label="PCB project context">
        {drawerSections.map((section) => {
          const Icon = section.icon;
          const active = activeSection === section.id;
          return (
            <button
              key={section.id}
              type="button"
              role="tab"
              aria-selected={active}
              title={section.label}
              onClick={() => {
                setActiveSection(section.id);
                setActiveView('board-designer');
              }}
              className={`grid h-10 place-items-center gap-0.5 text-[7px] font-semibold focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400 ${active ? 'bg-slate-950 text-white' : 'text-slate-500 hover:bg-white hover:text-slate-950'}`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{section.label}</span>
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {!activeBoard && (
          <div className="m-2 border border-amber-300 bg-amber-50 p-2 text-[9px] leading-4 text-amber-900">
            Select or create a real board in Board setup. PCB context stays unresolved until then.
          </div>
        )}

        {activeBoard && activeSection === 'objects' && (
          <div className="p-1.5">
            <p className="px-1 pb-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-400">Board objects</p>
            <div className="space-y-0.5">
              {boardObjects.map((component) => {
                const placed = component.pcb?.placed === true || (component.placementX != null && component.placementY != null);
                const active = activeComponentId === component.id;
                return (
                  <button
                    key={component.id}
                    type="button"
                    draggable={!placed}
                    onDragStart={(event) => {
                      if (placed) return;
                      event.dataTransfer.setData('application/hardware-studio-component', component.id);
                      selectComponent(component.id);
                    }}
                    onClick={() => selectComponent(component.id)}
                    className={`flex w-full items-center gap-2 px-2 py-1.5 text-left ${active ? 'bg-slate-950 text-white' : 'hover:bg-[#ece6dc]'}`}
                  >
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${placed ? 'bg-emerald-500' : 'bg-amber-500'}`} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[9px] font-semibold">{component.referenceDesignator} · {component.componentName}</span>
                      <span className={`block truncate font-mono text-[7px] ${active ? 'text-white/55' : 'text-slate-400'}`}>{component.footprint || 'footprint unresolved'} · {placed ? 'placed' : 'drag to board'}</span>
                    </span>
                  </button>
                );
              })}
              {boardObjects.length === 0 && <p className="p-2 text-[9px] leading-4 text-slate-400">No canonical components belong to this board yet.</p>}
            </div>
          </div>
        )}

        {activeBoard && activeSection === 'nets' && (
          <div className="p-1.5">
            <p className="px-1 pb-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-400">Board-connected nets</p>
            <div className="space-y-0.5">
              {netRows.map((net) => {
                const active = activeNetName === net.netName;
                return (
                  <button key={net.id} type="button" onClick={() => selectNet(net.netName)} className={`flex w-full items-center gap-2 px-2 py-1.5 text-left ${active ? 'bg-slate-950 text-white' : 'hover:bg-[#ece6dc]'}`}>
                    <span className="min-w-0 flex-1 truncate text-[9px] font-semibold">{net.netName}</span>
                    <span className={`font-mono text-[7px] ${active ? 'text-white/55' : 'text-slate-400'}`}>{net.padCount}p · {net.traceCount}t</span>
                  </button>
                );
              })}
              {netRows.length === 0 && <p className="p-2 text-[9px] leading-4 text-slate-400">No net has an explicit pad or trace relationship to this board yet.</p>}
            </div>
          </div>
        )}

        {activeBoard && activeSection === 'layers' && (
          <div className="p-1.5">
            <p className="px-1 pb-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-400">Editor layers</p>
            {PCB_EDITOR_LAYERS.map((layer) => {
              const visible = layerVisibility[layer.id] !== false;
              const active = activeLayerId === layer.id;
              return (
                <div key={layer.id} className={`flex min-h-9 items-center gap-1 ${active ? 'bg-[#e4ddd0]' : ''}`}>
                  <button type="button" onClick={() => toggleLayerVisibility(layer.id)} className="grid h-8 w-8 shrink-0 place-items-center text-slate-500 hover:bg-white hover:text-slate-950" aria-label={`${visible ? 'Hide' : 'Show'} ${layer.label}`}>
                    {visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </button>
                  <button type="button" disabled={!layer.routable} onClick={() => setActiveLayer(layer.id)} className={`min-w-0 flex-1 px-1 text-left text-[9px] ${active ? 'font-semibold text-slate-950' : layer.routable ? 'text-slate-600' : 'text-slate-400'}`}>
                    {layer.label}
                  </button>
                  {layer.routable && <span className="pr-2 font-mono text-[7px] text-slate-400">{active ? 'route' : ''}</span>}
                </div>
              );
            })}
            <p className="mt-2 border-t border-[#d8d1c5] px-1 pt-2 text-[8px] leading-4 text-slate-400">Visibility and active routing layer are workspace UI state, not saved engineering evidence.</p>
          </div>
        )}

        {activeBoard && activeSection === 'rules' && (
          <div className="p-1.5">
            <p className="px-1 pb-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-400">Explicit board rules</p>
            <div className="space-y-1">
              {boardRules.map((rule) => (
                <div key={rule.id} className="border border-[#d8d1c5] bg-[#fbfaf6] p-2">
                  <div className="flex items-center gap-1.5">
                    <span className="min-w-0 flex-1 truncate text-[9px] font-semibold text-slate-800">{rule.ruleType}</span>
                    <span className="text-[7px] uppercase text-slate-400">{rule.severity || 'Warning'}</span>
                  </div>
                  <div className="mt-1.5 grid grid-cols-[minmax(0,1fr)_3.8rem] gap-1">
                    <input key={`${rule.id}:value:${rule.value || ''}`} defaultValue={rule.value || ''} onBlur={(event) => updatePcbRule(rule.id, { value: event.target.value })} aria-label={`${rule.ruleType} value`} className="h-7 min-w-0 border border-slate-300 bg-white px-1.5 font-mono text-[9px]" />
                    <input key={`${rule.id}:unit:${rule.unit || ''}`} defaultValue={rule.unit || ''} onBlur={(event) => updatePcbRule(rule.id, { unit: event.target.value })} aria-label={`${rule.ruleType} unit`} className="h-7 min-w-0 border border-slate-300 bg-white px-1.5 font-mono text-[9px]" />
                  </div>
                </div>
              ))}
              {boardRules.length === 0 && <p className="p-2 text-[9px] leading-4 text-slate-400">No PCB rule is explicitly recorded for this board.</p>}
            </div>
            <form onSubmit={createRule} className="mt-2 border-t border-[#d8d1c5] pt-2">
              <p className="mb-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-400">Add explicit rule</p>
              <input value={newRuleType} onChange={(event) => setNewRuleType(event.target.value)} placeholder="Rule type" aria-label="New PCB rule type" className="h-7 w-full border border-slate-300 bg-white px-1.5 text-[9px]" />
              <div className="mt-1 grid grid-cols-[minmax(0,1fr)_3.8rem] gap-1">
                <input value={newRuleValue} onChange={(event) => setNewRuleValue(event.target.value)} placeholder="Value" aria-label="New PCB rule value" className="h-7 min-w-0 border border-slate-300 bg-white px-1.5 font-mono text-[9px]" />
                <input value={newRuleUnit} onChange={(event) => setNewRuleUnit(event.target.value)} placeholder="Unit" aria-label="New PCB rule unit" className="h-7 min-w-0 border border-slate-300 bg-white px-1.5 font-mono text-[9px]" />
              </div>
              <button type="submit" disabled={!newRuleType.trim() || !newRuleValue.trim()} className="mt-1.5 inline-flex h-7 w-full items-center justify-center gap-1 bg-slate-950 text-[8px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-30">
                <Plus className="h-3 w-3" aria-hidden="true" /> Add rule
              </button>
            </form>
          </div>
        )}

        {activeBoard && activeSection === 'stackup' && (
          <div className="p-1.5">
            <p className="px-1 pb-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-400">Canonical stackup</p>
            <div className="space-y-1">
              {stackupLayers.map((layer) => (
                <div key={layer.id} className="grid grid-cols-[1.5rem_minmax(0,1fr)_3.5rem] items-center gap-1.5 border border-[#d8d1c5] bg-[#fbfaf6] px-2 py-1.5">
                  <span className="font-mono text-[7px] text-slate-400">{layer.order}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-[9px] font-semibold text-slate-800">{layer.name}</span>
                    <span className="block truncate text-[7px] text-slate-400">{layer.type}</span>
                  </span>
                  <span className="text-right font-mono text-[7px] text-slate-500">{layer.thicknessUm != null ? `${layer.thicknessUm} µm` : '—'}</span>
                </div>
              ))}
              {stackupLayers.length === 0 && (
                <div className="border border-amber-300 bg-amber-50 p-2 text-[9px] leading-4 text-amber-900">
                  Stackup unresolved. Hardware Studio will not infer copper/core/prepreg layers from board metadata.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-[#d8d1c5] px-2 py-1.5 text-[7px] text-slate-400">
        <TableProperties className="mr-1 inline h-3 w-3" aria-hidden="true" /> One board context · no duplicate PCB mini-apps
      </div>
    </aside>
  );
};
