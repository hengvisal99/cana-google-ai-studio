'use client';

import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

/** The record id, quiet by default and copied on click */
function CopyableId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard can be blocked (insecure origin); nothing to do
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      title={copied ? 'Copied' : 'Copy id'}
      aria-label={`Copy record id ${id}`}
      className="group/id inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 font-mono text-[11px] text-slate-600 transition hover:bg-slate-200/70"
    >
      <span>{id}</span>
      {copied ? (
        <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
      ) : (
        <Copy className="hidden h-3.5 w-3.5 shrink-0 opacity-60 group-hover/id:block" />
      )}
    </button>
  );
}

/** Heading above a record's fields: blue bar, title, then the id badge on the same row */
export function SectionHead({ title, recordId }: { title: string; recordId?: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
      <span className="h-[18px] w-1 shrink-0 rounded-full bg-blue-600" />
      <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-slate-600">{title}</h3>
      {recordId && <CopyableId id={recordId} />}
    </div>
  );
}
