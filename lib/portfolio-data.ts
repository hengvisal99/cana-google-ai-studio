import { PortfolioHolding, TradeRecord } from '@/types';
import { subDays } from 'date-fns';

const today = new Date();

export const INITIAL_HOLDINGS: PortfolioHolding[] = [
  {
    id: 'HLD-001',
    customerId: 'IND-9901',
    customerName: 'Eleanor Vance',
    ticker: 'PPSP',
    sector: 'Real Estate & Industrial',
    quantity: 15000,
    averageCost: 4.10,
    currentPrice: 4.20,
    marketValue: 63000,
    unrealizedPnL: 1500,
    pnlPercentage: 2.44,
    currency: 'USD',
  },
  {
    id: 'HLD-002',
    customerId: 'IND-9901',
    customerName: 'Eleanor Vance',
    ticker: 'PAS',
    sector: 'Transportation',
    quantity: 5000,
    averageCost: 3.50,
    currentPrice: 3.20,
    marketValue: 16000,
    unrealizedPnL: -1500,
    pnlPercentage: -8.57,
    currency: 'USD',
  },
  {
    id: 'HLD-003',
    customerId: 'IND-9904',
    customerName: 'Marcus Brody',
    ticker: 'ABC',
    sector: 'Banking',
    quantity: 20000,
    averageCost: 2.90,
    currentPrice: 3.15,
    marketValue: 63000,
    unrealizedPnL: 5000,
    pnlPercentage: 8.62,
    currency: 'USD',
  },
];

export const INITIAL_TRADES: TradeRecord[] = [
  {
    id: 'TRD-1001',
    customerId: 'IND-9901',
    ticker: 'PPSP',
    type: 'Buy',
    quantity: 5000,
    price: 4.15,
    tradeDate: subDays(today, 1).toISOString(),
    settlementDate: subDays(today, -1).toISOString(), // T+2
    status: 'Pending',
    currency: 'USD',
  },
  {
    id: 'TRD-1002',
    customerId: 'IND-9904',
    ticker: 'ABC',
    type: 'Buy',
    quantity: 10000,
    price: 2.90,
    tradeDate: subDays(today, 5).toISOString(),
    settlementDate: subDays(today, 3).toISOString(),
    status: 'Settled',
    currency: 'USD',
  },
  {
    id: 'TRD-1003',
    customerId: 'IND-9901',
    ticker: 'GTI',
    type: 'Sell',
    quantity: 2000,
    price: 1.80,
    tradeDate: subDays(today, 10).toISOString(),
    settlementDate: subDays(today, 8).toISOString(),
    status: 'Settled',
    currency: 'USD',
  },
];
