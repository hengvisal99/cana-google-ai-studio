'use client';

import { useMemo, useState } from 'react';
import { INITIAL_INDIVIDUALS } from '@/lib/data';
import type { Individual, RequestStatus } from '@/types';

export type StatusKey = 'ALL' | RequestStatus;
export type FilterKey = 'gender' | 'marital' | 'nationality' | 'requestType';
export type SearchByField = 'all' | 'customerName' | 'accountNo' | 'roName' | 'roId';

export const FILTER_KEYS: FilterKey[] = ['gender', 'marital', 'nationality', 'requestType'];

export const FILTER_LABELS: Record<FilterKey, string> = {
  gender: 'Gender',
  marital: 'Marital Status',
  nationality: 'Nationality',
  requestType: 'Request Type',
};

export const FILTER_ALL_LABELS: Record<FilterKey, string> = {
  gender: 'All Genders',
  marital: 'All Marital Statuses',
  nationality: 'All Nationalities',
  requestType: 'All Request Types',
};

/** Mirrors SEARCH_FIELD_OPTIONS in IndividualListScreen. */
export const SEARCH_FIELD_OPTIONS: { id: SearchByField; label: string; placeholder: string }[] = [
  { id: 'all', label: 'ALL FIELDS', placeholder: 'RUN ID SEARCH' },
  { id: 'customerName', label: 'CUSTOMER NAME', placeholder: 'SEARCH CUSTOMER NAME' },
  { id: 'accountNo', label: 'ACCOUNT NO', placeholder: 'SEARCH ACCOUNT NO' },
  { id: 'roName', label: 'RO NAME', placeholder: 'SEARCH RO NAME' },
  { id: 'roId', label: 'RO ID', placeholder: 'SEARCH RO ID' },
];

/** Value of each filter on a record. */
const FILTER_VALUE: Record<FilterKey, (r: Individual) => string> = {
  gender: (r) => r.gender,
  marital: (r) => r.maritalStatus,
  nationality: (r) => r.nationality,
  requestType: (r) => r.requestType,
};

/** Same field matching as the production list screen. */
function matchesSearch(item: Individual, searchBy: SearchByField, query: string) {
  const haystack =
    searchBy === 'customerName'
      ? `${item.fullNameEN || ''} ${item.fullNameKH || ''} ${item.firstName || ''} ${item.lastName || ''} ${item.surnameEN || ''} ${item.givenNameEN || ''} ${item.surnameKH || ''} ${item.givenNameKH || ''}`
      : searchBy === 'accountNo'
        ? `${item.tradingAccountInfo?.tradingAccountNumber || ''} ${item.banking?.accountNumber || ''} ${item.banking?.savingAccount || ''} ${item.investorIdInfo?.investorIdNumber || ''}`
        : searchBy === 'roName'
          ? `${item.tradingAccountInfo?.currentAssignedSR || ''} ${item.tradingAccountInfo?.accountCheckedBy || ''} ${item.tradingAccountInfo?.accountApprovedBy || ''}`
          : searchBy === 'roId'
            ? `${item.tradingAccountInfo?.currentAssignedSR || ''} ${item.customerId || ''} ${item.id || ''} ${item.idNumber || ''}`
            : `${item.customerId || ''} ${item.id || ''} ${item.fullNameEN || ''} ${item.fullNameKH || ''} ${item.firstName || ''} ${item.lastName || ''} ${item.email || ''} ${item.tradingAccountInfo?.tradingAccountNumber || ''} ${item.tradingAccountInfo?.currentAssignedSR || ''} ${item.banking?.accountNumber || ''} ${item.idNumber || ''}`;
  return haystack.toLowerCase().includes(query);
}

const uniq = (values: string[]) => Array.from(new Set(values)).sort();

const NO_FILTERS: Record<FilterKey, string> = { gender: 'ALL', marital: 'ALL', nationality: 'ALL', requestType: 'ALL' };

/** Filtering state shared by every design, so only the visuals differ between them. */
export function useDirectory(records: Individual[] = INITIAL_INDIVIDUALS) {
  const [status, setStatus] = useState<StatusKey>('ALL');
  const [query, setQuery] = useState('');
  const [searchBy, setSearchBy] = useState<SearchByField>('all');
  const [filters, setFilters] = useState<Record<FilterKey, string>>(NO_FILTERS);

  const options = useMemo(
    () => Object.fromEntries(FILTER_KEYS.map((k) => [k, uniq(records.map(FILTER_VALUE[k]))])) as Record<FilterKey, string[]>,
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
      if (FILTER_KEYS.some((k) => filters[k] !== 'ALL' && FILTER_VALUE[k](r) !== filters[k])) return false;
      if (status !== 'ALL' && r.requestStatus !== status) return false;
      return !q || matchesSearch(r, searchBy, q);
    });
  }, [records, status, query, searchBy, filters]);

  const setFilter = (key: FilterKey, value: string) => setFilters((prev) => ({ ...prev, [key]: value }));

  const activeFilterCount = FILTER_KEYS.filter((k) => filters[k] !== 'ALL').length;
  const hasActiveFilters = activeFilterCount > 0;

  const reset = () => {
    setFilters(NO_FILTERS);
    setQuery('');
  };

  return {
    records,
    rows,
    counts,
    options,
    status,
    setStatus,
    query,
    setQuery,
    searchBy,
    setSearchBy,
    filters,
    setFilter,
    hasActiveFilters,
    activeFilterCount,
    reset,
  };
}
