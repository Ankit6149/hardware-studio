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
      <aside className="z-30 flex h-full w-14 shrink-0 flex-col border-r border-[#2c2b27] bg-[#11110f] text-white" aria-label="Primary product-area navigation">
        <div className="grid h-11 shrink-0 place-items-center border-b border-white/10">
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="grid h-9 w-9 place-items-center rounded-md text-[#c9c3b8] transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#cbbda6]"
            aria-label={collapsed ? 'Show contextual navigation' : 'Hide contextual navigation'}
            aria-expanded={!collapsed}
            title={collapsed ? 'Show contextual navigation' : 'Hide contextual navigation'}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" aria-hidden="true" /> : <PanelLeftClose className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-1.5 py-2" aria-label="Engineering domains">
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
                className={`relative grid h-10 w-full place-items-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#cbbda6] ${
                  active ? 'bg-[#f3f0e8] text-[#11110f]' : 'text-[#aaa398] hover:bg-white/10 hover:text-[#f3f0e8]'
                }`}
              >
                <Icon className="h-[17px] w-[17px]" aria-hidden="true" />
                {hiddenButActive && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-400" aria-label="Outside focused workflow" />}
              </button>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-white/10 p-1.5">
          {hiddenDomainCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAllDomains(!showAllDomains)}
              className="grid h-9 w-full place-items-center rounded-md text-[#aaa398] hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#cbbda6]"
              aria-label={showAllDomains ? 'Show focused domains only' : 'Show all engineering domains'}
              title={showAllDomains ? 'Show focused domains only' : `Show ${hiddenDomainCount} hidden domains`}
            >
              {showAllDomains ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            </button>
          )}
          <button
            type="button"
            onClick={openSetup}
            className="grid h-9 w-full place-items-center rounded-md text-[#aaa398] hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#cbbda6]"
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
