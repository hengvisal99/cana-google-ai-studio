'use client';

import React, { useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import {
  FlagImage,
  defaultCountries,
  parseCountry,
  usePhoneInput,
  type CountryData,
  type CountryIso2,
  type ParsedCountry,
} from 'react-international-phone';
import { cn } from '@/lib/utils';
import { FormField, fieldControlClass, type FieldSize } from './FormField';
import {
  FieldPanel,
  FieldPanelEmpty,
  useDismissOnOutside,
  usePanelPlacement,
  useScrollHighlightIntoView,
} from './fieldPopover';
import { PHONE_COUNTRIES } from './phoneCountries';

/** Our markets, in desk order — listed first in the picker. */
export const PREFERRED_PHONE_COUNTRIES: CountryIso2[] = PHONE_COUNTRIES.map((country) => country.iso);

/**
 * The library's world list, with a grouping mask filled in from our example
 * numbers where it has none (Cambodia ships without one, so "12345678" would
 * otherwise stay ungrouped).
 */
export const PHONE_INPUT_COUNTRIES: CountryData[] = defaultCountries.map((data) => {
  const country = parseCountry(data);
  if (country.format) return data;
  const example = PHONE_COUNTRIES.find((item) => item.iso === country.iso2)?.example;
  if (!example) return data;
  return [country.name, country.iso2, country.dialCode, example.replace(/\d/g, '.')];
});

export interface FormPhoneProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  size?: FieldSize;
  /** E.164 string, e.g. "+85512345678"; '' while no number is typed. */
  value: string;
  onChange: (value: string, country: ParsedCountry) => void;
  /** Country used while the value is empty (default: "kh"). */
  defaultCountry?: CountryIso2;
  /** Override or narrow the country list. */
  countries?: CountryData[];
  /** Pinned to the top of the picker (default: the bank's markets). */
  preferredCountries?: CountryIso2[];
  placeholder?: string;
  /** Mirrors the E.164 value into a hidden input so plain <form> submits carry it. */
  name?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
  containerClassName?: string;
}

/**
 * Phone number on react-international-phone: the hook masks and parses the
 * number, while the country list uses the kit's own portalled panel so it looks
 * and handles like FormSelect.
 */
export function FormPhone({
  label,
  hint,
  error,
  size = 'md',
  value,
  onChange,
  defaultCountry = 'kh',
  countries = PHONE_INPUT_COUNTRIES,
  preferredCountries = PREFERRED_PHONE_COUNTRIES,
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

  const { inputValue, country, setCountry, handlePhoneValueChange, inputRef } = usePhoneInput({
    defaultCountry,
    value,
    countries,
    // The dial code lives on the button, so the input holds only the national number.
    disableDialCodeAndPrefix: true,
    // A bare dial code is reported as '' so callers never store "+855" for an empty field.
    onChange: ({ phone, country: next }) => onChange(phone === `+${next.dialCode}` ? '' : phone, next),
  });

  const [open, setOpenState] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  /** Preferred countries first, then the rest alphabetically. */
  const ordered = useMemo(() => {
    const parsed = countries.map(parseCountry);
    const rank = (iso: string) => {
      const index = preferredCountries.indexOf(iso);
      return index === -1 ? Number.MAX_SAFE_INTEGER : index;
    };
    return parsed.sort((a, b) => rank(a.iso2) - rank(b.iso2) || a.name.localeCompare(b.name));
  }, [countries, preferredCountries]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\+/, '');
    if (!q) return ordered;
    return ordered.filter(
      (item) => item.name.toLowerCase().includes(q) || item.dialCode.startsWith(q) || item.iso2 === q
    );
  }, [ordered, query]);

  /** Opening starts the list on the current country; closing resets the filter. */
  const setOpen = (next: boolean) => {
    setOpenState(next);
    setQuery('');
    setHighlight(next ? Math.max(0, ordered.findIndex((item) => item.iso2 === country.iso2)) : 0);
  };

  // Measured against the whole field so the list spans it, not just the dial button.
  const placement = usePanelPlacement(open, wrapperRef);
  useDismissOnOutside(open, () => setOpen(false), buttonRef, panelRef);
  useScrollHighlightIntoView(open, open ? optionId(highlight) : undefined);

  const pickCountry = (iso2: CountryIso2) => {
    setCountry(iso2, { focusOnInput: true });
    setOpen(false);
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
      if (match) pickCountry(match.iso2);
      return;
    }

    if (e.key === 'Tab' && open) setOpen(false);
  };

  const flagSize = size === 'lg' ? '18px' : '16px';
  // The mask doubles as the placeholder: "(..) ...-..." reads as "(12) 345-678".
  const mask = typeof country.format === 'string' ? country.format : country.format?.default;
  let digit = 0;
  const maskPlaceholder = mask?.replace(/\./g, () => String((digit++ % 9) + 1));

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
          aria-label={`Country code: ${country.name} +${country.dialCode}`}
          disabled={disabled}
          onClick={() => !disabled && setOpen(!open)}
          onKeyDown={handleKeyDown}
          className={cn(
            'flex shrink-0 items-center gap-1.5 rounded-l-lg border-r border-slate-200 pl-2.5 pr-2 font-medium outline-none transition',
            disabled ? 'text-slate-400' : 'text-slate-600 hover:bg-slate-50'
          )}
        >
          <FlagImage iso2={country.iso2} size={flagSize} className={cn('shrink-0', disabled && 'opacity-50')} />
          <span className="tabular-nums">+{country.dialCode}</span>
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
          value={inputValue}
          disabled={disabled}
          required={required}
          placeholder={placeholder ?? maskPlaceholder ?? 'Phone number'}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedById}
          onChange={handlePhoneValueChange}
          className="min-w-0 flex-1 bg-transparent px-2.5 tabular-nums outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
        />

        {name && <input type="hidden" name={name} value={value} />}
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
              matches.map((item, index) => {
                const selected = item.iso2 === country.iso2;
                return (
                  <button
                    key={item.iso2}
                    id={optionId(index)}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onMouseEnter={() => setHighlight(index)}
                    onClick={() => pickCountry(item.iso2)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition',
                      index === highlight && 'bg-slate-50',
                      selected && 'bg-blue-50/70'
                    )}
                  >
                    <FlagImage iso2={item.iso2} size="16px" className="shrink-0" />
                    <span
                      className={cn(
                        'min-w-0 flex-1 truncate',
                        selected ? 'font-semibold text-blue-600' : 'text-slate-700'
                      )}
                    >
                      {item.name}
                    </span>
                    <span className="shrink-0 tabular-nums text-[10px] text-slate-400">+{item.dialCode}</span>
                  </button>
                );
              })
            )}
          </FieldPanel>,
          document.body
        )}
    </FormField>
  );
}
