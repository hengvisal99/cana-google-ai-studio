'use client';

import React from 'react';
import { Check, Copy, Gauge, Landmark, ShieldAlert, ShieldCheck, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Individual } from '@/types';
import { Field } from '@/components/shared/DossierCard';

interface IndividualOverviewSectionProps {
  individual: Individual;
  className?: string;
}

/**
 * Two families: `info` / `accent` identify a tile, while `good` / `warn` /
 * `danger` report a state. Blue and purple are borrowed from the Customer 360
 * summary cards so the two strips read as one palette.
 */
type Tone = 'neutral' | 'info' | 'accent' | 'good' | 'warn' | 'danger';

/**
 * The tone tints the whole tile: fill, border, accent bar, icon disc and
 * value. The accent bar echoes the bar already heading each field group below.
 */
const TONE: Record<
  Tone,
  { border: string; accent: string; value: string; soft: string; iconBg: string; hover: string }
> = {
  neutral: { border: 'border-slate-200', accent: 'bg-slate-300', value: 'text-slate-900', soft: 'bg-slate-50', iconBg: 'bg-slate-200/70', hover: 'hover:border-slate-300 hover:shadow-slate-500/10' },
  info: { border: 'border-blue-200', accent: 'bg-blue-500', value: 'text-blue-700', soft: 'bg-blue-50/70', iconBg: 'bg-blue-100', hover: 'hover:border-blue-300 hover:shadow-blue-500/15' },
  accent: { border: 'border-purple-200', accent: 'bg-purple-500', value: 'text-purple-700', soft: 'bg-purple-50/70', iconBg: 'bg-purple-100', hover: 'hover:border-purple-300 hover:shadow-purple-500/15' },
  good: { border: 'border-emerald-200', accent: 'bg-emerald-500', value: 'text-emerald-700', soft: 'bg-emerald-50/70', iconBg: 'bg-emerald-100', hover: 'hover:border-emerald-300 hover:shadow-emerald-500/15' },
  warn: { border: 'border-amber-200', accent: 'bg-amber-500', value: 'text-amber-700', soft: 'bg-amber-50/70', iconBg: 'bg-amber-100', hover: 'hover:border-amber-300 hover:shadow-amber-500/15' },
  danger: { border: 'border-rose-200', accent: 'bg-rose-500', value: 'text-rose-700', soft: 'bg-rose-50/70', iconBg: 'bg-rose-100', hover: 'hover:border-rose-300 hover:shadow-rose-500/15' },
};

const RISK_TONE: Record<string, Tone> = {
  low: 'good',
  moderate: 'warn',
  medium: 'warn',
  high: 'danger',
  speculative: 'danger',
};

/**
 * One value in the focus strip: the things staff act on before reading the
 * record. The tinted fill and icon disc give the strip enough weight to hold
 * the eye against the white record surface below.
 */
function FocusTile({
  label,
  value,
  icon: Icon,
  tone = 'neutral',
  valueClassName,
}: {
  label: string;
  value?: React.ReactNode;
  icon: LucideIcon;
  tone?: Tone;
  valueClassName?: string;
}) {
  const isEmpty = value === undefined || value === null || value === '';
  const t = TONE[tone];

  return (
    <div
      className={cn(
        // Read-only tile: hover lifts and tints it, but no pointer cursor.
        'group/tile relative overflow-hidden rounded-xl border pl-5 pr-4 py-4 min-w-0 flex items-center gap-3.5',
        'transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        t.border,
        t.soft,
        t.hover
      )}
    >
      <span
        className={cn('absolute inset-y-0 left-0 w-1 transition-[width] duration-200 group-hover/tile:w-1.5', t.accent)}
        aria-hidden="true"
      />
      <span
        className={cn(
          'grid h-10 w-10 shrink-0 place-items-center rounded-full transition-transform duration-200 group-hover/tile:scale-110 motion-reduce:group-hover/tile:scale-100',
          t.iconBg,
          t.value
        )}
        aria-hidden="true"
      >
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        {/* Labels stay uniformly muted so the tone reads on the value alone. */}
        <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <div
          className={cn('mt-1.5 text-base font-semibold leading-tight truncate', t.value, valueClassName)}
          title={typeof value === 'string' ? value : undefined}
        >
          {isEmpty ? <span className="text-slate-400">-</span> : value}
        </div>
      </div>
    </div>
  );
}

/**
 * A field whose value staff routinely copy out -- contact details and the
 * address. The button only surfaces on hover or keyboard focus, so the grid
 * stays as quiet as the plain `Field`s beside it.
 */
function CopyField({
  label,
  value,
  className,
  valueClassName,
}: {
  label: string;
  value?: string;
  className?: string;
  valueClassName?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  // Nothing to copy: fall back to the plain field so the empty dash matches.
  if (!value || !value.trim()) {
    return <Field label={label} value={value} className={className} valueClassName={valueClassName} />;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // Clipboard is unavailable outside secure contexts -- the value is still
      // selectable by hand, so fail quietly rather than alerting.
    }
  };

  return (
    <div className={cn('group/copy min-w-0', className)}>
      <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <div className="mt-1 flex items-start gap-1.5">
        <div
          className={cn('text-sm text-slate-900 break-words min-w-0', valueClassName)}
          title={value}
        >
          {value}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          title={copied ? 'Copied' : `Copy ${label.toLowerCase()}`}
          aria-label={copied ? `${label} copied` : `Copy ${label.toLowerCase()}`}
          className="shrink-0 rounded-md p-1 -m-0.5 text-slate-400 opacity-0 transition cursor-pointer hover:text-blue-600 hover:bg-blue-50 group-hover/copy:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-blue-500"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * A labelled run of fields inside the single record surface. The label plus a
 * hairline is all the separation the groups need -- it is the one thing the
 * card walls were buying, at a fraction of the space.
 */
function FieldGroup({
  title,
  divided = false,
  children,
}: {
  title: string;
  /** Draw the hairline that separates this group from the one above it. */
  divided?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(divided && 'border-t border-slate-100 pt-5')}>
      <div className="flex items-center gap-2">
        <span className="h-3.5 w-1 shrink-0 rounded-full bg-blue-500" />
        <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-700">
          {title}
        </h3>
      </div>
      {/* Three, not four: Personal's nine fields fill exactly three rows, so
          nothing is left stranded beside the address. */}
      <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-5">
        {children}
      </div>
    </div>
  );
}

export function IndividualOverviewSection({
  individual,
  className,
}: IndividualOverviewSectionProps) {
  const fullNameKH =
    individual.fullNameKH ||
    [individual.givenNameKH, individual.surnameKH].filter(Boolean).join(' ');

  const addressStr = individual.address
    ? [
        individual.address.street,
        individual.address.city,
        individual.address.state,
        individual.address.country,
      ]
        .filter(Boolean)
        .join(', ')
    : '';

  const mobile = individual.mobile || individual.phone;
  const telephone = individual.telephone || individual.employment?.officeTelephone;
  const email = individual.email;

  const risk = individual.riskCategory || individual.riskRating;
  const riskTone = RISK_TONE[String(risk || '').toLowerCase()];

  const isIncomplete = individual.profileStatus === 'Incomplete';
  const applicationDate = individual.investorIdInfo?.applicationDate;

  return (
    <div className={cn('space-y-5 animate-in fade-in duration-200', className)}>
      {/* ----------------------------------------------------------------
          1. Focus strip -- the four categorical values that decide how this
             customer is handled. Tiles rather than label/value rows so they
             read at a glance instead of having to be searched for.
         ---------------------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <FocusTile
          label="Profile Status"
          value={individual.profileStatus}
          icon={isIncomplete ? ShieldAlert : ShieldCheck}
          tone={isIncomplete ? 'warn' : 'good'}
        />
        <FocusTile
          label="Customer Type"
          value={individual.customerType}
          icon={UserRound}
          tone="info"
        />
        <FocusTile
          label="Risk Category"
          value={risk}
          icon={Gauge}
          tone={riskTone}
          valueClassName="capitalize"
        />
        <FocusTile
          label="Trading Account"
          value={individual.tradingAccountInfo?.tradingAccountNumber}
          icon={Landmark}
          tone="accent"
          valueClassName="font-mono"
        />
      </div>

      {/* ----------------------------------------------------------------
          2. The full record, on one surface. Two cards left the right-hand
             one half empty (4 fields against 9), so the groups become quiet
             labels inside a single borderless section instead. Four columns
             keeps all 13 fields inside four rows -- no scroll.
         ---------------------------------------------------------------- */}
      <section className="bg-white rounded-xl shadow-2xs p-5 space-y-5">
        <FieldGroup title="Personal Information">
          <Field label="Full Name KH" value={fullNameKH} />
          <Field label="Date of Birth" value={individual.dateOfBirth} />
          <Field label="Gender" value={individual.gender} />
          <Field label="Marital Status" value={individual.maritalStatus} />

          <Field label="Nationality" value={individual.nationality} />
          <CopyField label="Email" value={email} />
          <CopyField label="Mobile" value={mobile} />
          <CopyField label="Telephone" value={telephone} />

          {/* One column like every other field -- a spanning value reads as
              though it has run into the neighbouring column's space. */}
          <CopyField label="Address" value={addressStr} valueClassName="line-clamp-3" />
        </FieldGroup>

        {/* Risk Category is the conclusion these three fields feed, which is
            why it sits in the strip above and they sit here as the evidence. */}
        <FieldGroup title="Investor Profile" divided>
          <Field label="Securities Knowledge" value={individual.securitiesKnowledge} />
          <Field label="Investment Experience" value={individual.investmentExperience} />
          <Field label="Education Background" value={individual.educationBackground} />
          <Field label="Application Date" value={applicationDate} />
        </FieldGroup>
      </section>
    </div>
  );
}
