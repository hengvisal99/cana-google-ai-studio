'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Check, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const GAP = 4;
const VIEWPORT_MARGIN = 8;

export interface PanelPlacement {
  style: React.CSSProperties;
  side: 'top' | 'bottom';
}

/**
 * Keeps a portalled panel pinned to its trigger: it follows scroll and resize,
 * flips above the trigger when the room below runs out, and caps its height to
 * the space actually available.
 */
export function usePanelPlacement(
  open: boolean,
  triggerRef: React.RefObject<HTMLElement | null>,
  maxHeight = 288
): PanelPlacement | null {
  const [placement, setPlacement] = useState<PanelPlacement | null>(null);

  useEffect(() => {
    if (!open) return;

    const update = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const roomBelow = window.innerHeight - rect.bottom - GAP - VIEWPORT_MARGIN;
      const roomAbove = rect.top - GAP - VIEWPORT_MARGIN;
      // Only flip when below is genuinely cramped and above is roomier.
      const flip = roomBelow < Math.min(maxHeight, 200) && roomAbove > roomBelow;

      setPlacement({
        side: flip ? 'top' : 'bottom',
        style: {
          left: rect.left,
          width: rect.width,
          maxHeight: Math.max(120, Math.min(maxHeight, flip ? roomAbove : roomBelow)),
          ...(flip ? { bottom: window.innerHeight - rect.top + GAP } : { top: rect.bottom + GAP }),
        },
      });
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      // Dropped on close so the next open measures afresh instead of flashing
      // the panel at where the trigger used to be.
      setPlacement(null);
    };
  }, [open, maxHeight, triggerRef]);

  return placement;
}

/** Closes the panel on a pointer press outside both the trigger and the panel. */
export function useDismissOnOutside(
  open: boolean,
  onDismiss: () => void,
  triggerRef: React.RefObject<HTMLElement | null>,
  panelRef: React.RefObject<HTMLElement | null>
) {
  // Held in a ref so a new inline callback each render does not resubscribe the listener.
  const dismissRef = useRef(onDismiss);
  useEffect(() => {
    dismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      dismissRef.current();
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open, triggerRef, panelRef]);
}

/** Scrolls the highlighted option into view as the keyboard walks the list. */
export function useScrollHighlightIntoView(open: boolean, activeOptionId: string | undefined) {
  useEffect(() => {
    if (!open || !activeOptionId) return;
    document.getElementById(activeOptionId)?.scrollIntoView({ block: 'nearest' });
  }, [open, activeOptionId]);
}

/** The dropdown surface shared by FormSelect and FormMultiSelect. */
export function FieldPanel({
  panelRef,
  placement,
  listId,
  multiple,
  searchable,
  query,
  onQueryChange,
  onKeyDown,
  searchPlaceholder = 'Search options…',
  children,
}: {
  panelRef: React.RefObject<HTMLDivElement | null>;
  placement: PanelPlacement;
  listId: string;
  multiple?: boolean;
  searchable?: boolean;
  query: string;
  onQueryChange: (query: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  searchPlaceholder?: string;
  children: React.ReactNode;
}) {
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchable) searchRef.current?.focus();
  }, [searchable]);

  return (
    <div
      ref={panelRef}
      style={placement.style}
      className={cn(
        'fixed z-[60] flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_16px_40px_-12px_rgba(15,23,42,0.25)]',
        'animate-in fade-in zoom-in-95 duration-100',
        placement.side === 'top' ? 'origin-bottom' : 'origin-top'
      )}
    >
      {searchable && (
        <div className="relative shrink-0 border-b border-slate-100 p-1.5">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            ref={searchRef}
            type="text"
            value={query}
            placeholder={searchPlaceholder}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={onKeyDown}
            className="h-8 w-full rounded-lg bg-slate-50 pl-7 pr-2 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>
      )}

      <div
        id={listId}
        role="listbox"
        aria-multiselectable={multiple}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1"
      >
        {children}
      </div>
    </div>
  );
}

/** One row in the panel; multi-select adds a checkbox, single-select just tints the row. */
export function FieldOptionRow({
  id,
  label,
  description,
  selected,
  highlighted,
  disabled,
  multiple,
  onSelect,
  onHover,
}: {
  id: string;
  label: string;
  description?: string;
  selected: boolean;
  highlighted: boolean;
  disabled?: boolean;
  multiple?: boolean;
  onSelect: () => void;
  onHover: () => void;
}) {
  return (
    <button
      id={id}
      type="button"
      role="option"
      aria-selected={selected}
      disabled={disabled}
      onMouseEnter={onHover}
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition',
        disabled && 'cursor-not-allowed opacity-40',
        !disabled && highlighted && 'bg-slate-50',
        selected && !multiple && 'bg-blue-50/70'
      )}
    >
      {multiple && (
        <span
          className={cn(
            'grid h-4 w-4 shrink-0 place-items-center rounded border transition',
            selected ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 bg-white'
          )}
        >
          {selected && <Check className="h-3 w-3" />}
        </span>
      )}
      <span className="min-w-0 flex-1">
        {/* Multi-select leaves the label plain — the checkbox already marks the state,
            and colouring every picked row turns the whole list blue. Single-select has
            no checkbox, so there the label is the marker. */}
        <span
          className={cn(
            'block truncate',
            selected && !multiple ? 'font-semibold text-blue-600' : 'text-slate-700'
          )}
        >
          {label}
        </span>
        {description && <span className="block truncate text-[10px] text-slate-400">{description}</span>}
      </span>
    </button>
  );
}

/** Shown when the filter matches nothing. */
export function FieldPanelEmpty({ message }: { message: string }) {
  return <p className="px-3 py-4 text-center text-xs text-slate-400">{message}</p>;
}
