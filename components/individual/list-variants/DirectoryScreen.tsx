'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { DirectoryTable } from './DirectoryTable';
import type { DesignKit } from './kit';
import { FILTER_ALL_LABELS, FILTER_KEYS, FILTER_LABELS, useDirectory } from './useDirectory';

/**
 * The fixed outer layout of IndividualListScreen: header card, filter card
 * (tabs + search / fields / reset) and table. Every control inside comes from
 * the kit, so designs differ per field while the layout stays identical.
 */
export function DirectoryScreen({ kit }: { kit: DesignKit }) {
  const d = useDirectory();
  const [filterOpen, setFilterOpen] = React.useState(true);
  const { Toolbar, StatusTabs, Search, Field, Summary } = kit;

  const placement = kit.resetPlacement ?? 'row';
  const resetActive = d.hasActiveFilters || Boolean(d.query);

  const summary = (active: boolean) => (
    <Summary shown={d.rows.length} total={d.records.length} onReset={d.reset} active={active} placement={placement} />
  );

  return (
    <div className={cn('relative', kit.canvas)}>
      {kit.decor}

      {/* 1. Header card */}
      <div className={cn('relative z-30', kit.headerCard)}>
        {kit.headerDecor}
        <div className="relative flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className={kit.title}>Individual Directory</h2>
            <p className={kit.subtitle}>
              Manage individual client onboarding, document verification, authorization lifecycle, and trading profiles.
            </p>
          </div>
          <Toolbar
            filterOpen={filterOpen}
            onToggleFilter={() => setFilterOpen((v) => !v)}
            hasActiveFilters={d.hasActiveFilters}
            activeFilterCount={d.activeFilterCount}
          />
        </div>
      </div>

      {/* 2. Filter card */}
      <div className={cn('relative z-20', kit.filterCard)}>
        <div className="flex flex-col items-stretch justify-between gap-3 lg:flex-row lg:items-center">
          <div className="min-w-0">
            <StatusTabs value={d.status} onChange={d.setStatus} counts={d.counts} />
          </div>
          <div className="w-full lg:max-w-lg">
            <Search query={d.query} onQuery={d.setQuery} searchBy={d.searchBy} onSearchBy={d.setSearchBy} />
          </div>
        </div>

        {filterOpen && (
          <div className="space-y-3">
            {placement === 'header' && summary(resetActive)}

            <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4', kit.fieldGrid)}>
              {FILTER_KEYS.map((key) => (
                <Field
                  key={key}
                  fieldKey={key}
                  label={FILTER_LABELS[key]}
                  allLabel={FILTER_ALL_LABELS[key]}
                  value={d.filters[key]}
                  options={d.options[key]}
                  onChange={(value) => d.setFilter(key, value)}
                />
              ))}
            </div>
          </div>
        )}

        {placement === 'row' && resetActive && summary(true)}
      </div>

      {/* 3. Table */}
      <div className={cn('relative z-10', kit.tableWrap)}>
        <DirectoryTable rows={d.rows} onReset={d.reset} skin={kit.table} />
      </div>
    </div>
  );
}
