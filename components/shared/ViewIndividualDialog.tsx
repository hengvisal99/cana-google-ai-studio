'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Individual, 
  DesignTheme, 
  Customer360Profile,
  WorkflowStage
} from '@/types';
import { getCustomer360 } from '@/lib/data';
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Building, 
  Briefcase, 
  CreditCard, 
  FileText, 
  ExternalLink, 
  Edit3, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign, 
  Award,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  Users,
  Lock,
  Download,
  AlertCircle,
  Check,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewIndividualDialogProps {
  individual: Individual | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToUpdate: (individual: Individual) => void;
  onNavigateToCustomer360: (individual: Individual) => void;
  onAuthorizeIndividual?: (
    id: string,
    action: 'authorize' | 'resubmit' | 'reject',
    role: 'CSO' | 'SR' | 'Manager',
    processedBy: string,
    comment: string,
    reason?: string
  ) => void;
  onCloseAccountIndividual?: (
    id: string,
    closeDate: string,
    account: string,
    reason: string,
    processedBy: string
  ) => void;
  theme: DesignTheme;
}

type DialogTab = 'overview' | 'personal' | 'identification' | 'employment' | 'family' | 'account' | 'authorization';

export function ViewIndividualDialog({
  individual,
  isOpen,
  onClose,
  onNavigateToUpdate,
  onNavigateToCustomer360,
  onAuthorizeIndividual,
  onCloseAccountIndividual,
  theme,
}: ViewIndividualDialogProps) {
  const [activeTab, setActiveTab] = useState<DialogTab>('overview');

  // Inline Quick Authorization modal/action inside dialog
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authRole, setAuthRole] = useState<'CSO' | 'SR' | 'Manager'>('SR');
  const [authOfficer, setAuthOfficer] = useState('Dara Vong (SR)');
  const [authAction, setAuthAction] = useState<'authorize' | 'resubmit' | 'reject'>('authorize');
  const [authComment, setAuthComment] = useState('');
  const [authReason, setAuthReason] = useState('');

  // Inline Close Account modal/action inside dialog
  const [showCloseForm, setShowCloseForm] = useState(false);
  const [closeDate, setCloseDate] = useState('2026-09-09');
  const [closeReason, setCloseReason] = useState('');

  if (!isOpen || !individual) return null;

  const profile360: Customer360Profile = getCustomer360(individual);

  const modalContainerClasses = () => {
    switch (theme) {
      case 'glassmorphism':
        return 'bg-white/95 backdrop-blur-2xl border border-white/80 shadow-2xl shadow-blue-950/15 rounded-3xl';
      case 'aurora':
        return 'bg-white border-2 border-slate-100 shadow-2xl rounded-2xl overflow-hidden ring-1 ring-blue-500/10';
      case 'soft-fintech':
      default:
        return 'bg-white border border-slate-200 shadow-xl rounded-xl';
    }
  };

  const handleOpenAuthDrawer = (action: 'authorize' | 'resubmit' | 'reject') => {
    if (showAuthForm && authAction === action) {
      setShowAuthForm(false);
      return;
    }

    setAuthAction(action);
    let defaultRole: 'CSO' | 'SR' | 'Manager' = 'SR';
    let defaultOfficer = 'Dara Vong (SR)';

    if (individual.currentWorkflowStage === 'CSO') {
      defaultRole = 'CSO';
      defaultOfficer = 'Sophea Keo (CSO)';
    } else if (individual.currentWorkflowStage === 'Manager') {
      defaultRole = 'Manager';
      defaultOfficer = 'Vannak Lim (Manager)';
    } else {
      defaultRole = 'SR';
      defaultOfficer = 'Dara Vong (SR)';
    }

    setAuthRole(defaultRole);
    setAuthOfficer(defaultOfficer);
    setAuthReason('');
    setAuthComment(
      action === 'authorize'
        ? `Authorized by ${defaultOfficer} (${defaultRole})`
        : ''
    );
    setShowAuthForm(true);
    setShowCloseForm(false);
  };

  const handleExecuteAuth = () => {
    if (!onAuthorizeIndividual) return;
    if (authAction !== 'authorize' && !authReason.trim()) {
      alert('Please state a reason for ' + authAction);
      return;
    }

    onAuthorizeIndividual(
      individual.id,
      authAction,
      authRole,
      authOfficer,
      authComment || `Decision recorded by ${authOfficer} (${authRole})`,
      authReason
    );
    setShowAuthForm(false);
    setAuthComment('');
    setAuthReason('');
  };

  const handleExecuteClose = () => {
    if (!onCloseAccountIndividual) return;
    if (!closeReason.trim()) {
      alert('Please provide a reason for closing the account.');
      return;
    }

    onCloseAccountIndividual(
      individual.id,
      closeDate,
      individual.tradingAccountInfo?.tradingAccountNumber || 'Primary Trading Account',
      closeReason,
      'Sophea Keo (CSO)'
    );
    setShowCloseForm(false);
    setCloseReason('');
  };

  return (
    <div
      id="view-individual-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="view-individual-modal-container"
        className={cn(
          'w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800 transition-all shadow-2xl',
          modalContainerClasses()
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3.5">
            <Image
              src={individual.avatarUrl}
              alt={individual.firstName}
              width={52}
              height={52}
              className="w-13 h-13 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-slate-200"
              referrerPolicy="no-referrer"
              unoptimized
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {individual.fullNameEN || `${individual.firstName} ${individual.lastName}`}
                </h2>
                {individual.fullNameKH && (
                  <span className="text-xs text-blue-600 font-semibold px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100">
                    {individual.fullNameKH}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-mono">
                <span className="font-bold text-slate-700">{individual.customerId || individual.id}</span>
                <span>•</span>
                <span>{individual.nationality}</span>
                <span>•</span>
                <span>{individual.residency || 'Resident'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Action: Edit Screen */}
            <button
              onClick={() => {
                onClose();
                onNavigateToUpdate(individual);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-600" />
              <span>Edit</span>
            </button>

            {/* Action: Customer 360 */}
            <button
              onClick={() => {
                onClose();
                onNavigateToCustomer360(individual);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 transition shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Customer 360</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workflow & Status Strip */}
        <div className="px-5 py-2.5 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[10px] font-bold uppercase">Profile Status:</span>
              <span className={cn(
                'px-2 py-0.5 rounded-full font-bold text-[11px] border',
                individual.profileStatus === 'Completed'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              )}>
                {individual.profileStatus || 'Incomplete'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[10px] font-bold uppercase">Account Status:</span>
              <span className={cn(
                'px-2 py-0.5 rounded-full font-bold text-[11px] border',
                individual.accountStatus === 'Active'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              )}>
                {individual.accountStatus || 'Not Opened'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[10px] font-bold uppercase">Request:</span>
              <span className="px-2 py-0.5 rounded-full font-bold text-[11px] bg-blue-50 text-blue-700 border border-blue-200">
                {individual.requestType} • {individual.requestStatus} ({individual.currentWorkflowStage})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Close Account Button if Active */}
            {individual.accountStatus === 'Active' && individual.requestType !== 'Close Account' && (
              <button
                onClick={() => {
                  setShowCloseForm(!showCloseForm);
                  setShowAuthForm(false);
                }}
                className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg border border-purple-200 text-xs flex items-center gap-1"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Initiate Close</span>
              </button>
            )}
          </div>
        </div>

        {/* Embedded Close Form Drawer (if opened) */}
        {showCloseForm && (
          <div className="p-4 bg-purple-50 border-b border-purple-200 text-xs space-y-3 shrink-0 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-900 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-purple-600" />
                Initiate Close Account Request
              </span>
              <button onClick={() => setShowCloseForm(false)} className="text-purple-700 font-bold">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-purple-800 mb-1">Effective Close Date</label>
                <input
                  type="date"
                  value={closeDate}
                  onChange={(e) => setCloseDate(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-purple-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-purple-800 mb-1">Reason for Closure *</label>
                <input
                  type="text"
                  value={closeReason}
                  onChange={(e) => setCloseReason(e.target.value)}
                  placeholder="E.g. Relocated out of jurisdiction"
                  className="w-full px-2 py-1.5 bg-white border border-purple-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleExecuteClose}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-xs"
              >
                Confirm Account Closure Request
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-5 border-b border-slate-200 flex items-center gap-2 overflow-x-auto bg-white shrink-0 text-xs font-semibold">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'personal', label: 'Personal Information' },
            { id: 'identification', label: 'Identification & Docs' },
            { id: 'employment', label: 'Employment & Banking' },
            { id: 'family', label: 'Family & Related' },
            { id: 'account', label: 'Account Info' },
            { id: 'authorization', label: `Workflow History (${individual.authorizationHistory?.length || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DialogTab)}
              className={cn(
                'py-3 px-3 border-b-2 font-bold transition whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dialog Tab Body (Scrollable) */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* If Close Account, show banner */}
              {individual.requestType === 'Close Account' && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-2 text-purple-900 font-bold">
                    <Lock className="w-4 h-4 text-purple-700" />
                    <span>Account Closure Pending Authorization</span>
                  </div>
                  <p className="text-purple-800 text-[11px]">
                    Close Date: <strong>{individual.closeAccountInfo?.closeDate || 'N/A'}</strong> • Target Account: <strong>{individual.closeAccountInfo?.account || 'Primary'}</strong>
                  </p>
                  <p className="text-purple-700 text-[11px]">
                    Closure Reason: {individual.closeAccountInfo?.reason || 'Customer request'}
                  </p>
                </div>
              )}

              {/* Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Trading Account</span>
                  <div className="text-sm font-bold text-slate-900 font-mono mt-1">
                    {individual.tradingAccountInfo?.tradingAccountNumber || 'TRD-PENDING'}
                  </div>
                  <span className="text-[10px] text-slate-400">Opened {individual.tradingAccountInfo?.accountDate || 'N/A'}</span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Investor ID</span>
                  <div className="text-sm font-bold text-blue-600 font-mono mt-1">
                    {individual.investorIdInfo?.investorIdNumber || 'INV-PENDING'}
                  </div>
                  <span className="text-[10px] text-slate-400">SECC Firm: {individual.investorIdInfo?.securitiesFirm}</span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Risk Category</span>
                  <div className="text-sm font-bold text-amber-700 mt-1 capitalize">
                    {individual.riskRating || individual.riskCategory || 'Moderate'}
                  </div>
                  <span className="text-[10px] text-slate-400">{individual.investmentExperience || '3-5 yrs experience'}</span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total Liquid Capital</span>
                  <div className="text-sm font-bold text-emerald-700 font-mono mt-1">
                    ${individual.totalDeposits.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-400">FICO {individual.creditScore} Tier</span>
                </div>
              </div>

              {/* Summary Overview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    <span>Primary Demographics & Identity</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                    <div>
                      <span className="text-slate-400 block">Khmer Name:</span>
                      <strong className="text-slate-800">{individual.fullNameKH || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Date of Birth:</span>
                      <strong className="text-slate-800">{individual.dateOfBirth}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Gender / Marital:</span>
                      <strong className="text-slate-800">{individual.gender} • {individual.maritalStatus}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">ID ({individual.idType}):</span>
                      <strong className="text-slate-800 font-mono">{individual.idNumber}</strong>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                    <span>Employment & Organization</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                    <div>
                      <span className="text-slate-400 block">Occupation:</span>
                      <strong className="text-slate-800">{individual.employment?.occupation || individual.occupation}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Position / Title:</span>
                      <strong className="text-slate-800">{individual.employment?.position || 'Lead Officer'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Employer:</span>
                      <strong className="text-slate-800">{individual.employment?.organizationName || individual.employer}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Settlement Bank:</span>
                      <strong className="text-slate-800">{individual.banking?.bankName}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PERSONAL INFORMATION */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Legal Names & Demographics
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Surname (EN)</span>
                    <strong className="text-slate-900">{individual.surnameEN || individual.lastName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Given Name (EN)</span>
                    <strong className="text-slate-900">{individual.givenNameEN || individual.firstName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Surname (KH)</span>
                    <strong className="text-slate-900">{individual.surnameKH || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Given Name (KH)</span>
                    <strong className="text-slate-900">{individual.givenNameKH || 'N/A'}</strong>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Date of Birth</span>
                    <strong className="text-slate-900 font-mono">{individual.dateOfBirth}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Gender</span>
                    <strong className="text-slate-900">{individual.gender}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Marital Status</span>
                    <strong className="text-slate-900">{individual.maritalStatus}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Nationality</span>
                    <strong className="text-slate-900">{individual.nationality}</strong>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Securities Appropriateness & Category
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Customer Type</span>
                    <strong className="text-slate-900">{individual.customerType || 'Retail'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Education Background</span>
                    <strong className="text-slate-900">{individual.educationBackground || "Bachelor's"}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Securities Knowledge</span>
                    <strong className="text-slate-900">{individual.securitiesKnowledge || 'Intermediate'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Risk Category</span>
                    <strong className="text-slate-900 capitalize">{individual.riskRating || individual.riskCategory || 'Moderate'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Investment Experience</span>
                    <strong className="text-slate-900">{individual.investmentExperience || '3-5 years'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Designated Branch</span>
                    <strong className="text-slate-900">{individual.branch}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IDENTIFICATION & DOCUMENTS */}
          {activeTab === 'identification' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Identification Records
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Residency</span>
                    <strong className="text-slate-900">{individual.residency || 'Resident'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">ID Document Type</span>
                    <strong className="text-slate-900">{individual.idType}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">ID Number</span>
                    <strong className="text-slate-900 font-mono">{individual.idNumber}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Issued By</span>
                    <strong className="text-slate-900">{individual.issuedBy || 'General Dept of Identification'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Issued Date</span>
                    <strong className="text-slate-900 font-mono">{individual.issuedDate || '2022-01-10'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Expired Date</span>
                    <strong className="text-slate-900 font-mono">{individual.expiredDate || individual.idExpiryDate}</strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-slate-400 block font-bold">Taxpayer Identification Number (TIN)</span>
                    <strong className="text-slate-900 font-mono">{individual.taxpayerIdNumber || 'N/A'}</strong>
                  </div>
                </div>
              </div>

              {/* Supporting Documents */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Supporting Documents ({individual.supportingDocuments?.length || 0})
                </span>
                {individual.supportingDocuments && individual.supportingDocuments.length > 0 ? (
                  <div className="space-y-2">
                    {individual.supportingDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{doc.fileName}</span>
                              <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-blue-50 text-blue-700">
                                {doc.type}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">{doc.fileSize}</span>
                            </div>
                            {doc.remark && <p className="text-[11px] text-slate-500 mt-0.5">{doc.remark}</p>}
                          </div>
                        </div>

                        <button
                          onClick={() => alert(`Downloading verified document: ${doc.fileName}`)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No supporting documents attached.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: EMPLOYMENT & BANKING */}
          {activeTab === 'employment' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Employment Details
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Occupation</span>
                    <strong className="text-slate-900">{individual.employment?.occupation || individual.occupation}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Position / Title</span>
                    <strong className="text-slate-900">{individual.employment?.position || 'Executive'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Level of Position</span>
                    <strong className="text-slate-900">{individual.employment?.levelOfPosition || 'Senior'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Organization / Employer</span>
                    <strong className="text-slate-900">{individual.employment?.organizationName || individual.employer}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Type of Business</span>
                    <strong className="text-slate-900">{individual.employment?.typeOfBusiness || 'Services'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Length of Work</span>
                    <strong className="text-slate-900">{individual.employment?.lengthOfWork || '3+ years'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Office Telephone</span>
                    <strong className="text-slate-900">{individual.employment?.officeTelephone || 'N/A'}</strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-slate-400 block font-bold">Organization Address</span>
                    <strong className="text-slate-900">{individual.employment?.organizationAddress || 'Phnom Penh'}</strong>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Designated Settlement Bank Account
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Bank Name</span>
                    <strong className="text-slate-900">{individual.banking?.bankName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Account Owner</span>
                    <strong className="text-slate-900 uppercase">{individual.banking?.accountOwner}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Saving Account Type</span>
                    <strong className="text-slate-900">{individual.banking?.savingAccount}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Bank Account Number</span>
                    <strong className="text-slate-900 font-mono">{individual.banking?.accountNumber}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FAMILY & RELATED PERSONS */}
          {activeTab === 'family' && (
            <div className="space-y-4">
              {/* Spouse */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Spouse Information
                </span>
                {individual.spouse ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Full Name</span>
                      <strong className="text-slate-900">{individual.spouse.fullName}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Latin Name</span>
                      <strong className="text-slate-900">{individual.spouse.latin}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Email</span>
                      <strong className="text-slate-900">{individual.spouse.email}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Occupation & Position</span>
                      <strong className="text-slate-900">{individual.spouse.occupation} • {individual.spouse.position}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Business Sector</span>
                      <strong className="text-slate-900">{individual.spouse.typeOfBusiness}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Mobile Phone</span>
                      <strong className="text-slate-900">{individual.spouse.mobile}</strong>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No spouse record on file.</p>
                )}
              </div>

              {/* Related Person */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Related Person / Emergency Contact
                </span>
                {individual.relatedPerson ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Full Name</span>
                      <strong className="text-slate-900">{individual.relatedPerson.fullName}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Relationship</span>
                      <strong className="text-slate-900">{individual.relatedPerson.relationship}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Mobile Contact</span>
                      <strong className="text-slate-900">{individual.relatedPerson.mobile}</strong>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No related person record on file.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: ACCOUNT INFORMATION */}
          {activeTab === 'account' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Investor ID Information (Regulator SECC)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Investor ID Number</span>
                    <strong className="text-slate-900 font-mono">{individual.investorIdInfo?.investorIdNumber || 'Pending'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Securities Firm</span>
                    <strong className="text-slate-900">{individual.investorIdInfo?.securitiesFirm}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Customer Received By (CSO)</span>
                    <strong className="text-slate-900">{individual.investorIdInfo?.customerReceivedBy}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Application Date</span>
                    <strong className="text-slate-900 font-mono">{individual.investorIdInfo?.applicationDate}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Date Sent to SECC</span>
                    <strong className="text-slate-900 font-mono">{individual.investorIdInfo?.dateSentToSECC}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Date Received from SECC</span>
                    <strong className="text-slate-900 font-mono">{individual.investorIdInfo?.dateReceivedFromSECC}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Customer Status</span>
                    <strong className="text-slate-900">{individual.investorIdInfo?.customerStatus}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Investor ID Expired Date</span>
                    <strong className="text-slate-900 font-mono">{individual.investorIdInfo?.investorIdExpiredDate}</strong>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Trading Account Details
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Trading Account Number</span>
                    <strong className="text-slate-900 font-mono">{individual.tradingAccountInfo?.tradingAccountNumber}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Account Opening Date</span>
                    <strong className="text-slate-900 font-mono">{individual.tradingAccountInfo?.accountDate}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Account Checked By (SR)</span>
                    <strong className="text-slate-900">{individual.tradingAccountInfo?.accountCheckedBy}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Account Approved By (Manager)</span>
                    <strong className="text-slate-900">{individual.tradingAccountInfo?.accountApprovedBy}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Current Assigned SR</span>
                    <strong className="text-slate-900">{individual.tradingAccountInfo?.currentAssignedSR}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Phone Linked</span>
                    <strong className="text-slate-900">{individual.tradingAccountInfo?.phoneNumber}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: WORKFLOW & AUTHORIZATION HISTORY */}
          {activeTab === 'authorization' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-blue-900 block">
                    Workflow Pipeline: CSO → SR → Manager
                  </span>
                  <p className="text-blue-700 text-[11px] mt-0.5">
                    Current Workflow Stage: <strong>{individual.currentWorkflowStage}</strong> • Overall Status: <strong>{individual.requestStatus}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setShowAuthForm(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Execute Next Step</span>
                </button>
              </div>

              {/* Timeline list */}
              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                {individual.authorizationHistory && individual.authorizationHistory.length > 0 ? (
                  individual.authorizationHistory.map((item, idx) => (
                    <div key={item.id || idx} className="relative flex items-start gap-3 pl-8">
                      <div className={cn(
                        'absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs',
                        item.status === 'Approved' ? 'bg-emerald-500' : item.status === 'Resubmit' ? 'bg-amber-500' : item.status === 'Rejected' ? 'bg-rose-500' : 'bg-blue-500'
                      )} />
                      <div className="flex-1 p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs">{item.stage}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{item.dateTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span>Officer: <strong className="text-slate-700">{item.processedBy}</strong></span>
                          <span>•</span>
                          <span>Role: <strong className="text-slate-700">{item.role}</strong></span>
                          <span>•</span>
                          <span className={cn(
                            'font-bold px-1.5 py-0.2 rounded text-[10px]',
                            item.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : item.status === 'Resubmit' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'
                          )}>
                            {item.status}
                          </span>
                        </div>
                        {item.comment && (
                          <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg mt-1 border border-slate-100">
                            {item.comment}
                          </p>
                        )}
                        {item.reason && (
                          <p className="text-[11px] text-rose-700 bg-rose-50 p-2 rounded-lg mt-1 border border-rose-200 font-medium">
                            Discrepancy / Reason: {item.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic pl-8">No authorization events logged.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Authorization Confirmation / Input Drawer */}
        {showAuthForm && (
          <div className={cn(
            "p-4 border-t text-xs space-y-3 shrink-0 animate-in slide-in-from-bottom-2",
            authAction === 'authorize' ? "bg-emerald-50/80 border-emerald-200" :
            authAction === 'resubmit' ? "bg-amber-50/80 border-amber-200" :
            "bg-rose-50/80 border-rose-200"
          )}>
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-xs">
                {authAction === 'authorize' && (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-900">Approve Application (Advance Stage: CSO → SR → Manager → Approved)</span>
                  </>
                )}
                {authAction === 'resubmit' && (
                  <>
                    <RotateCcw className="w-4 h-4 text-amber-700" />
                    <span className="text-amber-900">Request Application Resubmission (Return for Amendment)</span>
                  </>
                )}
                {authAction === 'reject' && (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span className="text-rose-900">Reject Application (Terminate Registration)</span>
                  </>
                )}
              </span>
              <button 
                type="button"
                onClick={() => setShowAuthForm(false)} 
                className="text-slate-400 hover:text-slate-600 p-1"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">Authorizer Role</label>
                <select
                  value={authRole}
                  onChange={(e) => {
                    const r = e.target.value as 'CSO' | 'SR' | 'Manager';
                    setAuthRole(r);
                    if (r === 'CSO') setAuthOfficer('Sophea Keo (CSO)');
                    if (r === 'SR') setAuthOfficer('Dara Vong (SR)');
                    if (r === 'Manager') setAuthOfficer('Vannak Lim (Manager)');
                  }}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-1 focus:ring-blue-500"
                >
                  <option value="CSO">CSO (Customer Service Officer)</option>
                  <option value="SR">SR (Securities Representative)</option>
                  <option value="Manager">Manager (Compliance / Branch Head)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">Acting Officer</label>
                <input
                  type="text"
                  value={authOfficer}
                  onChange={(e) => setAuthOfficer(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">
                  {authAction === 'authorize' ? 'Decision Summary' : `Reason for ${authAction === 'reject' ? 'Rejection' : 'Resubmission'} *`}
                </label>
                {authAction === 'authorize' ? (
                  <div className="text-xs text-emerald-700 font-semibold py-1.5 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Ready to advance to next workflow stage</span>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={authReason}
                    onChange={(e) => setAuthReason(e.target.value)}
                    placeholder={authAction === 'reject' ? 'e.g. Compliance block / Invalid ID...' : 'e.g. Please upload clear proof of address...'}
                    className="w-full px-2.5 py-1.5 bg-white border border-rose-300 rounded-lg text-slate-800 text-xs focus:ring-1 focus:ring-rose-500"
                  />
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
              <input
                type="text"
                value={authComment}
                onChange={(e) => setAuthComment(e.target.value)}
                placeholder="Optional audit log comment / internal note..."
                className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs"
              />
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAuthForm(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="btn-confirm-auth-decision"
                  onClick={handleExecuteAuth}
                  className={cn(
                    "px-4 py-1.5 text-white font-bold rounded-lg text-xs shadow-xs transition flex items-center gap-1.5",
                    authAction === 'authorize' ? "bg-emerald-600 hover:bg-emerald-700" :
                    authAction === 'resubmit' ? "bg-amber-600 hover:bg-amber-700" :
                    "bg-rose-600 hover:bg-rose-700"
                  )}
                >
                  {authAction === 'authorize' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {authAction === 'resubmit' && <RotateCcw className="w-3.5 h-3.5" />}
                  {authAction === 'reject' && <AlertTriangle className="w-3.5 h-3.5" />}
                  <span>Confirm {authAction === 'authorize' ? 'Approval' : authAction === 'resubmit' ? 'Resubmission' : 'Rejection'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer with Authorization Buttons */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Left: Workflow Status Indicator */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-500 font-medium">Stage:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-white text-slate-800 border border-slate-200 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>{individual.currentWorkflowStage}</span>
            </span>

            <span className="text-slate-400">•</span>

            <span className="text-slate-500 font-medium">Status:</span>
            <span className={cn(
              "px-2.5 py-1 rounded-md text-xs font-bold border shadow-2xs",
              individual.requestStatus === 'Approved' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
              individual.requestStatus === 'Resubmit' ? "bg-amber-50 text-amber-800 border-amber-200" :
              individual.requestStatus === 'Rejected' ? "bg-rose-50 text-rose-700 border-rose-200" :
              "bg-blue-50 text-blue-700 border-blue-200"
            )}>
              {individual.requestStatus}
            </span>
          </div>

          {/* Right: Authorization Buttons Group (Reject, Resubmit, Approve) + Close */}
          <div className="flex items-center gap-2 justify-end flex-wrap">
            {/* Reject Button */}
            <button
              id="btn-view-dialog-reject"
              type="button"
              onClick={() => handleOpenAuthDrawer('reject')}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5",
                showAuthForm && authAction === 'reject'
                  ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                  : "bg-white hover:bg-rose-50 text-rose-700 border-rose-300 hover:border-rose-400 shadow-2xs"
              )}
              title="Reject application"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Reject</span>
            </button>

            {/* Resubmit Button */}
            <button
              id="btn-view-dialog-resubmit"
              type="button"
              onClick={() => handleOpenAuthDrawer('resubmit')}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5",
                showAuthForm && authAction === 'resubmit'
                  ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                  : "bg-white hover:bg-amber-50 text-amber-800 border-amber-300 hover:border-amber-400 shadow-2xs"
              )}
              title="Request resubmission"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>Resubmit</span>
            </button>

            {/* Approve Button */}
            <button
              id="btn-view-dialog-approve"
              type="button"
              onClick={() => handleOpenAuthDrawer('authorize')}
              className={cn(
                "px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-xs",
                showAuthForm && authAction === 'authorize'
                  ? "bg-emerald-700 text-white ring-2 ring-emerald-400"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              )}
              title="Approve & advance workflow"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve</span>
            </button>

            <div className="h-5 w-px bg-slate-200 mx-0.5 hidden sm:block" />

            {/* Close Button */}
            <button
              id="btn-view-dialog-close"
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 shadow-2xs transition"
            >
              Close Dialog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
