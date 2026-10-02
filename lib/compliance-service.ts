import { differenceInDays, parseISO, isValid } from 'date-fns';
import type { Individual, AppNotification } from '@/types';

export interface ExpiryAlert {
  customerId: string;
  customerName: string;
  investorId: string;
  field: string;
  label: string;
  expiryDate: string;
  daysRemaining: number;
  severity: 'critical' | 'warning' | 'upcoming';
}

export interface KYCComplianceRow {
  customerId: string;
  customerName: string;
  investorId: string;
  kycStatus: string;
  riskRating: string;
  lastReviewDate: string;
  nextReviewDue: string;
  daysUntilReview: number;
  isPEP: boolean;
  accountStatus: string;
}

const today = () => new Date();

function daysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const d = parseISO(dateStr);
  if (!isValid(d)) return null;
  return differenceInDays(d, today());
}

function severity(days: number): ExpiryAlert['severity'] {
  if (days <= 7) return 'critical';
  if (days <= 30) return 'warning';
  return 'upcoming';
}

export function getDocumentExpiryAlerts(individuals: Individual[], windowDays = 90): ExpiryAlert[] {
  const alerts: ExpiryAlert[] = [];
  for (const ind of individuals) {
    if (!ind.expiredDate) continue;
    const days = daysUntil(ind.expiredDate);
    if (days === null) continue;
    if (days <= windowDays) {
      alerts.push({
        customerId: ind.id,
        customerName: ind.fullNameEN ?? `${ind.givenNameEN} ${ind.surnameEN}`,
        investorId: ind.investorIdInfo?.investorIdNumber ?? '—',
        field: 'expiredDate',
        label: `${ind.idType || 'ID Card'} Expiry`,
        expiryDate: ind.expiredDate,
        daysRemaining: days,
        severity: severity(days),
      });
    }
  }
  return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

// Static demo data for the Document Expiry tab — offsets are days from today
const STATIC_DOCUMENT_EXPIRY: Array<Pick<ExpiryAlert, 'customerId' | 'customerName' | 'investorId' | 'label'> & { offset: number }> = [
  { customerId: 'CUS-000124', customerName: 'Sok Dara',        investorId: 'INV-2023-00124', label: 'National ID Expiry',     offset: -5 },
  { customerId: 'CUS-000087', customerName: 'Chan Sreymom',    investorId: 'INV-2022-00087', label: 'Passport Expiry',        offset: 2 },
  { customerId: 'CUS-000231', customerName: 'Lim Vannak',      investorId: 'INV-2024-00231', label: 'National ID Expiry',     offset: 6 },
  { customerId: 'CUS-000045', customerName: 'Keo Sophea',      investorId: 'INV-2021-00045', label: 'Passport Expiry',        offset: 12 },
  { customerId: 'CUS-000312', customerName: 'Heng Rithy',      investorId: 'INV-2024-00312', label: 'Residence Permit Expiry', offset: 19 },
  { customerId: 'CUS-000158', customerName: 'Meas Chanthou',   investorId: 'INV-2023-00158', label: 'National ID Expiry',     offset: 27 },
  { customerId: 'CUS-000276', customerName: 'Ouk Piseth',      investorId: 'INV-2024-00276', label: 'Passport Expiry',        offset: 41 },
  { customerId: 'CUS-000093', customerName: 'Tep Bopha',       investorId: 'INV-2022-00093', label: 'National ID Expiry',     offset: 55 },
  { customerId: 'CUS-000340', customerName: 'Nguon Kimheng',   investorId: 'INV-2025-00340', label: 'Passport Expiry',        offset: 68 },
  { customerId: 'CUS-000199', customerName: 'Pich Sokunthea',  investorId: 'INV-2023-00199', label: 'National ID Expiry',     offset: 84 },
];

export function getStaticDocumentExpiryAlerts(windowDays = 90): ExpiryAlert[] {
  return STATIC_DOCUMENT_EXPIRY
    .filter((s) => s.offset <= windowDays)
    .map(({ offset, ...s }) => {
      const d = today();
      d.setDate(d.getDate() + offset);
      return { ...s, field: 'expiredDate', expiryDate: d.toISOString().slice(0, 10), daysRemaining: offset, severity: severity(offset) };
    })
    .sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export function getInvestorIdExpiryAlerts(individuals: Individual[], windowDays = 90): ExpiryAlert[] {
  const alerts: ExpiryAlert[] = [];
  for (const ind of individuals) {
    const expDate = ind.investorIdInfo?.investorIdExpiredDate;
    if (!expDate) continue;
    const days = daysUntil(expDate);
    if (days === null) continue;
    if (days <= windowDays) {
      alerts.push({
        customerId: ind.id,
        customerName: ind.fullNameEN ?? `${ind.givenNameEN} ${ind.surnameEN}`,
        investorId: ind.investorIdInfo?.investorIdNumber ?? '—',
        field: 'investorIdExpiredDate',
        label: 'SECC Investor ID Expiry',
        expiryDate: expDate,
        daysRemaining: days,
        severity: severity(days),
      });
    }
  }
  return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export function getKYCComplianceRows(individuals: Individual[]): KYCComplianceRow[] {
  return individuals.map((ind) => {
    const createdAt = ind.createdAt ? parseISO(ind.createdAt) : null;
    const intervalYears = ind.riskRating === 'high' ? 1 : 3;
    let nextReviewDue = '—';
    let daysUntilReview = 9999;
    if (createdAt && isValid(createdAt)) {
      const review = new Date(createdAt);
      review.setFullYear(review.getFullYear() + intervalYears);
      nextReviewDue = review.toISOString().slice(0, 10);
      daysUntilReview = differenceInDays(review, today());
    }
    const pos = (ind.employment?.position ?? '').toLowerCase();
    const isPEP =
      pos.includes('minister') ||
      pos.includes('senator') ||
      pos.includes('director general') ||
      pos.includes('governor');

    return {
      customerId: ind.id,
      customerName: ind.fullNameEN ?? `${ind.givenNameEN} ${ind.surnameEN}`,
      investorId: ind.investorIdInfo?.investorIdNumber ?? '—',
      kycStatus: ind.kycStatus,
      riskRating: ind.riskRating,
      lastReviewDate: ind.createdAt ? ind.createdAt.slice(0, 10) : '—',
      nextReviewDue,
      daysUntilReview,
      isPEP,
      accountStatus: ind.accountStatus,
    };
  });
}

export function buildComplianceNotifications(individuals: Individual[]): AppNotification[] {
  const notes: AppNotification[] = [];
  const now = new Date().toISOString();
  const when = (a: ExpiryAlert) => a.daysRemaining <= 0
    ? `expired ${Math.abs(a.daysRemaining)} day${Math.abs(a.daysRemaining) !== 1 ? 's' : ''} ago`
    : `expires in ${a.daysRemaining} day${a.daysRemaining !== 1 ? 's' : ''}`;

  const docAlerts = getDocumentExpiryAlerts(individuals, 30);
  const idAlerts = getInvestorIdExpiryAlerts(individuals, 30);

  docAlerts.forEach((a, i) => {
    notes.push({
      id: `notif-doc-${i}`,
      type: a.severity === 'critical' ? 'error' : 'warning',
      category: 'Document Expiry',
      title: a.daysRemaining <= 0 ? 'ID Card Expired' : a.severity === 'critical' ? 'ID Card Expiring Soon!' : 'ID Card Expiry Warning',
      message: `${a.customerName}'s ${a.label} ${when(a)} (${a.expiryDate}).`,
      relatedCustomerId: a.customerId,
      relatedCustomerName: a.customerName,
      isRead: false,
      createdAt: now,
      actionLabel: 'View Compliance',
      actionPage: 'compliance',
    });
  });

  idAlerts.forEach((a, i) => {
    notes.push({
      id: `notif-id-${i}`,
      type: a.severity === 'critical' ? 'error' : 'warning',
      category: 'Investor ID Expiry',
      title: a.daysRemaining <= 0 ? 'Investor ID Expired' : a.severity === 'critical' ? 'Investor ID Critical Expiry' : 'Investor ID Renewal Due',
      message: `${a.customerName}'s SECC Investor ID ${when(a)}.`,
      relatedCustomerId: a.customerId,
      relatedCustomerName: a.customerName,
      isRead: false,
      createdAt: now,
      actionLabel: 'View Compliance',
      actionPage: 'compliance',
    });
  });

  const pending = individuals.filter(
    (i) => i.requestStatus === 'Pending' && i.currentWorkflowStage !== 'Approved'
  );
  pending.slice(0, 5).forEach((ind, i) => {
    notes.push({
      id: `notif-approval-${i}`,
      type: 'info',
      category: 'Approval',
      title: 'Approval Pending',
      message: `${ind.fullNameEN ?? ind.givenNameEN}'s ${ind.requestType} is waiting at ${ind.currentWorkflowStage} stage.`,
      relatedCustomerId: ind.id,
      relatedCustomerName: ind.fullNameEN ?? ind.givenNameEN,
      isRead: false,
      createdAt: now,
      actionLabel: 'View Customer',
      actionPage: 'individual-list',
    });
  });

  return notes;
}
