'use client';

import React, { useState } from 'react';
import { PortfolioHolding, TradeRecord } from '@/types';
import { INITIAL_HOLDINGS, INITIAL_TRADES } from '@/lib/portfolio-data';
import { INITIAL_INDIVIDUALS } from '@/lib/data';
import { 
  Briefcase, TrendingUp, TrendingDown, Clock, Search, Filter, 
  ArrowRightLeft, History, PieChart as PieChartIcon, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

import { 
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';

const formatUSD = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);
const formatNumber = (val: number) => new Intl.NumberFormat('en-US').format(val);

const ALLOCATION_DATA = [
  { name: 'Banking & Finance', value: 65000, color: '#3B82F6' },
  { name: 'Real Estate', value: 45000, color: '#8B5CF6' },
  { name: 'Transportation', value: 20000, color: '#10B981' },
  { name: 'Education', value: 12000, color: '#F59E0B' }
];

const PERFORMANCE_DATA = [
  { month: 'Jan', value: 125000 },
  { month: 'Feb', value: 128000 },
  { month: 'Mar', value: 126500 },
  { month: 'Apr', value: 132000 },
  { month: 'May', value: 138000 },
  { month: 'Jun', value: 142000 }
];

export function PortfolioScreen() {
  const [activeTab, setActiveTab] = useState<'holdings' | 'trades'>('holdings');
  const [search, setSearch] = useState('');
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeForm, setTradeForm] = useState<Partial<TradeRecord>>({
    type: 'Buy',
    currency: 'USD',
  });
  const [trades, setTrades] = useState<TradeRecord[]>(INITIAL_TRADES);

  const totalMarketValue = INITIAL_HOLDINGS.reduce((s, h) => s + h.marketValue, 0);
  const totalPnL = INITIAL_HOLDINGS.reduce((s, h) => s + h.unrealizedPnL, 0);
  const pnlPercent = (totalPnL / (totalMarketValue - totalPnL)) * 100;

  const filteredHoldings = INITIAL_HOLDINGS.filter(h => 
    h.customerName.toLowerCase().includes(search.toLowerCase()) || 
    h.ticker.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTrades = trades.filter(t => 
    t.ticker.toLowerCase().includes(search.toLowerCase()) || 
    INITIAL_INDIVIDUALS.find(i => i.id === t.customerId)?.fullNameEN?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveTrade = () => {
    if (!tradeForm.customerId || !tradeForm.ticker || !tradeForm.quantity || !tradeForm.price) return;
    const tradeDate = new Date();
    // T+2 Settlement calculation
    const settlementDate = new Date(tradeDate);
    settlementDate.setDate(settlementDate.getDate() + 2);
    // If settlement lands on weekend, push to Monday/Tuesday (simple logic: +2 days if sat/sun)
    if (settlementDate.getDay() === 6) settlementDate.setDate(settlementDate.getDate() + 2);
    if (settlementDate.getDay() === 0) settlementDate.setDate(settlementDate.getDate() + 1);

    const newTrade: TradeRecord = {
      id: `TRD-${Math.floor(Math.random() * 10000) + 2000}`,
      customerId: tradeForm.customerId,
      ticker: tradeForm.ticker,
      type: tradeForm.type as 'Buy' | 'Sell',
      quantity: tradeForm.quantity,
      price: tradeForm.price,
      tradeDate: tradeDate.toISOString(),
      settlementDate: settlementDate.toISOString(),
      status: 'Pending',
      currency: tradeForm.currency || 'USD',
    };
    setTrades([newTrade, ...trades]);
    setIsTradeModalOpen(false);
    setTradeForm({ type: 'Buy', currency: 'USD' });
  };

  return (
    <div className="h-full flex flex-col space-y-6 py-2 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-200">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Portfolio & Trading</h1>
          </div>
          <p className="text-sm text-slate-500 ml-12">Client holdings, P&L, and trade settlement tracking.</p>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">Total Assets (AUM)</p>
          <p className="text-2xl font-bold text-slate-800">{formatUSD(totalMarketValue)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">Unrealized P&L</p>
          <div className="flex items-end gap-2">
            <p className={cn("text-2xl font-bold", totalPnL >= 0 ? "text-emerald-600" : "text-rose-600")}>
              {totalPnL >= 0 ? '+' : ''}{formatUSD(totalPnL)}
            </p>
            <span className={cn("text-sm font-semibold mb-1", totalPnL >= 0 ? "text-emerald-600" : "text-rose-600")}>
              ({totalPnL >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">Pending Settlements</p>
          <p className="text-2xl font-bold text-amber-600">{trades.filter(t => t.status === 'Pending').length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">Active Positions</p>
          <p className="text-2xl font-bold text-slate-800">{INITIAL_HOLDINGS.length}</p>
        </div>
      </div>

      {/* Visual Analytics Section (CRM Benchmark) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Allocation Donut */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:col-span-1">
          <h2 className="text-sm font-bold text-slate-800 mb-6">Asset Allocation</h2>
          <div className="h-[220px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ALLOCATION_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {ALLOCATION_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => formatUSD(val)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-slate-500 font-medium">Total AUM</span>
              <span className="text-lg font-bold text-slate-900">{formatUSD(totalMarketValue)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {ALLOCATION_DATA.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs font-medium text-slate-600 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Wealth Growth Line Chart */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-slate-800">Wealth Growth History</h2>
            <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">+13.6% YTD</div>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PERFORMANCE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip formatter={(val: number) => formatUSD(val)} />
                <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('holdings')}
              className={cn("px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2", activeTab === 'holdings' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              <PieChartIcon className="w-4 h-4" /> Holdings
            </button>
            <button 
              onClick={() => setActiveTab('trades')}
              className={cn("px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2", activeTab === 'trades' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              <History className="w-4 h-4" /> Trade History
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ticker or client..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full sm:w-64 h-9 pl-9 pr-4 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              />
            </div>
            <button onClick={() => setIsTradeModalOpen(true)} className="flex items-center gap-1.5 px-3 h-9 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
              <Activity className="w-4 h-4" /> New Trade
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[800px]">
            <thead className="bg-slate-50/80 sticky top-0 backdrop-blur-sm z-10">
              {activeTab === 'holdings' ? (
                <tr>
                  <th className="px-5 py-3 font-semibold text-slate-500 border-b border-slate-200">Client</th>
                  <th className="px-5 py-3 font-semibold text-slate-500 border-b border-slate-200">Asset</th>
                  <th className="px-5 py-3 font-semibold text-slate-500 border-b border-slate-200 text-right">Quantity</th>
                  <th className="px-5 py-3 font-semibold text-slate-500 border-b border-slate-200 text-right">Avg Cost</th>
                  <th className="px-5 py-3 font-semibold text-slate-500 border-b border-slate-200 text-right">Mkt Price</th>
                  <th className="px-5 py-3 font-semibold text-slate-500 border-b border-slate-200 text-right">Market Value</th>
                  <th className="px-5 py-3 font-semibold text-slate-500 border-b border-slate-200 text-right">Unrealized P&L</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-5 py-3 font-semibold text-slate-500 border-b border-slate-200">Date</th>
                  <th className="px-5 py-3 font-semibold text-slate-500 border-b border-slate-200">Client</th>
                  <th className="px-5 py-3 font-semibold text-slate-500 border-b border-slate-200">Asset</th>
                  <th className="px-5 py-3 font-semibold text-slate-500 border-b border-slate-200">Type</th>
                  <th className="px-5 py-3 font-semibold text-slate-500 border-b border-slate-200 text-right">Quantity</th>
                  <th className="px-5 py-3 font-semibold text-slate-500 border-b border-slate-200 text-right">Price</th>
                  <th className="px-5 py-3 font-semibold text-slate-500 border-b border-slate-200">Settlement</th>
                  <th className="px-5 py-3 font-semibold text-slate-500 border-b border-slate-200">Status</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeTab === 'holdings' ? (
                filteredHoldings.length > 0 ? (
                  filteredHoldings.map(h => (
                    <tr key={h.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-slate-800">{h.customerName}</p>
                        <p className="text-xs text-slate-400">{h.customerId}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700 mb-1">{h.ticker}</span>
                        <p className="text-[10px] text-slate-500">{h.sector}</p>
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-medium text-slate-700">{formatNumber(h.quantity)}</td>
                      <td className="px-5 py-3 text-right font-mono text-slate-600">{formatUSD(h.averageCost)}</td>
                      <td className="px-5 py-3 text-right font-mono text-slate-600">{formatUSD(h.currentPrice)}</td>
                      <td className="px-5 py-3 text-right font-mono font-semibold text-slate-800">{formatUSD(h.marketValue)}</td>
                      <td className="px-5 py-3 text-right">
                        <p className={cn("font-mono font-bold", h.unrealizedPnL >= 0 ? "text-emerald-600" : "text-rose-600")}>
                          {h.unrealizedPnL >= 0 ? '+' : ''}{formatUSD(h.unrealizedPnL)}
                        </p>
                        <p className={cn("text-xs font-semibold", h.unrealizedPnL >= 0 ? "text-emerald-500" : "text-rose-500")}>
                          {h.pnlPercentage >= 0 ? '+' : ''}{h.pnlPercentage.toFixed(2)}%
                        </p>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-400">No holdings found</td></tr>
                )
              ) : (
                filteredTrades.length > 0 ? (
                  filteredTrades.map(t => {
                    const client = INITIAL_INDIVIDUALS.find(i => i.id === t.customerId);
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                        <td className="px-5 py-3 text-slate-600">{format(parseISO(t.tradeDate), 'dd MMM yyyy')}</td>
                        <td className="px-5 py-3">
                          <p className="font-semibold text-slate-800">{client?.fullNameEN || t.customerId}</p>
                        </td>
                        <td className="px-5 py-3">
                          <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">{t.ticker}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={cn("px-2 py-0.5 rounded text-xs font-bold", t.type === 'Buy' ? "bg-emerald-100 text-emerald-700" : t.type === 'Sell' ? "bg-rose-100 text-rose-700" : "bg-purple-100 text-purple-700")}>
                            {t.type}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-slate-700">{formatNumber(t.quantity)}</td>
                        <td className="px-5 py-3 text-right font-mono text-slate-700">{formatUSD(t.price)}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{format(parseISO(t.settlementDate), 'dd MMM yyyy')}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold border", 
                            t.status === 'Settled' ? "bg-emerald-50 border-emerald-200 text-emerald-700" : 
                            t.status === 'Pending' ? "bg-amber-50 border-amber-200 text-amber-700" : 
                            "bg-slate-50 border-slate-200 text-slate-700"
                          )}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan={8} className="px-5 py-12 text-center text-slate-400">No trades found</td></tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* New Trade Modal */}
      {isTradeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Record New Trade</h2>
              <button onClick={() => setIsTradeModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Customer</label>
                <select value={tradeForm.customerId || ''} onChange={e => setTradeForm({...tradeForm, customerId: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white">
                  <option value="">Select Customer</option>
                  {INITIAL_INDIVIDUALS.map(i => <option key={i.id} value={i.id}>{i.fullNameEN || i.givenNameEN} ({i.id})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Trade Type</label>
                  <select value={tradeForm.type || 'Buy'} onChange={e => setTradeForm({...tradeForm, type: e.target.value as 'Buy'|'Sell'})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white">
                    <option value="Buy">Buy</option>
                    <option value="Sell">Sell</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Ticker / Asset</label>
                  <input type="text" value={tradeForm.ticker || ''} onChange={e => setTradeForm({...tradeForm, ticker: e.target.value.toUpperCase()})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none uppercase placeholder-normal" placeholder="e.g. ABC" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Quantity</label>
                  <input type="number" min="1" value={tradeForm.quantity || ''} onChange={e => setTradeForm({...tradeForm, quantity: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Price (USD)</label>
                  <input type="number" step="0.01" value={tradeForm.price || ''} onChange={e => setTradeForm({...tradeForm, price: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="0.00" />
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-start gap-2 mt-2">
                <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800">Trade will be recorded with today&apos;s date. Settlement date will be automatically set to T+2 business days.</p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
              <button onClick={() => setIsTradeModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button onClick={handleSaveTrade} className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm">
                Save Trade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
