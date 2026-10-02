'use client';

import React, { useState } from 'react';
import { Lead, LeadStage } from '@/types';
import { INITIAL_LEADS } from '@/lib/pipeline-data';
import { 
  Users, Search, Plus, Filter, MoreHorizontal, 
  Phone, Mail, Calendar, DollarSign, Clock, 
  TrendingUp, MessageSquare, ChevronRight, GripVertical, X,
  List, LayoutGrid, Activity, Video
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormInput, FormPhone, FormSelect, FormTextarea } from '@/components/ui/form';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

export type PipelineStageType = { id: LeadStage; label: string; color: string; border: string; bg: string; linkedScreen?: NavigationPage | '' };

const INITIAL_STAGES: PipelineStageType[] = [
  { id: 'New Prospect', label: 'New Prospect', color: 'text-slate-700', border: 'border-slate-200', bg: 'bg-slate-50' },
  { id: 'Contacted', label: 'Contacted', color: 'text-blue-700', border: 'border-blue-200', bg: 'bg-blue-50' },
  { id: 'Meeting Scheduled', label: 'Meeting Scheduled', color: 'text-indigo-700', border: 'border-indigo-200', bg: 'bg-indigo-50' },
  { id: 'Docs Collected', label: 'KYC & Docs', color: 'text-amber-700', border: 'border-amber-200', bg: 'bg-amber-50', linkedScreen: 'compliance' },
  { id: 'Onboarding', label: 'Onboarding', color: 'text-teal-700', border: 'border-teal-200', bg: 'bg-teal-50', linkedScreen: 'individual-insert' },
  { id: 'Account Opened', label: 'Account Opened', color: 'text-emerald-700', border: 'border-emerald-200', bg: 'bg-emerald-50' },
];

const formatUSD = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

import { NavigationPage } from '@/types';

const LINKED_SCREEN_OPTIONS = [
  { value: 'individual-insert', label: 'Onboarding / Open Account (individual-insert)' },
  { value: 'customer-360', label: 'Customer 360' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'compliance', label: 'Compliance Review' },
];

/** Linked-screen picker for the stage dialog; `name` keeps it in the dialog's FormData. */
function LinkedScreenSelect({ defaultValue }: { defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <FormSelect
      name="linkedScreen"
      value={value}
      onChange={setValue}
      options={LINKED_SCREEN_OPTIONS}
      placeholder="None"
      searchable={false}
      clearable
    />
  );
}

export function PipelineScreen({ onNavigate, onConvertLead }: { onNavigate?: (page: NavigationPage) => void, onConvertLead?: (lead: Lead) => void }) {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);

  const [stages, setStages] = useState(INITIAL_STAGES);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  // FormPhone / FormSelect are controlled; their hidden inputs still feed the FormData submit.
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadSource, setNewLeadSource] = useState('Walk-in');
  const [newLeadPhoneError, setNewLeadPhoneError] = useState('');
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<PipelineStageType | null>(null);
  
  // Drag state for Leads
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activeAction, setActiveAction] = useState<'call' | 'meeting' | 'email' | null>(null);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<LeadStage | null>(null);

  // Drag state for Stages
  const [draggedStageId, setDraggedStageId] = useState<string | null>(null);
  const [dragOverStageCol, setDragOverStageCol] = useState<string | null>(null);

  // Custom Confirm Dialog State
  const [navigatePrompt, setNavigatePrompt] = useState<{
    targetScreen: NavigationPage | 'individual-insert',
    leadId: string,
    message: string
  } | null>(null);

  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    
    // Update the lastContacted time and append a note
    const formData = new FormData(e.target as HTMLFormElement);
    const note = formData.get('actionNote') as string;
    
    setLeads(prev => prev.map(l => {
      if (l.id === selectedLead.id) {
          const activityType = (activeAction || 'note') as 'call' | 'meeting' | 'email' | 'note';
          const newActivity = {
            id: `act-${Date.now()}`,
            type: activityType,
            content: note,
            timestamp: new Date().toISOString()
          };
          return {
            ...l,
            lastContacted: new Date().toISOString(),
            notes: `${l.notes}\n\n[${format(new Date(), 'MMM d, yyyy')}] - ${activeAction?.toUpperCase()}: ${note}`,
            activities: [newActivity, ...(l.activities || [])]
          };
      }
      return l;
    }));
    
    setActiveAction(null);
    setSelectedLead(null); // Close modal on success to feel snappy
  };

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.stopPropagation(); // Don't drag the stage
    setDraggedLeadId(leadId);
    e.dataTransfer.effectAllowed = 'move';
    // The dataTransfer needs to be set for Firefox compatibility
    e.dataTransfer.setData('text/plain', leadId);
  };

  const handleDragOver = (e: React.DragEvent, stage: LeadStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stage) {
      setDragOverStage(stage);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, stageId: LeadStage) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverStage(null);
    if (!draggedLeadId) return;

    setLeads(prev => prev.map(l => 
      l.id === draggedLeadId ? { ...l, stage: stageId } : l
    ));
    setDraggedLeadId(null);
    
    // Check for linked screen
    const targetStage = stages.find(s => s.id === stageId);
    if (targetStage?.linkedScreen && onNavigate) {
      setNavigatePrompt({
        targetScreen: targetStage.linkedScreen,
        leadId: draggedLeadId,
        message: `This stage is linked to ${targetStage.linkedScreen === 'individual-insert' ? 'Client Onboarding' : 'KYC / Compliance'}. Would you like to navigate there now to complete this stage?`
      });
    }
  };

  const handleStageDragStart = (e: React.DragEvent, stageId: string) => {
    setDraggedStageId(stageId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('stage', stageId);
  };

  const handleStageDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (!draggedStageId || draggedStageId === stageId) return;
    setDragOverStageCol(stageId);
  };

  const handleStageDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStageCol(null);
    if (!draggedStageId || draggedStageId === stageId) return;

    const oldIndex = stages.findIndex(s => s.id === draggedStageId);
    const newIndex = stages.findIndex(s => s.id === stageId);
    if (oldIndex < 0 || newIndex < 0) return;

    const newStages = [...stages];
    const [moved] = newStages.splice(oldIndex, 1);
    newStages.splice(newIndex, 0, moved);
    setStages(newStages);
    setDraggedStageId(null);
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    l.phone.includes(search) ||
    l.assignedSR.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col space-y-4 py-2 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-200">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Leads Pipeline</h1>
          </div>
          <p className="text-sm text-slate-500 ml-12">Track prospects from initial contact to active account.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('kanban')}
              className={cn("p-2 rounded-lg transition-colors", viewMode === 'kanban' ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700")}
              title="Kanban View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn("p-2 rounded-lg transition-colors", viewMode === 'list' ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700")}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <div className="relative hidden sm:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full sm:w-64 h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
          <button 
            onClick={() => { setNewLeadPhone(''); setNewLeadSource('Walk-in'); setNewLeadPhoneError(''); setIsNewLeadModalOpen(true); }}
            className="flex items-center gap-2 px-4 h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm shadow-indigo-200 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" /> New Lead
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Prospects', value: leads.length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Pipeline Value', value: formatUSD(leads.reduce((s,l) => s + l.estimatedValue, 0)), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Meetings Pending', value: leads.filter(l => l.stage === 'Meeting Scheduled').length, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Recently Added', value: leads.filter(l => (new Date().getTime() - parseISO(l.createdAt).getTime()) < 7*86400000).length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' }
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm flex items-center gap-4">
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', k.bg)}>
              <k.icon className={cn('w-6 h-6', k.color)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{k.value}</p>
              <p className="text-xs font-medium text-slate-500">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content Area (Kanban or List) */}
      {viewMode === 'kanban' ? (
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4 snap-x min-h-[500px]">
          {stages.map(stage => {
            const stageLeads = filteredLeads.filter(l => l.stage === stage.id);
            const stageValue = stageLeads.reduce((s,l) => s + l.estimatedValue, 0);
            
            return (
              <div 
                key={stage.id} 
                className={cn(
                  "flex-none w-80 flex flex-col snap-start transition-all",
                  draggedStageId === stage.id ? 'opacity-50 scale-95' : '',
                  dragOverStageCol === stage.id ? 'border-l-4 border-indigo-500 pl-2' : ''
                )}
                draggable
                onDragStart={(e) => handleStageDragStart(e, stage.id)}
                onDragOver={(e) => handleStageDragOver(e, stage.id)}
                onDragEnd={() => { setDraggedStageId(null); setDragOverStageCol(null); }}
                onDrop={(e) => handleStageDrop(e, stage.id)}
              >
                {/* Column Header */}
                <div className={cn('px-4 py-3 rounded-t-2xl border-t border-x flex items-center justify-between group', stage.bg, stage.border)}>
                  <div className="flex items-center gap-2">
                    <button className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-indigo-600">
                      <GripVertical className="w-4 h-4" />
                    </button>
                    <span className={cn('font-bold text-sm', stage.color)}>{stage.label}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/60 text-xs font-semibold text-slate-600 shadow-sm">{stageLeads.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setEditingStage(stage);
                        setIsStageModalOpen(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-indigo-600"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-slate-500">{formatUSD(stageValue)}</span>
                  </div>
                </div>
                
                {/* Column Body */}
                <div 
                  className={cn('flex-1 p-3 rounded-b-2xl border-b border-x space-y-3 bg-white transition-colors', 
                    stage.border,
                    dragOverStage === stage.id ? 'bg-indigo-50/80 border-indigo-300 shadow-[inset_0_0_20px_rgba(99,102,241,0.1)]' : ''
                  )}
                  onDragOver={(e) => handleDragOver(e, stage.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  {stageLeads.map(lead => (
                    <div 
                      key={lead.id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onDragEnd={() => setDraggedLeadId(null)}
                      onClick={() => setSelectedLead(lead)}
                      className={cn(
                        "bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-grab active:cursor-grabbing group relative",
                        draggedLeadId === lead.id ? "opacity-50 scale-95 border-indigo-400" : ""
                      )}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{lead.name}</h3>
                          <p className="text-xs text-slate-500 font-medium">{lead.source}</p>
                        </div>
                        <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal className="w-4 h-4" /></button>
                      </div>
                      
                      <div className="space-y-2 text-xs text-slate-600 mb-4">
                        <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" /> {lead.phone}</div>
                        {lead.email && <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" /> {lead.email}</div>}
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 mb-4">
                        <p className="text-xs text-slate-600 line-clamp-2">{lead.notes}</p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Value</span>
                          <span className="text-sm font-bold text-slate-700">{formatUSD(lead.estimatedValue)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
                          <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700 border border-indigo-200">
                            {lead.assignedSR.split(' ').map(n=>n[0]).join('')}
                          </div>
                          <span className="text-xs font-medium text-slate-600">{lead.assignedSR.split(' ')[0]}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl">
                      <p className="text-sm text-slate-400 font-medium">Drop leads here</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Add Stage Column */}
          <div className="flex-none w-80 flex flex-col snap-start opacity-70 hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => {
                setEditingStage(null);
                setIsStageModalOpen(true);
              }}
              className="h-full min-h-[150px] w-full rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all gap-2"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <span className="font-bold">Add New Stage</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          {/* List View Stage Management Strip */}
          <div className="bg-slate-50/80 border-b border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-sm font-semibold text-slate-600 mr-2">Manage Stages:</span>
              {stages.map(stage => (
                <button
                  key={stage.id}
                  onClick={() => {
                    setEditingStage(stage);
                    setIsStageModalOpen(true);
                  }}
                  className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border hover:shadow-sm", stage.bg, stage.color, stage.border)}
                  title={`Edit ${stage.label}`}
                >
                  {stage.label}
                  <MoreHorizontal className="w-3.5 h-3.5 opacity-50" />
                </button>
              ))}
              <button
                onClick={() => {
                  setEditingStage(null);
                  setIsStageModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-dashed border-slate-300 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Stage
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[800px]">
              <thead className="bg-slate-50/80 sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4 font-semibold text-slate-500">Lead Name</th>
                  <th className="px-5 py-4 font-semibold text-slate-500">Contact</th>
                  <th className="px-5 py-4 font-semibold text-slate-500">Stage</th>
                  <th className="px-5 py-4 font-semibold text-slate-500">Source</th>
                  <th className="px-5 py-4 font-semibold text-slate-500">Value</th>
                  <th className="px-5 py-4 font-semibold text-slate-500">Assigned SR</th>
                  <th className="px-5 py-4 font-semibold text-slate-500">Last Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map(lead => (
                  <tr 
                    key={lead.id} 
                    onClick={() => setSelectedLead(lead)}
                    className="hover:bg-indigo-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{lead.name}</p>
                      <p className="text-xs text-slate-400">{lead.id}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-slate-600">{lead.phone}</p>
                      <p className="text-xs text-slate-400">{lead.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      {/* Stops row click; portal events bubble through the React tree too. */}
                      <span onClick={(e) => e.stopPropagation()}>
                        <FormSelect
                          variant="bare"
                          searchable={false}
                          panelMinWidth={200}
                          value={lead.stage}
                          options={stages.map(s => ({ value: s.id, label: s.label }))}
                          onChange={(v) => {
                            const newStage = v as LeadStage;
                            setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, stage: newStage } : l));
                          }}
                          className={cn("pl-2.5 py-1 rounded-full text-xs font-semibold border",
                            stages.find(s => s.id === lead.stage)?.bg,
                            stages.find(s => s.id === lead.stage)?.color,
                            stages.find(s => s.id === lead.stage)?.border
                          )}
                        />
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-medium">{lead.source}</td>
                    <td className="px-5 py-4 font-bold text-slate-700">{formatUSD(lead.estimatedValue)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                          {lead.assignedSR.split(' ').map(n=>n[0]).join('')}
                        </div>
                        <span className="text-slate-600 font-medium">{lead.assignedSR}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs">
                      {formatDistanceToNow(parseISO(lead.lastContacted), { addSuffix: true })}
                    </td>
                  </tr>
                ))}
                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                      No leads found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Lead Modal */}
      {isNewLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">Add New Lead</h2>
              <button 
                onClick={() => setIsNewLeadModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form className="p-6 space-y-4" onSubmit={(e) => {
              e.preventDefault();
              if (newLeadPhone.replace(/\D/g, '').length < 8) {
                setNewLeadPhoneError('Enter a valid phone number');
                return;
              }
              const formData = new FormData(e.currentTarget);
              const newLead: Lead = {
                id: `LD-${Math.floor(Math.random() * 10000)}`,
                name: formData.get('name') as string,
                phone: formData.get('phone') as string,
                email: formData.get('email') as string,
                source: formData.get('source') as any,
                stage: stages[0]?.id || 'Contacted',
                assignedSR: 'Current User', // Mock
                createdAt: new Date().toISOString(),
                lastContacted: new Date().toISOString(),
                estimatedValue: Number(formData.get('estimatedValue')) || 0,
                notes: formData.get('notes') as string,
              };
              setLeads([newLead, ...leads]);
              setIsNewLeadModalOpen(false);
            }}>
              <div className="grid grid-cols-2 gap-4">
                <FormInput containerClassName="col-span-2 sm:col-span-1" label="Full Name" required name="name" placeholder="e.g. Sokha Meng" />
                <FormPhone
                  containerClassName="col-span-2 sm:col-span-1"
                  label="Phone Number"
                  required
                  name="phone"
                  value={newLeadPhone}
                  onChange={(v) => { setNewLeadPhone(v); setNewLeadPhoneError(''); }}
                  error={newLeadPhoneError || undefined}
                />
                <FormInput containerClassName="col-span-2 sm:col-span-1" label="Email Address" name="email" type="email" placeholder="name@example.com" />
                <FormSelect
                  containerClassName="col-span-2 sm:col-span-1"
                  label="Lead Source"
                  name="source"
                  value={newLeadSource}
                  onChange={setNewLeadSource}
                  options={['Walk-in', 'Referral', 'Online', 'Event']}
                />
                <FormInput containerClassName="col-span-2" label="Estimated Value (USD)" name="estimatedValue" type="number" placeholder="0" />
                <FormTextarea containerClassName="col-span-2" label="Initial Notes" name="notes" rows={3} placeholder="Add any relevant context..." />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsNewLeadModalOpen(false)}
                  className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all"
                >
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lead Details Modal (Convert to Customer) */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">Lead Profile</h2>
              <button 
                onClick={() => {
                  setSelectedLead(null);
                  setActiveAction(null);
                }}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 truncate">{selectedLead.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-600 shrink-0">
                      Source: {selectedLead.source}
                    </span>
                    {selectedLead.score !== undefined && (
                      <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shrink-0", 
                        selectedLead.score >= 80 ? "bg-rose-100 text-rose-700" :
                        selectedLead.score >= 50 ? "bg-amber-100 text-amber-700" :
                        "bg-slate-100 text-slate-700"
                      )}>
                        Hot Score: {selectedLead.score}
                      </span>
                    )}
                    <FormSelect
                      variant="bare"
                      searchable={false}
                      panelMinWidth={200}
                      containerClassName="shrink-0"
                      value={selectedLead.stage}
                      options={stages.map(s => ({ value: s.id, label: s.label }))}
                      onChange={(v) => {
                        const newStage = v as LeadStage;
                        setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, stage: newStage } : l));
                        setSelectedLead({ ...selectedLead, stage: newStage });
                      }}
                      className={cn("pl-2.5 py-1 rounded-full text-xs font-semibold border",
                        stages.find(s => s.id === selectedLead.stage)?.bg,
                        stages.find(s => s.id === selectedLead.stage)?.color,
                        stages.find(s => s.id === selectedLead.stage)?.border
                      )}
                    />
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg shrink-0">
                  {selectedLead.name.split(' ').map(n=>n[0]).join('')}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Actions Ribbon */}
                <div className="col-span-2 flex items-center gap-2 pb-4 border-b border-slate-100">
                  <button 
                    onClick={() => setActiveAction(activeAction === 'call' ? null : 'call')}
                    className={cn("flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-semibold text-sm transition-colors",
                      activeAction === 'call' ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    )}
                  >
                    <Phone className="w-4 h-4" /> Log Call
                  </button>
                  <button 
                    onClick={() => setActiveAction(activeAction === 'meeting' ? null : 'meeting')}
                    className={cn("flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-semibold text-sm transition-colors",
                      activeAction === 'meeting' ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                    )}
                  >
                    <Video className="w-4 h-4" /> Meeting
                  </button>
                  <button 
                    onClick={() => setActiveAction(activeAction === 'email' ? null : 'email')}
                    className={cn("flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-semibold text-sm transition-colors",
                      activeAction === 'email' ? "bg-slate-800 text-white shadow-md shadow-slate-200" : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                    )}
                  >
                    <Mail className="w-4 h-4" /> Email
                  </button>
                </div>

                {/* Inline Action Form */}
                {activeAction && (
                  <div className="col-span-2 bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 animate-in slide-in-from-top-2 duration-200">
                    <form onSubmit={handleActionSubmit}>
                      <p className="text-xs font-bold text-indigo-800 mb-2 uppercase tracking-wider">
                        {activeAction === 'call' ? 'Log a Phone Call' : activeAction === 'meeting' ? 'Schedule a Meeting' : 'Draft an Email'}
                      </p>
                      {activeAction === 'meeting' && (
                        <input type="datetime-local" className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white mb-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" required />
                      )}
                      {activeAction === 'email' && (
                        <input type="text" placeholder="Subject..." className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white mb-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" required />
                      )}
                      <textarea 
                        name="actionNote"
                        required
                        placeholder={activeAction === 'email' ? 'Type your message...' : 'Notes from this interaction...'}
                        className="w-full p-3 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none mb-3"
                        rows={3}
                      />
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setActiveAction(null)} className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm">Save Activity</button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Contact Details</p>
                  <p className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedLead.phone}</p>
                  {selectedLead.email && <p className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedLead.email}</p>}
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Est. Investment</p>
                  <p className="text-lg font-bold text-emerald-600">{formatUSD(selectedLead.estimatedValue)}</p>
                </div>
                <div className="col-span-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100 mt-2">
                  <p className="text-[10px] font-bold uppercase text-slate-400 mb-3">Activity Timeline</p>
                  
                  {selectedLead.activities && selectedLead.activities.length > 0 ? (
                    <div className="space-y-4">
                      {selectedLead.activities.map((act) => (
                        <div key={act.id} className="relative pl-6 pb-2">
                          <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-indigo-400 z-10" />
                          <div className="absolute left-[3px] top-3 bottom-[-24px] w-[2px] bg-indigo-100" />
                          
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-bold text-slate-700 uppercase">{act.type}</span>
                            <span className="text-[10px] text-slate-400">{formatDistanceToNow(parseISO(act.timestamp), { addSuffix: true })}</span>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
                            {act.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No activities logged yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-5 border-t border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setSelectedLead(null);
                    setActiveAction(null);
                  }}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to drop this lead? This action cannot be undone.')) {
                      setLeads(prev => prev.filter(l => l.id !== selectedLead.id));
                      setSelectedLead(null);
                      setActiveAction(null);
                    }
                  }}
                  className="px-5 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  Drop Lead
                </button>
              </div>
              <button 
                onClick={() => {
                  if (selectedLead.stage === 'Docs Collected' && onNavigate) {
                    onNavigate('compliance');
                    setSelectedLead(null);
                    setActiveAction(null);
                  } else if (selectedLead.stage === 'Account Opened' && onNavigate) {
                    onNavigate('customer-360');
                    setSelectedLead(null);
                    setActiveAction(null);
                  } else if (onConvertLead) {
                    onConvertLead(selectedLead);
                  } else if (onNavigate) {
                    onNavigate('individual-insert');
                    setSelectedLead(null);
                    setActiveAction(null);
                  }
                }}
                className={cn("flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md transition-all",
                  selectedLead.stage === 'Docs Collected' ? "bg-amber-500 hover:bg-amber-600 shadow-amber-200" :
                  selectedLead.stage === 'Account Opened' ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200" :
                  "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-200"
                )}
              >
                {selectedLead.stage === 'Docs Collected' ? 'Review Docs' :
                 selectedLead.stage === 'Account Opened' ? 'View Customer 360' :
                 'Convert to Customer'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAGE MODAL (CREATE/EDIT) */}
      {isStageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg">{editingStage ? 'Edit Stage' : 'Create New Stage'}</h3>
              <button 
                type="button"
                onClick={() => setIsStageModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const label = formData.get('label') as string;
              const linkedScreen = formData.get('linkedScreen') as NavigationPage | '';
              
              if (label.trim()) {
                if (editingStage) {
                  // Update existing
                  setStages(prev => prev.map(s => 
                    s.id === editingStage.id ? { ...s, label: label.trim(), linkedScreen } : s
                  ));
                } else {
                  // Create new
                  setStages([...stages, {
                    id: label.trim(),
                    label: label.trim(),
                    color: 'text-indigo-700',
                    border: 'border-indigo-200',
                    bg: 'bg-indigo-50',
                    linkedScreen: linkedScreen || undefined
                  }]);
                }
                setIsStageModalOpen(false);
              }
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Stage Name</label>
                <input
                  type="text"
                  name="label"
                  autoFocus
                  required
                  defaultValue={editingStage?.label || ''}
                  placeholder="e.g. Negotiation"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Linked Screen (Optional)</label>
                <LinkedScreenSelect defaultValue={editingStage?.linkedScreen || ''} />
                <p className="text-[11px] text-slate-500 mt-1.5">If selected, dropping a lead here will prompt to navigate to this screen.</p>
              </div>
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                {editingStage && (
                  <button
                    type="button"
                    onClick={() => {
                      setStages(prev => prev.filter(s => s.id !== editingStage.id));
                      setIsStageModalOpen(false);
                    }}
                    className="mr-auto px-4 py-2.5 rounded-xl font-bold text-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-all"
                  >
                    Delete Stage
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsStageModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 transition-all"
                >
                  {editingStage ? 'Save Changes' : 'Create Stage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Navigate Confirm Prompt */}
      {navigatePrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 sm:p-6 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-[24px] border border-white/60 bg-white/95 p-6 backdrop-blur-xl shadow-2xl shadow-indigo-900/10 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Linked Stage Action</h3>
            <p className="text-sm text-slate-600 mb-6">{navigatePrompt.message}</p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setNavigatePrompt(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (navigatePrompt.targetScreen === 'individual-insert' && onConvertLead) {
                    const l = leads.find(l => l.id === navigatePrompt.leadId);
                    if (l) onConvertLead(l);
                  } else if (onNavigate && navigatePrompt.targetScreen !== 'individual-insert') {
                    onNavigate(navigatePrompt.targetScreen as NavigationPage);
                  }
                  setNavigatePrompt(null);
                }}
                className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 rounded-xl transition active:scale-[0.98] cursor-pointer"
              >
                Navigate Now
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
