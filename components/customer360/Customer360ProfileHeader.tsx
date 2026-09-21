'use client';

import React from 'react';
import Image from 'next/image';
import {
  Printer,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  UserCheck,
  Check,
  Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DesignTheme } from '@/types';

interface Customer360ProfileHeaderProps {
  avatarUrl?: string;
  nameKH: string;
  nameEN: string;
  cid: string;
  risk: string;
  customerType: string;
  accountStatus: string;
  occupation: string;
  phone: string;
  email: string;
  address: string;
  theme: DesignTheme;
  onPrint: () => void;
  onCopy: (text: string, key: string) => void;
  copiedKey: string | null;
  /** Recommended typography: labels medium, values regular, semibold for the name only. */
  refined?: boolean;
  /** Rendered before the avatar (e.g. a sidebar toggle). */
  leading?: React.ReactNode;
  /** Extra actions rendered before Print. */
  actions?: React.ReactNode;
}

const FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

/**
 * Every chip on the badge row shares this geometry, so the row reads as one set
 * and cannot drift again. An explicit height beats padding here: the chips hold
 * content of different heights (14px icons, 12px meter bars, 11px text) and
 * padding alone would leave them a pixel or two apart.
 *
 * Geometry is shared; colour is not. Each chip supplies its own outline, ground
 * and label so the three facts read as three kinds of fact — identity, risk,
 * classification — instead of one undifferentiated strip.
 *
 * The ground is the hierarchy: only a value that changes state earns a tinted
 * fill, and risk is the only one of the three that does. CID and customer type
 * stay on white and carry their hue in the outline and label alone, so the row
 * has one chip with weight and two that support it rather than three competing
 * blocks of colour above the name.
 */
const BADGE_BASE =
  'inline-flex h-6 shrink-0 items-center gap-1.5 rounded-md border px-2 text-[11px] font-semibold';

/**
 * Risk drawn as a 3-segment meter rather than a flat pill, so severity reads
 * at a glance without knowing the colour scale.
 */
function RiskMeter({ risk }: { risk: string }) {
  const level = risk.toLowerCase();
  const filled = level.startsWith('low') ? 1 : level.startsWith('mod') ? 2 : 3;
  const tone =
    filled === 1
      ? {
          bar: 'bg-emerald-600',
          empty: 'bg-emerald-200',
          icon: 'text-emerald-700',
          chip: 'border-emerald-300 bg-emerald-50 text-emerald-700',
        }
      : filled === 2
      ? {
          bar: 'bg-amber-600',
          empty: 'bg-amber-200',
          icon: 'text-amber-700',
          chip: 'border-amber-300 bg-amber-50 text-amber-700',
        }
      : {
          bar: 'bg-rose-600',
          empty: 'bg-rose-200',
          icon: 'text-rose-700',
          chip: 'border-rose-300 bg-rose-50 text-rose-700',
        };

  return (
    /* Risk is the one measured value, so it is the only chip that gets a
       tinted ground — and the whole tone moves with the severity. */
    <span className={cn(BADGE_BASE, tone.chip)}>
      <ShieldCheck className={cn('w-3 h-3', tone.icon)} />
      <span>{risk} Risk</span>
      <span className="ml-0.5 flex items-center gap-[2px]" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn('h-2.5 w-[3px] rounded-full', i < filled ? tone.bar : tone.empty)}
          />
        ))}
      </span>
    </span>
  );
}

/** Secondary facts: uppercase and muted, carried by outline rather than fill. */
function MutedTag({
  icon: Icon,
  tone = 'border-violet-300 bg-white text-violet-700',
  iconTone = 'text-violet-500',
  children,
}: {
  icon?: React.ElementType;
  tone?: string;
  iconTone?: string;
  children: React.ReactNode;
}) {
  return (
    /* A classification, not a measurement: uppercase and tracked out, so it
       reads as a label even while it carries full colour. */
    <span className={cn(BADGE_BASE, tone, 'uppercase tracking-wider')}>
      {Icon && <Icon className={cn('w-3 h-3 shrink-0', iconTone)} />}
      {children}
    </span>
  );
}

/** One field in the contact row: small label above the value, no icon tile. */
function DenseField({
  icon: Icon,
  label,
  value,
  copyKey,
  mono,
  clamp,
  onCopy,
  copiedKey,
  href,
  linkTitle,
  refined,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  copyKey?: string;
  href?: string;
  linkTitle?: string;
  mono?: boolean;
  clamp?: boolean;
  onCopy: (text: string, key: string) => void;
  copiedKey: string | null;
  refined?: boolean;
}) {
  const valueCls = cn('text-[13px]', refined ? 'font-normal text-slate-700' : 'font-semibold text-slate-900');
  return (
    <div className="group min-w-0 rounded-lg px-2 py-1.5 transition hover:bg-slate-50">
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 shrink-0 text-slate-500" />
        <span className={cn('text-[10px] uppercase tracking-wider text-slate-500', refined ? 'font-medium' : 'font-semibold')}>{label}</span>
        {copyKey && (
          <button
            type="button"
            onClick={() => onCopy(value, copyKey)}
            className="ml-auto cursor-pointer p-0.5 text-slate-400 opacity-0 transition hover:text-blue-600 group-hover:opacity-100"
            title={'Copy ' + label.toLowerCase()}
          >
            {copiedKey === copyKey ? (
              <Check className="w-3 h-3 text-emerald-600" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        )}
      </div>
      {href ? (
        <a
          href={href}
          className={cn(
            'mt-0.5 block hover:text-blue-600 hover:underline',
            valueCls,
            mono && 'font-mono',
            clamp ? 'line-clamp-2 break-words' : 'truncate'
          )}
          title={linkTitle || value}
        >
          {value}
        </a>
      ) : (
        <span
          className={cn(
            'mt-0.5 block',
            valueCls,
            mono && 'font-mono',
            clamp ? 'line-clamp-2 break-words' : 'truncate'
          )}
          title={value}
        >
          {value}
        </span>
      )}
    </div>
  );
}

export function Customer360ProfileHeader({
  avatarUrl,
  nameKH,
  nameEN,
  cid,
  risk,
  customerType,
  accountStatus,
  occupation,
  phone,
  email,
  address,
  theme,
  onPrint,
  onCopy,
  copiedKey,
  refined,
  leading,
  actions,
}: Customer360ProfileHeaderProps) {
  // The sidebar avatars carry this same dot, so the vocabulary is already
  // learned by the time anyone reaches the profile. The white border is the only
  // outline it needs — it separates the dot from the photo behind it, and there
  // is nothing of its own colour nearby for a second ring to tie back to.
  // Colour never travels alone: the label repeats the status for screen readers.
  const statusDot =
    accountStatus === 'Active'
      ? 'bg-emerald-500'
      : accountStatus === 'Closed'
      ? 'bg-rose-500'
      : 'bg-amber-500';

  const khmerName = (
    <span lang="km" className="font-khmer text-[15px] font-medium text-slate-500">
      {nameKH}
    </span>
  );

  // An identifier, not a status — monospace is what marks it as such now that
  // every badge shares one corner radius.
  // Identity gets the primary blue: it is the one value the rest of the screen keys off.
  const cidChip = (
    <span className={cn(BADGE_BASE, 'border-blue-300 bg-white font-mono text-blue-700')}>{cid}</span>
  );

  const badges = (
    <>
      <RiskMeter risk={risk} />
      <MutedTag icon={UserCheck}>{customerType}</MutedTag>
    </>
  );

  const printButton = (
    <button
      type="button"
      id="c360-print-btn"
      onClick={onPrint}
      className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-600 hover:shadow-sm active:scale-[0.98] active:bg-blue-700"
      title="Print Customer Dossier (Ctrl+P)"
    >
      <Printer className="w-4 h-4 text-white" />
      <span>Print</span>
    </button>
  );

  return (
    <section
      id="c360-profile-header-section"
      className={cn(
        'relative overflow-hidden border border-slate-200 bg-white p-5',
        theme === 'glassmorphism'
          ? 'rounded-2xl border-white/80 bg-white/85 shadow-md backdrop-blur-xl'
          : theme === 'aurora'
          ? 'rounded-2xl border-slate-200 shadow-md'
          : 'rounded-xl shadow-xs'
      )}
    >
      {theme === 'aurora' && (
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500" />
      )}

      {/* Profile row: photo, names, CID, badges, print */}
      <div className="flex flex-col justify-between gap-5 pb-4 md:flex-row md:items-center">
        <div className="flex items-start gap-4 sm:items-center">
          {leading}
          <div className="relative shrink-0">
            <Image
              src={avatarUrl || FALLBACK_AVATAR}
              alt={nameEN}
              width={72}
              height={72}
              className="h-15 w-15 rounded-2xl border-2 border-white object-cover shadow-md ring-2 ring-slate-100"
              referrerPolicy="no-referrer"
              unoptimized
            />
            <span
              role="img"
              aria-label={`Account status: ${accountStatus}`}
              title={`Account status: ${accountStatus}`}
              className={cn(
                'absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white shadow-2xs',
                statusDot
              )}
            />
          </div>

          <div className="space-y-1.5">
            {/* Line 1: both names, separated by a dot. Khmer carries taller
                ascent/descent metrics than Latin to fit its stacked diacritics,
                so centring the two boxes visibly drops the Khmer off the Latin
                baseline -- the scripts are aligned on that baseline instead. */}
            <div className="flex flex-wrap items-baseline gap-2.5">
              <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">{nameEN}</h1>
              <span className="text-slate-300">•</span>
              {khmerName}
            </div>

            {/* Line 2: CID leads the system attributes rather than crowding the names */}
            <div className="flex flex-wrap items-center gap-2">
              {cidChip}
              {badges}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 self-start md:self-center">
          {actions}
          {printButton}
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Contact row */}
      <div className="grid grid-cols-1 gap-x-5 gap-y-1 pt-3 sm:grid-cols-2 md:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)_minmax(0,1.15fr)_minmax(0,1.35fr)]">
        <DenseField
          icon={Briefcase}
          label="Occupation"
          value={occupation}
          onCopy={onCopy}
          copiedKey={copiedKey}
          refined={refined}
        />
        <DenseField
          icon={Phone}
          label="Phone"
          value={phone}
          copyKey="phone"
          mono
          onCopy={onCopy}
          copiedKey={copiedKey}
          refined={refined}
        />
        <DenseField
          icon={Mail}
          label="Email"
          value={email}
          copyKey="email"
          href={email && email.includes('@') ? 'mailto:' + email : undefined}
          linkTitle={'Send email to ' + email}
          onCopy={onCopy}
          copiedKey={copiedKey}
          refined={refined}
        />
        <DenseField
          icon={MapPin}
          label="Address"
          value={address}
          copyKey="address"
          clamp
          onCopy={onCopy}
          copiedKey={copiedKey}
          refined={refined}
        />
      </div>
    </section>
  );
}
