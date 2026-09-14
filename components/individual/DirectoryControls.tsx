'use client';

import React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Menu surface shared by the directory's search-field picker, export menu and filter selects. */
export const MENU_SURFACE = 'rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10';

/** Raised-white active state (toolbar Filter while open, active status tab). */
export const LIFTED_ACTIVE = 'bg-white shadow-[0_4px_14px_-4px_rgba(15,23,42,0.18)]';

/** Headless popover: open state, outside click and Escape. Callers own all visuals. */
export function Popover({
  className,
  trigger,
  children,
}: {
  className?: string;
  trigger: (state: { open: boolean; toggle: () => void }) => React.ReactNode;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn('relative', className)}>
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && children(() => setOpen(false))}
    </div>
  );
}

/** Small blue check marking the selected option in a menu. */
export function CheckBadge() {
  return (
    <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-blue-500 text-white">
      <Check className="h-2.5 w-2.5" strokeWidth={3} />
    </span>
  );
}

/**
 * Plain filter select: a labelled white box that looks the same whether or not a
 * value is chosen, opening a menu with "All …" first and a check on the selection.
 */
export function FilterSelect({
  id,
  label,
  allLabel,
  value,
  options,
  onChange,
}: {
  id?: string;
  label: string;
  allLabel: string;
  /** 'ALL' means no filter. */
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const items = [{ value: 'ALL', label: allLabel }, ...options.map((o) => ({ value: o, label: o }))];
  const current = items.find((i) => i.value === value) ?? items[0];

  return (
    <div>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-600">{label}</p>
      <Popover
        trigger={({ open, toggle }) => (
          <button
            id={id}
            type="button"
            onClick={toggle}
            aria-haspopup="listbox"
            aria-expanded={open}
            className={cn(
              'flex h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-xl border bg-white px-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
              open ? 'border-slate-400' : 'border-slate-200 hover:border-slate-300',
            )}
          >
            <span className="truncate text-xs font-medium text-slate-800">{current.label}</span>
            <ChevronDown className={cn('h-4 w-4 shrink-0 text-slate-400 transition-transform', open && 'rotate-180')} />
          </button>
        )}
      >
        {(close) => (
          <div role="listbox" className={cn('absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto', MENU_SURFACE)}>
            {items.map((item) => {
              const selected = item.value === value;
              return (
                <button
                  key={item.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(item.value);
                    close();
                  }}
                  className={cn(
                    'flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition',
                    selected ? 'bg-blue-50 font-bold text-blue-700' : 'font-medium text-slate-700 hover:bg-slate-50',
                  )}
                >
                  {item.label}
                  {selected && <CheckBadge />}
                </button>
              );
            })}
          </div>
        )}
      </Popover>
    </div>
  );
}
