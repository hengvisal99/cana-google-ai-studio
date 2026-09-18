/**
 * The bank's markets: pinned to the top of the phone field's country picker, and
 * the country list for addresses. Cambodia leads, then the region, then the rest.
 */
export interface PhoneCountry {
  /** Lowercase ISO 3166-1 alpha-2 code. */
  iso: string;
  name: string;
  /** Dial prefix including the plus, e.g. "+855". */
  dial: string;
  /** A typical national number; its grouping becomes the phone mask where the library has none. */
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
