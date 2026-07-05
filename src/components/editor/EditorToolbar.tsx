import React from 'react';
import { EditorMode } from '../../types';
import { EditorUIState } from './editorTypes';
import { 
  Play, 
  Grid, 
  Tag, 
  AlertOctagon, 
  RotateCcw, 
  Download, 
  BookOpen, 
  FileText, 
  Compass, 
  Layers, 
  Cpu, 
  Activity, 
  Hammer, 
  Network, 
  Sliders, 
  Package, 
  CheckSquare 
} from 'lucide-react';

interface EditorToolbarProps {
  uiState: EditorUIState;
  setUiState: React.Dispatch<React.SetStateAction<EditorUIState>>;
  onGenerateLayouts: () => void;
  onAutoArrange: () => void;
  onExportJSON: () => void;
  onOpenSheets: () => void;
  onOpenExports: () => void;
  onAutoAction: (actionKey: string) => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  uiState,
  setUiState,
  onGenerateLayouts,
  onAutoArrange,
  onExportJSON,
  onOpenSheets,
  onOpenExports,
  onAutoAction
}) => {
  const modesList: { id: EditorMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'product', label: '1. Architecture', icon: Compass },
    { id: 'mechanical', label: '2. Mechanical', icon: Layers },
    { id: 'assembly', label: '3. Exploded Assembly', icon: Hammer },
    { id: 'board', label: '4. Board Outline', icon: Layers },
    { id: 'components', label: '5. Component Placement', icon: Cpu },
    { id: 'circuits', label: '6. Schematic Prep', icon: Sliders },
    { id: 'nets', label: '7. Net Routing', icon: Network },
    { id: 'power', label: '8. Power Tree', icon: Sliders },
    { id: 'pins', label: '9. MCU Pin Map', icon: Cpu },
    { id: 'firmware', label: '10. Firmware Flow', icon: Activity },
    { id: 'testing', label: '11. Test Protocol', icon: CheckSquare },
    { id: 'handoff', label: '12. Mfg Handoff', icon: Package }
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-100 p-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 select-none">
      
      {/* Mode Selector Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin scrollbar-thumb-slate-850">
        {modesList.map((m) => {
          const Icon = m.icon;
          const isActive = uiState.activeMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setUiState(prev => ({ ...prev, activeMode: m.id, selectedObjectId: null }))}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-inner' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Editor Option Switches & Global triggers */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Toggle Switches */}
        <div className="flex items-center bg-slate-800 rounded p-0.5 border border-slate-700">
          <button
            onClick={() => setUiState(p => ({ ...p, showGrid: !p.showGrid }))}
            className={`p-1.5 rounded transition-all cursor-pointer ${uiState.showGrid ? 'bg-slate-700 text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
            title="Toggle Grid Lines"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setUiState(p => ({ ...p, snapToGrid: !p.snapToGrid }))}
            className={`p-1.5 rounded transition-all cursor-pointer ${uiState.snapToGrid ? 'bg-slate-700 text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
            title="Snap to Grid"
          >
            <Compass className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setUiState(p => ({ ...p, showLabels: !p.showLabels }))}
            className={`p-1.5 rounded transition-all cursor-pointer ${uiState.showLabels ? 'bg-slate-700 text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
            title="Toggle Labels"
          >
            <Tag className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setUiState(p => ({ ...p, showWarnings: !p.showWarnings }))}
            className={`p-1.5 rounded transition-all cursor-pointer ${uiState.showWarnings ? 'bg-slate-700 text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
            title="Show Layout Warnings"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* CAD Layout Operations */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onGenerateLayouts}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer"
            title="Auto-Generate Layout mapping from Project Database"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Generate Layouts</span>
          </button>

          <button
            onClick={onAutoArrange}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 active:bg-slate-700 text-slate-300 hover:text-white rounded text-[10px] font-extrabold uppercase tracking-wider transition-all border border-slate-700 cursor-pointer"
            title="Auto-arrange and reset positions for active mode"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Auto Arrange</span>
          </button>

          {/* Quick Autocomplete helpers dropdown */}
          <select 
            onChange={(e) => {
              if (e.target.value) {
                onAutoAction(e.target.value);
                e.target.value = ""; // Reset
              }
            }}
            className="bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-wider rounded p-1.5 cursor-pointer max-w-[120px]"
          >
            <option value="">⚙️ Auto Actions</option>
            {uiState.activeMode === 'components' && <option value="auto-components">Auto Place SMT</option>}
            {uiState.activeMode === 'nets' && <option value="auto-nets">Auto Nets from Pinout</option>}
            {uiState.activeMode === 'pins' && <option value="auto-pins">Auto Pinout from Circuit</option>}
            {uiState.activeMode === 'firmware' && <option value="auto-firmware">Auto Firmware tasks</option>}
            {uiState.activeMode === 'testing' && <option value="auto-testing">Auto QA test stages</option>}
            {uiState.activeMode === 'board' && <option value="fix-dimensions">Fix Missing Contours</option>}
            {uiState.activeMode === 'handoff' && (
              <>
                <option value="required-files">Create Fab Files List</option>
                <option value="auto-checklist">Create mfg checklist</option>
              </>
            )}
          </select>
        </div>

        {/* View / Export actions */}
        <div className="flex items-center space-x-1 border-l border-slate-800 pl-2">
          <button
            onClick={onExportJSON}
            className="p-1.5 bg-slate-800 hover:bg-slate-750 hover:text-white text-slate-400 rounded cursor-pointer"
            title="Download Editor Layout Data JSON"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenSheets}
            className="p-1.5 bg-slate-800 hover:bg-slate-750 hover:text-white text-slate-400 rounded cursor-pointer"
            title="Jump to Blueprint Sheets"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenExports}
            className="p-1.5 bg-slate-800 hover:bg-slate-750 hover:text-white text-slate-400 rounded cursor-pointer"
            title="Jump to Export Center"
          >
            <FileText className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
