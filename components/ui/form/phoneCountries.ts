/**
 * Dial codes for the phone field. Deliberately no flag emoji: Windows renders
 * regional-indicator pairs as bare letters, so the ISO code is shown instead.
 * Cambodia leads the list, then the region, then the markets the bank deals with.
 */
export interface PhoneCountry {
  /** Lowercase ISO 3166-1 alpha-2 code, used as the stored value. */
  iso: string;
  name: string;
  /** Dial prefix including the plus, e.g. "+855". */
  dial: string;
  /** Digits of a typical national number, used for the placeholder. */
  example: string;
}

export const PHONE_COUNTRIES: PhoneCountry[] = [
  { iso: 'kh', name: 'Cambodia', dial: '+855', example: '12 345 678' },
  { iso: 'th', name: 'Thailand', dial: '+66', example: '81 234 5678' },
  { iso: 'vn', name: 'Vietnam', dial: '+84', example: '91 234 5678' },
  { iso: 'la', name: 'Laos', dial: '+856', example: '20 1234 5678' },
  { iso: 'mm', name: 'Myanmar', dial: '+95', example: '9 123 456 789' },
  { iso: 'sg', name: 'Singapore', dial: '+65', example: '8123 4567' },
  { iso: 'my', name: 'Malaysia', dial: '+60', example: '12 345 6789' },
  { iso: 'id', name: 'Indonesia', dial: '+62', example: '812 345 678' },
  { iso: 'ph', name: 'Philippines', dial: '+63', example: '917 123 4567' },
  { iso: 'cn', name: 'China', dial: '+86', example: '131 2345 6789' },
  { iso: 'hk', name: 'Hong Kong SAR', dial: '+852', example: '5123 4567' },
  { iso: 'tw', name: 'Taiwan', dial: '+886', example: '912 345 678' },
  { iso: 'jp', name: 'Japan', dial: '+81', example: '90 1234 5678' },
  { iso: 'kr', name: 'South Korea', dial: '+82', example: '10 1234 5678' },
  { iso: 'in', name: 'India', dial: '+91', example: '81234 56789' },
  { iso: 'au', name: 'Australia', dial: '+61', example: '412 345 678' },
  { iso: 'nz', name: 'New Zealand', dial: '+64', example: '21 123 4567' },
  { iso: 'gb', name: 'United Kingdom', dial: '+44', example: '7400 123456' },
  { iso: 'fr', name: 'France', dial: '+33', example: '6 12 34 56 78' },
  { iso: 'de', name: 'Germany', dial: '+49', example: '1512 3456789' },
  { iso: 'ch', name: 'Switzerland', dial: '+41', example: '78 123 45 67' },
  { iso: 'ae', name: 'United Arab Emirates', dial: '+971', example: '50 123 4567' },
  { iso: 'us', name: 'United States', dial: '+1', example: '201 555 0123' },
  { iso: 'ca', name: 'Canada', dial: '+1', example: '506 234 5678' },
];

export const DEFAULT_PHONE_COUNTRY = PHONE_COUNTRIES[0].iso;

export function findPhoneCountry(iso: string, countries: PhoneCountry[] = PHONE_COUNTRIES): PhoneCountry {
  return countries.find((country) => country.iso === iso) ?? countries[0];
}

/** What a phone field holds: the country picked, and the national number as typed. */
export interface PhoneValue {
  /** ISO code from PHONE_COUNTRIES. */
  country: string;
  /** National number without the dial prefix. */
  number: string;
}

/** Digit-group sizes read off a country's example, e.g. "12 345 678" -> [2, 3, 3]. */
export function phoneGroups(example: string): number[] {
  return example
    .trim()
    .split(/\s+/)
    .map((group) => group.length)
    .filter(Boolean);
}

/**
 * Groups a national number the way its country writes it: "12345678" -> "12 345 678".
 * A trunk-prefix 0 is dropped once another digit follows it, since the international
 * form never carries it. Digits past the pattern fall back to groups of three.
 */
export function formatNationalNumber(input: string, example: string): string {
  const digits = input.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
  if (!digits) return '';

  const parts: string[] = [];
  let cursor = 0;

  for (const size of phoneGroups(example)) {
    if (cursor >= digits.length) break;
    parts.push(digits.slice(cursor, cursor + size));
    cursor += size;
  }

  for (let i = cursor; i < digits.length; i += 3) {
    parts.push(digits.slice(i, i + 3));
  }

  return parts.join(' ');
}

/** Flattens a PhoneValue for storage or display, e.g. "+855 12 345 678". */
export function formatPhoneValue(
  value: PhoneValue,
  countries: PhoneCountry[] = PHONE_COUNTRIES
): string {
  const country = findPhoneCountry(value.country, countries);
  const number = formatNationalNumber(value.number, country.example);
  if (!number) return '';
  return `${country.dial} ${number}`;
}

/** Splits a stored string such as "+855 12 345 678" back into a PhoneValue. */
export function parsePhoneValue(
  input: string,
  countries: PhoneCountry[] = PHONE_COUNTRIES
): PhoneValue {
  const trimmed = input.trim();
  if (!trimmed) return { country: DEFAULT_PHONE_COUNTRY, number: '' };

  // Longest dial code first, so +855 wins over +85 style prefixes.
  const match = [...countries]
    .sort((a, b) => b.dial.length - a.dial.length)
    .find((country) => trimmed.startsWith(country.dial));

  if (!match) return { country: DEFAULT_PHONE_COUNTRY, number: trimmed };
  return { country: match.iso, number: trimmed.slice(match.dial.length).trim() };
}
