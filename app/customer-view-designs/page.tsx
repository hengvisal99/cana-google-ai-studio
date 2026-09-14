'use client';

import React, { useState } from 'react';
import { Maximize2, Sparkles } from 'lucide-react';
import { INITIAL_INDIVIDUALS } from '@/lib/data';
import { INITIAL_CUSTOMER_TYPE_RECORDS } from '@/lib/customer-type-records';
import type { CustomerViewVariantProps } from '@/components/customer/view-variants/shared';
import { CustomerViewRail } from '@/components/customer/view-variants/CustomerViewRail';
import { CustomerViewBento } from '@/components/customer/view-variants/CustomerViewBento';
import { CustomerViewLedger } from '@/components/customer/view-variants/CustomerViewLedger';
import { CustomerViewCoverage } from '@/components/customer/view-variants/CustomerViewCoverage';
import { CustomerViewStandard } from '@/components/customer/view-variants/CustomerViewStandard';

type Version = {
  id: string;
  n: number;
  name: string;
  View: React.ComponentType<CustomerViewVariantProps>;
  traits: string[];
};

const VERSIONS: Version[] = [
  {
    id: 'rail',
    n: 1,
    name: 'Rail Navigator',
    View: CustomerViewRail,
    traits: ['Vertical type rail with counts', 'Key-fact strip on top', 'Fields as soft tiles'],
  },
  {
    id: 'bento',
    n: 2,
    name: 'Bento Spotlight',
    View: CustomerViewBento,
    traits: ['Segmented tab control', 'Blue hero tile with days left', 'Icon summary list'],
  },
  {
    id: 'ledger',
    n: 3,
    name: 'Ledger Timeline',
    View: CustomerViewLedger,
    traits: ['Record history timeline', 'Label / value ledger rows', 'Trading account card'],
  },
  {
    id: 'coverage',
    n: 4,
    name: 'Coverage Grid',
    View: CustomerViewCoverage,
    traits: ['Enrollment cards as tabs', 'Validity progress bar', 'Copyable summary rows'],
  },
  {
    id: 'standard',
    n: 5,
    name: 'Standard Detail',
    View: CustomerViewStandard,
    traits: ['Key stats row', 'Label / value description list', 'Activity log + action footer'],
  },
];

const records = INITIAL_CUSTOMER_TYPE_RECORDS;
const customers = INITIAL_INDIVIDUALS;
// IND-9021 (Eleanor Vance) holds a record for every customer type
const record = records.find((r) => r.customerId === 'IND-9021') ?? records[0];
const noop = () => {};

/** Scratch page: five designs of the customer type view dialog, same customer header. */
export default function CustomerViewDesignsPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  const open = VERSIONS.find((v) => v.id === openId);

  return (
    <main className="min-h-screen bg-[#eef2f7]">
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[72rem] flex-col gap-3 px-4 py-3.5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/25">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="leading-none">
              <h1 className="text-[15px] font-black tracking-tight text-slate-900">Customer type view — 5 designs</h1>
              <p className="mt-1.5 text-[11.5px] text-slate-500">
                Same customer header; tabs, body layout and styling differ. Click the tabs, or open one as a real dialog.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {VERSIONS.map((v) => (
              <a
                key={v.id}
                href={`#${v.id}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-bold text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
              >
                <span className="tabular-nums">{v.n}.</span>
                <span className="hidden sm:inline">{v.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[72rem] px-4 py-8 sm:px-8">
        <div className="space-y-14">
          {VERSIONS.map(({ id, n, name, View, traits }) => (
            <section key={id} id={id} className="scroll-mt-28">
              <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-3 gap-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-[13px] font-black tabular-nums text-blue-600">{String(n).padStart(2, '0')}</span>
                  <h2 className="text-[15px] font-black tracking-tight text-slate-900">{name}</h2>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {traits.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10.5px] font-semibold text-slate-500"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setOpenId(id)}
                  className="ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-[12px] font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  Open as dialog
                </button>
              </div>
              <div className="mt-3">
                <View embedded record={record} records={records} customers={customers} onClose={noop} />
              </div>
            </section>
          ))}
        </div>
      </div>

      {open && (
        <open.View
          key={`dialog-${open.id}`}
          record={record}
          records={records}
          customers={customers}
          onClose={() => setOpenId(null)}
        />
      )}
    </main>
  );
}
