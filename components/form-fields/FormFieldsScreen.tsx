'use client';

import React, { useState } from 'react';
import {
  AlignLeft,
  AtSign,
  Building2,
  CalendarDays,
  CalendarRange,
  Check,
  ChevronsUpDown,
  Copy,
  FlaskConical,
  Hash,
  ListChecks,
  Phone,
  Search,
  TextCursorInput,
  User,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  FormDatePicker,
  FormInput,
  FormMultiSelect,
  FormPhone,
  FormSelect,
  FormTextarea,
  type FieldOption,
} from '@/components/ui/form';

const CARD = 'rounded-2xl border border-slate-200/70 bg-white shadow-[0_10px_40px_-28px_rgba(15,23,42,0.35)]';

/* -------------------------------------------------------------------------- */
/* Demo data                                                                  */
/* -------------------------------------------------------------------------- */

const CUSTOMER_TYPES: FieldOption[] = ['Retail', 'High Net Worth', 'Institutional', 'Corporate Officer'];

const RISK_RATINGS: FieldOption[] = [
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
  { value: 'prohibited', label: 'Prohibited', disabled: true },
];

const PRODUCTS: FieldOption[] = [
  { value: 'savings', label: 'Savings Account', description: 'Deposit product' },
  { value: 'trading', label: 'Trading Account', description: 'Securities' },
  { value: 'margin', label: 'Margin Facility', description: 'Credit line' },
  { value: 'custody', label: 'Custody Service', description: 'Safekeeping' },
  { value: 'fx', label: 'FX Settlement', description: 'Treasury' },
  { value: 'bond', label: 'Bond Subscription', description: 'Fixed income' },
  { value: 'ipo', label: 'IPO Subscription', description: 'Primary market', disabled: true },
];

/** Fixed so the demo's min/max bounds stay stable across reloads. */
const TODAY = '2026-09-18';

const BRANCHES: FieldOption[] = ['Phnom Penh HQ', 'Siem Reap', 'Battambang', 'Sihanoukville', 'Kampong Cham'];

/** Long enough that scanning it by eye is slower than typing - the case the filter box is for. */
const COUNTRIES: FieldOption[] = [
  { value: 'kh', label: 'Cambodia', description: 'KHR · +855' },
  { value: 'th', label: 'Thailand', description: 'THB · +66' },
  { value: 'vn', label: 'Vietnam', description: 'VND · +84' },
  { value: 'la', label: 'Laos', description: 'LAK · +856' },
  { value: 'mm', label: 'Myanmar', description: 'MMK · +95' },
  { value: 'sg', label: 'Singapore', description: 'SGD · +65' },
  { value: 'my', label: 'Malaysia', description: 'MYR · +60' },
  { value: 'id', label: 'Indonesia', description: 'IDR · +62' },
  { value: 'ph', label: 'Philippines', description: 'PHP · +63' },
  { value: 'cn', label: 'China', description: 'CNY · +86' },
  { value: 'jp', label: 'Japan', description: 'JPY · +81' },
  { value: 'kr', label: 'South Korea', description: 'KRW · +82' },
  { value: 'hk', label: 'Hong Kong SAR', description: 'HKD · +852' },
  { value: 'au', label: 'Australia', description: 'AUD · +61' },
  { value: 'gb', label: 'United Kingdom', description: 'GBP · +44' },
  { value: 'us', label: 'United States', description: 'USD · +1' },
  { value: 'kp', label: 'North Korea', description: 'Sanctioned', disabled: true },
];

type TabId = 'input' | 'textarea' | 'date' | 'phone' | 'select' | 'multiselect' | 'playground';

const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: 'input', label: 'FormInput', icon: TextCursorInput },
  { id: 'textarea', label: 'FormTextarea', icon: AlignLeft },
  { id: 'date', label: 'FormDatePicker', icon: CalendarRange },
  { id: 'phone', label: 'FormPhone', icon: Phone },
  { id: 'select', label: 'FormSelect', icon: ChevronsUpDown },
  { id: 'multiselect', label: 'FormMultiSelect', icon: ListChecks },
  { id: 'playground', label: 'Playground', icon: FlaskConical },
];

/* -------------------------------------------------------------------------- */
/* Documentation primitives                                                   */
/* -------------------------------------------------------------------------- */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(text).then(
          () => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          },
          () => undefined
        );
      }}
      title="Copy import"
      className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-slate-400 transition hover:bg-slate-200/70 hover:text-slate-700"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

/** One documented state: a fixed-width caption column, then the live control. */
function Row({
  name,
  note,
  full,
  children,
}: {
  name: string;
  note?: string;
  /** Let the demo use the whole column instead of the single-field width. */
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 border-t border-slate-100 px-5 py-5 md:grid-cols-[12rem_minmax(0,1fr)] md:gap-8">
      <div>
        <p className="text-xs font-semibold text-slate-800">{name}</p>
        {note && <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{note}</p>}
      </div>
      <div className={cn('min-w-0', !full && 'max-w-xs')}>{children}</div>
    </div>
  );
}

function Doc({
  icon: Icon,
  name,
  description,
  importLine,
  children,
}: {
  icon: LucideIcon;
  name: string;
  description: string;
  importLine: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn(CARD, 'overflow-hidden')}>
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h2 className="font-mono text-sm font-semibold text-slate-900">{name}</h2>
            <p className="text-xs text-slate-500">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 py-1 pl-2.5 pr-1">
          <code className="font-mono text-[10px] text-slate-500">{importLine}</code>
          <CopyButton text={importLine} />
        </div>
      </div>
      {children}
    </section>
  );
}

function ApiTable({ rows }: { rows: { name: string; type: string; description: string }[] }) {
  return (
    <details className={cn(CARD, 'group overflow-hidden')}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-3.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
        <span>Props reference</span>
        <span className="text-[10px] font-medium text-slate-400 group-open:hidden">Show</span>
        <span className="hidden text-[10px] font-medium text-slate-400 group-open:inline">Hide</span>
      </summary>
      <div className="overflow-x-auto border-t border-slate-100">
        <table className="w-full min-w-[36rem] border-collapse text-left">
          <thead className="bg-slate-50/70 text-[10px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-5 py-2 font-semibold">Prop</th>
              <th className="px-3 py-2 font-semibold">Type</th>
              <th className="px-5 py-2 font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody className="text-[11px] text-slate-600">
            {rows.map((row) => (
              <tr key={row.name} className="border-t border-slate-100">
                <td className="whitespace-nowrap px-5 py-2.5 font-mono font-semibold text-blue-600">{row.name}</td>
                <td className="whitespace-nowrap px-3 py-2.5 font-mono text-slate-500">{row.type}</td>
                <td className="px-5 py-2.5">{row.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

/* -------------------------------------------------------------------------- */
/* Screen                                                                     */
/* -------------------------------------------------------------------------- */

/** Reference page for the shared form kit: one component at a time, one state per row. */
export function FormFieldsScreen() {
  const [tab, setTab] = useState<TabId>('input');

  // FormInput
  const [fullName, setFullName] = useState('Eleanor Vance');
  const [email, setEmail] = useState('eleanor');
  const [amount, setAmount] = useState('25000');
  const [birthDate, setBirthDate] = useState('1990-01-15');
  const [search, setSearch] = useState('');

  // FormTextarea
  const [remark, setRemark] = useState('Customer prefers Khmer-language statements.');
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('Opened a premier savings account on 14 Jan.');

  // FormDatePicker
  const [dob, setDob] = useState('1990-01-15');
  const [openedOn, setOpenedOn] = useState('');
  const [valueDate, setValueDate] = useState('');
  const [maturity, setMaturity] = useState('');
  const [reviewDate, setReviewDate] = useState('2026-10-01');
  const [dateSizeDemo, setDateSizeDemo] = useState('2026-09-18');

  // FormPhone
  const [mobile, setMobile] = useState('+85512345678');
  const [officePhone, setOfficePhone] = useState('');
  const [emergency, setEmergency] = useState('');

  // FormSelect
  const [customerType, setCustomerType] = useState('Retail');
  const [branch, setBranch] = useState('');
  const [risk, setRisk] = useState('');
  const [country, setCountry] = useState('kh');
  const [currency, setCurrency] = useState('USD');
  const [officer, setOfficer] = useState('');
  const [sizeDemo, setSizeDemo] = useState('Retail');

  // FormMultiSelect
  const [products, setProducts] = useState<string[]>(['savings', 'trading']);
  const [coverage, setCoverage] = useState<string[]>([]);
  const [markets, setMarkets] = useState<string[]>(['Phnom Penh HQ', 'Siem Reap', 'Battambang', 'Kampong Cham']);
  const [limited, setLimited] = useState<string[]>(['savings']);
  const [channels, setChannels] = useState<string[]>(['Email']);

  // Playground
  const [form, setForm] = useState({ name: '', type: '', openedOn: '', products: [] as string[] });
  const [submitted, setSubmitted] = useState<string | null>(null);
  const nameError = submitted !== null && !form.name.trim() ? 'Customer name is required' : undefined;
  const typeError = submitted !== null && !form.type ? 'Pick a customer type' : undefined;
  const openedOnError = submitted !== null && !form.openedOn ? 'Pick an opening date' : undefined;
  const productsError = submitted !== null && form.products.length === 0 ? 'Select at least one product' : undefined;

  return (
    <div className="mx-auto w-full max-w-5xl pb-10">
      {/* Sticky header: title + component switcher. Frosted rather than tinted, since
          each theme shell paints a different page background behind it. */}
      <header className="sticky top-0 z-20 pb-3 backdrop-blur-md">
        <div className={cn(CARD, 'flex flex-wrap items-center justify-between gap-3 px-5 py-3.5')}>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-slate-900">Form Fields</h1>
            <p className="text-[11px] text-slate-500">
              Shared field kit — every state, live. Pick a component to see its states and props.
            </p>
          </div>
          <div className="flex max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition',
                  tab === id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-4">
        {/* ---------------------------------------------------------------- */}
        {tab === 'input' && (
          <>
            <Doc
              icon={TextCursorInput}
              name="FormInput"
              description="Text-style input — any native type, with label, hint, error, icon and suffix."
              importLine="import { FormInput } from '@/components/ui/form'"
            >
              <Row name="Default" note="Label and value, nothing else.">
                <FormInput
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                />
              </Row>

              <Row name="Required + hint" note="The asterisk marks required; the hint sits below.">
                <FormInput label="Customer ID" required hint="Format: CUS-000000" placeholder="CUS-000123" icon={User} />
              </Row>

              <Row name="Error" note="Replaces the hint, reddens the border, sets aria-invalid. Type an @ to clear it.">
                <FormInput
                  label="Email Address"
                  type="email"
                  required
                  icon={AtSign}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={email.includes('@') ? undefined : 'Enter a valid email address'}
                />
              </Row>

              <Row name="Icon + suffix" note="Icon inside the left edge, static unit inside the right.">
                <FormInput
                  label="Initial Deposit"
                  type="number"
                  icon={Hash}
                  suffix="USD"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </Row>

              <Row name="Native types" note="date, search, password — platform behaviour is kept." full>
                <div className="grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormInput
                    label="Date of Birth"
                    type="date"
                    icon={CalendarDays}
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                  />
                  <FormInput
                    label="Search"
                    type="search"
                    icon={Search}
                    placeholder="Search customers…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </Row>

              <Row name="Disabled & read-only" note="Disabled greys out; read-only stays selectable." full>
                <div className="grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormInput label="Branch Code" value="PNH-001" disabled icon={Building2} />
                  <FormInput label="Created At" value="2026-01-14 09:32" readOnly hint="Set by the system" />
                </div>
              </Row>

              <Row name="Sizes" note="sm · md (default) · lg." full>
                <div className="grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
                  <FormInput label="Small" size="sm" placeholder="h-8" />
                  <FormInput label="Medium" size="md" placeholder="h-9" />
                  <FormInput label="Large" size="lg" placeholder="h-10" />
                </div>
              </Row>
            </Doc>

            <ApiTable
              rows={[
                { name: 'label', type: 'ReactNode', description: 'Rendered above the control.' },
                { name: 'hint', type: 'ReactNode', description: 'Helper text; hidden while an error shows.' },
                { name: 'error', type: 'ReactNode', description: 'Error text; also flips the border and aria-invalid.' },
                { name: 'size', type: "'sm' | 'md' | 'lg'", description: 'Row height and text size. Default md.' },
                { name: 'icon', type: 'LucideIcon', description: 'Icon pinned inside the left edge.' },
                { name: 'suffix', type: 'ReactNode', description: 'Unit or suffix pinned inside the right edge.' },
                { name: 'containerClassName', type: 'string', description: 'Classes for the wrapper, not the input.' },
                {
                  name: '…rest',
                  type: 'InputHTMLAttributes',
                  description: 'type, value, onChange, placeholder, disabled, readOnly…',
                },
              ]}
            />
          </>
        )}

        {/* ---------------------------------------------------------------- */}
        {tab === 'textarea' && (
          <>
            <Doc
              icon={AlignLeft}
              name="FormTextarea"
              description="Multi-line text, with optional auto-grow and a character counter."
              importLine="import { FormTextarea } from '@/components/ui/form'"
            >
              <Row name="Default" note="Three rows, draggable resize handle in the corner.">
                <FormTextarea
                  label="Remark"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Anything the next officer should know…"
                />
              </Row>

              <Row name="Counter" note="showCount with maxLength; the count turns red at the limit.">
                <FormTextarea
                  label="Internal Note"
                  rows={3}
                  maxLength={120}
                  showCount
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Up to 120 characters"
                />
              </Row>

              <Row name="Auto-grow" note="autoGrow tracks the text and hides the resize handle. Add lines to see it.">
                <FormTextarea
                  label="Call Summary"
                  autoGrow
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                />
              </Row>

              <Row name="Required + error" note="Same contract as every other field.">
                <FormTextarea
                  label="Rejection Reason"
                  required
                  rows={3}
                  value=""
                  onChange={() => undefined}
                  error="A reason is required before rejecting"
                />
              </Row>

              <Row name="Disabled & read-only" note="Disabled greys out; read-only stays selectable." full>
                <div className="grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormTextarea label="Archived Note" rows={2} value="Migrated from the legacy core." disabled />
                  <FormTextarea
                    label="System Log"
                    rows={2}
                    value="Profile completed by CSO on 14 Jan 2026."
                    readOnly
                    hint="Written by the workflow"
                  />
                </div>
              </Row>

              <Row name="Sizes" note="sm · md (default) · lg." full>
                <div className="grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
                  <FormTextarea label="Small" size="sm" rows={2} placeholder="11px" />
                  <FormTextarea label="Medium" size="md" rows={2} placeholder="12px" />
                  <FormTextarea label="Large" size="lg" rows={2} placeholder="14px" />
                </div>
              </Row>
            </Doc>

            <ApiTable
              rows={[
                { name: 'rows', type: 'number', description: 'Starting height in lines. Default 3.' },
                {
                  name: 'autoGrow',
                  type: 'boolean',
                  description: 'Grows with the text and hides the resize handle.',
                },
                {
                  name: 'showCount',
                  type: 'boolean',
                  description: 'Counter on the hint row; pairs with maxLength.',
                },
                { name: 'label / hint / error / size', type: '—', description: 'Same contract as the other fields.' },
                {
                  name: '…rest',
                  type: 'TextareaHTMLAttributes',
                  description: 'value, onChange, placeholder, maxLength, disabled, readOnly…',
                },
              ]}
            />
          </>
        )}

        {/* ---------------------------------------------------------------- */}
        {tab === 'date' && (
          <>
            <Doc
              icon={CalendarRange}
              name="FormDatePicker"
              description="Single date — a react-day-picker calendar in a portalled panel, stored as YYYY-MM-DD."
              importLine="import { FormDatePicker } from '@/components/ui/form'"
            >
              <Row name="Default" note="Click or press ↓ to open; arrow keys walk the days, Esc closes.">
                <FormDatePicker label="Account Opened On" value={openedOn} onChange={setOpenedOn} />
                <p className="mt-2 font-mono text-[10px] text-slate-400">value → {openedOn ? `'${openedOn}'` : "''"}</p>
              </Row>

              <Row
                name="Month & year dropdowns"
                note="dropdowns adds month and year selects — for dates far from today, like a birth date."
              >
                <FormDatePicker
                  label="Date of Birth"
                  dropdowns
                  max={TODAY}
                  value={dob}
                  onChange={setDob}
                  hint="Future dates are disabled"
                />
              </Row>

              <Row name="Min / max" note="Days outside the range are struck through and cannot be picked.">
                <FormDatePicker
                  label="Value Date"
                  min="2026-09-01"
                  max="2026-09-30"
                  value={valueDate}
                  onChange={setValueDate}
                  hint="September 2026 only"
                />
              </Row>

              <Row name="Required + error" note="Same contract as every other field.">
                <FormDatePicker
                  label="Maturity Date"
                  required
                  min={TODAY}
                  value={maturity}
                  onChange={setMaturity}
                  error={maturity ? undefined : 'Maturity date is required'}
                />
              </Row>

              <Row name="Clearable + format" note="clearable adds an inline reset; displayFormat changes only the text.">
                <FormDatePicker
                  label="Next KYC Review"
                  clearable
                  displayFormat="EEEE, d MMMM yyyy"
                  value={reviewDate}
                  onChange={setReviewDate}
                />
              </Row>

              <Row name="Disabled" note="For dates the workflow locks.">
                <FormDatePicker
                  label="Approved On"
                  value="2026-01-14"
                  onChange={() => undefined}
                  disabled
                  hint="Set by the approval workflow"
                />
              </Row>

              <Row name="Sizes" note="sm · md (default) · lg." full>
                <div className="grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
                  <FormDatePicker label="Small" size="sm" value={dateSizeDemo} onChange={setDateSizeDemo} />
                  <FormDatePicker label="Medium" size="md" value={dateSizeDemo} onChange={setDateSizeDemo} />
                  <FormDatePicker label="Large" size="lg" value={dateSizeDemo} onChange={setDateSizeDemo} />
                </div>
              </Row>
            </Doc>

            <ApiTable
              rows={[
                {
                  name: 'value / onChange',
                  type: 'string / (v) => void',
                  description: "YYYY-MM-DD string; '' means no date.",
                },
                { name: 'min / max', type: 'string', description: 'YYYY-MM-DD bounds; days outside are disabled.' },
                { name: 'dropdowns', type: 'boolean', description: 'Month and year selects in the calendar caption.' },
                {
                  name: 'displayFormat',
                  type: 'string',
                  description: 'date-fns pattern for the trigger text. Default "dd MMM yyyy".',
                },
                { name: 'clearable', type: 'boolean', description: 'Inline reset button once a date is picked.' },
                { name: 'placeholder', type: 'string', description: 'Shown while no date is selected.' },
                { name: 'name', type: 'string', description: 'Mirrors the value into a hidden input for form posts.' },
                { name: 'label / hint / error / size', type: '—', description: 'Same contract as the other fields.' },
              ]}
            />
          </>
        )}

        {/* ---------------------------------------------------------------- */}
        {tab === 'phone' && (
          <>
            <Doc
              icon={Phone}
              name="FormPhone"
              description="Phone number on react-international-phone — flags, searchable country code, masked as you type."
              importLine="import { FormPhone } from '@/components/ui/form'"
            >
              <Row
                name="Default"
                note="Type digits only — the country's mask is applied live. Search the code by name or number."
                full
              >
                <div className="max-w-xs">
                  <FormPhone label="Mobile Number" value={mobile} onChange={setMobile} />
                </div>
                <p className="mt-2 font-mono text-[10px] text-slate-400">
                  value → {mobile ? `'${mobile}'` : "''"}
                </p>
              </Row>

              <Row
                name="Other country"
                note="defaultCountry sets the code while empty. Pasting a number with a + prefix switches it."
              >
                <FormPhone
                  label="Office Number"
                  defaultCountry="sg"
                  value={officePhone}
                  onChange={setOfficePhone}
                  hint="Stored as E.164, e.g. +6581234567"
                />
              </Row>

              <Row name="Required + error" note="The whole field reddens, code side included.">
                <FormPhone
                  label="Emergency Contact"
                  required
                  value={emergency}
                  onChange={setEmergency}
                  error={emergency ? undefined : 'A contact number is required'}
                />
              </Row>

              <Row name="Disabled" note="Neither the code nor the number can be changed.">
                <FormPhone
                  label="Verified Number"
                  value="+85577889900"
                  onChange={() => undefined}
                  disabled
                  hint="Locked after OTP verification"
                />
              </Row>

              <Row name="Sizes" note="sm · md (default) · lg." full>
                <div className="grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
                  <FormPhone label="Small" size="sm" value={mobile} onChange={setMobile} />
                  <FormPhone label="Medium" size="md" value={mobile} onChange={setMobile} />
                  <FormPhone label="Large" size="lg" value={mobile} onChange={setMobile} />
                </div>
              </Row>
            </Doc>

            <ApiTable
              rows={[
                {
                  name: 'value / onChange',
                  type: 'string / (v, country) => void',
                  description: "E.164 string like '+85512345678'; '' while no number is typed.",
                },
                { name: 'defaultCountry', type: 'CountryIso2', description: 'Code shown while the value is empty. Default "kh".' },
                {
                  name: 'countries',
                  type: 'CountryData[]',
                  description: 'Defaults to PHONE_INPUT_COUNTRIES (the full list). Pass a subset to narrow it.',
                },
                {
                  name: 'preferredCountries',
                  type: 'CountryIso2[]',
                  description: "Pinned to the top of the picker. Default: the bank's markets.",
                },
                { name: 'placeholder', type: 'string', description: "Overrides the country's example number." },
                { name: 'name', type: 'string', description: 'Hidden input carrying the E.164 value for form posts.' },
                { name: 'label / hint / error / size', type: '—', description: 'Same contract as the other fields.' },
              ]}
            />
          </>
        )}

        {/* ---------------------------------------------------------------- */}
        {tab === 'select' && (
          <>
            <Doc
              icon={ChevronsUpDown}
              name="FormSelect"
              description="Single choice — a styled, searchable listbox with full keyboard support."
              importLine="import { FormSelect } from '@/components/ui/form'"
            >
              <Row name="Default" note="Options can be plain strings.">
                <FormSelect
                  label="Customer Type"
                  options={CUSTOMER_TYPES}
                  value={customerType}
                  onChange={setCustomerType}
                />
              </Row>

              <Row name="Placeholder" note="Adds an empty first option; the text greys out until a choice is made.">
                <FormSelect
                  label="Servicing Branch"
                  placeholder="Select a branch…"
                  options={BRANCHES}
                  value={branch}
                  onChange={setBranch}
                />
              </Row>

              <Row name="Required + error" note="Object options carry their own disabled flag — see “Prohibited”.">
                <FormSelect
                  label="Risk Rating"
                  required
                  placeholder="Select…"
                  options={RISK_RATINGS}
                  value={risk}
                  onChange={setRisk}
                  error={risk ? undefined : 'Risk rating is required'}
                />
              </Row>

              <Row
                name="Search"
                note="The filter matches label and description. Open this one and type “dollar” or “+8”."
              >
                <FormSelect
                  label="Country of Residence"
                  options={COUNTRIES}
                  value={country}
                  onChange={setCountry}
                  placeholder="Search countries…"
                />
              </Row>

              <Row name="No filter box" note="searchable={false} for short lists, where a filter is just noise.">
                <FormSelect
                  label="Base Currency"
                  options={['USD', 'KHR', 'THB', 'EUR']}
                  value={currency}
                  onChange={setCurrency}
                  searchable={false}
                />
              </Row>

              <Row name="Clearable" note="clearable adds an inline reset once something is picked.">
                <FormSelect
                  label="Assigned Officer"
                  placeholder="Unassigned"
                  options={['Sophea Chan', 'Dara Kim', 'Nita Sok', 'Vichea Prum']}
                  value={officer}
                  onChange={setOfficer}
                  clearable
                />
              </Row>

              <Row name="Disabled" note="For values the workflow locks.">
                <FormSelect
                  label="Account Status"
                  options={['Active']}
                  value="Active"
                  onChange={() => undefined}
                  disabled
                  hint="Locked after approval"
                />
              </Row>

              <Row name="Sizes" note="sm · md (default) · lg." full>
                <div className="grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
                  <FormSelect label="Small" size="sm" options={CUSTOMER_TYPES} value={sizeDemo} onChange={setSizeDemo} />
                  <FormSelect label="Medium" size="md" options={CUSTOMER_TYPES} value={sizeDemo} onChange={setSizeDemo} />
                  <FormSelect label="Large" size="lg" options={CUSTOMER_TYPES} value={sizeDemo} onChange={setSizeDemo} />
                </div>
              </Row>

            </Doc>

            <ApiTable
              rows={[
                {
                  name: 'value / onChange',
                  type: 'string / (v) => void',
                  description: 'Controlled value. onChange receives the value, not an event.',
                },
                {
                  name: 'options',
                  type: 'FieldOption[]',
                  description: 'A string, or { value, label, description?, disabled? }.',
                },
                { name: 'placeholder', type: 'string', description: 'Shown while no value is selected.' },
                { name: 'searchable', type: 'boolean', description: 'Filter box inside the panel. Default true.' },
                { name: 'clearable', type: 'boolean', description: 'Inline reset button once a value is picked.' },
                { name: 'emptyMessage', type: 'string', description: 'Shown when the filter matches nothing.' },
                { name: 'name', type: 'string', description: 'Mirrors the value into a hidden input for form posts.' },
                { name: 'label / hint / error / size', type: '—', description: 'Same contract as the other fields.' },
              ]}
            />
          </>
        )}

        {/* ---------------------------------------------------------------- */}
        {tab === 'multiselect' && (
          <>
            <Doc
              icon={ListChecks}
              name="FormMultiSelect"
              description="Many choices — chips in the trigger, a filterable checklist in a portalled panel."
              importLine="import { FormMultiSelect } from '@/components/ui/form'"
            >
              <Row name="Default" note="Filter box, checkboxes, per-chip remove and a clear-all.">
                <FormMultiSelect
                  label="Subscribed Products"
                  options={PRODUCTS}
                  value={products}
                  onChange={setProducts}
                  placeholder="Select products…"
                />
              </Row>

              <Row name="Required + error" note="Errors read the same as every other field.">
                <FormMultiSelect
                  label="Coverage Markets"
                  required
                  options={BRANCHES}
                  value={coverage}
                  onChange={setCoverage}
                  error={coverage.length === 0 ? 'Pick at least one market' : undefined}
                />
              </Row>

              <Row name="Chip overflow" note="maxVisibleChips=2 — four picked, two shown, rest collapse into +N.">
                <FormMultiSelect
                  label="Branches"
                  options={BRANCHES}
                  value={markets}
                  onChange={setMarkets}
                  maxVisibleChips={2}
                />
              </Row>

              <Row name="Selection cap" note="maxSelected=2 disables the remaining options once the cap is hit.">
                <FormMultiSelect
                  label="Primary Products"
                  options={PRODUCTS}
                  value={limited}
                  onChange={setLimited}
                  maxSelected={2}
                />
              </Row>

              <Row name="No filter box" note="searchable={false} for short lists.">
                <FormMultiSelect
                  label="Statement Channels"
                  options={['Email', 'SMS', 'Post']}
                  value={channels}
                  onChange={setChannels}
                  searchable={false}
                />
              </Row>

              <Row name="Disabled" note="Chips grey out and the panel will not open.">
                <FormMultiSelect
                  label="Legacy Products"
                  options={PRODUCTS}
                  value={['savings', 'custody']}
                  onChange={() => undefined}
                  disabled
                  hint="Migrated on 2026-01-01"
                />
              </Row>

              <Row name="Sizes" note="sm · md (default) · lg." full>
                <div className="grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
                  <FormMultiSelect
                    label="Small"
                    size="sm"
                    options={BRANCHES}
                    value={markets}
                    onChange={setMarkets}
                    maxVisibleChips={1}
                  />
                  <FormMultiSelect
                    label="Medium"
                    size="md"
                    options={BRANCHES}
                    value={markets}
                    onChange={setMarkets}
                    maxVisibleChips={1}
                  />
                  <FormMultiSelect
                    label="Large"
                    size="lg"
                    options={BRANCHES}
                    value={markets}
                    onChange={setMarkets}
                    maxVisibleChips={1}
                  />
                </div>
              </Row>

            </Doc>

            <ApiTable
              rows={[
                {
                  name: 'value / onChange',
                  type: 'string[] / (v) => void',
                  description: 'Controlled list of selected values.',
                },
                { name: 'options', type: 'FieldOption[]', description: 'description renders as a second line in the panel.' },
                { name: 'searchable', type: 'boolean', description: 'Filter box inside the panel. Default true.' },
                { name: 'maxVisibleChips', type: 'number', description: 'Chips before the +N badge. Default 3.' },
                { name: 'maxSelected', type: 'number', description: 'Caps the selection; the rest go disabled.' },
                { name: 'emptyMessage', type: 'string', description: 'Shown when the filter matches nothing.' },
                { name: 'name', type: 'string', description: 'Mirrors each value into a hidden input for form posts.' },
                { name: 'label / hint / error / size', type: '—', description: 'Same contract as the other fields.' },
              ]}
            />
          </>
        )}

        {/* ---------------------------------------------------------------- */}
        {tab === 'playground' && (
          <section className={cn(CARD, 'overflow-hidden')}>
            <div className="flex items-center gap-3 px-5 py-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <FlaskConical className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-slate-900">Playground</h2>
                <p className="text-xs text-slate-500">
                  Every field in one form. Submit empty to see the error states together.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 border-t border-slate-100 lg:grid-cols-[minmax(0,1fr)_20rem]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(JSON.stringify(form, null, 2));
                }}
                className="flex flex-col gap-4 p-5"
              >
                <div className="grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormInput
                    label="Customer Name"
                    required
                    icon={User}
                    placeholder="e.g. Eleanor Vance"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    error={nameError}
                  />
                  <FormSelect
                    label="Customer Type"
                    required
                    placeholder="Select…"
                    options={CUSTOMER_TYPES}
                    value={form.type}
                    onChange={(next) => setForm({ ...form, type: next })}
                    error={typeError}
                  />
                  <FormDatePicker
                    label="Account Opened On"
                    required
                    max={TODAY}
                    value={form.openedOn}
                    onChange={(next) => setForm({ ...form, openedOn: next })}
                    error={openedOnError}
                  />
                  <FormMultiSelect
                    label="Products"
                    required
                    options={PRODUCTS}
                    value={form.products}
                    onChange={(next) => setForm({ ...form, products: next })}
                    error={productsError}
                    containerClassName="sm:col-span-2"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="inline-flex h-9 items-center rounded-lg bg-blue-500 px-5 text-xs font-semibold text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-600 active:scale-[0.98]"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ name: '', type: '', openedOn: '', products: [] });
                      setSubmitted(null);
                    }}
                    className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Reset
                  </button>
                </div>
              </form>

              <aside className="border-t border-slate-100 bg-slate-50/60 p-5 lg:border-l lg:border-t-0">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {submitted ? 'Submitted value' : 'Live value'}
                </p>
                <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 font-mono text-[11px] leading-relaxed text-slate-200">
                  {submitted ?? JSON.stringify(form, null, 2)}
                </pre>
              </aside>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
