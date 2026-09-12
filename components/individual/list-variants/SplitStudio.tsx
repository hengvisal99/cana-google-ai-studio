'use client';

import React from 'react';
import Image from 'next/image';
import {
  Search,
  Plus,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  FileText,
  ChevronRight,
  Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ACCOUNT_META,
  FILTER_ALL_LABELS,
  FILTER_KEYS,
  STATUS_META,
  STATUS_ORDER,
  fullName,
  money,
  shortBranch,
  since,
  useDirectory,
} from './shared';

/**
 * V3 — Split Studio.
 * Master–detail: a compact result column on the left, a full dossier preview on the
 * right. Nothing opens in a modal — selection drives the whole right pane.
 */
export function SplitStudio() {
  const d = useDirectory();
  const [selectedId, setSelectedId] = React.useState<string>(d.records[0].id);

  const selected = d.rows.find((r) => r.id === selectedId) ?? d.rows[0];

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_20px_50px_-40px_rgba(15,23,42,0.5)]">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
        <div>
          <h2 className="text-[19px] font-black tracking-tight text-slate-900">Individual Directory</h2>
          <p className="mt-0.5 text-[12px] text-slate-500">Select a record to review its dossier alongside the list.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-600/25 transition hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Add individual
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
        {/* Master column */}
        <div className="border-b border-slate-100 xl:border-b-0 xl:border-r">
          <div className="space-y-3 px-4 py-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={d.query}
                onChange={(e) => d.setQuery(e.target.value)}
                placeholder="Search directory…"
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-[13px] outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {STATUS_ORDER.map((key) => {
                const meta = STATUS_META[key];
                const active = d.status === key;
                return (
                  <button
                    key={key}
                    onClick={() => d.setStatus(key)}
                    className={cn(
                      'rounded-lg border px-2.5 py-1.5 text-[11.5px] font-bold transition',
                      active
                        ? cn(meta.bg, meta.border, meta.fg)
                        : 'border-transparent text-slate-500 hover:bg-slate-50',
                    )}
                  >
                    {key === 'ALL' ? 'All' : key}
                    <span className={cn('ml-1.5 tabular-nums', active ? 'opacity-70' : 'text-slate-400')}>
                      {d.counts[key]}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {FILTER_KEYS.map((key) => (
                <select
                  key={key}
                  value={d.filters[key]}
                  onChange={(e) => d.setFilter(key, e.target.value)}
                  className={cn(
                    'h-9 w-full cursor-pointer rounded-lg border px-2.5 text-[11.5px] font-semibold outline-none transition',
                    d.filters[key] === 'ALL'
                      ? 'border-slate-200 bg-white text-slate-500'
                      : 'border-blue-200 bg-blue-50 text-blue-700',
                  )}
                >
                  <option value="ALL">{FILTER_ALL_LABELS[key]}</option>
                  {d.options[key].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          </div>

          <div className="max-h-[560px] overflow-y-auto px-3 pb-4">
            <div className="space-y-1.5">
              {d.rows.map((item) => {
                const meta = STATUS_META[item.requestStatus];
                const active = selected?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition',
                      active
                        ? 'border-blue-200 bg-blue-50/60 shadow-sm'
                        : 'border-transparent hover:border-slate-200 hover:bg-slate-50',
                    )}
                  >
                    <span className={cn('h-9 w-1 shrink-0 rounded-full', meta.solid)} />
                    <Image
                      src={item.avatarUrl}
                      alt=""
                      width={38}
                      height={38}
                      className="h-9.5 w-9.5 shrink-0 rounded-xl object-cover ring-1 ring-slate-200"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-bold text-slate-900">{fullName(item)}</p>
                      <p className="truncate text-[11px] text-slate-500">
                        {item.customerId} · {item.requestType}
                      </p>
                    </div>
                    <ChevronRight className={cn('h-4 w-4 shrink-0', active ? 'text-blue-500' : 'text-slate-300')} />
                  </button>
                );
              })}
              {d.rows.length === 0 && (
                <div className="px-4 py-14 text-center">
                  <p className="text-[13px] font-semibold text-slate-700">Nothing matches</p>
                  <button onClick={d.reset} className="mt-2 text-[12px] font-bold text-blue-600 hover:underline">
                    Reset filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detail pane */}
        {selected ? (
          <div className="bg-gradient-to-b from-slate-50/70 to-white p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <Image
                  src={selected.avatarUrl}
                  alt=""
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white shadow-md"
                />
                <div>
                  <h3 className="text-[22px] font-black leading-tight tracking-tight text-slate-900">
                    {fullName(selected)}
                  </h3>
                  <p className="mt-0.5 text-[12.5px] text-slate-500">
                    <span className="font-mono font-semibold text-slate-600">{selected.customerId}</span> ·{' '}
                    {selected.customerType} · Onboarded {since(selected.createdAt)}
                  </p>
                  <p className="mt-2 flex flex-wrap items-center gap-1.5">
                    {(() => {
                      const meta = STATUS_META[selected.requestStatus];
                      const account = ACCOUNT_META[selected.accountStatus];
                      const Icon = meta.icon;
                      return (
                        <>
                          <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold', meta.bg, meta.border, meta.fg)}>
                            <Icon className="h-3 w-3" />
                            {selected.requestStatus} · {selected.currentWorkflowStage}
                          </span>
                          <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold', account.bg, account.border, account.fg)}>
                            <span className={cn('h-1.5 w-1.5 rounded-full', account.solid)} />
                            {selected.accountStatus}
                          </span>
                        </>
                      );
                    })()}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300">
                  Request info
                </button>
                <button className="rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-slate-800">
                  Review
                </button>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Metric label="Total deposits" value={money(selected.totalDeposits)} />
              <Metric label="Net worth" value={money(selected.netWorth)} />
              <Metric label="Risk" value={String(selected.riskCategory)} />
              <Metric label="Credit score" value={String(selected.creditScore)} />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Panel title="Contact">
                <Line icon={Mail} label="Email" value={selected.email} />
                <Line icon={Phone} label="Mobile" value={selected.mobile} />
                <Line icon={MapPin} label="Address" value={`${selected.address.city}, ${selected.address.country}`} />
                <Line icon={Briefcase} label="Branch" value={shortBranch(selected.branch)} />
              </Panel>

              <Panel title="Verification">
                <Line icon={ShieldCheck} label="ID type" value={`${selected.idType} · ${selected.idNumber}`} />
                <Line icon={ShieldCheck} label="KYC" value={selected.kycStatus.replace('_', ' ')} />
                <Line icon={FileText} label="Documents" value={`${selected.supportingDocuments.length} uploaded`} />
                <Line icon={FileText} label="Profile" value={selected.profileStatus} />
              </Panel>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Supporting documents</p>
              <ul className="mt-3 space-y-2">
                {selected.supportingDocuments.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-semibold text-slate-800">{doc.fileName}</p>
                      <p className="truncate text-[11px] text-slate-500">
                        {doc.type} · {doc.fileSize} · {doc.uploadedAt}
                      </p>
                    </div>
                    <button className="text-[11px] font-bold text-blue-600 hover:underline">View</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="grid place-items-center p-16 text-center">
            <p className="text-[13px] text-slate-500">Select a record to see its dossier.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 text-[17px] font-black tabular-nums tracking-tight text-slate-900">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{title}</p>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

function Line({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
      <div className="min-w-0">
        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="truncate text-[12.5px] font-semibold capitalize text-slate-800">{value}</p>
      </div>
    </div>
  );
}
