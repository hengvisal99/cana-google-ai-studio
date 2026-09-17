'use client';

import React from 'react';
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  Building2,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  CircleDot,
  Clock3,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  type LucideIcon,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ===========================================================================
   Shared nav model — every version draws the same menu, so only the design
   changes from one to the next.
   =========================================================================== */

export interface SidebarChild {
  id: string;
  label: string;
  badge?: string;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  hint?: string;
  children?: SidebarChild[];
}

export interface SidebarGroup {
  label: string;
  items: SidebarItem[];
}

export const SIDEBAR_NAV: SidebarGroup[] = [
  {
    label: 'Core Management',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, hint: '⌘1' },
      { id: 'customer-360', label: 'Customer 360', icon: Users, hint: '⌘2' },
      {
        id: 'customer',
        label: 'Customer',
        icon: UserRound,
        hint: '⌘3',
        children: [
          { id: 'customer-list', label: 'List' },
          { id: 'customer-type', label: 'Customer Type', badge: '5' },
        ],
      },
    ],
  },
  {
    label: 'Operations',
    items: [
      { id: 'onboarding', label: 'Onboarding', icon: Sparkles, badge: '12' },
      { id: 'documents', label: 'Documents', icon: FileText },
      { id: 'approvals', label: 'Approvals', icon: ShieldCheck, badge: '3' },
      { id: 'reports', label: 'Reports', icon: BarChart3 },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'support', label: 'Help & Support', icon: LifeBuoy },
    ],
  },
];

export interface SidebarVariantProps {
  /** id of the active leaf — a top-level item id, or a child id */
  activeId: string;
  onNavigate: (id: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const FLAT_ITEMS = SIDEBAR_NAV.flatMap((group) => group.items);

/** A parent counts as active when it, or one of its children, is selected. */
export function useParentId(activeId: string) {
  return React.useMemo(() => {
    const parent = FLAT_ITEMS.find(
      (item) => item.id === activeId || item.children?.some((child) => child.id === activeId)
    );
    return parent?.id ?? activeId;
  }, [activeId]);
}

/** Keeps an expandable group open while one of its children is selected. */
export function useExpanded(item: SidebarItem, activeId: string) {
  const holdsActive = !!item.children?.some((child) => child.id === activeId);
  const [open, setOpen] = React.useState(holdsActive);
  const [wasHolding, setWasHolding] = React.useState(holdsActive);

  // Adjust during render rather than in an effect: opening is a reaction to the
  // selection moving into this group, not a sync with an outside system.
  if (holdsActive !== wasHolding) {
    setWasHolding(holdsActive);
    if (holdsActive) setOpen(true);
  }

  return [open, setOpen] as const;
}

/** Collapsed rail shared by the versions that support an icon-only state. */
function IconRail({
  parentId,
  onNavigate,
  onExpand,
  tone,
}: {
  parentId: string;
  onNavigate: (id: string) => void;
  onExpand?: () => void;
  tone: 'solid' | 'soft';
}) {
  return (
    <div className="flex h-full w-[72px] shrink-0 flex-col items-center gap-1 py-4">
      <button
        type="button"
        onClick={onExpand}
        title="Expand sidebar"
        className="mb-2 grid h-9 w-9 cursor-pointer place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
      >
        <ChevronsRight className="h-4 w-4" />
      </button>
      {FLAT_ITEMS.map((item) => {
        const Icon = item.icon;
        const on = item.id === parentId;
        return (
          <button
            key={item.id}
            type="button"
            title={item.label}
            onClick={() => onNavigate(item.children?.[0].id ?? item.id)}
            className={cn(
              'relative grid h-10 w-10 cursor-pointer place-items-center rounded-xl transition',
              on
                ? tone === 'solid'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-white text-blue-600 shadow-[0_8px_20px_-10px_rgba(37,99,235,0.6)] ring-1 ring-blue-100'
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
            {item.badge && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ===========================================================================
   01 — Cobalt Rail
   App rail + nav panel. A soft blue row with a 2px blue bar marks the
   active item.
   =========================================================================== */

const RAIL_APPS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'core', label: 'Nexus Core Banking', icon: Building2 },
  { id: 'crm', label: 'Customer CRM', icon: Users },
  { id: 'risk', label: 'Risk & Compliance', icon: ShieldCheck },
  { id: 'insight', label: 'Insights', icon: BarChart3 },
];

export function SidebarCobaltRail({ activeId, onNavigate, collapsed, onToggleCollapse }: SidebarVariantProps) {
  const parentId = useParentId(activeId);
  const [app, setApp] = React.useState('core');

  return (
    <aside aria-label="Cobalt Rail navigation" className="flex h-full min-h-0 bg-white">
      {/* App rail */}
      <div className="flex w-[68px] shrink-0 flex-col items-center gap-1 border-r border-slate-200/80 bg-slate-50/80 py-4">
        <div className="mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-600/30">
          <Building2 className="h-[18px] w-[18px]" />
        </div>
        {RAIL_APPS.map((entry) => {
          const Icon = entry.icon;
          const on = entry.id === app;
          return (
            <button
              key={entry.id}
              type="button"
              title={entry.label}
              aria-pressed={on}
              onClick={() => setApp(entry.id)}
              className={cn(
                'relative grid h-11 w-11 cursor-pointer place-items-center rounded-2xl transition',
                on
                  ? 'bg-white text-blue-600 shadow-sm ring-1 ring-blue-100'
                  : 'text-slate-400 hover:bg-white hover:text-slate-700'
              )}
            >
              {on && <span className="absolute -left-[13px] h-6 w-[3px] rounded-r-full bg-blue-600" />}
              <Icon className="h-[18px] w-[18px]" />
            </button>
          );
        })}
        <div className="mt-auto flex flex-col items-center gap-2">
          <button
            type="button"
            title="Notifications"
            className="relative grid h-11 w-11 cursor-pointer place-items-center rounded-2xl text-slate-400 transition hover:bg-white hover:text-slate-700"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-slate-50" />
          </button>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-[11px] font-semibold text-white">
            VH
          </span>
        </div>
      </div>

      {collapsed ? (
        <div className="border-r border-slate-200/80">
          <IconRail parentId={parentId} onNavigate={onNavigate} onExpand={onToggleCollapse} tone="solid" />
        </div>
      ) : (
        <div className="flex w-[248px] shrink-0 flex-col border-r border-slate-200/80">
          <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-4">
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-semibold tracking-tight text-slate-900">Nexus 360</p>
              <p className="mt-0.5 truncate text-[11px] font-medium text-blue-600">Core Banking workspace</p>
            </div>
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Collapse sidebar"
              className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
          </div>

          <div className="px-3 pb-3">
            <button
              type="button"
              className="flex h-9 w-full cursor-pointer items-center gap-2 rounded-xl bg-slate-100/80 px-3 text-[12px] font-medium text-slate-400 transition hover:bg-slate-100"
            >
              <Search className="h-3.5 w-3.5" />
              Search
              <span className="ml-auto rounded-md bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 ring-1 ring-slate-200">
                ⌘K
              </span>
            </button>
          </div>

          <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 pb-4">
            {SIDEBAR_NAV.map((group) => (
              <div key={group.label}>
                <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <CobaltRow
                      key={item.id}
                      item={item}
                      activeId={activeId}
                      parentId={parentId}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="border-t border-slate-200/80 p-3">
            <div className="flex items-center gap-2.5 rounded-2xl bg-slate-50 p-2.5 ring-1 ring-slate-200/70">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-600 text-[11px] font-semibold text-white">
                VH
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-slate-900">Visal Heng</p>
                <p className="truncate text-[10.5px] text-slate-500">Senior Reviewer</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function CobaltRow({
  item,
  activeId,
  parentId,
  onNavigate,
}: {
  item: SidebarItem;
  activeId: string;
  parentId: string;
  onNavigate: (id: string) => void;
}) {
  const Icon = item.icon;
  const [open, setOpen] = useExpanded(item, activeId);
  const isActive = item.id === activeId;
  const holdsActive = item.id === parentId && !isActive;

  return (
    <div>
      <button
        type="button"
        aria-expanded={item.children ? open : undefined}
        onClick={() => (item.children ? setOpen(!open) : onNavigate(item.id))}
        className={cn(
          'relative flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 text-[12.5px] font-semibold transition',
          isActive
            ? 'bg-blue-50/60 text-blue-700'
            : holdsActive
              ? 'text-blue-700 hover:bg-blue-50/70'
              : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
        )}
      >
        {isActive && <span className="absolute -left-1 h-5 w-[2px] rounded-full bg-blue-600" />}
        <Icon
          className={cn(
            'h-4 w-4 shrink-0',
            isActive || holdsActive ? 'text-blue-600' : 'text-slate-400'
          )}
        />
        <span className="flex-1 truncate text-left">{item.label}</span>
        {item.badge && (
          <span
            className={cn(
              'rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
              isActive ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'
            )}
          >
            {item.badge}
          </span>
        )}
        {item.children && (
          <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 transition-transform', !open && '-rotate-90')} />
        )}
      </button>

      {item.children && open && (
        <div className="relative ml-[26px] mt-0.5 space-y-0.5 pl-3.5">
          <span className="absolute bottom-1 left-0 top-1 w-px bg-slate-200" />
          {item.children.map((child) => {
            const on = child.id === activeId;
            return (
              <button
                key={child.id}
                type="button"
                onClick={() => onNavigate(child.id)}
                className={cn(
                  'relative flex h-8 w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 text-[12px] font-medium transition',
                  on
                    ? 'bg-blue-50 font-semibold text-blue-700'
                    : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-900'
                )}
              >
                {on && <span className="absolute -left-[14px] h-4 w-[2px] rounded-full bg-blue-600" />}
                <span className="flex-1 truncate text-left">{child.label}</span>
                {child.badge && (
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-slate-500">
                    {child.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ===========================================================================
   02 — Floating Panel
   The nav floats as a rounded card over the page, with a primary action,
   soft blue active tint and a footer quota card.
   =========================================================================== */

export function SidebarFloatingPanel({ activeId, onNavigate, collapsed, onToggleCollapse }: SidebarVariantProps) {
  const parentId = useParentId(activeId);

  return (
    <aside
      aria-label="Floating Panel navigation"
      className={cn(
        'h-full min-h-0 shrink-0 bg-slate-100/70 p-3',
        collapsed ? 'w-[96px]' : 'w-[286px]'
      )}
    >
      <div className="flex h-full min-h-0 flex-col rounded-[26px] bg-white shadow-[0_24px_60px_-32px_rgba(15,23,42,0.45)] ring-1 ring-slate-200/70">
        {collapsed ? (
          <IconRail parentId={parentId} onNavigate={onNavigate} onExpand={onToggleCollapse} tone="soft" />
        ) : (
          <>
            <div className="flex items-center gap-2.5 px-4 pb-3 pt-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
                <Building2 className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-semibold tracking-tight text-slate-900">Nexus 360</p>
                <p className="truncate text-[10.5px] font-medium text-slate-400">Enterprise FinTech</p>
              </div>
              <button
                type="button"
                onClick={onToggleCollapse}
                title="Collapse sidebar"
                className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 px-4 pb-3">
              <div className="flex h-10 items-center gap-2 rounded-2xl bg-slate-100/80 px-3">
                <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <input
                  placeholder="Search customers…"
                  className="w-full bg-transparent text-[12px] font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <button
                type="button"
                className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-[12.5px] font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:from-blue-600 hover:to-blue-700 active:scale-[0.99]"
              >
                <Plus className="h-4 w-4" />
                New Customer
              </button>
            </div>

            <nav className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 pb-3">
              {SIDEBAR_NAV.map((group) => (
                <div key={group.label}>
                  <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {group.label}
                  </p>
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <FloatingRow
                        key={item.id}
                        item={item}
                        activeId={activeId}
                        parentId={parentId}
                        onNavigate={onNavigate}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <div className="p-3">
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-slate-50 p-3 ring-1 ring-blue-100">
                <div className="flex items-center justify-between">
                  <p className="text-[11.5px] font-semibold text-slate-900">Review queue</p>
                  <span className="text-[11px] font-bold tabular-nums text-blue-600">18/25</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white">
                  <span className="block h-full w-[72%] rounded-full bg-gradient-to-r from-blue-500 to-blue-600" />
                </div>
                <button
                  type="button"
                  className="mt-2.5 inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-blue-700 transition hover:text-blue-800"
                >
                  Open queue
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

function FloatingRow({
  item,
  activeId,
  parentId,
  onNavigate,
}: {
  item: SidebarItem;
  activeId: string;
  parentId: string;
  onNavigate: (id: string) => void;
}) {
  const Icon = item.icon;
  const [open, setOpen] = useExpanded(item, activeId);
  const isActive = item.id === activeId;
  const holdsActive = item.id === parentId && !isActive;
  const highlighted = isActive || holdsActive;

  return (
    <div>
      <button
        type="button"
        aria-expanded={item.children ? open : undefined}
        onClick={() => (item.children ? setOpen(!open) : onNavigate(item.id))}
        className={cn(
          'flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-2xl px-2.5 text-[12.5px] font-semibold transition',
          isActive
            ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
            : holdsActive
              ? 'text-blue-700'
              : 'text-slate-600 hover:bg-slate-50'
        )}
      >
        <span
          className={cn(
            'grid h-8 w-8 shrink-0 place-items-center rounded-xl transition',
            highlighted
              ? 'bg-white text-blue-600 shadow-[0_6px_16px_-8px_rgba(37,99,235,0.8)]'
              : 'bg-slate-100 text-slate-500'
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="flex-1 truncate text-left">{item.label}</span>
        {item.badge && (
          <span
            className={cn(
              'rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
              highlighted ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
            )}
          >
            {item.badge}
          </span>
        )}
        {item.children && (
          <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 transition-transform', !open && '-rotate-90')} />
        )}
      </button>

      {item.children && open && (
        <div className="ml-[42px] mt-1 space-y-0.5">
          {item.children.map((child) => {
            const on = child.id === activeId;
            return (
              <button
                key={child.id}
                type="button"
                onClick={() => onNavigate(child.id)}
                className={cn(
                  'flex h-8 w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 text-[12px] transition',
                  on ? 'bg-blue-50 font-semibold text-blue-700' : 'font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 shrink-0 rounded-full transition',
                    on ? 'bg-blue-600' : 'bg-slate-300'
                  )}
                />
                <span className="flex-1 truncate text-left">{child.label}</span>
                {child.badge && (
                  <span className="text-[10px] font-bold tabular-nums text-slate-400">{child.badge}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ===========================================================================
   03 — Editorial Minimal
   No chrome: hairline rules, typographic hierarchy, a 2px blue bar for the
   active row and monospace shortcut hints.
   =========================================================================== */

export function SidebarEditorialMinimal({ activeId, onNavigate, collapsed, onToggleCollapse }: SidebarVariantProps) {
  const parentId = useParentId(activeId);

  if (collapsed) {
    return (
      <aside aria-label="Editorial Minimal navigation" className="h-full min-h-0 border-r border-slate-200/70 bg-white">
        <IconRail parentId={parentId} onNavigate={onNavigate} onExpand={onToggleCollapse} tone="soft" />
      </aside>
    );
  }

  return (
    <aside
      aria-label="Editorial Minimal navigation"
      className="flex h-full min-h-0 w-[264px] shrink-0 flex-col border-r border-slate-200/70 bg-white"
    >
      <div className="flex items-center justify-between gap-2 px-5 pb-4 pt-5">
        <div className="flex items-baseline gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
          <span className="text-[15px] font-semibold tracking-tight text-slate-900">Nexus</span>
          <span className="text-[15px] font-light tracking-tight text-slate-400">360</span>
        </div>
        <button
          type="button"
          onClick={onToggleCollapse}
          title="Collapse sidebar"
          className="grid h-7 w-7 cursor-pointer place-items-center rounded-md text-slate-300 transition hover:bg-slate-50 hover:text-slate-600"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
      </div>

      <div className="px-5 pb-4">
        <button
          type="button"
          className="flex w-full cursor-pointer items-center gap-2 border-b border-slate-200 pb-2 text-left text-[12px] font-medium text-slate-400 transition hover:border-blue-500 hover:text-slate-600"
        >
          <Search className="h-3.5 w-3.5" />
          Search
          <span className="ml-auto font-mono text-[10px] tracking-tight text-slate-300">⌘K</span>
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto pb-4">
        {SIDEBAR_NAV.map((group, index) => (
          <div key={group.label} className={cn('px-3', index > 0 && 'mt-5 border-t border-slate-100 pt-5')}>
            <p className="px-2 pb-2 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              {group.label}
            </p>
            <div>
              {group.items.map((item) => (
                <EditorialRow
                  key={item.id}
                  item={item}
                  activeId={activeId}
                  parentId={parentId}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-600" />
          </span>
          All systems operational
        </div>
        <div className="mt-3 flex items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-900 text-[10.5px] font-semibold text-white">
            VH
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-semibold text-slate-900">Visal Heng</p>
            <p className="truncate text-[10.5px] text-slate-400">Senior Reviewer</p>
          </div>
          <Settings className="h-3.5 w-3.5 shrink-0 text-slate-300" />
        </div>
      </div>
    </aside>
  );
}

function EditorialRow({
  item,
  activeId,
  parentId,
  onNavigate,
}: {
  item: SidebarItem;
  activeId: string;
  parentId: string;
  onNavigate: (id: string) => void;
}) {
  const Icon = item.icon;
  const [open, setOpen] = useExpanded(item, activeId);
  const isActive = item.id === activeId;
  const holdsActive = item.id === parentId && !isActive;

  return (
    <div>
      <button
        type="button"
        aria-expanded={item.children ? open : undefined}
        onClick={() => (item.children ? setOpen(!open) : onNavigate(item.id))}
        className={cn(
          'group relative flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 text-[12.5px] transition',
          isActive
            ? 'bg-blue-50/60 font-semibold text-blue-700'
            : holdsActive
              ? 'font-semibold text-blue-700'
              : 'font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        )}
      >
        {isActive && <span className="absolute -left-1 h-5 w-[2px] rounded-full bg-blue-600" />}
        <Icon
          className={cn(
            'h-[15px] w-[15px] shrink-0 transition',
            isActive || holdsActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
          )}
          strokeWidth={1.75}
        />
        <span className="flex-1 truncate text-left">{item.label}</span>
        {item.badge && (
          <span
            className={cn(
              'font-mono text-[10px] font-semibold tabular-nums',
              isActive || holdsActive ? 'text-blue-600' : 'text-slate-400'
            )}
          >
            {item.badge}
          </span>
        )}
        {item.hint && !item.badge && !item.children && (
          <span className="font-mono text-[10px] text-slate-300 opacity-0 transition group-hover:opacity-100">
            {item.hint}
          </span>
        )}
        {item.children && (
          <ChevronDown
            className={cn('h-3 w-3 shrink-0 text-slate-400 transition-transform', !open && '-rotate-90')}
          />
        )}
      </button>

      {item.children && open && (
        <div className="ml-[19px] border-l border-slate-200 pl-3">
          {item.children.map((child) => {
            const on = child.id === activeId;
            return (
              <button
                key={child.id}
                type="button"
                onClick={() => onNavigate(child.id)}
                className={cn(
                  'relative flex h-8 w-full cursor-pointer items-center rounded-md px-2 text-[12px] transition',
                  on
                    ? 'font-semibold text-blue-700'
                    : 'font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                {on && <span className="absolute -left-[13px] h-4 w-[2px] rounded-full bg-blue-600" />}
                <span className="flex-1 truncate text-left">{child.label}</span>
                {child.badge && (
                  <span
                    className={cn(
                      'font-mono text-[10px] tabular-nums',
                      on ? 'text-blue-600' : 'text-slate-300'
                    )}
                  >
                    {child.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ===========================================================================
   04 — Aurora Glow
   Blue gradient wash, glass cards, gradient icon tiles for the active row.
   =========================================================================== */

export function SidebarAuroraGlow({ activeId, onNavigate, collapsed, onToggleCollapse }: SidebarVariantProps) {
  const parentId = useParentId(activeId);

  return (
    <aside
      aria-label="Aurora Glow navigation"
      className={cn(
        'relative h-full min-h-0 shrink-0 overflow-hidden border-r border-blue-100/70 bg-gradient-to-b from-blue-50 via-white to-white',
        collapsed ? 'w-[72px]' : 'w-[276px]'
      )}
    >
      {/* Aurora wash */}
      <div className="pointer-events-none absolute -left-16 -top-24 h-64 w-64 rounded-full bg-blue-400/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-1/3 h-56 w-56 rounded-full bg-sky-300/20 blur-3xl" />

      {collapsed ? (
        <div className="relative">
          <IconRail parentId={parentId} onNavigate={onNavigate} onExpand={onToggleCollapse} tone="soft" />
        </div>
      ) : (
        <div className="relative flex h-full min-h-0 flex-col">
          <div className="flex items-center gap-3 px-4 pb-4 pt-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white shadow-[0_14px_30px_-10px_rgba(37,99,235,0.7)]">
              <Building2 className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold tracking-tight text-slate-900">Nexus 360</p>
              <p className="truncate text-[10.5px] font-semibold uppercase tracking-[0.12em] text-blue-600">
                Enterprise
              </p>
            </div>
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Collapse sidebar"
              className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-xl bg-white/70 text-slate-400 ring-1 ring-white/80 backdrop-blur transition hover:text-blue-600"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
          </div>

          <div className="px-4 pb-4">
            <div className="flex h-10 items-center gap-2 rounded-2xl bg-white/70 px-3 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.6)] ring-1 ring-white/90 backdrop-blur">
              <Search className="h-3.5 w-3.5 shrink-0 text-blue-500" />
              <input
                placeholder="Search anything…"
                className="w-full bg-transparent text-[12px] font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <nav className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 pb-3">
            {SIDEBAR_NAV.map((group) => (
              <div key={group.label}>
                <div className="flex items-center gap-2 px-3 pb-2">
                  <span className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {group.label}
                  </span>
                  <span className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <AuroraRow
                      key={item.id}
                      item={item}
                      activeId={activeId}
                      parentId={parentId}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="p-3">
            <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 p-3.5 text-white shadow-[0_20px_40px_-20px_rgba(37,99,235,0.8)]">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <p className="text-[12px] font-semibold">KYC Shield active</p>
              </div>
              <p className="mt-1 text-[10.5px] leading-relaxed text-blue-100">
                12 onboarding files screened automatically today.
              </p>
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/25">
                <span className="block h-full w-[64%] rounded-full bg-white" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2.5 rounded-2xl bg-white/70 p-2 ring-1 ring-white/80 backdrop-blur">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-[10.5px] font-semibold text-white">
                VH
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-slate-900">Visal Heng</p>
                <p className="truncate text-[10.5px] text-slate-500">Senior Reviewer</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function AuroraRow({
  item,
  activeId,
  parentId,
  onNavigate,
}: {
  item: SidebarItem;
  activeId: string;
  parentId: string;
  onNavigate: (id: string) => void;
}) {
  const Icon = item.icon;
  const [open, setOpen] = useExpanded(item, activeId);
  const isActive = item.id === activeId;
  const holdsActive = item.id === parentId && !isActive;
  const highlighted = isActive || holdsActive;

  return (
    <div>
      <button
        type="button"
        aria-expanded={item.children ? open : undefined}
        onClick={() => (item.children ? setOpen(!open) : onNavigate(item.id))}
        className={cn(
          'flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-2xl px-2.5 text-[12.5px] font-semibold transition',
          isActive
            ? 'bg-white text-blue-700 shadow-[0_14px_30px_-16px_rgba(37,99,235,0.85)] ring-1 ring-blue-100'
            : holdsActive
              ? 'text-blue-700 hover:bg-white/60'
              : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
        )}
      >
        <span
          className={cn(
            'grid h-8 w-8 shrink-0 place-items-center rounded-xl transition',
            highlighted
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-600/35'
              : 'bg-white/80 text-slate-500 ring-1 ring-slate-200/70'
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="flex-1 truncate text-left">{item.label}</span>
        {item.badge && (
          <span
            className={cn(
              'rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
              highlighted ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'
            )}
          >
            {item.badge}
          </span>
        )}
        {item.children && (
          <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 transition-transform', !open && '-rotate-90')} />
        )}
      </button>

      {item.children && open && (
        <div className="ml-[42px] mt-1 space-y-0.5">
          {item.children.map((child) => {
            const on = child.id === activeId;
            return (
              <button
                key={child.id}
                type="button"
                onClick={() => onNavigate(child.id)}
                className={cn(
                  'flex h-8 w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 text-[12px] transition',
                  on
                    ? 'bg-white font-semibold text-blue-700 shadow-[0_10px_24px_-18px_rgba(37,99,235,0.9)] ring-1 ring-blue-100'
                    : 'font-medium text-slate-500 hover:bg-white/60 hover:text-slate-900'
                )}
              >
                <CircleDot
                  className={cn('h-3 w-3 shrink-0 transition', on ? 'text-blue-600' : 'text-slate-300')}
                />
                <span className="flex-1 truncate text-left">{child.label}</span>
                {child.badge && (
                  <span
                    className={cn(
                      'text-[10px] font-bold tabular-nums',
                      on ? 'text-blue-600' : 'text-slate-400'
                    )}
                  >
                    {child.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ===========================================================================
   05 — Dock Tiles
   A wide tile dock (icon over label) plus a context column carrying the
   selected section's sub-items and pinned records.
   =========================================================================== */

const PINNED = [
  { id: 'pin-1', name: 'Eleanor Vance', meta: 'CID-009021 · VIP' },
  { id: 'pin-2', name: 'Marcus Oduya', meta: 'CID-008873 · IPO' },
  { id: 'pin-3', name: 'Sasha Lindqvist', meta: 'CID-008120 · Client Card' },
];

export function SidebarDockTiles({ activeId, onNavigate, collapsed, onToggleCollapse }: SidebarVariantProps) {
  const parentId = useParentId(activeId);
  const parent = FLAT_ITEMS.find((item) => item.id === parentId);

  if (collapsed) {
    return (
      <aside aria-label="Dock Tiles navigation" className="h-full min-h-0 border-r border-slate-200/80 bg-white">
        <IconRail parentId={parentId} onNavigate={onNavigate} onExpand={onToggleCollapse} tone="solid" />
      </aside>
    );
  }

  return (
    <aside aria-label="Dock Tiles navigation" className="flex h-full min-h-0 bg-white">
      {/* Tile dock */}
      <div className="flex w-[116px] shrink-0 flex-col border-r border-slate-200/80 bg-slate-50/70">
        <div className="flex flex-col items-center gap-1 px-2.5 pb-3 pt-4">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-600/30">
            <Building2 className="h-[18px] w-[18px]" />
          </span>
          <p className="text-[10.5px] font-semibold tracking-tight text-slate-900">Nexus 360</p>
        </div>

        <nav className="min-h-0 flex-1 space-y-3 overflow-y-auto px-2 pb-3">
          {SIDEBAR_NAV.map((group) => (
            <div key={group.label}>
              <p className="pb-1.5 text-center text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {group.label.split(' ')[0]}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const on = item.id === parentId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      title={item.label}
                      onClick={() => onNavigate(item.children?.[0].id ?? item.id)}
                      className={cn(
                        'relative flex w-full cursor-pointer flex-col items-center gap-1.5 rounded-2xl px-1 py-2.5 transition',
                        on
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-600/30'
                          : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                      )}
                    >
                      <Icon className={cn('h-[18px] w-[18px]', on ? 'text-white' : 'text-slate-400')} />
                      <span className="w-full truncate px-1 text-center text-[10px] font-semibold leading-none">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          className={cn(
                            'absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[9px] font-bold tabular-nums',
                            on ? 'bg-white text-blue-700' : 'bg-blue-600 text-white'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="flex flex-col items-center gap-2 border-t border-slate-200/80 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-[11px] font-semibold text-white">
            VH
          </span>
        </div>
      </div>

      {/* Context column */}
      <div className="flex w-[228px] shrink-0 flex-col border-r border-slate-200/80">
        <div className="flex items-start justify-between gap-2 px-4 pb-3 pt-4">
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-semibold tracking-tight text-slate-900">
              {parent?.label ?? 'Workspace'}
            </p>
            <p className="mt-0.5 truncate text-[10.5px] font-medium text-blue-600">
              {parent?.children ? `${parent.children.length} sections` : 'Overview'}
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Collapse sidebar"
            className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 pb-3">
          {parent?.children && (
            <div className="space-y-0.5">
              {parent.children.map((child) => {
                const on = child.id === activeId;
                return (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => onNavigate(child.id)}
                    className={cn(
                      'relative flex h-9 w-full cursor-pointer items-center gap-2 rounded-xl px-3 text-[12.5px] transition',
                      on
                        ? 'bg-blue-50 font-semibold text-blue-700'
                        : 'font-medium text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    )}
                  >
                    {on && <span className="absolute left-0 h-5 w-[3px] rounded-r-full bg-blue-600" />}
                    <span className="flex-1 truncate text-left">{child.label}</span>
                    {child.badge && (
                      <span
                        className={cn(
                          'rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
                          on ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                        )}
                      >
                        {child.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 px-3 pb-1.5">
              <Clock3 className="h-3 w-3 text-slate-400" />
              <span className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-slate-400">Pinned</span>
            </div>
            <div className="space-y-0.5">
              {PINNED.map((record) => (
                <button
                  key={record.id}
                  type="button"
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition hover:bg-slate-100/80"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-blue-50 text-[10px] font-semibold text-blue-700">
                    {record.name
                      .split(' ')
                      .map((part) => part[0])
                      .join('')}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-semibold text-slate-800">{record.name}</span>
                    <span className="block truncate text-[10px] text-slate-400">{record.meta}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200/80 p-3">
          <button
            type="button"
            className="flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 text-[12px] font-semibold text-white shadow-md shadow-blue-600/25 transition hover:bg-blue-700 active:scale-[0.99]"
          >
            <Plus className="h-3.5 w-3.5" />
            New Customer
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ===========================================================================
   06 — Section Cards
   Dense console layout: every group is its own collapsible white card on a
   tinted canvas, with a 3px blue marker on the active row.
   =========================================================================== */

const ENVIRONMENTS = ['PROD', 'UAT'];

export function SidebarSectionCards({ activeId, onNavigate, collapsed, onToggleCollapse }: SidebarVariantProps) {
  const parentId = useParentId(activeId);
  const [env, setEnv] = React.useState('PROD');

  if (collapsed) {
    return (
      <aside
        aria-label="Section Cards navigation"
        className="h-full min-h-0 border-r border-slate-200/80 bg-slate-50"
      >
        <IconRail parentId={parentId} onNavigate={onNavigate} onExpand={onToggleCollapse} tone="soft" />
      </aside>
    );
  }

  return (
    <aside
      aria-label="Section Cards navigation"
      className="flex h-full min-h-0 w-[272px] shrink-0 flex-col border-r border-slate-200/80 bg-slate-100/60"
    >
      <div className="space-y-2.5 px-3 pb-3 pt-3.5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/25">
            <Building2 className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold tracking-tight text-slate-900">Nexus Console</p>
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Core Banking
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Collapse sidebar"
            className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-1 rounded-xl bg-white p-1 ring-1 ring-slate-200/70">
          {ENVIRONMENTS.map((name) => {
            const on = name === env;
            return (
              <button
                key={name}
                type="button"
                aria-pressed={on}
                onClick={() => setEnv(name)}
                className={cn(
                  'flex-1 cursor-pointer rounded-lg py-1.5 text-[10.5px] font-bold tracking-wide transition',
                  on ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25' : 'text-slate-500 hover:text-slate-900'
                )}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>

      <nav className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-3 pb-3">
        {SIDEBAR_NAV.map((group) => (
          <SectionCard
            key={group.label}
            group={group}
            activeId={activeId}
            parentId={parentId}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="border-t border-slate-200/70 bg-white/70 px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-600 text-[10.5px] font-semibold text-white">
            VH
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11.5px] font-semibold text-slate-900">Visal Heng</p>
            <p className="truncate text-[10px] text-slate-400">Senior Reviewer · v2.8.1</p>
          </div>
          <Settings className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        </div>
      </div>
    </aside>
  );
}

function SectionCard({
  group,
  activeId,
  parentId,
  onNavigate,
}: {
  group: SidebarGroup;
  activeId: string;
  parentId: string;
  onNavigate: (id: string) => void;
}) {
  const [open, setOpen] = React.useState(true);
  const holdsActive = group.items.some((item) => item.id === parentId);

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl bg-white ring-1 transition',
        holdsActive ? 'ring-blue-100' : 'ring-slate-200/70'
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 transition hover:bg-slate-50"
      >
        <span className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-slate-400">{group.label}</span>
        <span className="rounded-full bg-slate-100 px-1.5 text-[9.5px] font-bold tabular-nums text-slate-500">
          {group.items.length}
        </span>
        <ChevronDown
          className={cn('ml-auto h-3 w-3 shrink-0 text-slate-400 transition-transform', !open && '-rotate-90')}
        />
      </button>

      {open && (
        <div className="space-y-0.5 px-2 pb-2">
          {group.items.map((item) => (
            <SectionRow key={item.id} item={item} activeId={activeId} parentId={parentId} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
}

function SectionRow({
  item,
  activeId,
  parentId,
  onNavigate,
}: {
  item: SidebarItem;
  activeId: string;
  parentId: string;
  onNavigate: (id: string) => void;
}) {
  const Icon = item.icon;
  const [open, setOpen] = useExpanded(item, activeId);
  const isActive = item.id === activeId;
  const holdsActive = item.id === parentId && !isActive;

  return (
    <div>
      <button
        type="button"
        aria-expanded={item.children ? open : undefined}
        onClick={() => (item.children ? setOpen(!open) : onNavigate(item.id))}
        className={cn(
          'relative flex h-8 w-full cursor-pointer items-center gap-2 rounded-lg pl-2.5 pr-2 text-[12px] font-semibold transition',
          isActive
            ? 'bg-blue-50 text-blue-700'
            : holdsActive
              ? 'text-blue-700 hover:bg-blue-50/60'
              : 'text-slate-600 hover:bg-slate-50'
        )}
      >
        {isActive && <span className="absolute left-0 h-4 w-[3px] rounded-r-full bg-blue-600" />}
        <Icon
          className={cn('h-[14px] w-[14px] shrink-0', isActive || holdsActive ? 'text-blue-600' : 'text-slate-400')}
        />
        <span className="flex-1 truncate text-left">{item.label}</span>
        {item.badge && (
          <span
            className={cn(
              'rounded px-1 py-0.5 text-[9.5px] font-bold tabular-nums',
              isActive || holdsActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
            )}
          >
            {item.badge}
          </span>
        )}
        {item.children && (
          <ChevronDown className={cn('h-3 w-3 shrink-0 transition-transform', !open && '-rotate-90')} />
        )}
      </button>

      {item.children && open && (
        <div className="mt-0.5 space-y-0.5 rounded-lg bg-slate-50/80 p-1">
          {item.children.map((child) => {
            const on = child.id === activeId;
            return (
              <button
                key={child.id}
                type="button"
                onClick={() => onNavigate(child.id)}
                className={cn(
                  'flex h-7 w-full cursor-pointer items-center gap-2 rounded-md pl-[26px] pr-2 text-[11.5px] transition',
                  on
                    ? 'bg-white font-semibold text-blue-700 shadow-sm ring-1 ring-blue-100'
                    : 'font-medium text-slate-500 hover:bg-white hover:text-slate-900'
                )}
              >
                <span className="flex-1 truncate text-left">{child.label}</span>
                {child.badge && (
                  <span
                    className={cn('text-[9.5px] font-bold tabular-nums', on ? 'text-blue-600' : 'text-slate-400')}
                  >
                    {child.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
