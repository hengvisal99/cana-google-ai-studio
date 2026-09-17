'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormField, fieldControlClass, type FieldSize } from './FormField';
import {
  FieldOptionRow,
  FieldPanel,
  FieldPanelEmpty,
  useDismissOnOutside,
  usePanelPlacement,
  useScrollHighlightIntoView,
} from './fieldPopover';
import {
  DEFAULT_PHONE_COUNTRY,
  PHONE_COUNTRIES,
  findPhoneCountry,
  formatNationalNumber,
  formatPhoneValue,
  type PhoneCountry,
  type PhoneValue,
} from './phoneCountries';

export interface FormPhoneProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  size?: FieldSize;
  value: PhoneValue;
  onChange: (value: PhoneValue) => void;
  /** Override or narrow the country list. */
  countries?: PhoneCountry[];
  /** Defaults to the selected country's example number. */
  placeholder?: string;
  /** Mirrors "+855 12 345 678" into a hidden input so plain <form> submits carry it. */
  name?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
  containerClassName?: string;
}

const countDigits = (input: string) => (input.match(/\d/g) ?? []).length;

/** Caret offset that sits just after the nth digit of a formatted number. */
function offsetAfterDigit(formatted: string, digitIndex: number): number {
  if (digitIndex <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i += 1) {
    if (/\d/.test(formatted[i])) {
      seen += 1;
      if (seen === digitIndex) return i + 1;
    }
  }
  return formatted.length;
}

/** Phone number with a searchable country/dial-code picker sharing one bordered field. */
export function FormPhone({
  label,
  hint,
  error,
  size = 'md',
  value,
  onChange,
  countries = PHONE_COUNTRIES,
  placeholder,
  name,
  required,
  disabled,
  id,
  className,
  containerClassName,
}: FormPhoneProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const listId = `${fieldId}-countries`;
  const describedById = error || hint ? `${fieldId}-desc` : undefined;
  const optionId = (index: number) => `${fieldId}-country-${index}`;

  const [open, setOpenState] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  /** Digits before the caret, held across the reformat so it does not jump to the end. */
  const caretDigitsRef = useRef<number | null>(null);

  const country = findPhoneCountry(value.country || DEFAULT_PHONE_COUNTRY, countries);
  // Displayed grouped even when the parent still holds a bare "12345678".
  const display = formatNationalNumber(value.number, country.example);

  useEffect(() => {
    const el = inputRef.current;
    if (!el || caretDigitsRef.current === null) return;
    const offset = offsetAfterDigit(el.value, caretDigitsRef.current);
    el.setSelectionRange(offset, offset);
    caretDigitsRef.current = null;
  });

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const caret = e.target.selectionStart ?? raw.length;
    caretDigitsRef.current = countDigits(raw.slice(0, caret));
    onChange({ ...value, number: formatNationalNumber(raw, country.example) });
  };

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\+/, '');
    if (!q) return countries;
    return countries.filter(
      (item) => item.name.toLowerCase().includes(q) || item.dial.replace('+', '').startsWith(q) || item.iso === q
    );
  }, [countries, query]);

  /** Opening starts the list on the current country; closing resets the filter. */
  const setOpen = (next: boolean) => {
    setOpenState(next);
    setQuery('');
    setHighlight(next ? Math.max(0, countries.findIndex((item) => item.iso === country.iso)) : 0);
  };

  // Measured against the whole field so the list spans it, not just the dial button.
  const placement = usePanelPlacement(open, wrapperRef);
  useDismissOnOutside(open, () => setOpen(false), buttonRef, panelRef);
  useScrollHighlightIntoView(open, open ? optionId(highlight) : undefined);

  const pickCountry = (iso: string) => {
    // Regroup what is already typed to the new country's pattern.
    const next = findPhoneCountry(iso, countries);
    onChange({ country: iso, number: formatNationalNumber(value.number, next.example) });
    setOpen(false);
    buttonRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === 'Escape' && open) {
      e.stopPropagation();
      setOpen(false);
      buttonRef.current?.focus();
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      if (matches.length === 0) return;
      setHighlight((prev) => {
        const step = e.key === 'ArrowDown' ? 1 : -1;
        return (prev + step + matches.length) % matches.length;
      });
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const match = matches[highlight];
      if (match) pickCountry(match.iso);
      return;
    }

    if (e.key === 'Tab' && open) setOpen(false);
  };

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
      <div
        ref={wrapperRef}
        className={fieldControlClass({
          size,
          invalid: Boolean(error),
          disabled,
          focusWithin: true,
          className: cn('flex items-stretch gap-0 px-0', className),
        })}
      >
        {/* Country / dial code */}
        <button
          ref={buttonRef}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={open ? listId : undefined}
          aria-activedescendant={open && matches[highlight] ? optionId(highlight) : undefined}
          aria-label={`Country code: ${country.name} ${country.dial}`}
          disabled={disabled}
          onClick={() => !disabled && setOpen(!open)}
          onKeyDown={handleKeyDown}
          className={cn(
            'flex shrink-0 items-center gap-1 rounded-l-lg border-r border-slate-200 pl-2.5 pr-2 font-medium outline-none transition',
            disabled ? 'text-slate-400' : 'text-slate-600 hover:bg-slate-50'
          )}
        >
          <span className="tabular-nums">{country.dial}</span>
          <ChevronDown
            className={cn('h-3 w-3 shrink-0 text-slate-400 transition-transform', open && 'rotate-180')}
          />
        </button>

        {/* National number */}
        <input
          ref={inputRef}
          id={fieldId}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={display}
          disabled={disabled}
          required={required}
          placeholder={placeholder ?? country.example}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedById}
          onChange={handleNumberChange}
          className="min-w-0 flex-1 bg-transparent px-2.5 tabular-nums outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
        />

        {name && <input type="hidden" name={name} value={formatPhoneValue(value, countries)} />}
      </div>

      {open &&
        placement &&
        createPortal(
          <FieldPanel
            panelRef={panelRef}
            placement={placement}
            listId={listId}
            searchable
            query={query}
            onQueryChange={(next) => {
              setQuery(next);
              setHighlight(0);
            }}
            onKeyDown={handleKeyDown}
            searchPlaceholder="Search country or code…"
          >
            {matches.length === 0 ? (
              <FieldPanelEmpty message="No matching country" />
            ) : (
              matches.map((item, index) => (
                <FieldOptionRow
                  key={item.iso}
                  id={optionId(index)}
                  label={item.name}
                  description={item.dial}
                  selected={item.iso === country.iso}
                  highlighted={index === highlight}
                  onSelect={() => pickCountry(item.iso)}
                  onHover={() => setHighlight(index)}
                />
              ))
            )}
          </FieldPanel>,
          document.body
        )}
    </FormField>
  );
}
