/**
 * Choice lists for the address fields.
 *
 * The Cambodian hierarchy is a starter set, not a gazetteer: every province is
 * listed, districts are filled in for the provinces this desk sees most, and
 * sangkats for the Phnom Penh khans. Where a level has no entries the address
 * field falls back to a free-text box, so an address outside the covered area
 * can still be captured. Check the names against an official list before this
 * goes anywhere near production data.
 */

import { PHONE_COUNTRIES } from './phoneCountries';

/** Same country set as the phone field, so the two fields never disagree. */
export const COUNTRY_OPTIONS: string[] = PHONE_COUNTRIES.map((country) => country.name);

export const CAMBODIA = 'Cambodia';

/** Province / capital -> district (khan) -> commune (sangkat). */
export const CAMBODIA_LOCATIONS: Record<string, Record<string, string[]>> = {
  'Phnom Penh': {
    'Chamkar Mon': [
      'Tuol Svay Prey Ti Muoy',
      'Tuol Svay Prey Ti Pir',
      'Tuol Tumpung Ti Muoy',
      'Tuol Tumpung Ti Pir',
      'Boeng Trabaek',
      'Phsar Daeum Thkov',
      'Tumnob Tuek',
    ],
    'Boeng Keng Kang': [
      'Boeng Keng Kang Ti Muoy',
      'Boeng Keng Kang Ti Pir',
      'Boeng Keng Kang Ti Bei',
      'Tonle Basak',
      'Olympic',
    ],
    'Daun Penh': [
      'Phsar Thmei Ti Muoy',
      'Phsar Thmei Ti Pir',
      'Phsar Thmei Ti Bei',
      'Phsar Kandal Ti Muoy',
      'Phsar Kandal Ti Pir',
      'Chey Chumneah',
      'Chakto Mukh',
      'Phsar Chas',
      'Srah Chak',
      'Voat Phnum',
      'Boeng Reang',
    ],
    'Prampir Makara': [
      'Monourom',
      'Mittapheap',
      'Veal Vong',
      'Ou Ruessei Ti Muoy',
      'Ou Ruessei Ti Pir',
      'Ou Ruessei Ti Bei',
      'Ou Ruessei Ti Buon',
      'Boeng Prolit',
    ],
    'Tuol Kouk': [
      'Boeng Kak Ti Muoy',
      'Boeng Kak Ti Pir',
      'Phsar Daeum Kor',
      'Tuek Laak Ti Muoy',
      'Tuek Laak Ti Pir',
      'Tuek Laak Ti Bei',
      'Phsar Depou Ti Muoy',
      'Phsar Depou Ti Pir',
      'Phsar Depou Ti Bei',
      'Boeng Salang',
    ],
    'Sen Sok': ['Phnom Penh Thmei', 'Tuek Thla', 'Khmuonh', 'Krang Thnong', 'Ou Baek Kaam', 'Kouk Khleang'],
    'Mean Chey': ['Stueng Mean Chey Ti Muoy', 'Stueng Mean Chey Ti Pir', 'Boeng Tumpun Ti Muoy', 'Chak Angre Kraom', 'Chak Angre Leu'],
    'Ruessei Kaev': ['Tuol Sangke Ti Muoy', 'Tuol Sangke Ti Pir', 'Chrang Chamreh Ti Muoy', 'Chrang Chamreh Ti Pir', 'Kilomaetr Lekh Prammuoy'],
    'Chbar Ampov': ['Chbar Ampov Ti Muoy', 'Chbar Ampov Ti Pir', 'Nirouth', 'Preaek Pra', 'Veal Sbov'],
    'Pou Senchey': ['Chaom Chau Ti Muoy', 'Chaom Chau Ti Pir', 'Kakab Ti Muoy', 'Kakab Ti Pir', 'Trapeang Krasang'],
    'Chraoy Chongvar': ['Chraoy Chongvar', 'Preaek Lieb', 'Preaek Ta Sek', 'Bak Kaeng'],
    Dangkao: ['Dangkao', 'Cheung Aek', 'Prey Sar', 'Kong Noy', 'Pong Tuek'],
    Kamboul: ['Kamboul', 'Kantaok', 'Ovlaok', 'Snaor'],
    'Preaek Pnov': ['Preaek Pnov', 'Ponsang', 'Samraong', 'Kouk Roka'],
  },
  'Siem Reap': {
    'Siem Reap': ['Sala Kamraeuk', 'Svay Dangkum', 'Kouk Chak', 'Sla Kram', 'Chreav', 'Nokor Thum'],
    'Prasat Bakong': [],
    'Angkor Chum': [],
    'Sotr Nikom': [],
  },
  Battambang: {
    Battambang: ['Svay Pao', 'Tuol Ta Ek', 'Prek Preah Sdach', 'Chamkar Samraong', 'Rattanak'],
    Banan: [],
    'Thma Koul': [],
    'Moung Ruessei': [],
  },
  'Preah Sihanouk': {
    'Preah Sihanouk': ['Buon', 'Lek Muoy', 'Lek Bei', 'Lek Buon'],
    'Prey Nob': [],
    'Stueng Hav': [],
  },
  Kandal: {
    'Ta Khmau': ['Ta Khmau', 'Doeum Mien', 'Prek Ruessei', 'Setbou'],
    'Kien Svay': [],
    'Muk Kampul': [],
    'Ponhea Lueu': [],
  },
  'Kampong Cham': {
    'Kampong Cham': ['Kampong Cham', 'Sambuor Meas', 'Veal Vong', 'Boeng Kok'],
    Batheay: [],
    'Chamkar Leu': [],
  },
  'Banteay Meanchey': {},
  'Kampong Chhnang': {},
  'Kampong Speu': {},
  'Kampong Thom': {},
  Kampot: {},
  Kep: {},
  'Koh Kong': {},
  Kratie: {},
  Mondulkiri: {},
  'Oddar Meanchey': {},
  Pailin: {},
  'Preah Vihear': {},
  'Prey Veng': {},
  Pursat: {},
  Ratanakiri: {},
  'Stung Treng': {},
  'Svay Rieng': {},
  Takeo: {},
  'Tboung Khmum': {},
};

export const CAMBODIA_PROVINCES: string[] = Object.keys(CAMBODIA_LOCATIONS).sort((a, b) =>
  // Phnom Penh first, the rest alphabetical.
  a === 'Phnom Penh' ? -1 : b === 'Phnom Penh' ? 1 : a.localeCompare(b)
);

/** Provinces of the given country, or [] when it has no list — the caller then shows a text box. */
export function provinceOptions(country: string): string[] {
  return country === CAMBODIA ? CAMBODIA_PROVINCES : [];
}

export function districtOptions(country: string, province: string): string[] {
  if (country !== CAMBODIA) return [];
  return Object.keys(CAMBODIA_LOCATIONS[province] ?? {});
}

export function communeOptions(country: string, province: string, district: string): string[] {
  if (country !== CAMBODIA) return [];
  return CAMBODIA_LOCATIONS[province]?.[district] ?? [];
}
