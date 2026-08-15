import React, { useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  type LucideIcon,
  Binary,
  Blocks,
  Boxes,
  Box,
  CheckSquare,
  CircuitBoard,
  Cpu,
  Download,
  FileCheck2,
  FileText,
  GitBranch,
  Layers,
  LayoutDashboard,
  Network,
  Package,
  Palette,
  Ruler,
  ShieldAlert,
  Table,
  Tags,
  TestTube2,
  Workflow,
  Zap,
} from 'lucide-react';
import { blockLibrary, type BlockLibraryItem } from '../data/blockLibrary';
import {
  getNavigationItem,
  isCanvasNavigationItem,
  type NavigationIconKey,
} from '../lib/navigationRegistry';
import { getDomainIdForView, getVisibleNavigationDomains } from '../lib/workflowProfiles';
import { getVisualFamily, resolveVisualFamilyId } from '../lib/visual/representationRegistry';
import { useProjectStore } from '../store/projectStore';
import { useWorkflowPreferencesStore } from '../store/workflowPreferencesStore';
import { ArchitectureGlyph } from './visual/DeviceVisual';

interface ContextSubnavProps {
  collapsed?: boolean;
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

export const ContextSubnav: React.FC<ContextSubnavProps> = ({ collapsed = false }) => {
  const { activeView, setActiveView, addNode } = useProjectStore();
  const { enabledDomains, showAllDomains } = useWorkflowPreferencesStore();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({ Interaction: true, Electronics: true });

  const domains = useMemo(
    () => getVisibleNavigationDomains(enabledDomains, activeView, showAllDomains),
    [activeView, enabledDomains, showAllDomains],
  );
  const activeDomainId = getDomainIdForView(activeView) || 'overview';
  const activeDomain = domains.find((domain) => domain.id === activeDomainId) || domains[0];
  const activeNavigationItem = getNavigationItem(activeView);
  const showDeviceLibrary = isCanvasNavigationItem(activeNavigationItem);

  if (collapsed || !activeDomain) return null;

  const handleAddBlock = (item: BlockLibraryItem) => {
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
    <aside className="z-20 flex h-full w-[220px] shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white max-xl:w-[200px]" aria-label={`${activeDomain.label} contextual navigation`}>
      <div className="shrink-0 border-b border-slate-200 px-3 py-3">
        <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-indigo-700">{activeDomain.label}</p>
        <p className="mt-1 text-[10px] leading-4 text-slate-500">{activeDomain.purpose}</p>
      </div>

      <nav className="shrink-0 space-y-1 p-2" aria-label={`${activeDomain.label} workbenches`}>
        {activeDomain.items.map((item) => {
          const Icon = iconByKey[item.icon];
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveView(item.id)}
              aria-current={active ? 'page' : undefined}
              title={item.purpose}
              className={`group flex min-h-10 w-full items-center gap-2 rounded-lg px-2.5 text-left transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                active ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-emerald-300' : 'text-slate-400 group-hover:text-slate-700'}`} aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-[11px] font-semibold">{item.label}</span>
              <span className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[7px] font-bold uppercase tracking-[0.08em] ${active ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-400'}`}>{item.badge}</span>
            </button>
          );
        })}
      </nav>

      {showDeviceLibrary && (
        <section className="min-h-0 flex-1 overflow-y-auto border-t border-slate-200 px-2 py-3" aria-labelledby="context-device-library-title">
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 id="context-device-library-title" className="text-[8px] font-bold uppercase tracking-[0.15em] text-slate-400">Device library</h2>
            <span className="text-[7px] font-semibold text-slate-400">Drag or click</span>
          </div>

          <div className="space-y-1.5">
            {Object.entries(blockLibrary).map(([category, items]) => {
              const expanded = Boolean(expandedCategories[category]);
              return (
                <div key={category} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <button
                    type="button"
                    onClick={() => setExpandedCategories((current) => ({ ...current, [category]: !expanded }))}
                    className="flex min-h-10 w-full items-center justify-between bg-slate-50 px-2.5 py-2 text-left hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                    aria-expanded={expanded}
                  >
                    <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-600">{category}</span>
                    {expanded ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />}
                  </button>

                  {expanded && (
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
                            className="group flex min-h-10 w-full cursor-grab items-center gap-2 rounded-md p-1.5 text-left text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

      {!showDeviceLibrary && (
        <div className="mt-auto border-t border-slate-200 px-3 py-3 text-[9px] leading-4 text-slate-400">
          Primary rail chooses the engineering area. This panel only shows decisions and workbenches relevant to that area.
        </div>
      )}
    </aside>
  );
};
