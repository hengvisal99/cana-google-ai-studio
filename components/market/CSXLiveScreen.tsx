'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, ArrowDownRight, ArrowUpRight, Globe, RefreshCcw, 
  TrendingUp, Building2, Calendar, FileText, ChevronDown
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

export function CSXLiveScreen() {
  const [stocks, setStocks] = useState<StockData[]>(INITIAL_STOCKS);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedProfileTicker, setSelectedProfileTicker] = useState<string>('DBDE');
  const [selectedTab, setSelectedTab] = useState('Profile');

  const selectedProfile = MOCK_PROFILES[selectedProfileTicker];

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

  return (
    <div className="flex flex-col space-y-6 py-2 pb-8 min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-md shadow-slate-200">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              CSX Live Market
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
              </span>
            </h1>
          </div>
          <p className="text-sm text-slate-500 ml-12">Real-time data feed from the Cambodia Securities Exchange.</p>
        </div>
        
        <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
          <Activity className={cn("w-4 h-4 transition-colors", isRefreshing ? "text-indigo-600" : "")} />
          <span>Polled: {format(lastRefreshed, 'HH:mm:ss')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Stock Ticker Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[460px]">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" /> Main Board Quotations
            </h2>
            <div className={cn("transition-opacity duration-300", isRefreshing ? "opacity-100" : "opacity-0")}>
              <RefreshCcw className="w-4 h-4 text-indigo-500 animate-spin" />
            </div>
          </div>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[600px]">
              <thead className="bg-slate-50/80 sticky top-0">
                <tr>
                  <th className="px-5 py-3 font-semibold text-slate-500 border-b border-slate-200">Symbol</th>
                  <th className="px-5 py-3 font-semibold text-slate-500 border-b border-slate-200 text-right">Price (KHR)</th>
                  <th className="px-5 py-3 font-semibold text-slate-500 border-b border-slate-200 text-right">Change</th>
                  <th className="px-5 py-3 font-semibold text-slate-500 border-b border-slate-200 text-right">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stocks.map(stock => {
                  const isUp = stock.change >= 0;
                  // We add a subtle keyflash effect when price updates
                  return (
                    <tr key={stock.ticker} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-800">{stock.ticker}</p>
                        <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{stock.name}</p>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className={cn("font-mono font-bold text-base transition-colors duration-500", isRefreshing ? "text-indigo-600" : "text-slate-900")}>
                          {formatNumber(stock.price)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className={cn("flex items-center gap-0.5 font-bold font-mono", isUp ? "text-emerald-600" : "text-rose-600")}>
                            {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                            {formatNumber(Math.abs(stock.change))}
                          </span>
                          <span className={cn("text-xs font-semibold", isUp ? "text-emerald-500" : "text-rose-500")}>
                            {isUp ? '+' : ''}{stock.changePct.toFixed(2)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right font-mono font-medium text-slate-600">
                        {formatNumber(stock.volume)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* IPO / Company Profiles Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center opacity-50">
                <Building2 className="w-8 h-8 text-slate-300" />
              </div>
            </div>
            
            <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
              Latest IPO Profile
            </h3>
            <p className="text-xs text-slate-500 mb-6">MENG LY J. QUACH EDUCATION</p>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                <span className="text-xs font-semibold text-slate-500">Symbol</span>
                <span className="font-bold text-slate-900">MJQE</span>
              </div>
              <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                <span className="text-xs font-semibold text-slate-500">Sector</span>
                <span className="font-semibold text-slate-700">Education</span>
              </div>
              <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                <span className="text-xs font-semibold text-slate-500">IPO Price</span>
                <span className="font-mono font-bold text-indigo-600">2,080 KHR</span>
              </div>
              <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                <span className="text-xs font-semibold text-slate-500">Listing Date</span>
                <span className="font-semibold text-slate-700">28 Jun 2023</span>
              </div>
            </div>
            
            <button className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm transition-colors border border-slate-200">
              <FileText className="w-4 h-4" /> View Prospectus
            </button>
          </div>

          <div className="bg-indigo-600 rounded-2xl shadow-md p-5 text-white">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-300" /> Market Status
            </h3>
            <p className="text-indigo-100 text-sm mb-4">The Cambodia Securities Exchange is currently open for continuous trading.</p>
            <div className="bg-indigo-900/30 p-3 rounded-xl border border-indigo-500/30">
              <div className="flex justify-between text-xs font-medium text-indigo-200 mb-1">
                <span>Pre-open</span>
                <span>08:00 - 09:00</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-white mb-1">
                <span>Continuous</span>
                <span>09:00 - 15:00</span>
              </div>
              <div className="flex justify-between text-xs font-medium text-indigo-200">
                <span>Close</span>
                <span>15:00</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Full Width Stock Detail Information Module */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mt-4">
        
        {/* Header & Selector */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <h2 className="text-lg font-bold text-slate-800">Stock Detail Information</h2>
          <div className="relative">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedProfileTicker}
              onChange={(e) => setSelectedProfileTicker(e.target.value)}
              className="appearance-none pl-9 pr-10 py-2 rounded-lg border border-slate-300 bg-white text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer shadow-sm w-48"
            >
              {Object.keys(MOCK_PROFILES).sort().map(ticker => (
                <option key={ticker} value={ticker}>{ticker}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-slate-200 no-scrollbar">
          {['Profile', 'Financial Summary', 'Trading Data Summary', 'Shareholders', 'Disclosure', 'Dividend Policy', 'IPO'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={cn(
                "whitespace-nowrap px-6 py-3.5 text-sm font-semibold transition-colors border-b-2",
                selectedTab === tab
                  ? "border-blue-600 text-blue-600 bg-blue-50/50" 
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-0 bg-white">
          {selectedTab === 'Profile' ? (
            <>
              <table className="w-full text-left text-sm border-collapse">
                <tbody className="divide-y divide-slate-200">
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-semibold text-white bg-blue-600 w-1/3 sm:w-1/4">Company Name</td>
                    <td className="px-6 py-3 text-slate-700 bg-white">{selectedProfile.companyName}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-semibold text-white bg-blue-600">Inception Year</td>
                    <td className="px-6 py-3 text-slate-700 bg-white">{selectedProfile.inceptionYear}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-semibold text-white bg-blue-600">Industry Classification</td>
                    <td className="px-6 py-3 text-slate-700 bg-white">{selectedProfile.industry}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-semibold text-white bg-blue-600">Type of Listed Shares</td>
                    <td className="px-6 py-3 text-slate-700 bg-white">{selectedProfile.listedSharesType}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-semibold text-white bg-blue-600">No. of Listed Shares</td>
                    <td className="px-6 py-3 text-slate-700 bg-white">{selectedProfile.noOfShares}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-semibold text-white bg-blue-600">Code</td>
                    <td className="px-6 py-3 text-slate-700 bg-white">{selectedProfile.code}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-semibold text-white bg-blue-600">Symbol</td>
                    <td className="px-6 py-3 font-bold text-slate-900 bg-white">{selectedProfile.symbol}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-semibold text-white bg-blue-600">Listing Date</td>
                    <td className="px-6 py-3 text-slate-700 bg-white">{selectedProfile.listingDate}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-semibold text-white bg-blue-600">Website</td>
                    <td className="px-6 py-3 text-blue-600 hover:underline cursor-pointer bg-white">{selectedProfile.website}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-semibold text-white bg-blue-600">No. of Staffs</td>
                    <td className="px-6 py-3 text-slate-700 bg-white">{selectedProfile.staffs}</td>
                  </tr>
                </tbody>
              </table>

              <div className="p-8">
                <h3 className="text-lg font-bold text-amber-700 mb-3">Company's summary</h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  {selectedProfile.summary}
                </p>
              </div>
            </>
          ) : selectedTab === 'Financial Summary' ? (
            <div className="p-8">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Latest Financial Highlights ({new Date().getFullYear() - 1})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Total Revenue</p>
                  <p className="text-2xl font-bold text-slate-900">{formatKHR(Math.floor(Math.random() * 500000000000) + 10000000000)}</p>
                  <p className="text-sm font-semibold text-emerald-600 mt-2">+12.4% YoY</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Net Profit</p>
                  <p className="text-2xl font-bold text-slate-900">{formatKHR(Math.floor(Math.random() * 80000000000) + 5000000000)}</p>
                  <p className="text-sm font-semibold text-emerald-600 mt-2">+8.2% YoY</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Earnings Per Share (EPS)</p>
                  <p className="text-2xl font-bold text-slate-900">{formatKHR(Math.floor(Math.random() * 1000) + 100)}</p>
                  <p className="text-sm font-semibold text-rose-500 mt-2">-1.5% YoY</p>
                </div>
              </div>
              
              <div className="mt-8 border-t border-slate-100 pt-6">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 font-semibold text-slate-600">Metric</th>
                      <th className="px-4 py-2 font-semibold text-slate-600 text-right">Value (KHR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr><td className="px-4 py-3 text-slate-700">Total Assets</td><td className="px-4 py-3 text-right font-mono font-medium">{formatKHR(Math.floor(Math.random() * 1000000000000))}</td></tr>
                    <tr><td className="px-4 py-3 text-slate-700">Total Liabilities</td><td className="px-4 py-3 text-right font-mono font-medium">{formatKHR(Math.floor(Math.random() * 500000000000))}</td></tr>
                    <tr><td className="px-4 py-3 text-slate-700">Total Equity</td><td className="px-4 py-3 text-right font-mono font-medium">{formatKHR(Math.floor(Math.random() * 500000000000))}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : selectedTab === 'Trading Data Summary' ? (
            <div className="p-8">
              <h3 className="text-lg font-bold text-slate-800 mb-4">52-Week Trading Summary</h3>
              <table className="w-full text-left text-sm border-collapse">
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50"><td className="px-4 py-3 font-semibold text-slate-600 w-1/2">52-Week High (KHR)</td><td className="px-4 py-3 text-right font-mono text-emerald-600 font-bold">{formatNumber(Math.floor(Math.random() * 20000) + 10000)}</td></tr>
                  <tr className="hover:bg-slate-50"><td className="px-4 py-3 font-semibold text-slate-600 w-1/2">52-Week Low (KHR)</td><td className="px-4 py-3 text-right font-mono text-rose-600 font-bold">{formatNumber(Math.floor(Math.random() * 5000) + 1000)}</td></tr>
                  <tr className="hover:bg-slate-50"><td className="px-4 py-3 font-semibold text-slate-600">Average Volume (3M)</td><td className="px-4 py-3 text-right font-mono text-slate-700">{formatNumber(Math.floor(Math.random() * 100000) + 10000)}</td></tr>
                  <tr className="hover:bg-slate-50"><td className="px-4 py-3 font-semibold text-slate-600">Total Traded Value (YTD)</td><td className="px-4 py-3 text-right font-mono text-slate-700">{formatKHR(Math.floor(Math.random() * 5000000000) + 100000000)}</td></tr>
                </tbody>
              </table>
            </div>
          ) : selectedTab === 'Shareholders' ? (
            <div className="p-8">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Major Shareholders</h3>
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-600">Shareholder Name</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Type</th>
                    <th className="px-4 py-3 font-semibold text-slate-600 text-right">% of Total Shares</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-800">Ministry of Economy and Finance</td>
                    <td className="px-4 py-3 text-slate-600">Government</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700">51.00%</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-800">Cana Securities</td>
                    <td className="px-4 py-3 text-slate-600">Institutional</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700">12.45%</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-800">Retail Investors (Public Float)</td>
                    <td className="px-4 py-3 text-slate-600">Public</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700">36.55%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : selectedTab === 'Disclosure' ? (
            <div className="p-8">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Disclosures</h3>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-300 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-rose-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-700">Quarterly Report Q{4-i} 2023</p>
                        <p className="text-xs text-slate-500">Official CSX filing • {format(new Date(Date.now() - i * 7776000000), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                    <button className="px-4 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                      Download PDF
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : selectedTab === 'Dividend Policy' ? (
            <div className="p-8">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Dividend Policy Statement</h3>
              <p className="text-sm text-slate-600 mb-8 leading-relaxed">
                The Company intends to recommend and distribute dividends of not less than 20% of its net profit after tax. The actual dividend payout will depend on the Company's financial performance, capital expenditure requirements, and future expansion plans, subject to the approval of the Board of Directors and Shareholders.
              </p>
              
              <h3 className="text-md font-bold text-slate-800 mb-4">Historical Payouts</h3>
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-600">Record Date</th>
                    <th className="px-4 py-3 font-semibold text-slate-600 text-right">Dividend Per Share (KHR)</th>
                    <th className="px-4 py-3 font-semibold text-slate-600 text-right">Yield</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700">Apr 15, 2023</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-indigo-600">120</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-600">3.5%</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700">Apr 12, 2022</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-indigo-600">105</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-600">3.2%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : selectedTab === 'IPO' ? (
            <div className="p-8">
              <h3 className="text-lg font-bold text-slate-800 mb-4">IPO Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                  <p className="text-xs font-bold text-indigo-400 uppercase mb-1">Underwriter</p>
                  <p className="text-sm font-bold text-indigo-900">Cana Securities Ltd.</p>
                </div>
                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                  <p className="text-xs font-bold text-indigo-400 uppercase mb-1">Offering Price</p>
                  <p className="text-sm font-bold text-indigo-900 font-mono">2,080 KHR</p>
                </div>
                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                  <p className="text-xs font-bold text-indigo-400 uppercase mb-1">Total Shares Offered</p>
                  <p className="text-sm font-bold text-indigo-900 font-mono">15,000,000</p>
                </div>
                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                  <p className="text-xs font-bold text-indigo-400 uppercase mb-1">Guaranteed Dividend</p>
                  <p className="text-sm font-bold text-emerald-600">6% for first 2 years</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
