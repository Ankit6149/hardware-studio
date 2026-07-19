'use client';

import React, { useState, useCallback } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { BoardDesignerUIState, DEFAULT_VIEW_STATE } from './boardInteraction';
import { BoardToolbar } from './BoardToolbar';
import { BoardCanvas } from './BoardCanvas';
import { BoardLayerPanel } from './BoardLayerPanel';
import { BoardInspector } from './BoardInspector';
import { BoardNetPanel } from './BoardNetPanel';
import { BoardComponentBin } from './BoardComponentBin';
import { BoardDRCPanel } from './BoardDRCPanel';
import { BoardStatusBar } from './BoardStatusBar';
import { runBoardDRC } from '../../lib/boardDRC';
import {
  autoPlaceComponents as autoPlaceFn,
  roughAutorouteNet,
  inferPadNetAssignments,
} from './boardGeometry';
import { ReviewResult } from '../../types';
import { Network, AlertTriangle, Cpu } from 'lucide-react';

type RightTab = 'inspector' | 'nets' | 'drc';

export const BoardDesigner: React.FC = () => {
  const store = useProjectStore();
  const {
    boardOutlines, boardComponents, nets, traces,
    boards, pcbLayers,
    setActiveView, generateBlueprintPack, addTrace,
  } = store;

  const [viewState, setViewState] = useState<BoardDesignerUIState>({
    ...DEFAULT_VIEW_STATE,
    activeLayerId: (pcbLayers || [])[0]?.id || 'top-copper',
  });
  const [rightTab, setRightTab] = useState<RightTab>('inspector');
  const [drcResults, setDrcResults] = useState<ReviewResult[]>([]);

  const updateView = useCallback((patch: Partial<BoardDesignerUIState>) => {
    setViewState(prev => ({ ...prev, ...patch }));
  }, []);

  // ── Actions ──────────────────────────────────────────────
  const handleRunDRC = useCallback(() => {
    const project = useProjectStore.getState();
    const results = runBoardDRC(project);
    setDrcResults(results);
    setRightTab('drc');
  }, []);

  const handleAutoPlace = useCallback(() => {
    const outline = (boardOutlines || [])[0];
    const comps = boardComponents || [];
    const placed = autoPlaceFn(comps, outline);
    // Update each component
    for (const comp of placed) {
      store.updateBoardComponent(comp.id, {
        placementX: comp.placementX,
        placementY: comp.placementY,
        placementStatus: comp.placementStatus,
      });
    }
    // Also infer pad-net assignments
    const project = useProjectStore.getState();
    const assignments = inferPadNetAssignments(project);
    store.setPadNetAssignments(assignments);
    handleRunDRC();
  }, [boardOutlines, boardComponents, store, handleRunDRC]);

  const handleRoughAutoroute = useCallback(() => {
    const project = useProjectStore.getState();
    const allNets = nets || [];
    const primaryBoard = (boards || [])[0];
    const layerId = viewState.activeLayerId || 'top-copper';

    for (const net of allNets) {
      // Skip if already has traces
      const existing = (traces || []).filter(t => t.netName === net.netName);
      if (existing.length > 0) continue;

      const trace = roughAutorouteNet(project, net.netName, layerId, primaryBoard?.id || 'board-main');
      if (trace) {
        addTrace(trace);
      }
    }
    handleRunDRC();
  }, [nets, boards, traces, viewState.activeLayerId, addTrace, handleRunDRC]);

  const handleGenerateBlueprint = useCallback(() => {
    generateBlueprintPack();
    setActiveView('blueprint-sheets');
  }, [generateBlueprintPack, setActiveView]);

  const handleExportBoard = useCallback(() => {
    setActiveView('exports');
  }, [setActiveView]);

  const handleOpenFactory = useCallback(() => {
    setActiveView('factory-builder');
  }, [setActiveView]);

  const drcCount = drcResults.filter(r => r.severity === 'Error' || r.severity === 'Blocker').length;

  // Check if we have any board data
  const hasBoards = (boards || []).length > 0;

  if (!hasBoards) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="text-center space-y-3 max-w-md">
          <div className="text-4xl">🔧</div>
          <h2 className="text-lg font-bold text-slate-200">Board Designer</h2>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            No board data found. Generate a Full Product Plan from the Project Dashboard first to create boards, components, and nets.
          </p>
          <button
            onClick={() => setActiveView('dashboard')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-[11px] font-bold hover:bg-indigo-500 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 overflow-hidden">
      {/* Toolbar */}
      <BoardToolbar
        viewState={viewState}
        onViewStateChange={updateView}
        drcCount={drcCount}
        onAutoPlace={handleAutoPlace}
        onRoughAutoroute={handleRoughAutoroute}
        onRunDRC={handleRunDRC}
        onGenerateBlueprint={handleGenerateBlueprint}
        onExportBoard={handleExportBoard}
        onOpenFactory={handleOpenFactory}
      />

      {/* Main content area */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Layer panel */}
        <BoardLayerPanel viewState={viewState} onViewStateChange={updateView} />

        {/* Center: Canvas & bin & status */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 min-h-0 relative">
            <BoardCanvas
              viewState={viewState}
              onViewStateChange={updateView}
              drcResults={drcResults}
            />
          </div>

          {/* Bottom: Component bin */}
          <BoardComponentBin
            viewState={viewState}
            onViewStateChange={updateView}
            onAutoPlace={handleAutoPlace}
          />

          {/* Bottom-most Status Bar */}
          <BoardStatusBar viewState={viewState} />
        </div>

        {/* Right panel: tabbed */}
        <div className="w-56 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-800 shrink-0">
            {([
              { key: 'inspector' as const, label: 'Inspector', Icon: Cpu },
              { key: 'nets' as const, label: 'Nets', Icon: Network },
              { key: 'drc' as const, label: 'DRC', Icon: AlertTriangle },
            ]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setRightTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-all ${
                  rightTab === tab.key
                    ? 'bg-slate-800 text-indigo-300 border-b-2 border-indigo-500'
                    : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                <tab.Icon className="w-3 h-3" />
                {tab.label}
                {tab.key === 'drc' && drcCount > 0 && (
                  <span className="bg-red-600 text-white text-[7px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">{drcCount > 9 ? '9+' : drcCount}</span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {rightTab === 'inspector' && (
              <BoardInspector viewState={viewState} onViewStateChange={updateView} />
            )}
            {rightTab === 'nets' && (
              <BoardNetPanel viewState={viewState} onViewStateChange={updateView} />
            )}
            {rightTab === 'drc' && (
              <BoardDRCPanel results={drcResults} viewState={viewState} onViewStateChange={updateView} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
