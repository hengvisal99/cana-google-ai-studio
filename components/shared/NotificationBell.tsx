'use client';
import React, { useRef, useEffect } from 'react';
import { Bell, ShieldCheck, FileText, IdCard, CheckCircle2, Info, AlertTriangle, XCircle, X, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AppNotification, NavigationPage } from '@/types';

interface NotificationBellProps {
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigate: (page: NavigationPage) => void;
}

const TYPE_CONFIG = {
  error:   {icon:XCircle,    cls:'text-rose-500',   bg:'bg-rose-50 border-rose-200'},
  warning: {icon:AlertTriangle,cls:'text-amber-500',bg:'bg-amber-50 border-amber-200'},
  info:    {icon:Info,        cls:'text-blue-500',   bg:'bg-blue-50 border-blue-200'},
  success: {icon:CheckCircle2,cls:'text-emerald-500',bg:'bg-emerald-50 border-emerald-200'},
};

const CAT_ICONS: Record<string, React.ElementType> = {
  'Document Expiry':   FileText,
  'Investor ID Expiry':IdCard,
  'KYC':               ShieldCheck,
  'Approval':          CheckCircle2,
  'IPO':               ExternalLink,
  'Task':              CheckCircle2,
  'System':            Info,
};

export function NotificationBell({notifications,onMarkRead,onMarkAllRead,onNavigate}: NotificationBellProps) {
  const [open,setOpen] = React.useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = notifications.filter(n=>!n.isRead).length;

  useEffect(()=>{
    if(!open) return;
    const handler = (e: MouseEvent)=>{ if(ref.current&&!ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown',handler);
    return ()=>document.removeEventListener('mousedown',handler);
  },[open]);

  return (
    <div ref={ref} className="relative">
      <button
        id="notification-bell-btn"
        onClick={()=>setOpen(p=>!p)}
        className={cn('relative p-2 rounded-full transition',open?'bg-blue-500 text-white shadow-md shadow-blue-500/30':'bg-white/70 border border-white/80 text-slate-600 shadow-xs hover:bg-white hover:text-slate-900')}
        title="Notifications"
      >
        <Bell className="w-4 h-4"/>
        {unread>0&&<span className="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white px-0.5">{unread>9?'9+':unread}</span>}
      </button>

      {open&&(
        <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-400/20 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
              {unread>0&&<p className="text-xs text-slate-400">{unread} unread</p>}
            </div>
            <div className="flex items-center gap-2">
              {unread>0&&<button onClick={onMarkAllRead} className="text-xs text-blue-600 hover:text-blue-700 font-semibold">Mark all read</button>}
              <button onClick={()=>setOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 transition"><X className="w-3.5 h-3.5 text-slate-400"/></button>
            </div>
          </div>
          <div className="max-h-[440px] overflow-y-auto divide-y divide-slate-50">
            {notifications.length===0&&(
              <div className="text-center py-10"><Bell className="w-8 h-8 text-slate-200 mx-auto mb-2"/><p className="text-sm text-slate-400">No notifications</p></div>
            )}
            {notifications.map(n=>{
              const tc = TYPE_CONFIG[n.type]||TYPE_CONFIG.info;
              const TypeIcon = tc.icon;
              const CatIcon  = CAT_ICONS[n.category]||Info;
              return (
                <div key={n.id} onClick={()=>{onMarkRead(n.id);if(n.actionPage)onNavigate(n.actionPage);setOpen(false);}} className={cn('flex gap-3 px-4 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors',!n.isRead&&'bg-blue-50/30')}>
                  <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border',tc.bg)}><TypeIcon className={cn('w-4 h-4',tc.cls)}/></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn('text-sm font-semibold leading-tight',!n.isRead?'text-slate-900':'text-slate-700')}>{n.title}</p>
                      {!n.isRead&&<span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1"/>}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{n.category}</span>
                      {n.actionLabel&&<span className="text-xs text-blue-600 font-semibold">{n.actionLabel} →</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-slate-100 px-4 py-2.5">
            <button onClick={()=>{onNavigate('notifications');setOpen(false);}} className="text-xs text-blue-600 hover:text-blue-700 font-semibold w-full text-center">View all notifications →</button>
          </div>
        </div>
      )}
    </div>
  );
}