import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { blockLibrary, BlockLibraryItem } from '../data/blockLibrary';
import { 
  Eye, 
  Palette, 
  Layout, 
  Cpu, 
  Binary, 
  Zap, 
  Table, 
  CheckSquare, 
  Download,
  Plus,
  ChevronDown,
  ChevronRight,
  FileCheck2,
  FileText,
  Layers,
  Boxes,
  Network,
  Ruler,
  Package,
  LayoutDashboard,
  ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  onAddBlock?: (item: BlockLibraryItem) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onAddBlock }) => {
  const { activeView, setActiveView, addNode } = useProjectStore();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    Interaction: true,
    Electronics: true
  });

  const sidebarGroups = [
    {
      title: "Overview",
      items: [
        { id: 'dashboard', label: 'Project Dashboard', icon: LayoutDashboard },
        { id: 'product-studio', label: 'Product Studio', icon: Cpu },
        { id: 'readiness', label: 'Release Readiness', icon: FileCheck2 },
      ]
    },
    {
      title: "Product",
      items: [
        { id: 'requirements', label: 'Requirements', icon: CheckSquare },
        { id: 'product-architecture', label: 'Product Architecture', icon: Cpu },
        { id: 'risks-interfaces', label: 'Risks & Interfaces', icon: ShieldAlert },
      ]
    },
    {
      title: "Mechanical",
      items: [
        { id: 'mechanical-studio', label: 'Mechanical Studio', icon: Palette },
        { id: 'assembly-stack', label: 'Assembly Stack', icon: Layers },
      ]
    },
    {
      title: "Electronics",
      items: [
        { id: 'component-library', label: 'Component Library', icon: Boxes },
        { id: 'schematic-editor', label: 'Schematic Editor', icon: Cpu },
        { id: 'power-tree', label: 'Power Tree', icon: Zap },
        { id: 'pin-map', label: 'Pin Map', icon: Cpu },
        { id: 'bom', label: 'BOM', icon: Table },
      ]
    },
    {
      title: "PCB",
      items: [
        { id: 'board-designer', label: 'Board Designer', icon: Cpu },
        { id: 'board-settings', label: 'Board Settings', icon: Layers },
        { id: 'pcb-constraints', label: 'PCB Rules', icon: Ruler },
        { id: 'pcb-drc', label: 'DRC', icon: ShieldAlert },
      ]
    },
    {
      title: "Firmware",
      items: [
        { id: 'firmware-studio', label: 'Firmware Studio', icon: Binary },
        { id: 'state-machines', label: 'State Machines', icon: Cpu },
        { id: 'hardware-mapping', label: 'Hardware Mapping', icon: Cpu },
        { id: 'source-skeleton', label: 'Source Skeleton', icon: FileText },
      ]
    },
    {
      title: "Validation",
      items: [
        { id: 'validation-studio', label: 'Validation Studio', icon: CheckSquare },
        { id: 'requirement-coverage', label: 'Requirement Coverage', icon: FileCheck2 },
        { id: 'factory-qa', label: 'Factory QA', icon: CheckSquare },
      ]
    },
    {
      title: "Outputs",
      items: [
        { id: 'blueprint-sheets', label: 'Blueprint Studio', icon: FileText },
        { id: 'exports', label: 'Export Center', icon: Download },
        { id: 'factory-builder', label: 'Factory Package Builder', icon: Package }
      ]
    }
  ];

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  const handleAddBlock = (item: BlockLibraryItem) => {
    if (onAddBlock) {
      onAddBlock(item);
    } else {
      // Default fallback if no handler passed
      addNode({
        type: item.type,
        data: {
          name: item.name,
          category: item.category,
          status: item.status,
          description: item.description,
          purpose: item.purpose,
          requirements: item.requirements,
          candidateComponents: item.candidateComponents,
          risks: item.risks,
          notes: item.notes,
          testingNotes: item.testingNotes,
          views: [activeView],
          positions: {}
        },
        position: { x: 350, y: 150 }
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, item: BlockLibraryItem) => {
    e.dataTransfer.setData('application/reactflow-item', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'move';
  };

  // Determine if active view allows placing blocks
  const tabularViews = [
    'dashboard', 'product-studio', 'readiness', 'requirements', 'risks-interfaces',
    'mechanical-studio', 'assembly-stack', 'component-library', 'schematic-editor',
    'power-tree', 'pin-map', 'bom', 'board-designer', 'board-settings', 'pcb-constraints',
    'pcb-drc', 'firmware-studio', 'state-machines', 'hardware-mapping', 'source-skeleton',
    'validation-studio', 'requirement-coverage', 'factory-qa', 'blueprint-sheets',
    'exports', 'factory-builder'
  ];
  const isCanvasView = !tabularViews.includes(activeView);

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col h-full shrink-0 shadow-sm z-20 overflow-hidden">
      {/* Blueprint Navigation */}
      <div className="p-3 border-b border-slate-100 overflow-y-auto max-h-[65vh] select-none shrink-0">
        <nav className="space-y-3">
          {sidebarGroups.map(group => (
            <div key={group.title} className="space-y-1">
              <h3 className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest px-2.5 mb-1.5">{group.title}</h3>
              <div className="space-y-0.5">
                {group.items.map(s => {
                  const Icon = s.icon;
                  const isActive = activeView === s.id;
                  const isTable = tabularViews.includes(s.id);
                  return (
                    <button
                      key={`${group.title}-${s.id}-${s.label}`}
                      onClick={() => setActiveView(s.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-semibold tracking-wide transition-all duration-150 cursor-pointer group ${
                        isActive 
                          ? 'bg-slate-900 text-white shadow-sm border border-slate-950 font-bold' 
                          : 'text-slate-650 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-450' : 'text-slate-450 group-hover:text-slate-600'}`} />
                        <span>{s.label}</span>
                      </div>
                      {isTable && (
                        <span className={`text-[7px] px-1 py-0.2 rounded font-mono font-bold tracking-wider ${
                          isActive ? 'bg-slate-800 text-slate-350' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {s.id === 'bom' ? 'BOM' : s.id === 'testing' ? 'QA' : ['board-studio', 'circuit-planner', 'board-components', 'netlist-planner', 'pcb-constraints', 'mfg-pack'].includes(s.id) ? 'PCB' : 'DOC'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Block Library Accordion */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-slate-50/50">
        {isCanvasView ? (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Block Library</h2>
              <span className="text-[8px] text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Drag or Click</span>
            </div>
            
            <div className="space-y-2">
              {Object.entries(blockLibrary).map(([category, items]) => {
                const isExpanded = !!expandedCategories[category];
                return (
                  <div key={category} className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-200">
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 border-b border-slate-100 transition-colors text-left"
                    >
                      <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">{category}</span>
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </button>
                    
                    {isExpanded && (
                      <div className="p-2 space-y-1.5 bg-white">
                        {items.map((item, idx) => (
                          <div
                            key={idx}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item)}
                            onClick={() => handleAddBlock(item)}
                            className="group flex items-center justify-between p-2 rounded-md border border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-700 cursor-grab hover:text-slate-900 transition-all select-none shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
                            title={`${item.name}: ${item.description}`}
                          >
                            <div className="flex flex-col min-w-0 pr-1">
                              <span className="text-[10px] font-bold text-slate-800 leading-tight truncate w-[160px]">{item.name}</span>
                              <span className="text-[9px] text-slate-400 truncate mt-0.5 w-[160px]">{item.description}</span>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 p-0.5 bg-slate-900 text-white rounded hover:bg-slate-800 transition-all shrink-0">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-slate-400 flex flex-col items-center justify-center h-full">
            <Table className="w-7 h-7 text-slate-300 mb-2" />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Table View Active</p>
            <p className="text-[10px] text-slate-400 mt-1 max-w-[180px] leading-relaxed">Block library is only available in graphic blueprint views.</p>
          </div>
        )}
      </div>
    </aside>
  );
};
