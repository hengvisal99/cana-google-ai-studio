'use client';

import React from 'react';
import Image from 'next/image';
import { Check, Clock, X, MoreVertical, Eye, Edit3, Lock, Trash2, FileText, Tags, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AccountStatus, Individual } from '@/types';
import { RowActionMenu, useRowActionMenu, type RowAction } from '@/components/shared/RowActionMenu';
import { SortableHeader, sortRows, useTableSort, type SortValue } from '@/components/shared/SortableHeader';

export type TableSkin = 'aurora' | 'command' | 'split' | 'bento' | 'editorial' | 'prism';

type SkinTokens = {
  container: string;
  head: string;
  headStrong: string;
  body: string;
  row: string;
  id: string;
  kh: string;
  nameHover: string;
};

/**
 * Visual skin only. Column order, cells and badges are identical to the production
 * table in IndividualListScreen so every design keeps the current table layout.
 */
const SKINS: Record<TableSkin, SkinTokens> = {
  aurora: {
    container: 'bg-white',
    head: 'border-b border-slate-100 bg-slate-50/70 text-slate-500',
    headStrong: 'text-slate-700',
    body: 'divide-y divide-slate-100',
    row: 'hover:bg-blue-50/40',
    id: 'text-slate-700',
    kh: 'text-blue-600/80',
    nameHover: 'group-hover:text-blue-600',
  },
  command: {
    container: 'bg-white',
    head: 'border-b border-slate-100 bg-white font-mono text-slate-400',
    headStrong: 'text-slate-500',
    body: 'divide-y divide-slate-50',
    row: 'hover:bg-slate-50/80',
    id: 'text-slate-700',
    kh: 'text-blue-600/70',
    nameHover: 'group-hover:text-blue-600',
  },
  split: {
    container: 'rounded-2xl border border-blue-100 bg-white',
    head: 'border-b border-blue-100 bg-blue-50/70 text-blue-900/50',
    headStrong: 'text-blue-900/80',
    body: 'divide-y divide-blue-50',
    row: 'hover:bg-blue-50/50',
    id: 'text-slate-700',
    kh: 'text-blue-700/80',
    nameHover: 'group-hover:text-blue-700',
  },
  bento: {
    container: 'rounded-3xl border border-white bg-white shadow-sm',
    head: 'border-b border-slate-100 bg-slate-50 text-slate-400',
    headStrong: 'text-slate-600',
    body: 'divide-y divide-slate-100',
    row: 'hover:bg-blue-50/40',
    id: 'text-slate-700',
    kh: 'text-blue-600/80',
    nameHover: 'group-hover:text-blue-700',
  },
  editorial: {
    container: 'bg-transparent',
    head: 'border-b-2 border-slate-900 bg-transparent text-slate-400',
    headStrong: 'text-slate-900',
    body: 'divide-y divide-slate-200',
    row: 'hover:bg-white',
    id: 'text-slate-700',
    kh: 'text-blue-600/70',
    nameHover: 'group-hover:text-blue-600',
  },
  prism: {
    container: 'rounded-[20px] border border-slate-200/60 bg-white shadow-[0_10px_40px_-28px_rgba(15,23,42,0.35)]',
    head: 'border-b border-slate-100 bg-slate-50/70 text-slate-500',
    headStrong: 'text-slate-700',
    body: 'divide-y divide-slate-100',
    row: 'hover:bg-slate-50/70',
    id: 'text-slate-700',
    kh: 'text-blue-600/80',
    nameHover: 'group-hover:text-blue-600',
  },
};

export function DirectoryTable({
  rows,
  skin,
}: {
  rows: Individual[];
  skin: TableSkin;
}) {
  const s = SKINS[skin];
  const { sort, toggle: toggleSort } = useTableSort();
  const sortedRows = React.useMemo(() => sortRows(rows, sort, sortValue), [rows, sort]);
  const rowMenu = useRowActionMenu();
  const menuItem = rowMenu.menu ? rows.find((item) => item.id === rowMenu.menu!.rowId) : undefined;

  return (
    <div className={cn('overflow-hidden', s.container)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left text-xs">
          <thead>
            <tr className={cn('text-[10px] font-semibold uppercase tracking-wider', s.head)}>
              <SortableHeader label="Customer ID" sortKey="customerId" sort={sort} onSort={toggleSort} className={cn('px-4 py-3 text-left font-semibold', s.headStrong)} />
              <SortableHeader label="Full Name (EN / KH)" sortKey="name" sort={sort} onSort={toggleSort} className={cn('px-4 py-3 text-left font-semibold', s.headStrong)} />
              <SortableHeader label="Profile Status" sortKey="profileStatus" sort={sort} onSort={toggleSort} className="px-4 py-3" />
              <SortableHeader label="Account Status" sortKey="accountStatus" sort={sort} onSort={toggleSort} className="px-4 py-3" />
              <SortableHeader label="Request" sortKey="request" sort={sort} onSort={toggleSort} className={cn('min-w-[160px] px-4 py-3 text-left font-semibold', s.headStrong)} />
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className={s.body}>
            {sortedRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileText className="h-8 w-8 text-slate-300" />
                    <p className="font-semibold text-slate-600">No record found</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedRows.map((item) => (
                <tr
                  key={item.id}
                  onContextMenu={(e) => rowMenu.openFromContextMenu(item.id, e)}
                  className={cn('group transition-[background-color]', s.row)}
                >

                  <td className={cn('px-4 py-3.5 font-mono font-semibold', s.id)}>
                    {item.customerId || item.id}
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <Image
                        src={item.avatarUrl}
                        alt={item.firstName}
                        width={36}
                        height={36}
                        className="h-9 w-9 shrink-0 rounded-full border border-slate-200 object-cover"
                        referrerPolicy="no-referrer"
                        unoptimized
                      />
                      <div>
                        <div className={cn('font-semibold text-slate-900 transition-colors', s.nameHover)}>
                          {item.fullNameEN || `${item.firstName} ${item.lastName}`}
                        </div>
                        <div className={cn('text-[11px] font-medium', s.kh)}>
                          {item.fullNameKH || 'ឈ្មោះខ្មែរ'}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <ProfileStatusBadge status={item.profileStatus} />
                  </td>

                  <td className="px-4 py-3.5">
                    <AccountStatusBadge status={item.accountStatus} />
                  </td>

                  <td className="px-4 py-3.5">
                    <RequestBadge item={item} />
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <button
                      type="button"
                      {...rowMenu.triggerProps(item.id)}
                      className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                      title="Actions (or right-click the row)"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {rowMenu.menu && menuItem && (
        <RowActionMenu anchor={rowMenu.menu.anchor} actions={demoActions(menuItem)} onClose={rowMenu.close} />
      )}
    </div>
  );
}

function sortValue(item: Individual, key: string): SortValue {
  switch (key) {
    case 'customerId': return item.customerId || item.id;
    case 'name': return item.fullNameEN || `${item.firstName} ${item.lastName}`;
    case 'profileStatus': return item.profileStatus;
    case 'accountStatus': return item.accountStatus || 'Not Opened';
    case 'request': return item.requestStatus;
    default: return null;
  }
}

/** Design preview only: the actions do nothing */
function demoActions(item: Individual): RowAction[] {
  const noop = () => {};
  return [
    { id: 'view', label: 'View', icon: Eye, iconClassName: 'text-blue-600', shortcut: 'V', onSelect: noop },
    { id: 'edit', label: 'Edit', icon: Edit3, iconClassName: 'text-amber-600', shortcut: 'E', onSelect: noop },
    { id: 'customer-type', label: 'Customer Type', icon: Tags, iconClassName: 'text-indigo-600', shortcut: 'T', onSelect: noop },
    { id: 'resend-email', label: 'Resend Email', icon: Mail, iconClassName: 'text-sky-600', shortcut: 'M', onSelect: noop },
    ...(item.accountStatus === 'Active'
      ? [{ id: 'close-account', label: 'Close Account', icon: Lock, iconClassName: 'text-purple-600', shortcut: 'C', onSelect: noop }]
      : []),
    { id: 'delete', label: 'Delete', icon: Trash2, iconClassName: 'text-rose-500', shortcut: 'D', danger: true, group: 1, onSelect: noop },
  ];
}

function ProfileStatusBadge({ status }: { status: 'Completed' | 'Incomplete' }) {
  return (
    <span className="inline-flex select-none items-center gap-1.5 text-xs font-medium text-slate-700">
      <span className={cn('h-2 w-2 shrink-0 rounded-full', status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-400')} />
      <span>{status}</span>
    </span>
  );
}

function AccountStatusBadge({ status }: { status?: AccountStatus }) {
  if (status === 'Active') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
        Active
      </span>
    );
  }
  if (status === 'Closed') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
        <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
        Closed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      Not Opened
    </span>
  );
}

function RequestBadge({ item }: { item: Individual }) {
  const isApproved = item.requestStatus === 'Approved' || item.currentWorkflowStage === 'Approved';
  const isRejected = item.requestStatus === 'Rejected' || item.currentWorkflowStage === 'Rejected';
  const isResubmit = item.requestStatus === 'Resubmit' || item.currentWorkflowStage === 'Resubmit';
  const isPending = item.requestStatus === 'Pending' || (!isApproved && !isRejected && !isResubmit);

  const requestType = item.requestType || 'Registration';
  const stage = item.currentWorkflowStage || 'SR';

  const [Icon, iconClass, label, showStage] = isApproved
    ? [Check, 'text-emerald-600', 'Approved', false]
    : isPending
      ? [Clock, 'text-amber-600', 'Pending', true]
      : isRejected
        ? [X, 'text-rose-600', 'Rejected', true]
        : [Clock, 'text-amber-600', 'Resubmit', true];

  return (
    <div className="flex select-none items-start gap-2.5 py-0.5 text-left">
      <div className="mt-0.5 shrink-0">
        <Icon className={cn('h-4 w-4', iconClass)} strokeWidth={isApproved || isRejected ? 2.5 : 2.2} />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1 leading-tight">
          <span className="text-[13px] font-semibold text-slate-900">{label}</span>
          {showStage && (
            <>
              <span className="text-xs font-semibold text-slate-400">·</span>
              <span className="text-xs font-semibold text-slate-600">{stage}</span>
            </>
          )}
        </div>
        <span className="mt-0.5 text-[11px] font-normal leading-tight text-slate-500">{requestType}</span>
      </div>
    </div>
  );
}
