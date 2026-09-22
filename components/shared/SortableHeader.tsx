'use client';

import React, { useState } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SortState = { key: string; dir: 'asc' | 'desc' } | null;

export type SortValue = string | number | null | undefined;

/**
 * One sorted column at a time. Clicking a header cycles ascending → descending → off;
 * clicking a different header starts that column at ascending.
 */
export function useTableSort() {
  const [sort, setSort] = useState<SortState>(null);
  const toggle = (key: string) =>
    setSort((prev) => {
      if (prev?.key !== key) return { key, dir: 'asc' };
      return prev.dir === 'asc' ? { key, dir: 'desc' } : null;
    });
  return { sort, toggle };
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

/** Returns rows unchanged when nothing is sorted; blank values always go last */
export function sortRows<T>(rows: T[], sort: SortState, getValue: (row: T, key: string) => SortValue): T[] {
  if (!sort) return rows;
  const factor = sort.dir === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const x = getValue(a, sort.key);
    const y = getValue(b, sort.key);
    const xBlank = x === null || x === undefined || x === '';
    const yBlank = y === null || y === undefined || y === '';
    if (xBlank || yBlank) return xBlank === yBlank ? 0 : xBlank ? 1 : -1;
    if (typeof x === 'number' && typeof y === 'number') return (x - y) * factor;
    return collator.compare(String(x), String(y)) * factor;
  });
}

export function SortableHeader({
  label,
  sortKey,
  sort,
  onSort,
  className,
}: {
  label: React.ReactNode;
  sortKey: string;
  sort: SortState;
  onSort: (key: string) => void;
  className?: string;
}) {
  const dir = sort?.key === sortKey ? sort.dir : null;
  const Icon = dir === 'asc' ? ArrowUp : dir === 'desc' ? ArrowDown : ChevronsUpDown;
  return (
    <th className={className} aria-sort={dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : 'none'}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          'group/sort inline-flex cursor-pointer items-center gap-1 uppercase tracking-[inherit] transition hover:text-slate-900',
          dir && 'text-blue-600 hover:text-blue-700'
        )}
      >
        {label}
        <Icon
          className={cn(
            'h-3 w-3 shrink-0 transition',
            dir ? 'opacity-100' : 'opacity-30 group-hover/sort:opacity-70'
          )}
        />
      </button>
    </th>
  );
}
