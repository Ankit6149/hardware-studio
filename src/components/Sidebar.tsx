import React, { useMemo } from 'react';
import {
  Binary,
  CircuitBoard,
  Cpu,
  Eye,
  EyeOff,
  LayoutDashboard,
  Package,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
  TestTube2,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { navigationDomains, type NavigationDomainId } from '../lib/navigationRegistry';
import {
  getDomainIdForView,
  getHiddenDomainCount,
  getVisibleNavigationDomains,
  type WorkflowDomainId,
} from '../lib/workflowProfiles';
import { useProjectStore } from '../store/projectStore';
import { useWorkflowPreferencesStore } from '../store/workflowPreferencesStore';
import { ContextSubnav } from './ContextSubnav';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

const domainIcons: Record<NavigationDomainId, LucideIcon> = {
  overview: LayoutDashboard,
  product: Cpu,
  mechanical: Palette,
  electronics: Zap,
  pcb: CircuitBoard,
  firmware: Binary,
  validation: TestTube2,
  outputs: Package,
};

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onToggleCollapsed }) => {
  const { activeView, setActiveView } = useProjectStore();
  const {
    enabledDomains,
    showAllDomains,
    setShowAllDomains,
    openSetup,
  } = useWorkflowPreferencesStore();

  const activeDomainId = getDomainIdForView(activeView) || 'overview';
  const visibleDomains = useMemo(
    () => getVisibleNavigationDomains(enabledDomains, activeView, showAllDomains),
    [activeView, enabledDomains, showAllDomains],
  );
  const hiddenDomainCount = getHiddenDomainCount(enabledDomains);

  const openDomain = (domainId: NavigationDomainId) => {
    const domain = navigationDomains.find((candidate) => candidate.id === domainId);
    if (!domain || activeDomainId === domainId) return;
    const firstView = domain.items[0]?.id;
    if (firstView) setActiveView(firstView);
  };

  return (
    <>
      <aside className="z-30 flex h-full w-16 shrink-0 flex-col border-r border-slate-800 bg-slate-950 text-white" aria-label="Primary product-area navigation">
        <div className="grid h-12 shrink-0 place-items-center border-b border-white/10">
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="grid h-10 w-10 place-items-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            aria-label={collapsed ? 'Show contextual navigation' : 'Hide contextual navigation'}
            aria-expanded={!collapsed}
            title={collapsed ? 'Show contextual navigation' : 'Hide contextual navigation'}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" aria-hidden="true" /> : <PanelLeftClose className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 py-2" aria-label="Engineering domains">
          {visibleDomains.map((domain) => {
            const Icon = domainIcons[domain.id];
            const active = domain.id === activeDomainId;
            const hiddenButActive = domain.id !== 'overview'
              && !enabledDomains.includes(domain.id as WorkflowDomainId)
              && !showAllDomains;
            return (
              <button
                key={domain.id}
                type="button"
                onClick={() => openDomain(domain.id)}
                aria-current={active ? 'page' : undefined}
                aria-label={domain.label}
                title={`${domain.label} — ${domain.purpose}`}
                className={`relative grid h-11 w-full place-items-center rounded-xl transition focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                  active ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                {hiddenButActive && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-400" aria-label="Outside focused workflow" />}
              </button>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-white/10 p-2">
          {hiddenDomainCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAllDomains(!showAllDomains)}
              className="grid h-10 w-full place-items-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              aria-label={showAllDomains ? 'Show focused domains only' : 'Show all engineering domains'}
              title={showAllDomains ? 'Show focused domains only' : `Show ${hiddenDomainCount} hidden domains`}
            >
              {showAllDomains ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            </button>
          )}
          <button
            type="button"
            onClick={openSetup}
            className="grid h-10 w-full place-items-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            aria-label="Configure workflow"
            title="Configure workflow"
          >
            <Settings2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </aside>
      <ContextSubnav collapsed={collapsed} />
    </>
  );
};
