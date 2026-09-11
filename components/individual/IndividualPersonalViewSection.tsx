'use client';

import React, { useState } from 'react';
import { 
  UserCheck, 
  PhoneCall, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  Copy, 
  Check, 
  Building2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Individual, DesignTheme } from '@/types';

interface IndividualPersonalViewSectionProps {
  individual: Individual;
  theme?: DesignTheme;
  className?: string;
}

export function IndividualPersonalViewSection({
  individual,
  theme = 'soft-fintech',
  className,
}: IndividualPersonalViewSectionProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Copy helper with feedback
  const handleCopy = (text: string, key: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    }
  };

  const surnameEN = individual.surnameEN || individual.lastName || 'Vance';
  const givenNameEN = individual.givenNameEN || individual.firstName || 'Eleanor';
  const surnameKH = individual.surnameKH || 'វ៉ាន់ស៍';
  const givenNameKH = individual.givenNameKH || 'អេលេណ័រ';

  const email = individual.email || 'eleanor.vance@vancetech.io';
  const mobile = individual.mobile || individual.phone || '+855 12 892 340';
  const telephone = individual.telephone || individual.employment?.officeTelephone || '+855 23 998 101';
  const addressStr = individual.address 
    ? `${individual.address.street}, ${individual.address.city}`
    : '450 Preah Monivong Blvd, Penthouse 3, Phnom Penh';

  const customerType = individual.customerType || 'High Net Worth';
  const education = individual.educationBackground || "Master's Degree";
  const knowledge = individual.securitiesKnowledge || 'Advanced';
  const risk = individual.riskRating || individual.riskCategory || 'Low';
  const experience = individual.investmentExperience || '5+ years';
  const branch = individual.branch || 'Phnom Penh Central Financial (Branch 101)';

  return (
    <div className={cn('space-y-3.5 animate-in fade-in duration-200', className)}>
      {/* =======================================================================
          SECTION 1: LEGAL NAMES & DEMOGRAPHICS
         ======================================================================= */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-blue-50 text-blue-700">
              <UserCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Legal Names & Demographics
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Surname (EN)</span>
            <div className="text-sm font-bold text-slate-900 tracking-tight">{surnameEN}</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Given Name (EN)</span>
            <div className="text-sm font-bold text-slate-900 tracking-tight">{givenNameEN}</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Surname (KH)</span>
            <div className="text-sm font-bold text-slate-900 tracking-tight font-khmer">{surnameKH}</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Given Name (KH)</span>
            <div className="text-sm font-bold text-slate-900 tracking-tight font-khmer">{givenNameKH}</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Date of Birth</span>
            <div className="text-sm font-bold text-slate-900 font-mono tracking-tight">{individual.dateOfBirth}</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Gender</span>
            <div className="text-sm font-bold text-slate-900 tracking-tight">{individual.gender}</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Marital Status</span>
            <div className="text-sm font-bold text-slate-900 tracking-tight">{individual.maritalStatus}</div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Nationality</span>
            <div className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-600" />
              {individual.nationality}
            </div>
          </div>
        </div>
      </div>

      {/* =======================================================================
          SECTION 2: CONTACT INFORMATION & CHANNELS
         ======================================================================= */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-emerald-50 text-emerald-700">
              <PhoneCall className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Contact Information & Channels
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Encrypted Channel Records
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 text-xs">
          {/* Email */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1 group relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400" />
                Email Address
              </span>
              <button
                type="button"
                onClick={() => handleCopy(email, 'email')}
                className="text-slate-400 hover:text-blue-600 p-0.5 transition cursor-pointer"
                title="Copy Email"
              >
                {copiedKey === 'email' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <div className="text-xs font-bold text-slate-900 font-mono truncate" title={email}>
              {email}
            </div>
          </div>

          {/* Mobile Phone */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1 group relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                Mobile Phone
              </span>
              <button
                type="button"
                onClick={() => handleCopy(mobile, 'mobile')}
                className="text-slate-400 hover:text-blue-600 p-0.5 transition cursor-pointer"
                title="Copy Phone"
              >
                {copiedKey === 'mobile' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <div className="text-xs font-bold text-slate-900 font-mono">
              {mobile}
            </div>
          </div>

          {/* Office Phone */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1 group relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-400" />
                Office Telephone
              </span>
              <button
                type="button"
                onClick={() => handleCopy(telephone, 'telephone')}
                className="text-slate-400 hover:text-blue-600 p-0.5 transition cursor-pointer"
                title="Copy Office Phone"
              >
                {copiedKey === 'telephone' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <div className="text-xs font-bold text-slate-900 font-mono">
              {telephone}
            </div>
          </div>

          {/* Current Address */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1 group relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                Current Address
              </span>
              <button
                type="button"
                onClick={() => handleCopy(addressStr, 'address')}
                className="text-slate-400 hover:text-blue-600 p-0.5 transition cursor-pointer"
                title="Copy Address"
              >
                {copiedKey === 'address' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <div className="text-xs font-bold text-slate-900 line-clamp-2" title={addressStr}>
              {addressStr}
            </div>
          </div>
        </div>
      </div>

      {/* =======================================================================
          SECTION 3: SECURITIES APPROPRIATENESS & CATEGORY
         ======================================================================= */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-indigo-50 text-indigo-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Securities Appropriateness & Category
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
            CSX Standard Compliant
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 space-y-1">
            <span className="text-[10px] text-blue-700 block font-bold uppercase">Customer Type</span>
            <strong className="text-sm text-blue-950 font-bold block">{customerType}</strong>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Education</span>
            <strong className="text-sm text-slate-900 font-bold block">{education}</strong>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Knowledge</span>
            <strong className="text-sm text-slate-900 font-bold block">{knowledge}</strong>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100 space-y-1">
            <span className="text-[10px] text-emerald-800 block font-bold uppercase">Risk Category</span>
            <strong className="text-sm text-emerald-950 font-bold block capitalize">{risk}</strong>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Experience</span>
            <strong className="text-sm text-slate-900 font-bold block">{experience}</strong>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Branch</span>
            <strong className="text-xs text-slate-900 font-bold block truncate" title={branch}>
              {branch}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
