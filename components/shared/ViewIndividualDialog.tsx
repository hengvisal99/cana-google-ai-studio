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
  UserPlus,
  Users,
  Lock,
  Download,
  AlertCircle,
  Check,
  RotateCcw,
  LayoutList,
  GitCommit,
  Split
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { IndividualPersonalViewSection } from '@/components/individual/IndividualPersonalViewSection';

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

type DialogTab = 'personal' | 'identification' | 'employment' | 'family' | 'account' | 'authorization';

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
  const [activeTab, setActiveTab] = useState<DialogTab>('personal');

  // Dedicated Authorization Decision Dialog State
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authRole, setAuthRole] = useState<'CSO' | 'SR' | 'Manager'>('SR');
  const [authOfficer, setAuthOfficer] = useState('Dara Vong (SR)');
  const [authAction, setAuthAction] = useState<'authorize' | 'resubmit' | 'reject'>('authorize');
  const [authComment, setAuthComment] = useState('');
  const [authReason, setAuthReason] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

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

  const handleOpenAuthDialog = (action: 'authorize' | 'resubmit' | 'reject') => {
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
    setAuthError(null);
    setAuthComment(
      action === 'authorize'
        ? `Authorized by ${defaultOfficer} (${defaultRole})`
        : ''
    );
    setShowAuthDialog(true);
  };

  const handleExecuteAuth = () => {
    if (!onAuthorizeIndividual) return;
    if (authAction !== 'authorize' && !authReason.trim()) {
      setAuthError(`Please provide a reason for ${authAction === 'reject' ? 'rejection' : 'resubmission'}.`);
      return;
    }

    onAuthorizeIndividual(
      individual.id,
      authAction,
      authRole,
      authOfficer,
      authAction === 'authorize' ? (authComment || `Approved by ${authOfficer} (${authRole})`) : authReason,
      authReason
    );
    setShowAuthDialog(false);
    setAuthComment('');
    setAuthReason('');
    setAuthError(null);
  };

  // Categorize workflow authorization history into Registration vs Account Close
  const isCloseItem = (item: { requestType?: string; stage?: string; comment?: string }) => {
    if (item.requestType === 'Close Account') return true;
    if (item.requestType === 'Registration') return false;
    const stageLower = (item.stage || '').toLowerCase();
    const commentLower = (item.comment || '').toLowerCase();
    return (
      stageLower.includes('close') ||
      stageLower.includes('closure') ||
      commentLower.includes('close account') ||
      commentLower.includes('closure')
    );
  };

  const registrationHistory = (individual.authorizationHistory || []).filter((item) => !isCloseItem(item));
  const accountCloseHistory = (individual.authorizationHistory || []).filter((item) => isCloseItem(item));
  const hasCloseRequest = Boolean(
    individual.closeAccountInfo ||
    individual.requestType === 'Close Account' ||
    individual.accountStatus === 'Closed' ||
    accountCloseHistory.length > 0
  );

  return (
    <div
      id="view-individual-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="view-individual-modal-container"
        className={cn(
          'w-full max-w-4xl xl:max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800 transition-all shadow-2xl',
          modalContainerClasses()
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50 shrink-0">
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
                  <span className="text-xs text-blue-600 font-semibold px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100 font-khmer">
                    {individual.fullNameKH}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-mono flex-wrap">
                <span className="font-bold text-slate-700">{individual.customerId || individual.id}</span>
                {individual.tradingAccountInfo?.tradingAccountNumber && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>TRD: <strong className="text-slate-800">{individual.tradingAccountInfo.tradingAccountNumber}</strong></span>
                  </>
                )}
                {individual.investorIdInfo?.investorIdNumber && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>INV: <strong className="text-blue-600">{individual.investorIdInfo.investorIdNumber}</strong></span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Profile Status & Account Status on the Right */}
            <div className="flex items-center gap-2.5 flex-wrap justify-end">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Profile:</span>
                <span className={cn(
                  'px-2.5 py-0.5 rounded-full font-bold text-[11px] border',
                  individual.profileStatus === 'Completed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                )}>
                  {individual.profileStatus || 'Incomplete'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Account:</span>
                <span className={cn(
                  'px-2.5 py-0.5 rounded-full font-bold text-[11px] border',
                  individual.accountStatus === 'Active'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                )}>
                  {individual.accountStatus || 'Not Opened'}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 border-b border-slate-200 flex items-center gap-2 overflow-x-auto bg-white shrink-0 text-xs font-semibold">
          {[
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
          {/* If Close Account, show banner across all tabs */}
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

          {/* TAB 1: PERSONAL INFORMATION - STRUCTURED DOSSIER */}
          {activeTab === 'personal' && (
            <IndividualPersonalViewSection 
              individual={individual} 
              theme={theme} 
            />
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
                            </div>
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

          {/* TAB 5: ACCOUNT INFORMATION */}
          {activeTab === 'account' && (
            <div className="space-y-4">
              {/* Account Key Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Trading Account</span>
                  <div className="text-sm font-bold text-slate-900 font-mono mt-1">
                    {individual.tradingAccountInfo?.tradingAccountNumber || 'TRD-PENDING'}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Investor ID</span>
                  <div className="text-sm font-bold text-blue-600 font-mono mt-1">
                    {individual.investorIdInfo?.investorIdNumber || 'INV-PENDING'}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Risk Category</span>
                  <div className="text-sm font-bold text-amber-700 mt-1 capitalize">
                    {individual.riskRating || individual.riskCategory || 'Moderate'}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total Liquid Capital</span>
                  <div className="text-sm font-bold text-emerald-700 font-mono mt-1">
                    ${individual.totalDeposits.toLocaleString()}
                  </div>
                </div>
              </div>

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
              {/* Two Cards Layout: Registration Timeline & Account Close Timeline */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4.5 items-start">
                {/* CARD 1: REGISTRATION TIMELINE */}
                <div id="card-registration-timeline" className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
                  {/* Header with Title */}
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shrink-0 shadow-xs">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base">Registration Timeline</h4>
                          {(() => {
                            const lastItem = registrationHistory[registrationHistory.length - 1];
                            const isRejected = individual.requestStatus === 'Rejected' || lastItem?.status === 'Rejected';
                            const isCompleted = individual.profileStatus === 'Completed' || individual.accountStatus === 'Active' || (individual.requestStatus === 'Approved' && !isRejected);

                            if (isRejected) {
                              return (
                                <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-[11px] font-bold inline-flex items-center gap-1 shadow-2xs">
                                  <AlertCircle className="w-3 h-3 text-rose-600" />
                                  <span>Rejected</span>
                                </span>
                              );
                            }
                            if (isCompleted) {
                              return (
                                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-bold inline-flex items-center gap-1 shadow-2xs">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Completed</span>
                                </span>
                              );
                            }
                            return (
                              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[11px] font-bold inline-flex items-center gap-1 shadow-2xs">
                                <Clock className="w-3 h-3 text-blue-600" />
                                <span>{individual.currentWorkflowStage || 'In Progress'}</span>
                              </span>
                            );
                          })()}
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-500">Customer onboarding & trading account opening</p>
                      </div>
                    </div>
                  </div>

                  {/* Connected Stage Timeline: Node & Vertical Line on Left, Card UI on Right */}
                  <div className="space-y-4 pt-1">
                    {registrationHistory.length > 0 ? (
                      registrationHistory.map((item, idx) => {
                        const isSubmitted = item.status === 'Submitted' || item.status === 'Approved';
                        const isRejected = item.status === 'Rejected';
                        const isLast = idx === registrationHistory.length - 1;

                        return (
                          <div key={item.id || idx} className="relative flex items-start gap-3.5 sm:gap-4">
                            {/* Vertical Connecting Line */}
                            {!isLast && (
                              <div
                                className="absolute left-[19px] top-10 bottom-[-16px] w-0.5 bg-slate-200 z-0"
                                aria-hidden="true"
                              />
                            )}

                            {/* Left Side: Stage Node Icon */}
                            <div className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2 shadow-2xs z-10 transition-transform bg-white',
                              isSubmitted
                                ? 'bg-emerald-50/90 border-emerald-300 text-emerald-600 ring-2 ring-emerald-100'
                                : isRejected
                                ? 'bg-rose-50/90 border-rose-300 text-rose-600 ring-2 ring-rose-100'
                                : 'bg-slate-50 border-slate-200 text-slate-400 ring-2 ring-slate-100'
                            )}>
                              {isSubmitted ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                              ) : isRejected ? (
                                <X className="w-5 h-5 text-rose-600 stroke-[2.5]" />
                              ) : (
                                <Clock className="w-5 h-5 text-slate-400" />
                              )}
                            </div>

                            {/* Right Side: Card UI Only */}
                            <div className={cn(
                              'flex-1 p-4 rounded-xl border transition-all space-y-2.5',
                              isRejected 
                                ? 'bg-rose-50/25 border-rose-200 shadow-2xs hover:border-rose-300' 
                                : isSubmitted
                                ? 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs'
                                : 'bg-slate-50/60 border-slate-200 shadow-2xs'
                            )}>
                              {/* Card Top Row: Stage Metadata & Status Badge */}
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h5 className="font-bold text-slate-900 text-sm">
                                    {item.processedBy} <span className="font-medium text-slate-500">· {item.role}</span>
                                  </h5>
                                </div>

                                {/* Status Badge */}
                                <div>
                                  {item.status === 'Submitted' ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                      SUBMITTED
                                    </span>
                                  ) : item.status === 'Approved' ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                      APPROVED
                                    </span>
                                  ) : item.status === 'Rejected' ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                                      REJECTED
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 shadow-2xs">
                                      <Clock className="w-3 h-3 text-slate-400" />
                                      Queue
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Timestamp Row */}
                              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>{item.dateTime || 'Queue'}</span>
                              </div>

                              {/* Reason Box */}
                              {item.reason && (
                                <div className="p-3 bg-rose-50/80 border border-rose-200/80 rounded-xl text-xs text-rose-900 space-y-0.5 mt-2">
                                  <span className="font-bold text-rose-950 block">Rejection Reason:</span>
                                  <p className="text-rose-800 leading-relaxed">{item.reason}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-900 text-sm">Customer Registration Completed</h5>
                          <p className="text-xs text-slate-500">{individual.tradingAccountInfo?.accountDate || individual.createdAt}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* CARD 2: ACCOUNT CLOSE TIMELINE */}
                <div id="card-account-close-timeline" className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200/80 flex items-center justify-center text-purple-600 shrink-0">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Account Close Timeline</h4>
                        <p className="text-[11px] text-slate-500">Trading account termination & closure authorization</p>
                      </div>
                    </div>
                    <div>
                      {individual.accountStatus === 'Closed' ? (
                        <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5 shadow-2xs">
                          <Lock className="w-3.5 h-3.5 text-rose-600" />
                          <span>Account Closed</span>
                        </span>
                      ) : individual.requestType === 'Close Account' ? (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5 shadow-2xs">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>{individual.currentWorkflowStage} Pending</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-[11px] font-medium inline-flex items-center gap-1.5 shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>No Closure Request</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {hasCloseRequest ? (
                    <div className="space-y-3.5">
                      {/* Close Request Details Banner */}
                      <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-purple-900 font-bold">
                          <span className="flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-purple-600" />
                            <span>Closure Request Parameters</span>
                          </span>
                          <span className="font-mono text-[11px] text-purple-700">
                            {individual.closeAccountInfo?.closeDate || '2024-06-01'}
                          </span>
                        </div>
                        <div className="text-[11px] text-purple-800 space-y-0.5">
                          <div>
                            Target Account: <strong className="font-mono">{individual.closeAccountInfo?.account || individual.tradingAccountInfo?.tradingAccountNumber || 'Primary Account'}</strong>
                          </div>
                          <div>
                            Closure Reason: <span className="italic">{individual.closeAccountInfo?.reason || 'Customer requested full account closure and asset liquidation.'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Timeline Events for Close Account */}
                      <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 pt-1">
                        {accountCloseHistory.length > 0 ? (
                          accountCloseHistory.map((item, idx) => (
                            <div key={item.id || idx} className="relative flex items-start gap-3 pl-8">
                              <div className={cn(
                                'absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs',
                                item.status === 'Approved' ? 'bg-emerald-500' :
                                item.status === 'Resubmit' ? 'bg-amber-500' :
                                item.status === 'Rejected' ? 'bg-rose-500' :
                                item.status === 'Submitted' ? 'bg-purple-500' : 'bg-amber-400'
                              )} />
                              <div className="flex-1 p-3 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 transition-colors">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-slate-900 text-xs">{item.stage}</span>
                                  <span className="text-[10px] text-slate-400 font-mono shrink-0">{item.dateTime}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                                  <span>Officer: <strong className="text-slate-700">{item.processedBy}</strong></span>
                                  <span>•</span>
                                  <span>Role: <strong className="text-slate-700">{item.role}</strong></span>
                                  <span>•</span>
                                  <span className={cn(
                                    'font-bold px-1.5 py-0.5 rounded text-[10px]',
                                    item.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                                    item.status === 'Resubmit' ? 'bg-amber-100 text-amber-800' :
                                    item.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                                    item.status === 'Submitted' ? 'bg-purple-100 text-purple-800' :
                                    'bg-slate-200 text-slate-800'
                                  )}>
                                    {item.status}
                                  </span>
                                </div>
                                {item.reason && (
                                  <p className="text-[11px] text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200 font-medium">
                                    Discrepancy / Reason: {item.reason}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="relative pl-8">
                            <div className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-purple-500 shadow-xs" />
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 text-xs">Closure Request Initiated</span>
                                <span className="text-[10px] text-slate-400 font-mono">{individual.closeAccountInfo?.closeDate || 'Pending'}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-slate-50/60 border border-dashed border-slate-200 rounded-xl text-center space-y-1">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center mx-auto text-slate-400 mb-2">
                        <Lock className="w-5 h-5" />
                      </div>
                      <h5 className="font-bold text-slate-700 text-xs">No Account Closure Requested</h5>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Authorization Buttons */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
          {/* Authorization Buttons Group (Reject, Resubmit, Approve) */}
          <div className="flex items-center gap-2.5 justify-end flex-wrap">
            {/* Reject Button */}
            <button
              id="btn-view-dialog-reject"
              type="button"
              onClick={() => handleOpenAuthDialog('reject')}
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-rose-300 hover:border-rose-400 bg-white hover:bg-rose-50 text-rose-600 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Reject application"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Reject</span>
            </button>

            {/* Resubmit Button */}
            <button
              id="btn-view-dialog-resubmit"
              type="button"
              onClick={() => handleOpenAuthDialog('resubmit')}
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-amber-300 hover:border-amber-400 bg-white hover:bg-amber-50 text-amber-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Request resubmission"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>Resubmit</span>
            </button>

            {/* Approve Button */}
            <button
              id="btn-view-dialog-approve"
              type="button"
              onClick={() => handleOpenAuthDialog('authorize')}
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Approve & advance workflow"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dedicated Authorization Decision Dialog Modal */}
      {showAuthDialog && (
        <div
          id="auth-decision-dialog-backdrop"
          className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowAuthDialog(false)}
        >
          <div
            id="auth-decision-dialog-card"
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={cn(
              "px-5 py-4 border-b flex items-center justify-between",
              authAction === 'authorize' ? "bg-emerald-50/80 border-emerald-100" :
              authAction === 'resubmit' ? "bg-amber-50/80 border-amber-100" :
              "bg-rose-50/80 border-rose-100"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shadow-2xs shrink-0",
                  authAction === 'authorize' ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                  authAction === 'resubmit' ? "bg-amber-100 text-amber-800 border border-amber-200" :
                  "bg-rose-100 text-rose-700 border border-rose-200"
                )}>
                  {authAction === 'authorize' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  {authAction === 'resubmit' && <RotateCcw className="w-5 h-5 text-amber-600" />}
                  {authAction === 'reject' && <AlertTriangle className="w-5 h-5 text-rose-600" />}
                </div>
                <div>
                  <h3 className={cn(
                    "text-base font-bold leading-tight",
                    authAction === 'authorize' ? "text-emerald-950" :
                    authAction === 'resubmit' ? "text-amber-950" :
                    "text-rose-950"
                  )}>
                    {authAction === 'authorize' ? 'Approve Application' :
                     authAction === 'resubmit' ? 'Request Resubmission' :
                     'Reject Application'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {authAction === 'authorize' ? 'Confirm application approval' :
                     authAction === 'resubmit' ? 'Provide a reason for resubmission' :
                     'Provide a reason for rejection'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAuthDialog(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                title="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Dialog Body */}
            <div className="p-5 sm:p-6 text-slate-700">
              {authAction === 'authorize' ? (
                /* Approve Dialog: Just show confirm message */
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                  <p className="text-sm font-semibold text-emerald-950">
                    Are you sure you want to approve this application?
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    This will approve the application for <strong className="text-slate-900">{individual.fullNameEN || `${individual.firstName} ${individual.lastName}`}</strong> ({individual.customerId || individual.id}) and advance it to the next workflow stage.
                  </p>
                </div>
              ) : (
                /* Reject & Resubmit Dialog: Have ONLY one reason field */
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Reason for {authAction === 'reject' ? 'Rejection' : 'Resubmission'} <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={authReason}
                    onChange={(e) => {
                      setAuthReason(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    placeholder={authAction === 'reject' ? 'Enter reason for rejecting this application...' : 'Enter reason for requesting resubmission...'}
                    className={cn(
                      "w-full px-3.5 py-2.5 bg-white border rounded-xl text-slate-800 text-xs focus:outline-none transition resize-none",
                      authError
                        ? "border-rose-400 ring-2 ring-rose-200"
                        : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    )}
                    autoFocus
                  />
                  {authError && (
                    <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{authError}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Dialog Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowAuthDialog(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-auth-dialog"
                onClick={handleExecuteAuth}
                className={cn(
                  "px-4.5 py-2 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer",
                  authAction === 'authorize' ? "bg-emerald-600 hover:bg-emerald-700" :
                  authAction === 'resubmit' ? "bg-amber-600 hover:bg-amber-700" :
                  "bg-rose-600 hover:bg-rose-700"
                )}
              >
                {authAction === 'authorize' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {authAction === 'resubmit' && <RotateCcw className="w-3.5 h-3.5" />}
                {authAction === 'reject' && <AlertTriangle className="w-3.5 h-3.5" />}
                <span>
                  {authAction === 'authorize'
                    ? 'Confirm Approval'
                    : authAction === 'resubmit'
                    ? 'Confirm Resubmission'
                    : 'Confirm Rejection'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
