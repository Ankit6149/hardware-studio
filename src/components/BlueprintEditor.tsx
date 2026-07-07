import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../store/projectStore';
import { EditorToolbar } from './editor/EditorToolbar';
import { EditorLayerPanel } from './editor/EditorLayerPanel';
import { EditorCanvas } from './editor/EditorCanvas';
import { EditorInspector } from './editor/EditorInspector';
import { defaultUIState } from './editor/editorTypes';
import { EditorMode } from '../types';

export const BlueprintEditor: React.FC = () => {
  const store = useProjectStore();
  const [uiState, setUiState] = useState(defaultUIState());
  const [copiedAlert, setCopiedAlert] = useState<string | null>(null);

  const { editorLayouts, generateEditorLayouts } = store;

  // Trigger initial layout generation if empty
  useEffect(() => {
    const layouts = editorLayouts || {};
    const hasData = Object.values(layouts).some(arr => arr && arr.length > 0);
    if (!hasData) {
      generateEditorLayouts();
    }
  }, [editorLayouts, generateEditorLayouts]);

  const activeLayoutObjects = (store.editorLayouts?.[uiState.activeMode] || []);
  const activeConnections = (store.editorConnections || []);

  // ----------------------------------------------------
  // COMPUTING LIVE DRC / ERC WARNINGS PER MODE
  // ----------------------------------------------------
  const computeLiveWarnings = (mode: EditorMode): string[] => {
    const list: string[] = [];
    const nodes = store.nodes || [];
    const boards = store.boards || [];
    const components = store.boardComponents || [];
    const circuitBlocks = store.circuitBlocks || [];
    const nets = store.nets || [];
    const pinMap = store.pinMap || [];
    const firmwareTasks = store.firmwareTasks || [];
    const testing = store.testing || [];
    const fFiles = store.factoryFiles || {};

    switch (mode) {
      case 'product':
        if (!nodes.some(n => n.data?.category?.toLowerCase() === 'input' || n.data?.name?.toLowerCase().includes('touch') || n.data?.name?.toLowerCase().includes('button'))) {
          list.push("DRC: Missing primary user interaction input node (e.g., touch pad or button).");
        }
        if (!nodes.some(n => n.data?.category?.toLowerCase() === 'power' || n.id.toLowerCase().includes('battery'))) {
          list.push("ERC: No power supply or charging source node mapped in architecture.");
        }
        if (!nodes.some(n => n.data?.category?.toLowerCase() === 'feedback' || n.data?.name?.toLowerCase().includes('haptic') || n.data?.name?.toLowerCase().includes('led'))) {
          list.push("DRC: Missing feedback output node (LED indicators or haptic alert).");
        }
        break;

      case 'mechanical':
        const isRing = store.projectName.toLowerCase().includes("ring") || store.templateName?.toLowerCase().includes("ring");
        if (isRing) {
          const mainBoard = boards[0];
          if (mainBoard && !mainBoard.substrate.toLowerCase().includes('flex')) {
            list.push("DFM: Wearable rings require polyimide flexible FPC boards to fit contours.");
          }
          if (!activeLayoutObjects.some(o => o.id.includes('seal'))) {
            list.push("Waterproof Gate: Wearable ring lacks potting epoxy or gasket seal layout zones.");
          }
        } else {
          if (boards.length === 0) {
            list.push("MCAD: No board outline footprint linked to mechanical enclosure bounds.");
          }
        }
        break;

      case 'board':
        boards.forEach(b => {
          if (!b.dimensionsMm || b.dimensionsMm.toLowerCase().includes('required') || b.dimensionsMm === '0 x 0') {
            list.push(`DRC: Board [${b.name}] lacks physical size (dimensionsMm required).`);
          }
          if (b.layerCount < 2) {
            list.push(`DRC: Multi-layer boards require at least 2 layers stack configuration.`);
          }
        });
        break;

      case 'components':
        if (components.length === 0) {
          list.push("BOM: SMT components list is empty. Seed project plan first.");
        }
        components.forEach(c => {
          if (!c.footprint || c.footprint.trim() === "") {
            list.push(`DRC: Footprint packages missing for reference designator [${c.referenceDesignator}].`);
          }
          if (c.side === 'Unknown') {
            list.push(`SMT: Unknown placement side for footprint [${c.referenceDesignator}].`);
          }
        });
        break;

      case 'circuits':
        if (circuitBlocks.length === 0) {
          list.push("Schematic: Circuits list is empty. Define modules prep first.");
        }
        circuitBlocks.forEach(cb => {
          if (!cb.powerNets || cb.powerNets.toLowerCase().includes('required')) {
            list.push(`ERC: Functional block [${cb.name}] lacks logical power rail nets.`);
          }
          if (!cb.signalNets || cb.signalNets.toLowerCase().includes('required')) {
            list.push(`ERC: Functional block [${cb.name}] lacks interface signal nets.`);
          }
        });
        break;

      case 'nets':
        if (nets.length === 0) {
          list.push("Netlist: Logical connection nets list is empty. Generate from pin map.");
        }
        const hasGnd = nets.some(n => n.netName.toUpperCase() === 'GND' || n.netType === 'Ground');
        if (!hasGnd) {
          list.push("ERC: Ground return net (GND) is missing. All signals must reference GND.");
        }
        break;

      case 'power':
        const capacity = store.batteryCapacityMah || 0;
        if (capacity <= 0) {
          list.push("Standby: Battery cell capacity not configured (set batteryCapacityMah).");
        }
        break;

      case 'pins':
        if (pinMap.length === 0) {
          list.push("Pin Map: Microcontroller physical pinout map is empty.");
        }
        const assignedPins = pinMap.map(p => p.mcuPin).filter(p => p && p !== 'TBD');
        const duplicates = assignedPins.filter((item, index) => assignedPins.indexOf(item) !== index);
        if (duplicates.length > 0) {
          list.push(`ERC Conflict: Duplicate MCU ports mapped on pins [${Array.from(new Set(duplicates)).join(', ')}].`);
        }
        break;

      case 'firmware':
        if (firmwareTasks.length === 0) {
          list.push("Firmware: Event loops tasks list is empty.");
        }
        firmwareTasks.forEach(ft => {
          if (ft.status === 'Blocked') {
            list.push(`Blocked: [${ft.name}] blocked by hardware bring-up tasks.`);
          }
        });
        break;

      case 'testing':
        if (testing.length === 0) {
          list.push("Validation: No verification test protocol stages configured.");
        }
        break;

      case 'handoff':
        const missingFiles: string[] = [];
        Object.entries(fFiles).forEach(([key, val]) => {
          if (val.status === 'Not Generated') {
            missingFiles.push(key.replace(/([A-Z])/g, ' $1'));
          }
        });
        if (missingFiles.length > 0) {
          list.push(`Handoff Block: Missing files: [${missingFiles.join(', ')}]. Upload to proceed.`);
        }
        break;
      
      default:
        break;
    }
    return list;
  };

  const activeWarnings = computeLiveWarnings(uiState.activeMode);

  // ----------------------------------------------------
  // ACTION TRIGGERS
  // ----------------------------------------------------
  const handleGenerateLayouts = () => {
    store.generateEditorLayouts();
    setCopiedAlert("Editor Layouts generated dynamically from project database records.");
    setTimeout(() => setCopiedAlert(null), 3000);
  };

  const handleAutoArrange = () => {
    store.resetEditorLayout(uiState.activeMode);
    setCopiedAlert(`Auto-arranged elements for [${uiState.activeMode}] drawing mode.`);
    setTimeout(() => setCopiedAlert(null), 3000);
  };

  const handleExportJSON = () => {
    const data = {
      projectName: store.projectName,
      editorLayouts: store.editorLayouts || {},
      editorConnections: store.editorConnections || [],
      factoryFiles: store.factoryFiles || {},
      generatedAt: new Date().toISOString()
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${store.projectName.toLowerCase().replace(/\s+/g, '_')}_editor_layout.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleAutoAction = (actionKey: string) => {
    if (actionKey === 'auto-components') {
      store.autoPlaceComponents();
      setCopiedAlert("SMT components auto-placed based on schematic keepouts.");
    } else if (actionKey === 'auto-nets') {
      store.autoCreateNetsFromPinMap();
      setCopiedAlert("Logical nets auto-generated from microcontroller pin map.");
    } else if (actionKey === 'auto-pins') {
      store.autoCreatePinMapFromCircuits();
      setCopiedAlert("Microcontroller port pin map populated from circuits signal nets.");
    } else if (actionKey === 'auto-firmware') {
      store.autoCreateFirmwareTasksFromHardware();
      setCopiedAlert("Firmware driver state machines created from hardware peripherals.");
    } else if (actionKey === 'auto-testing') {
      store.autoCreateTestsFromHardware();
      setCopiedAlert("EVT/DVT QA validation checklist created from boards list.");
    } else if (actionKey === 'fix-dimensions') {
      store.fixMissingDimensionsWithPlaceholder();
      setCopiedAlert("Substrate outlines missing dimensions resolved with placeholders.");
    } else if (actionKey === 'required-files') {
      store.addRequiredFactoryFileChecklist();
      setCopiedAlert("Required factory files checklist created in handoff database.");
    } else if (actionKey === 'auto-checklist') {
      store.autoCreateHandoffChecklist();
      setCopiedAlert("Manufacturing checklist generated.");
    }
    setTimeout(() => setCopiedAlert(null), 3000);
  };

  const handleUpdateObjectPosition = (id: string, x: number, y: number) => {
    store.updateEditorObjectPosition(uiState.activeMode, id, x, y);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none">
      
      {/* Toast feedback alerts */}
      {copiedAlert && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-600 border border-emerald-500 text-white text-[10px] uppercase font-black tracking-widest px-4 py-2 rounded shadow-2xl transition-all animate-bounce">
          {copiedAlert}
        </div>
      )}

      {/* Top Controls Toolbar */}
      <EditorToolbar
        uiState={uiState}
        setUiState={setUiState}
        onGenerateLayouts={handleGenerateLayouts}
        onAutoArrange={handleAutoArrange}
        onExportJSON={handleExportJSON}
        onOpenSheets={() => store.setActiveView('blueprint-sheets')}
        onOpenExports={() => store.setActiveView('exports')}
        onAutoAction={handleAutoAction}
      />

      {/* Editor Body Area */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        
        {/* Left layers / object outline list */}
        <EditorLayerPanel
          uiState={uiState}
          setUiState={setUiState}
          objects={activeLayoutObjects}
          warnings={activeWarnings}
        />

        {/* Center CAD visual drawing grid canvas */}
        <EditorCanvas
          uiState={uiState}
          setUiState={setUiState}
          objects={activeLayoutObjects}
          connections={activeConnections}
          onUpdatePosition={handleUpdateObjectPosition}
          project={store}
          onGenerateLayouts={handleGenerateLayouts}
        />

        {/* Right attributes inspector panel */}
        <EditorInspector
          selectedObjectId={uiState.selectedObjectId}
          objects={activeLayoutObjects}
          project={store}
          onDeleteObject={(id) => store.deleteEditorObject(uiState.activeMode, id)}
          onDuplicateObject={(id) => store.duplicateEditorObject(uiState.activeMode, id)}
        />

      </div>
    </div>
  );
};
