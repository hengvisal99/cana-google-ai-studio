'use client';
import React, { useState, useMemo } from 'react';
import { TrendingUp, Calendar, Search, Plus, Users, DollarSign, Clock, CheckCircle2, ChevronRight, Building2, Activity, BarChart3, Layers, ExternalLink, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { IpoMaster, CustomerTypeRecord, Individual } from '@/types';
import { INITIAL_IPOS } from '@/lib/ipo-data';
import { differenceInDays, parseISO, isValid } from 'date-fns';

interface IPOManagementScreenProps {
  customerTypeRecords: CustomerTypeRecord[];
  individuals: Individual[];
}

const STATUS_CONFIG: Record<string,{cls:string;dot:string}> = {
  Upcoming: {cls:'bg-slate-100 text-slate-600 border-slate-200',dot:'bg-slate-400'},
  Open:     {cls:'bg-emerald-100 text-emerald-700 border-emerald-200',dot:'bg-emerald-500'},
  Closed:   {cls:'bg-amber-100 text-amber-700 border-amber-200',dot:'bg-amber-500'},
  Allotted: {cls:'bg-blue-100 text-blue-700 border-blue-200',dot:'bg-blue-500'},
  Listed:   {cls:'bg-purple-100 text-purple-700 border-purple-200',dot:'bg-purple-500'},
};

function formatUSD(n: number) { return `$${n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`; }
function formatShares(n: number) { return n>=1_000_000?`${(n/1_000_000).toFixed(1)}M`:n>=1_000?`${(n/1_000).toFixed(0)}K`:`${n}`; }

function IPOCard({ ipo, subscriberCount, totalSubscribed, onSelect, selected }: { ipo: IpoMaster; subscriberCount: number; totalSubscribed: number; onSelect: ()=>void; selected: boolean }) {
  const sc = STATUS_CONFIG[ipo.status]||STATUS_CONFIG.Upcoming;
  const today = new Date();
  const closeDate = parseISO(ipo.closeDate);
  const daysLeft = isValid(closeDate) ? differenceInDays(closeDate, today) : null;
  const subscriptionFill = ipo.totalShares>0 ? Math.min(100,(totalSubscribed/ipo.offerPrice)/ipo.totalShares*100) : 0;
  return (
    <button onClick={onSelect} className={cn('group w-full text-left rounded-[16px] border p-4 transition-all duration-300 relative overflow-hidden',selected?'border-blue-500 bg-blue-50/50 shadow-md ring-1 ring-blue-500/20':'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm')}>
      {selected && <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-blue-500 rounded-l-xl" />}
      
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={cn('font-mono text-[10px] px-2 py-0.5 rounded-[6px] font-bold tracking-widest', selected ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600')}>{ipo.ticker}</span>
            <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] text-[9px] font-bold uppercase tracking-widest border',sc.cls)}><span className={cn('w-1.5 h-1.5 rounded-full',sc.dot)}/>{ipo.status}</span>
          </div>
          <p className="font-bold text-slate-900 text-[15px] leading-tight truncate group-hover:text-blue-700 transition-colors">{ipo.name}</p>
          <p className="text-[11px] font-medium text-slate-500 mt-1 truncate">{ipo.sector}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[17px] font-black text-slate-900 tracking-tight">{formatUSD(ipo.offerPrice)}</p>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Offer Price</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4 mt-3">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Subscribers</span>
          <span className="font-bold text-slate-700 text-[13px]">{subscriberCount}</span>
        </div>
        <div className="w-px h-6 bg-slate-200/80" />
        <div className="flex flex-col">
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Subscribed</span>
          <span className="font-bold text-slate-700 text-[13px]">{formatUSD(totalSubscribed)}</span>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
          <span>Subscription Fill</span>
          <span className={cn(selected ? 'text-blue-700 font-black' : 'text-slate-700')}>{subscriptionFill.toFixed(1)}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700" style={{width:`${subscriptionFill}%`}}/>
        </div>
      </div>
      
      {(daysLeft !== null || ipo.oversubscriptionRate) && (
        <div className="mt-4 flex items-center justify-between border-t border-slate-100/80 pt-3">
          {ipo.status==='Open'&&daysLeft!==null ? (
            <span className={cn('text-[10px] font-bold flex items-center gap-1.5',daysLeft<=7?'text-rose-500':'text-amber-500')}><Clock className="w-3 h-3"/>{daysLeft} days left</span>
          ) : <span />}
          
          {ipo.oversubscriptionRate && (
            <span className="text-[9px] text-purple-700 bg-purple-100/50 px-2 py-0.5 rounded-[6px] font-bold uppercase tracking-widest border border-purple-200/50">✦ {ipo.oversubscriptionRate}x Over</span>
          )}
        </div>
      )}
    </button>
  );
}

export function IPOManagementScreen({ customerTypeRecords, individuals }: IPOManagementScreenProps) {
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
    return stats;
  },[customerTypeRecords]);

  const q = searchQ.toLowerCase().trim();
  const filteredIpos = ipos.filter(ipo=>(statusFilter==='All'||ipo.status===statusFilter)&&(!q||ipo.name.toLowerCase().includes(q)||ipo.ticker.toLowerCase().includes(q)));
  const selectedIpo = ipos.find(i=>i.id===selectedIpoId)||null;

  const selectedStats = selectedIpo ? (ipoStats[selectedIpo.ticker]||{subscribers:new Set(),total:0}) : null;
  const selectedSubscribers = selectedStats ? [...selectedStats.subscribers].map(cid=>individuals.find(i=>i.id===cid)).filter(Boolean) as Individual[] : [];

  const STATUSES = ['All','Open','Upcoming','Allotted','Closed','Listed'];

  return (
    <div className="h-full flex flex-col space-y-6 py-2 pb-8">
      <div className="flex items-start justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-200"><TrendingUp className="w-5 h-5 text-white"/></div>
            <h1 className="text-2xl font-bold text-slate-900">IPO Management</h1>
          </div>
          <p className="text-sm text-slate-500 ml-12">CSX IPO lifecycle · subscription tracking · allotment management</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> New IPO
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {label:'Total IPOs',value:ipos.length,sub:'All time',color:'from-slate-500 to-slate-600 shadow-slate-200',icon:Layers},
          {label:'Open Now',value:ipos.filter(i=>i.status==='Open').length,sub:'Accepting subscriptions',color:'from-emerald-500 to-teal-600 shadow-emerald-200',icon:Activity},
          {label:'Upcoming',value:ipos.filter(i=>i.status==='Upcoming').length,sub:'Coming soon',color:'from-amber-500 to-amber-600 shadow-amber-200',icon:Calendar},
          {label:'Total Subscribers',value:new Set(customerTypeRecords.filter(r=>r.typeId==='ipo-customer').map(r=>r.customerId)).size,sub:'Unique customers',color:'from-blue-500 to-indigo-600 shadow-blue-200',icon:Users},
        ].map(s=>(
          <div key={s.label} className="bg-white/80 backdrop-blur-xl rounded-[20px] p-5 border border-white/50 shadow-sm flex items-center gap-4 transition-all hover:shadow-md hover:bg-white/95 cursor-default">
            <div className={cn('w-12 h-12 rounded-[14px] bg-gradient-to-br flex items-center justify-center text-white shadow-md shrink-0',s.color)}><s.icon className="w-5 h-5"/></div>
            <div><p className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">{s.label}</p><p className="text-2xl font-black text-slate-800 leading-none">{s.value}</p><p className="text-[10px] text-slate-400 font-semibold mt-1">{s.sub}</p></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 flex-1 min-h-0">
        {/* IPO List */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-3 shrink-0">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"/><input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search IPO…" className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"/></div>
          </div>
          <div className="flex gap-1 flex-wrap mb-3 shrink-0">{STATUSES.map(s=><button key={s} onClick={()=>setStatusFilter(s)} className={cn('px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',statusFilter===s?'bg-slate-900 text-white':'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50')}>{s}</button>)}</div>
          <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-3 custom-scrollbar">
            {filteredIpos.map(ipo=>{
              const st = ipoStats[ipo.ticker]||{subscribers:new Set(),total:0};
              return <IPOCard key={ipo.id} ipo={ipo} subscriberCount={st.subscribers.size} totalSubscribed={st.total} onSelect={()=>setSelectedIpoId(ipo.id)} selected={selectedIpoId===ipo.id}/>;
            })}
          </div>
        </div>

        {/* IPO Detail */}
        <div className="lg:col-span-3 flex flex-col min-h-0">
          {selectedIpo ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-[24px] border border-white/60 shadow-lg shadow-slate-200/40 flex flex-col min-h-0 flex-1 overflow-hidden">
              <div className="px-5 py-5 border-b border-slate-200/60 bg-white shrink-0 rounded-t-[24px] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-100/50 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                       <span className="font-mono text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-[6px] font-bold tracking-widest">{selectedIpo.ticker}</span>
                       <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] text-[10px] font-bold uppercase tracking-widest border',STATUS_CONFIG[selectedIpo.status].cls)}><span className={cn('w-1.5 h-1.5 rounded-full',STATUS_CONFIG[selectedIpo.status].dot)}/>{selectedIpo.status}</span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight mb-1">{selectedIpo.name}</h2>
                    <p className="text-[12px] font-bold text-slate-500">{selectedIpo.sector} · {selectedIpo.currency}</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p className="text-3xl font-black text-blue-600 tracking-tight mb-0.5">{formatUSD(selectedIpo.offerPrice)}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">Offer Price</p>
                    <button onClick={() => handleOpenModal(selectedIpo)} className="text-[10px] bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl transition-all border border-slate-200 hover:border-slate-300 hover:shadow-sm font-bold flex items-center gap-1.5">
                      <Plus className="w-3 h-3 text-slate-400" /> Edit Details
                    </button>
                  </div>
                </div>
              </div>
              <div className="px-5 py-4 flex flex-col flex-1 min-h-0 bg-slate-100/60">
                <div className="grid grid-cols-2 gap-3 shrink-0 mb-5">
                  {[{label:'Open Date',value:selectedIpo.openDate},{label:'Close Date',value:selectedIpo.closeDate},{label:'Allotment Date',value:selectedIpo.allotmentDate},{label:'Listing Date',value:selectedIpo.listingDate},{label:'Total Shares',value:formatShares(selectedIpo.totalShares)},{label:'Oversubscription',value:selectedIpo.oversubscriptionRate?`${selectedIpo.oversubscriptionRate}x`:'—'},{label:'Min. Subscription',value:`${selectedIpo.minSubscription} shares`},{label:'Max. Subscription',value:`${formatShares(selectedIpo.maxSubscription)} shares`}].map(d=>(
                    <div key={d.label} className="bg-white/90 backdrop-blur-md border border-white rounded-xl p-3 shadow-sm shadow-slate-200/50 hover:bg-white hover:shadow-md transition-all group">
                       <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">{d.label}</p>
                       <p className="font-bold text-slate-800 text-[13px] tracking-tight">{d.value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col flex-1 min-h-0">
                  <div className="flex items-center justify-between mb-3 shrink-0 pb-2 border-b border-slate-200/60"><h3 className="font-bold text-slate-800 text-sm tracking-tight">Subscribers ({selectedSubscribers.length})</h3><span className="text-[13px] font-black text-blue-600 tracking-tight">{formatUSD(selectedStats?.total||0)} total</span></div>
                  {selectedSubscribers.length===0 ? (
                    <div className="text-center py-8 text-slate-400 shrink-0"><Users className="w-8 h-8 mx-auto mb-2 opacity-40"/><p className="text-sm">No subscribers recorded</p></div>
                  ) : (
                    <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                      {selectedSubscribers.map(ind=>(
                        <div key={ind.id} className="group flex items-center gap-3 p-2.5 rounded-[16px] bg-white border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer shadow-sm">
                          <img src={ind.avatarUrl} alt={ind.fullNameEN||ind.givenNameEN} className="w-10 h-10 rounded-[12px] object-cover shrink-0 ring-1 ring-slate-200/60 shadow-sm"/>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[13px] text-slate-800 truncate group-hover:text-blue-700 transition-colors leading-tight mb-0.5">{ind.fullNameEN||ind.givenNameEN}</p>
                            <p className="text-[11px] font-mono font-medium text-slate-400">{ind.investorIdInfo?.investorIdNumber||ind.id}</p>
                          </div>
                          <span className={cn('px-2.5 py-1 rounded-[8px] text-[10px] font-bold uppercase tracking-widest',ind.accountStatus==='Active'?'bg-emerald-100/80 text-emerald-700':'bg-slate-100/80 text-slate-500')}>{ind.accountStatus}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm flex items-center justify-center h-64">
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
              <h2 className="text-lg font-bold text-slate-900">{editingIpo ? 'Edit IPO Details' : 'Create New IPO'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">IPO Name *</label>
                  <input type="text" value={formData.name || ''} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="e.g. Acme Corp" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Ticker Symbol *</label>
                  <input type="text" value={formData.ticker || ''} onChange={e=>setFormData({...formData, ticker: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="e.g. ACM" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Sector</label>
                  <input type="text" value={formData.sector || ''} onChange={e=>setFormData({...formData, sector: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="e.g. Technology" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                  <select value={formData.status || 'Upcoming'} onChange={e=>setFormData({...formData, status: e.target.value as any})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white">
                    {['Upcoming', 'Open', 'Closed', 'Allotted', 'Listed'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Offer Price</label>
                  <input type="number" step="0.01" value={formData.offerPrice || 0} onChange={e=>setFormData({...formData, offerPrice: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Total Shares</label>
                  <input type="number" value={formData.totalShares || 0} onChange={e=>setFormData({...formData, totalShares: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Open Date</label>
                  <input type="date" value={formData.openDate || ''} onChange={e=>setFormData({...formData, openDate: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Close Date</label>
                  <input type="date" value={formData.closeDate || ''} onChange={e=>setFormData({...formData, closeDate: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                </div>
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