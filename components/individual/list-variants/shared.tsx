'use client';

import React, { useMemo, useState } from 'react';
import { CheckCircle2, Clock, AlertCircle, AlertTriangle, LayoutList } from 'lucide-react';
import { INITIAL_INDIVIDUALS } from '@/lib/data';
import type { Individual, RequestStatus } from '@/types';

/** Every variant renders the same live records so layouts stay comparable. */
export const RECORDS: Individual[] = INITIAL_INDIVIDUALS;

export type StatusKey = 'ALL' | RequestStatus;

export const STATUS_ORDER: StatusKey[] = ['ALL', 'Approved', 'Resubmit', 'Pending', 'Rejected'];

type StatusStyle = {
  label: string;
  icon: React.ElementType;
  /** Foreground for text + icon. */
  fg: string;
  /** Tinted surface. */
  bg: string;
  /** Border for the tinted surface. */
  border: string;
  /** Solid dot / bar. */
  solid: string;
};

export const STATUS_META: Record<StatusKey, StatusStyle> = {
  ALL: {
    label: 'All Requests',
    icon: LayoutList,
    fg: 'text-slate-700',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    solid: 'bg-slate-400',
  },
  Approved: {
    label: 'Approved',
    icon: CheckCircle2,
    fg: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    solid: 'bg-emerald-500',
  },
  Resubmit: {
    label: 'Resubmit',
    icon: AlertCircle,
    fg: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    solid: 'bg-amber-500',
  },
  Pending: {
    label: 'Pending',
    icon: Clock,
    fg: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    solid: 'bg-blue-500',
  },
  Rejected: {
    label: 'Rejected',
    icon: AlertTriangle,
    fg: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    solid: 'bg-rose-500',
  },
};

export const ACCOUNT_META: Record<string, { fg: string; bg: string; border: string; solid: string }> = {
  Active: { fg: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', solid: 'bg-emerald-500' },
  Closed: { fg: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', solid: 'bg-purple-500' },
  'Not Opened': { fg: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200', solid: 'bg-slate-400' },
};

export function fullName(item: Individual) {
  return item.fullNameEN || `${item.givenNameEN} ${item.surnameEN}`.trim();
}

export function initials(item: Individual) {
  return `${item.givenNameEN?.[0] ?? ''}${item.surnameEN?.[0] ?? ''}`.toUpperCase();
}

export function shortBranch(branch: string) {
  return branch.replace(/\s*\(.*\)\s*$/, '');
}

export function money(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: value >= 1_000_000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 1_000_000 ? 1 : 0,
  }).format(value);
}

export function since(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Deterministic pastel per record, so avatars keep their identity across variants. */
export function accentFor(item: Individual) {
  const palette = [
    'from-blue-500 to-indigo-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-500',
    'from-violet-500 to-purple-500',
    'from-cyan-500 to-sky-500',
  ];
  const seed = item.customerId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return palette[seed % palette.length];
}

const uniq = (values: string[]) => Array.from(new Set(values)).sort();

export type FilterKey = 'gender' | 'marital' | 'nationality' | 'requestType';

/** Shared filtering behaviour — identical logic behind six different layouts. */
export function useDirectory(records: Individual[] = RECORDS) {
  const [status, setStatus] = useState<StatusKey>('ALL');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Record<FilterKey, string>>({
    gender: 'ALL',
    marital: 'ALL',
    nationality: 'ALL',
    requestType: 'ALL',
  });

  const options = useMemo(
    () => ({
      gender: uniq(records.map((r) => r.gender)),
      marital: uniq(records.map((r) => r.maritalStatus)),
      nationality: uniq(records.map((r) => r.nationality)),
      requestType: uniq(records.map((r) => r.requestType)),
    }),
    [records],
  );

  const counts = useMemo(() => {
    const base: Record<StatusKey, number> = { ALL: records.length, Approved: 0, Resubmit: 0, Pending: 0, Rejected: 0 };
    records.forEach((r) => {
      base[r.requestStatus] += 1;
    });
    return base;
  }, [records]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter((r) => {
      if (status !== 'ALL' && r.requestStatus !== status) return false;
      if (filters.gender !== 'ALL' && r.gender !== filters.gender) return false;
      if (filters.marital !== 'ALL' && r.maritalStatus !== filters.marital) return false;
      if (filters.nationality !== 'ALL' && r.nationality !== filters.nationality) return false;
      if (filters.requestType !== 'ALL' && r.requestType !== filters.requestType) return false;
      if (!q) return true;
      return [r.customerId, fullName(r), r.email, r.nationality, r.relationshipManager]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [records, status, query, filters]);

  const setFilter = (key: FilterKey, value: string) => setFilters((prev) => ({ ...prev, [key]: value }));

  const activeFilters = Object.values(filters).filter((v) => v !== 'ALL').length + (query.trim() ? 1 : 0);

  const reset = () => {
    setFilters({ gender: 'ALL', marital: 'ALL', nationality: 'ALL', requestType: 'ALL' });
    setQuery('');
    setStatus('ALL');
  };

  return { records, rows, status, setStatus, query, setQuery, filters, setFilter, options, counts, activeFilters, reset };
}

export type Directory = ReturnType<typeof useDirectory>;

export const FILTER_LABELS: Record<FilterKey, string> = {
  gender: 'Gender',
  marital: 'Marital status',
  nationality: 'Nationality',
  requestType: 'Request type',
};

export const FILTER_ALL_LABELS: Record<FilterKey, string> = {
  gender: 'All genders',
  marital: 'All marital statuses',
  nationality: 'All nationalities',
  requestType: 'All request types',
};

export const FILTER_KEYS: FilterKey[] = ['gender', 'marital', 'nationality', 'requestType'];
