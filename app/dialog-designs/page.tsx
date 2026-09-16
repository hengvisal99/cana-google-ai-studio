'use client';

import React from 'react';
import { ApproveDialogAuroraGlass } from '@/components/shared/ApproveDialogVariants';
import { DecisionDialogMatchedMark } from '@/components/shared/DecisionDialogVariants';

const noop = () => {};

function Card({
  title,
  blurb,
  children,
}: {
  title: string;
  blurb: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <h2 className="text-[13px] font-semibold text-slate-900">{title}</h2>
        <p className="text-[12px] text-slate-500">{blurb}</p>
      </div>
      {children}
    </section>
  );
}

/** Scratch page for the three authorization dialogs. */
export default function DialogDesignsPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12">
      <div className="mx-auto max-w-[84rem]">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Authorization dialogs
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Approve, reject and resubmit, at full size. The reject and resubmit cards are live — type
          a reason, or submit empty to see the validation.
        </p>

        <div className="mt-8 grid items-start gap-x-6 gap-y-8 lg:grid-cols-2">
          <Card title="Approve" blurb="Confirmation — mark, question, name and ID badge.">
            <ApproveDialogAuroraGlass
              embedded
              customerName="Eleanor Vance"
              customerId="CID-009021"
              nextStage="Senior Review"
              onCancel={noop}
              onConfirm={noop}
            />
          </Card>

          <Card title="Reject" blurb="Reason capture — header row, rose mark.">
            <DecisionDialogMatchedMark
              embedded
              action="reject"
              onCancel={noop}
              onConfirm={noop}
            />
          </Card>

          <Card title="Resubmit" blurb="Reason capture — header row, amber mark.">
            <DecisionDialogMatchedMark
              embedded
              action="resubmit"
              onCancel={noop}
              onConfirm={noop}
            />
          </Card>
        </div>
      </div>
    </main>
  );
}
