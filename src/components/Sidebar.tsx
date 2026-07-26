import React, { useState } from 'react';
import {
  Binary,
  Boxes,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Cpu,
  Download,
  FileCheck2,
  FileText,
  Layers,
  LayoutDashboard,
  Package,
  Palette,
  Plus,
  Ruler,
  ShieldAlert,
  Table,
  Zap,
} from 'lucide-react';
import { blockLibrary, BlockLibraryItem } from '../data/blockLibrary';
import { useProjectStore } from '../store/projectStore';

interface SidebarProps {
  onAddBlock?: (item: BlockLibraryItem) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onAddBlock }) => {
  const { activeView, setActiveView, addNode } = useProjectStore();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    Interaction: true,
    Electronics: true,
  });

  const sidebarGroups = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard', label: 'Project Dashboard', icon: LayoutDashboard },
        { id: 'product-studio', label: 'Product Studio', icon: Cpu },
        { id: 'readiness', label: 'Release Readiness', icon: FileCheck2 },
      ],
    },
    {
      title: 'Product',
      items: [
        { id: 'requirements', label: 'Requirements', icon: CheckSquare },
        { id: 'product-architecture', label: 'Product Architecture', icon: Cpu },
        { id: 'risks-interfaces', label: 'Risks & Interfaces', icon: ShieldAlert },
      ],
    },
    {
      title: 'Mechanical',
      items: [
        { id: 'mechanical-studio', label: 'Mechanical Studio', icon: Palette },
        { id: 'assembly-stack', label: 'Assembly Stack', icon: Layers },
      ],
    },
    {
      title: 'Electronics',
      items: [
        { id: 'component-library', label: 'Component Library', icon: Boxes },
        { id: 'schematic-editor', label: 'Schematic Editor', icon: Cpu },
        { id: 'power-tree', label: 'Power Tree', icon: Zap },
        { id: 'pin-map', label: 'Pin Map', icon: Cpu },
        { id: 'bom', label: 'BOM', icon: Table },
      ],
    },
    {
      title: 'PCB',
      items: [
        { id: 'board-designer', label: 'Board Designer', icon: Cpu },
        { id: 'board-settings', label: 'Board Settings', icon: Layers },
        { id: 'pcb-constraints', label: 'PCB Rules', icon: Ruler },
        { id: 'pcb-drc', label: 'DRC', icon: ShieldAlert },
      ],
    },
    {
      title: 'Firmware',
      items: [
        { id: 'firmware-studio', label: 'Firmware Studio', icon: Binary },
        { id: 'state-machines', label: 'State Machines', icon: Cpu },
        { id: 'hardware-mapping', label: 'Hardware Mapping', icon: Cpu },
        { id: 'source-skeleton', label: 'Source Skeleton', icon: FileText },
      ],
    },
    {
      title: 'Validation',
      items: [
        { id: 'validation-studio', label: 'Validation Studio', icon: CheckSquare },
        { id: 'requirement-coverage', label: 'Requirement Coverage', icon: FileCheck2 },
        { id: 'factory-qa', label: 'Factory QA', icon: CheckSquare },
      ],
    },
    {
      title: 'Outputs',
      items: [
        { id: 'blueprint-sheets', label: 'Blueprint Studio', icon: FileText },
        { id: 'exports', label: 'Export Center', icon: Download },
        { id: 'factory-builder', label: 'Factory Package Builder', icon: Package },
      ],
    },
  ];

  const tabularViews = [
    'dashboard',
    'product-studio',
    'readiness',
    'requirements',
    'risks-interfaces',
    'mechanical-studio',
    'assembly-stack',
    'component-library',
    'schematic-editor',
    'power-tree',
    'pin-map',
    'bom',
    'board-designer',
    'board-settings',
    'pcb-constraints',
    'pcb-drc',
    'firmware-studio',
    'state-machines',
    'hardware-mapping',
    'source-skeleton',
    'validation-studio',
    'requirement-coverage',
    'factory-qa',
    'blueprint-sheets',
    'exports',
    'factory-builder',
  ];

  const isCanvasView = !tabularViews.includes(activeView);

  const toggleCategory = (category: string) => {
    setExpandedCategories((previous) => ({
      ...previous,
      [category]: !previous[category],
    }));
  };

  const handleAddBlock = (item: BlockLibraryItem) => {
    if (onAddBlock) {
      onAddBlock(item);
      return;
    }

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
        positions: {},
      },
      position: { x: 350, y: 150 },
    });
  };

  const handleDragStart = (event: React.DragEvent, item: BlockLibraryItem) => {
    event.dataTransfer.setData('application/reactflow-item', JSON.stringify(item));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="z-20 flex h-full w-[228px] shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white shadow-sm">
      <div className="max-h-[67vh] shrink-0 overflow-y-auto border-b border-slate-100 px-2.5 py-2.5 select-none">
        <nav className="space-y-2.5">
          {sidebarGroups.map((group) => (
            <div key={group.title} className="space-y-0.5">
              <h3 className="mb-1 px-2 text-[7px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                {group.title}
              </h3>
              <div className="space-y-px">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  const isTable = tabularViews.includes(item.id);

                  return (
                    <button
                      key={`${group.title}-${item.id}`}
                      onClick={() => setActiveView(item.id)}
                      className={`group flex w-full items-center justify-between rounded-md border px-2 py-1.5 text-[9.5px] font-semibold leading-none tracking-[0.01em] transition-colors ${
                        isActive
                          ? 'border-slate-950 bg-slate-900 text-white shadow-sm'
                          : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-1.5">
                        <Icon
                          className={`h-3 w-3 shrink-0 ${
                            isActive ? 'text-emerald-300' : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {isTable && (
                        <span
                          className={`ml-1 rounded px-1 py-0.5 font-mono text-[6px] font-bold uppercase tracking-[0.08em] ${
                            isActive ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {item.id === 'bom'
                            ? 'BOM'
                            : ['board-designer', 'board-settings', 'pcb-constraints', 'pcb-drc'].includes(item.id)
                              ? 'PCB'
                              : 'DOC'}
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

      <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/60">
        {isCanvasView ? (
          <div className="p-3">
            <div className="mb-2.5 flex items-center justify-between px-0.5">
              <h2 className="text-[7px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Block Library
              </h2>
              <span className="rounded bg-slate-200/70 px-1.5 py-0.5 text-[6px] font-bold uppercase tracking-[0.08em] text-slate-500">
                Drag or click
              </span>
            </div>

            <div className="space-y-1.5">
              {Object.entries(blockLibrary).map(([category, items]) => {
                const isExpanded = Boolean(expandedCategories[category]);

                return (
                  <div
                    key={category}
                    className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                  >
                    <button
                      onClick={() => toggleCategory(category)}
                      className="flex w-full items-center justify-between border-b border-slate-100 bg-slate-50 px-2.5 py-1.5 text-left transition-colors hover:bg-slate-100"
                    >
                      <span className="text-[8px] font-extrabold uppercase tracking-[0.12em] text-slate-700">
                        {category}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3 text-slate-500" />
                      ) : (
                        <ChevronRight className="h-3 w-3 text-slate-500" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="space-y-1 p-1.5">
                        {items.map((item, index) => (
                          <div
                            key={`${item.name}-${index}`}
                            draggable
                            onDragStart={(event) => handleDragStart(event, item)}
                            onClick={() => handleAddBlock(item)}
                            className="group flex cursor-grab items-center justify-between rounded border border-slate-100 p-1.5 text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
                            title={`${item.name}: ${item.description}`}
                          >
                            <div className="min-w-0 pr-1">
                              <div className="truncate text-[8.5px] font-bold leading-tight text-slate-800">
                                {item.name}
                              </div>
                              <div className="mt-0.5 truncate text-[7.5px] text-slate-400">
                                {item.description}
                              </div>
                            </div>
                            <span className="grid h-4 w-4 shrink-0 place-items-center rounded bg-slate-900 text-white opacity-0 transition-opacity group-hover:opacity-100">
                              <Plus className="h-2.5 w-2.5" />
                            </span>
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
          <div className="flex h-full flex-col items-center justify-center p-5 text-center text-slate-400">
            <Table className="mb-2 h-6 w-6 text-slate-300" />
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-500">
              Table view active
            </p>
            <p className="mt-1 max-w-[160px] text-[8px] leading-4 text-slate-400">
              The block library is available in graphic blueprint views.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
