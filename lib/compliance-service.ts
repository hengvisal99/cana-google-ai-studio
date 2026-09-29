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

function severity(days: number): 'critical' | 'warning' | 'upcoming' {
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

  const docAlerts = getDocumentExpiryAlerts(individuals, 30);
  const idAlerts = getInvestorIdExpiryAlerts(individuals, 30);

  docAlerts.forEach((a, i) => {
    notes.push({
      id: `notif-doc-${i}`,
      type: a.severity === 'critical' ? 'error' : 'warning',
      category: 'Document Expiry',
      title: a.severity === 'critical' ? 'ID Card Expiring Soon!' : 'ID Card Expiry Warning',
      message: `${a.customerName}'s ${a.label} expires in ${a.daysRemaining} day${a.daysRemaining !== 1 ? 's' : ''} (${a.expiryDate}).`,
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
      title: a.severity === 'critical' ? 'Investor ID Critical Expiry' : 'Investor ID Renewal Due',
      message: `${a.customerName}'s SECC Investor ID expires in ${a.daysRemaining} day${a.daysRemaining !== 1 ? 's' : ''}.`,
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
