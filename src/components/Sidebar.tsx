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
  type WorkflowDomainId,
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
    <aside className="z-20 flex h-full w-[240px] shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white">
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-slate-200 px-3">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold text-slate-900">{profile.name}</p>
          <p className="mt-0.5 text-[8px] uppercase tracking-[0.14em] text-slate-400">Workspace</p>
        </div>
        <div className="flex items-center gap-1">
          {hiddenDomainCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAllDomains(!showAllDomains)}
              className="grid h-7 w-7 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label={showAllDomains ? 'Show focused navigation' : 'Show all modules'}
              title={showAllDomains ? 'Show focused navigation' : `Show ${hiddenDomainCount} hidden modules`}
            >
              {showAllDomains ? <EyeOff className="h-3.5 w-3.5" aria-hidden="true" /> : <Eye className="h-3.5 w-3.5" aria-hidden="true" />}
            </button>
          )}
          <button
            type="button"
            onClick={openSetup}
            className="grid h-7 w-7 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Configure workflow"
            title="Configure workflow"
          >
            <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2.5">
        <nav className="space-y-3" aria-label="Engineering workbenches">
          {visibleDomains.map((domain) => {
            const domainIsActiveButHidden = domain.id !== 'overview'
              && !enabledDomains.includes(domain.id as WorkflowDomainId)
              && !showAllDomains;

            return (
              <section key={domain.id} aria-labelledby={`nav-${domain.id}`}>
                <div className="mb-1 flex items-center justify-between px-2">
                  <h2 id={`nav-${domain.id}`} className="text-[8px] font-bold uppercase tracking-[0.15em] text-slate-400">{domain.label}</h2>
                  {domainIsActiveButHidden && (
                    <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wide text-amber-700">Hidden</span>
                  )}
                </div>

                <div className="space-y-0.5">
                  {domain.items.map((item) => {
                    const Icon = iconByKey[item.icon];
                    const isActive = activeView === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveView(item.id)}
                        aria-current={isActive ? 'page' : undefined}
                        title={item.purpose}
                        className={`group flex h-8 w-full items-center gap-2 rounded-md px-2 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isActive ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}
                      >
                        <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-emerald-300' : 'text-slate-400 group-hover:text-slate-600'}`} aria-hidden="true" />
                        <span className="min-w-0 flex-1 truncate text-[10px] font-semibold">{item.label}</span>
                        <span className={`shrink-0 rounded px-1 py-0.5 font-mono text-[6px] font-bold uppercase tracking-[0.08em] ${isActive ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-400 group-hover:bg-white'}`}>{item.badge}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </nav>

        {isCanvasView && (
          <section className="mt-4 border-t border-slate-200 pt-3" aria-labelledby="device-library-title">
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 id="device-library-title" className="text-[8px] font-bold uppercase tracking-[0.15em] text-slate-400">Device library</h2>
              <span className="text-[7px] font-semibold text-slate-400">Drag or click</span>
            </div>

            <div className="space-y-1.5">
              {Object.entries(blockLibrary).map(([category, items]) => {
                const isExpanded = Boolean(expandedCategories[category]);
                return (
                  <div key={category} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <button
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className="flex w-full items-center justify-between bg-slate-50 px-2.5 py-2 text-left hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                      aria-expanded={isExpanded}
                    >
                      <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-600">{category}</span>
                      {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />}
                    </button>

                    {isExpanded && (
                      <div className="space-y-1 border-t border-slate-100 p-1.5">
                        {items.map((libraryItem, index) => {
                          const familyId = resolveVisualFamilyId(libraryItem);
                          const family = getVisualFamily(familyId);
                          return (
                            <button
                              key={`${libraryItem.name}-${index}`}
                              type="button"
                              draggable
                              onDragStart={(event) => handleDragStart(event, libraryItem)}
                              onClick={() => handleAddBlock(libraryItem)}
                              className="group flex w-full cursor-grab items-center gap-2 rounded-md p-1.5 text-left text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              title={`${libraryItem.name}: ${libraryItem.description}`}
                            >
                              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: family.accent, color: family.color }}>
                                <ArchitectureGlyph familyId={familyId} className="h-5 w-5" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[9px] font-semibold text-slate-800">{libraryItem.name}</span>
                                <span className="mt-0.5 block truncate text-[8px] text-slate-400">{family.shortLabel}</span>
                              </span>
                              <Plus className="h-3.5 w-3.5 shrink-0 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </aside>
  );
};