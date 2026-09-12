'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/** Small label / value pair used across the dossier cards. */
export function Field({
  label,
  value,
  className,
  valueClassName,
}: {
  label: string;
  value?: React.ReactNode;
  className?: string;
  valueClassName?: string;
}) {
  const isEmpty =
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value.trim() === '');

  return (
    <div className={cn('min-w-0', className)}>
      <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <div className={cn('mt-1 text-sm text-slate-900 break-words', valueClassName)}>
        {isEmpty ? <span className="text-slate-400">-</span> : value}
      </div>
    </div>
  );
}

/**
 * White card with a blue accent bar heading.
 * Body is a two-column field grid by default; pass `plain` for custom content.
 */
export function DossierCard({
  title,
  plain = false,
  className,
  bodyClassName,
  action,
  children,
}: {
  title: string;
  plain?: boolean;
  className?: string;
  bodyClassName?: string;
  /** Optional controls rendered at the right end of the heading row. */
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className={cn('bg-white border border-slate-200 rounded-xl shadow-2xs p-5', className)}>
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
        {/* Height tracks the title's line box, so the bar stays proportional when a long title wraps. */}
        <span className="self-stretch min-h-4 w-1 shrink-0 rounded-full bg-blue-500" />
        <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-700">
          {title}
        </h3>
        {action && <div className="ml-auto shrink-0">{action}</div>}
      </div>
      <div
        className={cn(
          'pt-5',
          !plain && 'grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5',
          bodyClassName
        )}
      >
        {children}
      </div>
    </section>
  );
}
