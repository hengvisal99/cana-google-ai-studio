'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MENU_SURFACE } from '@/components/individual/DirectoryControls';

export interface RowAction {
  id: string;
  label: string;
  icon: LucideIcon;
  iconClassName: string;
  /** Single key that runs the action while the menu is open */
  shortcut: string;
  danger?: boolean;
  /** Actions are split by a divider wherever the group changes */
  group?: number;
  onSelect: () => void;
}

/** x/y is where the menu opens; flipY is its bottom edge when there is no room below */
type MenuAnchor = { x: number; y: number; flipY: number; align: 'start' | 'end' };

export type RowMenuState = { rowId: string; anchor: MenuAnchor };

const TRIGGER_ATTR = 'data-row-menu-trigger';
const EDGE = 8;

/**
 * One menu per table, opened from the three-dot button or by right-clicking a row.
 */
export function useRowActionMenu() {
  const [menu, setMenu] = useState<RowMenuState | null>(null);
  const close = useCallback(() => setMenu(null), []);

  const openFromTrigger = (rowId: string, e: React.MouseEvent<HTMLElement>) => {
    if (menu?.rowId === rowId) {
      setMenu(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setMenu({ rowId, anchor: { x: rect.right, y: rect.bottom + 4, flipY: rect.top - 4, align: 'end' } });
  };

  const openFromContextMenu = (rowId: string, e: React.MouseEvent<HTMLElement>) => {
    // Keep the browser menu where it is useful: text inputs and links
    if ((e.target as HTMLElement).closest('input, textarea, a[href]')) return;
    e.preventDefault();
    setMenu({ rowId, anchor: { x: e.clientX, y: e.clientY, flipY: e.clientY, align: 'start' } });
  };

  const triggerProps = (rowId: string) => ({
    [TRIGGER_ATTR]: rowId,
    onClick: (e: React.MouseEvent<HTMLElement>) => openFromTrigger(rowId, e),
    'aria-haspopup': 'menu' as const,
    'aria-expanded': menu?.rowId === rowId,
  });

  return { menu, close, openFromContextMenu, triggerProps };
}

/**
 * Portaled to <body> so sticky cells and overflow containers never clip it.
 */
export function RowActionMenu({
  anchor,
  actions,
  onClose,
}: {
  anchor: MenuAnchor;
  actions: RowAction[];
  onClose: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const rawLeft = anchor.align === 'end' ? anchor.x - width : anchor.x;
    const left = Math.min(Math.max(EDGE, rawLeft), window.innerWidth - width - EDGE);
    const fitsBelow = anchor.y + height <= window.innerHeight - EDGE;
    const top = fitsBelow ? anchor.y : Math.max(EDGE, anchor.flipY - height);
    setPosition({ left, top });
  }, [anchor]);

  useEffect(() => {
    menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();
  }, [anchor]);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // The trigger toggles on its own click, so leave it alone here
      if (menuRef.current?.contains(target) || target.closest(`[${TRIGGER_ATTR}]`)) return;
      onClose();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const items = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? []);
        const current = items.indexOf(document.activeElement as HTMLButtonElement);
        const step = e.key === 'ArrowDown' ? 1 : -1;
        items[(current + step + items.length) % items.length]?.focus();
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const action = actions.find((item) => item.shortcut.toLowerCase() === e.key.toLowerCase());
      if (!action) return;
      e.preventDefault();
      onClose();
      action.onSelect();
    };
    // A fixed menu would drift away from its row, so close it on any scroll or resize
    const onScroll = (e: Event) => {
      if (!menuRef.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onClose);
    window.addEventListener('blur', onClose);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onClose);
      window.removeEventListener('blur', onClose);
    };
  }, [actions, onClose]);

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      onContextMenu={(e) => e.preventDefault()}
      style={position ?? { left: 0, top: 0, visibility: 'hidden' }}
      className={cn('fixed z-[60] w-52 animate-in fade-in zoom-in-95', MENU_SURFACE)}
    >
      {actions.map((action, index) => {
        const Icon = action.icon;
        const divider = index > 0 && (actions[index - 1].group ?? 0) !== (action.group ?? 0);
        return (
          <React.Fragment key={action.id}>
            {divider && <div className="my-1 border-t border-slate-100" />}
            <button
              type="button"
              role="menuitem"
              aria-keyshortcuts={action.shortcut}
              onClick={() => {
                onClose();
                action.onSelect();
              }}
              className={cn(
                'flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium outline-none transition',
                action.danger
                  ? 'text-rose-600 hover:bg-rose-50 focus-visible:bg-rose-50'
                  : 'text-slate-700 hover:bg-slate-50 focus-visible:bg-slate-50'
              )}
            >
              <Icon className={cn('h-3.5 w-3.5 shrink-0', action.iconClassName)} />
              <span className="flex-1">{action.label}</span>
            </button>
          </React.Fragment>
        );
      })}
    </div>,
    document.body
  );
}
