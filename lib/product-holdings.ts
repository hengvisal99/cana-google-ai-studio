import { differenceInMonths, endOfMonth, isValid, parseISO, startOfDay, subMonths } from 'date-fns';
import type { CustomerType, CustomerTypeRecord, Individual } from '@/types';
import { CUSTOMER_TYPES, ipoName } from '@/lib/customer-types';

/**
 * Dashboard figures derived from customer type records — which customers hold which
 * product, and how much they subscribed to IPOs. IPO subscriptions are the only money
 * the records carry; there is no portfolio data to report.
 */

/** The dashboard's "today" — its date presets all end here. */
export const DATA_END = parseISO('2026-08-31');

/** Business start date per product form; records without one fall back to createdAt. */
const START_DATE_KEYS = ['createdDate', 'takenDate', 'registeredDate', 'subscriptionDate'];
/** Where a closed record's end date lives, in order of preference. */
const END_DATE_KEYS = ['closedDate', 'expiredDate'];

export interface Holding {
  customerId: string;
  typeIndex: number;
  start: Date;
  end: Date | null;
}

function readDate(values: CustomerTypeRecord['values'], keys: string[]) {
  for (const key of keys) {
    const raw = values[key];
    if (typeof raw !== 'string' || !raw) continue;
    const date = parseISO(raw);
    if (isValid(date)) return startOfDay(date);
  }
  return null;
}

/** Turns each record into the span its customer held the product. Records of unknown types are dropped. */
export function toHoldings(records: CustomerTypeRecord[]): Holding[] {
  return records.flatMap((record) => {
    const typeIndex = CUSTOMER_TYPES.findIndex((t) => t.id === record.typeId);
    if (typeIndex < 0) return [];

    const start = readDate(record.values, START_DATE_KEYS) ?? startOfDay(parseISO(record.createdAt));
    // CSX Screen closes with 'Close'; Employee Trading and VIP Customer with 'Inactive'
    const isClosed = record.values.status === 'Close' || record.values.status === 'Inactive';
    const end = isClosed
      ? readDate(record.values, END_DATE_KEYS) ?? startOfDay(parseISO(record.updatedAt))
      : null;

    return [{ customerId: record.customerId, typeIndex, start, end }];
  });
}

const isHeldOn = (h: Holding, day: Date) => h.start <= day && (!h.end || h.end > day);

/** Distinct customers holding each product on `day` (several records of one type count once). */
export function customersHolding(holdings: Holding[], day: Date) {
  const perType = CUSTOMER_TYPES.map(() => new Set<string>());
  for (const h of holdings) {
    if (isHeldOn(h, day)) perType[h.typeIndex].add(h.customerId);
  }
  return perType.map((s) => s.size);
}

/** Distinct customers who started each product between `from` and `to`, inclusive. */
export function customersJoining(holdings: Holding[], from: Date, to: Date) {
  const perType = CUSTOMER_TYPES.map(() => new Set<string>());
  for (const h of holdings) {
    if (h.start >= from && h.start <= to) perType[h.typeIndex].add(h.customerId);
  }
  return perType.map((s) => s.size);
}

// ---------------------------------------------------------------------------
// IPO subscriptions
// ---------------------------------------------------------------------------

export interface IpoSubscription {
  customerId: string;
  ipoNameId: string;
  /** Subscribed total (Sub Total Amount) */
  amount: number;
  date: Date;
}

/**
 * IPO records as subscriptions up to DATA_END; the amount is the subscribed total
 * (Sub Total Amount), not the book-building bid.
 */
export function toIpoSubscriptions(records: CustomerTypeRecord[]): IpoSubscription[] {
  return records.flatMap((record) => {
    if (record.typeId !== 'ipo-customer') return [];
    const date =
      readDate(record.values, ['subscriptionDate']) ?? startOfDay(parseISO(record.createdAt));
    if (date > DATA_END) return [];
    return [
      {
        customerId: record.customerId,
        ipoNameId: String(record.values.ipoNameId ?? '—'),
        amount: Number(record.values.subTotalAmount) || 0,
        date,
      },
    ];
  });
}

const sumAmounts = (subs: IpoSubscription[]) => subs.reduce((sum, s) => sum + s.amount, 0);

/** Last day of the month before DATA_END: the "last month" every MoM figure compares against. */
const PREVIOUS_MONTH_END = endOfMonth(subMonths(DATA_END, 1));

/** Total subscribed and the change against the end of the previous month. */
export function ipoTotals(subs: IpoSubscription[]) {
  const total = sumAmounts(subs);
  const previous = sumAmounts(subs.filter((s) => s.date <= PREVIOUS_MONTH_END));
  return { total, changePercent: previous ? ((total - previous) / previous) * 100 : null };
}

export interface TopIpoCustomer {
  individual: Individual | undefined;
  customerId: string;
  amount: number;
  /** Subscribed as of the end of the previous month */
  previousAmount: number;
  /** Change against the previous month in %; null when the customer had nothing subscribed then */
  changePercent: number | null;
  /** Years since the customer joined (Individual.createdAt), to one decimal; null when unknown */
  tenureYears: number | null;
}

function tenureYears(individual: Individual | undefined) {
  const joined = individual ? parseISO(individual.createdAt) : null;
  if (!joined || !isValid(joined)) return null;
  return Math.round((differenceInMonths(DATA_END, joined) / 12) * 10) / 10;
}

/** Customers ranked by total IPO subscription, largest first. */
export function topIpoCustomers(subs: IpoSubscription[], individuals: Individual[], limit = 5): TopIpoCustomer[] {
  const byCustomer = new Map<string, TopIpoCustomer>();
  for (const s of subs) {
    const individual = individuals.find((i) => i.id === s.customerId);
    const row = byCustomer.get(s.customerId) ?? {
      individual,
      customerId: s.customerId,
      amount: 0,
      previousAmount: 0,
      changePercent: null,
      tenureYears: tenureYears(individual),
    };
    row.amount += s.amount;
    if (s.date <= PREVIOUS_MONTH_END) row.previousAmount += s.amount;
    byCustomer.set(s.customerId, row);
  }
  return [...byCustomer.values()]
    .map((row) => ({
      ...row,
      changePercent: row.previousAmount ? ((row.amount - row.previousAmount) / row.previousAmount) * 100 : null,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

export interface SegmentRow {
  segment: CustomerType;
  customers: number;
  active: number;
  ipoAmount: number;
}

const SEGMENT_ORDER: CustomerType[] = ['Retail', 'High Net Worth', 'Institutional', 'Corporate Officer'];

/** Customers per Customer Type, with active trading accounts and IPO subscribed. */
export function segmentSummary(individuals: Individual[], subs: IpoSubscription[]): SegmentRow[] {
  return SEGMENT_ORDER.map((segment) => {
    const members = individuals.filter((i) => i.customerType === segment);
    const ids = new Set(members.map((i) => i.id));
    return {
      segment,
      customers: members.length,
      active: members.filter((i) => i.accountStatus === 'Active').length,
      ipoAmount: sumAmounts(subs.filter((s) => ids.has(s.customerId))),
    };
  });
}

export interface IpoRankRow {
  ipoNameId: string;
  name: string;
  /** Distinct customers who subscribed */
  subscribers: number;
  subscribed: number;
}

/** IPOs ranked by subscribed amount, largest first, with a total across all of them. */
export function topIpos(subs: IpoSubscription[]) {
  const byIpo = new Map<string, IpoSubscription[]>();
  for (const s of subs) byIpo.set(s.ipoNameId, [...(byIpo.get(s.ipoNameId) ?? []), s]);

  const rows: IpoRankRow[] = [...byIpo.entries()]
    .map(([ipoNameId, list]) => ({
      ipoNameId,
      name: ipoName(ipoNameId),
      subscribers: new Set(list.map((s) => s.customerId)).size,
      subscribed: sumAmounts(list),
    }))
    .sort((a, b) => b.subscribed - a.subscribed);

  // A customer in several IPOs is one subscriber overall
  const total = { subscribers: new Set(subs.map((s) => s.customerId)).size, subscribed: sumAmounts(subs) };

  return { rows, total };
}
