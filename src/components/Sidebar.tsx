import React, { useMemo, useState } from 'react';
import {
  Binary,
  Blocks,
  Boxes,
  Box,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  CircuitBoard,
  Cpu,
  Download,
  Eye,
  EyeOff,
  FileCheck2,
  FileText,
  GitBranch,
  Layers,
  LayoutDashboard,
  Network,
  Package,
  Palette,
  Plus,
  Ruler,
  Settings2,
  ShieldAlert,
  Table,
  Tags,
  TestTube2,
  Workflow,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { blockLibrary, BlockLibraryItem } from '../data/blockLibrary';
import {
  getNavigationItem,
  isCanvasNavigationItem,
  NavigationIconKey,
} from '../lib/navigationRegistry';
import {
  getHiddenDomainCount,
  getVisibleNavigationDomains,
  getWorkflowProfile,
} from '../lib/workflowProfiles';
import { getVisualFamily, resolveVisualFamilyId } from '../lib/visual/representationRegistry';
import { useProjectStore } from '../store/projectStore';
import { useWorkflowPreferencesStore } from '../store/workflowPreferencesStore';
import { ArchitectureGlyph } from './visual/DeviceVisual';

interface SidebarProps {
  onAddBlock?: (item: BlockLibraryItem) => void;
}

const iconByKey: Record<NavigationIconKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  product: Cpu,
  readiness: FileCheck2,
  requirements: CheckSquare,
  architecture: Network,
  risk: ShieldAlert,
  blueprint: Blocks,
  mechanical: Palette,
  assembly: Layers,
  components: Boxes,
  schematic: Workflow,
  power: Zap,
  'pin-map': Tags,
  bom: Table,
  board: CircuitBoard,
  layers: Layers,
  rules: Ruler,
  drc: ShieldAlert,
  firmware: Binary,
  'state-machine': Workflow,
  mapping: Cpu,
  source: FileText,
  validation: TestTube2,
  coverage: FileCheck2,
  'factory-qa': CheckSquare,
  exports: Download,
  'factory-package': Package,
  revisions: FileText,
  branches: GitBranch,
  releases: Box,
};

export const Sidebar: React.FC<SidebarProps> = ({ onAddBlock }) => {
  const { activeView, setActiveView, addNode } = useProjectStore();
  const {
    enabledDomains,
    showAllDomains,
    setShowAllDomains,
    openSetup,
    profileId,
  } = useWorkflowPreferencesStore();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    Interaction: true,
    Electronics: true,
  });

  const activeNavigationItem = getNavigationItem(activeView);
  const isCanvasView = isCanvasNavigationItem(activeNavigationItem);
  const visibleDomains = useMemo(
    () => getVisibleNavigationDomains(enabledDomains, activeView, showAllDomains),
    [activeView, enabledDomains, showAllDomains],
  );
  const hiddenDomainCount = getHiddenDomainCount(enabledDomains);
  const profile = getWorkflowProfile(profileId);

  const toggleCategory = (category: string) => {
    setExpandedCategories((previous) => ({ ...previous, [category]: !previous[category] }));
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
    <aside className="z-20 flex h-full w-[272px] shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white shadow-sm">
      <div className="shrink-0 border-b border-slate-200 bg-slate-50 p-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[8px] font-extrabold uppercase tracking-[0.14em] text-indigo-700">Active workflow</p>
              <p className="mt-1 truncate text-[11px] font-bold text-slate-950">{profile.name}</p>
              <p className="mt-1 text-[9px] leading-4 text-slate-500">
                {enabledDomains.length} visible · {hiddenDomainCount} hidden
              </p>
            </div>
            <button
              type="button"
              onClick={openSetup}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Configure workflow"
              title="Configure workflow"
            >
              <Settings2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {hiddenDomainCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAllDomains(!showAllDomains)}
              aria-pressed={showAllDomains}
              className="mt-3 flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-left text-[9px] font-semibold text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <span>{showAllDomains ? 'Return to focused navigation' : `Temporarily show ${hiddenDomainCount} hidden modules`}</span>
              {showAllDomains ? <EyeOff className="h-3.5 w-3.5" aria-hidden="true" /> : <Eye className="h-3.5 w-3.5" aria-hidden="true" />}
            </button>
          )}
        </div>
      </div>

      <div className="max-h-[64vh] shrink-0 select-none overflow-y-auto border-b border-slate-100 px-3 py-3">
        <nav className="space-y-4" aria-label="Engineering workbenches">
          {visibleDomains.map((domain) => {
            const domainIsActiveButHidden = domain.id !== 'overview'
              && !enabledDomains.includes(domain.id as never)
              && !showAllDomains;
            return (
              <section key={domain.id} aria-labelledby={`nav-${domain.id}`}>
                <div className="mb-1.5 px-2">
                  <div className="flex items-center justify-between gap-2">
                    <h2 id={`nav-${domain.id}`} className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate-500">{domain.label}</h2>
                    {domainIsActiveButHidden && (
                      <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wide text-amber-700">Active hidden</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[9px] leading-4 text-slate-400">{domain.purpose}</p>
                </div>

                <div className="space-y-1">
                  {domain.items.map((item) => {
                    const Icon = iconByKey[item.icon];
                    const isActive = activeView === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveView(item.id)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`group flex w-full items-start gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 ${isActive ? 'border-slate-950 bg-slate-900 text-white shadow-sm' : 'border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950'}`}
                      >
                        <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${isActive ? 'text-emerald-300' : 'text-slate-400 group-hover:text-slate-600'}`} aria-hidden="true" />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span className="truncate text-[11px] font-semibold leading-4">{item.label}</span>
                            <span className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[7px] font-bold uppercase tracking-[0.08em] ${isActive ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>{item.badge}</span>
                          </span>
                          <span className={`mt-0.5 block text-[9px] leading-4 ${isActive ? 'text-slate-300' : 'text-slate-450'}`}>{item.purpose}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </nav>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/60">
        {isCanvasView ? (
          <div className="p-3">
            <div className="mb-2.5 px-0.5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">Device & function library</h2>
                <span className="rounded bg-slate-200/70 px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-[0.08em] text-slate-500">Drag or click</span>
              </div>
              <p className="mt-1 text-[9px] leading-4 text-slate-400">Architecture visuals communicate purpose and interfaces. Exact symbols, footprints, and CAD remain separate.</p>
            </div>

            <div className="space-y-1.5">
              {Object.entries(blockLibrary).map(([category, items]) => {
                const isExpanded = Boolean(expandedCategories[category]);
                return (
                  <div key={category} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <button
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className="flex w-full items-center justify-between border-b border-slate-100 bg-slate-50 px-2.5 py-2 text-left transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400"
                      aria-expanded={isExpanded}
                    >
                      <span className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-700">{category}</span>
                      {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />}
                    </button>

                    {isExpanded && (
                      <div className="space-y-1.5 p-1.5">
                        {items.map((libraryItem, index) => {
                          const familyId = resolveVisualFamilyId(libraryItem);
                          const family = getVisualFamily(familyId);
                          return (
                            <div
                              key={`${libraryItem.name}-${index}`}
                              draggable
                              onDragStart={(event) => handleDragStart(event, libraryItem)}
                              onClick={() => handleAddBlock(libraryItem)}
                              className="group flex cursor-grab items-center gap-2.5 rounded-xl border border-slate-100 bg-white p-2 text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
                              title={`${libraryItem.name}: ${libraryItem.description}`}
                            >
                              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white shadow-sm" style={{ backgroundColor: family.accent, color: family.color }}>
                                <ArchitectureGlyph familyId={familyId} className="h-7 w-7" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="truncate text-[10px] font-bold leading-tight text-slate-800">{libraryItem.name}</div>
                                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wide text-slate-500">{family.shortLabel}</span>
                                </div>
                                <div className="mt-1 line-clamp-2 text-[9px] leading-4 text-slate-500">{libraryItem.description}</div>
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {family.ports.slice(0, 3).map((port) => <span key={port.id} className="rounded-full border border-slate-200 bg-white px-1.5 py-0.5 text-[7px] font-bold uppercase text-slate-500">{port.kind}</span>)}
                                </div>
                              </div>
                              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-slate-900 text-white opacity-0 transition-opacity group-hover:opacity-100"><Plus className="h-3.5 w-3.5" aria-hidden="true" /></span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-5 text-center text-slate-400">
            <Table className="mb-2 h-7 w-7 text-slate-300" aria-hidden="true" />
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">Work area active</p>
            <p className="mt-1 max-w-[190px] text-[10px] leading-5 text-slate-500">The semantic device library appears only in System Blueprint, where architecture functions and interfaces can be arranged.</p>
          </div>
        )}
      </div>
    </aside>
  );
};
