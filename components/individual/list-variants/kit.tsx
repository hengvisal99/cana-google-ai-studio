'use client';

import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Columns,
  Download,
  FileText,
  Filter,
  Globe,
  Heart,
  LayoutList,
  RotateCw,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TableSkin } from './DirectoryTable';
import type { FilterKey, SearchByField, StatusKey } from './useDirectory';

export type StatusTab = { id: StatusKey; label: string; icon: React.ElementType; color: string; solid: string };

export const STATUS_TABS: StatusTab[] = [
  { id: 'ALL', label: 'All Requests', icon: LayoutList, color: 'text-slate-500', solid: 'bg-slate-400' },
  { id: 'Approved', label: 'Approved', icon: CheckCircle2, color: 'text-emerald-500', solid: 'bg-emerald-500' },
  { id: 'Resubmit', label: 'Resubmit', icon: AlertCircle, color: 'text-amber-500', solid: 'bg-amber-500' },
  { id: 'Pending', label: 'Pending', icon: Clock, color: 'text-blue-500', solid: 'bg-blue-500' },
  { id: 'Rejected', label: 'Rejected', icon: AlertTriangle, color: 'text-rose-500', solid: 'bg-rose-500' },
];

export const TOOLBAR_ACTIONS = [
  { key: 'reload', label: 'Reload', icon: RotateCw },
  { key: 'filter', label: 'Filter', icon: Filter },
  { key: 'columns', label: 'Columns', icon: Columns },
  { key: 'export', label: 'Export', icon: Download },
] as const;

export const FIELD_ICONS: Record<FilterKey, React.ElementType> = {
  gender: Users,
  marital: Heart,
  nationality: Globe,
  requestType: FileText,
};

/** "All …" first, then the real options — the shape every field menu renders. */
export const optionList = (allLabel: string, options: string[]) => [
  { value: 'ALL', label: allLabel },
  ...options.map((o) => ({ value: o, label: o })),
];

/** "ALL FIELDS" -> "All fields" */
export const sentenceCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export type ToolbarProps = {
  filterOpen: boolean;
  onToggleFilter: () => void;
  hasActiveFilters: boolean;
  /** Number of dropdown filters currently set. */
  activeFilterCount: number;
};
export type StatusTabsProps = { value: StatusKey; onChange: (value: StatusKey) => void; counts: Record<StatusKey, number> };
export type SearchProps = {
  query: string;
  onQuery: (value: string) => void;
  searchBy: SearchByField;
  onSearchBy: (value: SearchByField) => void;
};
export type FieldProps = {
  fieldKey: FilterKey;
  label: string;
  allLabel: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

/**
 * Where the reset control lives:
 * - row: its own summary row below the fields, shown only when something is set
 * - header: a "Filters" line above the fields; reset shown only when something is set
 */
export type ResetPlacement = 'row' | 'header';

export type SummaryProps = {
  shown: number;
  total: number;
  onReset: () => void;
  /** False when there is nothing to reset (reachable for header). */
  active: boolean;
  placement: ResetPlacement;
};

/**
 * One visual design. The outer layout is fixed by DirectoryScreen; a kit supplies
 * the section surfaces plus its own component for every control inside them.
 */
export type DesignKit = {
  canvas: string;
  decor?: React.ReactNode;
  headerCard: string;
  headerDecor?: React.ReactNode;
  title: string;
  subtitle: string;
  filterCard: string;
  fieldGrid: string;
  /** Where Summary renders. Defaults to 'row'. */
  resetPlacement?: ResetPlacement;
  tableWrap: string;
  table: TableSkin;
  Toolbar: React.ComponentType<ToolbarProps>;
  StatusTabs: React.ComponentType<StatusTabsProps>;
  Search: React.ComponentType<SearchProps>;
  Field: React.ComponentType<FieldProps>;
  Summary: React.ComponentType<SummaryProps>;
};

/** Headless popover: open state, outside-click and Escape. Kits own all visuals. */
export function Dropdown({
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
