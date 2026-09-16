'use client';

import React, { useState } from 'react';
import { Maximize2, Sparkles } from 'lucide-react';
import { INITIAL_INDIVIDUALS } from '@/lib/data';
import { INITIAL_CUSTOMER_TYPE_RECORDS } from '@/lib/customer-type-records';
import { CustomerTypeViewDialog } from '@/components/customer/CustomerTypeViewDialog';

const records = INITIAL_CUSTOMER_TYPE_RECORDS;
const customers = INITIAL_INDIVIDUALS;
// IND-9021 (Eleanor Vance) holds a record for every customer type
const record = records.find((r) => r.customerId === 'IND-9021') ?? records[0];
const noop = () => {};

/** Scratch page for the customer type view dialog. */
export default function CustomerViewDesignsPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#eef2f7]">
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[72rem] items-center gap-3 px-4 py-3.5 sm:px-8">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/25">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="leading-none">
            <h1 className="text-[15px] font-semibold tracking-tight text-slate-900">Customer type view</h1>
            <p className="mt-1.5 text-[11.5px] text-slate-500">
              Click the tabs, open a record from the IPO table, or view the whole thing as a real dialog.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="ml-auto inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-[12px] font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            Open as dialog
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[72rem] px-4 py-8 sm:px-8">
        <CustomerTypeViewDialog
          embedded
          record={record}
          records={records}
          customers={customers}
          onClose={noop}
        />
      </div>

      {isOpen && (
        <CustomerTypeViewDialog
          record={record}
          records={records}
          customers={customers}
          onClose={() => setIsOpen(false)}
        />
      )}
    </main>
  );
}
