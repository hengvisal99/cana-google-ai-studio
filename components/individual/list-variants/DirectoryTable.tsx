'use client';

import React from 'react';
import Image from 'next/image';
import { Check, Clock, X, MoreVertical, Eye, Edit3, Lock, Trash2, FileText, Tags, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AccountStatus, Individual } from '@/types';

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
    id: 'text-blue-600',
    kh: 'text-blue-600/80',
    nameHover: 'group-hover:text-blue-600',
  },
  command: {
    container: 'bg-white',
    head: 'border-b border-slate-100 bg-white font-mono text-slate-400',
    headStrong: 'text-slate-500',
    body: 'divide-y divide-slate-50',
    row: 'hover:bg-slate-50/80',
    id: 'text-blue-600',
    kh: 'text-blue-600/70',
    nameHover: 'group-hover:text-blue-600',
  },
  split: {
    container: 'rounded-2xl border border-blue-100 bg-white',
    head: 'border-b border-blue-100 bg-blue-50/70 text-blue-900/50',
    headStrong: 'text-blue-900/80',
    body: 'divide-y divide-blue-50',
    row: 'hover:bg-blue-50/50',
    id: 'text-blue-700',
    kh: 'text-blue-700/80',
    nameHover: 'group-hover:text-blue-700',
  },
  bento: {
    container: 'rounded-3xl border border-white bg-white shadow-sm',
    head: 'border-b border-slate-100 bg-slate-50 text-slate-400',
    headStrong: 'text-slate-600',
    body: 'divide-y divide-slate-100',
    row: 'hover:bg-blue-50/40',
    id: 'text-blue-600',
    kh: 'text-blue-600/80',
    nameHover: 'group-hover:text-blue-700',
  },
  editorial: {
    container: 'bg-transparent',
    head: 'border-b-2 border-slate-900 bg-transparent text-slate-400',
    headStrong: 'text-slate-900',
    body: 'divide-y divide-slate-200',
    row: 'hover:bg-white',
    id: 'text-blue-600 underline decoration-blue-200 underline-offset-4',
    kh: 'text-blue-600/70',
    nameHover: 'group-hover:text-blue-600',
  },
  prism: {
    container: 'rounded-[20px] border border-slate-200/60 bg-white shadow-[0_10px_40px_-28px_rgba(15,23,42,0.35)]',
    head: 'border-b border-slate-100 bg-slate-50/70 text-slate-500',
    headStrong: 'text-slate-700',
    body: 'divide-y divide-slate-100',
    row: 'hover:bg-slate-50/70',
    id: 'text-blue-600',
    kh: 'text-blue-600/80',
    nameHover: 'group-hover:text-blue-600',
  },
};

export function DirectoryTable({
  rows,
  onReset,
  skin,
}: {
  rows: Individual[];
  onReset: () => void;
  skin: TableSkin;
}) {
  const s = SKINS[skin];
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  return (
    <div className={cn('overflow-hidden', s.container)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left text-xs">
          <thead>
            <tr className={cn('text-[10px] font-semibold uppercase tracking-wider', s.head)}>
              <th className="w-12 px-3 py-3 text-center">No</th>
              <th className={cn('px-4 py-3 text-left font-bold', s.headStrong)}>Customer ID</th>
              <th className={cn('px-4 py-3 text-left font-bold', s.headStrong)}>Full Name (EN / KH)</th>
              <th className="px-4 py-3">Profile Status</th>
              <th className="px-4 py-3">Account Status</th>
              <th className={cn('min-w-[160px] px-4 py-3 text-left font-bold', s.headStrong)}>Request</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className={s.body}>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileText className="h-8 w-8 text-slate-300" />
                    <p className="font-semibold text-slate-600">No individual records found</p>
                    <p className="text-xs text-slate-400">Try adjusting your status tab, search terms, or filter criteria.</p>
                    <button onClick={onReset} className="mt-2 text-xs font-bold text-blue-600 hover:underline">
                      Reset filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((item, index) => (
                <tr key={item.id} className={cn('group transition-colors', s.row)}>
                  <td className="px-3 py-3.5 text-center font-mono text-[11px] text-slate-400">{index + 1}</td>

                  <td className={cn('px-4 py-3.5 font-mono font-bold', s.id)}>
                    <span className="cursor-pointer hover:underline">{item.customerId || item.id}</span>
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
                        <div className={cn('font-bold text-slate-900 transition-colors', s.nameHover)}>
                          {item.fullNameEN || `${item.firstName} ${item.lastName}`}
                        </div>
                        <div className={cn('font-khmer text-[11px] font-medium', s.kh)}>
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
                    <div className="relative inline-block text-left">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                        className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                        title="Actions"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {openMenuId === item.id && (
                        <div
                          className="absolute right-0 z-30 mt-1 w-48 rounded-xl border border-slate-200 bg-white py-1.5 text-xs text-slate-700 shadow-xl"
                          onMouseLeave={() => setOpenMenuId(null)}
                        >
                          <MenuItem icon={Eye} iconClass="text-blue-600" label="View" onClick={() => setOpenMenuId(null)} />
                          <MenuItem icon={Edit3} iconClass="text-amber-600" label="Edit" onClick={() => setOpenMenuId(null)} />
                          <MenuItem icon={Tags} iconClass="text-indigo-600" label="Customer Type" onClick={() => setOpenMenuId(null)} />
                          <MenuItem icon={Mail} iconClass="text-sky-600" label="Resend Email" onClick={() => setOpenMenuId(null)} />
                          {item.accountStatus === 'Active' && (
                            <MenuItem
                              icon={Lock}
                              iconClass="text-purple-600"
                              label="Close Account"
                              className="text-purple-700"
                              onClick={() => setOpenMenuId(null)}
                            />
                          )}
                          <div className="my-1 border-t border-slate-100" />
                          <MenuItem
                            icon={Trash2}
                            iconClass="text-rose-500"
                            label="Delete"
                            className="text-rose-600 hover:bg-rose-50"
                            onClick={() => setOpenMenuId(null)}
                          />
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  iconClass,
  label,
  className,
  onClick,
}: {
  icon: React.ElementType;
  iconClass: string;
  label: string;
  className?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn('flex w-full items-center gap-2 px-3.5 py-2 font-medium text-slate-800 hover:bg-slate-50', className)}
    >
      <Icon className={cn('h-3.5 w-3.5', iconClass)} />
      <span>{label}</span>
    </button>
  );
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
          <span className="text-[13px] font-bold text-slate-900">{label}</span>
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
