import React from 'react';
import { EditorObject } from '../../types';
import { EditorUIState } from './editorTypes';
import { Eye, EyeOff, AlertTriangle, List, Layers, ShieldAlert } from 'lucide-react';

interface EditorLayerPanelProps {
  uiState: EditorUIState;
  setUiState: React.Dispatch<React.SetStateAction<EditorUIState>>;
  objects: EditorObject[];
  warnings: string[];
}

export const EditorLayerPanel: React.FC<EditorLayerPanelProps> = ({
  uiState,
  setUiState,
  objects,
  warnings
}) => {
  const toggleLayer = (layerName: string) => {
    setUiState(prev => ({
      ...prev,
      visibleLayers: {
        ...prev.visibleLayers,
        [layerName]: !prev.visibleLayers[layerName]
      }
    }));
  };

  // Find unique layers present in current objects list
  const uniqueLayers = Array.from(new Set(objects.map(obj => obj.layer).filter(Boolean))) as string[];

  return (
    <div className="w-64 bg-white border-r border-slate-200 text-slate-700 flex flex-col h-full select-none text-[11px] font-sans shadow-sm">
      
      {/* 1. LAYERS PANEL */}
      <div className="border-b border-slate-200 p-3 shrink-0 bg-slate-50/40">
        <div className="flex items-center space-x-1.5 text-slate-850 font-bold uppercase tracking-wider mb-2.5">
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          <span>Engineering Layers</span>
        </div>
        <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1 scrollbar-thin">
          {uniqueLayers.length === 0 ? (
            <div className="text-[10px] text-slate-400 italic">No layers in this mode.</div>
          ) : (
            uniqueLayers.map(lyr => {
              const isVisible = uiState.visibleLayers[lyr] !== false;
              return (
                <button
                  key={lyr}
                  onClick={() => toggleLayer(lyr)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded bg-slate-50 hover:bg-slate-100 text-left transition-colors border border-slate-200/60 cursor-pointer"
                >
                  <span className="text-[10px] truncate max-w-[170px] font-medium text-slate-750">{lyr}</span>
                  {isVisible ? (
                    <Eye className="w-3 h-3 text-emerald-650" />
                  ) : (
                    <EyeOff className="w-3 h-3 text-slate-400" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 2. OBJECTS LIST */}
      <div className="flex-1 overflow-y-auto p-3 border-b border-slate-200 min-h-0 flex flex-col scrollbar-thin">
        <div className="flex items-center space-x-1.5 text-slate-850 font-bold uppercase tracking-wider mb-2.5 shrink-0">
          <List className="w-3.5 h-3.5 text-indigo-600" />
          <span>Active Outlines ({objects.length})</span>
        </div>
        <div className="space-y-1 flex-1 overflow-y-auto pr-1">
          {objects.length === 0 ? (
            <div className="text-[10px] text-slate-400 italic p-4 text-center border border-dashed border-slate-200 rounded">
              Canvas empty. Click &quot;Generate Layouts&quot; to auto-populate from store.
            </div>
          ) : (
            objects.map(obj => {
              const isSelected = uiState.selectedObjectId === obj.id;
              return (
                <button
                  key={obj.id}
                  onClick={() => setUiState(prev => ({ ...prev, selectedObjectId: obj.id }))}
                  className={`w-full text-left px-2 py-1.5 rounded transition-all truncate block cursor-pointer text-[10px] border ${
                    isSelected 
                      ? 'bg-slate-900 text-white font-bold border-slate-950 shadow-sm' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-950 border-slate-200/65'
                  }`}
                >
                  <span className="font-mono text-[8px] bg-slate-200 px-1 py-0.2 rounded mr-1 text-slate-550 font-normal uppercase">
                    {obj.sourceType.substring(0, 4)}
                  </span>
                  <span>{obj.label}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 3. WARNINGS / VALIDATION CHECKS */}
      <div className="h-[180px] bg-slate-50 p-3 shrink-0 flex flex-col border-t border-slate-200">
        <div className="flex items-center space-x-1.5 text-slate-800 font-bold uppercase tracking-wider mb-2 shrink-0">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
          <span className="text-rose-800 font-extrabold text-[10.5px]">Live DRC / ERC Rules</span>
        </div>
        <div className="flex-grow overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
          {warnings.length === 0 ? (
            <div className="flex items-center space-x-2 text-[10px] text-emerald-800 bg-emerald-50 p-2 border border-emerald-250 rounded">
              <span className="text-sm">✓</span>
              <span>All mode constraints satisfy factory rules.</span>
            </div>
          ) : (
            warnings.map((warn, i) => (
              <div key={i} className="flex items-start space-x-1.5 text-[9px] leading-relaxed text-rose-800 bg-rose-50 p-2 border border-rose-250 rounded">
                <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0 mt-0.5" />
                <span>{warn}</span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
