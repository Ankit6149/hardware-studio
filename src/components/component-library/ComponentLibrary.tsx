// ComponentLibrary.tsx — Phase 3 Real Component Library UI
import React, { useState, useMemo } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { defaultComponents, ElectronicComponentDefinition, ComponentPinDefinition } from '../../lib/components/componentLibrary';
import { getFootprint } from '../../lib/footprints';
import { Cpu, Search, Plus, Copy, X, Check, Save } from 'lucide-react';

export const ComponentLibrary: React.FC = () => {
  const { boardComponents, boards, circuitBlocks, addBoardComponent, addBOMItem } = useProjectStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Custom component list saved locally in session
  const [customComponents, setCustomComponents] = useState<ElectronicComponentDefinition[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<ElectronicComponentDefinition | null>(defaultComponents[0]);
  
  // Forms & Dialogs
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [isAddingToProject, setIsAddingToProject] = useState(false);

  // Custom component draft state
  const [customDraft, setCustomDraft] = useState<Partial<ElectronicComponentDefinition>>({
    libraryId: '',
    name: '',
    category: 'MCU',
    description: '',
    manufacturer: '',
    partNumber: '',
    value: '',
    packageName: 'SOIC_8',
    footprintName: 'SOIC_8',
    symbolName: 'MCU',
    electrical: {},
    pins: [],
    tags: [],
    defaultQuantity: 1
  });

  const categories = [
    'All', 'MCU', 'Processor', 'Power', 'Regulator', 'Charger', 'Protection', 
    'Resistor', 'Capacitor', 'Inductor', 'Diode', 'LED', 'Transistor', 'MOSFET', 
    'Sensor', 'RF', 'Antenna', 'Connector', 'Button', 'Touch', 'Motor', 
    'Haptic', 'Memory', 'Debug', 'Test Point', 'Battery', 'Custom'
  ];

  // Combined library list
  const fullLibrary = useMemo(() => {
    return [...customComponents, ...defaultComponents];
  }, [customComponents]);

  const filteredComponents = useMemo(() => {
    let list = fullLibrary;
    if (selectedCategory !== 'All') {
      list = list.filter(c => c.category === selectedCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.packageName.toLowerCase().includes(q) ||
          (c.partNumber && c.partNumber.toLowerCase().includes(q))
      );
    }
    return list;
  }, [fullLibrary, selectedCategory, searchQuery]);

  // Project instance state
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [selectedCircuitBlockId, setSelectedCircuitBlockId] = useState<string>('');

  const handleSelectComponent = (comp: ElectronicComponentDefinition) => {
    setSelectedComponent(comp);
    // Initialize targets
    if (boards && boards.length > 0) setSelectedBoardId(boards[0].id);
    if (circuitBlocks && circuitBlocks.length > 0) setSelectedCircuitBlockId(circuitBlocks[0].id);
  };

  const handleDuplicate = (comp: ElectronicComponentDefinition) => {
    const copy: ElectronicComponentDefinition = {
      ...comp,
      libraryId: `${comp.libraryId}-copy-${Date.now()}`,
      name: `${comp.name} Copy`,
      tags: [...comp.tags, 'duplicated']
    };
    setCustomComponents([copy, ...customComponents]);
    setSelectedComponent(copy);
  };

  const handleAddPinRow = () => {
    const newNum = String((customDraft.pins?.length || 0) + 1);
    const newPin: ComponentPinDefinition = {
      number: newNum,
      name: `PIN${newNum}`,
      electricalType: 'Passive',
      required: false
    };
    setCustomDraft(prev => ({
      ...prev,
      pins: [...(prev.pins || []), newPin]
    }));
  };

  const handleUpdatePin = (idx: number, patch: Partial<ComponentPinDefinition>) => {
    setCustomDraft(prev => {
      const newPins = [...(prev.pins || [])];
      newPins[idx] = { ...newPins[idx], ...patch };
      return { ...prev, pins: newPins };
    });
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDraft.name || !customDraft.libraryId) return;

    const completedComponent: ElectronicComponentDefinition = {
      libraryId: customDraft.libraryId || `custom-${Date.now()}`,
      name: customDraft.name || 'Unnamed',
      category: customDraft.category || 'Custom',
      description: customDraft.description || '',
      manufacturer: customDraft.manufacturer || 'Custom',
      partNumber: customDraft.partNumber || `CUST-${Date.now()}`,
      value: customDraft.value || '',
      packageName: customDraft.packageName || 'Custom',
      footprintName: customDraft.footprintName || 'SOIC_8',
      symbolName: customDraft.symbolName || 'MCU',
      electrical: customDraft.electrical || {},
      pins: customDraft.pins || [],
      tags: customDraft.tags || ['custom'],
      defaultQuantity: customDraft.defaultQuantity || 1
    };

    if (isEditingCustom) {
      setCustomComponents(prev => prev.map(c => c.libraryId === completedComponent.libraryId ? completedComponent : c));
      setIsEditingCustom(false);
    } else {
      setCustomComponents([completedComponent, ...customComponents]);
      setIsCreatingCustom(false);
    }
    setSelectedComponent(completedComponent);
  };

  const triggerAddToProject = () => {
    if (!selectedComponent) return;
    if (boards && boards.length > 0 && !selectedBoardId) {
      setSelectedBoardId(boards[0].id);
    }
    if (circuitBlocks && circuitBlocks.length > 0 && !selectedCircuitBlockId) {
      setSelectedCircuitBlockId(circuitBlocks[0].id);
    }
    setIsAddingToProject(true);
  };

  const confirmAddToProject = () => {
    if (!selectedComponent) return;

    // Generate unique reference designator
    const existingRefDes = (boardComponents || []).map(bc => bc.referenceDesignator);
    let prefix = 'U';
    const cat = selectedComponent.category.toUpperCase();
    if (cat === 'RESISTOR') prefix = 'R';
    else if (cat === 'CAPACITOR') prefix = 'C';
    else if (cat === 'INDUCTOR') prefix = 'L';
    else if (cat === 'DIODE') prefix = 'D';
    else if (cat === 'LED') prefix = 'LED';
    else if (cat === 'CONNECTOR') prefix = 'J';
    else if (cat === 'TRANSISTOR' || cat === 'MOSFET') prefix = 'Q';
    else if (cat === 'BUTTON' || cat === 'SWITCH') prefix = 'SW';
    else if (cat === 'TEST POINT') prefix = 'TP';
    else if (cat === 'ANTENNA' || cat === 'RF') prefix = 'ANT';
    else if (cat === 'BATTERY') prefix = 'BT';

    let num = 1;
    while (existingRefDes.includes(`${prefix}${num}`)) {
      num++;
    }
    const finalRefDes = `${prefix}${num}`;
    const compId = `comp_${Date.now()}`;

    // Add to project components
    addBoardComponent({
      id: compId,
      boardId: selectedBoardId || 'board_0',
      circuitBlockId: selectedCircuitBlockId || 'block_0',
      referenceDesignator: finalRefDes,
      componentName: selectedComponent.name,
      componentType: selectedComponent.category,
      value: selectedComponent.value || '',
      packageName: selectedComponent.packageName,
      footprint: selectedComponent.footprintName,
      partNumber: selectedComponent.partNumber || '',
      quantity: 1,
      side: 'Top',
      placementCriticality: 'Medium',
      notes: selectedComponent.description,
      placementStatus: 'Unplaced',
      
      // Include expanded properties for Phase 4
      libraryId: selectedComponent.libraryId,
      manufacturer: selectedComponent.manufacturer,
      status: 'Draft',
      pins: selectedComponent.pins.map(p => ({
        id: `pin_${compId}_${p.number}`,
        componentId: compId,
        pinNumber: p.number,
        pinName: p.name,
        electricalType: p.electricalType,
        netName: p.defaultNetName || ''
      })),
      schematic: { placed: false },
      pcb: {
        placed: false,
        side: 'Top',
        locked: false,
        placementStatus: 'Unplaced'
      }
    });

    // Add to BOM
    addBOMItem({
      blockName: selectedCircuitBlockId ? (circuitBlocks || []).find(b => b.id === selectedCircuitBlockId)?.name || 'Main' : 'Main',
      candidateComponent: selectedComponent.name,
      partNumber: selectedComponent.partNumber,
      stage: 'EVT',
      quantity: 1,
      voltage: selectedComponent.electrical.typicalVoltage ? `${selectedComponent.electrical.typicalVoltage}V` : '',
      currentEstimate: selectedComponent.electrical.currentTypicalMa ? `${selectedComponent.electrical.currentTypicalMa}mA` : '',
      packageSize: selectedComponent.packageName,
      status: 'Sourced',
      notes: selectedComponent.description
    });

    setIsAddingToProject(false);
    alert(`Added ${finalRefDes} (${selectedComponent.name}) to the project successfully! It has been registered in the BOM, schematic bin, and PCB component bin.`);
  };

  // Render footprint preview
  const footprintPreview = useMemo(() => {
    if (!selectedComponent) return null;
    const fp = getFootprint(selectedComponent.footprintName);
    if (!fp || !fp.pads) return <div className="text-slate-600 text-[9px]">Generic footprint placeholder</div>;
    
    // Find bounds
    const bodyW = fp.bodyWidthMm || 5;
    const bodyH = fp.bodyHeightMm || 5;
    const padding = 2;
    const svgW = 120;
    const svgH = 120;
    const scale = 120 / (Math.max(bodyW, bodyH) + padding * 2);
    const cx = svgW / 2;
    const cy = svgH / 2;

    return (
      <svg width={svgW} height={svgH} className="border border-slate-800 rounded bg-slate-950/80">
        {/* Silkscreen outline */}
        <rect
          x={cx - (bodyW * scale) / 2}
          y={cy - (bodyH * scale) / 2}
          width={bodyW * scale}
          height={bodyH * scale}
          fill="none"
          stroke="#eab308"
          strokeWidth={1}
          opacity={0.7}
        />
        {/* Courtyard outline */}
        <rect
          x={cx - ((bodyW + 1) * scale) / 2}
          y={cy - ((bodyH + 1) * scale) / 2}
          width={(bodyW + 1) * scale}
          height={(bodyH + 1) * scale}
          fill="none"
          stroke="#94a3b8"
          strokeWidth={0.5}
          strokeDasharray="2,2"
          opacity={0.5}
        />
        {/* Pin 1 dot */}
        <circle
          cx={cx - (bodyW * scale) / 2 - 4}
          cy={cy - (bodyH * scale) / 2 + 4}
          r={2}
          fill="#eab308"
        />
        {/* Pads */}
        {fp.pads.map((pad, idx) => {
          const px = cx + pad.xMm * scale;
          const py = cy + pad.yMm * scale;
          const pw = (pad.widthMm || 0.6) * scale;
          const ph = (pad.heightMm || 1.2) * scale;
          
          return (
            <g key={idx}>
              <rect
                x={px - pw / 2}
                y={py - ph / 2}
                width={pw}
                height={ph}
                fill="#94a3b8"
                stroke="#cbd5e1"
                strokeWidth={0.5}
                rx={0.5}
              />
              <text
                x={px}
                y={py + 2}
                fill="#030712"
                fontSize={5}
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {pad.name}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }, [selectedComponent]);

  return (
    <div className="flex h-full w-full bg-slate-900 text-slate-100 font-sans overflow-hidden">
      {/* Search & Left Side Component List */}
      <div className="w-1/2 border-r border-slate-800 flex flex-col h-full bg-slate-900/60 backdrop-blur">
        {/* Header */}
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-emerald-450" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Selectable Component Library</span>
          </div>
          <button
            onClick={() => {
              setCustomDraft({
                libraryId: `custom-ic-${Date.now()}`,
                name: 'Custom Sensor Module',
                category: 'Sensor',
                description: 'Custom I2C connected sensor node',
                packageName: 'LGA_12',
                footprintName: 'LGA_12',
                symbolName: 'MCU',
                electrical: { typicalVoltage: 3.3 },
                pins: [
                  { number: '1', name: 'VDD', electricalType: 'Power Input', required: true },
                  { number: '2', name: 'GND', electricalType: 'Ground', required: true },
                  { number: '3', name: 'SDA', electricalType: 'Bidirectional', required: true },
                  { number: '4', name: 'SCL', electricalType: 'Clock', required: true }
                ],
                tags: ['custom', 'i2c'],
                defaultQuantity: 1
              });
              setIsCreatingCustom(true);
              setIsEditingCustom(false);
            }}
            className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded text-[10px] flex items-center gap-1 transition-all"
          >
            <Plus className="w-3 h-3" />
            <span>Create Custom</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="p-2.5 bg-slate-900/40 space-y-2 border-b border-slate-800">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-slate-500" />
            <input
              type="text"
              placeholder="Search library components by keyword, tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded pl-7 pr-2 py-1 text-[10px] font-medium text-slate-350 focus:border-emerald-500 focus:outline-none placeholder-slate-650"
            />
          </div>
          
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-[9px]">
            <span className="text-slate-500 font-semibold py-0.5 shrink-0 self-center">Category:</span>
            {categories.slice(0, 8).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded-full shrink-0 font-medium transition-all ${
                  selectedCategory === cat ? 'bg-slate-700 text-emerald-400 font-semibold' : 'bg-slate-950 hover:bg-slate-800 text-slate-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
          {filteredComponents.length > 0 ? (
            filteredComponents.map((c) => (
              <div
                key={c.libraryId}
                onClick={() => handleSelectComponent(c)}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                  selectedComponent?.libraryId === c.libraryId
                    ? 'border-emerald-500 bg-slate-950/80 shadow-[0_2px_8px_rgba(16,185,129,0.1)]'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-200">{c.name}</span>
                      <span className="text-[8px] bg-slate-800 text-slate-450 px-1 py-0.2 rounded font-mono font-bold uppercase tracking-wider">{c.category}</span>
                    </div>
                    <p className="text-[9.5px] text-slate-450 mt-1 line-clamp-2 leading-relaxed">{c.description}</p>
                    {c.partNumber && (
                      <span className="text-[8px] font-mono text-emerald-550/70 mt-1 block">MPN: {c.partNumber}</span>
                    )}
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 font-semibold bg-slate-900 px-1.5 py-0.5 rounded">{c.packageName}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-slate-600 text-[10.5px] py-12">No library components match filter.</div>
          )}
        </div>
      </div>

      {/* Right Side Detail Pane */}
      <div className="w-1/2 flex flex-col h-full bg-slate-950/40">
        {selectedComponent ? (
          <div className="flex-1 flex flex-col h-full overflow-y-auto">
            {/* Header */}
            <div className="p-3 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[8px] font-extrabold text-emerald-500 uppercase tracking-widest block">{selectedComponent.category} Definition</span>
                <h3 className="text-xs font-extrabold text-slate-200">{selectedComponent.name}</h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDuplicate(selectedComponent)}
                  title="Duplicate component"
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={triggerAddToProject}
                  className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded text-[10px] flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Project</span>
                </button>
              </div>
            </div>

            {/* Content segments */}
            <div className="p-3 space-y-4 text-[10px]">
              {/* Properties list */}
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 space-y-2">
                <div className="grid grid-cols-2 gap-2 font-medium">
                  <div>
                    <span className="text-slate-500 block text-[9px] font-semibold">Manufacturer</span>
                    <span className="text-slate-350">{selectedComponent.manufacturer || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] font-semibold">Part Number</span>
                    <span className="text-slate-350 font-mono">{selectedComponent.partNumber || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] font-semibold">Package Size</span>
                    <span className="text-slate-350">{selectedComponent.packageName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] font-semibold">Typical Voltage</span>
                    <span className="text-slate-350">{selectedComponent.electrical.typicalVoltage ? `${selectedComponent.electrical.typicalVoltage}V` : '—'}</span>
                  </div>
                </div>
              </div>

              {/* Symbol and Footprint Side-by-Side previews */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Schematic Symbol</span>
                  <div className="border border-slate-850 rounded bg-slate-950 p-2 text-center h-[120px] flex flex-col justify-center items-center">
                    <div className="border border-slate-700 w-12 h-16 bg-slate-900/40 relative rounded flex flex-col items-center justify-center">
                      <span className="text-[7px] text-slate-500 absolute top-1 font-bold">{selectedComponent.symbolName}</span>
                      <Cpu className="w-5 h-5 text-slate-450" />
                      {/* Fake pin notches left & right */}
                      <div className="absolute left-[-4px] top-4 flex flex-col gap-1.5">
                        <div className="w-1 h-0.5 bg-slate-500"></div>
                        <div className="w-1 h-0.5 bg-slate-500"></div>
                        <div className="w-1 h-0.5 bg-slate-500"></div>
                      </div>
                      <div className="absolute right-[-4px] top-4 flex flex-col gap-1.5">
                        <div className="w-1 h-0.5 bg-slate-500"></div>
                        <div className="w-1 h-0.5 bg-slate-500"></div>
                        <div className="w-1 h-0.5 bg-slate-500"></div>
                      </div>
                    </div>
                    <span className="text-[8px] text-slate-500 font-mono mt-1 block">{selectedComponent.pins.length} Terminals</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">PCB Footprint</span>
                  {footprintPreview}
                </div>
              </div>

              {/* Pins Table */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Pin / Terminal Assignments</span>
                <div className="border border-slate-850 rounded overflow-hidden">
                  <table className="w-full text-left font-mono text-[9px] border-collapse bg-slate-950/20">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                        <th className="p-1.5">No.</th>
                        <th className="p-1.5">Name</th>
                        <th className="p-1.5">Type</th>
                        <th className="p-1.5">Default Net</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {selectedComponent.pins.map(p => (
                        <tr key={p.number} className="hover:bg-slate-900/30">
                          <td className="p-1.5 font-bold text-emerald-400">{p.number}</td>
                          <td className="p-1.5 text-slate-200">{p.name}</td>
                          <td className="p-1.5 text-slate-450">{p.electricalType}</td>
                          <td className="p-1.5 text-slate-500">{p.defaultNetName || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-slate-600 text-[10px]">
            <span>Select a component to view properties.</span>
          </div>
        )}
      </div>

      {/* Dialog: Add to Project Target Setup */}
      {isAddingToProject && selectedComponent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-sm w-full p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-200">Configure Component Instance</span>
              <button onClick={() => setIsAddingToProject(false)} className="text-slate-500 hover:text-slate-250"><X className="w-4 h-4" /></button>
            </div>
            <div className="text-[10px] text-slate-450 space-y-2">
              <p>Adding <strong>{selectedComponent.name}</strong> to active project.</p>
              
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 font-semibold">Select Board</span>
                <select
                  value={selectedBoardId}
                  onChange={(e) => setSelectedBoardId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-[10px]"
                >
                  {(boards || []).map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                  <option value="board_0">Default Board</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-slate-500 font-semibold">Select Circuit Block</span>
                <select
                  value={selectedCircuitBlockId}
                  onChange={(e) => setSelectedCircuitBlockId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-[10px]"
                >
                  {(circuitBlocks || []).map(cb => (
                    <option key={cb.id} value={cb.id}>{cb.name}</option>
                  ))}
                  <option value="block_0">Default Circuit Block</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAddingToProject(false)}
                className="px-2.5 py-1 bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold rounded text-[10px]"
              >
                Cancel
              </button>
              <button
                onClick={confirmAddToProject}
                className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded text-[10px] flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                <span>Confirm</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog: Create Custom Component */}
      {isCreatingCustom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <form onSubmit={handleSaveCustom} className="bg-slate-900 border border-slate-800 rounded-lg max-w-lg w-full p-4 space-y-3 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-200">Create Custom Component definition</span>
              <button type="button" onClick={() => setIsCreatingCustom(false)} className="text-slate-500 hover:text-slate-250"><X className="w-4 h-4" /></button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[10px]">
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 font-semibold">Library ID (unique)</span>
                <input
                  required
                  value={customDraft.libraryId}
                  onChange={(e) => setCustomDraft({ ...customDraft, libraryId: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 font-semibold">Part Name</span>
                <input
                  required
                  value={customDraft.name}
                  onChange={(e) => setCustomDraft({ ...customDraft, name: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 font-semibold">Category</span>
                <select
                  value={customDraft.category}
                  onChange={(e) => setCustomDraft({ ...customDraft, category: e.target.value as ElectronicComponentDefinition['category'] })}
                  className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
                >
                  {categories.filter(x => x !== 'All').map(x => (
                    <option key={x} value={x}>{x}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 font-semibold">Footprint / Package</span>
                <select
                  value={customDraft.packageName}
                  onChange={(e) => setCustomDraft({ ...customDraft, packageName: e.target.value, footprintName: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
                >
                  {packages.filter(x => x !== 'All').map(x => (
                    <option key={x} value={x}>{x}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <span className="text-slate-500 font-semibold">Description</span>
                <textarea
                  value={customDraft.description}
                  onChange={(e) => setCustomDraft({ ...customDraft, description: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 resize-none h-12"
                />
              </div>
            </div>

            {/* Custom pin definition builder */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Define Pins</span>
                <button
                  type="button"
                  onClick={handleAddPinRow}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-350 text-[9px] font-bold rounded"
                >
                  + Add Pin
                </button>
              </div>
              <div className="max-h-[150px] overflow-y-auto border border-slate-800 rounded p-1 space-y-1.5">
                {(customDraft.pins || []).map((p, idx) => (
                  <div key={idx} className="flex gap-2 items-center text-[9px]">
                    <span className="font-bold text-slate-500 w-4">{idx + 1}</span>
                    <input
                      placeholder="Num"
                      value={p.number}
                      onChange={(e) => handleUpdatePin(idx, { number: e.target.value })}
                      className="bg-slate-950 border border-slate-800 rounded px-1 py-0.5 text-slate-200 w-10 text-center"
                    />
                    <input
                      placeholder="Pin Name"
                      value={p.name}
                      onChange={(e) => handleUpdatePin(idx, { name: e.target.value })}
                      className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-200 flex-1"
                    />
                    <select
                      value={p.electricalType}
                      onChange={(e) => handleUpdatePin(idx, { electricalType: e.target.value as ComponentPinDefinition['electricalType'] })}
                      className="bg-slate-950 border border-slate-800 rounded px-1 py-0.5 text-slate-200 text-[9px]"
                    >
                      <option value="Passive">Passive</option>
                      <option value="Input">Input</option>
                      <option value="Output">Output</option>
                      <option value="Bidirectional">Bidi</option>
                      <option value="Power Input">Pwr In</option>
                      <option value="Power Output">Pwr Out</option>
                      <option value="Ground">GND</option>
                      <option value="Analog">Analog</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setCustomDraft({ ...customDraft, pins: (customDraft.pins || []).filter((_, i) => i !== idx) })}
                      className="text-red-500 hover:text-red-400 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {(customDraft.pins || []).length === 0 && (
                  <div className="text-center text-slate-600 py-6 text-[9.5px]">No pins defined yet. Click &apos;+ Add Pin&apos; above.</div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreatingCustom(false)}
                className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-350 font-bold rounded text-[10px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded text-[10px] flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Component</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
