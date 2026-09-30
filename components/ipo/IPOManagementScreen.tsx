'use client';
import React, { useState, useMemo } from 'react';
import { TrendingUp, Calendar, Search, Plus, Users, Activity, Layers, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormInput, FormSelect, FormDatePicker } from '@/components/ui/form';
import type { IpoMaster, CustomerTypeRecord, Individual } from '@/types';
import { INITIAL_IPOS, STATIC_IPO_STATS } from '@/lib/ipo-data';
import { IPOCard } from './IPOCard';
import { IPODetail } from './IPODetail';

interface IPOManagementScreenProps {
  customerTypeRecords: CustomerTypeRecord[];
  individuals: Individual[];
}

const CARD = 'relative bg-white rounded-2xl ring-1 ring-slate-200/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)]';


export function IPOManagementScreen({ customerTypeRecords }: IPOManagementScreenProps) {
  const [ipos, setIpos] = useState<IpoMaster[]>(INITIAL_IPOS);
  const [selectedIpoId, setSelectedIpoId] = useState<string|null>(ipos[2]?.id||null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQ, setSearchQ] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIpo, setEditingIpo] = useState<IpoMaster | null>(null);
  const [formData, setFormData] = useState<Partial<IpoMaster>>({});

  const handleOpenModal = (ipo?: IpoMaster) => {
    if (ipo) {
      setEditingIpo(ipo);
      setFormData(ipo);
    } else {
      setEditingIpo(null);
      setFormData({
        status: 'Upcoming',
        currency: 'KHR',
        offerPrice: 0,
        totalShares: 0,
        minSubscription: 1,
        maxSubscription: 1000,
        openDate: new Date().toISOString().split('T')[0],
        closeDate: new Date().toISOString().split('T')[0],
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.ticker) return; // basic validation

    if (editingIpo) {
      setIpos(prev => prev.map(i => i.id === editingIpo.id ? { ...i, ...formData } as IpoMaster : i));
    } else {
      const newIpo: IpoMaster = {
        ...formData,
        id: `IPO-${Math.floor(Math.random()*10000)}`,
      } as IpoMaster;
      setIpos(prev => [newIpo, ...prev]);
      setSelectedIpoId(newIpo.id);
    }
    setIsModalOpen(false);
  };

  const ipoStats = useMemo(()=>{
    const stats: Record<string,{subscribers:Set<string>;total:number}> = {};
    customerTypeRecords.filter(r=>r.typeId==='ipo-customer').forEach(r=>{
      let nameId = String(r.values.ipoNameId||'');

      // Map mock data IDs to tickers
      if (nameId === 'IPO-2026-001') nameId = 'PPSP';
      else if (nameId === 'IPO-2026-002') nameId = 'MJQE';
      else if (nameId === 'IPO-2026-003') nameId = 'CAMF';

      const cid = String(r.values.customerId||r.customerId);
      const amt = Number(r.values.subTotalAmount)||0;
      if(!stats[nameId]) stats[nameId]={subscribers:new Set(),total:0};
      stats[nameId].subscribers.add(cid);
      stats[nameId].total+=amt;
    });
    // Live records on top of the static demo totals
    const merged: Record<string,{subscribers:number;total:number}> = {};
    for (const t of new Set([...Object.keys(STATIC_IPO_STATS),...Object.keys(stats)])) {
      merged[t] = {
        subscribers: (STATIC_IPO_STATS[t]?.subscribers||0) + (stats[t]?.subscribers.size||0),
        total: (STATIC_IPO_STATS[t]?.total||0) + (stats[t]?.total||0),
      };
    }
    return merged;
  },[customerTypeRecords]);

  const q = searchQ.toLowerCase().trim();
  const filteredIpos = ipos.filter(ipo=>(statusFilter==='All'||ipo.status===statusFilter)&&(!q||ipo.name.toLowerCase().includes(q)||ipo.ticker.toLowerCase().includes(q)));
  const selectedIpo = ipos.find(i=>i.id===selectedIpoId)||null;
  const selectedStats = (selectedIpo && ipoStats[selectedIpo.ticker]) || {subscribers:0,total:0};


  const STATUSES = ['All','Open','Upcoming','Allotted','Closed','Listed'];

  const kpis = [
    {label:'Total IPOs',value:ipos.length,sub:'All time',tile:'from-slate-500 to-slate-600 shadow-slate-200',icon:Layers},
    {label:'Open Now',value:ipos.filter(i=>i.status==='Open').length,sub:'Accepting subscriptions',tile:'from-emerald-500 to-teal-600 shadow-emerald-200',icon:Activity},
    {label:'Upcoming',value:ipos.filter(i=>i.status==='Upcoming').length,sub:'Coming soon',tile:'from-amber-500 to-amber-600 shadow-amber-200',icon:Calendar},
    {label:'Total Subscribers',value:new Set(customerTypeRecords.filter(r=>r.typeId==='ipo-customer').map(r=>r.customerId)).size,sub:'Unique customers',tile:'from-blue-500 to-indigo-600 shadow-blue-200',icon:Users},
  ];

  return (
    <div className="h-full flex flex-col space-y-6 py-2 pb-8">
      {/* Header */}
      <div className="shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-950 to-blue-900 tracking-tight leading-tight">
                IPO Management
              </h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">CSX IPO lifecycle · subscription tracking · allotment management</p>
            </div>
          </div>
          <button onClick={() => handleOpenModal()} className="h-10 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all w-fit cursor-pointer">
            <Plus className="w-4 h-4" /> New IPO
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        {kpis.map(s=>(
          <div key={s.label} className="bg-white/80 backdrop-blur-xl rounded-[20px] p-5 border border-white/50 shadow-sm flex items-center gap-4 transition-all hover:shadow-md hover:bg-white/95 cursor-default">
            <div className={cn('w-12 h-12 rounded-[14px] bg-gradient-to-br flex items-center justify-center text-white shadow-md shrink-0',s.tile)}><s.icon className="w-5 h-5"/></div>
            <div><p className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold mb-0.5">{s.label}</p><p className="text-2xl font-semibold text-slate-800 leading-none">{s.value}</p><p className="text-[10px] text-slate-400 font-semibold mt-1">{s.sub}</p></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1 min-h-0 lg:min-h-[560px]">
        {/* IPO List */}
        <div className={cn(CARD,'lg:col-span-2 flex flex-col min-h-0 h-[560px] lg:h-auto overflow-hidden')}>
          <div className="px-4 pt-4 pb-3 border-b border-slate-100 space-y-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
              <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search IPO…" className="w-full h-10 pl-9 pr-4 text-sm bg-slate-50 ring-1 ring-slate-200/70 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/40 transition"/>
            </div>
            <div className="flex gap-1 p-1 rounded-xl bg-slate-100/80 overflow-x-auto">
              {STATUSES.map(s=>(
                <button key={s} onClick={()=>setStatusFilter(s)} className={cn('flex-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',statusFilter===s?'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/70':'text-slate-500 hover:text-slate-800')}>{s}</button>
              ))}
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 bg-slate-50/60 custom-scrollbar">
            {filteredIpos.map(ipo=>{
              const st = ipoStats[ipo.ticker]||{subscribers:0,total:0};
              return <IPOCard key={ipo.id} ipo={ipo} totalSubscribed={st.total} onSelect={()=>setSelectedIpoId(ipo.id)} selected={selectedIpoId===ipo.id}/>;
            })}
          </div>
        </div>

        {/* IPO Detail */}
        <div className="lg:col-span-3 flex flex-col min-h-0">
          {selectedIpo ? (
            <IPODetail ipo={selectedIpo} onEdit={() => handleOpenModal(selectedIpo)} subscriberCount={selectedStats.subscribers} totalSubscribed={selectedStats.total} />
          ) : (
            <div className={cn(CARD,'flex items-center justify-center h-64')}>
              <div className="text-center text-slate-400"><TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-40"/><p>Select an IPO to view details</p></div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Update Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-900">{editingIpo ? 'Edit IPO Details' : 'Create New IPO'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <FormInput containerClassName="col-span-2 sm:col-span-1" label="IPO Name" required value={formData.name || ''} onChange={e=>setFormData({...formData, name: e.target.value})} placeholder="e.g. Acme Corp" />
                <FormInput containerClassName="col-span-2 sm:col-span-1" label="Ticker Symbol" required value={formData.ticker || ''} onChange={e=>setFormData({...formData, ticker: e.target.value})} placeholder="e.g. ACM" />
                <FormInput containerClassName="col-span-2 sm:col-span-1" label="Sector" value={formData.sector || ''} onChange={e=>setFormData({...formData, sector: e.target.value})} placeholder="e.g. Technology" />
                <FormSelect containerClassName="col-span-2 sm:col-span-1" label="Status" value={formData.status || 'Upcoming'} onChange={v=>setFormData({...formData, status: v as IpoMaster['status']})} options={['Upcoming', 'Open', 'Closed', 'Allotted', 'Listed']} />
                <FormInput containerClassName="col-span-2 sm:col-span-1" label="Offer Price" type="number" step="0.01" value={formData.offerPrice || 0} onChange={e=>setFormData({...formData, offerPrice: parseFloat(e.target.value)})} />
                <FormInput containerClassName="col-span-2 sm:col-span-1" label="Total Shares" type="number" value={formData.totalShares || 0} onChange={e=>setFormData({...formData, totalShares: parseInt(e.target.value)})} />
                <FormDatePicker containerClassName="col-span-2 sm:col-span-1" label="Open Date" value={formData.openDate || ''} onChange={v=>setFormData({...formData, openDate: v})} max={formData.closeDate || undefined} />
                <FormDatePicker containerClassName="col-span-2 sm:col-span-1" label="Close Date" value={formData.closeDate || ''} onChange={v=>setFormData({...formData, closeDate: v})} min={formData.openDate || undefined} />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm">
                {editingIpo ? 'Save Changes' : 'Create IPO'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}