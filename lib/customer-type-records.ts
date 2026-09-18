import type { CustomerTypeRecord } from '@/types';

const at = (date: string) => `${date}T09:00:00.000Z`;
const yearLater = (date: string) => `${Number(date.slice(0, 4)) + 1}${date.slice(4)}`;

const csx = (n: number, customerId: string, createdDate: string): CustomerTypeRecord => ({
  id: `CSX-${String(n).padStart(6, '0')}`,
  customerId,
  typeId: 'csx-screen',
  values: { customerId, createdDate, closedDate: yearLater(createdDate), status: 'Active' },
  createdAt: at(createdDate),
  updatedAt: at(createdDate),
});

const card = (n: number, customerId: string, takenDate: string): CustomerTypeRecord => ({
  id: `CARD-${String(n).padStart(6, '0')}`,
  customerId,
  typeId: 'client-card',
  values: { customerId, takenDate },
  createdAt: at(takenDate),
  updatedAt: at(takenDate),
});

/** Employee Trading and VIP Customer share the registration form */
const registration = (
  typeId: 'employee-trading' | 'vip-customer',
  id: string,
  customerId: string,
  registeredDate: string,
  reason: string
): CustomerTypeRecord => ({
  id,
  customerId,
  typeId,
  values: {
    customerId,
    registeredDate,
    expiredDate: yearLater(registeredDate),
    renewalDate: '',
    renewalExpiredDate: '',
    period: yearLater(registeredDate),
    status: 'Active',
    reason,
  },
  createdAt: at(registeredDate),
  updatedAt: at(registeredDate),
});

const ipo = (n: number, customerId: string, ipoNameId: string, quantity: number, price: number, subscriptionDate: string): CustomerTypeRecord => {
  // Rounded to cents: 800 * 4.2 is 3360.0000000000005 in floating point
  const amount = String(Math.round(quantity * price * 100) / 100);
  return {
    id: `IPO-${String(n).padStart(6, '0')}`,
    customerId,
    typeId: 'ipo-customer',
    values: {
      customerId,
      ipoNameId,
      bookBuildingDate: subscriptionDate,
      purchaseQuantity: String(quantity),
      purchasePrice: String(price),
      totalAmount: amount,
      subQuantity: String(quantity),
      subPrice: String(price),
      subTotalAmount: amount,
      subscriptionDate,
    },
    createdAt: at(subscriptionDate),
    updatedAt: at(subscriptionDate),
  };
};

// Mock customer type records for the seeded individuals in lib/data.ts
/** Personal Representative: registration goes through SR then Manager approval */
const personalRep = (n: number, customerId: string, date: string, approved: boolean): CustomerTypeRecord => {
  const submitted = {
    id: `AUTH-PR-${n}-1`,
    requestType: 'Registration' as const,
    stage: 'Registration Submitted — CSO',
    status: 'Submitted' as const,
    dateTime: `${date} 09:00`,
    processedBy: 'Sophea Keo (CSO)',
    role: 'CSO' as const,
    comment: 'Registration submitted for approval.',
  };
  const reviews = [
    { id: `AUTH-PR-${n}-2`, stage: 'SR Authorization', processedBy: 'Dara Vong (SR)', role: 'SR' as const },
    { id: `AUTH-PR-${n}-3`, stage: 'Manager Authorization', processedBy: 'Vannak Lim (Manager)', role: 'Manager' as const },
  ].map((review) => ({
    ...review,
    requestType: 'Registration' as const,
    status: 'Approved' as const,
    dateTime: `${date} 15:00`,
    comment: `Approved by ${review.processedBy}`,
  }));
  return {
    id: `PR-${String(n).padStart(6, '0')}`,
    customerId,
    typeId: 'personal-representative',
    values: { customerId, accountCheckedBy: 'Dara Vong (SR)', accountApprovedBy: 'Vannak Lim (Manager)' },
    approval: approved
      ? { requestType: 'Registration', requestStatus: 'Approved', currentWorkflowStage: 'Approved', history: [submitted, ...reviews] }
      : { requestType: 'Registration', requestStatus: 'Pending', currentWorkflowStage: 'SR', history: [submitted] },
    createdAt: at(date),
    updatedAt: at(date),
  };
};

export const INITIAL_CUSTOMER_TYPE_RECORDS: CustomerTypeRecord[] = [
  {
    id: 'CSX-000001',
    customerId: 'IND-9021',
    typeId: 'csx-screen',
    values: { customerId: 'IND-9021', createdDate: '2026-01-12', closedDate: '2027-01-12', status: 'Active' },
    createdAt: '2026-01-12T09:00:00.000Z',
    updatedAt: '2026-01-12T09:00:00.000Z',
  },
  {
    id: 'CSX-000002',
    customerId: 'IND-9023',
    typeId: 'csx-screen',
    values: { customerId: 'IND-9023', createdDate: '2025-03-04', closedDate: '2026-03-04', status: 'Close' },
    createdAt: '2025-03-04T09:00:00.000Z',
    updatedAt: '2026-03-04T10:30:00.000Z',
  },
  {
    id: 'CARD-000001',
    customerId: 'IND-9021',
    typeId: 'client-card',
    values: { customerId: 'IND-9021', takenDate: '2026-02-01' },
    createdAt: '2026-02-01T08:15:00.000Z',
    updatedAt: '2026-02-01T08:15:00.000Z',
  },
  {
    id: 'CARD-000002',
    customerId: 'IND-9024',
    typeId: 'client-card',
    values: { customerId: 'IND-9024', takenDate: '2026-05-18' },
    createdAt: '2026-05-18T11:00:00.000Z',
    updatedAt: '2026-05-18T11:00:00.000Z',
  },
  {
    id: 'EMP-000001',
    customerId: 'IND-9024',
    typeId: 'employee-trading',
    values: {
      customerId: 'IND-9024',
      registeredDate: '2025-06-01',
      expiredDate: '2026-06-01',
      renewalDate: '2026-05-25',
      renewalExpiredDate: '2027-06-01',
      period: '2027-06-01',
      status: 'Active',
      reason: 'Annual renewal approved by compliance.',
    },
    createdAt: '2025-06-01T09:00:00.000Z',
    updatedAt: '2026-05-25T14:20:00.000Z',
  },
  {
    id: 'VIP-000001',
    customerId: 'IND-9022',
    typeId: 'vip-customer',
    values: {
      customerId: 'IND-9022',
      registeredDate: '2025-09-01',
      expiredDate: '2026-09-01',
      renewalDate: '2026-08-20',
      renewalExpiredDate: '2027-09-01',
      period: '2027-09-01',
      status: 'Active',
      reason: 'Portfolio value above the VIP threshold.',
    },
    createdAt: '2025-09-01T09:00:00.000Z',
    updatedAt: '2026-08-20T16:05:00.000Z',
  },
  {
    id: 'IPO-000001',
    customerId: 'IND-9021',
    typeId: 'ipo-customer',
    values: {
      customerId: 'IND-9021',
      ipoNameId: 'IPO-2026-001',
      bookBuildingDate: '2026-04-10',
      purchaseQuantity: '1000',
      purchasePrice: '2.5',
      totalAmount: '2500',
      subQuantity: '800',
      subPrice: '2.5',
      subTotalAmount: '2000',
      subscriptionDate: '2026-04-20',
    },
    createdAt: '2026-04-20T10:00:00.000Z',
    updatedAt: '2026-04-20T10:00:00.000Z',
  },
  {
    id: 'IPO-000002',
    customerId: 'IND-9021',
    typeId: 'ipo-customer',
    values: {
      customerId: 'IND-9021',
      ipoNameId: 'IPO-2026-002',
      bookBuildingDate: '2026-06-22',
      purchaseQuantity: '500',
      purchasePrice: '4.2',
      totalAmount: '2100',
      subQuantity: '500',
      subPrice: '4.2',
      subTotalAmount: '2100',
      subscriptionDate: '2026-07-02',
    },
    createdAt: '2026-07-02T09:30:00.000Z',
    updatedAt: '2026-07-02T09:30:00.000Z',
  },
  {
    id: 'IPO-000003',
    customerId: 'IND-9026',
    typeId: 'ipo-customer',
    values: {
      customerId: 'IND-9026',
      ipoNameId: 'IPO-2026-001',
      bookBuildingDate: '2026-04-10',
      purchaseQuantity: '2000',
      purchasePrice: '2.5',
      totalAmount: '5000',
      subQuantity: '1500',
      subPrice: '2.5',
      subTotalAmount: '3750',
      subscriptionDate: '2026-04-21',
    },
    createdAt: '2026-04-21T13:45:00.000Z',
    updatedAt: '2026-04-21T13:45:00.000Z',
  },
  // IND-9021 (CID-009021) holds every customer type, for demoing the full profile
  {
    id: 'EMP-000002',
    customerId: 'IND-9021',
    typeId: 'employee-trading',
    values: {
      customerId: 'IND-9021',
      registeredDate: '2025-07-15',
      expiredDate: '2026-07-15',
      renewalDate: '2026-07-01',
      renewalExpiredDate: '2027-07-15',
      period: '2027-07-15',
      status: 'Active',
      reason: 'Staff trading account renewed after compliance review.',
    },
    createdAt: '2025-07-15T09:00:00.000Z',
    updatedAt: '2026-07-01T10:15:00.000Z',
  },
  {
    id: 'VIP-000002',
    customerId: 'IND-9021',
    typeId: 'vip-customer',
    values: {
      customerId: 'IND-9021',
      registeredDate: '2025-10-01',
      expiredDate: '2026-10-01',
      renewalDate: '2026-09-10',
      renewalExpiredDate: '2027-10-01',
      period: '2027-10-01',
      status: 'Active',
      reason: 'Net worth and trading volume above the VIP threshold.',
    },
    createdAt: '2025-10-01T09:00:00.000Z',
    updatedAt: '2026-09-10T15:40:00.000Z',
  },

  // Spread across Nov 2025 – Aug 2026 so each product's month-end count differs on the dashboard trend
  csx(3, 'IND-9022', '2025-11-03'),
  csx(4, 'IND-9025', '2025-12-08'),
  csx(5, 'IND-9027', '2026-01-20'),
  csx(6, 'IND-9029', '2026-02-09'),
  csx(7, 'IND-9030', '2026-02-23'),
  csx(8, 'IND-9032', '2026-03-16'),
  csx(9, 'IND-9034', '2026-05-12'),
  csx(10, 'IND-9036', '2026-07-21'),
  card(3, 'IND-9023', '2026-01-08'),
  card(4, 'IND-9026', '2026-02-17'),
  card(5, 'IND-9028', '2026-03-05'),
  card(6, 'IND-9031', '2026-03-24'),
  card(7, 'IND-9033', '2026-04-14'),
  card(8, 'IND-9025', '2026-06-03'),
  card(9, 'IND-9030', '2026-06-22'),
  card(10, 'IND-9035', '2026-07-09'),
  card(11, 'IND-9038', '2026-08-06'),
  registration('employee-trading', 'EMP-000003', 'IND-9033', '2026-04-08', 'Staff trading account approved by compliance.'),
  registration('vip-customer', 'VIP-000003', 'IND-9028', '2026-01-15', 'Portfolio value above the VIP threshold.'),
  registration('vip-customer', 'VIP-000004', 'IND-9035', '2026-02-20', 'Trading volume above the VIP threshold.'),
  registration('vip-customer', 'VIP-000005', 'IND-9031', '2026-07-06', 'Portfolio value above the VIP threshold.'),
  registration('vip-customer', 'VIP-000006', 'IND-9037', '2026-08-11', 'Net worth above the VIP threshold.'),
  ipo(4, 'IND-9030', 'IPO-2026-002', 800, 4.2, '2026-07-03'),
  ipo(5, 'IND-9034', 'IPO-2026-002', 1200, 4.2, '2026-07-03'),
  // August top-ups, so the dashboard's month-over-month figures have a change to show
  ipo(6, 'IND-9034', 'IPO-2026-003', 180, 3.5, '2026-08-14'),
  ipo(7, 'IND-9021', 'IPO-2026-003', 94, 3.5, '2026-08-20'),
  ipo(8, 'IND-9026', 'IPO-2026-003', 168, 3.5, '2026-08-18'),
  ipo(9, 'IND-9030', 'IPO-2026-003', 61, 3.5, '2026-08-25'),
  personalRep(1, 'IND-9024', '2026-08-04', true),
  personalRep(2, 'IND-9029', '2026-09-10', false),
];

/**
 * Static placeholder shown in the customer view when a customer has no record of a type,
 * so every tab has data to show. Never stored.
 */
export function sampleCustomerTypeRecord(typeId: CustomerTypeRecord['typeId'], customerId: string): CustomerTypeRecord {
  switch (typeId) {
    case 'csx-screen':
      return csx(0, customerId, '2026-01-12');
    case 'client-card':
      return card(0, customerId, '2026-02-01');
    case 'employee-trading':
      return registration('employee-trading', 'EMP-000000', customerId, '2026-03-02', 'Staff trading account approved by compliance.');
    case 'vip-customer':
      return registration('vip-customer', 'VIP-000000', customerId, '2026-04-15', 'Portfolio value above the VIP threshold.');
    case 'ipo-customer':
      return ipo(0, customerId, 'IPO-2026-001', 1000, 2.5, '2026-04-20');
    case 'personal-representative':
      return personalRep(0, customerId, '2026-08-04', true);
  }
}
