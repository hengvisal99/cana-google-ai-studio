'use client';
import React, { useState, useMemo } from 'react';
import { CheckSquare, Plus, Clock, AlertTriangle, CheckCircle2, Circle, Filter, Search, User, Calendar, Tag, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task, TaskPriority, TaskStatus, TaskCategory } from '@/types';
import { differenceInDays, parseISO, isValid } from 'date-fns';

interface TasksScreenProps {
  tasks: Task[];
  onSaveTask: (task: Task) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
}

const PRIORITY_CONFIG: Record<TaskPriority,{cls:string;dot:string;label:string}> = {
  High:   {cls:'bg-rose-100 text-rose-700 border-rose-200',  dot:'bg-rose-500',  label:'High'},
  Medium: {cls:'bg-amber-100 text-amber-700 border-amber-200',dot:'bg-amber-500',label:'Medium'},
  Low:    {cls:'bg-slate-100 text-slate-600 border-slate-200',dot:'bg-slate-400',label:'Low'},
};
const STATUS_CONFIG: Record<TaskStatus,{cls:string;icon:React.ElementType}> = {
  'Open':        {cls:'bg-slate-100 text-slate-600', icon:Circle},
  'In Progress': {cls:'bg-blue-100 text-blue-700',   icon:Clock},
  'Done':        {cls:'bg-emerald-100 text-emerald-700', icon:CheckCircle2},
  'Overdue':     {cls:'bg-rose-100 text-rose-700',   icon:AlertTriangle},
};
const CATEGORY_COLORS: Record<TaskCategory,string> = {
  'KYC Review':        'bg-purple-100 text-purple-700',
  'IPO':               'bg-blue-100 text-blue-700',
  'Customer Follow-up':'bg-teal-100 text-teal-700',
  'Compliance':        'bg-rose-100 text-rose-700',
  'Approval':          'bg-amber-100 text-amber-700',
  'Other':             'bg-slate-100 text-slate-600',
};

function computeStatus(task: Task): TaskStatus {
  if(task.status==='Done') return 'Done';
  const due = parseISO(task.dueDate);
  if(isValid(due)&&differenceInDays(due,new Date())<0) return 'Overdue';
  return task.status;
}

function daysLabel(dueDate: string, status: TaskStatus): { text: string; cls: string } {
  if(status==='Done') return {text:'Completed', cls:'text-emerald-600'};
  const due = parseISO(dueDate);
  if(!isValid(due)) return {text:'—', cls:'text-slate-400'};
  const d = differenceInDays(due,new Date());
  if(d<0)  return {text:`${Math.abs(d)}d overdue`,cls:'text-rose-600 font-bold'};
  if(d===0)return {text:'Due today',cls:'text-amber-600 font-bold'};
  if(d<=3) return {text:`${d}d left`,cls:'text-amber-500 font-semibold'};
  return {text:`${d}d left`,cls:'text-slate-500'};
}

interface AddTaskModalProps { onSave:(t:Task)=>void; onClose:()=>void; }
function AddTaskModal({onSave,onClose}: AddTaskModalProps) {
  const [form,setForm] = useState({title:'',description:'',assignedTo:'',assignedRole:'CSO' as 'CSO'|'SR'|'Manager',priority:'Medium' as TaskPriority,category:'Other' as TaskCategory,dueDate:'',relatedCustomerName:'',relatedCustomerId:''});
  const save = ()=>{
    if(!form.title.trim()||!form.dueDate) return;
    onSave({...form,id:`TASK-${Date.now()}`,status:'Open',createdAt:new Date().toISOString()});
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-slate-900">New Task</h2><button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition"><X className="w-4 h-4 text-slate-500"/></button></div>
        {[{label:'Title *',key:'title',type:'text'},{label:'Due Date *',key:'dueDate',type:'date'},{label:'Assigned To',key:'assignedTo',type:'text'},{label:'Related Customer Name',key:'relatedCustomerName',type:'text'}].map(f=>(
          <div key={f.key}><label className="text-xs font-semibold text-slate-500 block mb-1">{f.label}</label><input type={f.type} value={(form as Record<string,string>)[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/30 bg-slate-50"/></div>
        ))}
        <div><label className="text-xs font-semibold text-slate-500 block mb-1">Description</label><textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={2} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/30 bg-slate-50 resize-none"/></div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="text-xs font-semibold text-slate-500 block mb-1">Role</label><select value={form.assignedRole} onChange={e=>setForm(p=>({...p,assignedRole:e.target.value as 'CSO'|'SR'|'Manager'}))} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400/30"><option>CSO</option><option>SR</option><option>Manager</option></select></div>
          <div><label className="text-xs font-semibold text-slate-500 block mb-1">Priority</label><select value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value as TaskPriority}))} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400/30"><option>High</option><option>Medium</option><option>Low</option></select></div>
          <div><label className="text-xs font-semibold text-slate-500 block mb-1">Category</label><select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value as TaskCategory}))} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400/30"><option>KYC Review</option><option>IPO</option><option>Customer Follow-up</option><option>Compliance</option><option>Approval</option><option>Other</option></select></div>
        </div>
        <div className="flex justify-end gap-2 pt-2"><button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">Cancel</button><button onClick={save} className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition shadow-sm">Create Task</button></div>
      </div>
    </div>
  );
}

export function TasksScreen({tasks,onSaveTask,onUpdateTask}: TasksScreenProps) {
  const [searchQ,setSearchQ] = useState('');
  const [statusFilter,setStatusFilter] = useState<'All'|TaskStatus>('All');
  const [priorityFilter,setPriorityFilter] = useState<'All'|TaskPriority>('All');
  const [roleFilter,setRoleFilter] = useState<'All'|'CSO'|'SR'|'Manager'>('All');
  const [showAdd,setShowAdd] = useState(false);
  const [expandedId,setExpandedId] = useState<string|null>(null);

  const enriched = useMemo(()=>tasks.map(t=>({...t,computedStatus:computeStatus(t)})),[tasks]);
  const q = searchQ.toLowerCase().trim();
  const filtered = enriched.filter(t=>
    (statusFilter==='All'||t.computedStatus===statusFilter)&&
    (priorityFilter==='All'||t.priority===priorityFilter)&&
    (roleFilter==='All'||t.assignedRole===roleFilter)&&
    (!q||t.title.toLowerCase().includes(q)||t.description.toLowerCase().includes(q)||(t.relatedCustomerName||'').toLowerCase().includes(q))
  );

  const openCount     = enriched.filter(t=>t.computedStatus==='Open').length;
  const inProgCount   = enriched.filter(t=>t.computedStatus==='In Progress').length;
  const overdueCount  = enriched.filter(t=>t.computedStatus==='Overdue').length;
  const doneCount     = enriched.filter(t=>t.computedStatus==='Done').length;

  return (
    <div className="space-y-6 py-2 pb-8">
      {showAdd&&<AddTaskModal onSave={onSaveTask} onClose={()=>setShowAdd(false)}/>}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-md shadow-teal-200"><CheckSquare className="w-5 h-5 text-white"/></div>
            <h1 className="text-2xl font-bold text-slate-900">Tasks & Reminders</h1>
          </div>
          <p className="text-sm text-slate-500 ml-12">Assign and track follow-up actions for CSO · SR · Manager</p>
        </div>
        <button onClick={()=>setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors shadow-sm shrink-0"><Plus className="w-4 h-4"/>New Task</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{label:'Open',value:openCount,icon:Circle,tone:'slate'},{label:'In Progress',value:inProgCount,icon:Clock,tone:'blue'},{label:'Overdue',value:overdueCount,icon:AlertTriangle,tone:'rose'},{label:'Done',value:doneCount,icon:CheckCircle2,tone:'emerald'}].map(s=>(
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm flex items-center gap-4">
            <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-md shrink-0',s.tone==='slate'?'from-slate-500 to-slate-600 shadow-slate-200':s.tone==='blue'?'from-blue-500 to-indigo-600 shadow-blue-200':s.tone==='rose'?'from-rose-500 to-rose-600 shadow-rose-200':'from-emerald-500 to-teal-600 shadow-emerald-200')}><s.icon className="w-5 h-5"/></div>
            <div><p className="text-xs text-slate-500 font-medium">{s.label}</p><p className="text-2xl font-bold text-slate-900">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"/><input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search tasks…" className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"/></div>
            {(['All','Open','In Progress','Overdue','Done'] as const).map(s=><button key={s} onClick={()=>setStatusFilter(s)} className={cn('px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',statusFilter===s?'bg-slate-900 text-white':'bg-slate-100 text-slate-600 hover:bg-slate-200')}>{s}</button>)}
            <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value as 'All'|'CSO'|'SR'|'Manager')} className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-600 border-0 focus:outline-none focus:ring-2 focus:ring-blue-400/30"><option value="All">All Roles</option><option>CSO</option><option>SR</option><option>Manager</option></select>
            <select value={priorityFilter} onChange={e=>setPriorityFilter(e.target.value as 'All'|TaskPriority)} className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-600 border-0 focus:outline-none focus:ring-2 focus:ring-blue-400/30"><option value="All">All Priority</option><option>High</option><option>Medium</option><option>Low</option></select>
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {filtered.length===0&&<div className="text-center py-16"><CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2"/><p className="text-slate-600 font-semibold">No tasks found</p></div>}
          {filtered.map(task=>{
            const sc = STATUS_CONFIG[task.computedStatus]||STATUS_CONFIG.Open;
            const pc = PRIORITY_CONFIG[task.priority];
            const dl = daysLabel(task.dueDate,task.computedStatus);
            const isExpanded = expandedId===task.id;
            const StatusIcon = sc.icon;
            return (
              <div key={task.id} className="hover:bg-slate-50/60 transition-colors">
                <div className="px-6 py-4 flex items-center gap-4 cursor-pointer" onClick={()=>setExpandedId(isExpanded?null:task.id)}>
                  <button onClick={e=>{e.stopPropagation();if(task.computedStatus!=='Done')onUpdateTask(task.id,{status:'Done',completedAt:new Date().toISOString()});}} className="shrink-0 hover:scale-110 transition-transform"><StatusIcon className={cn('w-5 h-5',task.computedStatus==='Done'?'text-emerald-500':task.computedStatus==='Overdue'?'text-rose-400':task.computedStatus==='In Progress'?'text-blue-400':'text-slate-300')}/></button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={cn('font-semibold text-sm',task.computedStatus==='Done'?'line-through text-slate-400':'text-slate-800')}>{task.title}</p>
                      <span className={cn('px-2 py-0.5 rounded-lg text-xs font-semibold',CATEGORY_COLORS[task.category]||'bg-slate-100 text-slate-600')}>{task.category}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-slate-400 flex items-center gap-1"><User className="w-3 h-3"/>{task.assignedTo||'Unassigned'} ({task.assignedRole})</span>
                      {task.relatedCustomerName&&<span className="text-xs text-blue-500 font-semibold">{task.relatedCustomerName}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-3">
                    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border',pc.cls)}><span className={cn('w-1.5 h-1.5 rounded-full',pc.dot)}/>{pc.label}</span>
                    <span className={cn('text-xs',dl.cls)}>{dl.text}</span>
                    <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform',isExpanded&&'rotate-180')}/>
                  </div>
                </div>
                {isExpanded&&(
                  <div className="px-6 pb-4 ml-9 border-l-2 border-slate-100 ml-[3.75rem] space-y-3">
                    {task.description&&<p className="text-sm text-slate-600 bg-slate-50 rounded-xl px-4 py-3">{task.description}</p>}
                    <div className="flex items-center gap-4 flex-wrap text-xs text-slate-500">
                      <span><strong>Due:</strong> {task.dueDate}</span>
                      <span><strong>Created:</strong> {task.createdAt?.slice(0,10)||'—'}</span>
                      {task.completedAt&&<span><strong>Completed:</strong> {task.completedAt.slice(0,10)}</span>}
                    </div>
                    <div className="flex gap-2">
                      {task.computedStatus!=='Done'&&<button onClick={()=>onUpdateTask(task.id,{status:'In Progress'})} className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors">Mark In Progress</button>}
                      {task.computedStatus!=='Done'&&<button onClick={()=>onUpdateTask(task.id,{status:'Done',completedAt:new Date().toISOString()})} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors">Mark Done</button>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}