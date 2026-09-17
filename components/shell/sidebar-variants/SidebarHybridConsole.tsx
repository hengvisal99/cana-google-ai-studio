'use client';

import { Building2, ChevronDown, ChevronsLeft, ChevronsRight, Search, Settings } from 'lucide-react';
import {
  SIDEBAR_NAV,
  type SidebarItem,
  type SidebarVariantProps,
  useExpanded,
  useParentId,
} from './SidebarVariants';
import { cn } from '@/lib/utils';

/* ===========================================================================
   07 — Hybrid Console
   A blend of three versions: Editorial Minimal chrome and rows for the menu,
   a solid blue pill on the parent that holds the active child, and a
   Section Cards icon rail when collapsed.
   =========================================================================== */

export function SidebarHybridConsole({ activeId, onNavigate, collapsed, onToggleCollapse }: SidebarVariantProps) {
  const parentId = useParentId(activeId);

  if (collapsed) {
    return <HybridCardRail parentId={parentId} onNavigate={onNavigate} onExpand={onToggleCollapse} />;
  }

  return (
    <aside
      aria-label="Hybrid Console navigation"
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
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <HybridRow
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

function HybridRow({
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
  // A child is selected: the parent takes a solid blue pill rather than the
  // editorial marker, so the two levels of "active" never read the same.
  const holdsActive = item.id === parentId && !isActive;

  return (
    <div>
      <button
        type="button"
        aria-expanded={item.children ? open : undefined}
        onClick={() => (item.children ? setOpen(!open) : onNavigate(item.id))}
        className={cn(
          'group relative flex h-9 w-full cursor-pointer items-center gap-2.5 px-2 text-[12.5px] transition',
          holdsActive
            ? 'rounded-xl bg-blue-600 font-semibold text-white shadow-lg shadow-blue-600/25'
            : isActive
              ? 'rounded-lg bg-blue-50/60 font-semibold text-blue-700'
              : 'rounded-lg font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        )}
      >
        {isActive && <span className="absolute -left-1 h-5 w-[2px] rounded-full bg-blue-600" />}
        <Icon
          className={cn(
            'h-[15px] w-[15px] shrink-0 transition',
            holdsActive ? 'text-white' : isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
          )}
          strokeWidth={1.75}
        />
        <span className="flex-1 truncate text-left">{item.label}</span>
        {item.badge && (
          <span
            className={cn(
              'font-mono text-[10px] font-semibold tabular-nums',
              holdsActive ? 'text-white/80' : isActive ? 'text-blue-600' : 'text-slate-400'
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
            className={cn(
              'h-3 w-3 shrink-0 transition-transform',
              holdsActive ? 'text-white/80' : 'text-slate-400',
              !open && '-rotate-90'
            )}
          />
        )}
      </button>

      {item.children && open && (
        <div className={cn('ml-[19px] border-l pl-3', holdsActive ? 'border-blue-200' : 'border-slate-200')}>
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
                  <span className={cn('font-mono text-[10px] tabular-nums', on ? 'text-blue-600' : 'text-slate-300')}>
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

/** Collapsed state borrows Section Cards: one white card per group on a tinted
    canvas. The active icon uses the Cobalt Rail tile — white, blue glyph, blue
    ring — so each card holds a tinted well for that tile to lift off. */
function HybridCardRail({
  parentId,
  onNavigate,
  onExpand,
}: {
  parentId: string;
  onNavigate: (id: string) => void;
  onExpand?: () => void;
}) {
  return (
    <aside
      aria-label="Hybrid Console navigation"
      className="flex h-full min-h-0 w-[84px] shrink-0 flex-col border-r border-slate-200/80 bg-slate-100/60"
    >
      <div className="flex flex-col items-center gap-2 px-2.5 pb-3 pt-3.5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/25">
          <Building2 className="h-4 w-4" />
        </span>
        <button
          type="button"
          onClick={onExpand}
          title="Expand sidebar"
          className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>

      <nav className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-2.5 pb-3">
        {SIDEBAR_NAV.map((group) => {
          const holdsActive = group.items.some((item) => item.id === parentId);
          return (
            <div
              key={group.label}
              className={cn(
                'overflow-hidden rounded-2xl bg-white ring-1 transition',
                holdsActive ? 'ring-blue-100' : 'ring-slate-200/70'
              )}
            >
              <p
                title={group.label}
                className="truncate px-1.5 pb-1 pt-2 text-center text-[8.5px] font-semibold uppercase tracking-[0.08em] text-slate-400"
              >
                {group.label}
              </p>
              <div className="mx-1.5 mb-1.5 space-y-1 rounded-xl bg-slate-50 p-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const on = item.id === parentId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      title={item.label}
                      aria-current={on ? 'page' : undefined}
                      onClick={() => onNavigate(item.children?.[0].id ?? item.id)}
                      className={cn(
                        'relative grid h-10 w-full cursor-pointer place-items-center rounded-xl transition',
                        on
                          ? 'bg-white text-blue-600 shadow-[0_8px_20px_-10px_rgba(37,99,235,0.6)] ring-1 ring-blue-100'
                          : 'text-slate-400 hover:bg-white/70 hover:text-slate-700'
                      )}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                      {item.badge && (
                        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-blue-600 ring-2 ring-slate-50" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-slate-200/70 bg-white/70 px-2.5 py-2.5">
        <span className="mx-auto grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-[10.5px] font-semibold text-white">
          VH
        </span>
      </div>
    </aside>
  );
}
