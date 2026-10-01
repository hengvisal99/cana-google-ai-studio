'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity, ArrowDownRight, ArrowUpRight, Globe, RefreshCcw,
  TrendingUp, Building2, Calendar, FileText,
  Layers, Hash, Barcode, CalendarCheck, Users,
  Wallet, PiggyBank, Coins, CandlestickChart, BarChart3,
  PieChart, Download, Eye, Percent, Tag,
  Receipt, Scale, Landmark, Handshake, ShieldCheck, X, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const formatKHR = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KHR', maximumFractionDigits: 0 }).format(val);
const formatNumber = (val: number) => new Intl.NumberFormat('en-US').format(val);

interface StockData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  volume: number;
  marketCap: number;
}

const INITIAL_STOCKS: StockData[] = [
  { ticker: 'PWSA', name: 'Phnom Penh Water Supply Authority', price: 7120, change: 20, changePct: 0.28, volume: 15400, marketCap: 619247000000 },
  { ticker: 'GTI', name: 'Grand Twins International (Cambodia)', price: 8600, change: 20, changePct: 0.23, volume: 2100, marketCap: 344000000000 },
  { ticker: 'PPAP', name: 'Phnom Penh Autonomous Port', price: 15300, change: -140, changePct: -0.91, volume: 5800, marketCap: 316530000000 },
  { ticker: 'PPSP', name: 'Phnom Penh SEZ', price: 1780, change: 110, changePct: 6.59, volume: 45000, marketCap: 127937000000 },
  { ticker: 'PAS', name: 'Sihanoukville Autonomous Port', price: 19000, change: 100, changePct: 0.53, volume: 12000, marketCap: 1629667000000 },
  { ticker: 'ABC', name: 'ACLEDA Bank Plc.', price: 11000, change: 20, changePct: 0.18, volume: 125000, marketCap: 4764793000000 },
  { ticker: 'PEPC', name: 'PESTech (Cambodia)', price: 2410, change: -30, changePct: -1.23, volume: 8400, marketCap: 18061000000 },
  { ticker: 'MJQE', name: 'Mengly J. Quach Education', price: 2140, change: 10, changePct: 0.47, volume: 15000, marketCap: 693360000000 },
  { ticker: 'CGSM', name: 'CamGSM (Cellcard)', price: 3670, change: 20, changePct: 0.55, volume: 89000, marketCap: 7189530000000 },
  { ticker: 'DBDE', name: 'DBD Engineering Plc. (Growth Board)', price: 2150, change: 0, changePct: 0.00, volume: 500, marketCap: 13800000000 },
];

interface StockProfile {
  symbol: string;
  companyName: string;
  inceptionYear: string;
  industry: string;
  listedSharesType: string;
  noOfShares: string;
  code: string;
  listingDate: string;
  website: string;
  staffs: string;
  summary: string;
}

const MOCK_PROFILES: Record<string, StockProfile> = {
  'DBDE': {
    symbol: 'DBDE',
    companyName: 'DBD Engineering Plc.',
    inceptionYear: '1995',
    industry: 'Construction and Engineering',
    listedSharesType: 'Voting Shares',
    noOfShares: '6,461,538',
    code: 'KH1000150008',
    listingDate: 'Sep 06, 2021',
    website: 'www.dbdengineering.com',
    staffs: '1,146 Employees',
    summary: "DBD Engineering Plc. was founded in 1995, which makes it one of the oldest multifaceted Engineering & Construction company in Cambodia. DBD provides construction, design, installation, and maintenance services which achieved an exceptional level of satisfaction, recognized the work and quality from national clients who are project owners and clients who are consultants.",
  },
  'ABC': {
    symbol: 'ABC',
    companyName: 'ACLEDA Bank Plc.',
    inceptionYear: '1993',
    industry: 'Banking and Finance',
    listedSharesType: 'Voting Shares',
    noOfShares: '433,163,019',
    code: 'KH1000110004',
    listingDate: 'May 25, 2020',
    website: 'www.acledabank.com.kh',
    staffs: '12,500+ Employees',
    summary: "ACLEDA Bank Plc. is the largest local commercial bank in Cambodia with the largest branch network. It transitioned from a specialized microfinance institution to a full commercial bank and is a leading player in the Kingdom's financial sector.",
  },
  'MJQE': {
    symbol: 'MJQE',
    companyName: 'Mengly J. Quach Education',
    inceptionYear: '2005',
    industry: 'Education',
    listedSharesType: 'Voting Shares',
    noOfShares: '324,000,000',
    code: 'KH1000210000',
    listingDate: 'Jun 28, 2023',
    website: 'www.mjqeducation.edu.kh',
    staffs: '2,300 Employees',
    summary: "Mengly J. Quach Education is a leading provider of educational services in Cambodia, operating renowned institutes such as Aii Language Center and American Intercon School (AIS). It is recognized for its high academic standards and widespread campus network.",
  },
  'PWSA': {
    symbol: 'PWSA',
    companyName: 'Phnom Penh Water Supply Authority',
    inceptionYear: '1960',
    industry: 'Utilities',
    listedSharesType: 'Voting Shares',
    noOfShares: '86,973,162',
    code: 'KH1000010006',
    listingDate: 'Apr 18, 2012',
    website: 'www.ppwsa.com.kh',
    staffs: '1,000+ Employees',
    summary: 'PPWSA is the municipal water utility that serves Cambodia’s capital, Phnom Penh, and surrounding areas. It was the first state-owned enterprise to be listed on the CSX.',
  },
  'GTI': {
    symbol: 'GTI',
    companyName: 'Grand Twins International (Cambodia) Plc',
    inceptionYear: '2007',
    industry: 'Manufacturing',
    listedSharesType: 'Voting Shares',
    noOfShares: '40,000,000',
    code: 'KH1000020005',
    listingDate: 'Jun 16, 2014',
    website: 'www.grandtwins.com.kh',
    staffs: '5,000+ Employees',
    summary: 'GTI is a leading OEM apparel manufacturer in Cambodia, primarily producing athletic wear for international brands.',
  },
  'PPAP': {
    symbol: 'PPAP',
    companyName: 'Phnom Penh Autonomous Port',
    inceptionYear: '1905',
    industry: 'Transportation and Logistics',
    listedSharesType: 'Voting Shares',
    noOfShares: '20,688,296',
    code: 'KH1000030004',
    listingDate: 'Dec 09, 2015',
    website: 'www.ppap.com.kh',
    staffs: '700+ Employees',
    summary: 'PPAP is one of the two major international ports in Cambodia, serving as a critical hub for inland waterway transportation and international trade.',
  },
  'PPSP': {
    symbol: 'PPSP',
    companyName: 'Phnom Penh SEZ Plc',
    inceptionYear: '2006',
    industry: 'Real Estate / SEZ',
    listedSharesType: 'Voting Shares',
    noOfShares: '71,875,000',
    code: 'KH1000040003',
    listingDate: 'May 30, 2016',
    website: 'www.ppsez.com',
    staffs: '200+ Employees',
    summary: 'Phnom Penh SEZ operates the leading special economic zone in Cambodia, providing infrastructure and facilities for manufacturing companies.',
  },
  'PAS': {
    symbol: 'PAS',
    companyName: 'Sihanoukville Autonomous Port',
    inceptionYear: '1956',
    industry: 'Transportation and Logistics',
    listedSharesType: 'Voting Shares',
    noOfShares: '85,771,967',
    code: 'KH1000050002',
    listingDate: 'Jun 08, 2017',
    website: 'www.pas.gov.kh',
    staffs: '1,500+ Employees',
    summary: 'PAS is the sole international deep-sea port in Cambodia, handling the majority of the country’s maritime trade.',
  },
  'PEPC': {
    symbol: 'PEPC',
    companyName: 'PESTECH (Cambodia) Plc',
    inceptionYear: '2010',
    industry: 'Utilities & Infrastructure',
    listedSharesType: 'Voting Shares',
    noOfShares: '74,945,595',
    code: 'KH1000130002',
    listingDate: 'Aug 12, 2020',
    website: 'www.pestech.com.kh',
    staffs: '150+ Employees',
    summary: 'PESTECH Cambodia is an integrated electrical power technology company involved in power transmission infrastructure and power generation.',
  },
  'CGSM': {
    symbol: 'CGSM',
    companyName: 'CamGSM (Cellcard)',
    inceptionYear: '1996',
    industry: 'Telecommunications',
    listedSharesType: 'Voting Shares',
    noOfShares: '1,959,000,000',
    code: 'KH1000200001',
    listingDate: 'Jun 27, 2023',
    website: 'www.cellcard.com.kh',
    staffs: '1,200+ Employees',
    summary: 'CamGSM, operating under the Cellcard brand, is one of the leading mobile network operators in Cambodia, offering a wide range of telecommunication services.',
  }
};

// Deterministic 0–1 value from a string, standing in for real per-ticker data.
const seeded = (key: string) => {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10000) / 10000;
};

const SHAREHOLDERS = [
  { name: 'Ministry of Economy and Finance', type: 'Government', pct: 51, dot: 'bg-blue-600', stroke: 'stroke-blue-600', chip: 'border-blue-300 text-blue-700' },
  { name: 'Cana Securities', type: 'Institutional', pct: 12.45, dot: 'bg-indigo-500', stroke: 'stroke-indigo-500', chip: 'border-indigo-300 text-indigo-700' },
  { name: 'Retail Investors (Public Float)', type: 'Public', pct: 36.55, dot: 'bg-sky-500', stroke: 'stroke-sky-500', chip: 'border-sky-300 text-sky-700' },
];

// Donut geometry: each slice's arc length and where it starts along the ring.
const DONUT_R = 42;
const DONUT_CIRC = 2 * Math.PI * DONUT_R;
const DONUT_SEGMENTS = SHAREHOLDERS.map((sh, i) => ({
  len: (sh.pct / 100) * DONUT_CIRC,
  offset: SHAREHOLDERS.slice(0, i).reduce((sum, prev) => sum + (prev.pct / 100) * DONUT_CIRC, 0),
}));

/** Section title: gradient icon tile + uppercase label, as on the Customer 360 cards. */
function TabHeading({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="relative flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <h3 className="text-xs font-medium uppercase tracking-wider text-slate-700">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
}

function DeltaPill({ value, suffix }: { value: number; suffix: string }) {
  const up = value >= 0;
  return (
    <span
      className={cn(
        'relative mt-2 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        up ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
      )}
    >
      {up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
      {up ? '+' : ''}{value}%
      <span className="ml-0.5 text-[10px] font-medium uppercase tracking-wide opacity-70">{suffix}</span>
    </span>
  );
}

interface BalanceRow {
  label: string;
  value: number;
  icon: React.ElementType;
  tile: string;
}

/** Small gradient tile + uppercase label, the summary cards' heading at row size. */
function BalanceLabel({ row }: { row: BalanceRow }) {
  return (
    <span className="flex items-center gap-2.5 min-w-0">
      <span className={cn('w-8 h-8 rounded-lg bg-gradient-to-br text-white shadow-md flex items-center justify-center shrink-0', row.tile)}>
        <row.icon className="w-3.5 h-3.5" />
      </span>
      <span className="truncate text-xs font-medium uppercase tracking-wider text-slate-500">{row.label}</span>
    </span>
  );
}

interface InfoFieldProps {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
  strong?: boolean;
  highlight?: boolean;
  href?: string;
}

/** One field: indigo icon tile, small uppercase label above the value (Customer 360 DenseField). */
function InfoField({ icon: Icon, label, value, mono, strong, highlight, href }: InfoFieldProps) {
  return (
    <div className="min-w-0 flex items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white hover:shadow-sm ring-1 ring-transparent hover:ring-slate-200/60">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-100/50">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="block text-[10px] font-medium uppercase tracking-widest text-slate-400 mb-0.5">{label}</span>
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className="block truncate text-sm font-medium text-blue-600 hover:underline" title={value}>
            {value}
          </a>
        ) : (
          <span
            className={cn(
              'block truncate text-sm',
              strong ? 'font-medium text-slate-900' : highlight ? 'font-medium text-emerald-600' : 'font-medium text-slate-800',
              mono && 'font-mono text-[13px]'
            )}
            title={value}
          >
            {value}
          </span>
        )}
      </div>
    </div>
  );
}

export function CSXLiveScreen() {
  const [stocks, setStocks] = useState<StockData[]>(INITIAL_STOCKS);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedProfileTicker, setSelectedProfileTicker] = useState<string>('DBDE');
  const [selectedTab, setSelectedTab] = useState('Profile');
  const [activeHolder, setActiveHolder] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const selectedProfile = MOCK_PROFILES[selectedProfileTicker];

  const openDetail = (ticker: string) => {
    if (!MOCK_PROFILES[ticker]) return;
    setSelectedProfileTicker(ticker);
    setSelectedTab('Profile');
    setDetailOpen(true);
  };

  useEffect(() => {
    if (!detailOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDetailOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detailOpen]);

  // Figures stay fixed per ticker so they don't reshuffle on every live-price poll.
  const financials = useMemo(() => {
    const r = (salt: string) => seeded(selectedProfileTicker + salt);
    const assets = Math.floor(r('assets') * 900000000000) + 100000000000;
    return {
      revenue: Math.floor(r('rev') * 500000000000) + 10000000000,
      netProfit: Math.floor(r('np') * 80000000000) + 5000000000,
      eps: Math.floor(r('eps') * 1000) + 100,
      assets,
      liabilities: Math.floor(assets * (0.3 + r('liab') * 0.4)),
    };
  }, [selectedProfileTicker]);

  // Assets, liabilities and equity, tinted with the same gradients as the summary cards.
  const balanceRows: BalanceRow[] = [
    { label: 'Total Assets', value: financials.assets, icon: Landmark, tile: 'from-blue-500 to-indigo-600 shadow-blue-500/20' },
    { label: 'Total Liabilities', value: financials.liabilities, icon: Receipt, tile: 'from-rose-400 to-pink-500 shadow-rose-500/20' },
    { label: 'Total Equity', value: financials.assets - financials.liabilities, icon: Scale, tile: 'from-emerald-400 to-teal-500 shadow-emerald-500/20' },
  ];
  // Bar length as a share of total assets (assets itself is the full bar).
  const barWidth = (row: BalanceRow) => (row.value / financials.assets) * 100;

  const trading = useMemo(() => {
    const r = (salt: string) => seeded(selectedProfileTicker + salt);
    const price = INITIAL_STOCKS.find((s) => s.ticker === selectedProfileTicker)?.price ?? 5000;
    return {
      low: Math.floor(price * (0.7 + r('low') * 0.2)),
      high: Math.floor(price * (1.05 + r('high') * 0.3)),
      avgVolume: Math.floor(r('vol') * 100000) + 10000,
      tradedValue: Math.floor(r('tv') * 5000000000) + 100000000,
    };
  }, [selectedProfileTicker]);

  const profileFields: InfoFieldProps[] = [
    { icon: Building2, label: 'Company Name', value: selectedProfile.companyName },
    { icon: Calendar, label: 'Inception Year', value: selectedProfile.inceptionYear },
    { icon: Layers, label: 'Industry Classification', value: selectedProfile.industry },
    { icon: FileText, label: 'Type of Listed Shares', value: selectedProfile.listedSharesType },
    { icon: Hash, label: 'No. of Listed Shares', value: selectedProfile.noOfShares, mono: true },
    { icon: Barcode, label: 'Code', value: selectedProfile.code, mono: true },
    { icon: TrendingUp, label: 'Symbol', value: selectedProfile.symbol, strong: true },
    { icon: CalendarCheck, label: 'Listing Date', value: selectedProfile.listingDate },
    { icon: Globe, label: 'Website', value: selectedProfile.website, href: `https://${selectedProfile.website}` },
    { icon: Users, label: 'No. of Staffs', value: selectedProfile.staffs },
  ];

  // CSX is a low-liquidity market. Prices and volumes do not fluctuate every 3 seconds.
  // We simulate a realistic polling interval (e.g., every 30 seconds) where trades happen rarely.
  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefreshing(true);
      
      setTimeout(() => {
        setStocks(prev => prev.map(stock => {
          // 90% chance nothing happens for a stock in this tick (illiquid market simulation)
          if (Math.random() > 0.1) return stock;

          // If a trade happens, it's usually small volume
          return {
            ...stock,
            volume: stock.volume + Math.floor(Math.random() * 50) + 10 
          };
        }));
        
        setLastRefreshed(new Date());
        setIsRefreshing(false);
      }, 400);

    }, 30000); // Poll every 30 seconds instead of 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Rendered by the IPO and Dividend Policy tabs
  const ipoSection = (
    <div className="space-y-5">
      <TabHeading icon={Tag} title="IPO Details" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 rounded-2xl bg-slate-50/60 ring-1 ring-slate-200/60 p-2">
        <InfoField icon={Handshake} label="Underwriter" value="Cana Securities Ltd." />
        <InfoField icon={Coins} label="Offering Price" value="2,080 KHR" mono />
        <InfoField icon={Hash} label="Total Shares Offered" value="15,000,000" mono />
        <InfoField icon={ShieldCheck} label="Guaranteed Dividend" value="6% for first 2 years" highlight />
      </div>
    </div>
  );

  const dividendSection = (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      {/* Policy statement with its one hard number pulled out */}
      <div className="relative rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/40 ring-1 ring-blue-100 p-5 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-full blur-2xl pointer-events-none" />
        <TabHeading icon={Percent} title="Dividend Policy Statement" />
        <p className="relative mt-3 text-sm leading-relaxed text-slate-600">
          The Company intends to recommend and distribute dividends of not less than 20% of its net profit after tax. The actual dividend payout will depend on the Company&apos;s financial performance, capital expenditure requirements, and future expansion plans, subject to the approval of the Board of Directors and Shareholders.
        </p>
      </div>

      <div className="xl:col-span-2 rounded-2xl bg-slate-50/60 ring-1 ring-slate-200/60 p-2">
        <div className="grid grid-cols-3 px-3 pt-2 pb-3 text-[10px] font-medium uppercase tracking-widest text-slate-400">
          <span>Record Date</span>
          <span className="text-right">Dividend / Share (KHR)</span>
          <span className="text-right">Yield</span>
        </div>
        {[
          { date: 'Apr 15, 2023', dps: 120, yld: 3.5 },
          { date: 'Apr 12, 2022', dps: 105, yld: 3.2 },
        ].map((row) => (
          <div key={row.date} className="grid grid-cols-3 items-center rounded-xl px-3 py-3 transition hover:bg-white hover:shadow-sm">
            <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <CalendarCheck className="w-4 h-4 text-indigo-500" />
              {row.date}
            </span>
            <span className="text-right text-sm font-semibold font-mono text-slate-900">{formatNumber(row.dps)}</span>
            <span className="text-right">
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium font-mono text-emerald-700">{row.yld.toFixed(1)}%</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col space-y-6 py-2 pb-8 min-h-full">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
              <Globe className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-950 to-blue-900 tracking-tight leading-tight">
                CSX Live Market
              </h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">Real-time data feed from the Cambodia Securities Exchange.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 h-10 px-4 rounded-xl bg-white/80 border border-slate-200/60 shadow-sm text-sm font-medium text-slate-600 w-fit">
            <Activity className={cn('w-4 h-4 transition-colors', isRefreshing ? 'text-blue-600' : 'text-slate-400')} />
            <span>Polled: <span className="font-mono text-slate-900">{format(lastRefreshed, 'HH:mm:ss')}</span></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Live Stock Ticker Table: the sidebar sets the row height on desktop, the table scrolls inside it */}
        <div className="lg:col-span-2 relative bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col h-[460px] lg:h-auto">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <TabHeading icon={TrendingUp} title="Main Board Quotations" />
            <div className={cn('transition-opacity duration-300', isRefreshing ? 'opacity-100' : 'opacity-0')}>
              <RefreshCcw className="w-4 h-4 text-blue-500 animate-spin" />
            </div>
          </div>

          <div className="relative flex-1 min-h-0">
            <div className="absolute inset-0 overflow-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[600px]">
                <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">
                  <tr className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
                    <th className="px-5 py-3 border-b border-slate-200/70">Symbol</th>
                    <th className="px-5 py-3 border-b border-slate-200/70 text-right">Price (KHR)</th>
                    <th className="px-5 py-3 border-b border-slate-200/70 text-right">Change</th>
                    <th className="px-5 py-3 border-b border-slate-200/70 text-right">Volume</th>
                    <th className="w-10 pr-4 py-3 border-b border-slate-200/70"><span className="sr-only">Details</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stocks.map(stock => {
                    const isUp = stock.change >= 0;
                    const selected = detailOpen && stock.ticker === selectedProfileTicker;
                    return (
                      <tr
                        key={stock.ticker}
                        onClick={() => openDetail(stock.ticker)}
                        title={`View ${stock.ticker} details`}
                        className={cn('group cursor-pointer transition-colors', selected ? 'bg-blue-50/60' : 'hover:bg-blue-50/40')}
                      >
                        <td className="px-5 py-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{stock.ticker}</p>
                            <p className="text-xs text-slate-400 truncate max-w-[220px]" title={stock.name}>{stock.name}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className={cn('font-mono font-semibold text-base tracking-tight transition-colors duration-500', isRefreshing ? 'text-blue-600' : 'text-slate-900')}>
                            {formatNumber(stock.price)}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span className={cn('flex items-center gap-0.5 font-semibold font-mono text-sm', isUp ? 'text-emerald-600' : 'text-rose-600')}>
                              {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                              {formatNumber(Math.abs(stock.change))}
                            </span>
                            <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium font-mono', isUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')}>
                              {isUp ? '+' : ''}{stock.changePct.toFixed(2)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right font-mono font-medium text-slate-600">
                          {formatNumber(stock.volume)}
                        </td>
                        <td className="w-10 pr-4 py-3 text-right">
                          <ChevronRight className="w-4 h-4 ml-auto text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* IPO / Company Profiles Sidebar */}
        <div className="flex flex-col gap-6">
          <div className="relative bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 flex flex-col overflow-hidden">
            <div className="absolute -top-8 -right-8 w-36 h-36 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-full blur-2xl pointer-events-none" />

            <TabHeading icon={Building2} title="Latest IPO Profile" subtitle="MENG LY J. QUACH EDUCATION" />

            <div className="relative mt-4 rounded-xl bg-slate-50/60 ring-1 ring-slate-200/60 divide-y divide-slate-200/60">
              {[
                { label: 'Symbol', value: 'MJQE', tone: 'font-medium text-slate-900' },
                { label: 'Sector', value: 'Education', tone: 'font-medium text-slate-700' },
                { label: 'IPO Price', value: '2,080 KHR', tone: 'font-mono font-semibold text-blue-600' },
                { label: 'Listing Date', value: '28 Jun 2023', tone: 'font-medium text-slate-700' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                  <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">{row.label}</span>
                  <span className={cn('text-sm truncate', row.tone)}>{row.value}</span>
                </div>
              ))}
            </div>

            <button className="relative mt-4 w-full flex items-center justify-center gap-2 h-10 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-semibold text-sm transition-colors ring-1 ring-blue-100 cursor-pointer">
              <FileText className="w-4 h-4" /> View Prospectus
            </button>
          </div>

          <div className="relative flex-1 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-500/20 p-5 text-white overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/15 ring-1 ring-white/20 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-medium uppercase tracking-wider">Market Status</h3>
            </div>
            <p className="relative mt-3 text-sm text-blue-100 leading-relaxed">The Cambodia Securities Exchange is currently open for continuous trading.</p>
            <div className="relative mt-4 rounded-xl bg-white/10 ring-1 ring-white/15 p-1.5 space-y-0.5">
              {[
                { label: 'Pre-open', time: '08:00 - 09:00', active: false },
                { label: 'Continuous', time: '09:00 - 15:00', active: true },
                { label: 'Close', time: '15:00', active: false },
              ].map((s) => (
                <div
                  key={s.label}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-3 py-2 text-xs',
                    s.active ? 'bg-white text-blue-700 font-semibold shadow-sm' : 'text-blue-100 font-medium'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className={cn('w-1.5 h-1.5 rounded-full', s.active ? 'bg-emerald-500 animate-pulse' : 'bg-blue-200/60')} />
                    {s.label}
                  </span>
                  <span className="font-mono">{s.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Stock detail popup, opened by clicking a quotation row — styled after the Customer 360 profile */}
      {detailOpen && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
        onClick={() => setDetailOpen(false)}
      >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="stock-detail-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-6xl max-h-[92vh] bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-2xl shadow-blue-950/15 overflow-hidden flex flex-col"
      >
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-gradient-to-bl from-blue-400/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Header: clicked symbol and close */}
        <div className="relative z-10 p-6 flex items-start gap-4 justify-between shrink-0">
          <div className="min-w-0">
            <h2 id="stock-detail-title" className="text-lg font-semibold text-slate-900 tracking-tight">{selectedProfile.symbol}</h2>
            <p className="text-sm text-slate-500 truncate">{selectedProfile.companyName}</p>
          </div>
          <button
            type="button"
            onClick={() => setDetailOpen(false)}
            title="Close"
            className="h-9 w-9 shrink-0 inline-flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Segmented tab navigation */}
        <div className="relative z-10 px-6 pb-4 shrink-0">
          <div className="flex overflow-x-auto no-scrollbar gap-1 p-1 rounded-xl bg-slate-100/80 ring-1 ring-inset ring-slate-200/60 w-fit max-w-full">
            {['Profile', 'Financial Summary', 'Trading Data Summary', 'Shareholders', 'Disclosure', 'Dividend Policy', 'IPO'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={cn(
                  'whitespace-nowrap px-4 py-2 rounded-lg text-[13px] transition-all',
                  selectedTab === tab
                    ? 'bg-white text-blue-700 font-semibold shadow-sm ring-1 ring-slate-200/80'
                    : 'text-slate-500 font-medium hover:text-slate-800 hover:bg-white/60'
                )}
              >
                {tab}
              </button>
            ))}
          </div>

        </div>

        {/* Content Area */}
        <div className="relative z-10 flex-1 min-h-0 overflow-y-auto border-t border-slate-200/70 bg-white/60">
          {selectedTab === 'Profile' ? (
            <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-5">
              {/* Field grid: small uppercase label above the value, indigo icon tile (Customer 360 DenseField) */}
              <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-1 rounded-2xl bg-slate-50/60 ring-1 ring-slate-200/60 p-2">
                {profileFields.map((f) => (
                  <InfoField key={f.label} {...f} />
                ))}
              </div>

              {/* Company summary card */}
              <div className="relative rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/40 ring-1 ring-blue-100 p-5 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-full blur-2xl pointer-events-none" />
                <TabHeading icon={FileText} title="Company's Summary" />
                <p className="relative mt-3 text-sm leading-relaxed text-slate-600">
                  {selectedProfile.summary}
                </p>
              </div>
            </div>
          ) : selectedTab === 'Financial Summary' ? (
            <div className="p-6 space-y-5">
              <TabHeading icon={Activity} title={`Latest Financial Highlights (${new Date().getFullYear() - 1})`} />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Total Revenue', value: formatKHR(financials.revenue), delta: 12.4, icon: Wallet, tone: 'from-blue-500 to-indigo-600 shadow-blue-500/20', glow: 'from-blue-400/20' },
                  { label: 'Net Profit', value: formatKHR(financials.netProfit), delta: 8.2, icon: PiggyBank, tone: 'from-emerald-400 to-teal-500 shadow-emerald-500/20', glow: 'from-emerald-400/20' },
                  { label: 'Earnings Per Share', value: formatKHR(financials.eps), delta: -1.5, icon: Coins, tone: 'from-amber-400 to-orange-500 shadow-amber-500/20', glow: 'from-amber-400/20' },
                ].map(({ label, value, delta, icon: Icon, tone, glow }) => (
                  <div key={label} className="relative p-5 rounded-2xl bg-white ring-1 ring-slate-200/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden group hover:-translate-y-0.5 transition-all">
                    <div className={cn('absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl to-transparent rounded-full blur-2xl pointer-events-none', glow)} />
                    <div className="relative flex items-start justify-between">
                      <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</span>
                      <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br text-white shadow-md flex items-center justify-center', tone)}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="relative mt-2 text-2xl font-semibold text-slate-900 tracking-tighter font-mono">{value}</p>
                    <DeltaPill value={delta} suffix="YoY" />
                  </div>
                ))}
              </div>

              {/* Balance sheet: one card in the same language as the summary cards above.
                  Label and value on one line, bar underneath sized as a share of total assets. */}
              <div className="relative p-5 rounded-2xl bg-white ring-1 ring-slate-200/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-400/15 to-transparent rounded-full blur-2xl pointer-events-none" />

                <span className="relative block mb-5 text-xs font-medium uppercase tracking-wider text-slate-500">Balance Sheet</span>

                <div className="relative space-y-5">
                  {balanceRows.map((row) => (
                    <div key={row.label}>
                      <div className="flex items-center justify-between gap-4 mb-2.5">
                        <BalanceLabel row={row} />
                        <span className="text-lg font-semibold tracking-tighter font-mono text-slate-900">{formatKHR(row.value)}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className={cn('h-full rounded-full bg-gradient-to-r', row.tile)} style={{ width: `${barWidth(row)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : selectedTab === 'Trading Data Summary' ? (
            <div className="p-6 space-y-5">
              <TabHeading icon={CandlestickChart} title="52-Week Trading Summary" />

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  { label: '52-Week High (KHR)', value: formatNumber(trading.high), icon: ArrowUpRight, valueTone: 'text-emerald-600', tile: 'from-emerald-400 to-teal-500 shadow-emerald-500/20', glow: 'from-emerald-400/20' },
                  { label: '52-Week Low (KHR)', value: formatNumber(trading.low), icon: ArrowDownRight, valueTone: 'text-rose-600', tile: 'from-rose-400 to-pink-500 shadow-rose-500/20', glow: 'from-rose-400/20' },
                  { label: 'Average Volume (3M)', value: formatNumber(trading.avgVolume), icon: BarChart3, valueTone: 'text-slate-900', tile: 'from-blue-500 to-indigo-600 shadow-blue-500/20', glow: 'from-blue-400/20' },
                  { label: 'Total Traded Value (YTD)', value: formatKHR(trading.tradedValue), icon: Wallet, valueTone: 'text-slate-900', tile: 'from-blue-500 to-indigo-600 shadow-blue-500/20', glow: 'from-blue-400/20' },
                ].map(({ label, value, icon: Icon, valueTone, tile, glow }) => (
                  <div key={label} className="relative p-5 rounded-2xl bg-white ring-1 ring-slate-200/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden hover:-translate-y-0.5 transition-all">
                    <div className={cn('absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl to-transparent rounded-full blur-2xl pointer-events-none', glow)} />
                    <div className="relative flex items-start justify-between gap-3">
                      <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</span>
                      <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br text-white shadow-md flex items-center justify-center shrink-0', tile)}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <p className={cn('relative mt-2 text-2xl font-semibold tracking-tighter font-mono truncate', valueTone)} title={value}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : selectedTab === 'Shareholders' ? (
            <div className="p-6 space-y-5">
              <TabHeading icon={PieChart} title="Major Shareholders" />

              {/* Ring split by ownership; hovering a slice or legend row puts it in the centre */}
              <div className="flex flex-col md:flex-row items-center gap-8 p-6 rounded-2xl bg-white ring-1 ring-slate-200/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="relative w-48 h-48 shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r={DONUT_R} fill="none" strokeWidth="12" className="stroke-slate-100" />
                    {SHAREHOLDERS.map((sh, i) => (
                      <circle
                        key={sh.name}
                        cx="50"
                        cy="50"
                        r={DONUT_R}
                        fill="none"
                        strokeWidth={activeHolder === i ? 14 : 12}
                        strokeDasharray={`${Math.max(DONUT_SEGMENTS[i].len - 1.5, 0)} ${DONUT_CIRC}`}
                        strokeDashoffset={-DONUT_SEGMENTS[i].offset}
                        className={cn(sh.stroke, 'transition-all cursor-pointer')}
                        onMouseEnter={() => setActiveHolder(i)}
                        onMouseLeave={() => setActiveHolder(null)}
                      />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 pointer-events-none">
                    <span className="text-2xl font-semibold tracking-tighter font-mono text-slate-900">
                      {SHAREHOLDERS[activeHolder ?? 0].pct.toFixed(2)}%
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 line-clamp-2">
                      {SHAREHOLDERS[activeHolder ?? 0].type}
                    </span>
                  </div>
                </div>

                <div className="flex-1 w-full space-y-1">
                  {SHAREHOLDERS.map((sh, i) => (
                    <div
                      key={sh.name}
                      onMouseEnter={() => setActiveHolder(i)}
                      onMouseLeave={() => setActiveHolder(null)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3 py-3 transition',
                        activeHolder === i ? 'bg-slate-50 ring-1 ring-slate-200/70' : 'hover:bg-slate-50'
                      )}
                    >
                      <span className={cn('h-3 w-3 shrink-0 rounded-full', sh.dot)} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800" title={sh.name}>{sh.name}</p>
                        <span className={cn('mt-1 inline-flex h-5 items-center rounded-md border bg-white px-1.5 text-[10px] font-medium uppercase tracking-wider', sh.chip)}>
                          {sh.type}
                        </span>
                      </div>
                      <span className="text-sm font-semibold font-mono text-slate-900">{sh.pct.toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : selectedTab === 'Disclosure' ? (
            <div className="p-6 space-y-5">
              <TabHeading icon={FileText} title="Recent Disclosures" />
              {/* Same row as the customer view's Supporting Documents: file icon, name over detail, ghost actions */}
              <div className="space-y-3">
                {[
                  { title: 'Quarterly Report Q3 2023', date: 'Nov 14, 2023' },
                  { title: 'Quarterly Report Q2 2023', date: 'Aug 14, 2023' },
                  { title: 'Quarterly Report Q1 2023', date: 'May 15, 2023' },
                ].map((doc) => (
                  <div
                    key={doc.title}
                    className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate" title={doc.title}>
                          {doc.title}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 truncate">Official CSX filing • {doc.date}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        title={`View ${doc.title}`}
                        className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 text-xs font-medium transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">View</span>
                      </button>
                      <button
                        type="button"
                        title={`Download ${doc.title}`}
                        className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 text-xs font-medium transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Download</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : selectedTab === 'Dividend Policy' ? (
            <div className="p-6">{dividendSection}</div>
          ) : selectedTab === 'IPO' ? (
            <div className="p-6">{ipoSection}</div>
          ) : null}
        </div>
      </div>
      </div>
      )}
    </div>
  );
}
