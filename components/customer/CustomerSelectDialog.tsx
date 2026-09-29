'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Search, Users, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Individual } from '@/types';
import { customerName } from './CustomerTypeForm';

const PAGE_SIZE = 10;

const PAGE_BTN =
  'grid h-7 min-w-7 cursor-pointer place-items-center rounded-md px-1.5 text-[11px] font-semibold tabular-nums transition disabled:cursor-not-allowed disabled:opacity-40';

const HEAD_CELL = 'px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400';

export function CustomerAvatar({ customer, size }: { customer: Individual; size: number }) {
  const name = customerName(customer);
  if (customer.avatarUrl) {
    return (
      <Image
        src={customer.avatarUrl}
        alt={name}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="shrink-0 rounded-full object-cover ring-2 ring-white"
        referrerPolicy="no-referrer"
        unoptimized
      />
    );
  }
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      style={{ width: size, height: size }}
      className="grid shrink-0 place-items-center rounded-full bg-blue-500 text-[10px] font-bold text-white ring-2 ring-white"
    >
      {initials}
    </span>
  );
}

/**
 * Customer list in a table, stacked over another dialog; clicking a row selects it.
 * Portalled to <body>: the dialog behind is transformed (zoom-in animation), which would
 * otherwise scope `fixed` to it and leave its footer uncovered.
 */
export function CustomerSelectDialog({
  customers,
  selectedId,
  onSelect,
  onClose,
}: {
  customers: Individual[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const titleId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((customer) =>
      [customer.customerId, customerName(customer), customer.fullNameKH, customer.mobile, customer.phone, customer.email]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [customers, query]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => {
    searchRef.current?.focus();
    // Capture phase + stopPropagation, so Escape closes this dialog without also closing the one behind it
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      onClose();
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in sm:items-center"

    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex w-full max-w-4xl flex-col overflow-hidden rounded-[24px] border border-white/60 bg-white/95 backdrop-blur-xl shadow-2xl shadow-indigo-900/10 animate-in fade-in zoom-in-95"
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-slate-200/60 px-6 py-5 bg-white/50">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md shadow-indigo-500/20">
            <Users className="h-5 w-5" />
          </div>
          <h3 id={titleId} className="min-w-0 flex-1 text-lg font-bold text-slate-900">
            Select Customer
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="shrink-0 px-6 pt-5">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && rows.length === 1) onSelect(rows[0].id);
              }}
              placeholder="Search ID, name, phone or email..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>
        </div>

        <div className="mx-6 mb-6 mt-5 overflow-x-auto rounded-[16px] border border-slate-200 shadow-sm bg-white">
          <table className="w-full min-w-[560px] text-xs">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200">
                <th className={HEAD_CELL}>Customer ID</th>
                <th className={HEAD_CELL}>Name</th>
                <th className={HEAD_CELL}>Phone</th>
                <th className={HEAD_CELL}>Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-10 text-center text-slate-400">
                    No customers match &ldquo;{query}&rdquo;
                  </td>
                </tr>
              ) : (
                pageRows.map((customer) => {
                  const selected = customer.id === selectedId;
                  return (
                    <tr
                      key={customer.id}
                      tabIndex={0}
                      aria-selected={selected}
                      onClick={() => onSelect(customer.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelect(customer.id);
                        }
                      }}
                      className={cn(
                        'cursor-pointer outline-none transition-colors focus-visible:bg-indigo-50/50',
                        selected ? 'bg-indigo-50/80 ring-1 ring-inset ring-indigo-200' : 'hover:bg-indigo-50/40'
                      )}
                    >
                      <td className="whitespace-nowrap px-3 py-2.5 font-mono font-semibold text-slate-700">
                        {customer.customerId}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="flex items-center gap-2.5">
                          <CustomerAvatar customer={customer} size={28} />
                          <span className="min-w-0">
                            <span className="block truncate font-semibold text-slate-800">{customerName(customer)}</span>
                            {customer.fullNameKH && (
                              <span className="block truncate text-[11px] text-slate-500">{customer.fullNameKH}</span>
                            )}
                          </span>
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-slate-600">
                        {customer.mobile || customer.phone || '—'}
                      </td>
                      <td className="max-w-[200px] truncate px-3 py-2.5 text-slate-600">{customer.email || '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pageCount > 1 && (
          <nav aria-label="Pages" className="-mt-3 mb-6 flex items-center justify-end gap-1 px-6">
            <button
              type="button"
              onClick={() => setPage((prev) => prev - 1)}
              disabled={page === 0}
              aria-label="Previous page"
              className={cn(PAGE_BTN, 'text-slate-500 hover:bg-slate-100')}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            {Array.from({ length: pageCount }, (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setPage(index)}
                aria-current={index === page ? 'page' : undefined}
                className={cn(
                  PAGE_BTN,
                  index === page ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25' : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                {index + 1}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page === pageCount - 1}
              aria-label="Next page"
              className={cn(PAGE_BTN, 'text-slate-500 hover:bg-slate-100')}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </nav>
        )}
      </div>
    </div>,
    document.body
  );
}
