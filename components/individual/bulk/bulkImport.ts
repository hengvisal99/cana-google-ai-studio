import type { Individual, SupportingDocument } from '@/types';
import { excelSerialToIso, type SheetRows } from '@/lib/spreadsheet';
import { createEmptyFormValues, type FormStepKey, type IndividualFormValues } from '@/components/individual/form/IndividualFormFields';

// ─── Template columns ─────────────────────────────────────────────────────────
// One column per field of the single-customer insert form (IndividualFormFields), with the same
// labels, sections, options and required flags. Only the photo and supporting documents are left
// out — files can't travel in a spreadsheet cell.

/** Form steps, in the insert form's order. */
export const BULK_SECTIONS = [
  'Personal Information',
  'Identification & Docs',
  'Employment & Banking',
  'Family & Related Persons',
  'Account Information',
] as const;
export type BulkSection = (typeof BULK_SECTIONS)[number];

/** The insert form step that renders each section. */
export const SECTION_STEP: Record<BulkSection, FormStepKey> = {
  'Personal Information': 'personal',
  'Identification & Docs': 'identification',
  'Employment & Banking': 'employment',
  'Family & Related Persons': 'family',
  'Account Information': 'account',
};

export type BulkColumnKey = Exclude<keyof IndividualFormValues, 'avatarUrl'>;

type Option = { value: string; label?: string };

export type BulkColumn = {
  key: BulkColumnKey;
  header: string;
  section: BulkSection;
  required: boolean;
  kind?: 'date' | 'email' | 'phone';
  options?: Option[];
  example?: string;
  /** Older or common header spellings that also map to this column. */
  aliases?: string[];
};

const opts = (...values: string[]): Option[] => values.map((value) => ({ value }));

const GENDER = opts('Male', 'Female', 'Other');

const col = (
  section: BulkSection,
  key: BulkColumnKey,
  header: string,
  extra: Partial<Omit<BulkColumn, 'key' | 'header' | 'section'>> = {}
): BulkColumn => ({ section, key, header, required: false, ...extra });

const address = (section: BulkSection, prefix: string, keys: [BulkColumnKey, BulkColumnKey, BulkColumnKey, BulkColumnKey, BulkColumnKey, BulkColumnKey]) => {
  const labels = ['Country', 'City / Province', 'District (Khan)', 'Commune (Sangkat)', 'Home No.', 'Street No.'];
  return keys.map((key, i) => col(section, key, prefix ? `${prefix} – ${labels[i]}` : labels[i]));
};

const P: BulkSection = 'Personal Information';
const I: BulkSection = 'Identification & Docs';
const E: BulkSection = 'Employment & Banking';
const F: BulkSection = 'Family & Related Persons';
const A: BulkSection = 'Account Information';

export const BULK_COLUMNS: BulkColumn[] = [
  // Personal Information
  col(P, 'surnameEN', 'Surname (English)', { required: true, example: 'Sok', aliases: ['Surname (EN)', 'Surname', 'Last Name'] }),
  col(P, 'givenNameEN', 'Given Name (English)', { required: true, example: 'Dara', aliases: ['Given Name (EN)', 'Given Name', 'First Name'] }),
  col(P, 'surnameKH', 'Surname (Khmer)', { example: 'សុខ', aliases: ['Surname (KH)'] }),
  col(P, 'givenNameKH', 'Given Name (Khmer)', { example: 'ដារា', aliases: ['Given Name (KH)'] }),
  col(P, 'dateOfBirth', 'Date of Birth', { kind: 'date', example: '1992-04-18', aliases: ['DOB', 'Birth Date'] }),
  col(P, 'gender', 'Gender', { options: GENDER }),
  col(P, 'maritalStatus', 'Marital Status', { options: opts('Single', 'Married', 'Divorced', 'Widowed') }),
  col(P, 'nationality', 'Nationality', { example: 'Cambodian' }),
  col(P, 'email', 'Email Address', { required: true, kind: 'email', example: 'dara.sok@email.com', aliases: ['Email'] }),
  col(P, 'mobile', 'Mobile Phone', { kind: 'phone', example: '+855 12 345 678', aliases: ['Mobile', 'Phone'] }),
  col(P, 'telephone', 'Telephone (Fixed Line)', { kind: 'phone', aliases: ['Telephone'] }),
  ...address(P, '', ['country', 'city', 'state', 'commune', 'homeNo', 'streetNo']),

  // Identification & Docs
  col(I, 'residency', 'Residency', { required: true, options: opts('Resident', 'Non-Resident') }),
  col(I, 'idType', 'ID Type', {
    required: true,
    options: [
      { value: 'National ID', label: 'National ID Card' },
      { value: 'Passport', label: 'International Passport' },
      { value: 'Driver License', label: 'Driver License' },
      { value: 'Government ID', label: 'Government ID' },
      { value: 'Tax ID', label: 'Tax ID Document' },
    ],
  }),
  col(I, 'idNumber', 'ID Number', { required: true, example: '010293847' }),
  col(I, 'issuedBy', 'Issued By', { example: 'General Department of Identification' }),
  col(I, 'issuedDate', 'Issued Date', { kind: 'date', example: '2022-01-10' }),
  col(I, 'expiredDate', 'Expired Date', { kind: 'date', example: '2032-01-10', aliases: ['Expiry Date'] }),
  col(I, 'taxpayerIdNumber', 'Taxpayer ID Number (TIN)', { example: 'TIN-889102941', aliases: ['TIN'] }),
  col(I, 'note', 'Note'),

  // Employment & Banking
  col(E, 'occupation', 'Occupation', { example: 'Managing Director' }),
  col(E, 'position', 'Position / Title', { example: 'Founder & CEO' }),
  col(E, 'typeOfBusiness', 'Type of Business', { example: 'Technology & Logistics' }),
  col(E, 'levelOfPosition', 'Level of Position', {
    options: [
      { value: 'Staff', label: 'Staff / Associate' },
      { value: 'Senior', label: 'Senior Specialist' },
      { value: 'Manager', label: 'Manager / Dept Head' },
      { value: 'Executive / C-Level', label: 'Executive / C-Level / Director' },
    ],
  }),
  col(E, 'organizationName', 'Organization / Employer Name', { example: 'Vance Robotics Corp Ltd', aliases: ['Organization'] }),
  col(E, 'lengthOfWork', 'Length of Work', { example: '5 years' }),
  col(E, 'officeTelephone', 'Office Telephone', { kind: 'phone' }),
  ...address(E, 'Organization Address', ['orgCountry', 'orgCity', 'orgDistrict', 'orgCommune', 'orgHomeNo', 'orgStreetNo']),
  col(E, 'bankName', 'Bank Name', { options: opts('Canadia Bank Plc', 'Other Local Commercial Bank', 'Foreign Commercial Bank') }),
  col(E, 'accountOwner', 'Account Owner Name', { example: 'DARA SOK' }),
  col(E, 'savingAccount', 'Account Type', { example: 'Premier Savings' }),
  col(E, 'accountNumber', 'Bank Account Number', { example: '001 982 441 902' }),

  // Family & Related Persons
  col(F, 'spouseName', 'Spouse – Full Name (English / Khmer)'),
  col(F, 'spouseLatin', 'Spouse – Latin Name'),
  col(F, 'spouseGender', 'Spouse – Gender', { options: GENDER }),
  col(F, 'spouseRelationship', 'Spouse – Relationship', { example: 'Spouse' }),
  col(F, 'spouseEmail', 'Spouse – Email', { kind: 'email' }),
  col(F, 'spouseMobile', 'Spouse – Mobile Phone', { kind: 'phone' }),
  col(F, 'spouseOfficePhone', 'Spouse – Office Telephone', { kind: 'phone' }),
  col(F, 'spouseOccupation', 'Spouse – Occupation'),
  col(F, 'spousePosition', 'Spouse – Position / Title'),
  col(F, 'spouseBusiness', 'Spouse – Type of Business'),
  col(F, 'spouseYearWork', 'Spouse – Year of Employment', { example: '2020' }),
  ...address(F, 'Spouse Address', ['spouseCountry', 'spouseCity', 'spouseDistrict', 'spouseCommune', 'spouseHomeNo', 'spouseStreetNo']),
  col(F, 'relName', 'Related Person – Full Name'),
  col(F, 'relLatin', 'Related Person – Latin Name'),
  col(F, 'relGender', 'Related Person – Gender', { options: GENDER }),
  col(F, 'relRelationship', 'Related Person – Relationship', { example: 'Sibling' }),
  col(F, 'relMobile', 'Related Person – Mobile Phone', { kind: 'phone' }),
  col(F, 'relEmail', 'Related Person – Email', { kind: 'email' }),
  ...address(F, 'Related Person Address', ['relCountry', 'relCity', 'relDistrict', 'relCommune', 'relHomeNo', 'relStreetNo']),

  // Account Information
  col(A, 'investorIdNumber', 'Investor ID Number', { example: 'Auto-generated if blank' }),
  col(A, 'securitiesFirm', 'Securities Firm'),
  col(A, 'customerReceivedBy', 'Customer Received By (CSO)'),
  col(A, 'investorStatus', 'Profile Status', { options: opts('Normal', 'VIP', 'Restricted') }),
  col(A, 'applicationDate', 'Application Date', { kind: 'date' }),
  col(A, 'dateSentToSECC', 'Date Sent to SECC', { kind: 'date' }),
  col(A, 'dateReceivedFromSECC', 'Date Received from SECC', { kind: 'date' }),
  col(A, 'investorIdExpiredDate', 'Investor ID Expired Date', { kind: 'date' }),
  col(A, 'tradingAccountNumber', 'Trading Account Number', { example: 'Auto-assigned if blank' }),
  col(A, 'accountDate', 'Account Opening Date', { kind: 'date' }),
  col(A, 'currentAssignedSR', 'Current Assigned SR'),
  col(A, 'customerType', 'Customer Type', {
    required: true,
    options: [
      { value: 'Retail', label: 'Retail Investor' },
      { value: 'Corporate Officer', label: 'Corporate Officer' },
      { value: 'High Net Worth', label: 'High Net Worth (HNW)' },
      { value: 'Institutional', label: 'Institutional' },
    ],
  }),
  col(A, 'educationBackground', 'Education Background', {
    options: [
      { value: 'High School', label: 'High School' },
      { value: "Bachelor's", label: "Bachelor's Degree" },
      { value: "Master's", label: "Master's Degree" },
      { value: 'Doctorate', label: 'Doctorate / Ph.D.' },
      { value: 'Other', label: 'Other Professional' },
    ],
  }),
  col(A, 'securitiesKnowledge', 'Securities Knowledge', { options: opts('None', 'Beginner', 'Intermediate', 'Advanced', 'Professional') }),
  col(A, 'riskCategory', 'Risk Category', {
    options: [
      { value: 'low', label: 'Low Risk (Capital Preservation)' },
      { value: 'moderate', label: 'Moderate Risk (Balanced Growth)' },
      { value: 'high', label: 'High Risk (Aggressive Capital Appreciation)' },
    ],
  }),
  col(A, 'investmentExperience', 'Investment Experience', { options: opts('< 1 year', '1 - 3 years', '3 - 5 years', '5+ years') }),
];

export const COLUMN_BY_KEY = Object.fromEntries(BULK_COLUMNS.map((c) => [c.key, c])) as Record<BulkColumnKey, BulkColumn>;

/** What a column accepts, for the guide and error messages. */
export const describeColumn = (c: BulkColumn) =>
  c.options ? c.options.map((o) => o.value).join(' · ')
  : c.kind === 'date' ? 'YYYY-MM-DD'
  : c.kind === 'email' ? 'name@domain.com'
  : c.kind === 'phone' ? 'Phone number'
  : 'Text';

export const MAX_ROWS = 1000;
export const MAX_FILE_MB = 5;

// ─── Parsed rows ──────────────────────────────────────────────────────────────

export type RowData = Record<BulkColumnKey, string>;
export type IssueLevel = 'error' | 'warning';
export type RowIssue = { level: IssueLevel; message: string; column?: BulkColumnKey; watchlist?: boolean };
export type RowStatus = 'ready' | 'warning' | 'error';

export type BulkRow = {
  /** Spreadsheet row number, so staff can find it in their own file. */
  rowNumber: number;
  data: RowData;
  issues: RowIssue[];
  status: RowStatus;
  excluded: boolean;
  /** Added in the edit dialog — a spreadsheet can't carry files. */
  avatarUrl?: string;
  documents?: SupportingDocument[];
};

export type ParseResult =
  | { ok: true; rows: BulkRow[]; unknownHeaders: string[] }
  | { ok: false; message: string; missingColumns?: string[] };

const normalize = (s: string) => s.toLowerCase().replace(/\*/g, '').replace(/[^a-z0-9]/g, '');

const emptyRow = () => Object.fromEntries(BULK_COLUMNS.map((c) => [c.key, ''])) as RowData;

/** Maps the sheet's header row to template columns (order-free, tolerant of spacing/case/aliases). */
export function mapRows(sheet: SheetRows): ParseResult {
  const headerIdx = sheet.findIndex((row) => row.some((cell) => cell.trim()));
  if (headerIdx < 0) return { ok: false, message: 'The file is empty.' };

  const header = sheet[headerIdx];
  const lookup = new Map<string, BulkColumnKey>();
  for (const c of BULK_COLUMNS) {
    lookup.set(normalize(c.key), c.key);
    c.aliases?.forEach((a) => lookup.set(normalize(a), c.key));
  }
  // Official headers last so they win over any alias spelled the same way
  for (const c of BULK_COLUMNS) lookup.set(normalize(c.header), c.key);

  const colMap: (BulkColumnKey | null)[] = header.map((h) => lookup.get(normalize(h)) ?? null);
  const unknownHeaders = header.filter((h, i) => h.trim() && !colMap[i]);
  const missing = BULK_COLUMNS.filter((c) => c.required && !colMap.includes(c.key)).map((c) => c.header);
  if (missing.length) {
    return {
      ok: false,
      message: 'Required columns are missing from the header row. Use the latest template.',
      missingColumns: missing,
    };
  }

  const rows: BulkRow[] = [];
  for (let r = headerIdx + 1; r < sheet.length; r++) {
    const cells = sheet[r] ?? [];
    if (!cells.some((cell) => cell?.trim())) continue;
    const data = emptyRow();
    colMap.forEach((key, i) => {
      if (!key) return;
      let value = (cells[i] ?? '').trim();
      if (COLUMN_BY_KEY[key].kind === 'date') value = excelSerialToIso(value) ?? value;
      data[key] = value;
    });
    rows.push({ rowNumber: r + 1, data, issues: [], status: 'ready', excluded: false });
  }

  if (!rows.length) return { ok: false, message: 'The file has a header row but no customer records.' };
  if (rows.length > MAX_ROWS) {
    return { ok: false, message: `The file has ${rows.length.toLocaleString()} rows. Split it into files of ${MAX_ROWS.toLocaleString()} rows or fewer.` };
  }
  return { ok: true, rows, unknownHeaders };
}

// ─── Validation ───────────────────────────────────────────────────────────────

/** Accepts YYYY-MM-DD and DD/MM/YYYY; returns ISO or null. */
export function parseDate(value: string): string | null {
  let y: number, m: number, d: number;
  const iso = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const dmy = value.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (iso) [y, m, d] = [Number(iso[1]), Number(iso[2]), Number(iso[3])];
  else if (dmy) [d, m, y] = [Number(dmy[1]), Number(dmy[2]), Number(dmy[3])];
  else return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return date.toISOString().slice(0, 10);
}

/** Accepts an option's value or its form label, any case; returns the stored value. */
export const matchOption = (value: string, options: Option[]) =>
  options.find((o) => normalize(o.value) === normalize(value) || (o.label && normalize(o.label) === normalize(value)))?.value ?? null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type ValidationContext = {
  existingById: Map<string, Individual>;
  existingEmails: Set<string>;
  /** Sanction-flagged customers, keyed by ID number and by lower-cased English name. */
  watchById: Map<string, Individual>;
  watchByName: Map<string, Individual>;
};

export function buildValidationContext(individuals: Individual[]): ValidationContext {
  const flagged = individuals.filter((i) => i.tags?.some((t) => /sanction|blacklist/i.test(t)));
  const key = (s: string) => s.trim().toLowerCase();
  return {
    existingById: new Map(individuals.filter((i) => i.idNumber).map((i) => [key(i.idNumber ?? ''), i])),
    existingEmails: new Set(individuals.map((i) => key(i.email)).filter(Boolean)),
    watchById: new Map(flagged.filter((i) => i.idNumber).map((i) => [key(i.idNumber ?? ''), i])),
    watchByName: new Map(flagged.map((i) => [key(i.fullNameEN ?? ''), i])),
  };
}

const DAY = 86400000;

function validateRow(row: BulkRow, ctx: ValidationContext, idCounts: Map<string, number[]>): RowIssue[] {
  const d = row.data;
  const issues: RowIssue[] = [];
  const err = (message: string, column?: BulkColumnKey) => issues.push({ level: 'error', message, column });
  const warn = (message: string, column?: BulkColumnKey) => issues.push({ level: 'warning', message, column });

  // Watchlist first: it outranks every other finding
  const idKey = d.idNumber.trim().toLowerCase();
  const nameKey = `${d.givenNameEN} ${d.surnameEN}`.trim().toLowerCase();
  const hit = (idKey && ctx.watchById.get(idKey)) || (nameKey && ctx.watchByName.get(nameKey));
  if (hit) {
    issues.push({
      level: 'error',
      watchlist: true,
      column: ctx.watchById.get(idKey) ? 'idNumber' : 'givenNameEN',
      message: `Watchlist match — ${hit.fullNameEN} (${hit.customerId}) is sanction-flagged`,
    });
  }

  for (const c of BULK_COLUMNS) {
    const v = d[c.key].trim();
    if (!v) {
      if (c.required) err(`${c.header} is required`, c.key);
      continue;
    }
    if (c.options && !matchOption(v, c.options)) err(`${c.header} "${v}" is not one of: ${describeColumn(c).replace(/ · /g, ', ')}`, c.key);
    else if (c.kind === 'date' && !parseDate(v)) err(`${c.header} "${v}" is not a valid date (YYYY-MM-DD)`, c.key);
    else if (c.kind === 'email' && !EMAIL_RE.test(v)) err(`${c.header} "${v}" is not valid`, c.key);
    else if (c.kind === 'phone' && v.replace(/\D/g, '').length < 8) err(`${c.header} is too short`, c.key);
  }

  const now = Date.now();
  const dob = parseDate(d.dateOfBirth);
  if (dob) {
    const age = (now - Date.parse(dob)) / (365.25 * DAY);
    if (age < 0) err('Date of Birth is in the future', 'dateOfBirth');
    else if (age < 18) err('Customer is under 18', 'dateOfBirth');
    else if (age > 110) warn('Date of Birth looks unlikely — please double-check', 'dateOfBirth');
  }

  const expiry = parseDate(d.expiredDate);
  if (expiry) {
    const left = (Date.parse(expiry) - now) / DAY;
    if (left < 0) err('ID document has expired', 'expiredDate');
    else if (left < 90) warn(`ID expires in ${Math.ceil(left)} days`, 'expiredDate');
  }
  const issued = parseDate(d.issuedDate);
  if (issued && expiry && issued >= expiry) err('Issued Date must be before Expired Date', 'issuedDate');

  if (EMAIL_RE.test(d.email) && ctx.existingEmails.has(d.email.toLowerCase())) warn('Email is already used by an existing customer', 'email');

  if (idKey) {
    const existing = ctx.existingById.get(idKey);
    if (existing && !hit) err(`Already registered as ${existing.fullNameEN} (${existing.customerId})`, 'idNumber');
    const dupes = (idCounts.get(idKey) ?? []).filter((n) => n !== row.rowNumber);
    if (dupes.length) err(`Duplicate ID Number — also on row ${dupes.join(', ')}`, 'idNumber');
  }

  if (!d.surnameKH.trim() || !d.givenNameKH.trim()) warn('Khmer name is empty — English name will be used', 'surnameKH');

  return issues;
}

/** Re-validates every row (duplicates depend on the whole file, so always run over all rows). */
export function validateRows(rows: BulkRow[], ctx: ValidationContext): BulkRow[] {
  const idCounts = new Map<string, number[]>();
  for (const row of rows) {
    if (row.excluded) continue;
    const id = row.data.idNumber.trim().toLowerCase();
    if (id) idCounts.set(id, [...(idCounts.get(id) ?? []), row.rowNumber]);
  }
  return rows.map((row) => {
    const issues = validateRow(row, ctx, idCounts);
    const status: RowStatus = issues.some((i) => i.level === 'error') ? 'error' : issues.length ? 'warning' : 'ready';
    return { ...row, issues, status };
  });
}

// ─── Row → form values ────────────────────────────────────────────────────────

/** Same values the insert form would hold: blank cells keep the form's defaults. */
export function rowToFormValues(d: RowData): IndividualFormValues {
  const values = createEmptyFormValues();
  const target = values as Record<BulkColumnKey, string>;
  for (const c of BULK_COLUMNS) {
    const v = d[c.key].trim();
    if (!v) continue;
    const parsed = c.options ? matchOption(v, c.options) : c.kind === 'date' ? parseDate(v) : v;
    if (parsed) target[c.key] = parsed;
  }
  return values;
}

/** Back from the insert form's values to spreadsheet cells, after an edit. */
export function formValuesToRow(values: IndividualFormValues): RowData {
  return Object.fromEntries(BULK_COLUMNS.map((c) => [c.key, String(values[c.key] ?? '')])) as RowData;
}

export const templateRows = (): SheetRows => [BULK_COLUMNS.map((c) => (c.required ? `${c.header} *` : c.header))];

// ─── Demo file ────────────────────────────────────────────────────────────────

/** Demo workbook loaded when staff click the upload area: a mix of ready, warning, error and watchlist rows. */
export const SAMPLE_FILE = { name: 'customer-registration-batch.xlsx', size: 48_312 };

const SAMPLE_CUSTOMERS: Partial<RowData>[] = [
  { surnameEN: 'Sok', givenNameEN: 'Dara', surnameKH: 'សុខ', givenNameKH: 'ដារា', dateOfBirth: '1992-04-18', gender: 'Male', maritalStatus: 'Married', nationality: 'Cambodian', email: 'dara.sok@email.com', mobile: '+855 12 345 678', country: 'Cambodia', city: 'Phnom Penh', state: 'Chamkar Mon', residency: 'Resident', idType: 'National ID', idNumber: '010293847', issuedDate: '2022-01-10', expiredDate: '2032-01-10', occupation: 'Engineer', position: 'Senior Engineer', organizationName: 'Smart Axiata', levelOfPosition: 'Senior', bankName: 'Canadia Bank Plc', accountNumber: '001 482 019 334', customerType: 'Retail', riskCategory: 'Moderate', investmentExperience: '1 - 3 years' },
  { surnameEN: 'Chan', givenNameEN: 'Sreyneang', surnameKH: 'ចាន់', givenNameKH: 'ស្រីនាង', dateOfBirth: '1995-09-02', gender: 'Female', maritalStatus: 'Single', nationality: 'Cambodian', email: 'sreyneang.chan@email.com', mobile: '+855 77 812 334', country: 'Cambodia', city: 'Siem Reap', residency: 'Resident', idType: 'National ID', idNumber: '011847562', issuedDate: '2021-06-15', expiredDate: '2031-06-15', occupation: 'Accountant', organizationName: 'ABA Bank', customerType: 'Retail', riskCategory: 'Low' },
  { surnameEN: 'Kim', givenNameEN: 'Sopheap', surnameKH: 'គីម', givenNameKH: 'សុភាព', dateOfBirth: '1988-12-11', gender: 'Male', maritalStatus: 'Married', nationality: 'Cambodian', email: 'sopheap.kim@email.com', mobile: '+855 92 455 610', country: 'Cambodia', city: 'Phnom Penh', residency: 'Resident', idType: 'National ID', idNumber: '010556931', issuedDate: '2020-03-01', expiredDate: '2030-03-01', occupation: 'Director', position: 'Managing Director', organizationName: 'Kim Holdings', levelOfPosition: 'Executive / C-Level', spouseName: 'Lim Sothea', spouseGender: 'Female', spouseRelationship: 'Spouse', customerType: 'High Net Worth (HNW)', riskCategory: 'Moderate', educationBackground: "Master's Degree" },
  { surnameEN: 'Lim', givenNameEN: 'Bopha', surnameKH: 'លឹម', givenNameKH: 'បុប្ផា', dateOfBirth: '1990-07-23', gender: 'Female', maritalStatus: 'Single', nationality: 'Cambodian', email: 'bopha.lim@email.com', mobile: '+855 15 667 902', country: 'Cambodia', city: 'Battambang', residency: 'Resident', idType: 'National ID', idNumber: '012003478', issuedDate: '2019-11-20', expiredDate: '2029-11-20', occupation: 'Teacher', organizationName: 'Ministry of Education', customerType: 'Retail', riskCategory: 'Low' },
  { surnameEN: 'Heng', givenNameEN: 'Rithy', surnameKH: 'ហេង', givenNameKH: 'ឫទ្ធី', dateOfBirth: '1985-02-14', gender: 'Male', maritalStatus: 'Married', nationality: 'Cambodian', email: 'rithy.heng@email.com', mobile: '+855 10 220 118', country: 'Cambodia', city: 'Phnom Penh', residency: 'Resident', idType: 'Passport', idNumber: 'N01928374', issuedDate: '2017-01-05', expiredDate: '2027-01-05', occupation: 'CFO', organizationName: 'Heng Group', levelOfPosition: 'Executive / C-Level', customerType: 'Corporate Officer', riskCategory: 'High' },
  { surnameEN: 'Tan', givenNameEN: 'Wei Ming', dateOfBirth: '1979-05-30', gender: 'Male', maritalStatus: 'Married', nationality: 'Singaporean', email: 'weiming.tan@email.sg', mobile: '+65 9123 4567', country: 'Singapore', residency: 'Non-Resident', idType: 'Passport', idNumber: 'E7731902K', issuedDate: '2018-08-12', expiredDate: '2028-08-12', occupation: 'Fund Manager', organizationName: 'Lion Capital', customerType: 'Institutional', riskCategory: 'Moderate' },
  { surnameEN: 'Phan', givenNameEN: 'Sokha', surnameKH: 'ផាន់', givenNameKH: 'សុខា', dateOfBirth: '1998-03-09', gender: 'Female', maritalStatus: 'Single', nationality: 'Cambodian', email: 'sokha.phan@email.com', mobile: '+855 96 330 712', country: 'Cambodia', city: 'Kampot', residency: 'Resident', idType: 'National ID', idNumber: '013442817', issuedDate: '2016-11-01', expiredDate: '2026-11-01', occupation: 'Designer', customerType: 'Retail', riskCategory: 'Low' },
  { surnameEN: 'Vance', givenNameEN: 'Eleanor', dateOfBirth: '1987-03-14', gender: 'Female', maritalStatus: 'Married', nationality: 'American', email: 'eleanor.vance@vancetech.io', mobile: '+1 415 555 0142', residency: 'Non-Resident', idType: 'Passport', idNumber: 'KHM-019829381', issuedDate: '2021-02-02', expiredDate: '2031-02-02', occupation: 'Founder', organizationName: 'VanceTech', customerType: 'High Net Worth', riskCategory: 'Moderate' },
  { surnameEN: 'Silva', givenNameEN: 'Mateo', dateOfBirth: '1981-10-04', gender: 'Male', maritalStatus: 'Married', nationality: 'Chilean', email: 'mateo.silva@email.com', mobile: '+56 9 5555 1234', residency: 'Non-Resident', idType: 'Passport', idNumber: 'CHL-14892019-K', issuedDate: '2019-05-05', expiredDate: '2029-05-05', occupation: 'Trader', organizationName: 'Andes Capital', customerType: 'Institutional', riskCategory: 'High' },
  { surnameEN: 'Ouk', givenNameEN: 'Vanna', surnameKH: 'អ៊ុក', givenNameKH: 'វណ្ណា', dateOfBirth: '2010-06-18', gender: 'Male', maritalStatus: 'Single', nationality: 'Cambodian', email: 'vanna.ouk@email.com', mobile: '+855 81 902 337', city: 'Phnom Penh', residency: 'Resident', idType: 'National ID', idNumber: '014550193', issuedDate: '2024-01-10', expiredDate: '2034-01-10', occupation: 'Student', customerType: 'Retail', riskCategory: 'Low' },
  { surnameEN: 'Mao', givenNameEN: 'Chenda', surnameKH: 'ម៉ៅ', givenNameKH: 'ចិន្តា', dateOfBirth: '1993-08-27', gender: 'Female', maritalStatus: 'Single', nationality: 'Cambodian', email: 'chenda.mao@email', mobile: '+855 70 118 456', city: 'Phnom Penh', residency: 'Resident', idType: 'National ID', idNumber: '010293847', issuedDate: '2022-04-04', expiredDate: '2032-04-04', occupation: 'Nurse', organizationName: 'Calmette Hospital', customerType: 'Retail', riskCategory: 'Moderate' },
  { surnameEN: 'Seng', givenNameEN: 'Piseth', surnameKH: 'សេង', givenNameKH: 'ពិសិដ្ឋ', dateOfBirth: '18/04/1991', gender: 'M', maritalStatus: 'Single', nationality: 'Cambodian', email: 'piseth.seng@email.com', mobile: '+855 12 774 219', city: 'Takeo', residency: 'Resident', idType: 'Natl ID', idNumber: '015882047', issuedDate: '2015-02-01', expiredDate: '2025-02-01', occupation: 'Driver', organizationName: 'Grab', customerType: 'VIP', riskCategory: 'Moderate' },
  { surnameEN: 'Nhem', givenNameEN: 'Ratana', surnameKH: 'ញឹម', givenNameKH: 'រតនា', dateOfBirth: '1996-01-12', gender: 'Female', maritalStatus: 'Single', nationality: 'Cambodian', email: 'ratana.nhem@email.com', mobile: '+855 89 441 205', city: 'Phnom Penh', residency: 'Resident', idType: 'National ID', idNumber: '016339274', issuedDate: '2021-09-09', expiredDate: '2031-09-09', occupation: 'Pharmacist', organizationName: 'U-Care', riskCategory: 'Low' },
];

/** These IDs must stay as-is: one is an existing customer, the other a watchlist match. */
const FIXED_SAMPLE_IDS = new Set(['KHM-019829381', 'CHL-14892019-K']);

/**
 * A fresh copy of the demo file on every load: new ID numbers and emails, so customers registered
 * from an earlier load don't turn every row into "Already registered". The planted problems stay —
 * the shared ID on two rows, the invalid email, the existing customer and the watchlist match.
 */
export const sampleRows = (): SheetRows => {
  const batch = String(Math.floor(100 + Math.random() * 900));
  const ids = new Map<string, string>();
  const freshId = (id: string) => {
    if (FIXED_SAMPLE_IDS.has(id)) return id;
    if (!ids.has(id)) ids.set(id, `${id.slice(0, -5)}${String(ids.size).padStart(2, '0')}${batch}`);
    return ids.get(id)!;
  };
  const freshEmail = (email: string) =>
    /^[^@]+@[^@]+\.[^@]+$/.test(email) ? email.replace('@', `.${batch}@`) : email;
  // Keep one ID inside the 90-day expiry warning whatever today's date is
  const soon = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

  return [
    templateRows()[0],
    ...SAMPLE_CUSTOMERS.map((customer) => {
      const row: Partial<RowData> = { ...customer };
      if (row.idNumber) row.idNumber = freshId(row.idNumber);
      if (row.email && row.idNumber && !FIXED_SAMPLE_IDS.has(row.idNumber)) row.email = freshEmail(row.email);
      if (row.surnameEN === 'Phan') row.expiredDate = soon;
      return BULK_COLUMNS.map((c) => row[c.key] ?? '');
    }),
  ];
};
