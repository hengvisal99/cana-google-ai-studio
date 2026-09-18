'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Pencil, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormField, fieldControlClass, type FieldSize } from './FormField';
import { FormInput } from './FormInput';
import { FormSelect } from './FormSelect';
import { COUNTRY_OPTIONS, communeOptions, districtOptions, provinceOptions } from './addressOptions';

/** The parts every address in this app is captured as, finest-grained last. */
export interface AddressValue {
  country: string;
  city: string;
  /** District / Khan. */
  district: string;
  commune: string;
  homeNo: string;
  streetNo: string;
}

export const EMPTY_ADDRESS: AddressValue = {
  country: '',
  city: '',
  district: '',
  commune: '',
  homeNo: '',
  streetNo: '',
};

/**
 * A bare "1, 23, …" leaves the reader guessing which number is the house and
 * which the street, so each number is labelled — unless what was typed already
 * carries its own label ("St 271", "No. 42B", "#12").
 */
const HOME_LABELLED = /^(no\.?|n°|#|house|home|villa|flat|unit)\b/i;
const STREET_LABELLED = /^(st\.?|street|str\.?|road|rd\.?|blvd\.?|boulevard|avenue|ave\.?|lane|preah|national)\b/i;

function labelled(raw: string | undefined, pattern: RegExp, prefix: string): string {
  const part = (raw ?? '').trim();
  if (!part) return '';
  return pattern.test(part) ? part : `${prefix} ${part}`;
}

/**
 * The one-line form an address is stored and displayed as, narrowest part first:
 * "No. 42B, St 310, Boeung Keng Kang 1, Chamkar Mon, Phnom Penh, Cambodia".
 * Takes whatever parts it is given, so a caller holding only the street-level
 * ones gets just that much of the line.
 */
export function formatAddressParts(parts: Partial<AddressValue>): string {
  return [
    labelled(parts.homeNo, HOME_LABELLED, 'No.'),
    labelled(parts.streetNo, STREET_LABELLED, 'St'),
    parts.commune,
    parts.district,
    parts.city,
    parts.country,
  ]
    .map((part) => (part ?? '').trim())
    .filter(Boolean)
    .join(', ');
}

export function formatAddress(value: AddressValue): string {
  return formatAddressParts(value);
}

/**
 * The six address parts, as one group of controls with no wrapper — drop it
 * straight into a grid. Country, city, district and commune are pickers that
 * cascade: choosing a city narrows the districts, a district narrows the
 * communes, and picking a new parent clears the levels under it. A level with
 * no list behind it (a country we hold no gazetteer for, a rural district)
 * falls back to a text box rather than a dead dropdown.
 */
export function AddressFields({
  value,
  onChange,
  size = 'md',
  firstFieldRef,
}: {
  value: AddressValue;
  onChange: (value: AddressValue) => void;
  size?: FieldSize;
  firstFieldRef?: React.Ref<HTMLInputElement>;
}) {
  // A record saved before this list existed (or under another romanisation) keeps
  // its value as an option, so opening the form never silently blanks the field.
  // An empty base list stays empty, so the field still falls back to a text box.
  const withCurrent = (options: string[], current: string) =>
    options.length > 0 && current && !options.includes(current) ? [current, ...options] : options;

  const provinces = withCurrent(provinceOptions(value.country), value.city);
  const districts = withCurrent(districtOptions(value.country, value.city), value.district);
  const communes = withCurrent(communeOptions(value.country, value.city, value.district), value.commune);

  const setText = (key: keyof AddressValue) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [key]: e.target.value });

  return (
    <>
      <FormSelect
        label="Country"
        size={size}
        value={value.country}
        onChange={(next) =>
          onChange(next === value.country ? value : { ...value, country: next, city: '', district: '', commune: '' })
        }
        options={COUNTRY_OPTIONS}
        placeholder="Select country"
      />

      {provinces.length > 0 ? (
        <FormSelect
          label="City / Province"
          size={size}
          value={value.city}
          onChange={(next) => onChange(next === value.city ? value : { ...value, city: next, district: '', commune: '' })}
          options={provinces}
          placeholder="Select city / province"
        />
      ) : (
        <FormInput label="City / Province" size={size} value={value.city} onChange={setText('city')} placeholder="e.g. Phnom Penh" />
      )}

      {districts.length > 0 ? (
        <FormSelect
          label="District (Khan)"
          size={size}
          value={value.district}
          onChange={(next) => onChange(next === value.district ? value : { ...value, district: next, commune: '' })}
          options={districts}
          placeholder="Select district"
        />
      ) : (
        <FormInput
          label="District (Khan)"
          size={size}
          value={value.district}
          onChange={setText('district')}
          placeholder="e.g. Daun Penh"
        />
      )}

      {communes.length > 0 ? (
        <FormSelect
          label="Commune (Sangkat)"
          size={size}
          value={value.commune}
          onChange={(next) => onChange({ ...value, commune: next })}
          options={communes}
          placeholder="Select commune"
        />
      ) : (
        <FormInput
          label="Commune (Sangkat)"
          size={size}
          value={value.commune}
          onChange={setText('commune')}
          placeholder="e.g. Wat Phnom"
        />
      )}

      <FormInput
        ref={firstFieldRef}
        label="Home No."
        size={size}
        value={value.homeNo}
        onChange={setText('homeNo')}
        placeholder="e.g. 42B"
        className="font-mono"
      />

      <FormInput
        label="Street No."
        size={size}
        value={value.streetNo}
        onChange={setText('streetNo')}
        placeholder="e.g. St 310"
        className="font-mono"
      />
    </>
  );
}

export interface FormAddressProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  size?: FieldSize;
  value: AddressValue;
  onChange: (value: AddressValue) => void;
  /** Shown on the trigger while every part is still empty. */
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  containerClassName?: string;
}

/**
 * An address as a single summary field that edits its six parts in a dialog —
 * for the optional addresses, where six inline inputs would outweigh how often
 * they are filled in. The dialog edits a draft, so Cancel leaves the field as it
 * was and only Save writes back.
 */
export function FormAddress({
  label,
  hint,
  error,
  size = 'md',
  value,
  onChange,
  placeholder = 'Add address',
  required,
  disabled,
  id,
  containerClassName,
}: FormAddressProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const dialogId = `${fieldId}-dialog`;
  const titleId = `${fieldId}-title`;
  const describedById = error || hint ? `${fieldId}-desc` : undefined;

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<AddressValue>(value);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const summary = formatAddress(value);
  const heading = typeof label === 'string' && label ? label : 'Address';

  const openDialog = () => {
    if (disabled) return;
    setDraft(value);
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const save = () => {
    onChange(draft);
    close();
  };

  // Hold the page still behind the dialog, and give the first field the caret.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focus = window.setTimeout(() => firstFieldRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focus);
    };
  }, [open]);

  return (
    <FormField
      label={label}
      htmlFor={fieldId}
      required={required}
      hint={hint}
      error={error}
      describedById={describedById}
      className={containerClassName}
    >
      <div className="relative">
        <button
          ref={triggerRef}
          id={fieldId}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-describedby={describedById}
          disabled={disabled}
          onClick={openDialog}
          className={fieldControlClass({
            size,
            invalid: Boolean(error),
            disabled,
            className: 'flex items-center gap-2 pl-8 pr-8 text-left',
          })}
        >
          <MapPin
            className={cn(
              'pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400',
              disabled && 'text-slate-300'
            )}
          />
          <span className={cn('min-w-0 flex-1 truncate', summary ? 'text-slate-900' : 'font-normal text-slate-400')}>
            {summary || placeholder}
          </span>
          <Pencil
            className={cn(
              'pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400',
              disabled && 'text-slate-300'
            )}
          />
        </button>

        {open &&
          createPortal(
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center p-4"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  close();
                }
              }}
            >
              <div
                aria-hidden
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-150"
              />

              <div
                id={dialogId}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_60px_-20px_rgba(15,23,42,0.35)] animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <h2 id={titleId} className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                      {heading}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Close"
                    className="grid h-7 w-7 cursor-pointer place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
                  <AddressFields value={draft} onChange={setDraft} firstFieldRef={firstFieldRef} />
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setDraft({ ...EMPTY_ADDRESS })}
                    className="cursor-pointer rounded-lg px-2 py-1 text-[11px] font-medium text-slate-500 transition hover:bg-white hover:text-slate-700"
                  >
                    Clear
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={close}
                      className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={save}
                      className="cursor-pointer rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-blue-700"
                    >
                      Save Address
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )}
      </div>
    </FormField>
  );
}
