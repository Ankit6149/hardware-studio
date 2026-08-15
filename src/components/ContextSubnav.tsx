import React, { useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  GripVertical,
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
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

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
    event.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <aside
      data-context-subnav
      className="z-20 flex h-full w-[196px] shrink-0 flex-col overflow-hidden border-r border-slate-300 bg-[#f6f2e9]"
      aria-label={`${activeDomain.label} contextual navigation`}
    >
      <div className="shrink-0 border-b border-slate-300 px-3 py-3">
        <h2 className="text-[13px] font-semibold tracking-[-0.015em] text-slate-950">{activeDomain.label}</h2>
        <p className="mt-1 text-[11px] leading-4 text-slate-500">{activeDomain.purpose}</p>
      </div>

      <nav className="shrink-0 p-1.5" aria-label={`${activeDomain.label} workbenches`}>
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
              className={`group relative flex min-h-9 w-full items-center gap-2 rounded-md px-2 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400/70 ${
                active ? 'bg-[#e6dfd1] text-slate-950' : 'text-slate-600 hover:bg-[#ece7dd] hover:text-slate-950'
              }`}
            >
              {active && <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-slate-950" aria-hidden="true" />}
              <Icon className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-700'}`} aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-[11px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {showDeviceLibrary && (
        <section className="min-h-0 flex-1 overflow-y-auto border-t border-slate-300 px-2 py-2.5" aria-labelledby="context-device-library-title">
          <div className="mb-2 px-1">
            <h2 id="context-device-library-title" className="text-[10px] font-semibold text-slate-700">Blueprint blocks</h2>
            <p className="mt-0.5 text-[9px] leading-4 text-slate-400">Drag into the canvas, or use Add. Clicking the row itself does not mutate the project.</p>
          </div>

          <div>
            {Object.entries(blockLibrary).map(([category, items]) => {
              const expanded = Boolean(expandedCategories[category]);
              return (
                <div key={category} className="border-b border-slate-200 last:border-b-0">
                  <button
                    type="button"
                    onClick={() => setExpandedCategories((current) => ({ ...current, [category]: !expanded }))}
                    className="flex min-h-9 w-full items-center justify-between px-1 py-1.5 text-left text-slate-700 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400/70"
                    aria-expanded={expanded}
                  >
                    <span className="text-[10px] font-semibold">{category}</span>
                    {expanded ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />}
                  </button>

                  {expanded && (
                    <div className="pb-1.5">
                      {items.map((libraryItem, index) => {
                        const familyId = resolveVisualFamilyId(libraryItem);
                        const family = getVisualFamily(familyId);
                        return (
                          <div
                            key={`${libraryItem.name}-${index}`}
                            draggable
                            onDragStart={(event) => handleDragStart(event, libraryItem)}
                            className="group flex min-h-10 items-center gap-2 rounded-md px-1 py-1 text-slate-700 hover:bg-[#ece7dd]"
                            title={`${libraryItem.name}: ${libraryItem.description}`}
                          >
                            <span className="grid h-7 w-7 shrink-0 cursor-grab place-items-center rounded-md border border-slate-200" style={{ backgroundColor: family.accent, color: family.color }} aria-hidden="true">
                              <ArchitectureGlyph familyId={familyId} className="h-4 w-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[10px] font-medium text-slate-800">{libraryItem.name}</span>
                              <span className="flex items-center gap-1 text-[9px] text-slate-400"><GripVertical className="h-3 w-3" aria-hidden="true" /> Drag to place</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddBlock(libraryItem)}
                              className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-slate-300 bg-white px-1.5 text-[9px] font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
                              aria-label={`Add ${libraryItem.name} to the blueprint`}
                            >
                              <Plus className="h-3 w-3" aria-hidden="true" /> Add
                            </button>
                          </div>
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
    </aside>
  );
};