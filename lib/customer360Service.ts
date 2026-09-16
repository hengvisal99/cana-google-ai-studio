import { Individual, ProductPortfolioItem, IPOTransactionRecord, Customer360Activity } from '@/types';

export interface Customer360SummaryKPI {
  portfolioValue: {
    amount: number;
    currency: string;
    formatted: string;
    growthPercentage: string;
    trend: 'up' | 'down';
  };
  tradingValue: {
    amount: number;
    currency: string;
    formatted: string;
    dateRange: string;
  };
  totalTrading: {
    count: number;
    formatted: string;
    dateRange: string;
  };
  iposHeld: {
    count: number;
    formatted: string;
    subscriptionCount: number;
    subscriptionFormatted: string;
  };
}

export interface Customer360Data {
  individual: Individual;
  kpis: Customer360SummaryKPI;
  products: ProductPortfolioItem[];
  transactions: IPOTransactionRecord[];
  activities: Customer360Activity[];
}

export const DEFAULT_CUSTOMER_PRODUCTS: ProductPortfolioItem[] = [
  {
    id: 'PROD-01',
    productName: 'CSX Screen',
    productId: 'CSX-000012',
    validFrom: '07 Dec 2025',
    validTo: '07 Dec 2026',
    expiryDays: '89 days',
    status: 'Active',
  },
  {
    id: 'PROD-02',
    productName: 'Client Card',
    productId: 'CC-000007',
    validFrom: '07 Oct 2025',
    validTo: '07 Oct 2026',
    expiryDays: '28 days',
    status: 'Active',
  },
  {
    id: 'PROD-03',
    productName: 'Employee Trading',
    productId: 'ET-000003',
    validFrom: '06 Feb 2026',
    validTo: '06 Feb 2027',
    expiryDays: '150 days',
    status: 'Active',
  },
  {
    id: 'PROD-04',
    productName: 'VIP Customer',
    productId: 'VIP-000004',
    validFrom: '06 Nov 2025',
    validTo: '06 Nov 2026',
    expiryDays: '58 days',
    status: 'Active',
  },
];

export const DEFAULT_TRANSACTIONS: IPOTransactionRecord[] = [
  {
    id: 'TXN-IPO-101',
    dateTime: '18 Jan 2026, 09:45 AM',
    ipoName: 'MJQE - Mengly J. Quach Education',
    transactionType: 'IPO Subscription',
    quantity: 5000,
    price: 2.10,
    tradingValue: 10500.00,
    currency: 'USD',
  },
  {
    id: 'TXN-IPO-102',
    dateTime: '12 Jan 2026, 02:15 PM',
    ipoName: 'CGSM - CamGSM (Cellcard)',
    transactionType: 'Buy',
    quantity: 10000,
    price: 0.65,
    tradingValue: 6500.00,
    currency: 'USD',
  },
  {
    id: 'TXN-IPO-103',
    dateTime: '04 Jan 2026, 11:30 AM',
    ipoName: 'PWSA - Phnom Penh Water Supply Authority',
    transactionType: 'Buy',
    quantity: 2500,
    price: 1.80,
    tradingValue: 4500.00,
    currency: 'USD',
  },
  {
    id: 'TXN-IPO-104',
    dateTime: '22 Dec 2025, 10:00 AM',
    ipoName: 'PPAP - Phnom Penh Autonomous Port',
    transactionType: 'Sell',
    quantity: 1200,
    price: 3.50,
    tradingValue: 4200.00,
    currency: 'USD',
  },
  {
    id: 'TXN-IPO-105',
    dateTime: '15 Dec 2025, 03:20 PM',
    ipoName: 'PAS - Sihanoukville Autonomous Port',
    transactionType: 'Buy',
    quantity: 3000,
    price: 3.15,
    tradingValue: 9450.00,
    currency: 'USD',
  },
  {
    id: 'TXN-IPO-106',
    dateTime: '28 Nov 2025, 08:50 AM',
    ipoName: 'ABC - ACLEDA Bank Plc',
    transactionType: 'Dividend',
    quantity: 8000,
    price: 2.40,
    tradingValue: 19200.00,
    currency: 'USD',
  },
  {
    id: 'TXN-IPO-107',
    dateTime: '14 Nov 2025, 01:10 PM',
    ipoName: 'GTI - Grand Twins International',
    transactionType: 'Buy',
    quantity: 4500,
    price: 1.10,
    tradingValue: 4950.00,
    currency: 'USD',
  },
  {
    id: 'TXN-IPO-108',
    dateTime: '02 Oct 2025, 09:00 AM',
    ipoName: 'MJQE - Mengly J. Quach Education',
    transactionType: 'Buy',
    quantity: 12500,
    price: 2.08,
    tradingValue: 26000.00,
    currency: 'USD',
  },
  {
    id: 'TXN-IPO-109',
    dateTime: '19 Sep 2025, 02:40 PM',
    ipoName: 'PEPC - Pestech (Cambodia) Plc',
    transactionType: 'Buy',
    quantity: 6000,
    price: 1.45,
    tradingValue: 8700.00,
    currency: 'USD',
  },
  {
    id: 'TXN-IPO-110',
    dateTime: '05 Aug 2025, 10:25 AM',
    ipoName: 'DBDE - DBD Engineering Plc',
    transactionType: 'IPO Subscription',
    quantity: 7500,
    price: 1.32,
    tradingValue: 9900.00,
    currency: 'USD',
  },
];

export const DEFAULT_ACTIVITIES: Customer360Activity[] = [
  {
    id: 'ACT-01',
    dateTime: '07 Feb 2026, 12:00 AM',
    activity: 'Employee Trading Registered',
    referenceId: 'ET-000003',
    processedBy: 'Ly Chanthy',
    role: 'CSO',
  },
  {
    id: 'ACT-02',
    dateTime: '08 Dec 2025, 12:00 AM',
    activity: 'CSX Screen Registered',
    referenceId: 'CSX-000012',
    processedBy: 'Chan Sophea',
    role: 'Senior',
  },
  {
    id: 'ACT-03',
    dateTime: '07 Nov 2025, 12:00 AM',
    activity: 'VIP Customer Registered',
    referenceId: 'VIP-000004',
    processedBy: 'Sok Dara',
    role: 'Manager',
  },
  {
    id: 'ACT-04',
    dateTime: '08 Oct 2025, 12:00 AM',
    activity: 'Client Card Registered',
    referenceId: 'CC-000007',
    processedBy: 'Ly Chanthy',
    role: 'CSO',
  },
  // Original onboarding chain: how the customer came to have a customer type.
  // No referenceId - the timeline falls back to showing the approver's role.
  {
    id: 'ACT-05',
    dateTime: '10 Jul 2022, 12:00 AM',
    activity: 'Registration Approved By Sok Dara',
    processedBy: 'Sok Dara',
    role: 'Manager',
  },
  {
    id: 'ACT-06',
    dateTime: '08 Jul 2022, 12:00 AM',
    activity: 'Registration Checked By Chan Sophea',
    processedBy: 'Chan Sophea',
    role: 'Senior',
  },
  {
    id: 'ACT-07',
    dateTime: '06 Jul 2022, 12:00 AM',
    activity: 'Registration Submitted By Ly Chanthy',
    processedBy: 'Ly Chanthy',
    role: 'CSO',
  },
];

/**
 * Timeline dates arrive in two different shapes: '07 Feb 2026, 12:00 AM' from
 * the seeded activities, and '2024-04-05 10:15 AM' from authorizationHistory.
 * Some records carry a workflow placeholder instead of a date - a stage that
 * has not been processed yet stores 'Queue' - which is not a date at all.
 *
 * Returns null for anything unparseable so the comparator can order those
 * explicitly, rather than feeding NaN into it (a comparator that returns NaN
 * breaks the sort contract and yields an arbitrary order).
 */
function parseActivityDate(dateTime: string | undefined | null): number | null {
  if (!dateTime) return null;
  const ts = Date.parse(dateTime);
  return Number.isNaN(ts) ? null : ts;
}

/**
 * Calculates and provides complete Customer 360 data for an individual.
 */
export function getCustomer360Details(individual: Individual): Customer360Data {
  // Determine realistic or default portfolio value ($125,000.00 USD baseline)
  const portfolioBase = individual.totalDeposits > 0 ? individual.totalDeposits : 125000;
  const portfolioFormatted = `$${portfolioBase.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;

  // The timeline records how the customer came to have a customer type: the
  // onboarding chain and the product registrations. Authorization workflow rows
  // are deliberately not merged in.
  const combinedActivities = [...DEFAULT_ACTIVITIES];

  // Newest first. Anything with an unparseable date leads the timeline rather
  // than feeding NaN into the comparator, which would break the sort contract.
  combinedActivities.sort((a, b) => {
    const ta = parseActivityDate(a.dateTime);
    const tb = parseActivityDate(b.dateTime);
    if (ta === null && tb === null) return 0;
    if (ta === null) return -1;
    if (tb === null) return 1;
    return tb - ta;
  });

  return {
    individual,
    kpis: {
      portfolioValue: {
        amount: portfolioBase > 0 && portfolioBase !== 125000 ? portfolioBase : 1404807,
        currency: 'USD',
        formatted: portfolioBase > 0 && portfolioBase !== 125000 
          ? `$${portfolioBase.toLocaleString('en-US')}`
          : '$1,404,807',
        growthPercentage: '0.1% MoM',
        trend: 'up',
      },
      tradingValue: {
        amount: 44287.00,
        currency: 'USD',
        formatted: '$44,287',
        dateRange: 'Jan–Sep 2026',
      },
      totalTrading: {
        count: 4,
        formatted: '4 Trades',
        dateRange: 'Jan–Sep 2026',
      },
      iposHeld: {
        count: 4,
        formatted: '4 IPOs',
        subscriptionCount: 120,
        subscriptionFormatted: '120 subscriptions',
      },
    },
    products: DEFAULT_CUSTOMER_PRODUCTS,
    transactions: DEFAULT_TRANSACTIONS,
    activities: combinedActivities,
  };
}
